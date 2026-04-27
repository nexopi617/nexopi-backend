const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// المفتاح هذا يجي من Render Environment
const PI_API_KEY = process.env.PI_API_KEY; 
const PI_API_URL = 'https://api.minepi.com';

app.use(express.json());
app.use(express.static(__dirname));

// 1. Domain Validation - حط مفتاح Mainnet هنا
app.get('/validation-key.txt', (req, res) => {
    res.send('pi-domain-validation-بدل_هذا_بالمفتاح_متاع_Mainnet');
});

// 2. الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. الموافقة على الدفع
app.post('/approve-payment', async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).send('Missing paymentId');
    
    try {
        const response = await axios.post(
            `${PI_API_URL}/v2/payments/${paymentId}/approve`, 
            {}, 
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );
        console.log('Payment approved:', paymentId);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Approval Error:', error.response?.data || error.message);
        res.status(500).send('Approval Failed');
    }
});

// 4. إكمال الدفع
app.post('/complete-payment', async (req, res) => {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) return res.status(400).send('Missing paymentId or txid');

    try {
        const response = await axios.post(
            `${PI_API_URL}/v2/payments/${paymentId}/complete`, 
            { txid }, 
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );
        console.log('Payment completed:', paymentId, txid);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Completion Error:', error.response?.data || error.message);
        res.status(500).send('Completion Failed');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
