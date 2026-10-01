const mongoose = require('mongoose');

// Serverless functions can be reused between requests, so keep one connection
// promise and return it instead of opening a new connection every time.
let cached = null;

module.exports = function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!cached) {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('PASTE_YOUR'))
      return Promise.reject(new Error('MONGO_URI is not set'));
    cached = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .then((m) => { console.log('MongoDB connected'); return m.connection; })
      .catch((e) => { cached = null; throw e; });
  }
  return cached;
};
