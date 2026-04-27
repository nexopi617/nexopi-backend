const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

// تحذير كان API Key ناقص
if (!process.env.PI_API_KEY) {
  console.error('WARNING: PI_API_KEY is missing! Payments will fail.');
}

// Middleware
app.use(cors());
app.use(express.json());

// مهم جدا: يخلي Express يلقى index.html و manifest.json و الصور
app.use(express.static(__dirname));

// Route متاع Pi Domain Validation - بدّل المفتاح هنا
app.get('/validation-key.txt', (req, res) => {
  res.type('text/plain');
  res.send('pi-domain-validation-xxxxxxxxxx'); // ← حط مفتاحك من Pi Developer Portal هنا
});

// Route رئيسية - ترجع index.html و تحل مشكلة Not Found
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Approve Payment من Pi Servers
app.post('/approve-payment', async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId required' });
    
    console.log('Approving payment:', paymentId);
    
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
      { 
        headers: { 
          'Authorization': `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('Approve success:', response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Approve error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// 2. Complete Payment من Pi Servers
app.post('/complete-payment', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) return res.status(400).json({ error: 'paymentId and txid required' });
    
    console.log('Completing payment:', paymentId, txid);
    
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid: txid },
      { 
        headers: { 
          'Authorization': `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('Complete success:', response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Complete error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// مهم جدا: اي رابط غالط يرجع للـ index.html - يحل Not Found نهائيا
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
