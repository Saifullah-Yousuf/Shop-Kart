const mongoose = require('mongoose');

// Uploaded images are stored in MongoDB, because Vercel's file system is temporary.
module.exports = mongoose.model('Image', new mongoose.Schema({
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  size: Number,
}, { timestamps: true }));
