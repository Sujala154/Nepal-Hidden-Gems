const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
    getReceiptByBooking,
    getAllPayments,
    confirmRefund,
    releasePayment,
    initiateRefund,
    requestRefund
} = require('../controllers/paymentController');

// Traveler & Admin routes
router.get('/receipt/:bookingId', auth, getReceiptByBooking);
router.put('/request-refund/:paymentId', auth, requestRefund);

// Admin only routes
router.get('/admin/all', auth, role(['admin']), getAllPayments);
router.put('/admin/confirm-refund/:paymentId', auth, role(['admin']), confirmRefund);
router.put('/admin/release/:paymentId', auth, role(['admin']), releasePayment);
router.put('/admin/initiate-refund/:paymentId', auth, role(['admin']), initiateRefund);

module.exports = router;
