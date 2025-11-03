const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const { updateMarketPrices } = require('./services/priceService');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/farmer', require('./routes/farmer'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cart', require('./routes/cart'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to AgriSmart API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      farmer: '/api/farmer',
      orders: '/api/orders',
      admin: '/api/admin',
      cart: '/api/cart'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Schedule market price updates
// Run every day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled market price update...');
  try {
    const result = await updateMarketPrices();
    console.log('Scheduled update result:', result);
  } catch (error) {
    console.error('Scheduled update error:', error.message);
  }
});

// For testing: Also update prices on server start (comment out in production)
if (process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    console.log('Running initial market price update...');
    try {
      const result = await updateMarketPrices();
      console.log('Initial update result:', result);
    } catch (error) {
      console.error('Initial update error:', error.message);
    }
  }, 5000); // Wait 5 seconds after server starts
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Market price updates scheduled daily at 2:00 AM`);
});

module.exports = app;
