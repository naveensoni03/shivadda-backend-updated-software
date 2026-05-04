import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, CheckCircle, XCircle, Eye, Users,
  FileText, ChevronLeft, ChevronRight, MapPin, Briefcase,
  Settings, CreditCard, Plus, ShieldCheck, AlertCircle, Loader2, X,
  Landmark, Receipt, UserCog, Mail, Phone, Calendar, DownloadCloud, Send
} from "lucide-react";

// 🎨 ULTRA PREMIUM LIGHT THEME
const THEME = {
  bg: '#F8FAFC',
  primary: '#6366F1',
  primaryLight: '#EEF2FF',
  textMain: '#0F172A',
  textMuted: '#64748B',
  cardBg: '#FFFFFF',
  borderLight: '#E2E8F0',
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
};

// --- Clean & Crisp Badges ---
const StatusBadge = ({ value }) => {
  const isPaid = value?.toLowerCase() === "paid";
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: '0.75rem', fontWeight: '800',
      color: isPaid ? '#10B981' : '#EF4444', textTransform: 'uppercase', letterSpacing: '0.5px'
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPaid ? '#10B981' : '#EF4444', boxShadow: `0 0 6px ${isPaid ? '#10B981' : '#EF4444'}` }}></span>
      {value || "Unpaid"}
    </span>
  );
};

const RoleBadge = ({ value }) => {
  const isStudent = value?.toLowerCase() === "student";
  return (
    <span style={{
      background: isStudent ? '#EEF2FF' : '#FDF2F8',
      color: isStudent ? '#4F46E5' : '#EC4899',
      padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem',
      fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase'
    }}>
      {value}
    </span>
  );
};

