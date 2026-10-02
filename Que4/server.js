const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const Employee = require('./models/Employee');

const app = express();
const PORT = process.env.PORT || 3003;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/erp';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error', err));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

// Simple admin credentials (override with env vars)
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

async function sendEmployeeEmail(to, empId, password) {
  try {
    // create a test account (Ethereal) to preview sent email during development
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: 'no-reply@example.com',
      to,
      subject: 'Your Employee Account',
      text: `Your employee account was created. EmpID: ${empId}  Password: ${password}`,
      html: `<p>Your employee account was created.</p><p><b>EmpID:</b> ${empId}</p><p><b>Password:</b> ${password}</p>`
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error('Error sending email', err);
  }
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.redirect('/admin/login');
}

app.get('/', (req, res) => res.redirect('/admin/employees'));

app.get('/admin/login', (req, res) => res.render('login', { error: null }));

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    res.redirect('/admin/employees');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// Employee CRUD
app.get('/admin/employees', requireAdmin, async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 }).lean();
  res.render('employees', { employees });
});

app.get('/admin/employees/add', requireAdmin, (req, res) => {
  res.render('add', { error: null, old: {} });
});

app.post('/admin/employees/add', requireAdmin, async (req, res) => {
  try {
    const { name, email, baseSalary = 0, hraPercent = 0, daPercent = 0, taxPercent = 0 } = req.body;
    // generate empId & password
    const empId = 'EMP' + Date.now().toString().slice(-6);
    const password = crypto.randomBytes(4).toString('hex');
    const passwordHash = bcrypt.hashSync(password, 8);

    const emp = new Employee({ empId, name, email, baseSalary: Number(baseSalary), hraPercent: Number(hraPercent), daPercent: Number(daPercent), taxPercent: Number(taxPercent), passwordHash });
    await emp.save();

    // send email (Ethereal preview)
    sendEmployeeEmail(email, empId, password);

    res.redirect('/admin/employees');
  } catch (err) {
    console.error(err);
    res.render('add', { error: err.message, old: req.body });
  }
});

app.get('/admin/employees/edit/:id', requireAdmin, async (req, res) => {
  const emp = await Employee.findById(req.params.id).lean();
  if (!emp) return res.redirect('/admin/employees');
  res.render('edit', { emp, error: null });
});

app.post('/admin/employees/edit/:id', requireAdmin, async (req, res) => {
  try {
    const { name, baseSalary = 0, hraPercent = 0, daPercent = 0, taxPercent = 0 } = req.body;
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.redirect('/admin/employees');
    emp.name = name;
    emp.baseSalary = Number(baseSalary);
    emp.hraPercent = Number(hraPercent);
    emp.daPercent = Number(daPercent);
    emp.taxPercent = Number(taxPercent);
    await emp.save();
    res.redirect('/admin/employees');
  } catch (err) {
    console.error(err);
    res.render('edit', { emp: { _id: req.params.id, ...req.body }, error: err.message });
  }
});

app.post('/admin/employees/delete/:id', requireAdmin, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
  } catch (e) { console.error(e); }
  res.redirect('/admin/employees');
});

app.listen(PORT, () => console.log(`Part4 ERP admin app listening on http://localhost:${PORT}`));
