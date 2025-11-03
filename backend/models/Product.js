const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Poultry', 'Other'],
    default: 'Other'
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'lb', 'dozen', 'liter', 'piece'],
    default: 'kg'
  },
  officialMarketPrice: {
    type: Number,
    default: 0,
    min: [0, 'Market price cannot be negative']
  },
  quantityAvailable: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Price transparency metric: percentage difference
  priceTransparencyMetric: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
productSchema.index({ farmerId: 1, name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1 });

// Calculate price transparency metric before saving
productSchema.pre('save', function(next) {
  if (this.officialMarketPrice > 0) {
    // Calculate percentage difference: ((farmerPrice - marketPrice) / marketPrice) * 100
    this.priceTransparencyMetric = 
      ((this.unitPrice - this.officialMarketPrice) / this.officialMarketPrice) * 100;
  }
  next();
});

// Virtual to populate farmer details
productSchema.virtual('farmer', {
  ref: 'User',
  localField: 'farmerId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
