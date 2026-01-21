const express = require('express');
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id })
      .populate('product')
      .populate('product.seller', 'name studentId hostel room')
      .sort({ createdAt: -1 });

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add item to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const existingWishlist = await Wishlist.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingWishlist) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    const wishlistItem = new Wishlist({
      user: req.user._id,
      product: productId
    });

    await wishlistItem.save();
    
    const populatedItem = await Wishlist.findById(wishlistItem._id)
      .populate('product')
      .populate('product.seller', 'name studentId hostel room');

    res.status(201).json(populatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove item from wishlist
router.delete('/:productId', auth, async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId
    });

    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Check if item is in wishlist
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      user: req.user._id,
      product: req.params.productId
    });

    res.json({ inWishlist: !!wishlistItem });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 