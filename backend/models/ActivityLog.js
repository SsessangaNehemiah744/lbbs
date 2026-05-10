const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  type:    { type: String, required: true },
  message: { type: String, required: true },
  meta:    { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
