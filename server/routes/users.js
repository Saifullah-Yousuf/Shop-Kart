const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const ah = require('../utils/asyncHandler');

router.use(protect, admin);

router.get('/', ah(async (req, res) => {
  const [users, counts] = await Promise.all([
    User.find().sort('-createdAt').lean(),
    Order.aggregate([{ $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$totalPrice' } } }]),
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c]));
  res.json(users.map((u) => ({ ...u, orders: map[u._id]?.orders || 0, spent: map[u._id]?.spent || 0 })));
}));

router.put('/:id/role', ah(async (req, res) => {
  if (String(req.params.id) === String(req.user._id))
    return res.status(400).json({ message: 'You cannot change your own role' });
  const user = await User.findByIdAndUpdate(req.params.id, { isAdmin: !!req.body.isAdmin }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

router.delete('/:id', ah(async (req, res) => {
  if (String(req.params.id) === String(req.user._id))
    return res.status(400).json({ message: 'You cannot delete your own account' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
}));

module.exports = router;
