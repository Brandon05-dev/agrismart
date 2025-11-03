const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, isFarmer } = require('../middleware/auth');

// @route   GET /api/farmer/inventory
// @desc    Get all products for authenticated farmer
// @access  Private (Farmer only)
router.get('/inventory', auth, isFarmer, async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get farmer inventory error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching inventory',
      error: error.message 
    });
  }
});

// @route   GET /api/farmer/sales
// @desc    Get all orders containing farmer's products
// @access  Private (Farmer only)
router.get('/sales', auth, isFarmer, async (req, res) => {
  try {
    // Find all orders that contain products from this farmer
    const orders = await Order.find({ 
      'products.farmerId': req.user._id 
    })
      .populate('buyerId', 'username email phone address')
      .populate('products.productId', 'name imageUrl')
      .sort({ orderDate: -1 });

    // Filter products in each order to show only this farmer's products
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.products = orderObj.products.filter(
        product => product.farmerId.toString() === req.user._id.toString()
      );
      
      // Recalculate total for this farmer's products only
      orderObj.farmerTotal = orderObj.products.reduce(
        (sum, product) => sum + product.subtotal, 
        0
      );
      
      return orderObj;
    });

    // Calculate total sales statistics
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.farmerTotal, 0);
    const totalOrders = filteredOrders.length;

    res.status(200).json({
      success: true,
      data: filteredOrders,
      statistics: {
        totalSales,
        totalOrders
      }
    });
  } catch (error) {
    console.error('Get farmer sales error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching sales history',
      error: error.message 
    });
  }
});

// @route   GET /api/farmer/dashboard-stats
// @desc    Get dashboard statistics for farmer
// @access  Private (Farmer only)
router.get('/dashboard-stats', auth, isFarmer, async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments({ farmerId: req.user._id });
    
    // Get active products
    const activeProducts = await Product.countDocuments({ 
      farmerId: req.user._id, 
      isAvailable: true,
      quantityAvailable: { $gt: 0 }
    });

    // Get total orders containing farmer's products
    const orders = await Order.find({ 
      'products.farmerId': req.user._id 
    });

    // Calculate total revenue
    let totalRevenue = 0;
    orders.forEach(order => {
      order.products.forEach(product => {
        if (product.farmerId.toString() === req.user._id.toString()) {
          totalRevenue += product.subtotal;
        }
      });
    });

    // Get recent orders (last 5)
    const recentOrders = orders
      .slice(0, 5)
      .map(order => ({
        id: order._id,
        status: order.status,
        totalAmount: order.totalAmount,
        orderDate: order.orderDate
      }));

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalOrders: orders.length,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
});

module.exports = router;
