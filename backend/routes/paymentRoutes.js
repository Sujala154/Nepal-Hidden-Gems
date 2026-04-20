const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
    getReceiptByBooking,
    getAllPayments,
    confirmRefund
} = require('../controllers/paymentController');

// Traveler & Admin routes
router.get('/receipt/:bookingId', auth, getReceiptByBooking);

// Admin only routes
router.get('/admin/all', auth, role(['admin']), getAllPayments);
router.put('/admin/confirm-refund/:paymentId', auth, role(['admin']), confirmRefund);

module.exports = router;
