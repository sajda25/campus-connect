const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'upi', 'paytm'], 
    default: 'cash' 
  },
  pickupLocation: { type: String },
  pickupTime: { type: Date },
  qrCode: { type: String }, // QR code for pickup confirmation
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema); 