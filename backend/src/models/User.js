const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'affiliate', 'admin'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: '',
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // Allow null/sparse index since some old users might not have it initially or admins might bypass
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  commissionBalance: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate a unique referral code before saving if role is affiliate or organizer or user (everyone gets one!)
UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (!this.referralCode) {
    // Generate clean slug from name + random 4 chars
    const baseSlug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    const randomChars = Math.random().toString(36).substring(2, 6);
    this.referralCode = `${baseSlug || 'user'}_${randomChars}`;
  }
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
