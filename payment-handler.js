Pi.init({ version: "2.0", sandbox: true });

const loginBtn = document.getElementById('login');
const payBtn = document.getElementById('pay');
const status = document.getElementById('status');

let currentUser = null;

loginBtn.onclick = async () => {
  try {
    const scopes = ['payments', 'username'];
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    currentUser = auth.user;
    status.innerText = `Hello ${auth.user.username} ✅`;
  } catch (err) {
    status.innerText = `Login failed: ${err.message}`;
  }
};

payBtn.onclick = async () => {
  if (!currentUser) {
    status.innerText = 'Login first';
    return;
  }
  
  try {
    const payment = await Pi.createPayment({
      amount: 1,
      memo: "Test Payment NexoPi",
      metadata: { type: "test" }
    }, {
      onReadyForServerApproval: (paymentId) => {
        fetch('/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId })
        });
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        fetch('/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify
