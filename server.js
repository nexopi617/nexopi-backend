const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

// Check API Key
if (!process.env.PI_API_KEY) {
  console.error('WARNING: PI_API_KEY is missing! Payments will fail.');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// مهم: Route متاع validation-key.txt
app.get('/validation-key.txt', (req, res) => {
  res.type('text/plain');
  res.send('pi-domain-validation-xxxxxx'); // حط المفتاح متاعك هنا
});

// Route أساسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Approve Payment
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
    
    console.log('Approve success');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Approve error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// 2. Complete Payment
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
    
    console.log('Complete success');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Complete error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
