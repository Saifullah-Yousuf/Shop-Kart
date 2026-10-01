const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const ah = require('../utils/asyncHandler');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
const out = (u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone, isAdmin: u.isAdmin, token: sign(u._id) });

router.post('/register', ah(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
  // Only these fields are taken from the body, so nobody can register as admin
  const user = await User.create({ name, email, password });
  res.status(201).json(out(user));
}));

router.post('/login', ah(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  res.json(out(user));
}));

router.get('/me', protect, (req, res) => res.json(req.user));

router.put('/profile', protect, ah(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, phone, currentPassword, newPassword } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (newPassword) {
    if (!currentPassword || !(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
  }
  await user.save();
  res.json(out(user));
}));

module.exports = router;
