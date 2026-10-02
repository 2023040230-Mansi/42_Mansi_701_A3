const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  empId: { type: String, required: true },
  date: { type: Date, required: true },
  reason: { type: String },
  grant: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leave', LeaveSchema);
