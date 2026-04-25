const crypto = require('crypto');
const axios = require('axios');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// Secret Key for testing provided by the user
const ESEWA_SECRET_KEY = '8gBm/:&EnhH.1/q';

exports.initiateBookingPayment = async (req, res) => {
    try {
        const { booking_id, amount } = req.body;

        if (!booking_id || !amount) {
            return res.status(400).json({ success: false, message: 'booking_id and amount are required' });
        }

        // Calculation: Traveler pays the exact amount listed. 
        // 10% will be deducted from this total as an app fee later during verification.
        const totalAmount = Number(amount); 

        // Generate a unique transaction_uuid combining booking_id and timestamp
        const transaction_uuid = `${booking_id}-${Date.now()}`;
        
        const product_code = 'EPAYTEST';

        // Message to sign: total_amount={totalAmount},transaction_uuid={transaction_uuid},product_code={product_code}
        const message = `total_amount=${totalAmount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

        // Generate HMAC SHA256 signature in Base64
        const hash = crypto.createHmac('sha256', ESEWA_SECRET_KEY).update(message).digest('base64');

        return res.status(200).json({
            success: true,
            signature: hash,
            transaction_uuid,
            amount: totalAmount,
            product_code
        });

    } catch (error) {
        console.error('eSewa Initiation Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to initiate eSewa payment' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { data } = req.query;

        if (!data) {
            return res.status(400).send('Missing data query parameter');
        }

        // Decode Base64 string
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const parsedData = JSON.parse(decodedData);

        const { transaction_uuid, total_amount } = parsedData;

        // Verify with eSewa Status API
        const verificationUrl = `https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
        
        const response = await axios.get(verificationUrl);

        if (response.data.status === 'COMPLETE') {
            // Check if transaction_uuid is valid and parse booking_id
            const booking_id = transaction_uuid.split('-')[0];

            const booking = await Booking.findById(booking_id);
            if (booking) {
                // Update booking status
                booking.paymentStatus = 'Paid';
                await booking.save();

                // Create Payment record
                await Payment.create({
                    bookingId: booking._id,
                    traveler: booking.user,
                    guide: booking.guide,
                    transactionId: transaction_uuid,
                    totalPaid: Number(total_amount),
                    appFee: Number(total_amount) * 0.1,
                    guideShare: Number(total_amount) * 0.9,
                    paymentStatus: 'Paid',
                    payoutStatus: 'Pending',
                    esewaDetails: parsedData
                });

                // Redirect to frontend success page
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?bookingId=${booking_id}&txId=${transaction_uuid}&amount=${total_amount}`);
            } else {
                console.error(`Booking not found during eSewa verification: ${booking_id}`);
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure?reason=booking_not_found`);
            }
        } else {
            // If eSewa verification fails, redirect to failure page
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure?reason=verification_failed`);
        }

    } catch (error) {
        console.error('eSewa Verification Error:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure`);
    }
};
