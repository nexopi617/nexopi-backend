// 1. Init Pi SDK - مهم برشا
Pi.init({ version: "2.0", sandbox: true });

// 2. متغيرات عامة
const statusEl = document.getElementById("status");
const loginBtn = document.getElementById("login");
const payBtn = document.getElementById("pay");

// 3. Login with Pi
loginBtn.addEventListener("click", async () => {
  try {
    statusEl.innerText = "Logging in...";
    const scopes = ['username', 'payments'];
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    statusEl.innerText = "Logged in: @" + auth.user.username;
    console.log("Auth success:", auth);
  } catch (err) {
    statusEl.innerText = "Login failed: " + err.message;
    console.error("Auth error:", err);
  }
});

// 4. Pay 1 Pi Test
payBtn.addEventListener("click", async () => {
  try {
    statusEl.innerText = "Creating payment...";
    
    const payment = await Pi.createPayment({
      amount: 1,
      memo: "NexoPi Test Payment",
      metadata: { app: "NexoPi", orderId: Date.now() }
    }, {
      // الخطوة 1: جاهز للموافقة من السيرفر
      onReadyForServerApproval: function(paymentId) {
        statusEl.innerText = "Waiting for server approval...";
        console.log("onReadyForServerApproval", paymentId);
        
        // هوني تبعث paymentId للباك متاعك باش يعمل approve
        fetch('/approve-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: paymentId })
        });
      },
      
      // الخطوة 2: جاهز للتكملة من السيرفر
      onReadyForServerCompletion: function(paymentId, txid) {
        statusEl.innerText = "Completing payment...";
        console.log("onReadyForServerCompletion", paymentId, txid);
        
        // هوني تبعث للباك متاعك باش يعمل complete
        fetch('/complete-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: paymentId, txid: txid })
        }).then(() => {
          statusEl.innerText = "Payment successful! ✅";
        });
      },
      
      // الخطوة 3: المستخدم عمل Cancel
      onCancel: function(paymentId) {
        statusEl.innerText = "Payment cancelled";
        console.log("onCancel", paymentId);
      },
      
      // الخطوة 4: صار Error
      onError: function(error, payment) {
        statusEl.innerText = "Payment error: " + error;
        console.error("onError", error, payment);
      }
    });
    
  } catch (err) {
    statusEl.innerText = "Payment failed: " + err.message;
    console.error("Payment error:", err);
  }
});

// 5. دالة تخدم كان فما payment ناقص
function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment found:", payment);
  statusEl.innerText = "Found incomplete payment. Check console.";
}
