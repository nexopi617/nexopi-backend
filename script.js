onReadyForServerApproval: function(paymentId) {
  fetch('/approve-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId: paymentId })
  });
},
onReadyForServerCompletion: function(paymentId, txid) {
  fetch('/complete-payment', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId: paymentId, txid: txid })
  });
},
