const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get conversations for a user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiver', req.user._id] },
                  { $eq: ['$isRead', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: 1,
            name: 1,
            studentId: 1,
            profilePic: 1
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get messages between two users for a specific product
router.get('/:productId/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      product: req.params.productId,
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name studentId profilePic')
    .populate('receiver', 'name studentId profilePic')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        receiver: req.user._id,
        sender: req.params.userId,
        product: req.params.productId,
        isRead: false
      },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send a message
const { sendNotificationEmail } = require('../utils/email');
const User = require('../models/User');
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, product, content, messageType, offerAmount, pickupLocation } = req.body;
    
    const message = new Message({
      sender: req.user._id,
      receiver,
      product,
      content,
      messageType,
      offerAmount,
      pickupLocation
    });

    await message.save();

    // Send email notification to receiver
    const receiverUser = await User.findById(receiver);
    if (receiverUser && receiverUser.preferences?.emailNotifications && receiverUser.email) {
      const subject = 'New Message on Campus Connect';
      const text = `You have a new message from ${req.user.name}: ${content}`;
      sendNotificationEmail(receiverUser.email, subject, text);
    }

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name studentId profilePic')
      .populate('receiver', 'name studentId profilePic');

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark message as read
router.patch('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 