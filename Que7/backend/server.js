const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');

const Category = require('./models/Category');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3010;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'part7-secret', resave: false, saveUninitialized: true }));

const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/shop';
mongoose.connect(mongoUrl).then(()=>console.log('Connected to MongoDB for Part7')).catch(e=>console.error(e));

// admin auth middleware: simple key via header 'x-admin-key' (set PART7_ADMIN_KEY env to secure)
function requireAdmin(req, res, next){
  const key = req.header('x-admin-key');
  if (process.env.PART7_ADMIN_KEY && key === process.env.PART7_ADMIN_KEY) return next();
  if (!process.env.PART7_ADMIN_KEY) return next(); // allow if not set (dev convenience)
  return res.status(401).json({ message: 'Unauthorized' });
}

// Admin routes: categories
app.post('/admin/categories', requireAdmin, async (req, res) => {
  const { name, parent } = req.body;
  const c = new Category({ name, parent: parent || null });
  await c.save();
  res.json(c);
});

app.get('/admin/categories', requireAdmin, async (req, res) => {
  const cats = await Category.find().lean();
  res.json(cats);
});

app.put('/admin/categories/:id', requireAdmin, async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name, parent: req.body.parent || null }, { new: true });
  res.json(c);
});

app.delete('/admin/categories/:id', requireAdmin, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Admin routes: products
app.post('/admin/products', requireAdmin, async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const p = new Product({ name, description, price: Number(price||0), stock: Number(stock||0), category: category || null });
  await p.save();
  res.json(p);
});

app.get('/admin/products', requireAdmin, async (req, res) => {
  const prods = await Product.find().populate('category').lean();
  res.json(prods);
});

app.put('/admin/products/:id', requireAdmin, async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(p);
});

app.delete('/admin/products/:id', requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Public API: get categories with two-level children
app.get('/api/categories', async (req, res) => {
  const roots = await Category.find({ parent: null }).lean();
  const all = await Category.find().lean();
  const map = {};
  all.forEach(c=> map[c._id] = c);
  const result = roots.map(r => ({ ...r, children: all.filter(c => String(c.parent) === String(r._id)) }));
  res.json(result);
});

// Public API: products by category or all
app.get('/api/products', async (req, res) => {
  const category = req.query.category;
  const q = category ? { category } : {};
  const prods = await Product.find(q).populate('category').lean();
  res.json(prods);
});

app.get('/api/products/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).populate('category').lean();
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// Cart stored in session
app.post('/api/cart/add', async (req, res) => {
  const { productId, qty } = req.body;
  if (!req.session.cart) req.session.cart = [];
  const existing = req.session.cart.find(i => i.productId === productId);
  if (existing) existing.qty += Number(qty||1);
  else req.session.cart.push({ productId, qty: Number(qty||1) });
  res.json(req.session.cart);
});

app.get('/api/cart', async (req, res) => {
  const cart = req.session.cart || [];
  // enrich with product details
  const ids = cart.map(i => i.productId);
  const prods = await Product.find({ _id: { $in: ids } }).lean();
  const byId = {};
  prods.forEach(p=> byId[String(p._id)] = p);
  const detailed = cart.map(i => ({ product: byId[i.productId], qty: i.qty }));
  res.json(detailed);
});

app.post('/api/cart/clear', (req, res) => { req.session.cart = []; res.json({ ok: true }); });

app.listen(PORT, () => console.log(`Part7 backend running on http://localhost:${PORT}`));
