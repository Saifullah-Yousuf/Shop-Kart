const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  comparePrice: { type: Number, default: 0, min: 0 }, // old price shown crossed out
  category: { type: String, default: 'General', index: true },
  image: { type: String, default: '' },
  countInStock: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  sold: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
