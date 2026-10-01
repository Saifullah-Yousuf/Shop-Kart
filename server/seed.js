// Resets the database to the demo data:  npm run seed
require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const seedDatabase = require('./seedData');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const r = await seedDatabase({ wipe: true });
  console.log(`Seeded ${r.products} products, ${r.categories} categories, 3 users, ${r.orders} demo orders.`);
  console.log('Admin: admin@shopkart.com / admin123   User: user@shopkart.com / user123');
  process.exit();
})().catch((e) => { console.error(e.message); process.exit(1); });
