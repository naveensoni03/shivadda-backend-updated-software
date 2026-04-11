import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function RazorpayCheckout({ service, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    setLoading(true);
    const token = localStorage.getItem("access");

    try {
      // Step 1: Create order
      const { data: orderData } = await axios.post(
        `${API}/api/payments/create-order/`,
        { service_id: service.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 2: Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Razorpay SDK load failed. Check your internet.");
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay checkout
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Shiv Adda",
        description: service.name,
        order_id: orderData.order_id,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: { color: "#4F46E5" },
        handler: async (response) => {
          try {
            // Step 4: Verify payment
            const { data: verifyData } = await axios.post(
              `${API}/api/payments/verify/`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_method: "razorpay",
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Payment Successful! Invoice: ${verifyData.invoice_number}`);
            if (onSuccess) onSuccess(verifyData);
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            if (onClose) onClose();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to initiate payment.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-5 text-white">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <p className="text-indigo-200 text-sm mt-1">Secured by Razorpay</p>
        </div>

        {/* Service Details */}
        <div className="p-6 space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-sm text-indigo-600 font-medium uppercase tracking-wide">Service</p>
            <p className="text-lg font-bold text-gray-800 mt-1">{service.name}</p>
            {service.description && (
              <p className="text-sm text-gray-500 mt-1">{service.description}</p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
            <div className="flex justify-between px-4 py-3">
              <span className="text-gray-600 text-sm">Base Price</span>
              <span className="font-medium text-gray-800">₹{service.price}</span>
            </div>
            {parseFloat(service.gst_amount) > 0 && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-gray-600 text-sm">GST ({service.gst_percentage}%)</span>
                <span className="font-medium text-gray-800">₹{service.gst_amount}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3 bg-gray-50 rounded-b-xl">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="font-bold text-indigo-600 text-lg">₹{service.total_price}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Access valid for {service.validity_days} days after payment
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Pay ₹{service.total_price}</>
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 pb-4">
          🔒 256-bit SSL Encrypted · Powered by Razorpay
        </p>
      </div>
    </div>
  );
}
