require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Employee = require('./models/Employee');
const Leave = require('./models/Leave');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/erp';
mongoose.connect(mongoUrl).then(()=>console.log('Connected to MongoDB for part5')).catch(e=>console.error(e));

// create a demo employee if none exists
async function ensureDemo() {
  const existing = await Employee.findOne({ empId: 'EMP000001' });
  if (!existing) {
    const pw = bcrypt.hashSync('emppass', 8);
    await Employee.create({ empId: 'EMP000001', name: 'Demo Employee', email: 'demo@example.com', baseSalary: 10000, passwordHash: pw });
    console.log('Created demo employee: EMP000001 / emppass');
  }
}
ensureDemo().catch(()=>{});

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Missing token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Invalid token format' });
  const token = parts[1];
  jwt.verify(token, process.env.JWT_SECRET || 'secret123', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.employeeId = decoded.empId;
    next();
  });
}

app.post('/api/auth/login', async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) return res.status(400).json({ message: 'empId and password required' });
  const emp = await Employee.findOne({ empId });
  if (!emp) return res.status(401).json({ message: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, emp.passwordHash)) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ empId: emp.empId }, process.env.JWT_SECRET || 'secret123', { expiresIn: '4h' });
  res.json({ token });
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  const emp = await Employee.findOne({ empId: req.employeeId }).lean();
  if (!emp) return res.status(404).json({ message: 'Not found' });
  delete emp.passwordHash;
  res.json(emp);
});

app.post('/api/leaves', authMiddleware, async (req, res) => {
  const { date, reason, grant } = req.body;
  const l = await Leave.create({ empId: req.employeeId, date: new Date(date), reason, grant: !!grant });
  res.json(l);
});

app.get('/api/leaves', authMiddleware, async (req, res) => {
  const leaves = await Leave.find({ empId: req.employeeId }).sort({ date: -1 }).lean();
  res.json(leaves);
});

app.listen(PORT, () => console.log(`Part5 backend listening on http://localhost:${PORT}`));
