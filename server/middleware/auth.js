const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized, no token' });
    const { id } = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
};

exports.admin = (req, res, next) =>
  req.user && req.user.isAdmin ? next() : res.status(403).json({ message: 'Admin access only' });
