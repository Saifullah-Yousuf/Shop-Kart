const mongoose = require('mongoose');

module.exports = mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], unique: true, trim: true },
  icon: { type: String, default: '🛍️' },
  order: { type: Number, default: 0 },
}, { timestamps: true }));
