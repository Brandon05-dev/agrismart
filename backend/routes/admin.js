const express = require('express');
const router = express.Router();
const { 
  updateMarketPrices, 
  getPriceComparison, 
  getTransparencyStats 
} = require('../services/priceService');

// @route   POST /api/admin/update-prices
// @desc    Manually trigger market price update
// @access  Admin/Scheduled (in production, add admin auth middleware)
router.post('/update-prices', async (req, res) => {
  try {
    const result = await updateMarketPrices();
    
    res.status(200).json({
      success: result.success,
      message: 'Market prices updated',
      data: result
    });
  } catch (error) {
    console.error('Update prices route error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating market prices',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/transparency-stats
// @desc    Get price transparency statistics
// @access  Public (for transparency)
router.get('/transparency-stats', async (req, res) => {
  try {
    const stats = await getTransparencyStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get transparency stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching transparency statistics',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/price-comparison/:productId
// @desc    Get price comparison for a specific product
// @access  Public
router.get('/price-comparison/:productId', async (req, res) => {
  try {
    const comparison = await getPriceComparison(req.params.productId);
    
    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Get price comparison error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching price comparison',
      error: error.message 
    });
  }
});

module.exports = router;
