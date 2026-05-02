const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: [true, 'memberId is required'],
      unique: true, // This already creates the unique index — no schema.index() needed
      trim: true,
      minlength: [1, 'memberId cannot be empty'],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      minlength: [1, 'name cannot be empty'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true, // This already creates the unique index — no schema.index() needed
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    borrowedBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    memberSince: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// FIX: Removed duplicate schema.index() calls for memberId and email.
// unique: true in the field definitions above already creates those indexes.
// Declaring them again caused the duplicate-index Mongoose warnings.

module.exports = mongoose.model('Member', memberSchema);
