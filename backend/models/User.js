const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow null for phone-only users
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long']
    // Not required for OAuth users
  },
  role: {
    type: String,
    enum: ['Farmer', 'Buyer'],
    default: 'Buyer',
    required: true
  },
  // OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  // OTP verification fields
  otpCode: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  verified: {
    type: Boolean,
    default: false
  },
  farmName: {
    type: String,
    trim: true,
    // Required only if role is Farmer
    required: function() {
      return this.role === 'Farmer';
    }
  },
  phone: {
    type: String,
    unique: true,
    sparse: true, // Allow null for email-only users
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate that at least email or phone is provided
userSchema.pre('save', function(next) {
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone number is required'));
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it exists and is modified
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
