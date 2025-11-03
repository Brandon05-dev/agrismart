const axios = require('axios');
const Product = require('../models/Product');

/**
 * Mock market price data for common agricultural products
 * In production, this would fetch from a real commodity exchange API
 */
const mockMarketPrices = {
  // Vegetables (per kg)
  'Tomato': 2.50,
  'Tomatoes': 2.50,
  'Potato': 1.80,
  'Potatoes': 1.80,
  'Onion': 1.50,
  'Onions': 1.50,
  'Carrot': 2.00,
  'Carrots': 2.00,
  'Cabbage': 1.20,
  'Lettuce': 2.30,
  'Cucumber': 1.90,
  'Cucumbers': 1.90,
  'Bell Pepper': 3.50,
  'Bell Peppers': 3.50,
  'Broccoli': 3.20,
  'Cauliflower': 2.80,
  
  // Fruits (per kg)
  'Apple': 3.00,
  'Apples': 3.00,
  'Banana': 1.50,
  'Bananas': 1.50,
  'Orange': 2.50,
  'Oranges': 2.50,
  'Mango': 4.00,
  'Mangoes': 4.00,
  'Grapes': 4.50,
  'Strawberry': 5.00,
  'Strawberries': 5.00,
  'Watermelon': 1.00,
  'Pineapple': 3.50,
  
  // Grains (per kg)
  'Rice': 1.20,
  'Wheat': 0.80,
  'Corn': 0.90,
  'Barley': 0.85,
  'Oats': 1.10,
  
  // Dairy (per liter)
  'Milk': 1.50,
  'Yogurt': 2.00,
  
  // Poultry (per kg)
  'Chicken': 5.50,
  'Eggs': 3.50, // per dozen
  'Turkey': 6.00
};

/**
 * Simulate fetching market prices from external API
 * In production, replace this with actual API calls to commodity exchanges
 */
const fetchMarketPrices = async () => {
  try {
    // In production, you would make API calls like:
    // const response = await axios.get('https://api.commodityexchange.com/prices');
    // return response.data;
    
    // For now, return mock data
    return mockMarketPrices;
  } catch (error) {
    console.error('Error fetching market prices:', error.message);
    return mockMarketPrices; // Fallback to mock data
  }
};

/**
 * Update official market prices for all products
 */
const updateMarketPrices = async () => {
  try {
    console.log('Starting market price update...');
    
    // Fetch latest market prices
    const marketPrices = await fetchMarketPrices();
    
    // Get all products
    const products = await Product.find({});
    
    let updatedCount = 0;
    
    // Update each product with matching market price
    for (const product of products) {
      // Try to find matching market price (case-insensitive)
      const productNameLower = product.name.toLowerCase();
      let marketPrice = null;
      
      // Search for exact match or partial match
      for (const [priceName, price] of Object.entries(marketPrices)) {
        if (priceName.toLowerCase() === productNameLower || 
            productNameLower.includes(priceName.toLowerCase())) {
          marketPrice = price;
          break;
        }
      }
      
      if (marketPrice) {
        product.officialMarketPrice = marketPrice;
        await product.save(); // This will trigger the pre-save hook to update transparency metric
        updatedCount++;
      }
    }
    
    console.log(`Market price update completed. Updated ${updatedCount} out of ${products.length} products.`);
    
    return {
      success: true,
      totalProducts: products.length,
      updatedProducts: updatedCount
    };
  } catch (error) {
    console.error('Error updating market prices:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get price comparison for a specific product
 */
const getPriceComparison = async (productId) => {
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    const comparison = {
      productName: product.name,
      farmerPrice: product.unitPrice,
      marketPrice: product.officialMarketPrice,
      difference: product.unitPrice - product.officialMarketPrice,
      percentageDifference: product.priceTransparencyMetric,
      isBelowMarket: product.unitPrice < product.officialMarketPrice,
      savingsAmount: product.officialMarketPrice - product.unitPrice
    };
    
    return comparison;
  } catch (error) {
    console.error('Error getting price comparison:', error.message);
    throw error;
  }
};

/**
 * Get transparency statistics for all products
 */
const getTransparencyStats = async () => {
  try {
    const products = await Product.find({ 
      officialMarketPrice: { $gt: 0 } 
    });
    
    if (products.length === 0) {
      return {
        totalProducts: 0,
        averageSavings: 0,
        productsBelowMarket: 0,
        productsAboveMarket: 0
      };
    }
    
    let totalSavings = 0;
    let productsBelowMarket = 0;
    let productsAboveMarket = 0;
    
    products.forEach(product => {
      const savings = product.officialMarketPrice - product.unitPrice;
      totalSavings += savings;
      
      if (product.unitPrice < product.officialMarketPrice) {
        productsBelowMarket++;
      } else if (product.unitPrice > product.officialMarketPrice) {
        productsAboveMarket++;
      }
    });
    
    return {
      totalProducts: products.length,
      averageSavings: totalSavings / products.length,
      productsBelowMarket,
      productsAboveMarket,
      percentageBelowMarket: (productsBelowMarket / products.length) * 100
    };
  } catch (error) {
    console.error('Error getting transparency stats:', error.message);
    throw error;
  }
};

module.exports = {
  fetchMarketPrices,
  updateMarketPrices,
  getPriceComparison,
  getTransparencyStats,
  mockMarketPrices
};
