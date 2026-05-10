/**
 * Borrows routes
 * POST /api/borrows/borrow          — FR-03, FR-04, FR-05, FR-06
 * POST /api/borrows/return          — FR-07, FR-08
 * GET  /api/borrows/member/:id      — FR-10
 */

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Member = require('../models/Member');

/**
 * Ensures availableCopies is a valid number.
 * If it is undefined or NaN (can happen with documents seeded before the
 * default: 0 fix was applied), recalculate it from totalCopies and the
 * current borrowers array so all arithmetic stays correct.
 *
 * @param {Object} book - Mongoose Book document
 */
function ensureAvailableCopies(book) {
  if (book.availableCopies === undefined || isNaN(book.availableCopies)) {
    book.availableCopies = book.totalCopies - book.borrowers.length;
  }
}

/**
 * POST /api/borrows/borrow
 * FR-03: Borrow a book
 * FR-04: Decrement availableCopies
 * FR-05: Prevent duplicate borrow
 * FR-06: Prevent borrow when no copies available
 */
router.post('/borrow', async (req, res, next) => {
  try {
    const { bookId, memberId } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({ error: 'bookId and memberId are required' });
    }

    // Validate book exists
    const book = await Book.findOne({ bookId: bookId.trim() });
    if (!book) {
      return res.status(404).json({ error: `Book with bookId '${bookId}' not found` });
    }

    // Validate member exists
    const member = await Member.findOne({ memberId: memberId.trim() });
    if (!member) {
      return res.status(404).json({ error: `Member with memberId '${memberId}' not found` });
    }

    // FR-05: Prevent duplicate borrow
    const alreadyBorrowed = book.borrowers.some((b) => b.equals(member._id));
    if (alreadyBorrowed) {
      return res.status(409).json({
        error: `Member '${memberId}' already has a copy of '${book.title}' on loan`,
      });
    }

    // FIX: Guard against NaN / undefined availableCopies before arithmetic
    ensureAvailableCopies(book);

    // FR-06: No copies available
    if (book.availableCopies <= 0) {
      return res.status(409).json({
        error: `No copies of '${book.title}' are currently available`,
      });
    }

    // Decrement copies and record borrower
    book.availableCopies -= 1;
    book.borrowers.push(member._id);
    await book.save();

    member.borrowedBooks.push(book._id);
    await member.save();

    return res.status(200).json({
      message: `'${book.title}' successfully borrowed by ${member.name}`,
      availableCopies: book.availableCopies,
      book: { bookId: book.bookId, title: book.title, author: book.author },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/borrows/return
 * FR-07: Return a book
 * FR-08: Increment availableCopies
 */
router.post('/return', async (req, res, next) => {
  try {
    const { bookId, memberId } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({ error: 'bookId and memberId are required' });
    }

    const book = await Book.findOne({ bookId: bookId.trim() });
    if (!book) {
      return res.status(404).json({ error: `Book with bookId '${bookId}' not found` });
    }

    const member = await Member.findOne({ memberId: memberId.trim() });
    if (!member) {
      return res.status(404).json({ error: `Member with memberId '${memberId}' not found` });
    }

    // Confirm member has this book on loan
    const borrowIndex = book.borrowers.findIndex((b) => b.equals(member._id));
    if (borrowIndex === -1) {
      return res.status(409).json({
        error: `Member '${memberId}' does not have '${book.title}' on loan`,
      });
    }

    // FIX: Guard against NaN / undefined availableCopies before arithmetic
    ensureAvailableCopies(book);

    // Increment copies and remove borrower
    book.availableCopies += 1;
    book.borrowers.splice(borrowIndex, 1);
    await book.save();

    const bookIndex = member.borrowedBooks.findIndex((b) => b.equals(book._id));
    if (bookIndex !== -1) {
      member.borrowedBooks.splice(bookIndex, 1);
      await member.save();
    }

    return res.status(200).json({
      message: `'${book.title}' successfully returned by ${member.name}`,
      availableCopies: book.availableCopies,
      book: { bookId: book.bookId, title: book.title, author: book.author },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/borrows/member/:memberId
 * FR-10: View all books currently borrowed by a member
 */
router.get('/member/:memberId(*)', async (req, res, next) => {
  try {
    const memberId = decodeURIComponent(req.params.memberId);
    const member = await Member.findOne({ memberId }).populate(
      'borrowedBooks',
      'bookId title author genre availableCopies totalCopies isbn description coverImage'
    );
    if (!member) {
      return res.status(404).json({
        error: `Member with memberId '${memberId}' not found`,
      });
    }
    return res.status(200).json({
      member: { memberId: member.memberId, name: member.name, email: member.email },
      borrowedBooks: member.borrowedBooks,
      count: member.borrowedBooks.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
