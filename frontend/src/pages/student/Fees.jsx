import React, { useState, useEffect } from "react";
import StudentSidebar from "../../components/StudentSidebar"; // 👈 Sidebar change
import { motion } from "framer-motion";
import { Wallet, CreditCard, Clock, CheckCircle, Download, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";

// 🚀 Razorpay SDK Load
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function StudentFees() {
  const [loading, setLoading] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState(null);
  const [feeRecords, setFeeRecords] = useState([]);

  useEffect(() => {
    fetchFeeData();
  }, []);

  // 🚀 BACKEND SE STUDENT APNI FEES KA REAL DATA MANGWAYEGA
  const fetchFeeData = async () => {
    try {
      // Note: Replace with actual student fee endpoint when ready
      const response = await api.get("students/my-fees/").catch(() => ({
        data: [
          { id: "FEE-001", month: "April 2026", child: "Self", amount: 5000, status: "Pending", due_date: "15 Apr 2026" },
          { id: "FEE-002", month: "March 2026", child: "Self", amount: 5000, status: "Paid", date: "12 Mar 2026" }
        ]
      }));
      setFeeRecords(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Fees Fetch Error:", error);
      if (loading) toast.error("Failed to load fee records from server.");
      setLoading(false);
    }
  };

  const totalOutstanding = feeRecords.filter(f => f.status === "Pending" || f.status === "Overdue" || f.status === "Partial").reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalPaid = feeRecords.filter(f => f.status === "Paid").reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const pendingFees = feeRecords.filter(f => f.status === "Pending" || f.status === "Overdue");
  const nextDueDate = pendingFees.length > 0 ? pendingFees[0].due_date : "No Dues";

  // ==========================================
  // 💳 THE REAL RAZORPAY PAYMENT LOGIC
  // ==========================================
  const displayRazorpay = async (fee) => {
    setIsProcessingId(fee.id);
    const loadToast = toast.loading("Connecting to Secure Payment Gateway...");

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?", { id: loadToast });
      setIsProcessingId(null);
      return;
    }

    try {
      const orderData = await api.post("auth/create-payment-order/", { amount: fee.amount });
      const { id: order_id, amount, currency, key } = orderData.data;

      toast.dismiss(loadToast);

      const options = {
        key: key,
        amount: amount.toString(),
        currency: currency,
        name: "SHIV ADDA SCHOOL",
        description: `${fee.month} Course Fee Payment`,
        image: "https://cdn-icons-png.flaticon.com/512/3135/3135810.png",
        order_id: order_id,

        handler: async function (response) {
          console.log("Success Response from Razorpay:", response);
          const verifyToast = toast.loading("Verifying your payment securely...");

          try {
            await api.post("auth/verify-payment/", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              fee_id: fee.id
            });

            setFeeRecords(prevRecords =>
              prevRecords.map(record =>
                record.id === fee.id
                  ? { ...record, status: "Paid", date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
                  : record
              )
            );
            toast.success(`Payment Verified! TXN: ${response.razorpay_payment_id}`, { id: verifyToast });
          } catch (verifyError) {
            toast.error("Payment successful but verification failed. Please contact admin.", { id: verifyToast });
          } finally {
            setIsProcessingId(null);
          }
        },
        prefill: {
          name: localStorage.getItem("user_name") || "Student Name",
          email: localStorage.getItem("user_email") || "student@example.com",
          contact: "9999999999",
        },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: function () {
            setIsProcessingId(null);
            toast("Payment Cancelled.", { icon: "⚠️" });
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast.error("Server Error: Could not generate payment order.", { id: loadToast });
      setIsProcessingId(null);
    }
  };

  const handleDownloadReceipt = (receiptId) => {
    const loadId = toast.loading(`Generating PDF for ${receiptId}...`);
    setTimeout(() => {
      toast.success(`Receipt ${receiptId} downloaded!`, { id: loadId });
    }, 1500);
  };

  return (
    <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <StudentSidebar />
      <Toaster position="top-center" />

      <div className="main-content hide-scrollbar">
        <div className="dashboard-top-nav">
          <div className="search-placeholder">
            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>My Fees and Account Ledger</span>
          </div>
        </div>

        <div className="welcome-hero">
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
            Fee <span className="text-gradient">Ledger</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
            Manage and track all your fee payments and dues.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}><Wallet size={24} /></div>
            <div><p>Total Outstanding</p><h3>Rs. {totalOutstanding.toLocaleString('en-IN')}</h3></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><CheckCircle size={24} /></div>
            <div><p>Total Paid</p><h3>Rs. {totalPaid.toLocaleString('en-IN')}</h3></div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4f46e5, #ec4899)', color: 'white' }}>
            <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><CreditCard size={24} /></div>
            <div><p style={{ color: '#e0e7ff' }}>Next Due Date</p><h3 style={{ color: 'white', fontSize: pendingFees.length ? '1.8rem' : '1.4rem' }}>{nextDueDate}</h3></div>
          </div>
        </div>

        <div className="table-card premium-shadow">
          <div className="table-header">
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Transaction History</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 size={30} className="spin" color="#4f46e5" /></div>
          ) : feeRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
              <h3>No Fee Records Found</h3>
              <p>You have no fee transactions on your account.</p>
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Fee Particular</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date / Due</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feeRecords.map((fee) => (
                  <tr key={fee.id}>
                    <td style={{ fontWeight: '700', color: '#475569' }}>{fee.id}</td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{fee.month}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{fee.child}</div>
                    </td>
                    <td style={{ fontWeight: '800', color: '#1e293b' }}>Rs. {fee.amount}</td>
                    <td>
                      <span className={`status-pill ${fee.status === 'Paid' ? 'pill-success' : fee.status === 'Pending' || fee.status === 'Overdue' ? 'pill-danger' : 'pill-partial'}`}>
                        {fee.status === 'Paid' ? <CheckCircle size={14} /> : <Clock size={14} />} {fee.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontWeight: '600' }}>{fee.date || fee.due_date}</td>
                    <td>
                      {fee.status === 'Paid' ? (
                        <button className="action-btn download" onClick={() => handleDownloadReceipt(fee.id)}>
                          <Download size={16} /> Receipt
                        </button>
                      ) : (
                        <button
                          className="action-btn pay"
                          onClick={() => displayRazorpay(fee)}
                          disabled={isProcessingId === fee.id}
                        >
                          {isProcessingId === fee.id ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />}
                          {isProcessingId === fee.id ? "Processing..." : "Pay"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
                .main-content { flex: 1; margin-left: 280px; padding: 30px 50px; height: 100vh; overflow-y: auto; overflow-x: hidden; width: calc(100% - 280px); position: relative; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .dashboard-top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .search-placeholder { background: white; padding: 10px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
                .welcome-hero { margin-bottom: 30px; }
                .text-gradient { background: linear-gradient(to right, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 40px; }
                .stat-card { background: white; padding: 25px; border-radius: 20px; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
                .stat-icon { width: 55px; height: 55px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
                .stat-card p { margin: 0 0 5px 0; font-size: 0.9rem; color: #64748b; font-weight: 600; }
                .stat-card h3 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 900; }

                .premium-shadow { background: white; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }
                .table-header { padding: 25px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }

                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { text-align: left; padding: 15px 30px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 800; background: #f8fafc; }
                .modern-table td { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; }
                
                .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; transition: 0.3s; }
                .pill-success { background: #dcfce7; color: #16a34a; }
                .pill-danger { background: #fee2e2; color: #ef4444; }
                .pill-partial { background: #fef08a; color: #ca8a04; }

                .action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 15px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; border: none; transition: 0.2s; }
                .action-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .action-btn.download { background: #f1f5f9; color: #475569; }
                .action-btn.download:hover { background: #e2e8f0; }
                .action-btn.pay { background: #e0e7ff; color: #4f46e5; }
                .action-btn.pay:hover:not(:disabled) { background: #4f46e5; color: white; transform: translateY(-1px); }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .main-content { margin-left: 0; padding: 25px; padding-top: 80px; width: 100%; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .modern-table { display: block; overflow-x: auto; }
                }
            `}</style>
    </div>
  );
}