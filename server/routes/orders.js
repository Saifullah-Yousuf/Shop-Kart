const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/auth');
const ah = require('../utils/asyncHandler');
const { STATUSES } = Order;

const restock = (order) => Promise.all(order.items.map((it) =>
  Product.updateOne({ _id: it.product }, { $inc: { countInStock: it.qty, sold: -it.qty } })));

// Create order. Prices come from the database, never from the client.
router.post('/', protect, ah(async (req, res) => {
  const { items, shippingAddress = {}, note } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Cart is empty' });
  const { fullName, address, city, phone } = shippingAddress;
  if (!fullName || !address || !city || !phone)
    return res.status(400).json({ message: 'Please fill in all delivery details' });

  const orderItems = [];
  let itemsPrice = 0;
  for (const it of items) {
    const p = await Product.findById(it.product);
    const qty = parseInt(it.qty, 10);
    if (!p || !qty || qty < 1) return res.status(400).json({ message: 'Your cart has an item that no longer exists' });
    orderItems.push({ product: p._id, name: p.name, price: p.price, qty, image: p.image });
    itemsPrice += p.price * qty;
  }

  // Reserve stock atomically: the update only matches if enough stock is left.
  const reserved = [];
  for (const it of orderItems) {
    const r = await Product.updateOne(
      { _id: it.product, countInStock: { $gte: it.qty } },
      { $inc: { countInStock: -it.qty, sold: it.qty } });
    if (!r.modifiedCount) {
      await restock({ items: reserved }); // undo what we already took
      return res.status(400).json({ message: `Not enough stock for ${it.name}` });
    }
    reserved.push(it);
  }

  const s = await Settings.getSingleton();
  const shippingFee = s.freeShippingOver && itemsPrice >= s.freeShippingOver ? 0 : s.shippingFee;
  const order = await Order.create({
    user: req.user._id, items: orderItems, shippingAddress: { fullName, address, city, phone },
    note: note || '', itemsPrice, shippingFee, totalPrice: itemsPrice + shippingFee,
  });
  res.status(201).json(order);
}));

router.get('/my', protect, ah(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort('-createdAt'));
}));

// Admin list: ?status=&keyword=&page=
router.get('/', protect, admin, ah(async (req, res) => {
  const { status } = req.query;
  const q = status && STATUSES.includes(status) ? { status } : {};
  const limit = 20;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const [orders, total] = await Promise.all([
    Order.find(q).populate('user', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Order.countDocuments(q),
  ]);
  res.json({ orders, page, pages: Math.max(Math.ceil(total / limit), 1), total });
}));

router.get('/:id', protect, ah(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!req.user.isAdmin && String(order.user._id) !== String(req.user._id))
    return res.status(403).json({ message: 'This order belongs to another account' });
  res.json(order);
}));

// Customer can cancel only while the order is still pending
router.put('/:id/cancel', protect, ah(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (String(order.user) !== String(req.user._id)) return res.status(403).json({ message: 'Not your order' });
  if (order.status !== 'Pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
  order.status = 'Cancelled';
  await order.save();
  await restock(order);
  res.json(order);
}));

router.put('/:id/status', protect, admin, ah(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'Cancelled') return res.status(400).json({ message: 'A cancelled order cannot be reopened' });
  order.status = status;
  await order.save();
  if (status === 'Cancelled') await restock(order);
  res.json(order);
}));

module.exports = router;
