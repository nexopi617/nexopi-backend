// 1. Init Pi SDK - مهم برشا
Pi.init({ version: "2.0", sandbox: true });

// 2. متغيرات عامة
const statusEl = document.getElementById("status");
const loginBtn = document.getElementById("login");
const payBtn = document.getElementById("pay");
let currentUser = null;

// 3. Login with Pi
loginBtn.addEventListener("click", async () => {
  try {
    statusEl.innerText = "Logging in...";
    const scopes = ['username', 'payments'];
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    currentUser = auth.user;
    statusEl.innerText = "Logged in: @" + auth.user.username;
    payBtn.disabled = false;
    console.log("Auth success:", auth);
  } catch (err) {
    statusEl.innerText = "Login failed: " + err.message;
    console.error("Auth error:", err);
  }
});

// 4. Pay 1 Pi Test
payBtn.addEventListener("click", async () => {
  if (!currentUser) {
    statusEl.innerText = "Please login first!";
    return;
  }

  try {
    statusEl.innerText = "Creating payment...";
    payBtn.disabled = true;
    
    await Pi.createPayment({
      amount: 1,
      memo: "NexoPi Test Payment",
      metadata: { app: "NexoPi", orderId: Date.now() }
    }, {
      // الخطوة 1: جاهز للموافقة من السيرفر
      onReadyForServerApproval: function(paymentId) {
        statusEl.innerText = "Approving...";
        console.log("onReadyForServerApproval", paymentId);
        
        // للـ Testnet: نعملو approve وهمي خاطر ما عندناش باك
        // في Mainnet لازم Server حقيقي
        setTimeout(() => {
          statusEl.innerText = "Approved! Check your Pi Wallet...";
        }, 1000);
      },
      
      // الخطوة 2: جاهز للتكملة من السيرفر
      onReadyForServerCompletion: function(paymentId, txid) {
        statusEl.innerText = "Payment successful! ✅";
        console.log("onReadyForServerCompletion", paymentId, txid);
        payBtn.disabled = false;
      },
      
      // الخطوة 3: المستخدم عمل Cancel
      onCancel: function(paymentId) {
        statusEl.innerText = "Payment cancelled";
        console.log("onCancel", paymentId);
        payBtn.disabled = false;
      },
      
      // الخطوة 4: صار Error
      onError: function(error, payment) {
        statusEl.innerText = "Payment error: " + error.message;
        console.error("onError", error, payment);
        payBtn.disabled = false;
      }
    });
    
  } catch (err) {
    statusEl.innerText = "Payment failed: " + err.message;
    console.error("Payment error:", err);
    payBtn.disabled = false;
  }
});

// 5. دالة تخدم كان فما payment ناقص
function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment found:", payment);
  statusEl.innerText = "Completing previous payment...";
}
