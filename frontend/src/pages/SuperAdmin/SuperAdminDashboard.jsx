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
    textMain: '#0F172A',
    textMuted: '#64748B',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    glassBorder: '1px solid rgba(226, 232, 240, 0.8)',
    shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
};

export default function SuperAdminDashboard() {
    const navigate = useNavigate();

    // --- DATA STATES ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

    // --- FILTER STATES (Req 1) ---
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // Paid/Unpaid
    const [locationFilter, setLocationFilter] = useState(""); // Location
    const [serviceFilter, setServiceFilter] = useState(""); // Service

    // --- PAGINATION STATES (Req 4) ---
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // --- 360 MODAL STATE (Req 7) ---
    const [selectedUser, setSelectedUser] = useState(null);
    const [user360Data, setUser360Data] = useState(null); // 🔥 NEW: Hold Live Data
    const [loading360, setLoading360] = useState(false);  // 🔥 NEW: Loading state for modal

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

    // 🔥 OTP Toggle (Req 3)
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

    // 🔥 Fetch Live 360 Data (Req 7)
    const open360View = async (user) => {
        setSelectedUser(user); // Open Modal immediately
        setLoading360(true);   // Start loader inside modal
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

    // Role Badges Styling
    const getRoleBadge = (role) => {
        if (!role) return { bg: '#F1F5F9', color: '#64748B' };
        const r = role.toLowerCase();
        if (r === 'student') return { bg: '#EEF2FF', color: '#6366F1' };
        if (r === 'teacher') return { bg: '#FDF2F8', color: '#EC4899' };
        if (r === 'parent') return { bg: '#FFFBEB', color: '#F59E0B' };
        if (r === 'super_admin' || r === 'admin') return { bg: '#FEF2F2', color: '#EF4444' };
        return { bg: '#F1F5F9', color: '#64748B' };
    };

    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

    return (
        <div style={{ display: "flex", background: THEME.bg, height: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden", color: THEME.textMain }}>
            <SidebarModern />

            <div className="hide-scrollbar" style={{ flex: 1, marginLeft: "280px", padding: "30px 40px", display: "flex", flexDirection: "column", height: "100vh", overflowY: 'auto' }}>

                {/* Header Area */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <ShieldAlert size={32} color={THEME.primary} />
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: THEME.textMain, margin: 0, letterSpacing: '-1px' }}>
                            Master Data Grid
                        </h1>
                    </div>
                    <p style={{ color: THEME.textMuted, fontSize: '1rem', fontWeight: '500' }}>Super Admin Global Control Panel & Data Manager</p>
                </motion.div>

                {/* Advanced Filters Section (Req 1) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', background: THEME.cardBg, padding: '20px', borderRadius: '20px', border: THEME.glassBorder, boxShadow: THEME.shadow }}>

                    {/* Top Row: Search & Role */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '0 15px', borderRadius: '12px' }}>
                            <Search size={18} color={THEME.textMuted} />
                            <input
                                type="text"
                                placeholder="Search by Name, Email or Phone..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none', fontWeight: '500' }}
                            />
                        </div>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '0 15px', borderRadius: '12px', gap: '10px' }}>
                            <Filter size={18} color={THEME.textMuted} />
                            <select
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                                style={{ border: 'none', background: 'transparent', padding: '12px 0', width: '100%', outline: 'none', fontWeight: '600', color: THEME.textMain, cursor: 'pointer' }}
                            >
                                <option value="">All Roles</option>
                                <option value="STUDENT">Students</option>
                                <option value="TEACHER">Teachers</option>
                                <option value="PARENT">Parents</option>
                            </select>
                        </div>
                    </div>

                    {/* Bottom Row: Deep Filters */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {/* Paid/Unpaid Filter */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '0 15px', borderRadius: '12px', gap: '10px' }}>
                            <FileText size={18} color={THEME.textMuted} />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                style={{ border: 'none', background: 'transparent', padding: '12px 0', width: '100%', outline: 'none', fontWeight: '600', color: THEME.textMain, cursor: 'pointer' }}
                            >
                                <option value="">All Fee Status</option>
                                <option value="ACTIVE">Paid / Active</option>
                                <option value="INACTIVE">Unpaid / Suspended</option>
                            </select>
                        </div>

                        {/* Location Filter */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '0 15px', borderRadius: '12px', gap: '10px' }}>
                            <MapPin size={18} color={THEME.textMuted} />
                            <select
                                value={locationFilter}
                                onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                                style={{ border: 'none', background: 'transparent', padding: '12px 0', width: '100%', outline: 'none', fontWeight: '600', color: THEME.textMain, cursor: 'pointer' }}
                            >
                                <option value="">All Locations</option>
                                <option value="jaipur">Jaipur Center</option>
                                <option value="delhi">Delhi Center</option>
                                <option value="online">Online</option>
                            </select>
                        </div>

                        {/* Services Filter */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '0 15px', borderRadius: '12px', gap: '10px' }}>
                            <Briefcase size={18} color={THEME.textMuted} />
                            <select
                                value={serviceFilter}
                                onChange={(e) => { setServiceFilter(e.target.value); setCurrentPage(1); }}
                                style={{ border: 'none', background: 'transparent', padding: '12px 0', width: '100%', outline: 'none', fontWeight: '600', color: THEME.textMain, cursor: 'pointer' }}
                            >
                                <option value="">All Services</option>
                                <option value="live_classes">Live Classes</option>
                                <option value="recorded">Previous Lectures</option>
                                <option value="exam_series">Exam Series</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Data Area */}
                <div style={{ background: THEME.cardBg, borderRadius: '24px', border: THEME.glassBorder, boxShadow: THEME.shadow, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F1F5F9', borderBottom: '2px solid #E2E8F0' }}>
                                <tr>
                                    <th style={{ padding: '18px 25px', color: THEME.textMuted, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
                                    <th style={{ padding: '18px 25px', color: THEME.textMuted, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>User Details</th>
                                    <th style={{ padding: '18px 25px', color: THEME.textMuted, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Role</th>
                                    <th style={{ padding: '18px 25px', color: THEME.textMuted, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>System Status</th>
                                    <th style={{ padding: '18px 25px', color: THEME.textMuted, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>OTP Auth</th>
                                    <th style={{ padding: '18px 25px', color: THEME.textMuted, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
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
                                        return (
                                            <motion.tr key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ borderBottom: '1px solid #F1F5F9', ':hover': { background: '#F8FAFC' } }}>
                                                <td style={{ padding: '18px 25px', fontWeight: '600', color: THEME.textMuted }}>#{user.id}</td>
                                                <td style={{ padding: '18px 25px' }}>
                                                    <div style={{ fontWeight: '700', color: THEME.textMain }}>{user.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: THEME.textMuted }}>{user.email}</div>
                                                </td>
                                                <td style={{ padding: '18px 25px' }}>
                                                    <span style={{ background: badge.bg, color: badge.color, padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '18px 25px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: user.status === 'ACTIVE' ? '#10B981' : '#EF4444' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.status === 'ACTIVE' ? '#10B981' : '#EF4444' }}></div>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '18px 25px' }}>
                                                    <button
                                                        onClick={() => toggleOTP(user.id, user.is_otp_enabled)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '5px',
                                                            background: user.is_otp_enabled ? '#ECFDF5' : '#FEF2F2',
                                                            color: user.is_otp_enabled ? '#10B981' : '#EF4444',
                                                            border: `1px solid ${user.is_otp_enabled ? '#A7F3D0' : '#FECACA'}`,
                                                            padding: '6px 12px', borderRadius: '20px',
                                                            fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s'
                                                        }}
                                                    >
                                                        {user.is_otp_enabled ? <><CheckCircle size={14} /> ON</> : <><XCircle size={14} /> OFF</>}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '18px 25px', textAlign: 'center' }}>
                                                    {/* 🔥 CALLING THE NEW open360View FUNCTION */}
                                                    <button
                                                        onClick={() => open360View(user)}
                                                        style={{ background: '#EEF2FF', color: THEME.primary, border: 'none', padding: '8px 15px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                                                    >
                                                        <Eye size={16} /> 360° View
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer (Req 4) */}
                    <div style={{ padding: '20px 25px', borderTop: '2px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: THEME.textMuted }}>Rows per page:</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontWeight: '600', color: THEME.textMain }}
                            >
                                <option value={10}>10</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: THEME.textMuted }}>
                                Page {currentPage} of {totalPages} ({totalRecords} Total)
                            </span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    style={{ padding: '8px', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white', color: currentPage === 1 ? '#CBD5E1' : THEME.textMain, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    style={{ padding: '8px', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white', color: currentPage === totalPages || totalPages === 0 ? '#CBD5E1' : THEME.textMain, cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 🔥 360-Degree User Modal (Req 7) - NOW FULLY DYNAMIC */}
            <AnimatePresence>
                {selectedUser && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            {/* Modal Header */}
                            <div style={{ padding: '24px 30px', background: THEME.bg, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: THEME.textMain, fontSize: '1.4rem' }}>
                                    <div style={{ background: '#EEF2FF', padding: '8px', borderRadius: '12px' }}><Users size={24} color={THEME.primary} /></div>
                                    User 360° Profile
                                </h2>
                                <button onClick={() => { setSelectedUser(null); setUser360Data(null); }} style={{ background: '#F1F5F9', border: 'none', color: THEME.textMuted, width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', ':hover': { background: '#E2E8F0' } }}>
                                    <XCircle size={22} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', maxHeight: '70vh', overflowY: 'auto' }}>

                                {loading360 ? (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '50px', color: THEME.textMuted, fontWeight: '600' }}>
                                        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #EEF2FF', borderTopColor: THEME.primary, borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '15px' }}></div>
                                        <div>Fetching Live ERP Data...</div>
                                    </div>
                                ) : user360Data ? (
                                    <>
                                        {/* Identity Card */}
                                        <div style={{ background: '#F8FAFC', padding: '25px', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: THEME.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 15px auto', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
                                                {user360Data.name.charAt(0).toUpperCase()}
                                            </div>
                                            <h3 style={{ margin: '0 0 5px 0', color: THEME.textMain, fontSize: '1.2rem' }}>{user360Data.name}</h3>
                                            <span style={{ display: 'inline-block', background: getRoleBadge(user360Data.role).bg, color: getRoleBadge(user360Data.role).color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '20px' }}>
                                                {user360Data.role}
                                            </span>

                                            <div style={{ textAlign: 'left', fontSize: '0.9rem', color: THEME.textMain, display: 'flex', flexDirection: 'column', gap: '15px', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                <div><span style={{ color: THEME.textMuted, fontSize: '0.8rem', display: 'block' }}>Email ID</span><strong>{user360Data.email}</strong></div>
                                                <div><span style={{ color: THEME.textMuted, fontSize: '0.8rem', display: 'block' }}>Mobile</span><strong>{user360Data.phone}</strong></div>
                                                <div><span style={{ color: THEME.textMuted, fontSize: '0.8rem', display: 'block' }}>Joining Date</span><strong>{user360Data.date_joined}</strong></div>
                                            </div>
                                        </div>

                                        {/* Deep Info Cards */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                            {/* Financial Context */}
                                            <div style={{ background: '#FFFBEB', padding: '25px', borderRadius: '20px', border: '1px solid #FEF3C7' }}>
                                                <h4 style={{ margin: '0 0 15px 0', color: '#D97706', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                                    <div style={{ background: '#FEF3C7', padding: '6px', borderRadius: '8px' }}><FileText size={20} /></div>
                                                    Financial Status
                                                </h4>
                                                <div style={{ fontSize: '1rem', color: THEME.textMain }}>
                                                    Status: <strong style={{ color: user360Data.financial_status.includes('Paid') || user360Data.financial_status.includes('Active') ? '#10B981' : '#F59E0B' }}>
                                                        {user360Data.financial_status}
                                                    </strong>
                                                </div>
                                            </div>

                                            {/* Academic / Platform Context */}
                                            <div style={{ background: '#F0FDF4', padding: '25px', borderRadius: '20px', border: '1px solid #DCFCE7' }}>
                                                <h4 style={{ margin: '0 0 15px 0', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                                    <div style={{ background: '#DCFCE7', padding: '6px', borderRadius: '8px' }}><Briefcase size={20} /></div>
                                                    Academic & Platform Activity
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                                    <div style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                        <span style={{ color: THEME.textMuted, fontSize: '0.8rem', display: 'block' }}>Location Config</span>
                                                        <strong style={{ color: THEME.textMain }}>{user360Data.location}</strong>
                                                    </div>
                                                    <div style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                        <span style={{ color: THEME.textMuted, fontSize: '0.8rem', display: 'block' }}>Performance</span>
                                                        <strong style={{ color: THEME.textMain }}>{user360Data.academic_status}</strong>
                                                    </div>
                                                </div>

                                                {/* Recent Activity Log */}
                                                {user360Data.recent_activity.length > 0 && (
                                                    <div style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                        <span style={{ color: THEME.textMuted, fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Recent Activity</span>
                                                        {user360Data.recent_activity.map((act, i) => (
                                                            <div key={i} style={{ fontSize: '0.9rem', color: THEME.textMain, fontWeight: '500', marginBottom: '5px' }}>{act}</div>
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

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}