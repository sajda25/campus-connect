const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  messageType: { type: String, enum: ['text', 'offer', 'pickup'], default: 'text' },
  offerAmount: { type: Number }, // For offer messages
  pickupLocation: { type: String }, // For pickup coordination
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema); 