const mongoose = require('mongoose');

// One document holds every store-wide setting the admin can change from the dashboard.
const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'ShopKart' },
  tagline: { type: String, default: 'Everyday essentials, delivered across Pakistan' },
  logoEmoji: { type: String, default: '🛒' },
  announcementOn: { type: Boolean, default: true },
  announcement: { type: String, default: 'Free delivery on orders above Rs. 5,000 · Cash on delivery available' },
  heroTitle: { type: String, default: 'Good things, delivered to your door.' },
  heroSubtitle: { type: String, default: 'Electronics, fashion, home and sports essentials at fair prices. Pay cash when it arrives.' },
  heroImage: { type: String, default: '' },
  brandColor: { type: String, default: '#146c54' },
  accentColor: { type: String, default: '#f2a93b' },
  defaultTheme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  currency: { type: String, default: 'Rs.' },
  shippingFee: { type: Number, default: 250, min: 0 },
  freeShippingOver: { type: Number, default: 5000, min: 0 },
  lowStockThreshold: { type: Number, default: 5, min: 0 },
  contactEmail: { type: String, default: 'support@shopkart.pk' },
  contactPhone: { type: String, default: '0300 1234567' },
  address: { type: String, default: 'Karachi, Pakistan' },
  whatsapp: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  footerText: { type: String, default: 'Portfolio project. Products and orders are sample data.' },
  showDemoLogins: { type: Boolean, default: true },
}, { timestamps: true });

settingsSchema.statics.getSingleton = async function () {
  return (await this.findOne()) || this.create({});
};

module.exports = mongoose.model('Settings', settingsSchema);
