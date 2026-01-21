const express = require('express');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const QRCode = require('qrcode');

const router = express.Router();

// Create a transaction (buy a product)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, amount, paymentMethod, pickupLocation, pickupTime } = req.body;
    
    const product = await Product.findById(productId).populate('seller');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.status === 'sold') {
      return res.status(400).json({ message: 'Product is already sold' });
    }
    
    if (product.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own product' });
    }

    // Generate QR code for pickup confirmation
    const qrData = JSON.stringify({
      transactionId: Date.now().toString(),
      productId,
      buyerId: req.user._id,
      sellerId: product.seller._id,
      amount
    });
    
    const qrCode = await QRCode.toDataURL(qrData);

    const transaction = new Transaction({
      buyer: req.user._id,
      seller: product.seller._id,
      product: productId,
      amount,
      paymentMethod,
      pickupLocation,
      pickupTime: new Date(pickupTime),
      qrCode
    });

    await transaction.save();
    
    // Mark product as sold
    await Product.findByIdAndUpdate(productId, { status: 'sold' });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('buyer', 'name studentId')
      .populate('seller', 'name studentId')
      .populate('product', 'title price');

    res.status(201).json(populatedTransaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's transactions
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { buyer: req.user._id },
        { seller: req.user._id }
      ]
    })
    .populate('buyer', 'name studentId')
    .populate('seller', 'name studentId')
    .populate('product', 'title price images')
    .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update transaction status
router.patch('/:transactionId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Only seller can update status
    if (transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.transactionId,
      { status },
      { new: true }
    )
    .populate('buyer', 'name studentId')
    .populate('seller', 'name studentId')
    .populate('product', 'title price');

    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add rating and review
router.post('/:transactionId/review', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Only buyer can add review
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.transactionId,
      { rating, review },
      { new: true }
    );

    // Update seller's average rating
    const sellerTransactions = await Transaction.find({
      seller: transaction.seller,
      rating: { $exists: true, $ne: null }
    });
    
    const totalRating = sellerTransactions.reduce((sum, t) => sum + t.rating, 0);
    const averageRating = totalRating / sellerTransactions.length;
    
    await User.findByIdAndUpdate(transaction.seller, {
      rating: averageRating,
      totalRatings: sellerTransactions.length
    });

    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 