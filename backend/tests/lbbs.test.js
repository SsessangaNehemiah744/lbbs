/**
 * LBBS Integration Tests
 * Tests all 10 Functional Requirements (FR-01 to FR-10)
 * Uses supertest + mongodb-memory-server for isolated HTTP-level testing
 */

require('./setup');
const request = require('supertest');
const app = require('../server');
const Book = require('../models/Book');
const Member = require('../models/Member');

// ─── Helpers ───────────────────────────────────────────────────────────────
const createBook = (overrides = {}) =>
  Book.create({ bookId: 'B001', title: 'Clean Code', author: 'R. Martin', totalCopies: 2, ...overrides });

const createMember = (overrides = {}) =>
  Member.create({ memberId: 'M001', name: 'Alice', email: 'alice@test.com', ...overrides });

// ─── FR-01: Add Book ────────────────────────────────────────────────────────
describe('FR-01: Add Book', () => {
  test('POST /api/books → 201 with new book document', async () => {
    const res = await request(app).post('/api/books').send({ bookId: 'B001', title: 'Clean Code', author: 'R. Martin', totalCopies: 3 });
    expect(res.status).toBe(201);
    expect(res.body.bookId).toBe('B001');
    expect(res.body.availableCopies).toBe(3);
  });

  test('POST /api/books → 400 if required fields missing', async () => {
    const res = await request(app).post('/api/books').send({ bookId: 'B001', title: 'Missing Author' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/books → 400 if totalCopies < 1', async () => {
    const res = await request(app).post('/api/books').send({ bookId: 'B001', title: 'Test', author: 'A', totalCopies: 0 });
    expect(res.status).toBe(400);
  });

  test('availableCopies auto-set = totalCopies on create (pre-save hook)', async () => {
    const res = await request(app).post('/api/books').send({ bookId: 'B001', title: 'Test', author: 'A', totalCopies: 5 });
    expect(res.body.availableCopies).toBe(5);
  });
});

// ─── FR-02: Duplicate bookId ─────────────────────────────────────────────
describe('FR-02: Duplicate bookId rejection', () => {
  test('POST /api/books → 409 if bookId already exists', async () => {
    await createBook();
    const res = await request(app).post('/api/books').send({ bookId: 'B001', title: 'Other', author: 'B', totalCopies: 1 });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });
});

// ─── FR-03 & FR-04: Borrow + Decrement ──────────────────────────────────
describe('FR-03 & FR-04: Borrow book and decrement copies', () => {
  test('POST /api/borrows/borrow → 200 and decrements availableCopies', async () => {
    await createBook({ totalCopies: 2 });
    await createMember();
    const res = await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M001' });
    expect(res.status).toBe(200);
    expect(res.body.availableCopies).toBe(1);
  });

  test('POST /api/borrows/borrow → 404 if bookId not found', async () => {
    await createMember();
    const res = await request(app).post('/api/borrows/borrow').send({ bookId: 'GHOST', memberId: 'M001' });
    expect(res.status).toBe(404);
  });

  test('POST /api/borrows/borrow → 404 if memberId not found', async () => {
    await createBook();
    const res = await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'GHOST' });
    expect(res.status).toBe(404);
  });

  test('POST /api/borrows/borrow → 400 if body is incomplete', async () => {
    const res = await request(app).post('/api/borrows/borrow').send({ bookId: 'B001' });
    expect(res.status).toBe(400);
  });
});

// ─── FR-05: Prevent duplicate borrow ───────────────────────────────────
describe('FR-05: Prevent duplicate borrow', () => {
  test('POST /api/borrows/borrow → 409 if member already holds the book', async () => {
    await createBook({ totalCopies: 5 });
    await createMember();
    await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M001' });
    const res = await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M001' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already has/i);
  });
});

// ─── FR-06: Prevent borrow when no copies ───────────────────────────────
describe('FR-06: Prevent borrow when no copies available', () => {
  test('POST /api/borrows/borrow → 409 when availableCopies = 0', async () => {
    await createBook({ totalCopies: 1 });
    await createMember({ memberId: 'M001', email: 'a@test.com' });
    await createMember({ memberId: 'M002', name: 'Bob', email: 'b@test.com' });
    await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M001' });
    const res = await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M002' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/no copies/i);
  });
});

