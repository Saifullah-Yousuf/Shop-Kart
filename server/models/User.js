const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters'], select: false },
  phone: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

// Hash only when the password field actually changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = function (p) { return bcrypt.compare(p, this.password); };

module.exports = mongoose.model('User', userSchema);
