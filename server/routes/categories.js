const router = require('express').Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const ah = require('../utils/asyncHandler');

// Public list, with how many products each category has
router.get('/', ah(async (req, res) => {
  const [cats, counts] = await Promise.all([
    Category.find().sort('order name').lean(),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  const map = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  res.json(cats.map((c) => ({ ...c, productCount: map[c.name] || 0 })));
}));

router.post('/', protect, admin, ah(async (req, res) => {
  const { name, icon, order } = req.body;
  res.status(201).json(await Category.create({ name, icon, order }));
}));

router.put('/:id', protect, admin, ah(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  const oldName = cat.name;
  const { name, icon, order } = req.body;
  if (name !== undefined) cat.name = name;
  if (icon !== undefined) cat.icon = icon;
  if (order !== undefined) cat.order = order;
  await cat.save();
  // Products store the category by name, so keep them in sync on rename
  if (oldName !== cat.name) await Product.updateMany({ category: oldName }, { category: cat.name });
  res.json(cat);
}));

router.delete('/:id', protect, admin, ah(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  const used = await Product.countDocuments({ category: cat.name });
  if (used) return res.status(400).json({ message: `Move or delete its ${used} product(s) first` });
  await cat.deleteOne();
  res.json({ message: 'Category deleted' });
}));

module.exports = router;
