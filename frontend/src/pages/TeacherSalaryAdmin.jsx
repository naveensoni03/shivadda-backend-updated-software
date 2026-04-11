import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus, Download, Search, CheckCircle, Clock,
  IndianRupee, Users, X, Eye, ShieldCheck
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access");

const PAYMENT_MODES = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
];

const EMPTY_FORM = {
  teacher: "", month: "", salary_amount: "",
  bonus: "0", deductions: "0", payment_mode: "bank_transfer",
  transaction_reference: "", notes: "",
};

export default function TeacherSalaryAdmin() {
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const headers = { Authorization: `Bearer ${token()}` };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/payments/teacher-salary/`, { headers });
      setPayments(data);
    } catch { toast.error("Failed to load salary records."); }
    finally { setLoading(false); }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await axios.get(`${API}/api/teachers/`, { headers });
      setTeachers(data);
    } catch {}
  };

  useEffect(() => { fetchPayments(); fetchTeachers(); }, []);

  const openBankDetails = async (teacherId) => {
    setBankDetails(null);
    setShowBankModal(teacherId);
    try {
      const { data } = await axios.get(`${API}/api/payments/admin/teacher/${teacherId}/bank/`, { headers });
      setBankDetails(data);
    } catch { setBankDetails({}); }
  };

  const toggleVerify = async (teacherId) => {
    try {
      await axios.patch(`${API}/api/payments/admin/teacher/${teacherId}/bank/`, {}, { headers });
      toast.success("Verification status updated.");
      openBankDetails(teacherId);
    } catch { toast.error("Failed."); }
  };

  const handleCreate = async () => {
    if (!form.teacher || !form.month || !form.salary_amount) {
      return toast.error("Teacher, Month and Salary are required.");
    }
    setSaving(true);
    try {
      await axios.post(`${API}/api/payments/teacher-salary/`, form, { headers });
      toast.success("Salary payment recorded!");
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save.");
    } finally { setSaving(false); }
  };

  const generateSalaryPDF = (p) => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("SALARY SLIP", 105, 16, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Shiv Adda — Education Platform", 105, 28, { align: "center" });

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.text(`Invoice No: ${p.invoice_number}`, 14, 52);
    doc.text(`Month: ${p.month}`, 14, 60);
    doc.text(`Payment Date: ${p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN") : "—"}`, 14, 68);
    doc.text(`Status: ${p.status?.toUpperCase()}`, 14, 76);

    doc.setFont("helvetica", "bold");
    doc.text("Employee Details:", 14, 90);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${p.teacher_name}`, 14, 98);
    doc.text(`Employee ID: ${p.teacher_employee_id}`, 14, 106);

    if (p.bank_name) {
      doc.setFont("helvetica", "bold");
      doc.text("Bank Details:", 14, 118);
      doc.setFont("helvetica", "normal");
      doc.text(`Bank: ${p.bank_name}`, 14, 126);
      doc.text(`IFSC: ${p.ifsc_code}`, 14, 134);
      doc.text(`Account Holder: ${p.account_holder_name}`, 14, 142);
    }

    autoTable(doc, {
      startY: 155,
      head: [["Component", "Amount (₹)"]],
      body: [
        ["Basic Salary", parseFloat(p.salary_amount).toFixed(2)],
        ["Bonus", parseFloat(p.bonus || 0).toFixed(2)],
        ["Deductions", `-${parseFloat(p.deductions || 0).toFixed(2)}`],
        ["Net Salary", parseFloat(p.net_amount).toFixed(2)],
      ],
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 11 },
      bodyStyles: (row) => row.index === 3 ? { fontStyle: "bold" } : {},
    });

    if (p.transaction_reference) {
      const y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Transaction Ref: ${p.transaction_reference}`, 14, y);
    }

    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text("This is a system-generated salary slip. No signature required.", 105, 285, { align: "center" });
    doc.save(`Salary-${p.invoice_number}.pdf`);
  };

  const selectedTeacher = teachers.find(t => String(t.id) === String(form.teacher));
  const netPreview = (parseFloat(form.salary_amount || 0) + parseFloat(form.bonus || 0) - parseFloat(form.deductions || 0)).toFixed(2);

  const filtered = payments.filter(p =>
    p.teacher_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.month?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + parseFloat(p.net_amount), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Salary Management</h1>
          <p className="text-gray-500 text-sm mt-1">Record salary payments, verify bank details & generate salary slips.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
          <Plus size={18} /> Pay Salary
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Paid Out", value: `₹${totalPaid.toFixed(2)}`, icon: IndianRupee, color: "indigo" },
          { label: "Records", value: payments.length, icon: Users, color: "blue" },
          { label: "Paid", value: payments.filter(p => p.status === "paid").length, icon: CheckCircle, color: "green" },
          { label: "Pending", value: payments.filter(p => p.status === "pending").length, icon: Clock, color: "amber" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${c.color}-50 flex items-center justify-center`}>
                <Icon size={18} className={`text-${c.color}-600`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className={`text-xl font-bold text-${c.color}-600`}>{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by teacher, month, invoice..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Invoice", "Teacher", "Employee ID", "Month", "Salary", "Bonus", "Deductions", "Net Pay", "Mode", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={11} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400">No salary records found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-indigo-600 text-xs font-semibold">{p.invoice_number}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{p.teacher_name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.teacher_employee_id}</td>
                  <td className="px-4 py-3 text-gray-700">{p.month}</td>
                  <td className="px-4 py-3 font-medium">₹{parseFloat(p.salary_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-green-600">+₹{parseFloat(p.bonus || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-red-500">-₹{parseFloat(p.deductions || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-indigo-700">₹{parseFloat(p.net_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{p.payment_mode?.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === "paid" ? "bg-green-100 text-green-700" : p.status === "hold" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openBankDetails(p.teacher)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition" title="View Bank Details">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => generateSalaryPDF(p)}
                        className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 transition" title="Download Slip">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Record Salary Payment</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Select Teacher *</label>
                <select value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value, salary_amount: teachers.find(t => String(t.id) === e.target.value)?.salary || "" })}
                  className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">-- Select --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.employee_id})</option>)}
                </select>
              </div>

              {selectedTeacher && (
                <div className="bg-indigo-50 rounded-xl p-3 text-sm text-indigo-800">
                  Salary on record: <strong>₹{selectedTeacher.salary}</strong>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Month *</label>
                  <input value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} placeholder="e.g. April 2026"
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Salary Amount (₹) *</label>
                  <input type="number" value={form.salary_amount} onChange={e => setForm({ ...form, salary_amount: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Bonus (₹)</label>
                  <input type="number" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Deductions (₹)</label>
                  <input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Mode</label>
                  <select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Transaction Ref / UTR</label>
                  <input value={form.transaction_reference} onChange={e => setForm({ ...form, transaction_reference: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="UTR / Cheque No / UPI Ref" />
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-3 text-sm">
                <p className="text-green-800 font-semibold">Net Pay Preview</p>
                <p className="text-2xl font-bold text-green-700 mt-1">₹{netPreview}</p>
                <p className="text-xs text-green-600 mt-0.5">= ₹{form.salary_amount || 0} + ₹{form.bonus || 0} - ₹{form.deductions || 0}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 rounded-xl py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 font-bold hover:bg-indigo-700 transition disabled:opacity-60">
                {saving ? "Saving..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Bank Details</h2>
              <button onClick={() => setShowBankModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6">
              {!bankDetails ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : Object.keys(bankDetails).length === 0 ? (
                <div className="text-center py-8 text-gray-400">No bank details submitted by teacher.</div>
              ) : (
                <div className="space-y-3">
                  {[
                    ["Account Holder", bankDetails.account_holder_name],
                    ["Bank Name", bankDetails.bank_name],
                    ["Account Number", bankDetails.account_number],
                    ["IFSC Code", bankDetails.ifsc_code],
                    ["Branch", bankDetails.branch_name || "—"],
                    ["Account Type", bankDetails.account_type],
                    ["UPI ID", bankDetails.upi_id || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className="text-sm font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-500">Verified by Admin</span>
                    <button onClick={() => toggleVerify(showBankModal)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${bankDetails.is_verified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      <ShieldCheck size={14} />
                      {bankDetails.is_verified ? "Verified ✓" : "Mark Verified"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
