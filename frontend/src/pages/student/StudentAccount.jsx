import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, CheckCircle, Clock, Download, IndianRupee,
  Shield, Unlock, Lock, RefreshCw, ChevronDown, ChevronUp,
  Receipt, AlertCircle, Zap, Calendar, Hash, Wallet,
  ArrowRight, Copy, Eye, EyeOff, X
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import StudentSidebar from "../../components/StudentSidebar";
import { useNavigate } from "react-router-dom";

// ── PDF Invoice Generator ───────────────────────────────────────────────────
function generateInvoicePDF(p) {
  const doc = new jsPDF();
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INVOICE", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Shiv Adda — Education Management Platform", 105, 32, { align: "center" });

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.text(`Invoice No : ${p.invoice_number}`, 14, 56);
  doc.text(`Date       : ${new Date(p.paid_at || p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, 14, 64);
  doc.text(`Status     : ${(p.status || "").toUpperCase()}`, 14, 72);
  if (p.razorpay_payment_id) {
    doc.text(`Transaction: ${p.razorpay_payment_id}`, 14, 80);
  }

  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 14, 94);
  doc.setFont("helvetica", "normal");
  doc.text(p.user_name || "Student", 14, 102);
  doc.text(p.user_email || "—", 14, 110);
  if (p.student_roll) doc.text(`Roll No: ${p.student_roll}`, 14, 118);

  autoTable(doc, {
    startY: 130,
    head: [["Service", "Base Amt (₹)", "GST (₹)", "Total (₹)"]],
    body: [[
      p.service_name_snapshot || "—",
      parseFloat(p.base_amount || 0).toFixed(2),
      parseFloat(p.gst_amount || 0).toFixed(2),
      parseFloat(p.total_amount || 0).toFixed(2),
    ]],
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 5 },
    alternateRowStyles: { fillColor: [245, 245, 255] },
  });

  const y = doc.lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Total Paid: ₹${parseFloat(p.total_amount || 0).toFixed(2)}`, 14, y);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated invoice. No signature required.", 105, 286, { align: "center" });
  doc.save(`Invoice-${p.invoice_number}.pdf`);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  paid:    { bg: "#dcfce7", color: "#16a34a", label: "Paid",    icon: CheckCircle },
  pending: { bg: "#fef3c7", color: "#d97706", label: "Pending", icon: Clock },
  failed:  { bg: "#fee2e2", color: "#ef4444", label: "Failed",  icon: AlertCircle },
  refunded:{ bg: "#f0f9ff", color: "#0369a1", label: "Refunded",icon: RefreshCw },
};

