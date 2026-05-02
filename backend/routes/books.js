/**
 * @route   POST /api/books
 * @desc    FR-01, FR-02 — Add a new book to the catalog
 * @body    { bookId, title, author, totalCopies, genre?, isbn?, description? }
 * @returns 201 Created | 400 Bad Request | 409 Conflict
 */

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

/**
 * POST /api/books
 * FR-01: Add a book; FR-02: Reject duplicate bookId
 */
router.post('/', async (req, res, next) => {
  try {
    const { bookId, title, author, totalCopies, genre, isbn, description, coverImage } = req.body;

    // Route-level validation (FR-01)
    if (!bookId || !title || !author || totalCopies === undefined) {
      return res.status(400).json({ error: 'bookId, title, author, and totalCopies are required' });
    }
    if (typeof totalCopies !== 'number' || !Number.isInteger(totalCopies) || totalCopies < 1) {
      return res.status(400).json({ error: 'totalCopies must be a positive integer' });
    }
    if (String(bookId).trim() === '' || String(title).trim() === '' || String(author).trim() === '') {
      return res.status(400).json({ error: 'bookId, title, and author cannot be empty strings' });
    }

    // Check duplicate (FR-02)
    const existing = await Book.findOne({ bookId: bookId.trim() });
    if (existing) {
      return res.status(409).json({ error: `A book with bookId '${bookId}' already exists` });
    }

    const book = new Book({ bookId: bookId.trim(), title: title.trim(), author: author.trim(), totalCopies, genre, isbn, description, coverImage });
    const saved = await book.save();
    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/books
 * FR-09: List all books; optional ?q=keyword for case-insensitive title/author search
 */
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    let filter = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter = { $or: [{ title: regex }, { author: regex }] };
    }
    const books = await Book.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(books);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/books/:bookId
 * Retrieve a single book by its bookId string
 */
router.get('/:bookId', async (req, res, next) => {
  try {
    const book = await Book.findOne({ bookId: req.params.bookId }).populate('borrowers', 'memberId name email');
    if (!book) {
      return res.status(404).json({ error: `Book with bookId '${req.params.bookId}' not found` });
    }
    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/books/:bookId
 * Update book metadata (title, author, genre, description, etc.)
 * Does NOT allow changing totalCopies or availableCopies directly
 */
router.put('/:bookId', async (req, res, next) => {
  try {
    const { title, author, genre, isbn, description, coverImage } = req.body;
    const book = await Book.findOne({ bookId: req.params.bookId });
    if (!book) {
      return res.status(404).json({ error: `Book with bookId '${req.params.bookId}' not found` });
    }
    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (genre !== undefined) book.genre = genre;
    if (isbn !== undefined) book.isbn = isbn;
    if (description !== undefined) book.description = description;
    if (coverImage !== undefined) book.coverImage = coverImage;
    const updated = await book.save();
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/books/:bookId
 * Remove a book — requires exact bookId; returns 404 if not found
 */
router.delete('/:bookId', async (req, res, next) => {
  try {
    const book = await Book.findOneAndDelete({ bookId: req.params.bookId });
    if (!book) {
      return res.status(404).json({ error: `Book with bookId '${req.params.bookId}' not found` });
    }
    return res.status(200).json({ message: `Book '${book.title}' removed from catalog` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
