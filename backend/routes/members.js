/**
 * Members routes
 * POST   /api/members        — Register a new member
 * GET    /api/members        — List all members
 * GET    /api/members/:id    — Get single member
 * PUT    /api/members/:id    — Update member
 * DELETE /api/members/:id    — Remove member
 */

const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const ActivityLog = require('../models/ActivityLog');

async function _log(type, message, meta = {}) {
  try { await ActivityLog.create({ type, message, meta }); } catch(_) {}
}

/** POST /api/members — Register a new member */
router.post('/', async (req, res, next) => {
  try {
    const { memberId, name, email, phone } = req.body;

    if (!memberId || !name || !email) {
      return res.status(400).json({ error: 'memberId, name, and email are required' });
    }
    if (String(memberId).trim() === '' || String(name).trim() === '') {
      return res.status(400).json({ error: 'memberId and name cannot be empty' });
    }

    const existingId = await Member.findOne({ memberId: memberId.trim() });
    if (existingId) {
      return res.status(409).json({ error: `A member with memberId '${memberId}' already exists` });
    }
    const existingEmail = await Member.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ error: `A member with email '${email}' already exists` });
    }

    const member = new Member({ memberId: memberId.trim(), name: name.trim(), email, phone });
    const saved = await member.save();
    await _log('add_member', `Member "${saved.name}" (${saved.memberId}) registered.`, { memberId: saved.memberId });
    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

/** GET /api/members — List all members; optional ?q= search by name/email */
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    let filter = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter = { $or: [{ name: regex }, { email: regex }, { memberId: regex }] };
    }
    const members = await Member.find(filter).select('-borrowedBooks').sort({ createdAt: -1 });
    return res.status(200).json(members);
  } catch (err) {
    next(err);
  }
});

/** GET /api/members/:memberId */
router.get('/:memberId', async (req, res, next) => {
  try {
    const member = await Member.findOne({ memberId: req.params.memberId }).populate('borrowedBooks', 'bookId title author availableCopies');
    if (!member) {
      return res.status(404).json({ error: `Member with memberId '${req.params.memberId}' not found` });
    }
    return res.status(200).json(member);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/members/:memberId */
router.put('/:memberId', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const member = await Member.findOne({ memberId: req.params.memberId });
    if (!member) {
      return res.status(404).json({ error: `Member with memberId '${req.params.memberId}' not found` });
    }
    if (name !== undefined) member.name = name.trim();
    if (email !== undefined) member.email = email.trim().toLowerCase();
    if (phone !== undefined) member.phone = phone;
    const updated = await member.save();
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/members/:memberId */
router.delete('/:memberId', async (req, res, next) => {
  try {
    const member = await Member.findOneAndDelete({ memberId: req.params.memberId });
    if (!member) {
      return res.status(404).json({ error: `Member with memberId '${req.params.memberId}' not found` });
    }
    await _log('delete_member', `Member "${member.name}" (${member.memberId}) removed.`, { memberId: member.memberId });
    return res.status(200).json({ message: `Member '${member.name}' removed` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
