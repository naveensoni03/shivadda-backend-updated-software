import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import {
    Users, UserPlus, Search, Edit3, Trash2, Eye,
    CheckCircle, XCircle, Mail, Shield, Lock, X, ChevronLeft, ChevronRight, 
    Calendar, User, Phone, Sparkles, AlertTriangle, Power, Smartphone, HardDrive, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🎨 PREMIUM THEME CONSTANTS
const ROLE_THEMES = {
    SUPER_ADMIN: { 
        color: '#8b5cf6', 
        bg: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
        badgeBg: '#f3e8ff',
        badgeText: '#6b21a8',
        border: '4px solid #8b5cf6'
    },
    SCHOOL_ADMIN: { 
        color: '#3b82f6', 
        bg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        badgeBg: '#e0f2fe',
        badgeText: '#0369a1',
        border: '4px solid #3b82f6'
    },
    STAFF: { 
        color: '#10b981', 
        bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        badgeBg: '#dcfce7',
        badgeText: '#15803d',
        border: '4px solid #10b981'
    },
    AGENT: { 
        color: '#f59e0b', 
        bg: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        badgeBg: '#ffedd5',
        badgeText: '#c2410c',
        border: '4px solid #f59e0b'
    },
    TEACHER: { 
        color: '#ec4899', 
        bg: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
        badgeBg: '#fce7f3',
        badgeText: '#be185d',
        border: '4px solid #ec4899'
    }
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
    
    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // 🚀 NEW STATES FOR CUSTOM STATUS MODAL
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);
    const [statusAction, setStatusAction] = useState(""); 

    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    const [formData, setFormData] = useState({
        id: null, full_name: "", email: "", phone: "", role: "STAFF", password: "", account_status: "ACTIVE"
    });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("users/");
            setUsers(res.data.results || res.data);
        } catch (err) { toast.error("Failed to sync users."); } finally { setLoading(false); }
    };

    const initiateDelete = (id) => {
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if(!userToDelete) return;
        try {
            await api.delete(`users/${userToDelete}/`);
            setUsers(users.filter(u => u.id !== userToDelete));
            toast.success("User deleted successfully!");
            setIsDeleteModalOpen(false);
        } catch (err) { 
            toast.error("Delete failed."); 
        }
    };

    // 🚀 STEP 1: Opens the Custom UI Modal instead of browser alert
    const handleStatusToggleClick = (user) => {
        const newStatus = user.account_status === 'HIBERNATE' ? 'ACTIVE' : 'HIBERNATE';
        setUserToToggle(user);
        setStatusAction(newStatus);
        setIsStatusModalOpen(true);
    };

    // 🚀 STEP 2: Executes API call after user confirms in the UI modal
    const confirmStatusToggle = async () => {
        if(!userToToggle) return;
        
        const loadToast = toast.loading(`Marking as ${statusAction}...`);
        try {
            await api.patch(`users/${userToToggle.id}/update_status/`, { status: statusAction });
            setUsers(users.map(u => u.id === userToToggle.id ? { ...u, account_status: statusAction, is_active: statusAction === 'ACTIVE' } : u));
            toast.success(`User ${statusAction === 'ACTIVE' ? 'Activated' : 'Hibernated'}!`, { id: loadToast });
            setIsStatusModalOpen(false);
        } catch (err) {
            // 401 CATCHER: Agar khud ka hi power cut kar diya
            if (err.response && err.response.status === 401) {
                toast.error("🚨 Self-Hibernation Detected! You are locked out.", { id: loadToast, duration: 4000 });
                localStorage.clear(); 
                setTimeout(() => window.location.href = '/login', 2000); 
            } else {
                toast.error("Status update failed", { id: loadToast });
            }
        } finally {
            if (statusAction !== 'HIBERNATE' || (statusAction === 'HIBERNATE' && !err?.response?.status === 401)) {
                setUserToToggle(null);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading("Processing...");
        
        const payload = {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            account_status: formData.account_status
        };
        if (formData.password && formData.password.trim() !== "") {
            payload.password = formData.password;
        }

        try {
            if (editMode) {
                await api.patch(`users/${formData.id}/`, payload);
                toast.success("User updated successfully!", { id: loadToast });
            } else {
                await api.post("users/", payload);
                toast.success("User created successfully!", { id: loadToast });
            }
            fetchUsers(); closeForm();
        } catch (err) {
            console.error("Save Error:", err.response?.data);
            let errorMsg = "Operation failed.";
            if (err.response && err.response.data) {
                const firstKey = Object.keys(err.response.data)[0];
                const firstError = err.response.data[firstKey];
                errorMsg = Array.isArray(firstError) ? `${firstKey}: ${firstError[0]}` : `${firstKey}: ${firstError}`;
            }
            toast.error(errorMsg, { id: loadToast });
        }
    };

    const openForm = (user = null) => {
        setEditMode(!!user);
        setFormData(user ? { ...user, password: "" } : { id: null, full_name: "", email: "", phone: "", role: "STAFF", password: "", account_status: "ACTIVE" });
        setIsFormOpen(true);
    };
    
    const openView = (user) => {
        setSelectedUser(user);
        setIsViewOpen(true);
    };

    const closeForm = () => setIsFormOpen(false);
    const closeView = () => setIsViewOpen(false);

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const cardVariants = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } } };

    return (
        <div style={{ display: "flex", background: "#f8fafc", height: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
            <SidebarModern />
            <Toaster position="top-center" toastOptions={{ style: { background: '#0f172a', color: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' } }} />

            <div style={{ flex: 1, marginLeft: "280px", padding: "40px", display: "flex", flexDirection: "column", height: "100vh", overflowY: 'auto' }} className="hide-scrollbar">

                {/* 🔥 HERO HEADER */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{duration: 0.6}} style={{ marginBottom: '40px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1.5px', margin: 0, lineHeight: '1.1', background: 'linear-gradient(to right, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display:'flex', alignItems:'center', gap:'15px' }}>
                            User Management <span style={{fontSize:'1.5rem'}}>✨</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '8px', fontWeight: '500' }}>Orchestrate your team's access and permissions.</p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.5)' }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => openForm()} 
                        style={primaryBtn}
                    >
                        <div style={{background:'rgba(255,255,255,0.2)', padding:'8px', borderRadius:'10px'}}><UserPlus size={22}/></div>
                        <span>Add New User</span>
                    </motion.button>
                </motion.div>

                {/* 🔍 FLOATING SEARCH */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: '35px', position: 'relative' }}>
                    <div style={{position:'absolute', left:'25px', top:'50%', transform:'translateY(-50%)', color:'#6366f1', filter:'drop-shadow(0 0 8px rgba(99,102,241,0.3))'}}>
                        <Search size={22} strokeWidth={2.5} />
                    </div>
                    <input 
                        placeholder="Search by name, email or role..." 
                        style={searchBar} 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </motion.div>

                {/* 📋 TABLE HEADER */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 0.8fr 1.2fr', padding: '0 30px 15px 30px', color: '#94a3b8', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                    <div>User Profile</div>
                    <div>Role</div>
                    <div>Contact Info</div>
                    <div>Status</div>
                    <div style={{ textAlign: 'right', paddingRight: '10px' }}>Actions</div>
                </div>

                {/* 🚀 USERS LIST (CARDS) */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom:'20px', flex:1 }}
                >
                    {loading ? <div style={emptyState}>Loading Data...</div> : 
                     currentUsers.length === 0 ? <div style={emptyState}>No users found.</div> :
                     currentUsers.map((user, i) => {
                        const theme = ROLE_THEMES[user.role] || ROLE_THEMES.STAFF;
                        const avatarBg = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
                        
                        // Status Logic
                        let statusColor = '#10b981'; 
                        let statusBg = '#dcfce7';
                        let StatusIcon = CheckCircle;
                        let statusText = "Active";

                        if(user.account_status === 'HIBERNATE') {
                            statusColor = '#8b5cf6'; 
                            statusBg = '#f3e8ff';
                            StatusIcon = Moon;
                            statusText = "Hibernated";
                        } else if (!user.is_active || user.account_status === 'INACTIVE') {
                            statusColor = '#ef4444'; 
                            statusBg = '#fee2e2';
                            StatusIcon = XCircle;
                            statusText = "Inactive";
                        }

                        return (
                            <motion.div 
                                key={user.id} 
                                variants={cardVariants}
                                whileHover={{ y: -6, scale: 1.005, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}
                                style={{...rowCard, borderLeft: theme.border}}
                            >
                                {/* Profile */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                    <div style={{ ...avatar, background: avatarBg }}>
                                        {user.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.05rem' }}>{user.full_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop:'2px', display:'flex', alignItems:'center', gap:'4px' }}>
                                            <Shield size={10} color={theme.color}/> ID: #{user.id.toString().padStart(4, '0')}
                                        </div>
                                    </div>
                                </div>

                                {/* Role Badge */}
                                <div>
                                    <span style={{ 
                                        ...badge, 
                                        background: theme.badgeBg, 
                                        color: theme.badgeText, 
                                        border: `1px solid ${theme.color}30` 
                                    }}>
                                        {user.role ? user.role.replace('_', ' ') : 'STAFF'}
                                    </span>
                                </div>

                                {/* Contact Info */}
                                <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                                    <div style={{ color: '#475569', fontWeight: '600', fontSize: '0.9rem', display:'flex', alignItems:'center', gap:'10px' }}>
                                        <Mail size={14} color="#64748b"/> {user.email}
                                    </div>
                                    {user.phone && (
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', display:'flex', alignItems:'center', gap:'10px' }}>
                                            <Smartphone size={14} color="#94a3b8"/> {user.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Status Badge */}
                                <div>
                                    <span style={{...statusBadge, color: statusColor, background: statusBg}}>
                                        <StatusIcon size={14}/> {statusText}
                                    </span>
                                </div>

                                {/* ✨ ACTIONS */}
                                <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    {/* 🚀 Updated Click Handler to open UI Modal */}
                                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => handleStatusToggleClick(user)} style={{...actionBtn, color: user.account_status === 'HIBERNATE' ? '#10b981' : '#8b5cf6', background:'#f3f4f6'}} title={user.account_status === 'HIBERNATE' ? "Activate" : "Hibernate"}>
                                        <Power size={18} />
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => openView(user)} style={{...actionBtn, color: '#3b82f6', background:'#eff6ff'}} title="View">
                                        <Eye size={18} />
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => openForm(user)} style={{...actionBtn, color: '#f59e0b', background:'#fffbeb'}} title="Edit">
                                        <Edit3 size={18} />
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => initiateDelete(user.id)} style={{...actionBtn, color: '#ef4444', background:'#fef2f2'}} title="Delete">
                                        <Trash2 size={18} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* PAGINATION */}
                {filteredUsers.length > itemsPerPage && (
                    <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <motion.button whileHover={{scale:1.1}} disabled={currentPage===1} onClick={()=>paginate(currentPage-1)} style={pageBtn}><ChevronLeft size={20}/></motion.button>
                        <span style={{padding:'10px 24px', background:'white', borderRadius:'14px', fontWeight:'800', color:'#0f172a', boxShadow:'0 4px 10px rgba(0,0,0,0.05)', display:'flex', alignItems:'center'}}>{currentPage} <span style={{color:'#cbd5e1', margin:'0 8px'}}>/</span> {totalPages}</span>
                        <motion.button whileHover={{scale:1.1}} disabled={currentPage===totalPages} onClick={()=>paginate(currentPage+1)} style={pageBtn}><ChevronRight size={20}/></motion.button>
                    </div>
                )}
            </div>

            {/* 🛠️ GLASS MODAL - FORM */}
            <AnimatePresence>
                {isFormOpen && (
                    <div style={overlay}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 30 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 30 }} 
                            transition={{type:'spring', duration:0.5}}
                            style={modal}
                        >
                            <div style={modalHeader}>
                                <div>
                                    <h2 style={{fontSize:'1.8rem', fontWeight:'900', color:'#0f172a', margin:0, letterSpacing:'-0.5px'}}>{editMode ? 'Edit User' : 'New User'}</h2>
                                    <p style={{fontSize:'0.95rem', color:'#64748b', marginTop:'5px'}}>Enter account details below.</p>
                                </div>
                                <motion.button whileHover={{ rotate: 90, background:'#e2e8f0' }} onClick={closeForm} style={closeBtn}><X size={22} /></motion.button>
                            </div>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>Full Name</label>
                                    <input required placeholder="e.g. John Doe" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} style={input} />
                                </div>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                                    <div style={inputGroup}>
                                        <label style={labelStyle}>Email Address</label>
                                        <input required type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={input} />
                                    </div>
                                    <div style={inputGroup}>
                                        <label style={labelStyle}>Phone Number</label>
                                        <input type="text" placeholder="+91 98765..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={input} />
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{flex:1}}>
                                        <label style={labelStyle}>Role Assignment</label>
                                        <div style={{position:'relative'}}>
                                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{...input, appearance:'none'}}>
                                                <option value="SUPER_ADMIN">Super Admin</option>
                                                <option value="SCHOOL_ADMIN">School Admin</option>
                                                <option value="STAFF">Staff</option>
                                                <option value="AGENT">Agent</option>
                                                <option value="TEACHER">Teacher</option>
                                            </select>
                                            <ChevronLeft size={16} style={{position:'absolute', right:'15px', top:'50%', transform:'translateY(-50%) rotate(-90deg)', pointerEvents:'none', color:'#64748b'}}/>
                                        </div>
                                    </div>
                                    <div style={{flex:1}}>
                                        <label style={labelStyle}>Account Status</label>
                                        <div style={{position:'relative'}}>
                                            <select value={formData.account_status} onChange={e => setFormData({ ...formData, account_status: e.target.value })} style={{...input, appearance:'none'}}>
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="HIBERNATE">Hibernate</option>
                                            </select>
                                            <ChevronLeft size={16} style={{position:'absolute', right:'15px', top:'50%', transform:'translateY(-50%) rotate(-90deg)', pointerEvents:'none', color:'#64748b'}}/>
                                        </div>
                                    </div>
                                </div>

                                {!editMode && (
                                    <div style={inputGroup}>
                                        <label style={labelStyle}>Secure Password</label>
                                        <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={input} />
                                    </div>
                                )}

                                <motion.button whileHover={{ scale: 1.02, boxShadow:'0 15px 30px -10px rgba(79, 70, 229, 0.6)' }} whileTap={{ scale: 0.98 }} type="submit" style={submitBtn}>
                                    {editMode ? 'Save Changes' : 'Create Account'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 👁️ GLASS MODAL - VIEW */}
            <AnimatePresence>
                {isViewOpen && selectedUser && (
                    <div style={overlay}>
                        <motion.div 
                            initial={{ y: 50, opacity: 0, scale:0.9 }} animate={{ y: 0, opacity: 1, scale:1 }} exit={{ y: 50, opacity: 0, scale:0.9 }} 
                            style={{...modal, width:'450px', padding:'0', overflow:'hidden', border:'none'}}
                        >
                            <div style={{background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding:'40px 30px', textAlign:'center', color:'white', position:'relative'}}>
                                <motion.button 
                                    whileHover={{ rotate: 90, scale: 1.1, background: 'rgba(255,255,255,0.4)' }} 
                                    whileTap={{ scale: 0.9 }} 
                                    onClick={closeView} 
                                    style={{
                                        position:'absolute', top:'15px', right:'15px', 
                                        background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)',
                                        color:'white', borderRadius:'50%', width:'36px', height:'36px', 
                                        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                                        backdropFilter:'blur(4px)', zIndex:10
                                    }}
                                >
                                    <X size={20} strokeWidth={2.5}/>
                                </motion.button>

                                <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'rgba(255,255,255,0.25)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.4)', boxShadow:'0 15px 30px rgba(0,0,0,0.2)' }}>
                                    {selectedUser.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <h2 style={{fontSize:'1.8rem', margin:0, fontWeight:'800'}}>{selectedUser.full_name}</h2>
                                <p style={{fontSize:'1rem', opacity:0.9, marginTop:'5px', fontWeight:'500'}}>{selectedUser.email}</p>
                            </div>

                            <div style={{padding:'35px'}}>
                                <DetailRow icon={<Shield size={20}/>} label="Assigned Role" value={selectedUser.role.replace('_', ' ')} />
                                <DetailRow icon={<User size={20}/>} label="System ID" value={`#${selectedUser.id}`} />
                                <DetailRow icon={<Smartphone size={20}/>} label="Phone" value={selectedUser.phone || "N/A"} />
                                <DetailRow icon={<HardDrive size={20}/>} label="Storage Used" value={`${selectedUser.storage_used_mb || 0} MB / ${selectedUser.storage_limit_mb || 500} MB`} />
                                <DetailRow icon={<Calendar size={20}/>} label="Date Joined" value={new Date(selectedUser.date_joined).toLocaleDateString()} />
                                <DetailRow 
                                    icon={selectedUser.account_status === 'ACTIVE' ? <CheckCircle size={20} color="#10b981"/> : <Moon size={20} color="#8b5cf6"/>} 
                                    label="Current Status" 
                                    value={selectedUser.account_status} 
                                    color={selectedUser.account_status === 'ACTIVE' ? "#10b981" : "#8b5cf6"}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🚀 NEW: CUSTOM STATUS TOGGLE CONFIRMATION MODAL */}
            <AnimatePresence>
                {isStatusModalOpen && userToToggle && (
                    <div style={overlay}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }} 
                            style={{
                                ...modal, width:'420px', textAlign:'center', 
                                borderTop: `6px solid ${statusAction === 'HIBERNATE' ? '#8b5cf6' : '#10b981'}`, 
                                borderRadius:'24px'
                            }}
                        >
                            <div style={{
                                width:'70px', height:'70px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', 
                                background: statusAction === 'HIBERNATE' ? '#f3e8ff' : '#dcfce7',
                                color: statusAction === 'HIBERNATE' ? '#8b5cf6' : '#10b981'
                            }}>
                                <Power size={32} />
                            </div>
                            <h2 style={{fontSize:'1.6rem', fontWeight:'800', color:'#1e293b', marginBottom:'10px'}}>
                                {statusAction === 'HIBERNATE' ? 'Hibernate User?' : 'Activate User?'}
                            </h2>
                            <p style={{color:'#64748b', fontSize:'0.95rem', marginBottom:'30px', lineHeight:'1.5'}}>
                                {statusAction === 'HIBERNATE' 
                                    ? `Are you sure you want to hibernate ${userToToggle.full_name}? If this is your own account, you will be logged out instantly.`
                                    : `Are you sure you want to activate ${userToToggle.full_name}'s account? They will regain access to the system.`}
                            </p>
                            <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                                <motion.button whileHover={{scale:1.05}} onClick={() => setIsStatusModalOpen(false)} style={{...secondaryBtn, flex:1}}>
                                    Cancel
                                </motion.button>
                                <motion.button 
                                    whileHover={{scale:1.05}} 
                                    onClick={confirmStatusToggle} 
                                    style={{
                                        ...deleteBtnStyle, flex:1, 
                                        background: statusAction === 'HIBERNATE' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        boxShadow: statusAction === 'HIBERNATE' ? '0 10px 20px -5px rgba(139, 92, 246, 0.4)' : '0 10px 20px -5px rgba(16, 185, 129, 0.4)'
                                    }}
                                >
                                    Yes, {statusAction === 'HIBERNATE' ? 'Hibernate' : 'Activate'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🗑️ DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div style={overlay}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }} 
                            style={{...modal, width:'400px', textAlign:'center', borderTop:'6px solid #ef4444', borderRadius:'24px'}}
                        >
                            <div style={{width:'70px', height:'70px', background:'#fee2e2', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#ef4444'}}>
                                <AlertTriangle size={32} />
                            </div>
                            <h2 style={{fontSize:'1.6rem', fontWeight:'800', color:'#1e293b', marginBottom:'10px'}}>Delete User?</h2>
                            <p style={{color:'#64748b', fontSize:'0.95rem', marginBottom:'30px', lineHeight:'1.5'}}>
                                This action cannot be undone. All data associated with this user will be permanently removed.
                            </p>
                            <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                                <motion.button whileHover={{scale:1.05}} onClick={() => setIsDeleteModalOpen(false)} style={{...secondaryBtn, flex:1}}>
                                    Cancel
                                </motion.button>
                                <motion.button whileHover={{scale:1.05}} onClick={confirmDelete} style={{...deleteBtnStyle, flex:1}}>
                                    Yes, Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🔥 CSS FOR PING ANIMATION */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

// ✨ ULTRA PREMIUM STYLES
const DetailRow = ({ icon, label, value, color }) => (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px dashed #e2e8f0'}}>
        <div style={{display:'flex', alignItems:'center', gap:'14px', color:'#64748b', fontSize:'1rem', fontWeight:'600'}}>
            <div style={{background:'#f8fafc', padding:'8px', borderRadius:'10px', color:'#94a3b8'}}>{icon}</div>
            {label}
        </div>
        <div style={{fontWeight:'800', color: color || '#1e293b', fontSize:'1rem'}}>{value}</div>
    </div>
);

const overlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modal = { background: 'white', padding: '40px', borderRadius: '32px', width: '550px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)', position:'relative', border:'1px solid white' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' };
const primaryBtn = { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '18px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', display:'flex', gap:'12px', alignItems:'center', boxShadow:'0 10px 25px -10px rgba(79, 70, 229, 0.5)', transition: 'all 0.3s' };
const secondaryBtn = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '14px 20px', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' };
const deleteBtnStyle = { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)' };
const searchBar = { width: '100%', padding: '18px 25px 18px 65px', borderRadius: '20px', border: 'none', background: 'white', fontSize: '1rem', outline: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', color: '#1e293b', fontWeight:'600', transition:'all 0.3s' };
const rowCard = { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 0.8fr 1.2fr', alignItems: 'center', background: 'white', padding: '22px 30px', borderRadius: '24px', border: '1px solid white', transition: 'all 0.3s', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.02)' };
const avatar = { width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.3rem', boxShadow:'0 8px 15px rgba(0,0,0,0.1)' };
const badge = { padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.8px', textTransform:'uppercase' };
const statusBadge = { padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', display:'flex', alignItems:'center', gap:'6px', width:'fit-content' };
const actionBtn = { border: 'none', width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition:'all 0.2s' };
const inputGroup = {display:'flex', flexDirection:'column', gap:'8px'};
const input = { width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none', color: '#1e293b', fontWeight:'600', transition:'all 0.3s' };
const labelStyle = { fontSize:'0.9rem', color:'#64748b', fontWeight:'700', marginLeft:'5px' };
const submitBtn = { width: '100%', padding: '18px', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: 'white', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', marginTop: '15px', boxShadow:'0 20px 40px -10px rgba(15, 23, 42, 0.4)' };
const closeBtn = { background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color:'#64748b' };
const emptyState = { textAlign: 'center', padding: '80px', color: '#94a3b8', background: 'white', borderRadius: '30px', fontWeight: '600', border:'2px dashed #e2e8f0', fontSize:'1.1rem' };
const pageBtn = { background: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', boxShadow:'0 4px 10px rgba(0,0,0,0.05)' };