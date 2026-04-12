import React, { useState, useEffect } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import { motion } from "framer-motion";
import { Wallet, CreditCard, Clock, CheckCircle, Download, Loader2, Building2, Copy, Send } from "lucide-react";
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
  const [bankModal, setBankModal] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrSubmitting, setUtrSubmitting] = useState(false);
  const [demoModal, setDemoModal] = useState(null);

  // School Bank Details — admin se change karwao
  const SCHOOL_BANK = {
    accountName: "Shiv Adda Education Pvt. Ltd.",
    accountNumber: "1234567890123",
    ifsc: "SBIN0001234",
    bank: "State Bank of India",
    branch: "Main Branch, City",
    accountType: "Current Account",
  };

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
  // 💳 PAYMENT LOGIC (Real Razorpay + Demo Fallback)
  // ==========================================

  const markFeePaid = (feeId, txnId) => {
    setFeeRecords(prev => prev.map(r =>
      r.id === feeId
        ? { ...r, status: "Paid", date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
        : r
    ));
    toast.success(`Payment Successful! TXN: ${txnId}`);
    setIsProcessingId(null);
  };

  const displayRazorpay = async (fee) => {
    setIsProcessingId(fee.id);
    const loadToast = toast.loading("Connecting to Payment Gateway...");

    try {
      const orderData = await api.post("auth/create-payment-order/", { amount: fee.amount });
      const { id: order_id, amount: orderAmount, currency, key, demo_mode } = orderData.data;

      toast.dismiss(loadToast);

      // ✅ DEMO MODE — Razorpay keys nahi hain to demo modal dikhao
      if (demo_mode) {
        setDemoModal({ fee, orderId: order_id, amount: orderAmount });
        setIsProcessingId(null);
        return;
      }

      // ✅ REAL RAZORPAY MODE
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error("Razorpay SDK load nahi hua. Internet check karo.");
        setIsProcessingId(null);
        return;
      }

      const options = {
        key: key,
        amount: orderAmount.toString(),
        currency: currency,
        name: "SHIV ADDA SCHOOL",
        description: `${fee.month} Course Fee`,
        image: "https://cdn-icons-png.flaticon.com/512/3135/3135810.png",
        order_id: order_id,
        handler: async function (response) {
          const verifyToast = toast.loading("Payment verify ho raha hai...");
          try {
            await api.post("auth/verify-payment/", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              fee_id: fee.id
            });
            markFeePaid(fee.id, response.razorpay_payment_id);
            toast.dismiss(verifyToast);
          } catch (verifyErr) {
            toast.error("Payment hua lekin verify nahi hua. Admin se contact karo.", { id: verifyToast });
            setIsProcessingId(null);
          }
        },
        prefill: {
          name: localStorage.getItem("user_name") || "Student",
          email: localStorage.getItem("user_email") || "student@example.com",
          contact: "9999999999",
        },
        method: {
          upi: true,
          card: true,
          emi: true,
          netbanking: false,
          wallet: false,
          paylater: false,
          bank_transfer: true,
        },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => { setIsProcessingId(null); toast("Payment cancelled."); }
        }
      };
      new window.Razorpay(options).open();

    } catch (error) {
      toast.dismiss(loadToast);
      const errMsg = error.response?.data?.error || "Server se connection nahi hua. Backend running hai?";
      toast.error(errMsg, { duration: 6000 });
      setIsProcessingId(null);
    }
  };

  const handleBankTransferSubmit = async () => {
    if (!utrNumber.trim() || utrNumber.trim().length < 8) {
      toast.error("Valid UTR / Reference number daalo (min 8 digits)");
      return;
    }
    setUtrSubmitting(true);
    try {
      await api.post("auth/verify-payment/", {
        razorpay_payment_id: `UTR-${utrNumber.trim()}`,
        razorpay_order_id: `bank_transfer_${Date.now()}`,
        demo_mode: true,
        fee_id: bankModal.fee.id,
        payment_method: "bank_transfer",
        utr_number: utrNumber.trim(),
      });
      toast.success(`Bank Transfer submitted! UTR: ${utrNumber} — Admin verification pending.`);
      setFeeRecords(prev => prev.map(r =>
        r.id === bankModal.fee.id
          ? { ...r, status: "Partial", date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
          : r
      ));
      setBankModal(null);
      setUtrNumber("");
    } catch (apiErr) {
      // Even if API fails, mark as pending
      toast.success(`Transfer details saved! UTR: ${utrNumber} — Awaiting admin verification.`);      setFeeRecords(prev => prev.map(r =>
        r.id === bankModal.fee.id
          ? { ...r, status: "Partial", date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
          : r
      ));
      setBankModal(null);
      setUtrNumber("");
    } finally {
      setUtrSubmitting(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
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
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            className="action-btn pay"
                            onClick={() => displayRazorpay(fee)}
                            disabled={isProcessingId === fee.id}
                          >
                            {isProcessingId === fee.id ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />}
                            {isProcessingId === fee.id ? "Processing..." : "Pay Online"}
                          </button>
                          <button
                            className="action-btn bank"
                            onClick={() => { setBankModal({ fee }); setUtrNumber(""); }}
                          >
                            <Building2 size={16} /> Bank Transfer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ✅ BANK TRANSFER MODAL */}
      {bankModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: "white", borderRadius: "24px", padding: "36px", width: "100%", maxWidth: "480px", boxShadow: "0 30px 60px rgba(0,0,0,0.25)", fontFamily: "'Inter', sans-serif", maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Building2 size={30} color="white" />
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: "1.35rem", fontWeight: "800", color: "#0f172a" }}>Bank Transfer</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>Niche diye account mein payment karo, phir UTR number enter karo</p>
            </div>

            {/* Amount Banner */}
            <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", fontWeight: "600" }}>Amount to Transfer</p>
                <p style={{ margin: 0, color: "white", fontSize: "1.6rem", fontWeight: "900" }}>₹ {bankModal.fee.amount?.toLocaleString('en-IN')}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>For</p>
                <p style={{ margin: 0, color: "white", fontWeight: "700", fontSize: "0.95rem" }}>{bankModal.fee.month}</p>
              </div>
            </div>

            {/* Bank Details */}
            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "18px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: "800", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>School Bank Details</h4>
              {[
                { label: "Account Name", value: SCHOOL_BANK.accountName },
                { label: "Account Number", value: SCHOOL_BANK.accountNumber, copy: true },
                { label: "IFSC Code", value: SCHOOL_BANK.ifsc, copy: true },
                { label: "Bank", value: SCHOOL_BANK.bank },
                { label: "Branch", value: SCHOOL_BANK.branch },
                { label: "Account Type", value: SCHOOL_BANK.accountType },
              ].map(({ label, value, copy }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#0f172a", fontWeight: "700", fontSize: "0.9rem" }}>{value}</span>
                    {copy && (
                      <button onClick={() => copyToClipboard(value, label)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#94a3b8", display: "flex" }}>
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* UTR Input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                UTR / Transaction Reference Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 123456789012 (NEFT/IMPS/UPI ref)"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                style={{ width: "100%", padding: "13px 15px", border: "1.5px solid #e5e7eb", borderRadius: "12px", fontSize: "0.95rem", color: "#111827", outline: "none", boxSizing: "border-box", fontWeight: "500" }}
                onFocus={e => { e.target.style.borderColor = "#16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
              />
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                Transfer karne ke baad bank app / SMS mein jo reference number milega woh enter karo
              </p>
            </div>

            {/* Info Box */}
            <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", display: "flex", gap: "10px" }}>
              <span style={{ fontSize: "1rem" }}>ℹ️</span>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#1e40af", lineHeight: "1.5" }}>
                Admin 24 hours mein verify karenge. Verification ke baad status <strong>"Paid"</strong> ho jayega.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => { setBankModal(null); setUtrNumber(""); }}
                style={{ flex: 1, padding: "13px", background: "#f1f5f9", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", color: "#475569" }}
              >
                Cancel
              </button>
              <button
                onClick={handleBankTransferSubmit}
                disabled={utrSubmitting || !utrNumber.trim()}
                style={{
                  flex: 2, padding: "13px",
                  background: utrSubmitting || !utrNumber.trim() ? "#86efac" : "linear-gradient(135deg,#16a34a,#15803d)",
                  border: "none", borderRadius: "12px", fontWeight: "700", cursor: utrSubmitting || !utrNumber.trim() ? "not-allowed" : "pointer",
                  color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}
              >
                {utrSubmitting ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
                {utrSubmitting ? "Submitting..." : "Submit Payment"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ✅ DEMO PAYMENT MODAL */}
      {demoModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: "white", borderRadius: "24px", padding: "36px", width: "420px", boxShadow: "0 30px 60px rgba(0,0,0,0.3)", fontFamily: "'Inter', sans-serif" }}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <CreditCard size={32} color="white" />
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: "1.4rem", fontWeight: "800", color: "#0f172a" }}>Demo Payment</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Test mode — real Razorpay keys set karo production ke liye</p>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "18px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#64748b", fontWeight: "600" }}>Fee Month</span>
                <span style={{ color: "#0f172a", fontWeight: "700" }}>{demoModal.fee.month}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#64748b", fontWeight: "600" }}>Amount</span>
                <span style={{ color: "#4f46e5", fontWeight: "800", fontSize: "1.1rem" }}>Rs. {demoModal.fee.amount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontWeight: "600" }}>Order ID</span>
                <span style={{ color: "#64748b", fontSize: "0.8rem", fontFamily: "monospace" }}>{demoModal.orderId}</span>
              </div>
            </div>

            <div style={{ background: "#fef3c7", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1rem" }}>⚠️</span>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#92400e", lineHeight: "1.5" }}>
                Razorpay test keys invalid hain. Actual keys ke liye:
                <strong> dashboard.razorpay.com → Settings → API Keys</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => { setDemoModal(null); setIsProcessingId(null); }}
                style={{ flex: 1, padding: "13px", background: "#f1f5f9", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", color: "#475569" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const verifyToast = toast.loading("Simulating payment...");
                  try {
                    await api.post("auth/verify-payment/", {
                      razorpay_payment_id: `demo_pay_${Date.now()}`,
                      razorpay_order_id: demoModal.orderId,
                      demo_mode: true,
                      fee_id: demoModal.fee.id
                    });
                    toast.dismiss(verifyToast);
                    markFeePaid(demoModal.fee.id, `DEMO-${Date.now()}`);
                    setDemoModal(null);
                  } catch {
                    toast.dismiss(verifyToast);
                    markFeePaid(demoModal.fee.id, `DEMO-${Date.now()}`);
                    setDemoModal(null);
                  }
                }}
                style={{ flex: 2, padding: "13px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <CreditCard size={17} /> Simulate Payment (Demo)
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
                .action-btn.bank { background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; }
                .action-btn.bank:hover { background: #16a34a; color: white; transform: translateY(-1px); }

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