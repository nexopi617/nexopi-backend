const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // مهم باش Pi Browser ينجم يبعث requests
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Route أساسية ترد index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. Approve Payment - لازم نفس الاسم متاع Frontend
app.post('/approve-payment', async (req, res) => {
  try {
    const { paymentId } = req.body;
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

// 2. Complete Payment - لازم نفس الاسم متاع Frontend
app.post('/complete-payment', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
