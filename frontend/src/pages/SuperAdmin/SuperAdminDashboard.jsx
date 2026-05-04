import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarModern from "../../components/SidebarModern";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ShieldAlert, CheckCircle, XCircle, Eye, Users, FileText, ChevronLeft, ChevronRight, MapPin, Briefcase } from "lucide-react";

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

export default function SuperAdminDashboard() {
    const navigate = useNavigate();

    // --- DATA STATES ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

    // --- FILTER STATES ---
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");

    // --- PAGINATION STATES ---
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // --- 360 MODAL STATE ---
    const [selectedUser, setSelectedUser] = useState(null);
    const [user360Data, setUser360Data] = useState(null);
    const [loading360, setLoading360] = useState(false);

    // API Call for Grid
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem("access_token") || localStorage.getItem("access_token");

            let url = `/auth/superadmin/master-grid/?limit=${limit}&page=${currentPage}`;
            if (roleFilter) url += `&role=${roleFilter}`;
            if (searchQuery) url += `&search=${searchQuery}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (locationFilter) url += `&location=${locationFilter}`;
            if (serviceFilter) url += `&service=${serviceFilter}`;

            const response = await api.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(response.data.results || response.data || []);
            if (response.data.count) setTotalRecords(response.data.count);

        } catch (error) {
            toast.error("Failed to load master data.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Refetch on filter or page change
    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(), 300); // Debounce
        return () => clearTimeout(timer);
    }, [roleFilter, statusFilter, locationFilter, serviceFilter, limit, currentPage]);

    // OTP Toggle
    const toggleOTP = async (userId, currentStatus) => {
        try {
            const token = sessionStorage.getItem("access_token") || localStorage.getItem("access_token");
            await api.patch(`/auth/users/${userId}/`,
                { is_otp_enabled: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(currentStatus ? "OTP Disabled for user" : "OTP Enabled for user");
            setUsers(users.map(u => u.id === userId ? { ...u, is_otp_enabled: !currentStatus } : u));
        } catch (error) {
            toast.error("Failed to update OTP settings.");
        }
    };

    // Fetch Live 360 Data
    const open360View = async (user) => {
        setSelectedUser(user);
        setLoading360(true);
        try {
            const token = sessionStorage.getItem("access_token") || localStorage.getItem("access_token");
            const response = await api.get(`/auth/users/${user.id}/360-view/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser360Data(response.data);
        } catch (error) {
            toast.error("Failed to load live 360° data.");
            console.error(error);
        } finally {
            setLoading360(false);
        }
    };

    // Perfect Role Badges (Matched with your screenshot)
    const getRoleBadge = (role) => {
        if (!role) return { bg: '#F1F5F9', color: '#64748B' };
        const r = role.toLowerCase();
        if (r === 'student') return { bg: '#EEF2FF', color: '#4F46E5' }; // Indigo/Blue
        if (r === 'teacher') return { bg: '#FDF2F8', color: '#EC4899' }; // Pink
        if (r === 'parent') return { bg: '#FFFBEB', color: '#D97706' };  // Amber
        if (r === 'super_admin' || r === 'admin') return { bg: '#FEF2F2', color: '#E11D48' }; // Red
        return { bg: '#F1F5F9', color: '#64748B' };
    };

    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

    return (
        <div style={{ display: "flex", background: THEME.bg, height: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden", color: THEME.textMain }}>
            <SidebarModern />

            <div className="hide-scrollbar" style={{ flex: 1, marginLeft: "280px", padding: "30px 40px", display: "flex", flexDirection: "column", height: "100vh", overflowY: 'auto' }}>

                {/* --- Header Area --- */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <ShieldAlert size={28} color={THEME.primary} />
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: THEME.textMain, margin: 0, letterSpacing: '-0.5px' }}>
                            Master Data Grid
                        </h1>
                    </div>
                    <p style={{ color: THEME.textMuted, fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>Super Admin Global Control Panel & Data Manager</p>
                </motion.div>

                {/* --- Advanced Filters Section --- */}
                <div className="safe-filters" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '25px', background: THEME.cardBg, padding: '20px', borderRadius: '16px', border: `1px solid ${THEME.borderLight}`, boxShadow: THEME.shadow }}>

                    {/* Top Row: Search & Role */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="filter-box" style={{ flex: 2 }}>
                            <Search size={18} color={THEME.textMuted} />
                            <input
                                type="text"
                                placeholder="Search by Name, Email or Phone..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="clean-input"
                            />
                        </div>

                        <div className="filter-box" style={{ flex: 1 }}>
                            <Filter size={18} color={THEME.textMuted} />
                            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }} className="clean-select">
                                <option value="">All Roles</option>
                                <option value="STUDENT">Students</option>
                                <option value="TEACHER">Teachers</option>
                                <option value="PARENT">Parents</option>
                                <option value="SUPER_ADMIN">Super Admins</option>
                            </select>
                        </div>
                    </div>

                    {/* Bottom Row: Deep Filters */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="filter-box" style={{ flex: 1 }}>
                            <FileText size={18} color={THEME.textMuted} />
                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="clean-select">
                                <option value="">All Fee Status</option>
                                <option value="ACTIVE">Paid / Active</option>
                                <option value="INACTIVE">Unpaid / Suspended</option>
                            </select>
                        </div>

                        <div className="filter-box" style={{ flex: 1 }}>
                            <MapPin size={18} color={THEME.textMuted} />
                            <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }} className="clean-select">
                                <option value="">All Locations</option>
                                <option value="jaipur">Jaipur Center</option>
                                <option value="delhi">Delhi Center</option>
                                <option value="online">Online</option>
                            </select>
                        </div>

                        <div className="filter-box" style={{ flex: 1 }}>
                            <Briefcase size={18} color={THEME.textMuted} />
                            <select value={serviceFilter} onChange={(e) => { setServiceFilter(e.target.value); setCurrentPage(1); }} className="clean-select">
                                <option value="">All Services</option>
                                <option value="live_classes">Live Classes</option>
                                <option value="recorded">Previous Lectures</option>
                                <option value="exam_series">Exam Series</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- Table Data Area --- */}
                <div style={{ background: THEME.cardBg, borderRadius: '16px', border: `1px solid ${THEME.borderLight}`, boxShadow: THEME.shadow, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div style={{ overflowX: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr>
                                    <th className="table-header">ID</th>
                                    <th className="table-header">User Details</th>
                                    <th className="table-header">Role</th>
                                    <th className="table-header">System Status</th>
                                    <th className="table-header">OTP Auth</th>
                                    <th className="table-header" style={{ textAlign: 'right', paddingRight: '30px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: THEME.textMuted, fontWeight: '600' }}>Loading system data...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: THEME.textMuted, fontWeight: '600' }}>No records match your filters.</td></tr>
                                ) : (
                                    users.map((user, idx) => {
                                        const badge = getRoleBadge(user.role);
                                        const isActive = user.status === 'ACTIVE' || user.status === 'PAID';
                                        return (
                                            <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="table-row">
                                                <td style={{ padding: '16px 24px', fontWeight: '600', color: THEME.textMuted, fontSize: '0.9rem' }}>
                                                    #{user.id}
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ fontWeight: '700', color: THEME.textMain, fontSize: '0.95rem' }}>{user.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: THEME.textMuted, marginTop: '2px' }}>{user.email}</div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ background: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: isActive ? '#10B981' : '#EF4444', textTransform: 'uppercase' }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10B981' : '#EF4444' }}></span>
                                                        {user.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <button onClick={() => toggleOTP(user.id, user.is_otp_enabled)} className="otp-btn" style={{
                                                        color: user.is_otp_enabled ? '#10B981' : '#EF4444',
                                                        border: `1px solid ${user.is_otp_enabled ? '#A7F3D0' : '#FECACA'}`
                                                    }}>
                                                        {user.is_otp_enabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                        {user.is_otp_enabled ? 'ON' : 'OFF'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                    <button onClick={() => open360View(user)} className="action-btn">
                                                        <Eye size={14} /> 360° View
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div style={{ padding: '16px 24px', borderTop: `1px solid ${THEME.borderLight}`, background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: THEME.textMuted }}>Rows per page:</span>
                            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }} className="pagination-select">
                                <option value={10}>10</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: THEME.textMuted }}>
                                Page {currentPage} of {totalPages} <span style={{ color: THEME.textMain, fontWeight: '700' }}>({totalRecords} Total)</span>
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="page-btn">
                                    <ChevronLeft size={16} />
                                </button>
                                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="page-btn">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 🔥 360-Degree User Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.98 }}
                            style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: THEME.textMain, fontSize: '1.2rem', fontWeight: '800' }}>
                                    <div style={{ background: THEME.primaryLight, padding: '6px', borderRadius: '8px' }}><Users size={20} color={THEME.primary} /></div>
                                    User 360° Profile
                                </h2>
                                <button onClick={() => { setSelectedUser(null); setUser360Data(null); }} className="close-btn">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                                {loading360 ? (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px', color: THEME.textMuted, fontWeight: '600' }}>
                                        <div className="loader" style={{ margin: '0 auto 15px auto', borderTopColor: THEME.primary }}></div>
                                        Fetching Live ERP Data...
                                    </div>
                                ) : user360Data ? (
                                    <>
                                        {/* Identity Card */}
                                        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: THEME.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 12px auto', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}>
                                                {user360Data.name.charAt(0).toUpperCase()}
                                            </div>
                                            <h3 style={{ margin: '0 0 4px 0', color: THEME.textMain, fontSize: '1.1rem', fontWeight: '700' }}>{user360Data.name}</h3>
                                            <div style={{ marginBottom: '20px' }}>
                                                <span style={{ display: 'inline-block', background: getRoleBadge(user360Data.role).bg, color: getRoleBadge(user360Data.role).color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                                    {user360Data.role}
                                                </span>
                                            </div>

                                            <div style={{ textAlign: 'left', fontSize: '0.85rem', color: THEME.textMain, display: 'flex', flexDirection: 'column', gap: '12px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                <div><span style={{ color: THEME.textMuted, fontSize: '0.75rem', display: 'block', fontWeight: '600' }}>Email ID</span><strong style={{ fontWeight: '600' }}>{user360Data.email}</strong></div>
                                                <div><span style={{ color: THEME.textMuted, fontSize: '0.75rem', display: 'block', fontWeight: '600' }}>Mobile</span><strong style={{ fontWeight: '600' }}>{user360Data.phone}</strong></div>
                                                <div><span style={{ color: THEME.textMuted, fontSize: '0.75rem', display: 'block', fontWeight: '600' }}>Joining Date</span><strong style={{ fontWeight: '600' }}>{user360Data.date_joined}</strong></div>
                                            </div>
                                        </div>

                                        {/* Deep Info Cards */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ background: '#FFFBEB', padding: '20px', borderRadius: '16px', border: '1px solid #FEF3C7' }}>
                                                <h4 style={{ margin: '0 0 12px 0', color: '#D97706', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '700' }}>
                                                    <div style={{ background: '#FEF3C7', padding: '6px', borderRadius: '6px' }}><FileText size={16} /></div>
                                                    Financial Status
                                                </h4>
                                                <div style={{ fontSize: '0.9rem', color: THEME.textMain }}>
                                                    Status: <strong style={{ color: String(user360Data.financial_status).includes('Paid') || String(user360Data.financial_status).includes('Active') ? '#10B981' : '#F59E0B' }}>
                                                        {user360Data.financial_status}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '16px', border: '1px solid #DCFCE7' }}>
                                                <h4 style={{ margin: '0 0 12px 0', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '700' }}>
                                                    <div style={{ background: '#DCFCE7', padding: '6px', borderRadius: '6px' }}><Briefcase size={16} /></div>
                                                    Platform Activity
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                                    <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                                        <span style={{ color: THEME.textMuted, fontSize: '0.75rem', display: 'block', fontWeight: '600' }}>Location Config</span>
                                                        <strong style={{ color: THEME.textMain, fontSize: '0.9rem' }}>{user360Data.location}</strong>
                                                    </div>
                                                    <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                                        <span style={{ color: THEME.textMuted, fontSize: '0.75rem', display: 'block', fontWeight: '600' }}>Performance</span>
                                                        <strong style={{ color: THEME.textMain, fontSize: '0.9rem' }}>{user360Data.academic_status}</strong>
                                                    </div>
                                                </div>

                                                {user360Data.recent_activity && user360Data.recent_activity.length > 0 && (
                                                    <div style={{ background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                                        <span style={{ color: THEME.textMuted, fontSize: '0.75rem', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Recent Activity</span>
                                                        {user360Data.recent_activity.map((act, i) => (
                                                            <div key={i} style={{ fontSize: '0.85rem', color: THEME.textMain, fontWeight: '500', marginBottom: '4px' }}>• {act}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🔥 BULLETPROOF CSS: This protects the design from global CSS bleeding */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                /* Filter Area Styling */
                .safe-filters .filter-box { display: flex; align-items: center; background: #F1F5F9; padding: 0 16px; border-radius: 12px; gap: 10px; transition: all 0.2s; border: 1px solid transparent; }
                .safe-filters .filter-box:focus-within { border-color: #6366F1; background: #ffffff; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
                .clean-input { border: none !important; background: transparent !important; padding: 12px 0 !important; width: 100% !important; outline: none !important; font-weight: 500 !important; font-size: 0.9rem !important; color: #0F172A !important; box-shadow: none !important; }
                .clean-select { border: none !important; background: transparent !important; padding: 12px 0 !important; width: 100% !important; outline: none !important; font-weight: 600 !important; font-size: 0.9rem !important; color: #0F172A !important; cursor: pointer !important; box-shadow: none !important; appearance: auto !important; }

                /* Table Styling */
                .table-header { padding: 16px 24px; color: #64748B; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E2E8F0; }
                .table-row { border-bottom: 1px solid #F1F5F9; transition: background-color 0.2s ease; }
                .table-row:hover { background-color: #F8FAFC; }
                
                /* Action & Status Buttons */
                .action-btn { display: inline-flex; align-items: center; gap: 6px; background: #EEF2FF; color: #4F46E5; border: none; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
                .action-btn:hover { background: #E0E7FF; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1); }
                .otp-btn { display: inline-flex; align-items: center; gap: 5px; background: transparent; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 0.7rem; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
                .otp-btn:hover { filter: brightness(0.95); }
                
                /* Pagination Buttons */
                .page-btn { padding: 6px; border-radius: 8px; border: 1px solid #E2E8F0; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; color: #0F172A; }
                .page-btn:hover:not(:disabled) { background: #F1F5F9; border-color: #CBD5E1; }
                .page-btn:disabled { color: #CBD5E1; cursor: not-allowed; background: #F8FAFC; }
                .pagination-select { padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; outline: none; font-weight: 600; color: #0F172A; cursor: pointer; font-size: 0.85rem; }
                
                /* Misc */
                .close-btn { background: #F1F5F9; border: none; color: #64748B; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
                .close-btn:hover { background: #E2E8F0; color: #0F172A; transform: rotate(90deg); }
                .loader { width: 36px; height: 36px; border: 3px solid #EEF2FF; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}