const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: [true, 'bookId is required'],
      unique: true,
      trim: true,
      minlength: [1, 'bookId cannot be empty'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      minlength: [1, 'title cannot be empty'],
    },
    author: {
      type: String,
      required: [true, 'author is required'],
      trim: true,
      minlength: [1, 'author cannot be empty'],
    },
    totalCopies: {
      type: Number,
      required: [true, 'totalCopies is required'],
      min: [1, 'totalCopies must be at least 1'],
    },
    availableCopies: {
      type: Number,
      min: [0, 'availableCopies cannot be negative'],
      default: 0, // FIX: prevents NaN when document exists without this field
    },
    borrowers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
    genre: {
      type: String,
      trim: true,
      default: 'General',
    },
    isbn: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-set availableCopies = totalCopies when a new book is created
bookSchema.pre('save', function (next) {
  if (this.isNew) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

// FIX: Only the text search index here.
// The unique index on bookId is already created by unique: true above.
// Declaring it again with schema.index() caused the duplicate-index warning.
bookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);
