import api from '../lib/api';

/**
 * Trigger Razorpay payment flow to unlock a seeker feature (₹30).
 *
 * @param {Object} params
 * @param {string} params.feature - 'recommendations' or 'commute'
 * @param {Object} params.user - Current user object
 * @param {Function} params.onSuccess - Callback on successful verification
 * @param {Function} params.onError - Callback on failure
 */
export async function triggerRazorpayUnlock({ feature, user, onSuccess, onError }) {
  try {
    // 1. Create order on backend
    const res = await api.post('/auth/razorpay/create-order', { feature });
    const orderData = res.data?.data || res.data;
    const { order_id, amount, currency, key_id } = orderData;

    const featureName = feature === 'recommendations' ? 'Area Recommendations' : 'Commute Calculator';

    // 2. Open Razorpay Modal
    const options = {
      key: key_id || '',
      amount: amount || 3000,
      currency: currency || 'INR',
      name: 'MoveSmart Relocation',
      description: `Unlock ${featureName} (₹30 One-Time Access)`,
      order_id: order_id,
      prefill: {
        email: user?.email || '',
      },
      theme: {
        color: '#00ADB5',
      },
      handler: async function (response) {
        try {
          // 3. Verify signature on backend
          const verifyRes = await api.post('/auth/razorpay/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            feature: feature,
          });
          const verifiedData = verifyRes.data?.data || verifyRes.data;
          if (onSuccess) onSuccess(verifiedData);
        } catch (vErr) {
          const msg = vErr.response?.data?.message || 'Payment verification failed.';
          if (onError) onError(msg);
        }
      },
      modal: {
        ondismiss: function () {
          if (onError) onError('Payment process closed.');
        },
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create Razorpay order.';
    if (onError) onError(msg);
  }
}
