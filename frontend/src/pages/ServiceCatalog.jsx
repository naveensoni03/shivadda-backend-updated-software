import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BookOpen, FlaskConical, Home, Bus, Library, Settings,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, IndianRupee, X
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access");

const SERVICE_ICONS = {
  exam: FlaskConical, course: BookOpen, hostel: Home,
  transport: Bus, library: Library, custom: Settings,
};

const SERVICE_TYPE_LABELS = {
  exam: "Exam Access", course: "Course Access", hostel: "Hostel Fee",
  transport: "Transport Fee", library: "Library Access", custom: "Custom",
};

const EMPTY_FORM = {
  name: "", description: "", service_type: "custom",
  price: "", gst_percentage: "0", is_chargeable: true,
  is_active: true, validity_days: "365", icon: "BookOpen",
};

export default function ServiceCatalog() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/payments/services/`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setServices(data);
    } catch {
      toast.error("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (svc) => {
    setEditItem(svc);
    setForm({
      name: svc.name, description: svc.description || "",
      service_type: svc.service_type, price: svc.price,
      gst_percentage: svc.gst_percentage, is_chargeable: svc.is_chargeable,
      is_active: svc.is_active, validity_days: svc.validity_days, icon: svc.icon,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error("Name and Price are required.");
    setSaving(true);
    try {
      if (editItem) {
        await axios.put(`${API}/api/payments/services/${editItem.id}/`, form, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        toast.success("Service updated!");
      } else {
        await axios.post(`${API}/api/payments/services/`, form, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        toast.success("Service created!");
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (svc) => {
    try {
      const { data } = await axios.post(
        `${API}/api/payments/services/${svc.id}/toggle/`, {},
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      toast.success(data.message);
      fetchServices();
    } catch {
      toast.error("Toggle failed.");
    }
  };

  const handleDelete = async (svc) => {
    if (!confirm(`Delete "${svc.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/api/payments/services/${svc.id}/`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      toast.success("Service deleted.");
      fetchServices();
    } catch {
      toast.error("Delete failed.");
    }
  };

  const totalRevenue = services.reduce((s, sv) => s + parseFloat(sv.price || 0), 0);
  const activeCount = services.filter(s => s.is_active).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Service Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">Manage chargeable services — students pay to access these.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
          <Plus size={18} /> Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: services.length, color: "indigo" },
          { label: "Active", value: activeCount, color: "green" },
          { label: "Inactive", value: services.length - activeCount, color: "red" },
          { label: "Avg Price", value: services.length ? `₹${(totalRevenue / services.length).toFixed(0)}` : "₹0", color: "amber" },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-600 mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Service Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Settings size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No services yet. Click "Add Service" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(svc => {
            const Icon = SERVICE_ICONS[svc.service_type] || Settings;
            return (
              <div key={svc.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition hover:shadow-md ${!svc.is_active ? "opacity-60" : ""}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50`}>
                      <Icon size={20} className="text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${svc.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {svc.is_active ? "Active" : "Inactive"}
                      </span>
                      {!svc.is_chargeable && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">Free</span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-800 text-base">{svc.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{SERVICE_TYPE_LABELS[svc.service_type]}</p>
                  {svc.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{svc.description}</p>}

                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Base Price</p>
                      <p className="font-bold text-gray-800 flex items-center gap-0.5"><IndianRupee size={13} />{svc.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Total (incl. GST)</p>
                      <p className="font-bold text-indigo-600 flex items-center gap-0.5"><IndianRupee size={13} />{svc.total_price}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">GST</p>
                      <p className="font-medium text-gray-700">{svc.gst_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Validity</p>
                      <p className="font-medium text-gray-700">{svc.validity_days} days</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                  <button onClick={() => handleToggle(svc)} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-gray-600 hover:bg-gray-50 transition">
                    {svc.is_active ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
                    {svc.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => openEdit(svc)} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-indigo-600 hover:bg-indigo-50 transition">
                    <Pencil size={15} /> Edit
                  </button>
                  <button onClick={() => handleDelete(svc)} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm text-red-500 hover:bg-red-50 transition">
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? "Edit Service" : "Create Service"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Service Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Exam Access — Batch A" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Service Type *</label>
                  <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    {Object.entries(SERVICE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Validity (days)</label>
                  <input type="number" value={form.validity_days} onChange={e => setForm({ ...form, validity_days: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">GST (%)</label>
                  <input type="number" value={form.gst_percentage} onChange={e => setForm({ ...form, gst_percentage: e.target.value })}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="What does this service include?" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Chargeable</label>
                  <input type="checkbox" checked={form.is_chargeable} onChange={e => setForm({ ...form, is_chargeable: e.target.checked })} className="w-4 h-4 accent-indigo-600" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Active</label>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-indigo-600" />
                </div>
              </div>

              {form.price && (
                <div className="bg-indigo-50 rounded-xl p-3 text-sm">
                  <p className="text-indigo-800 font-medium">Price Preview</p>
                  <p className="text-gray-600">Base: ₹{form.price} + GST {form.gst_percentage}% = <strong className="text-indigo-700">₹{(parseFloat(form.price || 0) * (1 + parseFloat(form.gst_percentage || 0) / 100)).toFixed(2)}</strong></p>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 rounded-xl py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 font-bold hover:bg-indigo-700 transition disabled:opacity-60">
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
