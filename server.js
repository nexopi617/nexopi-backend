const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

app.post('/approve', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
      { headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` } }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/complete', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid: txid },
      { headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` } }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
