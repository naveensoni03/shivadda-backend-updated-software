import React, { useState, useEffect } from "react";
import SidebarParent from "../../components/SidebarParent";
import { Wallet, CreditCard, Clock, CheckCircle, Download, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

export default function ParentFees() {
    const [loading, setLoading] = useState(true);
    const [isProcessingId, setIsProcessingId] = useState(null);
    const [feeRecords, setFeeRecords] = useState([]);

    useEffect(() => {
        fetchFeeData();
    }, []);

    const fetchFeeData = async () => {
        try {
            const response = await api.get("auth/parents/profile/fees/").catch(() => ({
                data: [
                    { id: "FEE-001", month: "April 2026", child: "Aarav Sharma", amount: 5000, status: "Pending", due_date: "15 Apr 2026" },
                    { id: "FEE-002", month: "March 2026", child: "Aarav Sharma", amount: 5000, status: "Paid", date: "12 Mar 2026" }
                ]
            }));
            setFeeRecords(response.data);
            setLoading(false);
        } catch (error) {
            if (loading) toast.error("Failed to load fee records from server.");
            setLoading(false);
        }
    };

    const totalOutstanding = feeRecords.filter(f => f.status === "Pending" || f.status === "Overdue" || f.status === "Partial").reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const totalPaid = feeRecords.filter(f => f.status === "Paid").reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const pendingFees = feeRecords.filter(f => f.status === "Pending" || f.status === "Overdue");
    const nextDueDate = pendingFees.length > 0 ? pendingFees[0].due_date : "No Dues";

    const displayRazorpay = async (fee) => {
        setIsProcessingId(fee.id);
        const loadToast = toast.loading("Connecting to Secure Payment Gateway...");

        const res = await loadRazorpayScript();
        if (!res) {
            toast.error("Razorpay SDK failed to load.", { id: loadToast });
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
                name: "SHIV ADDA EDU",
                description: `${fee.month} Fee Payment`,
                order_id: order_id,
                handler: async function (response) {
                    const verifyToast = toast.loading("Verifying your payment securely...");
                    try {
                        await api.post("auth/verify-payment/", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            fee_id: fee.id
                        });
                        setFeeRecords(prev => prev.map(record => record.id === fee.id ? { ...record, status: "Paid", date: new Date().toLocaleDateString('en-GB') } : record));
                        toast.success(`Payment Verified! TXN: ${response.razorpay_payment_id}`, { id: verifyToast });
                    } catch (verifyError) {
                        toast.error("Verification failed. Contact admin.", { id: verifyToast });
                    } finally { setIsProcessingId(null); }
                },
                prefill: { name: "Parent", email: "parent@example.com", contact: "9999999999" },
                theme: { color: "#4f46e5" }
            };
            new window.Razorpay(options).open();
        } catch (error) {
            toast.error("Server Error: Could not generate payment order.", { id: loadToast });
            setIsProcessingId(null);
        }
    };

    // 🔥 PROFESSIONAL PDF GENERATOR (Shiv Adda Logo + GST)
    const handleDownloadReceipt = (fee) => {
        const doc = new jsPDF();

        // 1. Header (Company Info & Fake Logo Text)
        doc.setFontSize(24);
        doc.setTextColor(79, 70, 229); // Indigo color
        doc.setFont("helvetica", "bold");
        doc.text("SHIV ADDA", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text("GSTIN: 08AABCU9603R1ZM", 14, 30);
        doc.text("123 Education Hub, Vidyadhar Nagar", 14, 35);
        doc.text("Jaipur, Rajasthan, India - 302039", 14, 40);
        doc.text("Email: support@shivadda.com | Phone: +91-9876543210", 14, 45);

        // 2. Invoice Details (Right Side)
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text("TAX INVOICE / RECEIPT", 130, 22);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Receipt No: RCPT-${fee.id}`, 130, 30);
        doc.text(`Date: ${fee.date || new Date().toLocaleDateString()}`, 130, 35);
        doc.text(`Status: PAID`, 130, 40);

        // Line Break
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 50, 196, 50);

        // 3. Student Details
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text("Billed To:", 14, 60);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Student Name: ${fee.child}`, 14, 68);
        doc.text(`Particulars: ${fee.month} Course Fee`, 14, 74);

        // 4. Pricing Table with AutoTable
        const baseAmount = (fee.amount / 1.18).toFixed(2);
        const gstAmount = (fee.amount - baseAmount).toFixed(2);

        doc.autoTable({
            startY: 85,
            head: [['Description', 'Base Amount (INR)', 'GST (18%)', 'Total (INR)']],
            body: [
                [`Academic Fee - ${fee.month}`, `Rs. ${baseAmount}`, `Rs. ${gstAmount}`, `Rs. ${fee.amount}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 6 },
            columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } }
        });

        const finalY = doc.lastAutoTable.finalY || 120;

        // 5. Total & Footer
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Amount Paid: Rs. ${fee.amount}/-`, 14, finalY + 15);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150);
        doc.text("This is a computer generated receipt and requires no signature.", 105, 280, null, null, "center");

        // Save PDF
        doc.save(`ShivAdda_Receipt_${fee.id}.pdf`);
        toast.success("PDF Invoice Downloaded! 📄");
    };

    return (
        <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            <SidebarParent />
            <Toaster position="top-center" />

            <div className="main-content hide-scrollbar">
                <div className="welcome-hero" style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>Fee <span style={{ color: '#4f46e5' }}>Ledger</span></h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>Manage and track all your children's fee payments and dues.</p>
                </div>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                        <div style={{ width: '55px', height: '55px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#ef4444' }}><Wallet size={24} /></div>
                        <div><p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Total Outstanding</p><h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '900' }}>Rs. {totalOutstanding.toLocaleString('en-IN')}</h3></div>
                    </div>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                        <div style={{ width: '55px', height: '55px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dcfce7', color: '#16a34a' }}><CheckCircle size={24} /></div>
                        <div><p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Total Paid</p><h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '900' }}>Rs. {totalPaid.toLocaleString('en-IN')}</h3></div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #4f46e5, #ec4899)', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', color: 'white' }}>
                        <div style={{ width: '55px', height: '55px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)' }}><CreditCard size={24} /></div>
                        <div><p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#e0e7ff', fontWeight: '600' }}>Next Due Date</p><h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white', fontWeight: '900' }}>{nextDueDate}</h3></div>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <div style={{ padding: '25px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Transaction History</h3>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 size={30} className="spin" color="#4f46e5" /></div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '15px 30px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', background: '#f8fafc' }}>Receipt ID</th>
                                    <th style={{ textAlign: 'left', padding: '15px 30px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', background: '#f8fafc' }}>Fee Particular</th>
                                    <th style={{ textAlign: 'left', padding: '15px 30px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', background: '#f8fafc' }}>Amount</th>
                                    <th style={{ textAlign: 'left', padding: '15px 30px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', background: '#f8fafc' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '15px 30px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', background: '#f8fafc' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feeRecords.map((fee) => (
                                    <tr key={fee.id}>
                                        <td style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#475569' }}>{fee.id}</td>
                                        <td style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{fee.month}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{fee.child}</div>
                                        </td>
                                        <td style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9', fontWeight: '800', color: '#1e293b' }}>Rs. {fee.amount}</td>
                                        <td style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: fee.status === 'Paid' ? '#dcfce7' : '#fee2e2', color: fee.status === 'Paid' ? '#16a34a' : '#ef4444' }}>
                                                {fee.status === 'Paid' ? <CheckCircle size={14} /> : <Clock size={14} />} {fee.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9' }}>
                                            {fee.status === 'Paid' ? (
                                                <button onClick={() => handleDownloadReceipt(fee)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 15px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', border: 'none', background: '#f1f5f9', color: '#475569' }}>
                                                    <Download size={16} /> PDF Invoice
                                                </button>
                                            ) : (
                                                <button onClick={() => displayRazorpay(fee)} disabled={isProcessingId === fee.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 15px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', border: 'none', background: '#e0e7ff', color: '#4f46e5' }}>
                                                    {isProcessingId === fee.id ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />} Pay
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
            <style>{`.main-content { flex: 1; margin-left: 280px; padding: 30px 50px; height: 100vh; overflow-y: auto; overflow-x: hidden; } .spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } } @media (max-width: 1024px) { .main-content { margin-left: 0; padding: 25px; padding-top: 80px; } }`}</style>
        </div>
    );
}