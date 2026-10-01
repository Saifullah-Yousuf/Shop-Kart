const mongoose = require('mongoose');

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, price: Number, qty: Number, image: String,
  }],
  shippingAddress: { fullName: String, address: String, city: String, phone: String },
  note: { type: String, default: '' },
  paymentMethod: { type: String, default: 'COD' },
  itemsPrice: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: STATUSES, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
module.exports.STATUSES = STATUSES;
