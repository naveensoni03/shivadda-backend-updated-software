import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import {
    Users, UserPlus, Search, Edit3, Trash2, Eye,
    CheckCircle, XCircle, Mail, Shield, Lock, X, ChevronLeft, ChevronRight,
    Calendar, User, Phone, Sparkles, AlertTriangle, Power, Smartphone, HardDrive, Moon, Filter, MapPin, CalendarClock,
    Briefcase, GraduationCap, Home, HeartPulse, Activity, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🎨 PREMIUM THEME CONSTANTS (NO UI CHANGES)
const ROLE_THEMES = {
    SUPER_ADMIN: { color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', badgeBg: '#f3e8ff', badgeText: '#6b21a8', border: '4px solid #8b5cf6' },
    SCHOOL_ADMIN: { color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', badgeBg: '#e0f2fe', badgeText: '#0369a1', border: '4px solid #3b82f6' },
    STAFF: { color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', badgeBg: '#dcfce7', badgeText: '#15803d', border: '4px solid #10b981' },
    AGENT: { color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', badgeBg: '#ffedd5', badgeText: '#c2410c', border: '4px solid #f59e0b' },
    TEACHER: { color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', badgeBg: '#fce7f3', badgeText: '#be185d', border: '4px solid #ec4899' },
    OWNER: { color: '#6366f1', bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', badgeBg: '#eef2ff', badgeText: '#4338ca', border: '4px solid #6366f1' },
    SEEKER: { color: '#14b8a6', bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', badgeBg: '#ccfbf1', badgeText: '#0f766e', border: '4px solid #14b8a6' },
    PARENT: { color: '#f43f5e', bg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', badgeBg: '#ffe4e6', badgeText: '#be123c', border: '4px solid #f43f5e' },
    GUEST: { color: '#64748b', bg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', badgeBg: '#f1f5f9', badgeText: '#475569', border: '4px solid #64748b' }
};

const AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
];

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");
    const [filterLocation, setFilterLocation] = useState("ALL");

    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);
    const [statusAction, setStatusAction] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    // 🚀 MEGA PROFILE STATES FOR ADMIN VIEW
    const [adminMegaProfile, setAdminMegaProfile] = useState(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("medical");

    const initialFormState = {
        id: null, full_name: "", email: "", phone: "", role: "STAFF", password: "", account_status: "ACTIVE", location: "Global", validity_days: 365, is_disguised: false,
        dob: "", gender: "Male", marital_status: "Single",
        post_nature: "Permanent", working_group: "Office",
        father_name: "", mother_name: "", parent_phone: "",
        highest_qualification: "", qualification_type: "Academic", experience_years: 0,
        address_permanent: "",
        terms_accepted: false,
        profile_photo: null,
        national_identity: ""
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("users/");
            setUsers(res.data.results || res.data);
        } catch (err) { toast.error("Failed to sync users."); } finally { setLoading(false); }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedUserIds(currentUsers.map(u => u.id));
        else setSelectedUserIds([]);
    };
    const handleSelectUser = (id) => setSelectedUserIds(prev => prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]);

    const handleBulkDelete = async () => {
        if (selectedUserIds.length === 0) return;
        const loadToast = toast.loading("Processing...");
        try {
            await Promise.all(selectedUserIds.map(id => api.delete(`users/${id}/`)));
            setUsers(users.filter(u => !selectedUserIds.includes(u.id)));
            setSelectedUserIds([]);
            toast.success(`${selectedUserIds.length} users deleted.`, { id: loadToast });
            setIsBulkDeleteOpen(false);
        } catch (err) { toast.error("Bulk deletion failed.", { id: loadToast }); }
    };

    const initiateDelete = (id) => { setUserToDelete(id); setIsDeleteModalOpen(true); };

    const confirmDelete = async () => {
        try {
            await api.delete(`users/${userToDelete}/`);
            setUsers(users.filter(u => u.id !== userToDelete));
            toast.success("User deleted successfully!");
            setIsDeleteModalOpen(false);
        } catch (err) { toast.error("Delete failed."); }
    };

    const handleStatusToggleClick = (user) => {
        const newStatus = user.account_status === 'HIBERNATE' ? 'ACTIVE' : 'HIBERNATE';
        setUserToToggle(user); setStatusAction(newStatus); setIsStatusModalOpen(true);
    };

    const confirmStatusToggle = async () => {
        const loadToast = toast.loading(`Marking as ${statusAction}...`);
        try {
            await api.patch(`users/${userToToggle.id}/update_status/`, { status: statusAction });
            setUsers(users.map(u => u.id === userToToggle.id ? { ...u, account_status: statusAction, is_active: statusAction === 'ACTIVE' } : u));
            toast.success(`Status updated!`, { id: loadToast });
            setIsStatusModalOpen(false);
        } catch (err) { toast.error("Update failed", { id: loadToast }); }
    };

    // 🚀 THE MEGA FIX: FormData integration for file uploads
    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.terms_accepted) return toast.error("You must agree to the Terms & Conditions!");

        const loadToast = toast.loading("Processing...");

        const submitData = new FormData();

        Object.keys(formData).forEach(key => {
            if (key === 'profile_photo') {
                if (formData.profile_photo instanceof File) {
                    submitData.append('profile_photo', formData.profile_photo);
                }
            } else if (key === 'password') {
                if (formData.password && formData.password.trim() !== "") {
                    submitData.append('password', formData.password);
                }
            } else if (key === 'id') {
                // Do nothing
            } else {
                if (formData[key] !== null && formData[key] !== undefined) {
                    submitData.append(key, formData[key]);
                }
            }
        });

        try {
            if (editMode) {
                await api.patch(`users/${formData.id}/`, submitData);
                toast.success("User updated successfully!", { id: loadToast });
            } else {
                await api.post("users/", submitData);
                toast.success("User created successfully!", { id: loadToast });
            }
            fetchUsers();
            closeForm();
        } catch (err) {
            console.error("Save Error:", err.response?.data);
            let errorMsg = "Operation failed. Please check your data.";
            if (err.response?.data) {
                const keys = Object.keys(err.response.data);
                if (keys.length > 0) {
                    const firstError = err.response.data[keys[0]];
                    errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
                }
            }
            toast.error(errorMsg, { id: loadToast });
        }
    };

    const openForm = (user = null) => {
        setEditMode(!!user);
        setFormData(user ? { ...initialFormState, ...user, password: "", terms_accepted: true } : initialFormState);
        setIsFormOpen(true);
    };

    // 🚀 NEW: OPEN VIEW WITH MEGA PROFILE FETCH
    const openView = async (user) => {
        setSelectedUser(user);
        setIsViewOpen(true);
        setIsProfileLoading(true);
        setActiveTab("medical"); // Reset tab
        setAdminMegaProfile(null);
        try {
            const res = await api.get(`profiles/admin/${user.id}/`);
            setAdminMegaProfile(res.data);
        } catch (err) {
            toast.error("No Mega Profile found or Unauthorized.");
        } finally {
            setIsProfileLoading(false);
        }
    };

    const closeForm = () => setIsFormOpen(false);
    const closeView = () => { setIsViewOpen(false); setAdminMegaProfile(null); };

    // Filters & Pagination
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === "ALL" || u.role === filterRole;
        const matchesLocation = filterLocation === "ALL" || (u.location && u.location === filterLocation);
        return matchesSearch && matchesRole && matchesLocation;
    });
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div style={{ display: "flex", background: "#f8fafc", height: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
            <div style={{ zIndex: 50 }}><SidebarModern /></div>
            <Toaster position="top-center" toastOptions={{ style: { background: '#0f172a', color: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' } }} />

            <div className="user-main-view hide-scrollbar">
                {/* HERO HEADER */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="user-header-wrap">
                    <div>
                        <h1 className="responsive-title" style={{ fontWeight: '900', letterSpacing: '-1.5px', margin: 0, lineHeight: '1.1', background: 'linear-gradient(to right, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            User Management <span style={{ fontSize: '1.5rem' }}>✨</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '8px', fontWeight: '500' }}>Orchestrate your team's access and permissions.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => selectedUserIds.length > 0 ? setIsBulkDeleteOpen(true) : toast("Select users first", { icon: '⚠️' })} style={{ ...secondaryBtn, opacity: selectedUserIds.length > 0 ? 1 : 0.5 }}>
                            <Trash2 size={18} /> Bulk Actions
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.5)' }} whileTap={{ scale: 0.95 }} onClick={() => openForm()} style={primaryBtn}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px' }}><UserPlus size={22} /></div>
                            <span>Add New User</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* FLOATING SEARCH */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: '35px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 2, minWidth: '250px' }}>
                        <Search size={22} strokeWidth={2.5} style={{ position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
                        <input placeholder="Search by name or email..." style={searchBar} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <div className="select-wrapper">
                            <Filter size={16} className="select-icon" />
                            <select style={filterSelect} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                                <option value="ALL" style={{ color: '#1e293b' }}>All Roles</option>
                                <option value="SUPER_ADMIN" style={{ color: '#1e293b' }}>Super Admin</option>
                                <option value="STAFF" style={{ color: '#1e293b' }}>Staff</option>
                                <option value="SEEKER" style={{ color: '#1e293b' }}>Student/Seeker</option>
                                <option value="PARENT" style={{ color: '#1e293b' }}>Parent</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* 🚀 TABLE AREA WITH SERIAL NUMBERS */}
                <div className="table-responsive-wrapper hide-scrollbar" style={{ flex: 1 }}>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%', textAlign: 'center' }}>#</th>
                                <th style={{ width: '25%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" onChange={handleSelectAll} checked={currentUsers.length > 0 && selectedUserIds.length === currentUsers.length} style={checkboxStyle} />
                                        User Profile
                                    </div>
                                </th>
                                <th style={{ width: '15%' }}>Role</th>
                                <th style={{ width: '25%' }}>Contact Info</th>
                                <th style={{ width: '15%' }}>Status</th>
                                <th style={{ width: '15%', textAlign: 'right', paddingRight: '30px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user, i) => {
                                const theme = ROLE_THEMES[user.role] || ROLE_THEMES.STAFF;
                                const avatarBg = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
                                const isSelected = selectedUserIds.includes(user.id);
                                const serialNumber = indexOfFirstItem + i + 1;

                                return (
                                    <motion.tr key={user.id} whileHover={{ y: -4, scale: 1.005, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }} className="table-row">
                                        <td style={{ borderLeft: theme.border, background: isSelected ? '#f8fafc' : 'white', textAlign: 'center', fontWeight: '800', color: '#94a3b8', fontSize: '0.95rem' }}>
                                            {String(serialNumber).padStart(2, '0')}
                                        </td>

                                        <td style={{ background: isSelected ? '#f8fafc' : 'white' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <input type="checkbox" checked={isSelected} onChange={() => handleSelectUser(user.id)} style={checkboxStyle} />
                                                <div style={{ ...avatar, background: avatarBg }}>{user.full_name?.charAt(0).toUpperCase()}</div>
                                                <div style={{ maxWidth: '180px' }}>
                                                    <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.full_name}>{user.full_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>ID: #{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ background: isSelected ? '#f8fafc' : 'white' }}>
                                            <span style={{ ...badge, background: theme.badgeBg, color: theme.badgeText, border: `1px solid ${theme.color}30` }}>
                                                {user.role ? user.role.replace('_', ' ') : 'STAFF'}
                                            </span>
                                        </td>
                                        <td style={{ background: isSelected ? '#f8fafc' : 'white' }}>
                                            <div style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email}>
                                                <Mail size={14} style={{ flexShrink: 0 }} /> {user.email}
                                            </div>
                                        </td>
                                        <td style={{ background: isSelected ? '#f8fafc' : 'white' }}>
                                            <span style={{ ...statusBadge, color: user.account_status === 'ACTIVE' ? '#10b981' : '#ef4444', background: user.account_status === 'ACTIVE' ? '#dcfce7' : '#fee2e2' }}>
                                                {user.account_status === 'ACTIVE' ? <CheckCircle size={14} /> : <XCircle size={14} />} {user.account_status}
                                            </span>
                                        </td>
                                        <td style={{ background: isSelected ? '#f8fafc' : 'white', textAlign: 'right', paddingRight: '30px' }}>
                                            <div className="user-actions-wrap" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                <motion.button whileHover={{ scale: 1.15 }} onClick={() => handleStatusToggleClick(user)} style={{ ...actionBtn, background: '#f3f4f6' }}><Power size={18} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.15 }} onClick={() => openView(user)} style={{ ...actionBtn, color: '#3b82f6', background: '#eff6ff' }}><Eye size={18} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.15 }} onClick={() => openForm(user)} style={{ ...actionBtn, color: '#f59e0b', background: '#fffbeb' }}><Edit3 size={18} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.15 }} onClick={() => initiateDelete(user.id)} style={{ ...actionBtn, color: '#ef4444', background: '#fef2f2' }}><Trash2 size={18} /></motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {filteredUsers.length > itemsPerPage && (
                    <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <motion.button whileHover={{ scale: 1.1 }} disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} style={pageBtn}><ChevronLeft size={20} /></motion.button>
                        <span style={{ padding: '10px 24px', background: 'white', borderRadius: '14px', fontWeight: '800', color: '#0f172a', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{currentPage} / {totalPages}</span>
                        <motion.button whileHover={{ scale: 1.1 }} disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} style={pageBtn}><ChevronRight size={20} /></motion.button>
                    </div>
                )}
            </div>

            {/* 🛠️ GLASS MODAL - FORM */}
            <AnimatePresence>
                {isFormOpen && (
                    <div style={overlay}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={modal} className="responsive-modal">
                            <div style={modalHeader}>
                                <div><h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{editMode ? 'Edit User Profile' : 'Create New User'}</h2></div>
                                <motion.button whileHover={{ rotate: 90 }} onClick={closeForm} style={closeBtn}><X size={22} /></motion.button>
                            </div>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }} className="hide-scrollbar">
                                <h4 style={sectionTitle}>Basic Information</h4>
                                <div className="user-form-split">
                                    <div style={inputGroup}><label style={labelStyle}>Full Name</label><input required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} style={input} /></div>
                                    <div style={inputGroup}><label style={labelStyle}>Role</label>
                                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={input}>
                                            {Object.keys(ROLE_THEMES).map(role => <option key={role} value={role} style={{ color: '#1e293b' }}>{role.replace('_', ' ')}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="user-form-split">
                                    <div style={inputGroup}><label style={labelStyle}>Email</label><input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={input} /></div>
                                    <div style={inputGroup}><label style={labelStyle}>Phone</label><input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={input} /></div>
                                </div>

                                <h4 style={sectionTitle}>Identity & Photo</h4>
                                <div className="user-form-split">
                                    <div style={inputGroup}>
                                        <label style={labelStyle}>Profile Photo</label>
                                        <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, profile_photo: e.target.files[0] })} style={{ ...input, padding: '10px', cursor: 'pointer' }} />
                                    </div>
                                    <div style={inputGroup}>
                                        <label style={labelStyle}>National Identity (ID Number)</label>
                                        <input placeholder="Aadhar/PAN/Passport" value={formData.national_identity} onChange={e => setFormData({ ...formData, national_identity: e.target.value })} style={input} />
                                    </div>
                                </div>

                                <h4 style={sectionTitle}>Profile Details (Deep)</h4>
                                <div className="user-form-split">
                                    <div style={inputGroup}><label style={labelStyle}>Date of Birth</label><input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} style={input} /></div>
                                    <div style={inputGroup}><label style={labelStyle}>Gender</label>
                                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={input}>
                                            <option value="Male" style={{ color: '#1e293b' }}>Male</option>
                                            <option value="Female" style={{ color: '#1e293b' }}>Female</option>
                                            <option value="Other" style={{ color: '#1e293b' }}>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="user-form-split">
                                    <div style={inputGroup}><label style={labelStyle}>Nature of Post</label>
                                        <select value={formData.post_nature} onChange={e => setFormData({ ...formData, post_nature: e.target.value })} style={input}>
                                            <option value="Permanent" style={{ color: '#1e293b' }}>Permanent</option>
                                            <option value="Adhoc" style={{ color: '#1e293b' }}>Adhoc</option>
                                            <option value="Guest" style={{ color: '#1e293b' }}>Guest</option>
                                            <option value="Temporary" style={{ color: '#1e293b' }}>Temporary</option>
                                        </select>
                                    </div>
                                    <div style={inputGroup}><label style={labelStyle}>Working Group</label>
                                        <select value={formData.working_group} onChange={e => setFormData({ ...formData, working_group: e.target.value })} style={input}>
                                            <option value="Office" style={{ color: '#1e293b' }}>Office</option>
                                            <option value="Field" style={{ color: '#1e293b' }}>Field</option>
                                            <option value="Both" style={{ color: '#1e293b' }}>Both</option>
                                        </select>
                                    </div>
                                </div>

                                <h4 style={sectionTitle}>Parents & Guardians (If Student/Seeker)</h4>
                                <div className="user-form-split">
                                    <div style={inputGroup}><label style={labelStyle}>Father's Name</label><input value={formData.father_name} onChange={e => setFormData({ ...formData, father_name: e.target.value })} style={input} /></div>
                                    <div style={inputGroup}><label style={labelStyle}>Mother's Name</label><input value={formData.mother_name} onChange={e => setFormData({ ...formData, mother_name: e.target.value })} style={input} /></div>
                                </div>

                                <h4 style={sectionTitle}>Qualifications</h4>
                                <div className="user-form-split">
                                    <div style={inputGroup}><label style={labelStyle}>Highest Qualification</label><input placeholder="e.g. M.Tech" value={formData.highest_qualification} onChange={e => setFormData({ ...formData, highest_qualification: e.target.value })} style={input} /></div>
                                    <div style={inputGroup}><label style={labelStyle}>Experience (Years)</label><input type="number" value={formData.experience_years} onChange={e => setFormData({ ...formData, experience_years: e.target.value })} style={input} /></div>
                                </div>

                                <div style={inputGroup}><label style={labelStyle}>Permanent Address</label><textarea value={formData.address_permanent} onChange={e => setFormData({ ...formData, address_permanent: e.target.value })} style={{ ...input, height: '80px', fontFamily: 'inherit' }} /></div>

                                {!editMode && (
                                    <div style={inputGroup}><label style={labelStyle}>Password</label><input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={input} /></div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <input type="checkbox" id="termsCheck" checked={formData.terms_accepted} onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })} style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer', accentColor: '#6366f1' }} />
                                    <label htmlFor="termsCheck" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4', cursor: 'pointer' }}>
                                        I AM AGREE WITH ALL TERMS AND CONDITIONS OF THIS WEBSITE 1 PLACE 2 SERVICES. 3 USERS. I AM AGREED WITH ALL OF THEM.
                                    </label>
                                </div>

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={submitBtn}>
                                    {editMode ? 'Save Profile' : 'Create User'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🚀 NEW MEGA VIEW MODAL */}
            <AnimatePresence>
                {isViewOpen && selectedUser && (
                    <div style={overlay}>
                        <motion.div initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }} style={{ ...modal, width: '650px', padding: '0', overflow: 'hidden', border: 'none' }} className="responsive-modal">

                            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding: '30px', textAlign: 'center', color: 'white', position: 'relative' }}>
                                <motion.button whileHover={{ rotate: 90 }} onClick={closeView} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></motion.button>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.25)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800' }}>{selectedUser.full_name?.charAt(0).toUpperCase()}</div>
                                <h2 style={{ fontSize: '1.6rem', margin: 0, fontWeight: '800', wordBreak: 'break-word' }}>{selectedUser.full_name}</h2>
                                <p style={{ fontSize: '0.95rem', opacity: 0.9, marginTop: '5px', wordBreak: 'break-all' }}>{selectedUser.email}</p>
                            </div>

                            <div style={{ padding: '25px 35px', maxHeight: '60vh', overflowY: 'auto', background: '#f8fafc' }} className="hide-scrollbar">

                                <h4 style={sectionTitle}>Basic Identity</h4>
                                <DetailRow icon={<Shield size={20} />} label="National Identity" value={selectedUser.national_identity || "N/A"} color="#6366f1" />
                                <DetailRow icon={<Briefcase size={20} />} label="Role / Post" value={`${selectedUser.role} (${selectedUser.post_nature || "N/A"})`} />
                                <DetailRow icon={<Phone size={20} />} label="Contact" value={selectedUser.phone || "N/A"} />

                                {isProfileLoading ? (
                                    <div style={{ textAlign: "center", padding: "40px" }}>
                                        <Loader2 className="spinner" size={35} color="#6366f1" style={{ margin: "0 auto 10px", animation: "spin 1s linear infinite" }} />
                                        <p style={{ color: "#64748b", fontWeight: '600' }}>Fetching Mega Profile...</p>
                                    </div>
                                ) : adminMegaProfile ? (
                                    <div style={{ marginTop: '25px' }}>
                                        <div className="mega-tabs-header">
                                            <button className={`mega-tab ${activeTab === 'medical' ? 'active' : ''}`} onClick={() => setActiveTab('medical')}><HeartPulse size={16} /> Medical</button>
                                            <button className={`mega-tab ${activeTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveTab('academic')}><GraduationCap size={16} /> Academic</button>
                                            <button className={`mega-tab ${activeTab === 'professional' ? 'active' : ''}`} onClick={() => setActiveTab('professional')}><Briefcase size={16} /> Professional</button>
                                            <button className={`mega-tab ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}><Activity size={16} /> Social</button>
                                        </div>

                                        <div style={{ paddingTop: '15px' }}>
                                            {activeTab === 'medical' && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                    <DetailRow icon={<HeartPulse size={18} />} label="Blood Group" value={adminMegaProfile.medical?.blood_group || "---"} color="#ef4444" />
                                                    <DetailRow icon={<User size={18} />} label="Height & Weight" value={`${adminMegaProfile.medical?.height_cm || '-'} cm / ${adminMegaProfile.medical?.weight_kg || '-'} kg`} />
                                                    <DetailRow icon={<Phone size={18} />} label="Emergency Contact" value={`${adminMegaProfile.medical?.emergency_contact_name || "---"} (${adminMegaProfile.medical?.emergency_contact_number || "---"})`} />
                                                    <DetailRow icon={<Shield size={18} />} label="Chronic Diseases" value={adminMegaProfile.medical?.chronic_diseases || "None recorded"} />
                                                </motion.div>
                                            )}
                                            {activeTab === 'academic' && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                    <DetailRow icon={<GraduationCap size={18} />} label="10th Standard" value={`${adminMegaProfile.academic?.tenth_school || '---'} (${adminMegaProfile.academic?.tenth_percentage || '-'}%)`} />
                                                    <DetailRow icon={<GraduationCap size={18} />} label="12th Standard" value={`${adminMegaProfile.academic?.twelfth_school || '---'} (${adminMegaProfile.academic?.twelfth_percentage || '-'}%)`} />
                                                    <DetailRow icon={<GraduationCap size={18} />} label="Graduation" value={`${adminMegaProfile.academic?.graduation_degree || '---'} (${adminMegaProfile.academic?.graduation_percentage || '-'}%)`} />
                                                    <DetailRow icon={<HardDrive size={18} />} label="Tech Skills" value={adminMegaProfile.academic?.technical_skills || "---"} />
                                                </motion.div>
                                            )}
                                            {activeTab === 'professional' && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                    <DetailRow icon={<Briefcase size={18} />} label="Total Experience" value={`${adminMegaProfile.professional?.total_experience_years || 0} Yrs, ${adminMegaProfile.professional?.total_experience_months || 0} Mos`} />
                                                    <DetailRow icon={<Briefcase size={18} />} label="Last Job" value={`${adminMegaProfile.professional?.last_job_title || '---'} at ${adminMegaProfile.professional?.last_company_name || '---'}`} />
                                                    <DetailRow icon={<User size={18} />} label="Reason for Leaving" value={adminMegaProfile.professional?.reason_for_leaving || "---"} />
                                                </motion.div>
                                            )}
                                            {activeTab === 'social' && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                    <DetailRow icon={<HeartPulse size={18} />} label="Blood Donation" value={adminMegaProfile.social?.blood_donation_history || "---"} />
                                                    <DetailRow icon={<Activity size={18} />} label="NGO Work" value={adminMegaProfile.social?.ngo_social_work || "---"} />
                                                    <DetailRow icon={<Sparkles size={18} />} label="Awards" value={adminMegaProfile.social?.awards_achievements || "---"} />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px', fontWeight: '600' }}>No Mega Profile Available.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* STATUS MODAL */}
            <AnimatePresence>{isStatusModalOpen && userToToggle && (<div style={overlay}><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...modal, width: '420px', textAlign: 'center', borderTop: `6px solid ${statusAction === 'HIBERNATE' ? '#8b5cf6' : '#10b981'}` }}><h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>Confirm {statusAction === 'HIBERNATE' ? 'Hibernate' : 'Activate'}?</h2><div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}><motion.button onClick={() => setIsStatusModalOpen(false)} style={secondaryBtn}>Cancel</motion.button><motion.button onClick={confirmStatusToggle} style={{ ...deleteBtnStyle, background: statusAction === 'HIBERNATE' ? '#8b5cf6' : '#10b981' }}>Confirm</motion.button></div></motion.div></div>)}</AnimatePresence>

            {/* DELETE MODAL VISIBILITY */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div style={overlay}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...modal, width: '400px', textAlign: 'center', borderTop: '6px solid #ef4444' }}>
                            <div style={{ width: '70px', height: '70px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
                                <AlertTriangle size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>Delete User?</h2>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                                <motion.button onClick={() => setIsDeleteModalOpen(false)} style={secondaryBtn}>Cancel</motion.button>
                                <motion.button onClick={confirmDelete} style={deleteBtnStyle}>Yes, Delete</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BULK DELETE MODAL */}
            <AnimatePresence>
                {isBulkDeleteOpen && (
                    <div style={overlay}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...modal, width: '400px', textAlign: 'center', borderTop: '6px solid #ef4444' }}>
                            <div style={{ width: '70px', height: '70px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
                                <AlertTriangle size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
                                Delete {selectedUserIds.length} Users?
                            </h2>
                            <p style={{ color: '#64748b', marginTop: '10px' }}>This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                                <motion.button onClick={() => setIsBulkDeleteOpen(false)} style={secondaryBtn}>Cancel</motion.button>
                                <motion.button onClick={handleBulkDelete} style={deleteBtnStyle}>Yes, Delete All</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .user-main-view { flex: 1; margin-left: 280px; padding: 40px; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
              .user-header-wrap { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px;}
              .responsive-title { font-size: 3rem; }
              .user-form-split { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .filter-group { display: flex; gap: 10px; flex-wrap: wrap; flex: 1;}
              .select-wrapper { position: relative; flex: 1; min-width: 150px; }
              .select-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none;}
              .table-responsive-wrapper { width: 100%; overflow-x: auto; }
              .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 15px; min-width: 1000px; margin-top: -15px; }
              .modern-table th { padding: 0 30px; text-align: left; color: #94a3b8; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; border: none; }
              .modern-table td { padding: 22px 30px; vertical-align: middle; background: inherit; }
              .table-row { transition: all 0.3s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); background: white; cursor: default; }
              .table-row td:first-child { border-top-left-radius: 24px; border-bottom-left-radius: 24px; }
              .table-row td:last-child { border-top-right-radius: 24px; border-bottom-right-radius: 24px; }

              /* MEGA TABS CSS */
              .mega-tabs-header { display: flex; gap: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; overflow-x: auto; }
              .mega-tab { background: none; border: none; padding: 8px 16px; font-weight: 700; color: #64748b; cursor: pointer; border-radius: 10px; transition: 0.3s; display: flex; align-items: center; gap: 6px; font-size: 0.9rem;}
              .mega-tab:hover { background: #f1f5f9; color: var(--primary); }
              .mega-tab.active { background: #6366f1; color: white; box-shadow: 0 4px 10px rgba(99,102,241,0.3); }

              @media (max-width: 850px) {
                  .user-main-view { margin-left: 0 !important; padding: 15px !important; padding-top: 90px !important; width: 100% !important; }
                  .user-header-wrap { flex-direction: column; align-items: flex-start; gap: 15px; }
                  .user-form-split { grid-template-columns: 1fr !important; }
                  .responsive-modal { width: 95% !important; padding: 25px !important; }
              }
          `}</style>
        </div>
    );
}

// ✨ ULTRA PREMIUM STYLES
const DetailRow = ({ icon, label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px dashed #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.95rem', fontWeight: '600', flexShrink: 0 }}>
            <div style={{ background: 'white', padding: '6px', borderRadius: '8px', color: '#94a3b8', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>{icon}</div>
            {label}
        </div>
        <div style={{ fontWeight: '800', color: color || '#1e293b', fontSize: '0.95rem', textAlign: 'right', width: '60%', wordBreak: 'break-word' }}>{value}</div>
    </div>
);

const overlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modal = { background: 'white', padding: '40px', borderRadius: '32px', width: '600px', maxWidth: '90%', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)', position: 'relative', border: '1px solid white' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' };
const sectionTitle = { color: '#6366f1', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '15px', marginTop: '25px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '5px' };
const primaryBtn = { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '18px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 10px 25px -10px rgba(79, 70, 229, 0.5)', transition: 'all 0.3s' };
const secondaryBtn = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' };
const deleteBtnStyle = { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)' };
const searchBar = { width: '100%', padding: '16px 25px 16px 55px', borderRadius: '16px', border: '2px solid transparent', background: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', color: '#1e293b', fontWeight: '600', transition: 'all 0.3s' };
const filterSelect = { width: '100%', padding: '16px 25px 16px 45px', borderRadius: '16px', border: '2px solid transparent', background: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', color: '#1e293b', fontWeight: '600', transition: 'all 0.3s', appearance: 'none', cursor: 'pointer' };
const avatar = { minWidth: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.3rem', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' };
const badge = { padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' };
const statusBadge = { padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' };
const actionBtn = { border: 'none', width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const input = { width: '100%', padding: '14px 20px', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none', color: '#1e293b', fontWeight: '600', transition: 'all 0.3s', boxSizing: 'border-box', fontFamily: 'inherit' };
const labelStyle = { fontSize: '0.9rem', color: '#64748b', fontWeight: '700', marginLeft: '5px' };
const submitBtn = { width: '100%', padding: '18px', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: 'white', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', marginTop: '15px', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4)' };
const closeBtn = { background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' };
const pageBtn = { background: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const checkboxStyle = { width: '20px', height: '20px', borderRadius: '6px', cursor: 'pointer', accentColor: '#4f46e5' };