const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Get all products (public, for guest browsing)
router.get('/public', async (req, res) => {
  try {
    const { category, priceMin, priceMax, search } = req.query;
    let query = { status: 'available' };
    if (category) query.category = category;
    if (priceMin) query.price = { ...query.price, $gte: Number(priceMin) };
    if (priceMax) query.price = { ...query.price, $lte: Number(priceMax) };
    if (search) query.title = { $regex: search, $options: 'i' };
    const products = await Product.find(query).populate('seller', 'name hostel room');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Create product (protected) with image upload
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    
    // Get uploaded image URLs
    const images = req.files ? req.files.map(file => `http://localhost:5000/uploads/${file.filename}`) : [];
    
    const product = new Product({ 
      title, 
      description, 
      price, 
      category, 
      images, 
      seller: req.user._id 
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit product (protected - only owner can edit)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete product (protected - only owner can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark as sold (protected - only owner can mark as sold)
router.patch('/:id/sold', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this product' });
    }
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { status: 'sold' }, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Debug route to check database contents
router.get('/debug/all', async (req, res) => {
  try {
    const allProducts = await Product.find({});
    const categories = await Product.distinct('category');
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      totalProducts: allProducts.length,
      categories: categories,
      priceStats: priceStats[0] || {},
      sampleProducts: allProducts.slice(0, 5).map(p => ({
        id: p._id,
        title: p.title,
        category: p.category,
        price: p.price,
        status: p.status
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Debug error', error: err.message });
  }
});

// Get all products (public - no auth needed) with advanced filtering
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      priceMin, 
      priceMax, 
      priceRange,
      seller, 
      status, 
      search, 
      sortBy = 'newest',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    console.log('Products route query params:', req.query);

    let filter = {};
    
    // Category filter - make it more flexible
    if (category && category !== 'All Categories') {
      // Use case-insensitive search for category
      filter.category = { $regex: category, $options: 'i' };
      console.log('Category filter applied:', category);
    }
    
    // Seller filter
    if (seller) filter.seller = seller;
    
    // Status filter - default to available if not specified
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'available'; // Only show available items by default
    }
    
    // Price range filter - fix the logic
    if (priceRange && priceRange !== 'All Prices') {
      filter.price = {};
      switch (priceRange) {
        case 'Under ₹100':
          filter.price.$lt = 100;
          break;
        case '₹100 - ₹500':
          filter.price.$gte = 100;
          filter.price.$lte = 500;
          break;
        case '₹500 - ₹1000':
          filter.price.$gte = 500;
          filter.price.$lte = 1000;
          break;
        case '₹1000 - ₹2000':
          filter.price.$gte = 1000;
          filter.price.$lte = 2000;
          break;
        case 'Above ₹2000':
          filter.price.$gt = 2000;
          break;
      }
      console.log('Price range filter applied:', priceRange, 'Filter:', filter.price);
    } else if (priceMin || priceMax) {
      // Handle individual price min/max if provided
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }
    
    // Search filter
    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
      console.log('Search filter applied:', search);
    }

    console.log('Final filter object:', JSON.stringify(filter, null, 2));

    // Debug: Let's see what categories exist in the database
    if (category && category !== 'All Categories') {
      const allCategories = await Product.distinct('category');
      console.log('All categories in database:', allCategories);
      console.log('Looking for category:', category);
      
      // Check if any category matches (case-insensitive)
      const matchingCategories = allCategories.filter(cat => 
        cat.toLowerCase().includes(category.toLowerCase())
      );
      console.log('Matching categories:', matchingCategories);
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Sorting - fix the sorting logic
    const sortOptions = {};
    console.log('Sort by:', sortBy);
    
    if (sortBy === 'price-low') {
      sortOptions.price = 1;
      console.log('Sorting by price: low to high');
    } else if (sortBy === 'price-high') {
      sortOptions.price = -1;
      console.log('Sorting by price: high to low');
    } else if (sortBy === 'oldest') {
      sortOptions.createdAt = 1;
      console.log('Sorting by date: oldest first');
    } else {
      // Default: newest first
      sortOptions.createdAt = -1;
      console.log('Sorting by date: newest first');
    }

    console.log('Sort options:', sortOptions);

    const products = await Product.find(filter)
      .populate('seller', 'studentId name hostel room rating')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    console.log(`Found ${products.length} products out of ${total} total`);
    
    // Debug: Show the first few products and their details
    if (products.length === 0) {
      const sampleProducts = await Product.find().limit(5);
      console.log('Sample products in database:', sampleProducts.map(p => ({ 
        title: p.title, 
        category: p.category, 
        price: p.price,
        status: p.status 
      })));
    } else {
      console.log('First few products found:', products.slice(0, 3).map(p => ({
        title: p.title,
        category: p.category,
        price: p.price,
        status: p.status
      })));
    }

    res.json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (err) {
    console.error('Error in products route:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'studentId name hostel room rating totalRatings');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's own products
router.get('/my-products', auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate('seller', 'studentId name hostel room')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get categories for filter dropdown
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 