const router = require('express').Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const ah = require('../utils/asyncHandler');

const SORTS = { newest: '-createdAt', price_asc: 'price', price_desc: '-price', name: 'name', popular: '-sold' };
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FIELDS = ['name', 'description', 'price', 'comparePrice', 'category', 'image', 'countInStock', 'featured'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

// GET /api/products?keyword=&category=&minPrice=&maxPrice=&featured=true&sort=newest&page=1&limit=12
router.get('/', ah(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, featured, sort, inStock } = req.query;
  const q = {};
  if (keyword) q.name = { $regex: escape(keyword), $options: 'i' };
  if (category) q.category = category;
  if (featured === 'true') q.featured = true;
  if (inStock === 'true') q.countInStock = { $gt: 0 };
  if (minPrice || maxPrice) {
    q.price = {};
    if (minPrice) q.price.$gte = Number(minPrice);
    if (maxPrice) q.price.$lte = Number(maxPrice);
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const [products, total] = await Promise.all([
    Product.find(q).sort(SORTS[sort] || SORTS.newest).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(q),
  ]);
  res.json({ products, page, pages: Math.max(Math.ceil(total / limit), 1), total });
}));

router.get('/:id', ah(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  const related = await Product.find({ category: p.category, _id: { $ne: p._id } }).limit(4);
  res.json({ ...p.toObject(), related });
}));

router.post('/', protect, admin, ah(async (req, res) => {
  res.status(201).json(await Product.create(pick(req.body)));
}));

router.put('/:id', protect, admin, ah(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
}));

router.delete('/:id', protect, admin, ah(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
}));

module.exports = router;
