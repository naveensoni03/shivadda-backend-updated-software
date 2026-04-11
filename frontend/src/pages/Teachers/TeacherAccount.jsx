import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Wallet, Building2, Download, CheckCircle,
  Clock, IndianRupee, ShieldCheck, Save
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access");

const EMPTY_BANK = {
  account_holder_name: "", account_number: "", ifsc_code: "",
  bank_name: "", branch_name: "", account_type: "savings", upi_id: "",
};

function generateSalarySlipPDF(p) {
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
  doc.text(`Invoice: ${p.invoice_number}`, 14, 52);
  doc.text(`Month: ${p.month}`, 14, 60);
  doc.text(`Date: ${p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN") : "—"}`, 14, 68);

  doc.setFont("helvetica", "bold");
  doc.text("Employee:", 14, 82);
  doc.setFont("helvetica", "normal");
  doc.text(p.teacher_name || "—", 14, 90);
  doc.text(`Employee ID: ${p.teacher_employee_id || "—"}`, 14, 98);

  autoTable(doc, {
    startY: 112,
    head: [["Component", "Amount (₹)"]],
    body: [
      ["Basic Salary", parseFloat(p.salary_amount || 0).toFixed(2)],
      ["Bonus", parseFloat(p.bonus || 0).toFixed(2)],
      ["Deductions", `-${parseFloat(p.deductions || 0).toFixed(2)}`],
      ["Net Salary", parseFloat(p.net_amount || 0).toFixed(2)],
    ],
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 11 },
  });

  const y = doc.lastAutoTable.finalY + 10;
  if (p.transaction_reference) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Ref: ${p.transaction_reference}`, 14, y);
  }

  doc.setFontSize(8);
  doc.setTextColor(160);
  doc.text("System-generated salary slip. No signature required.", 105, 285, { align: "center" });
  doc.save(`SalarySlip-${p.invoice_number}.pdf`);
}

export default function TeacherAccount() {
  const [tab, setTab] = useState("salary");
  const [salaries, setSalaries] = useState([]);
  const [bankForm, setBankForm] = useState(EMPTY_BANK);
  const [bankExists, setBankExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token()}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salRes, bankRes] = await Promise.all([
        axios.get(`${API}/api/payments/teacher-salary/`, { headers }),
        axios.get(`${API}/api/payments/teacher/bank-details/`, { headers }),
      ]);
      setSalaries(salRes.data);
      if (bankRes.data && bankRes.data.id) {
        setBankForm({
          account_holder_name: bankRes.data.account_holder_name || "",
          account_number: bankRes.data.account_number || "",
          ifsc_code: bankRes.data.ifsc_code || "",
          bank_name: bankRes.data.bank_name || "",
          branch_name: bankRes.data.branch_name || "",
          account_type: bankRes.data.account_type || "savings",
          upi_id: bankRes.data.upi_id || "",
        });
        setBankExists(true);
      }
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const saveBankDetails = async () => {
    if (!bankForm.account_holder_name || !bankForm.account_number || !bankForm.ifsc_code || !bankForm.bank_name) {
      return toast.error("Account holder name, account number, IFSC and bank name are required.");
    }
    setSaving(true);
    try {
      await axios.post(`${API}/api/payments/teacher/bank-details/`, bankForm, { headers });
      toast.success("Bank details saved successfully!");
      setBankExists(true);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save bank details.");
    } finally {
      setSaving(false);
    }
  };

  const totalReceived = salaries.filter(s => s.status === "paid")
    .reduce((sum, s) => sum + parseFloat(s.net_amount || 0), 0);

  const TABS = [
    { id: "salary", label: "Salary History", icon: Wallet },
    { id: "bank", label: "Bank Details", icon: Building2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        <p className="text-gray-500 text-sm mt-1">View salary history, manage bank details & download salary slips.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Received", value: `₹${totalReceived.toFixed(2)}`, icon: IndianRupee, color: "indigo" },
          { label: "Payments", value: salaries.filter(s => s.status === "paid").length, icon: CheckCircle, color: "green" },
          { label: "Pending", value: salaries.filter(s => s.status !== "paid").length, icon: Clock, color: "amber" },
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Salary History */}
      {tab === "salary" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Salary History</h2>
            <span className="text-sm text-gray-400">{salaries.length} records</span>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : salaries.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Wallet size={40} className="mx-auto mb-3 opacity-30" />
              <p>No salary records yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {salaries.map(p => (
                <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === "paid" ? "bg-green-50" : "bg-amber-50"}`}>
                        {p.status === "paid" ? <CheckCircle size={18} className="text-green-600" /> : <Clock size={18} className="text-amber-500" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{p.month}</p>
                        <p className="text-xs text-gray-400">{p.invoice_number}</p>
                        <p className="text-xs text-gray-400 capitalize">{p.payment_mode?.replace("_", " ")}
                          {p.transaction_reference && ` · Ref: ${p.transaction_reference}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>₹{parseFloat(p.salary_amount).toFixed(2)}</span>
                          {parseFloat(p.bonus) > 0 && <span className="text-green-600">+₹{parseFloat(p.bonus).toFixed(2)}</span>}
                          {parseFloat(p.deductions) > 0 && <span className="text-red-500">-₹{parseFloat(p.deductions).toFixed(2)}</span>}
                        </div>
                        <p className="text-lg font-bold text-indigo-700">₹{parseFloat(p.net_amount).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {p.status}
                        </span>
                      </div>
                      {p.status === "paid" && (
                        <button onClick={() => generateSalarySlipPDF(p)}
                          className="flex items-center gap-1.5 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
                          <Download size={14} /> Slip
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bank Details */}
      {tab === "bank" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Bank Account Details</h2>
            {bankExists && (
              <span className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                <ShieldCheck size={12} /> Saved
              </span>
            )}
          </div>
          <div className="p-6">
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              ⚠️ Please fill in accurate bank details. Admin will use these to process your salary payment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Account Holder Name *", key: "account_holder_name", placeholder: "As per bank records" },
                { label: "Bank Name *", key: "bank_name", placeholder: "e.g. State Bank of India" },
                { label: "Account Number *", key: "account_number", placeholder: "Enter full account number" },
                { label: "IFSC Code *", key: "ifsc_code", placeholder: "e.g. SBIN0001234" },
                { label: "Branch Name", key: "branch_name", placeholder: "e.g. Main Branch, Pune" },
                { label: "UPI ID (Optional)", key: "upi_id", placeholder: "e.g. name@upi" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  <input value={bankForm[field.key]} onChange={e => setBankForm({ ...bankForm, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700">Account Type</label>
                <select value={bankForm.account_type} onChange={e => setBankForm({ ...bankForm, account_type: e.target.value })}
                  className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>
            </div>
            <button onClick={saveBankDetails} disabled={saving}
              className="mt-6 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-60">
              <Save size={16} />
              {saving ? "Saving..." : bankExists ? "Update Bank Details" : "Save Bank Details"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
