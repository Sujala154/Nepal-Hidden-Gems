const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Get receipt details for a specific booking
// @route   GET /api/payments/receipt/:bookingId
// @access  Private (Traveler or Admin)
exports.getReceiptByBooking = async (req, res) => {
    try {
        const payment = await Payment.findOne({ bookingId: req.params.bookingId })
            .populate('traveler', 'name email')
            .populate('guide', 'name email');

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }

        // Check if the requesting user is the traveler or an admin
        if (payment.traveler._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this receipt' });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('getReceiptByBooking Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch receipt' });
    }
};

// @desc    Get all payments (for Admin Financials)
// @route   GET /api/payments/admin/all
// @access  Private (Admin)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('traveler', 'name email')
            .populate('guide', 'name email')
            .populate('bookingId', 'destinationName date status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('getAllPayments Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
};

// @desc    Confirm a refund has been processed manually
// @route   PUT /api/payments/admin/confirm-refund/:paymentId
// @access  Private (Admin)
exports.confirmRefund = async (req, res) => {
    try {
        const { esewaRefundId } = req.body;
        const payment = await Payment.findById(req.params.paymentId);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        if (!esewaRefundId || !esewaRefundId.trim()) {
            return res.status(400).json({ success: false, message: 'eSewa refund ID is required' });
        }

        if (payment.paymentStatus !== 'Refund Pending') {
            return res.status(400).json({ success: false, message: 'Refund can only be confirmed for Refund Pending payments' });
        }

        const trimmedRefundId = esewaRefundId.trim();
        if (trimmedRefundId !== payment.transactionId) {
            return res.status(400).json({ success: false, message: 'Refund ID must exactly match the original payment transaction ID.' });
        }

        payment.paymentStatus = 'Refunded';
        payment.refundDetails = {
            ...payment.refundDetails,
            refundedAt: new Date(),
            esewaRefundId: trimmedRefundId
        };

        await payment.save();

        // Also update the booking payment status
        await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'Refunded' });

        res.status(200).json({
            success: true,
            message: 'Refund confirmed successfully',
            data: payment
        });
    } catch (error) {
        console.error('confirmRefund Error:', error);
        res.status(500).json({ success: false, message: 'Failed to confirm refund' });
    }
};

// @desc    Release payout to guide
// @route   PUT /api/payments/admin/release/:paymentId
// @access  Private (Admin)
exports.releasePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, error: "Payment not found" });
        }

        if (payment.payoutStatus === 'Released') {
            return res.status(400).json({ success: false, error: "Payment already released" });
        }

        payment.payoutStatus = 'Released';
        await payment.save();

        // Trigger notification to guide
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: payment.guide,
                sender: req.user.id,
                type: 'booking_update',
                title: 'Payout Released!',
                message: `Your payout of NPR ${payment.guideShare} for trip ${payment.receiptNumber} has been released.`,
                relatedId: payment._id
            });
        } catch (notifErr) {
            console.error("Failed to send payout notification:", notifErr);
        }

        res.json({
            success: true,
            message: "Payout released successfully",
            data: payment
        });
    } catch (error) {
        console.error("releasePayment error", error);
        res.status(500).json({ success: false, error: "Failed to release payout" });
    }
};

// @desc    Initiate a refund (Admin)
// @route   PUT /api/payments/admin/initiate-refund/:paymentId
// @access  Private (Admin)
exports.initiateRefund = async (req, res) => {
    try {
        const { reason } = req.body;
        const payment = await Payment.findById(req.params.paymentId);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        if (payment.paymentStatus === 'Refunded') {
            return res.status(400).json({ success: false, message: 'Payment is already refunded' });
        }

        payment.paymentStatus = 'Refund Pending';
        payment.refundDetails = {
            ...payment.refundDetails,
            reason: reason || 'Initiated by Admin'
        };

        await payment.save();

        // Also update the booking status to Cancelled and paymentStatus to Refund Pending
        await Booking.findByIdAndUpdate(payment.bookingId, { 
            status: 'Cancelled',
            paymentStatus: 'Refund Pending' 
        });

        res.status(200).json({
            success: true,
            message: 'Refund initiated and booking cancelled',
            data: payment
        });
    } catch (error) {
        console.error('initiateRefund Error:', error);
        res.status(500).json({ success: false, message: 'Failed to initiate refund' });
    }
};

// @desc    Request a refund (Traveler)
// @route   PUT /api/payments/request-refund/:paymentId
// @access  Private (Traveler)
exports.requestRefund = async (req, res) => {
    try {
        const { reason } = req.body;
        const payment = await Payment.findById(req.params.paymentId);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        if (payment.traveler.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (payment.paymentStatus !== 'Paid') {
            return res.status(400).json({ success: false, message: 'Refund can only be requested for paid bookings' });
        }

        payment.paymentStatus = 'Refund Pending';
        payment.refundDetails = {
            ...payment.refundDetails,
            reason: reason || 'Requested by Traveler'
        };

        await payment.save();

        // Update booking
        await Booking.findByIdAndUpdate(payment.bookingId, { 
            status: 'Cancelled',
            paymentStatus: 'Refund Pending' 
        });

        res.status(200).json({
            success: true,
            message: 'Refund request submitted and booking cancelled',
            data: payment
        });
    } catch (error) {
        console.error('requestRefund Error:', error);
        res.status(500).json({ success: false, message: 'Failed to request refund' });
    }
};
