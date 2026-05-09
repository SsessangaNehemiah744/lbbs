/**
 * Auth routes
 * POST /api/auth/login-admin    — Librarian login
 * POST /api/auth/login-student  — Student login
 * POST /api/auth/signup-student — Student registration
 * POST /api/auth/seed-admin     — Seed default admin (run once)
 */

const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Member  = require('../models/Member');

// ── Librarian login ───────────────────────────────────────────────────────────
router.post('/login-admin', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });

    const user = await User.findOne({ role: 'admin', username: username.trim() });
    if (!user || user.password !== password)
      return res.status(401).json({ error: 'Invalid username or password.' });

    return res.json({
      _id: user._id, role: user.role, name: user.name,
      email: user.email, memberId: user.memberId,
    });
  } catch (err) { next(err); }
});

// ── Student login ─────────────────────────────────────────────────────────────
router.post('/login-student', async (req, res, next) => {
  try {
    const { studentId, password } = req.body;
    if (!studentId || !password)
      return res.status(400).json({ error: 'Student ID and password are required.' });

    const user = await User.findOne({ role: 'student', memberId: studentId.trim() });
    if (!user || user.password !== password)
      return res.status(401).json({ error: 'Student ID or password is incorrect.' });

    return res.json({
      _id: user._id, role: user.role, name: user.name,
      email: user.email, memberId: user.memberId,
    });
  } catch (err) { next(err); }
});

// ── Student signup ────────────────────────────────────────────────────────────
router.post('/signup-student', async (req, res, next) => {
  try {
    const { name, studentId, email, password } = req.body;
    if (!name || !studentId || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existingUser = await User.findOne({
      $or: [{ memberId: studentId.trim() }, { email: email.trim().toLowerCase() }]
    });
    if (existingUser) {
      if (existingUser.memberId === studentId.trim())
        return res.status(409).json({ error: `Student ID "${studentId}" is already registered.` });
      return res.status(409).json({ error: `Email "${email}" is already in use.` });
    }

    const user = await User.create({
      role: 'student',
      name: name.trim(),
      username: studentId.trim(),
      memberId: studentId.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    // Also register as a library member
    const existingMember = await Member.findOne({ memberId: studentId.trim() });
    if (!existingMember) {
      await Member.create({
        memberId: studentId.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: '',
        borrowedBooks: [],
      });
    }

    return res.status(201).json({
      _id: user._id, role: user.role, name: user.name,
      email: user.email, memberId: user.memberId,
    });
  } catch (err) { next(err); }
});

// ── Seed default admin (call once to create the admin account) ────────────────
router.post('/seed-admin', async (req, res, next) => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing)
      return res.json({ message: 'Admin already exists.', username: existing.username });

    const admin = await User.create({
      role: 'admin',
      name: 'Tabitha Nalwoga',
      username: 'tabitha.lib',
      password: 'Lib@Mak2025',
      email: 'tabitha@mak.ac.ug',
      memberId: null,
    });
    return res.status(201).json({ message: 'Admin created.', username: admin.username });
  } catch (err) { next(err); }
});

module.exports = router;
