import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Wallet, ShoppingBag, CheckCircle, Clock, Download,
  IndianRupee, BookOpen, FlaskConical, Home, Bus, Library,
  Settings, Lock, Unlock, FileText
} from "lucide-react";
import RazorpayCheckout from "../../components/RazorpayCheckout";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access");

const SERVICE_ICONS = {
  exam: FlaskConical, course: BookOpen, hostel: Home,
  transport: Bus, library: Library, custom: Settings,
};

function generateStudentInvoicePDF(payment) {
  const doc = new jsPDF();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INVOICE", 105, 18, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Shiv Adda — Education Platform", 105, 30, { align: "center" });

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.text(`Invoice No: ${payment.invoice_number}`, 14, 55);
  doc.text(`Date: ${new Date(payment.paid_at || payment.created_at).toLocaleDateString("en-IN")}`, 14, 63);
  doc.text(`Status: ${payment.status.toUpperCase()}`, 14, 71);

  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 14, 85);
  doc.setFont("helvetica", "normal");
  doc.text(payment.user_name || user.name || "—", 14, 93);
  doc.text(payment.user_email || user.email || "—", 14, 101);

  autoTable(doc, {
    startY: 115,
    head: [["Service", "Base Amount", "GST", "Total"]],
    body: [[
      payment.service_name_snapshot,
      `INR ${parseFloat(payment.base_amount).toFixed(2)}`,
      `INR ${parseFloat(payment.gst_amount).toFixed(2)}`,
      `INR ${parseFloat(payment.total_amount).toFixed(2)}`,
    ]],
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 11 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Total Paid: INR ${parseFloat(payment.total_amount).toFixed(2)}`, 14, finalY);

  if (payment.razorpay_payment_id) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Transaction ID: ${payment.razorpay_payment_id}`, 14, finalY + 10);
  }

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("This is a system-generated invoice. No signature required.", 105, 285, { align: "center" });

  doc.save(`Invoice-${payment.invoice_number}.pdf`);
}

export default function StudentAccount() {
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [access, setAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  const headers = { Authorization: `Bearer ${token()}` };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [svcRes, payRes, accRes] = await Promise.all([
        axios.get(`${API}/api/payments/services/`, { headers }),
        axios.get(`${API}/api/payments/my-payments/`, { headers }),
        axios.get(`${API}/api/payments/my-access/`, { headers }),
      ]);
      setServices(svcRes.data);
      setPayments(payRes.data);
      setAccess(accRes.data);
    } catch {
      toast.error("Failed to load account data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const hasAccess = (serviceId) => access.some(a => a.service === serviceId && a.is_valid);

  const totalSpent = payments.filter(p => p.status === "paid")
    .reduce((s, p) => s + parseFloat(p.total_amount), 0);

  const TABS = [
    { id: "services", label: "Available Services", icon: ShoppingBag },
    { id: "history", label: "Payment History", icon: FileText },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        <p className="text-gray-500 text-sm mt-1">View services, make payments & download invoices.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Paid", value: `₹${totalSpent.toFixed(2)}`, icon: IndianRupee, color: "indigo" },
          { label: "Payments Made", value: payments.filter(p => p.status === "paid").length, icon: CheckCircle, color: "green" },
          { label: "Pending", value: payments.filter(p => p.status === "pending").length, icon: Clock, color: "amber" },
          { label: "Active Services", value: access.filter(a => a.is_valid).length, icon: Unlock, color: "blue" },
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Available Services */}
          {tab === "services" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.length === 0 ? (
                <p className="text-gray-400 col-span-3 text-center py-10">No services available.</p>
              ) : services.map(svc => {
                const Icon = SERVICE_ICONS[svc.service_type] || Settings;
                const unlocked = hasAccess(svc.id);
                return (
                  <div key={svc.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition hover:shadow-md ${unlocked ? "border-green-200" : ""}`}>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${unlocked ? "bg-green-50" : "bg-indigo-50"}`}>
                          <Icon size={22} className={unlocked ? "text-green-600" : "text-indigo-600"} />
                        </div>
                        {unlocked ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                            <Unlock size={11} /> Access Granted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                            <Lock size={11} /> Locked
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-800">{svc.name}</h3>
                      {svc.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{svc.description}</p>}

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-indigo-600">₹{svc.total_price}</p>
                          {parseFloat(svc.gst_percentage) > 0 && (
                            <p className="text-xs text-gray-400">incl. {svc.gst_percentage}% GST</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{svc.validity_days} days access</p>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      {unlocked ? (
                        <div className="w-full text-center py-2.5 bg-green-50 text-green-700 font-semibold rounded-xl text-sm">
                          ✓ You have access
                        </div>
                      ) : svc.is_chargeable ? (
                        <button onClick={() => setSelectedService(svc)}
                          className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-sm">
                          Pay & Get Access
                        </button>
                      ) : (
                        <button className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm">
                          Free — Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment History */}
          {tab === "history" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-800">Transaction History</h2>
                <span className="text-sm text-gray-400">{payments.length} records</span>
              </div>
              {payments.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Wallet size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No payments yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {payments.map(p => (
                    <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === "paid" ? "bg-green-50" : "bg-amber-50"}`}>
                          {p.status === "paid" ? <CheckCircle size={18} className="text-green-600" /> : <Clock size={18} className="text-amber-500" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{p.service_name_snapshot}</p>
                          <p className="text-xs text-gray-400">{p.invoice_number} · {new Date(p.created_at).toLocaleDateString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-800">₹{parseFloat(p.total_amount).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "paid" ? "bg-green-100 text-green-700" : p.status === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                            {p.status}
                          </span>
                        </div>
                        {p.status === "paid" && (
                          <button onClick={() => generateStudentInvoicePDF(p)}
                            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                            <Download size={14} /> Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Razorpay Checkout Modal */}
      {selectedService && (
        <RazorpayCheckout
          service={selectedService}
          onSuccess={() => { setSelectedService(null); fetchAll(); }}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