const METHOD_LABELS = {
  upi: "UPI", card: "Card / Debit", netbanking: "Net Banking",
  wallet: "Wallet", emi: "EMI", other: "Other", "": "—",
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "3px 10px", fontSize: "0.73rem", fontWeight: 700 }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function CopyBtn({ value }) {
  const copy = () => { navigator.clipboard.writeText(value); toast.success("Copied!"); };
  return (
    <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "2px 4px" }}>
      <Copy size={13} />
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function StudentAccount() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState("plans");  // plans | history | pending
  const [payments, setPayments]  = useState([]);
  const [access, setAccess]      = useState([]);
  const [services, setServices]  = useState([]);
  const [loading, setLoading]    = useState(true);
  const [expandedRow, setExpandedRow] = useState(null); // expanded TXN row id

  useEffect(() => {
    const tk = localStorage.getItem("access_token");
    if (!tk) { navigate("/student/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [payR, accR, svcR] = await Promise.allSettled([
        api.get("payments/my-payments/"),
        api.get("payments/my-access/"),
        api.get("payments/services/"),
      ]);
      if (payR.status === "fulfilled") setPayments(payR.value.data || []);
      if (accR.status === "fulfilled") setAccess(accR.value.data   || []);
      if (svcR.status === "fulfilled") setServices(svcR.value.data  || []);
    } catch (e) {
      toast.error("Data load nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const paidPayments    = payments.filter(p => p.status === "paid");
  const pendingPayments = payments.filter(p => p.status === "pending");
  const totalSpent      = paidPayments.reduce((s, p) => s + parseFloat(p.total_amount || 0), 0);
  const activeAccess    = access.filter(a => a.is_valid);

  // Services student has NOT paid for yet (pending or no payment)
  const unpaidServices = services.filter(svc =>
    svc.is_chargeable && !access.some(a => a.service === svc.id && a.is_valid)
  );

  const TABS = [
    { id: "plans",   label: "My Plans",       icon: Shield,   count: activeAccess.length },
    { id: "history", label: "Payment History", icon: Receipt,  count: paidPayments.length },
    { id: "pending", label: "Pending / Due",   icon: Clock,    count: pendingPayments.length + unpaidServices.length },
  ];

  return (
    <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>
      <StudentSidebar />
      <Toaster position="top-right" />

      <main style={{ flex: 1, marginLeft: 280, padding: "32px 40px", minHeight: "100vh" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", padding: "6px 10px", borderRadius: 12, display: "inline-flex" }}>💳</span>
              My Account
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.88rem" }}>
              Aapki subscription plans, payment history aur transaction details
            </p>
          </div>
          <button onClick={fetchAll}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", color: "#64748b" }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* ── KPI Summary Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Spent",      value: `₹${totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: IndianRupee, bg: "#eef2ff", color: "#4f46e5" },
            { label: "Active Plans",     value: activeAccess.length,              icon: Unlock,      bg: "#f0fdf4", color: "#16a34a" },
            { label: "Paid Txns",        value: paidPayments.length,              icon: CheckCircle, bg: "#f0fdf4", color: "#16a34a" },
            { label: "Pending Payments", value: pendingPayments.length,           icon: Clock,       bg: "#fef3c7", color: "#d97706" },
          ].map(c => {
            const Icon = c.icon;
            return (
              <motion.div key={c.label} whileHover={{ y: -3 }}
                style={{ background: "white", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color={c.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{c.label}</p>
                  <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: c.color }}>{c.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, background: "white", borderRadius: 14, padding: 5, border: "1.5px solid #e2e8f0", marginBottom: 24, width: "fit-content" }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.84rem", background: active ? "#4f46e5" : "transparent", color: active ? "white" : "#64748b", transition: "all 0.2s" }}>
                <Icon size={15} /> {t.label}
                {t.count > 0 && (
                  <span style={{ background: active ? "rgba(255,255,255,0.25)" : "#eef2ff", color: active ? "white" : "#4f46e5", borderRadius: 20, padding: "1px 7px", fontSize: "0.72rem", fontWeight: 800 }}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── LOADING ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "white", borderRadius: 16, height: 140, animation: "pulse-bg 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════
                TAB 1 — MY PLANS (Active Access)
                ══════════════════════════════════════════════ */}
            {tab === "plans" && (
              <motion.div key="plans" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {activeAccess.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
                    <Lock size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
                    <h3 style={{ margin: "0 0 8px", color: "#64748b", fontWeight: 800 }}>Koi active plan nahi hai</h3>
                    <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "0.88rem" }}>Dashboard pe jaake apna plan choose karo</p>
                    <button onClick={() => navigate("/student/dashboard")}
                      style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 12, padding: "11px 24px", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
                      <Zap size={16} /> Choose a Plan
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 18 }}>
                    {activeAccess.map(acc => {
                      const daysLeft = acc.expires_at
                        ? Math.max(0, Math.ceil((new Date(acc.expires_at) - new Date()) / 86400000))
                        : null;
                      const pct = daysLeft !== null ? Math.min(100, Math.round(daysLeft / (acc.service?.validity_days || 365) * 100)) : 100;
                      return (
                        <motion.div key={acc.id} whileHover={{ y: -3 }}
                          style={{ background: "white", borderRadius: 20, border: "2px solid #4f46e5", boxShadow: "0 4px 20px rgba(79,70,229,0.08)", overflow: "hidden" }}>
                          <div style={{ height: 5, background: "linear-gradient(90deg,#4f46e5,#7c3aed)" }} />
                          <div style={{ padding: "20px 22px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                              <div>
                                <h3 style={{ margin: "0 0 3px", fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{acc.service_name}</h3>
                                <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#16a34a", borderRadius: 20, padding: "3px 9px", fontWeight: 700 }}>
                                  ✓ Active
                                </span>
                              </div>
                              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Unlock size={19} color="#4f46e5" />
                              </div>
                            </div>

                            {/* Access granted date */}
                            <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                              <div>
                                <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Granted On</p>
                                <p style={{ margin: 0, fontSize: "0.82rem", color: "#0f172a", fontWeight: 700 }}>
                                  {new Date(acc.granted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Expires On</p>
                                <p style={{ margin: 0, fontSize: "0.82rem", color: daysLeft !== null && daysLeft < 30 ? "#ef4444" : "#0f172a", fontWeight: 700 }}>
                                  {acc.expires_at
                                    ? new Date(acc.expires_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                    : "Lifetime"}
                                </p>
                              </div>
                            </div>

                            {/* Progress bar */}
                            {daysLeft !== null && (
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Validity Remaining</span>
                                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: daysLeft < 30 ? "#ef4444" : "#4f46e5" }}>
                                    {daysLeft} days left
                                  </span>
                                </div>
                                <div style={{ height: 7, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${pct}%`, background: daysLeft < 30 ? "#ef4444" : "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 10, transition: "width 1s ease" }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Services NOT yet unlocked */}
                    {unpaidServices.map(svc => (
                      <motion.div key={svc.id} whileHover={{ y: -3 }}
                        style={{ background: "white", borderRadius: 20, border: "1.5px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden", opacity: 0.8 }}>
                        <div style={{ height: 5, background: "#e2e8f0" }} />
                        <div style={{ padding: "20px 22px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div>
                              <h3 style={{ margin: "0 0 3px", fontSize: "1rem", fontWeight: 800, color: "#475569" }}>{svc.name}</h3>
                              <span style={{ fontSize: "0.72rem", background: "#f1f5f9", color: "#94a3b8", borderRadius: 20, padding: "3px 9px", fontWeight: 700 }}>
                                🔒 Not Unlocked
                              </span>
                            </div>
                            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Lock size={19} color="#94a3b8" />
                            </div>
                          </div>
                          <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "#94a3b8" }}>{svc.description}</p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "#4f46e5" }}>₹{parseFloat(svc.price).toLocaleString("en-IN")}</span>
                            <button onClick={() => navigate("/student/dashboard")}
                              style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                              Unlock <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 2 — PAYMENT HISTORY (Full Table)
                ══════════════════════════════════════════════ */}
            {tab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {paidPayments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
                    <Wallet size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
                    <h3 style={{ margin: "0 0 8px", color: "#64748b" }}>Koi paid transaction nahi mili</h3>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.88rem" }}>Dashboard se apna plan purchase karo</p>
                  </div>
                ) : (
                  <div style={{ background: "white", borderRadius: 20, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                    {/* Table header info */}
                    <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                        Transaction History
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                          {paidPayments.length} transactions · Total: ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            {["#", "Invoice", "Service / Plan", "Base Amt", "GST", "Total", "Method", "Status", "Date", "Actions"].map(h => (
                              <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 800, fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paidPayments.map((p, idx) => (
                            <>
                              <tr key={p.id}
                                onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                                style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: expandedRow === p.id ? "#fafbff" : "white", transition: "background 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                                onMouseLeave={e => e.currentTarget.style.background = expandedRow === p.id ? "#fafbff" : "white"}>
                                <td style={{ padding: "14px 16px", color: "#94a3b8", fontWeight: 700 }}>{idx + 1}</td>
                                <td style={{ padding: "14px 16px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{ fontWeight: 700, color: "#4f46e5", fontSize: "0.8rem" }}>{p.invoice_number}</span>
                                    <CopyBtn value={p.invoice_number} />
                                  </div>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.service_name_snapshot}</span>
                                  <br />
                                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{p.service_type_snapshot}</span>
                                </td>
                                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#334155" }}>
                                  ₹{parseFloat(p.base_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: "14px 16px", color: "#64748b" }}>
                                  ₹{parseFloat(p.gst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                  <span style={{ fontWeight: 900, color: "#0f172a", fontSize: "0.95rem" }}>
                                    ₹{parseFloat(p.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </span>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                  <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 8, padding: "3px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
                                    {METHOD_LABELS[p.payment_method] || "—"}
                                  </span>
                                </td>
                                <td style={{ padding: "14px 16px" }}><StatusBadge status={p.status} /></td>
                                <td style={{ padding: "14px 16px", color: "#64748b", whiteSpace: "nowrap" }}>
                                  {new Date(p.paid_at || p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <button onClick={e => { e.stopPropagation(); generateInvoicePDF(p); }}
                                      style={{ display: "flex", alignItems: "center", gap: 4, background: "#eef2ff", color: "#4f46e5", border: "none", borderRadius: 8, padding: "6px 10px", fontWeight: 700, fontSize: "0.76rem", cursor: "pointer" }}>
                                      <Download size={12} /> PDF
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); setExpandedRow(expandedRow === p.id ? null : p.id); }}
                                      style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                      {expandedRow === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* ── Expanded Transaction Details Row ── */}
                              {expandedRow === p.id && (
                                <tr key={`${p.id}-detail`} style={{ background: "#fafbff" }}>
                                  <td colSpan={10} style={{ padding: 0 }}>
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                      style={{ padding: "18px 24px", borderTop: "1px solid #e2e8f0", borderBottom: "2px solid #4f46e5" }}>
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                                        {[
                                          { label: "Transaction ID", value: p.razorpay_payment_id || "Demo / Internal", copy: !!p.razorpay_payment_id },
                                          { label: "Order ID",       value: p.razorpay_order_id   || "—",               copy: !!p.razorpay_order_id },
                                          { label: "Invoice No",     value: p.invoice_number,                           copy: true },
                                          { label: "Payment Date",   value: p.paid_at ? new Date(p.paid_at).toLocaleString("en-IN") : "—" },
                                          { label: "Created At",     value: new Date(p.created_at).toLocaleString("en-IN") },
                                          { label: "Currency",       value: p.currency || "INR" },
                                          { label: "Base Amount",    value: `₹${parseFloat(p.base_amount || 0).toFixed(2)}` },
                                          { label: "GST Amount",     value: `₹${parseFloat(p.gst_amount || 0).toFixed(2)}` },
                                          { label: "Total Paid",     value: `₹${parseFloat(p.total_amount || 0).toFixed(2)}` },
                                          { label: "Payment Method", value: METHOD_LABELS[p.payment_method] || "—" },
                                          { label: "Service Type",   value: p.service_type_snapshot || "—" },
                                          { label: "Status",         value: p.status?.toUpperCase() },
                                        ].map(d => (
                                          <div key={d.label} style={{ background: "white", borderRadius: 10, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
                                            <p style={{ margin: "0 0 3px", fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{d.label}</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                              <p style={{ margin: 0, fontSize: "0.82rem", color: "#0f172a", fontWeight: 700, wordBreak: "break-all" }}>{d.value}</p>
                                              {d.copy && d.value && d.value !== "—" && <CopyBtn value={d.value} />}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table footer */}
                    <div style={{ padding: "12px 24px", borderTop: "1px solid #f1f5f9", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Row click karo → full transaction details dekhne ke liye</span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>
                        Grand Total: ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 3 — PENDING / REMAINING PAYMENTS
                ══════════════════════════════════════════════ */}
            {tab === "pending" && (
              <motion.div key="pending" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                {/* Pending Razorpay orders */}
                {pendingPayments.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={18} color="#d97706" /> Pending Transactions
                      <span style={{ background: "#fef3c7", color: "#d97706", borderRadius: 20, padding: "2px 9px", fontSize: "0.75rem", fontWeight: 800 }}>
                        {pendingPayments.length}
                      </span>
                    </h3>
                    <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #fde68a", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                        <thead>
                          <tr style={{ background: "#fffbeb", borderBottom: "1.5px solid #fde68a" }}>
                            {["Invoice", "Service", "Amount", "Created", "Status", "Action"].map(h => (
                              <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 800, fontSize: "0.72rem", color: "#92400e", textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pendingPayments.map((p, i) => (
                            <tr key={p.id} style={{ borderBottom: "1px solid #fef9c3" }}>
                              <td style={{ padding: "13px 16px", fontWeight: 700, color: "#d97706", fontSize: "0.8rem" }}>{p.invoice_number}</td>
                              <td style={{ padding: "13px 16px", fontWeight: 700, color: "#0f172a" }}>{p.service_name_snapshot}</td>
                              <td style={{ padding: "13px 16px", fontWeight: 900, color: "#0f172a" }}>
                                ₹{parseFloat(p.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: "13px 16px", color: "#64748b" }}>
                                {new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </td>
                              <td style={{ padding: "13px 16px" }}><StatusBadge status={p.status} /></td>
                              <td style={{ padding: "13px 16px" }}>
                                <button onClick={() => navigate("/student/dashboard")}
                                  style={{ background: "#f59e0b", color: "white", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                                  <Zap size={12} /> Pay Now
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Services not yet bought */}
                {unpaidServices.length > 0 && (
                  <div>
                    <h3 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                      <Lock size={18} color="#ef4444" /> Unpurchased Plans
                      <span style={{ background: "#fee2e2", color: "#ef4444", borderRadius: 20, padding: "2px 9px", fontSize: "0.75rem", fontWeight: 800 }}>
                        {unpaidServices.length}
                      </span>
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
                      {unpaidServices.map(svc => (
                        <motion.div key={svc.id} whileHover={{ y: -3 }}
                          style={{ background: "white", borderRadius: 18, border: "1.5px solid #fecaca", padding: "20px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                              <h4 style={{ margin: "0 0 3px", fontWeight: 800, color: "#0f172a" }}>{svc.name}</h4>
                              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>{svc.description}</p>
                            </div>
                            <Lock size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                            {svc.original_price && (
                              <span style={{ fontSize: "0.82rem", color: "#94a3b8", textDecoration: "line-through" }}>
                                ₹{parseFloat(svc.original_price).toLocaleString("en-IN")}
                              </span>
                            )}
                            <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ef4444" }}>
                              ₹{parseFloat(svc.price).toLocaleString("en-IN")}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>/ {svc.validity_days}d</span>
                          </div>
                          <button onClick={() => navigate("/student/dashboard")}
                            style={{ width: "100%", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", border: "none", borderRadius: 11, padding: "11px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <Zap size={15} /> Unlock Now
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingPayments.length === 0 && unpaidServices.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
                    <CheckCircle size={48} color="#16a34a" style={{ marginBottom: 12 }} />
                    <h3 style={{ margin: "0 0 8px", color: "#16a34a", fontWeight: 800 }}>Sab clear hai! 🎉</h3>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.88rem" }}>Koi pending ya remaining payment nahi hai.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <style>{`
        @keyframes pulse-bg { 0%,100%{opacity:1} 50%{opacity:0.5} }
        table tr { transition: background 0.15s; }
      `}</style>
    </div>
  );
}
