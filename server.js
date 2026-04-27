const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); // لازم نزيدوه
const app = express();
const PORT = process.env.PORT || 3000;

// حط الـ API Key متاعك من Pi Developer Portal هنا
const PI_API_KEY = "PUT_YOUR_PI_API_KEY_HERE"; 
const PI_API_URL = "https://api.minepi.com/v2";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API 1: الموافقة على الدفع - يتنادى من onReadyForServerApproval
app.post('/approve-payment', async (req, res) => {
  const { paymentId } = req.body;
  
  if (!paymentId) {
    return res.status(400).json({ error: "paymentId مفقود" });
  }

  try {
    // نبعت طلب لـ Pi API باش نوافقو على الدفع
    const response = await axios.post(
      `${PI_API_URL}/payments/${paymentId}/approve`,
      {},
      {
        headers: { 'Authorization': `Key ${PI_API_KEY}` }
      }
    );
    
    console.log('Payment approved:', paymentId);
    res.status(200).json({ message: "Approved", data: response.data });
    
  } catch (error) {
    console.error('Approve failed:', error.response?.data || error.message);
    res.status(500).json({ error: "Approve فشل" });
  }
});

// API 2: إكمال الدفع - يتنادى من onReadyForServerCompletion  
app.post('/complete-payment', async (req, res) => {
  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: "paymentId أو txid مفقود" });
  }

  try {
    // نبعت طلب لـ Pi API باش نكملو الدفع
    const response = await axios.post(
      `${PI_API_URL}/payments/${paymentId}/complete`,
      { txid: txid },
      {
        headers: { 'Authorization': `Key ${PI_API_KEY}` }
      }
    );
    
    console.log('Payment completed:', paymentId, txid);
    // هنا تحط الكود متاعك: اعطي الـ User المنتج، سجل في DB، الخ...
    
    res.status(200).json({ message: "Completed", data: response.data });
    
  } catch (error) {
    console.error('Complete failed:', error.response?.data || error.message);
    res.status(500).json({ error: "Complete فشل" });
  }
});

// API للتاست
app.get('/api/test', (req, res) => {
  res.json({ status: 'NexoPi شغال ✅' });
});

// أي طلب آخر رجعو للـ index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`NexoPi server running on port ${PORT}`);
});
