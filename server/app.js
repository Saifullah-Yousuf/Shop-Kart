// The Express app, without app.listen(). Used by server.js locally and by api/index.js on Vercel.
require('dotenv').config();

// Some ISPs fail to resolve MongoDB Atlas SRV records; public DNS fixes that (not needed on Vercel).
if (!process.env.VERCEL) require('dns').setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./seedData');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: '1mb' }));

// Make sure the database is connected before any route runs (reuses the connection when warm)
app.use(async (req, res, next) => {
  try { await connectDB(); await seedDatabase.ifEmpty(); next(); } catch (e) { next(e); }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/images', require('./routes/images'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
