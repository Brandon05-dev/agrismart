const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, isBuyer } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Buyer only)
router.post('/', auth, isBuyer, async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, notes } = req.body;

    // Validation
    if (!products || products.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Order must contain at least one product' 
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({ 
        success: false,
        message: 'Shipping address is required' 
      });
    }

    // Validate products and check stock
    const orderItems = [];
    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: `Product not found: ${item.productId}` 
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({ 
          success: false,
          message: `Product not available: ${product.name}` 
        });
      }

      if (product.quantityAvailable < item.quantity) {
        return res.status(400).json({ 
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.quantityAvailable}` 
        });
      }

      const subtotal = product.unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        farmerId: product.farmerId,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        subtotal
      });

      // Update product quantity
      product.quantityAvailable -= item.quantity;
      if (product.quantityAvailable === 0) {
        product.isAvailable = false;
      }
      await product.save();
    }

    // Create order
    const order = await Order.create({
      buyerId: req.user._id,
      products: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    // Populate order details
    await order.populate('buyerId', 'username email phone');
    await order.populate('products.productId', 'name imageUrl');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating order',
      error: error.message 
    });
  }
});

// @route   GET /api/orders
// @desc    Get all orders for authenticated buyer
// @access  Private (Buyer only)
router.get('/', auth, isBuyer, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('products.productId', 'name imageUrl')
      .sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private (Buyer or involved Farmer)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'username email phone address')
      .populate('products.productId', 'name imageUrl')
      .populate('products.farmerId', 'username farmName email phone');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user is authorized to view this order
    const isBuyer = order.buyerId._id.toString() === req.user._id.toString();
    const isFarmer = order.products.some(
      product => product.farmerId._id.toString() === req.user._id.toString()
    );

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this order' 
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching order',
      error: error.message 
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Farmer can update their products' orders)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: 'Status is required' 
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user is authorized (buyer or farmer involved in the order)
    const isBuyer = order.buyerId.toString() === req.user._id.toString();
    const isFarmer = order.products.some(
      product => product.farmerId.toString() === req.user._id.toString()
    );

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this order' 
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order status',
      error: error.message 
    });
  }
});

module.exports = router;
