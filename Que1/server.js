const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const id = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, id + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

function imageFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) cb(new Error('Only image files are allowed'), false);
  else cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB per file
});

app.get('/', (req, res) => {
  res.render('form', { errors: {}, old: {} });
});

app.post('/submit', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'otherPics', maxCount: 5 }
]),
  // validators
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('gender').notEmpty().withMessage('Select gender'),
  (req, res) => {
    const errors = validationResult(req);

    // normalize hobbies
    const hobbies = Array.isArray(req.body.hobbies) ? req.body.hobbies : (req.body.hobbies ? [req.body.hobbies] : []);

    if (!errors.isEmpty()) {
      // delete any uploaded files
      if (req.files) {
        Object.values(req.files).flat().forEach(f => {
          try { fs.unlinkSync(f.path); } catch (e) { }
        });
      }
      return res.status(400).render('form', { errors: errors.mapped(), old: { ...req.body, hobbies } });
    }

    // success: assemble data
    const id = randomUUID();
    const profile = req.files && req.files.profilePic && req.files.profilePic[0] ? req.files.profilePic[0].filename : null;
    const others = req.files && req.files.otherPics ? req.files.otherPics.map(f => f.filename) : [];

    const submission = {
      id,
      username: req.body.username,
      email: req.body.email,
      gender: req.body.gender,
      hobbies,
      profile,
      others,
      createdAt: new Date().toISOString()
    };

    const outPath = path.join(uploadsDir, `submission-${id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(submission, null, 2));

    res.render('result', { submission });
  }
);

app.get('/download/:id', (req, res) => {
  const file = path.join(uploadsDir, `submission-${req.params.id}.json`);
  if (!fs.existsSync(file)) return res.status(404).send('Not found');
  res.download(file);
});

app.listen(PORT, () => console.log(`Part1 app listening on http://localhost:${PORT}`));
