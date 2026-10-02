const express = require('express');
const path = require('path');
const cors = require('cors');
const { Sequelize } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3015;

app.use(cors());
app.use(express.json());

// SQLite Sequelize
const sequelize = new Sequelize({ dialect: 'sqlite', storage: path.join(__dirname, 'db.sqlite') });
const StudentModel = require('./models/Student');
const Student = StudentModel(sequelize);

async function initDb(){
  await sequelize.authenticate();
  await sequelize.sync();
  const count = await Student.count();
  if (count === 0) {
    // seed
    await Student.create({ studentId: 'S0001', name: 'Alice', age: 20, course: 'BSc', year: 2 });
    await Student.create({ studentId: 'S0002', name: 'Bob', age: 22, course: 'BCom', year: 3 });
  }
}

initDb().then(()=>console.log('Sequelize initialized')).catch(e=>console.error(e));

// Helpers
function genStudentId() {
  return 'S' + Math.floor(1000 + Math.random()*9000).toString();
}

// CRUD endpoints
app.get('/api/students', async (req, res) => {
  const students = await Student.findAll({ order: [['createdAt', 'DESC']] });
  res.json(students);
});

app.get('/api/students/:id', async (req, res) => {
  const st = await Student.findByPk(req.params.id);
  if (!st) return res.status(404).json({ message: 'Not found' });
  res.json(st);
});

app.post('/api/students', async (req, res) => {
  const { name, age, course, year } = req.body;
  const studentId = genStudentId();
  const st = await Student.create({ studentId, name, age, course, year });
  res.json(st);
});

app.put('/api/students/:id', async (req, res) => {
  const st = await Student.findByPk(req.params.id);
  if (!st) return res.status(404).json({ message: 'Not found' });
  await st.update(req.body);
  res.json(st);
});

app.delete('/api/students/:id', async (req, res) => {
  const st = await Student.findByPk(req.params.id);
  if (!st) return res.status(404).json({ message: 'Not found' });
  await st.destroy();
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Part8 backend listening on http://localhost:${PORT}`));
