const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/auth');
const ah = require('../utils/asyncHandler');

// Everything the dashboard overview needs, in one request
router.get('/', protect, admin, ah(async (req, res) => {
  const days = 14;
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));
  const notCancelled = { status: { $ne: 'Cancelled' } };
  const { lowStockThreshold } = await Settings.getSingleton();

  const [revenueAgg, orderCount, productCount, customerCount, byStatus, daily, lowStock, recentOrders, topProducts] =
    await Promise.all([
      Order.aggregate([{ $match: notCancelled }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ isAdmin: false }),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { ...notCancelled, createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      ]),
      Product.find({ countInStock: { $lte: lowStockThreshold } }).sort('countInStock').limit(6),
      Order.find().populate('user', 'name').sort('-createdAt').limit(6),
      Product.find({ sold: { $gt: 0 } }).sort('-sold').limit(5).select('name sold price image category'),
    ]);

  // Fill missing days with zero so the chart has no gaps
  const dayMap = Object.fromEntries(daily.map((d) => [d._id, d]));
  const sales = Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, revenue: dayMap[key]?.revenue || 0, orders: dayMap[key]?.orders || 0 };
  });

  res.json({
    revenue: revenueAgg[0]?.total || 0, orderCount, productCount, customerCount,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    sales, lowStock, recentOrders, topProducts,
  });
}));

module.exports = router;
