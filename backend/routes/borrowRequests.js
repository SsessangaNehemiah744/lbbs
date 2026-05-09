/**
 * Borrow Requests routes
 * POST /api/borrow-requests              — Student submits a request
 * GET  /api/borrow-requests              — Librarian gets all requests
 * POST /api/borrow-requests/:id/approve  — Librarian approves
 * POST /api/borrow-requests/:id/reject   — Librarian rejects
 */

const express = require('express');
const router  = express.Router();
const BorrowRequest = require('../models/BorrowRequest');
const Book   = require('../models/Book');
const Member = require('../models/Member');

// ── Submit request ────────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { bookId, memberId } = req.body;
    if (!bookId || !memberId)
      return res.status(400).json({ error: 'bookId and memberId are required' });

    const book   = await Book.findOne({ bookId: bookId.trim() });
    if (!book)   return res.status(404).json({ error: `Book '${bookId}' not found` });

    const member = await Member.findOne({ memberId: memberId.trim() });
    if (!member) return res.status(404).json({ error: `Member '${memberId}' not found` });

    // Prevent duplicate pending
    const existing = await BorrowRequest.findOne({ bookId: bookId.trim(), memberId: memberId.trim(), status: 'pending' });
    if (existing)
      return res.status(409).json({ error: `You already have a pending request for "${book.title}".` });

    // Prevent if already borrowed
    const alreadyBorrowed = book.borrowers.some(b => b.equals(member._id));
    if (alreadyBorrowed)
      return res.status(409).json({ error: `You already have "${book.title}" on loan.` });

    if (book.availableCopies <= 0)
      return res.status(409).json({ error: `No copies of "${book.title}" are available.` });

    const request = await BorrowRequest.create({
      bookId: book.bookId, bookTitle: book.title, bookAuthor: book.author,
      memberId: member.memberId, memberName: member.name, memberEmail: member.email,
    });
    return res.status(201).json(request);
  } catch (err) { next(err); }
});

// ── Get all requests ──────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await BorrowRequest.find(filter).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) { next(err); }
});

// ── Approve ───────────────────────────────────────────────────────────────────
router.post('/:id/approve', async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request)           return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'pending') return res.status(409).json({ error: 'Request is no longer pending.' });

    const book   = await Book.findOne({ bookId: request.bookId });
    const member = await Member.findOne({ memberId: request.memberId });
    if (!book)   return res.status(404).json({ error: 'Book no longer exists.' });
    if (!member) return res.status(404).json({ error: 'Member no longer exists.' });

    if (book.availableCopies <= 0)
      return res.status(409).json({ error: `No copies of "${book.title}" available.` });
    if (book.borrowers.some(b => b.equals(member._id)))
      return res.status(409).json({ error: 'Member already has this book.' });

    book.availableCopies -= 1;
    book.borrowers.push(member._id);
    await book.save();

    member.borrowedBooks.push(book._id);
    await member.save();

    request.status = 'approved';
    await request.save();

    return res.json(request);
  } catch (err) { next(err); }
});

// ── Reject ────────────────────────────────────────────────────────────────────
router.post('/:id/reject', async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request)           return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'pending') return res.status(409).json({ error: 'Request is no longer pending.' });

    request.status = 'rejected';
    request.reason = req.body.reason || '';
    await request.save();
    return res.json(request);
  } catch (err) { next(err); }
});

module.exports = router;
