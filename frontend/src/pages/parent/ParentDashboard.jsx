import React, { useState, useEffect } from "react";
import SidebarParent from "../../components/SidebarParent";
import { motion } from "framer-motion";
import { Calendar, Award, CreditCard, ChevronRight, Loader2, Sparkles } from "lucide-react";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // 👈 Naya Import Page change karne ke liye

export default function ParentDashboard() {
    const [loading, setLoading] = useState(true);
    const [childrenData, setChildrenData] = useState([]);
    const [parentName, setParentName] = useState(localStorage.getItem("user_full_name") || "Parent");

    const navigate = useNavigate(); // 👈 Navigation hook initialize kiya

    useEffect(() => {
        fetchMyChildren();
    }, []);

    // 🚀 BACKEND SE BACCHO KA DATA MANGWANE WALA FUNCTION
    const fetchMyChildren = async () => {
        try {
            const response = await api.get("auth/parents/profile/my_children/");

            if (response.data) {
                setParentName(response.data.parent_name);
                setChildrenData(response.data.children_records || []);
            }
            setLoading(false);
        } catch (error) {
            console.error("Dashboard Error:", error);
            if (!loading) toast.error("Unable to connect to server.");
            setLoading(false);
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

    return (
        <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            <SidebarParent />
            <Toaster position="top-center" />

            <div className="main-content hide-scrollbar">
                <div className="dashboard-top-nav">
                    <div className="search-placeholder">
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Parent Portal Overview</span>
                    </div>
                    <div className="profile-quick">
                        <div className="nav-icon"><Sparkles size={18} color="#94a3b8" /></div>
                        <div className="avatar">{parentName.charAt(0)}</div>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-hero">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0' }}>
                        Welcome back, <span className="text-gradient">{parentName}</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color="#8b5cf6" /> Here's what's happening with your children today.
                    </p>
                </motion.div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', flexDirection: 'column', alignItems: 'center' }}>
                        <Loader2 size={40} className="spin" color="#4f46e5" />
                        <p style={{ marginTop: '15px', color: '#64748b', fontWeight: '600' }}>Fetching records from school database...</p>
                    </div>
                ) : childrenData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ color: '#0f172a' }}>No Students Linked</h3>
                        <p style={{ color: '#64748b' }}>Please contact school administration to link your children to your profile. Make sure your Phone Number matches the primary mobile number in the student's record.</p>
                    </div>
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="children-grid">
                        {childrenData.map((child, index) => (
                            <motion.div variants={itemVariants} key={child.id || index} className="child-card premium-shadow">
                                <div className="child-header">
                                    <div className="child-avatar" style={{ background: index % 2 === 0 ? 'linear-gradient(135deg, #4f46e5, #3b82f6)' : 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                                        {child.first_name ? child.first_name.charAt(0) : 'S'}
                                    </div>
                                    <div className="child-info">
                                        <h2>{child.name}</h2>
                                        <p>Student ID: #{child.student_id}</p>
                                    </div>
                                    <div className="class-badge">Class {child.class}</div>
                                </div>

                                <div className="metrics-grid">
                                    <div className="metric-box">
                                        <Calendar size={18} color="#6366f1" className="mb-icon" />
                                        <div>
                                            <span className="m-label">Attendance</span>
                                            <span className="m-val">{child.attendance}</span>
                                        </div>
                                    </div>
                                    <div className="metric-box">
                                        <Award size={18} color="#ec4899" className="mb-icon" />
                                        <div>
                                            <span className="m-label">Latest Grade</span>
                                            <span className="m-val">{child.latest_exam_grade}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="fee-alert">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <CreditCard size={18} color={child.fee_status === 'Paid' ? '#10b981' : '#ef4444'} />
                                        <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Fee Status</span>
                                    </div>
                                    <span className={`status-tag ${child.fee_status === 'Paid' ? 'tag-green' : 'tag-red'}`}>
                                        {child.fee_status.toUpperCase()}
                                    </span>
                                </div>

                                {/* 🚀 FIX: Yahan onClick pe ab navigate hoga */}
                                <button className="full-report-btn" onClick={() => navigate('/parent/children')}>
                                    View Full Report <ChevronRight size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            <style>{`
                .main-content { flex: 1; margin-left: 280px; padding: 30px 50px 100px 50px; height: 100vh; overflow-y: auto; overflow-x: hidden; width: calc(100% - 280px); box-sizing: border-box; }
                .hide-scrollbar::-webkit-scrollbar { width: 8px; }
                .hide-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
                .hide-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                
                .dashboard-top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .search-placeholder { background: white; padding: 10px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
                .profile-quick { display: flex; align-items: center; gap: 15px; }
                .nav-icon { width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; }
                .nav-icon:hover { background: #f8fafc; }
                .avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3); }
                
                .welcome-hero { margin-bottom: 40px; }
                .text-gradient { background: linear-gradient(to right, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                
                .premium-shadow { background: white; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }

                .children-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; margin-bottom: 50px; }
                
                .child-card { padding: 30px; display: flex; flex-direction: column; transition: 0.3s; position: relative; }
                .child-card:hover { transform: translateY(-5px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); }
                
                .child-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; position: relative; }
                .child-avatar { width: 70px; height: 70px; border-radius: 20px; color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; box-shadow: 0 10px 20px rgba(0,0,0,0.1); flex-shrink: 0; }
                .child-info h2 { margin: 0 0 5px 0; font-size: 1.4rem; color: #0f172a; font-weight: 800; }
                .child-info p { margin: 0; color: #64748b; font-size: 0.85rem; font-weight: 600; }
                .class-badge { position: absolute; top: 0; right: 0; background: #f8fafc; color: #64748b; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; border: 1px solid #f1f5f9; }

                .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
                .metric-box { display: flex; align-items: center; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 16px; border: 1px solid #f1f5f9; }
                .mb-icon { background: white; padding: 8px; border-radius: 10px; width: 35px; height: 35px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .m-label { display: block; font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
                .m-val { display: block; font-size: 1.1rem; color: #0f172a; font-weight: 900; }

                .fee-alert { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-radius: 16px; border: 1px dashed #cbd5e1; margin-bottom: 25px; background: #fdfefe; }
                .status-tag { padding: 6px 15px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px; }
                .tag-red { background: #fee2e2; color: #ef4444; }
                .tag-green { background: #dcfce7; color: #10b981; }

                .full-report-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: transparent; color: #4f46e5; border: 1px solid #e0e7ff; padding: 15px; border-radius: 14px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: 0.2s; }
                .full-report-btn:hover { background: #e0e7ff; }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .main-content { margin-left: 0; padding: 25px; padding-top: 80px; width: 100%; }
                    .children-grid { grid-template-columns: 1fr; }
                    .class-badge { position: relative; display: inline-block; margin-top: 10px; }
                    .child-header { align-items: flex-start; flex-direction: column; }
                }
            `}</style>
        </div>
    );
}