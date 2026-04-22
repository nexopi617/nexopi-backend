const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// إعدادات CORS عشان Pi Browser يقدر يكلم السيرفر
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ناخذ مفتاح الـ API من Environment Variables في Render
// ممنوع تحط المفتاح هنا مباشرة
const PI_API_KEY = process.env.PI_API_KEY;

if (!PI_API_KEY) {
    console.error("FATAL ERROR: PI_API_KEY is not defined in environment variables.");
    process.exit(1);
}

const piApi = axios.create({
    baseURL: 'https://api.minepi.com/v2',
    headers: { 'Authorization': `Key ${PI_API_KEY}` }
});

// للتجربة - عشان نتأكد السيرفر شغال
app.get('/', (req, res) => {
    res.send('Nexo Pi Server is Active! 🚀');
});

// الموافقة على الدفع - المسار لازم يكون /payments/approve
app.post('/payments/approve', async (req, res) => {
    const { paymentId } = req.body;
    
    if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
    }
    
    try {
        console.log(`Approving payment: ${paymentId}`);
        const response = await piApi.post(`/payments/${paymentId}/approve`);
        res.json(response.data);
    } catch (error) {
        console.error("Approve Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to approve payment" });
    }
});

// إكمال الدفع - المسار لازم يكون /payments/complete
app.post('/payments/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    
    if (!paymentId || !txid) {
        return res.status(400).json({ error: "paymentId and txid are required" });
    }

    try {
        console.log(`Completing payment: ${paymentId} with txid: ${txid}`);
        const response = await piApi.post(`/payments/${paymentId}/complete`, { txid });
        res.json(response.data);
    } catch (error) {
        console.error("Complete Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to complete payment" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Nexo Server running on port ${PORT}`));
