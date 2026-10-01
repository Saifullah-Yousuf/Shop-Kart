// Local development entry point. On Vercel, api/index.js uses app.js directly.
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log('Server on port ' + PORT)))
  .catch((e) => { console.error('MongoDB error:', e.message); process.exit(1); });
