import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
// 🚀 FIX 1: Normal axios ki jagah apna custom api import karo! 
// (Agar path alag ho toh theek kar lena, jaise '../../utils/api')
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Clock, Users, TrendingUp, Search, Filter,
  Download, Activity, Wallet, Eye, X, Printer, FileText,
  ChevronLeft, ChevronRight, Banknote, ShieldCheck, ChevronDown
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

// 🚀 FIX 2: Default payment mode 'cash' kiya taaki RazorpayX ka error na aaye testing me
const EMPTY_FORM = {
  teacher: "", month: new Date().toISOString().slice(0, 7),
  salary_amount: "", bonus: "0", deductions: "0",
  payment_mode: "cash", transaction_reference: "", notes: ""
};

export default function TeacherSalaryAdmin() {
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalPaid: 0, pendingCount: 0, totalTeachers: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchPayments();
    fetchTeachers();
  }, []);

  const fetchPayments = async () => {
    try {
      // 🚀 FIX 3: Custom api use kiya, base URL aur headers ki zaroorat nahi
      const res = await api.get('/payments/teacher-salary/');
      setPayments(res.data);
      calculateStats(res.data);
    } catch (err) {
      toast.error("Failed to load salary records.");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers/');
      setTeachers(res.data);
    } catch (err) {
      toast.error("Failed to load teachers.");
    }
  };

  const calculateStats = (data) => {
    const paid = data.filter(p => p.status === 'paid').reduce((acc, curr) => acc + Number(curr.net_amount || 0), 0);
    const pending = data.filter(p => p.status !== 'paid').length;
    const uniqueTeachers = new Set(data.map(p => p.teacher)).size;
    setStats({ totalPaid: paid, pendingCount: pending, totalTeachers: uniqueTeachers || 0 });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!form.teacher || !form.month || !form.salary_amount) {
      return toast.error("Teacher, Month and Basic Salary are required.");
    }
    setLoading(true);

    // 🚀 FIX 4: Numbers ko pakka Integer banaya taaki Django 400 error na de
    const payload = {
      ...form,
      teacher: Number(form.teacher),
      salary_amount: Number(form.salary_amount),
      bonus: Number(form.bonus),
      deductions: Number(form.deductions)
    };

    try {
      await api.post('/payments/teacher-salary/', payload);
      toast.success(`Salary Disbursed Successfully 🚀`);
      setForm(EMPTY_FORM);
      fetchPayments();
    } catch (error) {
      console.error("Backend Error:", error.response?.data);
      toast.error(error.response?.data?.detail || JSON.stringify(error.response?.data) || "Transaction Failed ❌");
    }
    setLoading(false);
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '', 'width=800,height=900');
    const netPay = parseFloat(selectedReceipt.net_amount).toLocaleString('en-IN');
    const base = parseFloat(selectedReceipt.salary_amount).toLocaleString('en-IN');
    const bonus = parseFloat(selectedReceipt.bonus || 0).toLocaleString('en-IN');
    const ded = parseFloat(selectedReceipt.deductions || 0).toLocaleString('en-IN');

    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${selectedReceipt.teacher_name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
            .container { border: 1px solid #e2e8f0; padding: 40px; border-radius: 12px; max-width: 700px; margin: auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
            .header h1 { color: #4f46e5; margin: 0; font-size: 28px; font-weight: 900; }
            .header p { color: #64748b; margin: 5px 0 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .label { color: #64748b; font-weight: 600; width: 40%; }
            .value { font-weight: 700; width: 60%; text-align: right; }
            .divider { border-top: 1px dashed #cbd5e1; margin: 20px 0; }
            .net-pay { font-size: 24px; font-weight: 900; color: #10b981; text-align: right; margin-top: 10px; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>OFFICIAL SALARY SLIP</h1>
              <p>Receipt No: #${selectedReceipt.invoice_number}</p>
            </div>
            <div class="content">
              <div class="row"><span class="label">Employee Name:</span><span class="value">${selectedReceipt.teacher_name}</span></div>
              <div class="row"><span class="label">Employee ID:</span><span class="value">${selectedReceipt.teacher_employee_id || 'N/A'}</span></div>
              <div class="row"><span class="label">Payroll Month:</span><span class="value">${selectedReceipt.month}</span></div>
              <div class="row"><span class="label">Payment Mode:</span><span class="value">${selectedReceipt.payment_mode?.replace('_', ' ').toUpperCase()}</span></div>
              <div class="row"><span class="label">Status:</span><span class="value" style="color: #16a34a;">${selectedReceipt.status?.toUpperCase()}</span></div>
              
              <div class="divider"></div>
              
              <div class="row"><span class="label">Basic Salary:</span><span class="value">₹ ${base}</span></div>
              <div class="row"><span class="label">Allowances/Bonus (+):</span><span class="value">₹ ${bonus}</span></div>
              <div class="row"><span class="label">Deductions (-):</span><span class="value" style="color: #e11d48;">₹ ${ded}</span></div>
              
              <div class="divider"></div>
              
              <div class="row"><span class="label">Net Payable:</span><div class="net-pay">₹ ${netPay}</div></div>
            </div>
            <div class="footer">
              <p>This is a system-generated document and requires no physical signature.<br>Generated securely via Nexus Payroll Systems.</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    const netPay = parseFloat(selectedReceipt.net_amount).toLocaleString('en-IN');
    const base = parseFloat(selectedReceipt.salary_amount).toLocaleString('en-IN');
    const bonus = parseFloat(selectedReceipt.bonus || 0).toLocaleString('en-IN');
    const ded = parseFloat(selectedReceipt.deductions || 0).toLocaleString('en-IN');

    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("INSTITUTION PAYROLL", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Official Salary Disbursement Record", 14, 30);

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("SALARY SLIP", 130, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt ID: #${selectedReceipt.invoice_number}`, 130, 30);
    doc.text(`Month: ${selectedReceipt.month}`, 130, 36);

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 45, 196, 45);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Beneficiary Details:", 14, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${selectedReceipt.teacher_name}`, 14, 63);
    doc.text(`Employee ID: ${selectedReceipt.teacher_employee_id || 'N/A'}`, 14, 69);
    doc.text(`Mode: ${selectedReceipt.payment_mode?.replace('_', ' ').toUpperCase()}`, 14, 75);

    doc.autoTable({
      startY: 85,
      head: [['Earnings Head', 'Amount (INR)', 'Deductions Head', 'Amount (INR)']],
      body: [
        ['Basic Salary', `Rs. ${base}`, 'Tax / Deductions', `Rs. ${ded}`],
        ['Bonus / Arrears', `Rs. ${bonus}`, '', ''],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: { 1: { halign: 'right' }, 3: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY || 120;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(`Net Transferred: Rs. ${netPay}/-`, 14, finalY + 15);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("This is a computer generated record and requires no signature.", 105, 280, null, null, "center");

    doc.save(`Salary_${selectedReceipt.teacher_name}_${selectedReceipt.month}.pdf`);
    toast.success("Official PDF Downloaded 📥");
  };

  const filteredPayments = payments.filter(p =>
    p.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.month?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentNetPay = (parseFloat(form.salary_amount || 0) + parseFloat(form.bonus || 0) - parseFloat(form.deductions || 0)).toFixed(2);

  return (
    <div className="payroll-page-wrapper">
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.05), transparent 25%)' }}></div>

      <SidebarModern />

      <div className="payroll-main-content">
        <Toaster position="top-center" />

        <div className="page-header">
          <div>
            <h1 style={{ color: "#0f172a", fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 5px 0' }}>Teacher Payroll Hub</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>Process and disburse educator salaries securely.</p>
          </div>
          <div className="header-actions">
            <button style={secondaryBtnStyle}><Filter size={16} /> Filters</button>
            <button style={primaryBtnStyle}><Download size={16} /> Export Data</button>
          </div>
        </div>

        <div className="stats-grid">
          <div style={heroStatCardStyle}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0.9, margin: '0 0 5px 0', color: 'rgba(255,255,255,0.9)' }}>Total Disbursed</p>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', margin: 0 }}>₹{(stats.totalPaid / 1000).toFixed(1)}k</h2>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.25)', padding: '8px', borderRadius: '10px', backdropFilter: 'blur(5px)' }}>
                <TrendingUp size={20} color="white" />
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
              <Activity size={14} /> Global Ledger
            </div>
          </div>

          <div style={glassStatCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={cardLabelStyle}>Pending Transactions</p>
                <h2 style={cardValueStyle}>{stats.pendingCount}</h2>
              </div>
              <div style={{ background: '#fff1f2', padding: '8px', borderRadius: '10px' }}>
                <Clock size={20} color="#e11d48" />
              </div>
            </div>
          </div>

          <div style={glassStatCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={cardLabelStyle}>Active Teachers Paid</p>
                <h2 style={cardValueStyle}>{stats.totalTeachers}</h2>
              </div>
              <div style={{ background: '#f0f9ff', padding: '8px', borderRadius: '10px' }}>
                <Users size={20} color="#0284c7" />
              </div>
            </div>
          </div>
        </div>

        <div className="content-flex-container">

          {/* QUICK PAY FORM */}
          <div style={glassPanelStyle} className="form-panel">
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '10px' }}><Wallet size={18} color="#4f46e5" /></div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Process Salary</h3>
            </div>

            <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Select Teacher</label>
                <div style={{ position: 'relative' }}>
                  <select required value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} style={{ ...inputStyle, appearance: 'none' }}>
                    <option value="">-- Choose Employee --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name || t.full_name} ({t.employee_id || t.id})</option>)}
                  </select>
                  <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div className="grid-2-col">
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Month</label>
                  <input type="month" required value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Payment Mode</label>
                  <div style={{ position: 'relative' }}>
                    <select required value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })} style={{ ...inputStyle, appearance: 'none' }}>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="upi">UPI</option>
                    </select>
                    <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Basic Salary (₹)</label>
                <input type="number" placeholder="0.00" required value={form.salary_amount} onChange={e => setForm({ ...form, salary_amount: e.target.value })} style={{ ...inputStyle, fontWeight: '800', fontSize: '1rem' }} />
              </div>

              <div className="grid-2-col">
                <div style={inputGroupStyle}>
                  <label style={{ ...labelStyle, color: '#059669' }}>Bonus (+)</label>
                  <input type="number" placeholder="0" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} style={{ ...inputStyle, background: '#ecfdf5', borderColor: '#a7f3d0' }} />
                </div>
                <div style={inputGroupStyle}>
                  <label style={{ ...labelStyle, color: '#e11d48' }}>Deductions (-)</label>
                  <input type="number" placeholder="0" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} style={{ ...inputStyle, background: '#fff1f2', borderColor: '#fecdd3' }} />
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '12px', marginTop: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Net Payable</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>₹{currentNetPay}</span>
              </div>

              <button type="submit" disabled={loading} style={{ ...actionGlowBtnStyle, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Processing..." : "Disburse Funds 🚀"}
              </button>
            </form>
          </div>

          {/* TRANSACTION HISTORY TABLE */}
          <div className="table-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '10px 15px', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Transaction History</h3>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '10px', padding: '6px 12px', border: '1px solid #e2e8f0', flexGrow: 1, maxWidth: '320px' }}>
                <Search size={16} color="#94a3b8" />
                <input placeholder="Search ID, Teacher, or Month..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', marginLeft: '8px', width: '100%', fontWeight: '500' }} />
              </div>
            </div>

            <div className="table-wrapper">
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: '0 8px', minWidth: '850px' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Inv ID</th>
                    <th style={thStyle}>Teacher Profile</th>
                    <th style={thStyle}>Month</th>
                    <th style={thStyle}>Net Pay</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} style={{ ...floatingRowStyle, transform: hoveredRow === p.id ? 'translateY(-2px)' : 'none', boxShadow: hoveredRow === p.id ? '0 8px 20px -5px rgba(0,0,0,0.06)' : '0 2px 5px rgba(0,0,0,0.02)' }} onMouseEnter={() => setHoveredRow(p.id)} onMouseLeave={() => setHoveredRow(null)}>

                      <td style={tdStyle}>
                        <span style={{ fontWeight: '700', color: '#6366f1', background: '#e0e7ff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>#{p.invoice_number}</span>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
                          <div style={{ ...avatarStyle, background: '#f1f5f9', color: '#0f172a' }}>{p.teacher_name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>{p.teacher_name}</div>
                            <div style={{ fontWeight: '600', color: '#94a3b8', fontSize: '0.75rem' }}>EMP: {p.teacher_employee_id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{p.month}</span>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>₹{Number(p.net_amount).toLocaleString()}</span>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: '800', background: p.status === "paid" ? "#dcfce7" : "#fff1f2", color: p.status === "paid" ? "#166534" : "#be123c", display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                          {p.status === "paid" ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {p.status || 'Pending'}
                        </span>
                      </td>

                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => setSelectedReceipt(p)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }} title="View Slip">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => generateSalaryPDF(p)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }} title="Download Slip">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <Search size={32} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>No transactions found matching your criteria.</p>
                </div>
              )}
            </div>

            {filteredPayments.length > 0 && (
              <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingBottom: '20px' }}>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', color: '#475569' }}><ChevronLeft size={16} /> Prev</button>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>Page 1 of 1</span>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', color: '#475569' }}>Next <ChevronRight size={16} /></button>
              </div>
            )}

          </div>
        </div>

        {/* 🌟 PREMIUM RECEIPT MODAL 🌟 */}
        <AnimatePresence>
          {selectedReceipt && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden', margin: '20px', display: 'flex', flexDirection: 'column' }}>

                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)', padding: '25px', color: 'white', position: 'relative' }}>
                  <button onClick={() => setSelectedReceipt(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: '0.2s hover:background' }}><X size={16} /></button>
                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', backdropFilter: 'blur(5px)' }}>
                      <CheckCircle size={30} color="#4ade80" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', tracking: '-1px' }}>₹{Number(selectedReceipt.net_amount).toLocaleString()}</h2>
                    <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Disbursement Successful</p>
                  </div>
                </div>

                <div style={{ padding: '30px', backgroundColor: '#f8fafc' }}>
                  <div style={receiptRow}><span style={receiptLabel}>Invoice Ref.</span><span style={receiptValue}>#{selectedReceipt.invoice_number}</span></div>
                  <div style={receiptRow}><span style={receiptLabel}>Beneficiary</span><span style={receiptValue}>{selectedReceipt.teacher_name}</span></div>
                  <div style={receiptRow}><span style={receiptLabel}>Payroll Month</span><span style={receiptValue}>{selectedReceipt.month}</span></div>
                  <div style={receiptRow}><span style={receiptLabel}>Routing Method</span><span style={{ ...receiptValue, textTransform: 'capitalize' }}>{selectedReceipt.payment_mode?.replace('_', ' ')}</span></div>

                  <div style={{ borderTop: '2px dashed #cbd5e1', margin: '20px 0' }}></div>

                  <div style={receiptRow}><span style={receiptLabel}>Base Amount</span><span style={{ ...receiptValue, color: '#64748b' }}>₹{Number(selectedReceipt.salary_amount).toLocaleString()}</span></div>
                  <div style={receiptRow}><span style={receiptLabel}>Bonuses (+)</span><span style={{ ...receiptValue, color: '#10b981' }}>₹{Number(selectedReceipt.bonus || 0).toLocaleString()}</span></div>
                  <div style={receiptRow}><span style={receiptLabel}>Deductions (-)</span><span style={{ ...receiptValue, color: '#e11d48' }}>₹{Number(selectedReceipt.deductions || 0).toLocaleString()}</span></div>

                  <div style={{ borderTop: '1px solid #cbd5e1', margin: '20px 0' }}></div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handlePrintReceipt} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}><Printer size={16} /> Print</button>
                    <button onClick={handleDownloadReceipt} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}><FileText size={16} /> PDF Slip</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 🚀 BULLETPROOF INLINE CSS MAGIC 🚀 */}
      <style>{`
        html, body, #root { margin: 0; padding: 0; height: 100%; }

        .payroll-page-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #f8fafc;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .payroll-main-content {
            flex: 1;
            margin-left: 280px; 
            padding: 30px;
            padding-bottom: 120px !important; 
            height: 100vh;
            overflow-y: auto !important; 
            box-sizing: border-box;
            max-width: calc(100% - 280px);
            position: relative;
            z-index: 1;
        }

        .payroll-main-content::-webkit-scrollbar { width: 8px; }
        .payroll-main-content::-webkit-scrollbar-track { background: transparent; }
        .payroll-main-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .payroll-main-content::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .header-actions { display: flex; gap: 12px; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; width: 100%; }
        
        .content-flex-container { 
            display: flex; 
            flex-direction: row; 
            gap: 25px; 
            align-items: flex-start; 
            width: 100%; 
        }

        .form-panel { width: 360px; flex-shrink: 0; }
        .table-panel { flex: 1; min-width: 0; }
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }

        .table-wrapper {
            overflow-x: auto;
            width: 100%;
            -webkit-overflow-scrolling: touch;
            padding: 0 5px;
            display: block;
        }

        .table-wrapper::-webkit-scrollbar { height: 8px; }
        .table-wrapper::-webkit-scrollbar-track { background: transparent; }
        .table-wrapper::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

        @media (max-width: 1024px) {
            .payroll-main-content { margin-left: 0 !important; max-width: 100%; width: 100%; }
        }

        @media (max-width: 900px) {
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            
            .payroll-page-wrapper {
                display: block !important; 
                height: auto !important;
                min-height: 100vh !important;
            }

            .payroll-main-content {
                margin-left: 0 !important;
                padding: 20px !important;
                padding-top: 90px !important; 
                padding-bottom: 150px !important; 
                width: 100vw !important;
                max-width: 100vw !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                display: block !important; 
            }

            .pagination-container { margin-bottom: 40px !important; }
            .page-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
            .header-actions { width: 100%; }
            .header-actions button { flex: 1; justify-content: center; }
            .stats-grid { grid-template-columns: 1fr !important; }
            .content-flex-container { flex-direction: column !important; }
            .form-panel { width: 100% !important; margin-bottom: 25px !important; }
            .table-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

const primaryBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', color: 'white', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const secondaryBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', color: '#475569', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

const actionGlowBtnStyle = {
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "800",
  padding: "14px",
  fontSize: '0.95rem',
  width: '100%',
  marginTop: '12px',
  boxShadow: '0 8px 20px -6px rgba(99, 102, 241, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease'
};

const heroStatCardStyle = { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: "24px", borderRadius: "20px", position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)', width: '100%', boxSizing: 'border-box' };
const glassStatCardStyle = { background: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 4px 15px -3px rgba(0, 0, 0, 0.05)", border: '1px solid #f1f5f9', width: '100%', boxSizing: 'border-box' };
const glassPanelStyle = { background: "white", padding: "24px", borderRadius: "24px", boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.05)", border: '1px solid #f1f5f9', boxSizing: 'border-box' };

const inputGroupStyle = { marginBottom: '6px' };
const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' };
const inputStyle = { border: '1px solid #cbd5e1', borderRadius: '12px', width: '100%', padding: '12px 14px', fontSize: '0.9rem', color: '#0f172a', background: 'white', fontWeight: '600', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' };

const thStyle = { padding: "14px 16px", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' };
const tdStyle = { padding: "14px 16px", verticalAlign: 'middle', borderBottom: '1px solid transparent' };
const floatingRowStyle = { background: 'white', borderRadius: '14px', transition: 'all 0.2s ease', border: '1px solid #f8fafc' };

const avatarStyle = { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.95rem', flexShrink: 0, border: '1px solid #e2e8f0' };
const cardLabelStyle = { color: '#64748b', fontSize: '0.85rem', fontWeight: '700', margin: '0 0 6px 0' };
const cardValueStyle = { color: '#0f172a', fontSize: '1.8rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' };

const receiptRow = { display: 'flex', justifyContent: 'space-between', margin: '0 0 14px 0', alignItems: 'center' };
const receiptLabel = { color: '#64748b', fontSize: '0.9rem', fontWeight: '600' };
const receiptValue = { color: '#0f172a', fontSize: '0.95rem', fontWeight: '800' };