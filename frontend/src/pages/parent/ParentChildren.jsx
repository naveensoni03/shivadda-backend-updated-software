import React, { useState, useEffect } from "react";
import SidebarParent from "../../components/SidebarParent";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Award, BookOpen, Clock, Activity, Star, Loader2 } from "lucide-react";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function ParentChildren() {
    const [loading, setLoading] = useState(true);
    const [childrenData, setChildrenData] = useState([]); // Real Data Array

    useEffect(() => {
        fetchProgressData();
    }, []);

    const fetchProgressData = async () => {
        try {
            // Django API hit
            const response = await api.get("auth/parents/profile/progress/");
            setChildrenData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Progress Fetch Error:", error);
            toast.error("Failed to load progress report.");
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
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>My Children Progress</span>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-hero">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
                        Student <span className="text-gradient">Progress</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
                        Track academic performance, real attendance, and recent timeline.
                    </p>
                </motion.div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', flexDirection: 'column', alignItems: 'center' }}>
                        <Loader2 size={40} className="spin" color="#ec4899" />
                        <p style={{ marginTop: '15px', color: '#64748b', fontWeight: '600' }}>Loading detailed reports...</p>
                    </div>
                ) : childrenData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ color: '#0f172a' }}>No Reports Available</h3>
                        <p style={{ color: '#64748b' }}>No students found linked to your profile.</p>
                    </div>
                ) : (
                    childrenData.map((child, index) => (
                        <div key={child.id || index} style={{ marginBottom: '60px' }}>
                            {/* Profile Quick Stats */}
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="profile-banner premium-shadow">
                                <div className="profile-info">
                                    <div className="avatar" style={{ background: index % 2 === 0 ? 'linear-gradient(135deg, #4f46e5, #3b82f6)' : 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                                        {child.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.8rem', fontWeight: '800' }}>{child.name}</h2>
                                        <p style={{ margin: 0, color: '#64748b', fontWeight: '600' }}>Class {child.grade} - {child.section} | Roll No: {child.roll_no}</p>
                                    </div>
                                </div>
                                <div className="banner-stats">
                                    <div className="b-stat">
                                        <span>Attendance</span>
                                        <h3 style={{ color: '#10b981' }}>{child.attendance}%</h3>
                                    </div>
                                    <div className="b-stat">
                                        <span>Overall Grade</span>
                                        <h3 style={{ color: '#4f46e5' }}>{child.overallGrade}</h3>
                                    </div>
                                    <div className="b-stat">
                                        <span>Class Rank</span>
                                        <h3 style={{ color: '#ec4899' }}>{child.rank}</h3>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid-2-col">
                                {/* Subject Performance */}
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="content-card premium-shadow">
                                    <div className="card-header">
                                        <h3><Activity size={20} color="#4f46e5" /> Subject Performance</h3>
                                    </div>
                                    <div className="card-body">
                                        {child.subjects.map((sub, i) => (
                                            <motion.div variants={itemVariants} key={i} className="subject-row">
                                                <div className="sub-info">
                                                    <span className="sub-name">{sub.name}</span>
                                                    <span className="sub-score" style={{ color: sub.color }}>{sub.score}%</span>
                                                </div>
                                                <div className="progress-bg">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${sub.score}%` }}
                                                        transition={{ duration: 1, delay: i * 0.2 }}
                                                        className="progress-fill"
                                                        style={{ background: sub.color }}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Recent Activities Timeline */}
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="content-card premium-shadow">
                                    <div className="card-header">
                                        <h3><Clock size={20} color="#ec4899" /> Recent Activities</h3>
                                    </div>
                                    <div className="card-body timeline-body">
                                        {child.activities.map((act, i) => (
                                            <motion.div variants={itemVariants} key={i} className="timeline-item">
                                                <div className="timeline-dot" style={{ background: act.color }}></div>
                                                <div className="timeline-content">
                                                    <p className="time-date">{act.date}</p>
                                                    <p className="time-text">{act.text}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .main-content { flex: 1; margin-left: 280px; padding: 30px 50px 100px 50px; height: 100vh; overflow-y: auto; overflow-x: hidden; width: calc(100% - 280px); box-sizing: border-box;}
                .hide-scrollbar::-webkit-scrollbar { width: 8px; }
                .hide-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
                .hide-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                
                .dashboard-top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .search-placeholder { background: white; padding: 10px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
                .welcome-hero { margin-bottom: 30px; }
                .text-gradient { background: linear-gradient(to right, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                
                .premium-shadow { background: white; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }
                
                .profile-banner { display: flex; justify-content: space-between; align-items: center; padding: 30px 40px; margin-bottom: 30px; background: white; }
                .profile-info { display: flex; align-items: center; gap: 20px; }
                .avatar { width: 70px; height: 70px; color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                
                .banner-stats { display: flex; gap: 40px; }
                .b-stat { text-align: right; }
                .b-stat span { color: #94a3b8; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                .b-stat h3 { margin: 5px 0 0 0; font-size: 1.8rem; font-weight: 900; }

                .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                
                .content-card { display: flex; flex-direction: column; background: white; }
                .card-header { padding: 25px 30px; border-bottom: 1px solid #f1f5f9; }
                .card-header h3 { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.2rem; color: #0f172a; font-weight: 800; }
                .card-body { padding: 30px; }

                /* Progress Bars */
                .subject-row { margin-bottom: 25px; }
                .subject-row:last-child { margin-bottom: 0; }
                .sub-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 700; }
                .sub-name { color: #334155; }
                .progress-bg { width: 100%; height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
                .progress-fill { height: 100%; border-radius: 10px; }

                /* Timeline */
                .timeline-item { display: flex; gap: 20px; margin-bottom: 25px; position: relative; }
                .timeline-item:last-child { margin-bottom: 0; }
                .timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 7px; top: 20px; bottom: -25px; width: 2px; background: #e2e8f0; }
                .timeline-dot { width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 0 0 4px #f8fafc; z-index: 1; margin-top: 3px; }
                .time-date { margin: 0 0 5px 0; font-size: 0.8rem; font-weight: 700; color: #94a3b8; }
                .time-text { margin: 0; color: #334155; font-weight: 600; font-size: 1rem; }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .main-content { margin-left: 0; padding: 25px; padding-top: 80px; width: 100%; }
                    .profile-banner { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .banner-stats { width: 100%; justify-content: space-between; }
                    .grid-2-col { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}