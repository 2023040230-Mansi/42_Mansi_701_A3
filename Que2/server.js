const express = require('express');
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Simple user store: pre-created user with hashed password
const users = [
  { id: 1, username: 'user1', passwordHash: bcrypt.hashSync('password123', 8) }
];

app.use(session({
  store: new FileStore({ path: path.join(__dirname, 'sessions') }),
  secret: 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.redirect('/login');
}

app.get('/', (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/protected1');
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.render('login', { error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, user.passwordHash)) return res.render('login', { error: 'Invalid credentials' });
  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/protected1');
});

app.get('/protected1', requireAuth, (req, res) => {
  res.render('protected1', { username: req.session.username });
});

app.get('/protected2', requireAuth, (req, res) => {
  res.render('protected2', { username: req.session.username });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/login');
  });
});

app.listen(PORT, () => console.log(`Part2 app listening on http://localhost:${PORT}`));
