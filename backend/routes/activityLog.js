/**
 * Activity Log routes
 * POST /api/activity     — Log an activity (called internally by other routes)
 * GET  /api/activity     — Get all logs (librarian)
 * DELETE /api/activity   — Clear all logs
 */

const express = require('express');
const router  = express.Router();
const ActivityLog = require('../models/ActivityLog');

// GET all logs
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json(logs);
  } catch (err) { next(err); }
});

// POST a new log entry
router.post('/', async (req, res, next) => {
  try {
    const { type, message, meta } = req.body;
    if (!type || !message) return res.status(400).json({ error: 'type and message are required' });
    const log = await ActivityLog.create({ type, message, meta: meta || {} });
    return res.status(201).json(log);
  } catch (err) { next(err); }
});

// DELETE all logs
router.delete('/', async (req, res, next) => {
  try {
    await ActivityLog.deleteMany({});
    return res.json({ message: 'Activity log cleared.' });
  } catch (err) { next(err); }
});

module.exports = router;
