const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// مهم: حط الـ Pi Server API Key هنا
// تاخذو من Pi Developer Portal -> App -> API Key
const PI_API_KEY = process.env.PI_API_KEY || 'YOUR_PI_SERVER_API_KEY_HERE';
const PI_API_URL = 'https://api.minepi.com/v2';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve الـ index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve الـ manifest.json
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// 1. Approve Payment
app.post('/approve-payment', async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId مطلوب' });

    try {
        const response = await axios.post(
            `${PI_API_URL}/payments/${paymentId}/approve`,
            {},
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );
        res.status(200).json({ message: 'Approved', data: response.data });
    } catch (error) {
        console.error('Approve error:', error.response?.data || error.message);
        res.status(500).json({ error: 'فشل الموافقة', details: error.response?.data });
    }
});

// 2. Complete Payment
app.post('/complete-payment', async (req, res) => {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) return res.status(400).json({ error: 'paymentId و txid مطلوبين' });

    try {
        const response = await axios.post(
            `${PI_API_URL}/payments/${paymentId}/complete`,
            { txid: txid },
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );
        res.status(200).json({ message: 'Completed', data: response.data });
    } catch (error) {
        console.error('Complete error:', error.response?.data || error.message);
        res.status(500).json({ error: 'فشل الإكمال', details: error.response?.data });
    }
});

// Pi Domain Validation
app.get('/.well-known/pi-domain-approval.json', (req, res) => {
    res.json({
        "pi_domain_approval": "YOUR_VALIDATION_KEY_HERE"
    });
});

app.listen(PORT, () => {
    console.log(`NexoPi server running on port ${PORT}`);
});
