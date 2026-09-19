const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

function calculatePlatformFees(amount, listingType) {
    let clientFeePct = 0.08;
    let freelancerFeePct = 0.10;

    if (listingType === 'fulltime_job') {
        return {
            clientTotalPay: amount * 1.13,
            freelancerPayout: amount,
            platformCommission: amount * 0.13,
            gstOnFee: (amount * 0.13) * 0.18,
            tdsDeduction: 0
        };
    }

    if (amount >= 1000000) {
        clientFeePct = 0.02;
        freelancerFeePct = 0.03;
    } else if (amount >= 75000) {
        clientFeePct = 0.03;
        freelancerFeePct = 0.05;
    } else if (amount >= 15000) {
        clientFeePct = 0.05;
        freelancerFeePct = 0.07;
    }

    const clientFee = amount * clientFeePct;
    const gstOnFee = clientFee * 0.18;
    const freelancerFee = amount * freelancerFeePct;
    const tdsDeduction = amount * 0.01;

    return {
        clientTotalPay: amount + clientFee + gstOnFee,
        freelancerPayout: amount - freelancerFee - tdsDeduction,
        platformCommission: clientFee + freelancerFee,
        gstOnFee: gstOnFee,
        tdsDeduction: tdsDeduction
    };
}

app.post('/api/escrow/create-order', async (req, res) => {
    try {
        const { baseAmount, listingType } = req.body;
        const feeBreakdown = calculatePlatformFees(baseAmount, listingType);
        res.status(200).json({ success: true, feeBreakdown });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/chat/filter-message', (req, res) => {
    const { messageText } = req.body;
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const offsiteRegex = /(whatsapp|telegram|paytm|gpay|call me|contact at)/gi;

    let sanitizedText = messageText
        .replace(phoneRegex, '[PHONE NUMBER BLOCKED]')
        .replace(emailRegex, '[EMAIL ADDRESS BLOCKED]')
        .replace(offsiteRegex, '[OFF-PLATFORM REQUEST BLOCKED]');

    const wasFlagged = sanitizedText !== messageText;

    res.status(200).json({
        original: messageText,
        sanitizedText: sanitizedText,
        flagged: wasFlagged
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TalentX Server running on port ${PORT}`));
