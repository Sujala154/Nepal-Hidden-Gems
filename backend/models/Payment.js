const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: { // This is our internal or eSewa transaction UUID
    type: String,
    required: true,
    unique: true
  },
  receiptNumber: {
    type: String,
    unique: true
  },
  totalPaid: {
    type: Number,
    required: true
  },
  appFee: {
    type: Number,
    default: 500
  },
  guideShare: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Refund Pending', 'Refunded'],
    default: 'Paid'
  },
  payoutStatus: {
    type: String,
    enum: ['Pending', 'Released'],
    default: 'Pending'
  },
  esewaDetails: {
    type: Object // Stores raw response from eSewa for audit logs
  },
  refundDetails: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    esewaRefundId: String
  }
}, { timestamps: true });

// Pre-save hook to generate a receipt number if not exists
PaymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.receiptNumber = `NHG-${dateStr}-${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
