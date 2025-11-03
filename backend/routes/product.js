const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, isFarmer } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all available products (Marketplace Display)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = { isAvailable: true, quantityAvailable: { $gt: 0 } };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.unitPrice = {};
      if (minPrice) query.unitPrice.$gte = Number(minPrice);
      if (maxPrice) query.unitPrice.$lte = Number(maxPrice);
    }

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const products = await Product.find(query)
      .populate('farmerId', 'username farmName email phone')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products',
      error: error.message 
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'username farmName email phone address');

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product',
      error: error.message 
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product listing
// @access  Private (Farmer only)
router.post('/', auth, isFarmer, async (req, res) => {
  try {
    const { name, description, category, unitPrice, unit, quantityAvailable, imageUrl } = req.body;

    // Validation
    if (!name || !unitPrice || !quantityAvailable) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, unit price, and quantity' 
      });
    }

    // Create product
    const product = await Product.create({
      farmerId: req.user._id,
      name,
      description,
      category,
      unitPrice,
      unit,
      quantityAvailable,
      imageUrl
    });

    // Populate farmer details
    await product.populate('farmerId', 'username farmName email phone');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating product',
      error: error.message 
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Farmer only - own products)
router.put('/:id', auth, isFarmer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check if the product belongs to the authenticated farmer
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this product' 
      });
    }

    // Update product
    const { name, description, category, unitPrice, unit, quantityAvailable, imageUrl, isAvailable } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        unitPrice,
        unit,
        quantityAvailable,
        imageUrl,
        isAvailable
      },
      { new: true, runValidators: true }
    ).populate('farmerId', 'username farmName email phone');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating product',
      error: error.message 
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Farmer only - own products)
router.delete('/:id', auth, isFarmer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check if the product belongs to the authenticated farmer
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this product' 
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product',
      error: error.message 
    });
  }
});

module.exports = router;
