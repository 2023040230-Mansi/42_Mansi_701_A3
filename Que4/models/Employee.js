const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  baseSalary: { type: Number, required: true },
  hraPercent: { type: Number, default: 0 },
  daPercent: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

EmployeeSchema.methods.calculateNetSalary = function() {
  const base = this.baseSalary || 0;
  const hra = base * (this.hraPercent || 0) / 100;
  const da = base * (this.daPercent || 0) / 100;
  const tax = base * (this.taxPercent || 0) / 100;
  return Math.round((base + hra + da - tax) * 100) / 100;
};

EmployeeSchema.pre('save', function(next) {
  this.netSalary = this.calculateNetSalary();
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);