// ─── FR-07 & FR-08: Return + Increment ──────────────────────────────────
describe('FR-07 & FR-08: Return book and increment copies', () => {
  test('POST /api/borrows/return → 200 and increments availableCopies', async () => {
    await createBook({ totalCopies: 2 });
    await createMember();
    await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M001' });
    const res = await request(app).post('/api/borrows/return').send({ bookId: 'B001', memberId: 'M001' });
    expect(res.status).toBe(200);
    expect(res.body.availableCopies).toBe(2);
  });

  test('POST /api/borrows/return → 409 if member did not borrow the book', async () => {
    await createBook();
    await createMember();
    const res = await request(app).post('/api/borrows/return').send({ bookId: 'B001', memberId: 'M001' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/does not have/i);
  });

  test('POST /api/borrows/return → 404 if book not found', async () => {
    await createMember();
    const res = await request(app).post('/api/borrows/return').send({ bookId: 'GHOST', memberId: 'M001' });
    expect(res.status).toBe(404);
  });
});

// ─── FR-09: Catalog Search ────────────────────────────────────────────────
describe('FR-09: Catalog search', () => {
  beforeEach(async () => {
    await Book.create([
      { bookId: 'B001', title: 'Clean Code', author: 'Robert Martin', totalCopies: 1 },
      { bookId: 'B002', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', totalCopies: 1 },
      { bookId: 'B003', title: 'Refactoring', author: 'Martin Fowler', totalCopies: 1 },
    ]);
  });

  test('GET /api/books?q=clean → returns matching books (case-insensitive)', async () => {
    const res = await request(app).get('/api/books?q=clean');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].bookId).toBe('B001');
  });

  test('GET /api/books?q=martin → matches author field', async () => {
    const res = await request(app).get('/api/books?q=martin');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/books?q=xyz → returns empty array for no match', async () => {
    const res = await request(app).get('/api/books?q=xyznotfound');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('GET /api/books (no query) → returns all books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
  });
});

// ─── FR-10: View Borrowed Books ──────────────────────────────────────────
describe('FR-10: View borrowed books by member', () => {
  test('GET /api/borrows/member/:memberId → returns borrowed books list', async () => {
    await createBook({ totalCopies: 3 });
    await createMember();
    await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M001' });
    const res = await request(app).get('/api/borrows/member/M001');
    expect(res.status).toBe(200);
    expect(res.body.borrowedBooks.length).toBe(1);
    expect(res.body.borrowedBooks[0].bookId).toBe('B001');
    expect(res.body.count).toBe(1);
  });

  test('GET /api/borrows/member/:memberId → 404 if member not found', async () => {
    const res = await request(app).get('/api/borrows/member/GHOST');
    expect(res.status).toBe(404);
  });

  test('GET /api/borrows/member/:memberId → empty array when no borrows', async () => {
    await createMember();
    const res = await request(app).get('/api/borrows/member/M001');
    expect(res.status).toBe(200);
    expect(res.body.borrowedBooks).toEqual([]);
    expect(res.body.count).toBe(0);
  });
});

// ─── Atomicity NFR-02 ─────────────────────────────────────────────────────
describe('NFR-02: Atomic borrow/return state', () => {
  test('Borrow: borrowers list and availableCopies update together', async () => {
    await createBook({ totalCopies: 2 });
    await createMember();
    await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M001' });
    const book = await Book.findOne({ bookId: 'B001' });
    expect(book.availableCopies).toBe(1);
    expect(book.borrowers.length).toBe(1);
  });

  test('Return: borrowers list and availableCopies restore together', async () => {
    await createBook({ totalCopies: 2 });
    await createMember();
    await request(app).post('/api/borrows/borrow').send({ bookId: 'B001', memberId: 'M001' });
    await request(app).post('/api/borrows/return').send({ bookId: 'B001', memberId: 'M001' });
    const book = await Book.findOne({ bookId: 'B001' });
    expect(book.availableCopies).toBe(2);
    expect(book.borrowers.length).toBe(0);
  });
});
