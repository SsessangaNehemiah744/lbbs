const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema({
  bookId:      { type: String, required: true },
  bookTitle:   { type: String, required: true },
  bookAuthor:  { type: String, required: true },
  memberId:    { type: String, required: true },
  memberName:  { type: String, required: true },
  memberEmail: { type: String, required: true },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
