// Demo data, shared by `npm run seed` (wipes first) and the automatic first-run seed in app.js
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Settings = require('./models/Settings');

const categories = [
  { name: 'Electronics', icon: '🎧', order: 1 },
  { name: 'Fashion', icon: '👟', order: 2 },
  { name: 'Home', icon: '🪴', order: 3 },
  { name: 'Sports', icon: '⚽', order: 4 },
];

// name | category | price (PKR) | compare price | stock | featured | image keyword | description
const raw = `
Wireless Bluetooth Headphones|Electronics|8500|10500|25|1|headphones|Over-ear headphones with deep bass, 30-hour battery and a built-in mic.
Smart Fitness Watch|Electronics|12000|0|15|1|smartwatch|Heart-rate, sleep and step tracking with call and message notifications.
Mechanical Gaming Keyboard|Electronics|6500|7800|30|0|keyboard|RGB backlit mechanical keyboard with blue switches and anti-ghosting.
Wireless Gaming Mouse|Electronics|3200|0|40|0|computer,mouse|Ergonomic 2.4GHz wireless mouse with adjustable DPI up to 3200.
Portable Bluetooth Speaker|Electronics|4800|5500|35|1|speaker|Waterproof speaker with 12-hour playtime and punchy stereo sound.
10000mAh Power Bank|Electronics|3500|0|4|0|powerbank|Slim fast-charging power bank with dual USB output.
Full HD Webcam|Electronics|5400|0|20|0|webcam|1080p webcam with auto light correction and built-in noise-cancelling mic.
Laptop Stand (Aluminium)|Electronics|2900|3400|45|0|laptop,desk|Foldable adjustable stand that improves airflow and posture.
Running Shoes|Fashion|7200|8900|40|1|running,shoes|Lightweight breathable running shoes with cushioned sole.
Canvas Backpack 25L|Fashion|3800|0|50|0|backpack|Water-resistant backpack with padded 15.6 inch laptop compartment.
Classic Cotton T-Shirt|Fashion|1200|0|100|0|tshirt|Soft 100% cotton crew-neck tee, available in multiple colours.
Denim Jacket|Fashion|6900|0|3|1|denim,jacket|Classic fit denim jacket with button closure and two chest pockets.
Leather Wallet|Fashion|1900|2400|70|0|wallet|Genuine leather bifold wallet with card slots and coin pocket.
Polarized Sunglasses|Fashion|2400|0|55|0|sunglasses|UV400 polarized lenses with a lightweight durable frame.
Analog Wrist Watch|Fashion|5600|6500|22|0|wristwatch|Stainless steel case with a genuine leather strap, water resistant.
Ceramic Mug Set (4 pcs)|Home|1800|0|60|0|mug,coffee|Set of four 350ml ceramic mugs, dishwasher and microwave safe.
LED Desk Lamp|Home|2500|2900|35|1|desk,lamp|Adjustable brightness and colour temperature with a USB charging port.
Cotton Bedsheet Set|Home|4200|0|28|0|bedroom,bedsheet|King size bedsheet with two pillow covers, soft and breathable.
Scented Candle Trio|Home|1500|0|0|0|candle|Three hand-poured soy candles in lavender, vanilla and sandalwood.
Stainless Steel Water Bottle|Home|1400|0|90|0|water,bottle|Double-wall insulated 750ml bottle keeps drinks cold for 24 hours.
Yoga Mat (6mm)|Sports|2200|0|45|0|yoga,mat|Non-slip eco-friendly mat with carrying strap.
Adjustable Dumbbell Set|Sports|9800|11500|12|1|dumbbell|Pair of adjustable dumbbells, 2 to 20 kg, with secure locking.
Football (Size 5)|Sports|2100|0|50|0|football,soccer|Machine-stitched match ball, durable and water resistant.
Resistance Bands Set|Sports|1600|0|75|0|resistance,bands,fitness|Set of five latex bands with different resistance levels and a carry bag.
`.trim().split('\n').map((l, i) => {
  const [name, category, price, comparePrice, stock, featured, kw, description] = l.split('|');
  return {
    name, category, price: +price, comparePrice: +comparePrice, countInStock: +stock, featured: featured === '1',
    description, image: `https://loremflickr.com/480/360/${kw}?lock=${i + 1}`,
  };
});


async function seedDatabase({ wipe = false } = {}) {
  if (wipe) await Promise.all([User.deleteMany(), Product.deleteMany(), Category.deleteMany(), Order.deleteMany(), Settings.deleteMany()]);
  // Users go first: their unique emails stop a second, parallel seed from duplicating data
  await User.create([
    { name: 'Admin', email: 'admin@shopkart.com', password: 'admin123', isAdmin: true },
    { name: 'Ali Raza', email: 'user@shopkart.com', password: 'user123', phone: '03001234567' },
    { name: 'Sana Khan', email: 'sana@example.com', password: 'user123' },
  ]);
  if (!(await Settings.findOne())) await Settings.create({});
  await Category.insertMany(categories);
  const ali = await User.findOne({ email: 'user@shopkart.com' });
  const sana = await User.findOne({ email: 'sana@example.com' });
  const products = await Product.insertMany(raw);

  // Demo orders spread over the last two weeks so the dashboard chart has data
  const addr = (u) => ({ fullName: u.name, address: 'House 12, Street 5, Gulshan-e-Iqbal', city: 'Karachi', phone: '03001234567' });
  const demo = [
    [ali, [[0, 1], [5, 2]], 'Delivered', 13], [sana, [[8, 1]], 'Delivered', 11], [ali, [[16, 2]], 'Delivered', 9],
    [sana, [[1, 1]], 'Delivered', 7], [ali, [[21, 1], [23, 2]], 'Shipped', 5], [sana, [[4, 1], [12, 1]], 'Shipped', 4],
    [ali, [[10, 3]], 'Cancelled', 3], [sana, [[2, 1]], 'Processing', 2], [ali, [[15, 2], [19, 1]], 'Pending', 1],
    [sana, [[9, 1], [13, 1]], 'Pending', 0],
  ];
  for (const [u, lines, status, daysAgo] of demo) {
    const items = lines.map(([i, qty]) => ({ product: products[i]._id, name: products[i].name, price: products[i].price, qty, image: products[i].image }));
    const itemsPrice = items.reduce((s, x) => s + x.price * x.qty, 0);
    const shippingFee = itemsPrice >= 5000 ? 0 : 250;
    await Order.create({
      user: u._id, items, shippingAddress: addr(u), status, itemsPrice, shippingFee, totalPrice: itemsPrice + shippingFee,
      createdAt: new Date(Date.now() - daysAgo * 86400000),
    });
    if (status !== 'Cancelled')
      for (const it of items) await Product.updateOne({ _id: it.product }, { $inc: { sold: it.qty } });
  }
  return { products: products.length, categories: categories.length, orders: demo.length };
}

// Runs once when the site is opened on an empty database (for example right after deploying)
let checked = null;
seedDatabase.ifEmpty = () => {
  if (!checked) {
    checked = User.countDocuments()
      .then((n) => (n === 0 ? seedDatabase().then((r) => console.log('Auto-seeded demo data', r)) : null))
      .catch((e) => { if (e.code !== 11000) { checked = null; console.error('Auto-seed failed:', e.message); } });
  }
  return checked;
};

module.exports = seedDatabase;
