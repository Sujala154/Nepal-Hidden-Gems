const express = require('express');
const router = express.Router();
const esewaController = require('../controllers/esewaController');
const authMiddleware = require('../middleware/authMiddleware');

// router.post('/initiate-booking-payment', authMiddleware, esewaController.initiateBookingPayment);
router.post('/initiate-booking-payment', esewaController.initiateBookingPayment);
router.get('/verify-payment', esewaController.verifyPayment);

module.exports = router;
