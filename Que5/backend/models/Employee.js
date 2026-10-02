const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  baseSalary: { type: Number, default: 0 },
  passwordHash: { type: String, required: true }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
