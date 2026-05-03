// 1. Init Pi SDK - مهم برشا
Pi.init({ version: "2.0", sandbox: true });

// 2. متغيرات عامة
const statusEl = document.getElementById("status");
const loginBtn = document.getElementById("loginBtn");
const payBtn = document.getElementById("payBtn");
let currentUser = null;

function setStatus(message, type = '') {
    statusEl.innerText = message;
    statusEl.className = type;
}

// 3. Login with Pi
loginBtn.addEventListener("click", async () => {
    try {
        loginBtn.disabled = true;
        setStatus("Logging in...");
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
        currentUser = auth.user;
        setStatus("Logged in: @" + auth.user.username, 'success');
        payBtn.disabled = false;
        console.log("Auth success:", auth);
    } catch (err) {
        setStatus("Login failed: " + err.message, 'error');
        console.error("Auth error:", err);
        loginBtn.disabled = false;
    }
});

// 4. Pay 0.01 Pi Test - يكلم السيرفر الحقيقي
payBtn.addEventListener("click", async () => {
    if (!currentUser) {
        setStatus("Please login first!", 'error');
        return;
    }

    try {
        setStatus("Creating payment...");
        payBtn.disabled = true;
        
        await Pi.createPayment({
            amount: 0.01,
            memo: "NexoPi Test Payment",
            metadata: { app: "NexoPi", orderId: Date.now() }
        }, {
            // الخطوة 1: جاهز للموافقة من السيرفر
            onReadyForServerApproval: async function(paymentId) {
                setStatus("Approving...");
                console.log("onReadyForServerApproval", paymentId);
                
                try {
                    const res = await fetch('/approve-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId })
                    });
                    
                    if (!res.ok) throw new Error('Server approval failed');
                    
                    setStatus("Approved! Check your Pi Wallet...");
                } catch (err) {
                    setStatus("Approval failed: " + err.message, 'error');
                    console.error("Approval error:", err);
                    payBtn.disabled = false;
                }
            },
            
            // الخطوة 2: جاهز للتكملة من السيرفر
            onReadyForServerCompletion: async function(paymentId, txid) {
                setStatus("Completing payment...");
                console.log("onReadyForServerCompletion", paymentId, txid);
                
                try {
                    const res = await fetch('/complete-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId, txid })
                    });
                    
                    if (!res.ok) throw new Error('Server completion failed');
                    
                    setStatus("Payment successful! ✅", 'success');
                } catch (err) {
                    setStatus("Completion failed: " + err.message, 'error');
                    console.error("Completion error:", err);
                } finally {
                    payBtn.disabled = false;
                }
            },
            
            // الخطوة 3: المستخدم عمل Cancel
            onCancel: function(paymentId) {
                setStatus("Payment cancelled", 'error');
                console.log("onCancel", paymentId);
                payBtn.disabled = false;
            },
            
            // الخطوة 4: صار Error
            onError: function(error, payment) {
                setStatus("Payment error: " + error.message, 'error');
                console.error("onError", error, payment);
                payBtn.disabled = false;
            }
        });
        
    } catch (err) {
        setStatus("Payment failed: " + err.message, 'error');
        console.error("Payment error:", err);
        payBtn.disabled = false;
    }
});

// 5. دالة تخدم كان فما payment ناقص
function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment found:", payment);
    setStatus("Completing previous payment...", 'error');
}
