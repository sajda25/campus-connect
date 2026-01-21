const express = require('express');
const Report = require('../models/Report');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Report a product or user
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!['product', 'user'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }
    const report = new Report({
      reporter: req.user._id,
      targetType,
      targetId,
      reason
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: get all reports
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const reports = await Report.find().populate('reporter', 'name email').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: update report status
router.patch('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status, adminNote }, { new: true });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
