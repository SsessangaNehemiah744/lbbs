const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role:     { type: String, enum: ['admin', 'student'], required: true },
  name:     { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
  memberId: { type: String, default: null }, // null for admin, studentId for students
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