export default function PaymentAccounts() {
  // States
  const [toast, setToast] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null); // 🔥 Profile Modal State

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock Data
  const [rowData] = useState([
    { id: "USR-001", name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 98765 43210", joined: "12 Jan 2026", role: "Student", location: "Jaipur", service: "Full Course", status: "Paid", amount: "₹4,999" },
    { id: "USR-002", name: "Priya Singh", email: "priya.singh@example.com", phone: "+91 87654 32109", joined: "05 Feb 2026", role: "Student", location: "Delhi", service: "Live Classes", status: "Unpaid", amount: "₹2,999" },
    { id: "USR-003", name: "Amit Verma", email: "amit.verma@institute.com", phone: "+91 76543 21098", joined: "20 Nov 2025", role: "Teacher", location: "Mumbai", service: "Math Faculty", status: "Paid", amount: "₹45,000" },
    { id: "USR-004", name: "Neha Gupta", email: "neha.g@example.com", phone: "+91 65432 10987", joined: "18 Mar 2026", role: "Student", location: "Jaipur", service: "Exam Access", status: "Paid", amount: "₹999" },
    { id: "USR-005", name: "Vikas Kumar", email: "vikas.k@example.com", phone: "+91 54321 09876", joined: "02 Apr 2026", role: "Student", location: "Pune", service: "Previous Lectures", status: "Unpaid", amount: "₹1,499" },
  ]);

  // Dynamic Filter
  const filteredData = useMemo(() => {
    return rowData.filter(row => {
      const matchSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase()) || row.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLocation = locationFilter ? row.location.toLowerCase() === locationFilter.toLowerCase() : true;
      const matchService = serviceFilter ? row.service.toLowerCase() === serviceFilter.toLowerCase() : true;
      const matchStatus = statusFilter ? row.status.toLowerCase() === statusFilter.toLowerCase() : true;
      return matchSearch && matchLocation && matchService && matchStatus;
    });
  }, [rowData, searchQuery, locationFilter, serviceFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const paginatedData = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  const triggerToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🚀 ASLI BACKEND API CALL (Dummy mapped for UI display)
  const handlePayTeachers = async () => {
    setIsPaying(true);
    setTimeout(() => {
      triggerToast("Success! Teacher Salary has been processed.", "success");
      setIsPaying(false);
    }, 1500);
  };

  return (
    <div style={{ display: "flex", background: THEME.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: THEME.textMain }}>

      <div className="hide-scrollbar" style={{ flex: 1, padding: "30px 40px", display: "flex", flexDirection: "column", height: "100vh", overflowY: 'auto' }}>

        {/* 🚀 TOAST NOTIFICATION */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-bold border backdrop-blur-md ${toast.type === "error" ? "bg-white/90 text-rose-600 border-rose-100" :
                  toast.type === "info" ? "bg-slate-900/90 text-white border-slate-800" :
                    "bg-white/90 text-emerald-600 border-emerald-100"
                }`}
            >
              {toast.type === "error" ? <AlertCircle size={18} /> : toast.type === "info" ? <ShieldCheck size={18} /> : <CheckCircle size={18} />}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🚀 SETTINGS / ADD USER MODALS */}
        <AnimatePresence>
          {activeModal && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', padding: '20px' }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
              >
                <div style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontWeight: '800', color: THEME.textMain, fontSize: '1.2rem' }}>
                    {activeModal === 'pricing' ? 'Pricing & Settings' : 'Add New User'}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="close-btn"><X size={20} /></button>
                </div>
                <div style={{ padding: '24px' }}>
                  {activeModal === 'pricing' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: THEME.textMuted }}>Configure global pricing rules and payment gateway settings here.</p>
                      <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E0E7FF', background: '#EEF2FF', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Settings color={THEME.primary} size={24} />
                        <span style={{ fontWeight: '700', color: '#312E81' }}>Gateway Active (Live Mode)</span>
                      </div>
                      <button onClick={() => { setActiveModal(null); triggerToast("Settings saved successfully!"); }} className="modal-primary-btn">Save Configurations</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <input className="clean-modal-input" placeholder="Full Name" />
                      <input className="clean-modal-input" placeholder="Email Address" />
                      <select className="clean-modal-input" style={{ cursor: 'pointer' }}>
                        <option>Assign Role: Student</option>
                        <option>Assign Role: Teacher</option>
                      </select>
                      <button onClick={() => { setActiveModal(null); triggerToast("User added successfully!"); }} className="modal-primary-btn">Create User</button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 🔥 ULTRA PREMIUM USER PROFILE MODAL */}
        <AnimatePresence>
          {selectedUserProfile && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', padding: '20px' }}>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ background: 'white', width: '100%', maxWidth: '750px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}
              >
                {/* Header */}
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#EEF2FF', padding: '8px', borderRadius: '10px' }}><UserCog size={20} color={THEME.primary} /></div>
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.2rem', color: THEME.textMain }}>Account Profile</h3>
                  </div>
                  <button onClick={() => setSelectedUserProfile(null)} className="close-btn"><X size={20} /></button>
                </div>

                {/* Body */}
                <div style={{ padding: '30px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

                  {/* Left Side: Avatar & Basic Info */}
                  <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', marginBottom: '16px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
                      {selectedUserProfile.name.charAt(0)}
                    </div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: '800', color: THEME.textMain }}>{selectedUserProfile.name}</h2>
                    <RoleBadge value={selectedUserProfile.role} />

                    <div style={{ width: '100%', height: '1px', background: '#E2E8F0', margin: '20px 0' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: THEME.textMuted, fontSize: '0.85rem', fontWeight: '500' }}>
                        <Mail size={16} /> {selectedUserProfile.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: THEME.textMuted, fontSize: '0.85rem', fontWeight: '500' }}>
                        <Phone size={16} /> {selectedUserProfile.phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: THEME.textMuted, fontSize: '0.85rem', fontWeight: '500' }}>
                        <Calendar size={16} /> Joined: {selectedUserProfile.joined}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Financial & Plan Details */}
                  <div style={{ flex: '2 1 350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Info Box 1 */}
                      <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: THEME.textMuted, marginBottom: '8px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                          <Briefcase size={16} /> Enrolled Plan
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: THEME.textMain }}>{selectedUserProfile.service}</div>
                        <div style={{ fontSize: '0.8rem', color: THEME.textMuted, marginTop: '4px' }}>Center: {selectedUserProfile.location}</div>
                      </div>

                      {/* Info Box 2 */}
                      <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: THEME.textMuted, marginBottom: '8px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                          <Landmark size={16} /> Plan Value
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: THEME.textMain, fontFamily: 'monospace' }}>{selectedUserProfile.amount}</div>
                        <div style={{ marginTop: '8px' }}>
                          <StatusBadge value={selectedUserProfile.status} />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons inside Modal */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                      <button onClick={() => triggerToast("Statement Downloaded", "success")} className="modal-action-btn secondary">
                        <DownloadCloud size={18} /> Download Statement
                      </button>
                      <button onClick={() => triggerToast("Reminder Sent to User", "info")} className="modal-action-btn primary">
                        <Send size={18} /> Send Reminder
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Header Area --- */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ background: THEME.primary, padding: '8px', borderRadius: '10px', color: 'white', display: 'flex', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                <Landmark size={24} />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: THEME.textMain, margin: 0, letterSpacing: '-0.5px' }}>
                Payment Accounts
              </h1>
            </div>
            <p style={{ color: THEME.textMuted, fontSize: '0.95rem', fontWeight: '500', margin: 0, paddingLeft: '44px' }}>Centralized control center for all transactions and salaries.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setActiveModal('pricing')} className="top-action-btn border-btn">
              <Settings size={16} /> Pricing Settings
            </button>
            <button onClick={handlePayTeachers} disabled={isPaying} className="top-action-btn primary-btn">
              {isPaying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              {isPaying ? "Processing..." : "Pay Teachers"}
            </button>
            <button onClick={() => setActiveModal('adduser')} className="top-action-btn dark-btn">
              <Plus size={16} /> Add User
            </button>
          </div>
        </motion.div>

        {/* --- Advanced Filters Section --- */}
        <div className="safe-filters" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '25px', background: THEME.cardBg, padding: '20px', borderRadius: '16px', border: `1px solid ${THEME.borderLight}`, boxShadow: THEME.shadow }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="filter-box" style={{ flex: 2 }}>
              <Search size={18} color={THEME.textMuted} />
              <input type="text" placeholder="Search users, IDs, or emails..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="clean-input" />
            </div>
            <div className="filter-box" style={{ flex: 1 }}>
              <MapPin size={18} color={THEME.textMuted} />
              <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }} className="clean-select">
                <option value="">All Locations</option>
                <option value="jaipur">Jaipur</option>
                <option value="delhi">Delhi</option>
                <option value="mumbai">Mumbai</option>
                <option value="pune">Pune</option>
              </select>
            </div>
            <div className="filter-box" style={{ flex: 1 }}>
              <Briefcase size={18} color={THEME.textMuted} />
              <select value={serviceFilter} onChange={(e) => { setServiceFilter(e.target.value); setCurrentPage(1); }} className="clean-select">
                <option value="">All Services</option>
                <option value="live classes">Live Classes</option>
                <option value="full course">Full Course</option>
                <option value="exam access">Exam Access</option>
              </select>
            </div>
            <div className="filter-box" style={{ flex: 1 }}>
              <FileText size={18} color={THEME.textMuted} />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="clean-select">
                <option value="">Any Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Table Data Area --- */}
        <div style={{ background: THEME.cardBg, borderRadius: '16px', border: `1px solid ${THEME.borderLight}`, boxShadow: THEME.shadow, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${THEME.borderLight}`, background: '#FFFFFF', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Displaying {filteredData.length} Records
            </span>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">User Name</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Service Plan</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header" style={{ textAlign: 'right', paddingRight: '30px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan="8" style={{ padding: '50px', textAlign: 'center', color: THEME.textMuted, fontWeight: '600' }}>No records match your filters.</td></tr>
                ) : (
                  paginatedData.map((user, idx) => (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="table-row">
                      <td style={{ padding: '18px 24px', fontWeight: '700', color: THEME.primary, fontSize: '0.85rem' }}>#{user.id}</td>
                      <td style={{ padding: '18px 24px', fontWeight: '700', color: THEME.textMain, fontSize: '0.95rem' }}>{user.name}</td>
                      <td style={{ padding: '18px 24px' }}><RoleBadge value={user.role} /></td>
                      <td style={{ padding: '18px 24px', color: THEME.textMuted, fontWeight: '500', fontSize: '0.9rem' }}>{user.location}</td>
                      <td style={{ padding: '18px 24px', color: THEME.textMuted, fontWeight: '500', fontSize: '0.9rem' }}>{user.service}</td>
                      <td style={{ padding: '18px 24px', fontWeight: '800', color: THEME.textMain, fontSize: '0.95rem', fontFamily: 'monospace' }}>{user.amount}</td>
                      <td style={{ padding: '18px 24px' }}><StatusBadge value={user.status} /></td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {/* 🔥 ICONS FIXED: Explicit size & padding to prevent CSS shrinking */}
                          <button onClick={() => setSelectedUserProfile(user)} className="icon-action-btn" title="View Profile" style={{ minWidth: '36px', minHeight: '36px' }}>
                            <UserCog size={18} />
                          </button>
                          <button onClick={() => triggerToast(`Invoice downloaded for ${user.name}`, 'success')} className="icon-action-btn invoice-btn" title="Download Invoice" style={{ minWidth: '36px', minHeight: '36px' }}>
                            <Receipt size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${THEME.borderLight}`, background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: THEME.textMuted }}>Page Size:</span>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }} className="pagination-select">
                <option value={10}>10</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: THEME.textMuted }}>
                Page {currentPage} of {totalPages} <span style={{ color: THEME.textMain, fontWeight: '800' }}>({filteredData.length} Total)</span>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="page-btn"><ChevronLeft size={18} /></button>
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="page-btn"><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 🔥 BULLETPROOF CSS */}
      <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                /* Filter Area Styling */
                .safe-filters .filter-box { display: flex; align-items: center; background: #F1F5F9; padding: 0 16px; border-radius: 12px; gap: 10px; transition: all 0.2s; border: 1px solid transparent; }
                .safe-filters .filter-box:focus-within { border-color: #6366F1; background: #ffffff; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
                .clean-input { border: none !important; background: transparent !important; padding: 14px 0 !important; width: 100% !important; outline: none !important; font-weight: 500 !important; font-size: 0.9rem !important; color: #0F172A !important; box-shadow: none !important; }
                .clean-select { border: none !important; background: transparent !important; padding: 14px 0 !important; width: 100% !important; outline: none !important; font-weight: 600 !important; font-size: 0.9rem !important; color: #0F172A !important; cursor: pointer !important; box-shadow: none !important; appearance: auto !important; }

                /* Top Action Buttons */
                .top-action-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; outline: none; }
                .top-action-btn:active { transform: scale(0.95); }
                .top-action-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .border-btn { background: #FFFFFF; color: #475569; border: 1px solid #CBD5E1; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .border-btn:hover { background: #F8FAFC; border-color: #94A3B8; color: #0F172A; }
                .primary-btn { background: #6366F1; color: #FFFFFF; border: 1px solid transparent; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
                .primary-btn:hover:not(:disabled) { background: #4F46E5; box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3); }
                .dark-btn { background: #0F172A; color: #FFFFFF; border: 1px solid transparent; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); }
                .dark-btn:hover { background: #1E293B; }

                /* Settings Modals */
                .clean-modal-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #E2E8F0; background: #F8FAFC; outline: none; font-size: 0.95rem; color: #0F172A; transition: 0.2s; }
                .clean-modal-input:focus { border-color: #6366F1; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
                .modal-primary-btn { width: 100%; padding: 14px; background: #6366F1; color: white; font-weight: 700; border-radius: 12px; border: none; cursor: pointer; font-size: 1rem; transition: 0.2s; margin-top: 10px; }
                .modal-primary-btn:hover { background: #4F46E5; }

                /* Profile Modal Buttons */
                .modal-action-btn { flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s; outline: none; border: none; }
                .modal-action-btn:active { transform: scale(0.98); }
                .modal-action-btn.primary { background: #0F172A; color: white; }
                .modal-action-btn.primary:hover { background: #1E293B; }
                .modal-action-btn.secondary { background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0; }
                .modal-action-btn.secondary:hover { background: #E2E8F0; color: #0F172A; }

                /* Table Styling */
                .table-header { padding: 16px 24px; color: #64748B; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E2E8F0; }
                .table-row { border-bottom: 1px solid #F1F5F9; transition: background-color 0.2s ease; }
                .table-row:hover { background-color: #F8FAFC; }
                
                /* Action Icons - FIXED SIZE to prevent shrinking */
                .icon-action-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; min-width: 36px; min-height: 36px; border-radius: 10px; background: #F1F5F9; color: #64748B; border: none; cursor: pointer; transition: 0.2s; outline: none; padding: 0; margin: 0; }
                .icon-action-btn:hover { background: #EEF2FF; color: #4F46E5; }
                .icon-action-btn.invoice-btn:hover { background: #ECFDF5; color: #10B981; }

                .page-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #E2E8F0; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; color: #0F172A; outline: none; }
                .page-btn:hover:not(:disabled) { background: #F1F5F9; border-color: #CBD5E1; }
                .page-btn:disabled { color: #CBD5E1; cursor: not-allowed; background: #F8FAFC; }
                .pagination-select { padding: 8px 12px; border-radius: 10px; border: 1px solid #E2E8F0; outline: none; font-weight: 700; color: #0F172A; cursor: pointer; font-size: 0.9rem; background: #FFFFFF; }
                
                .close-btn { background: #F1F5F9; border: none; color: #64748B; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .close-btn:hover { background: #E2E8F0; color: #EF4444; }
            `}</style>
    </div>
  );
}