const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin: get analytics summary
router.get('/summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const totalUsers = await User.countDocuments();
    const totalListings = await Product.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const activeUsers = await User.countDocuments({ isVerified: true });
    res.json({ totalUsers, totalListings, totalTransactions, activeUsers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: get popular categories
router.get('/popular-categories', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
