import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, IndianRupee, Users, CheckCircle, Clock, Filter } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access");

const StatusBadge = ({ value }) => {
  const colors = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[value] || "bg-gray-100 text-gray-500"}`}>
      {value}
    </span>
  );
};

const AmountCell = ({ value }) => (
  <span className="font-bold text-indigo-700">₹{parseFloat(value || 0).toFixed(2)}</span>
);

const DateCell = ({ value }) => (
  <span className="text-gray-500 text-sm">
    {value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
  </span>
);

export default function PaymentAccounts() {
  const gridRef = useRef();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", service_type: "", from_date: "", to_date: "", search: "" });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await axios.get(`${API}/api/payments/admin/all-payments/`, {
        headers: { Authorization: `Bearer ${token()}` },
        params,
      });
      setPayments(data.payments || []);
      setSummary(data.summary || {});
    } catch {
      toast.error("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const colDefs = [
    { field: "invoice_number", headerName: "Invoice", width: 160, pinned: "left", cellStyle: { fontWeight: 600, color: "#4F46E5" } },
    { field: "user_name", headerName: "Student Name", flex: 1, minWidth: 150 },
    { field: "user_email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "student_roll", headerName: "Roll No", width: 110 },
    { field: "service_name_snapshot", headerName: "Service", flex: 1, minWidth: 160 },
    { field: "service_type_snapshot", headerName: "Type", width: 130 },
    { field: "base_amount", headerName: "Base (₹)", width: 110, cellRenderer: AmountCell },
    { field: "gst_amount", headerName: "GST (₹)", width: 100, cellRenderer: AmountCell },
    { field: "total_amount", headerName: "Total (₹)", width: 120, cellRenderer: AmountCell, sort: "desc" },
    { field: "status", headerName: "Status", width: 110, cellRenderer: StatusBadge },
    { field: "payment_method", headerName: "Method", width: 110 },
    { field: "razorpay_payment_id", headerName: "Razorpay ID", width: 200, cellStyle: { fontSize: "11px", color: "#888" } },
    { field: "paid_at", headerName: "Paid On", width: 140, cellRenderer: DateCell },
    { field: "created_at", headerName: "Created", width: 140, cellRenderer: DateCell },
  ];

  const defaultColDef = {
    sortable: true, filter: true, resizable: true,
    suppressMovable: false, floatingFilter: true,
  };

  const exportCSV = () => {
    gridRef.current?.api.exportDataAsCsv({ fileName: "student_payments.csv" });
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 297, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Student Payment Accounts Report", 148, 15, { align: "center" });

    const rows = payments.map(p => [
      p.invoice_number, p.user_name, p.user_email,
      p.service_name_snapshot, `₹${parseFloat(p.total_amount).toFixed(2)}`,
      p.status, p.payment_method || "—",
      p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN") : "—",
    ]);

    autoTable(doc, {
      startY: 32,
      head: [["Invoice", "Student", "Email", "Service", "Amount", "Status", "Method", "Paid On"]],
      body: rows,
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 8 },
    });

    doc.save(`payment-accounts-${Date.now()}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Complete visibility of all student payments. Filter, search & export.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <Download size={15} /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            <Download size={15} /> PDF Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${parseFloat(summary.total_revenue || 0).toFixed(2)}`, icon: IndianRupee, color: "indigo" },
          { label: "Paid Transactions", value: summary.total_paid || 0, icon: CheckCircle, color: "green" },
          { label: "Pending", value: summary.total_pending || 0, icon: Clock, color: "amber" },
          { label: "Total Records", value: summary.total_records || 0, icon: Users, color: "blue" },
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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
          <Filter size={15} /> Filters
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            placeholder="Search name, email, invoice..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none col-span-2 md:col-span-2"
          />
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <input type="date" value={filters.from_date} onChange={e => setFilters({ ...filters, from_date: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          <input type="date" value={filters.to_date} onChange={e => setFilters({ ...filters, to_date: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>
      </div>

      {/* AG Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="ag-theme-alpine" style={{ height: 520, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={payments}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="multiple"
            pagination={true}
            paginationPageSize={20}
            loading={loading}
            overlayLoadingTemplate='<span class="text-indigo-600 font-medium">Loading payments...</span>'
            overlayNoRowsTemplate='<span class="text-gray-400">No payment records found.</span>'
          />
        </div>
      </div>
    </div>
  );
}
