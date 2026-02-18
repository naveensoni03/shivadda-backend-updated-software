import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import {
    Users, DollarSign, BookOpen, Clock,
    TrendingUp, Activity, Bell, Calendar,
    ArrowUpRight, ArrowDownRight, Search, Filter, ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import WeatherWidget from "../components/WeatherWidget";

// 🎨 ULTRA PREMIUM LIGHT THEME
const THEME = {
    bg: '#F8FAFC',
    primary: '#6366F1',
    textMain: '#0F172A',
    textMuted: '#64748B',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    glassBorder: '1px solid rgba(255, 255, 255, 0.5)',
    shadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
};

export default function Dashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        students: 0,
        revenue: 0,
        pending: 0,
        staff: 0
    });

    const [activities, setActivities] = useState([]);

    // --- ✅ MASTER API CALL ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Students, Teachers, and Fees ek hi baar me!
                const res = await api.get(`dashboard/stats/?t=${new Date().getTime()}`);
                
                setStats({
                    students: res.data.students || 0,
                    staff: res.data.staff || 0,
                    revenue: res.data.revenue || 0,
                    pending: res.data.pending || 0
                });

            } catch (error) { 
                console.error("🛑 Master Stats API Error:", error); 
            }

            try {
                // 2. Fetch Logs / Activity separately
                const logsRes = await api.get('logs/activity/recent/');
                setActivities(logsRes.data || []);
            } catch (error) { 
                console.error("🛑 Activity API Error:", error); 
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount) => {
        if (!amount) return '₹ 0';
        if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹ ${(amount / 1000).toFixed(1)}K`;
        return `₹ ${amount}`;
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hrs ago`;
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    const getActivityStyle = (type) => {
        switch (type?.toUpperCase()) {
            case 'LOGIN': return { icon: <ShieldAlert size={16} color="#6366F1" />, bg: "#EEF2FF" };
            case 'PAYMENT': return { icon: <DollarSign size={16} color="#10B981" />, bg: "#ECFDF5" };
            case 'ADMISSION': return { icon: <Users size={16} color="#EC4899" />, bg: "#FDF2F8" };
            case 'HOMEWORK': return { icon: <BookOpen size={16} color="#F59E0B" />, bg: "#FFFBEB" };
            default: return { icon: <Activity size={16} color="#64748B" />, bg: "#F1F5F9" };
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="dashboard-page-wrapper" style={{ display: "flex", background: THEME.bg, height: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden", color: THEME.textMain }}>
            <SidebarModern />

            <div className="dashboard-main-content hide-scrollbar" style={{ flex: 1, marginLeft: "280px", padding: "30px 40px", display: "flex", flexDirection: "column", height: "100vh", overflowY: 'auto' }}>

                <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }}></div>

                {/* 🚀 HEADER & WELCOME */}
                <motion.div className="header-wrapper" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <span style={{ fontSize: '2rem' }}>👋</span>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: THEME.textMain, margin: 0, letterSpacing: '-1px' }}>
                                Good Morning, Admin
                            </h1>
                        </div>
                        <p style={{ color: THEME.textMuted, fontSize: '1rem', fontWeight: '500' }}>Here's what's happening in your academy today.</p>
                    </div>

                    <div className="weather-wrapper" style={{ marginBottom: '20px' }}>
                        <WeatherWidget />
                    </div>

                    <div className="header-actions" style={{ display: 'flex', gap: '15px' }}>
                        <div className="sys-status" style={{ background: 'white', padding: '10px 15px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: THEME.shadow, border: THEME.glassBorder }}>
                            <div style={{ width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 10px #22C55E' }}></div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.textMain }}>System Online</span>
                        </div>
                        <motion.button onClick={() => navigate('/logs')} whileHover={{ scale: 1.05 }} style={{ background: 'white', width: '45px', height: '45px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: THEME.glassBorder, boxShadow: THEME.shadow, cursor: 'pointer', flexShrink: 0 }}>
                            <Bell size={20} color="#64748B" />
                        </motion.button>
                        <motion.button onClick={() => navigate('/settings')} whileHover={{ scale: 1.05 }} style={{ background: THEME.primary, width: '45px', height: '45px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -5px rgba(99, 102, 241, 0.4)', cursor: 'pointer', flexShrink: 0 }}>
                            <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" style={{ width: '100%', height: '100%', borderRadius: '14px' }} />
                        </motion.button>
                    </div>
                </motion.div>

                {/* 📊 STATS GRID */}
                <motion.div className="stats-grid" variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
                    <div onClick={() => navigate('/students')} style={{ cursor: 'pointer' }}>
                        <StatCard title="Total Students" value={stats.students} trend="+12%" isPositive={true} icon={<Users size={24} color="#6366F1" />} color="#6366F1" />
                    </div>
                    <div onClick={() => navigate('/fees')} style={{ cursor: 'pointer' }}>
                        <StatCard title="Total Revenue" value={formatCurrency(stats.revenue)} trend="+8.5%" isPositive={true} icon={<DollarSign size={24} color="#10B981" />} color="#10B981" />
                    </div>
                    <div onClick={() => navigate('/fees')} style={{ cursor: 'pointer' }}>
                        <StatCard title="Pending Fees" value={formatCurrency(stats.pending)} trend="-2%" isPositive={false} icon={<Activity size={24} color="#F59E0B" />} color="#F59E0B" />
                    </div>
                    <div onClick={() => navigate('/teachers')} style={{ cursor: 'pointer' }}>
                        <StatCard title="Total Staff" value={stats.staff} trend="Active" isPositive={true} icon={<BookOpen size={24} color="#EC4899" />} color="#EC4899" />
                    </div>
                </motion.div>

                {/* 🧩 MAIN CONTENT GRID */}
                <div className="main-grid-container" style={{ position: 'relative', zIndex: 10 }}>

                    <motion.div className="left-column" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        {/* ✅ Quick Actions */}
                        <div style={{ background: THEME.cardBg, backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '25px', border: THEME.glassBorder, boxShadow: THEME.shadow }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Quick Actions</h3>
                            </div>
                            <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                <ActionCard icon={<Users size={22} />} label="Admission" color="#6366F1" onClick={() => navigate('/students')} />
                                <ActionCard icon={<DollarSign size={22} />} label="Collect Fees" color="#10B981" onClick={() => navigate('/fees')} />
                                <ActionCard icon={<BookOpen size={22} />} label="Homework" color="#F59E0B" onClick={() => navigate('/homework')} />
                                <ActionCard icon={<Calendar size={22} />} label="Attendance" color="#EC4899" onClick={() => navigate('/attendance')} />
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="chart-card" style={{ background: THEME.cardBg, backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '25px', border: THEME.glassBorder, boxShadow: THEME.shadow, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Fee Collection Trends</h3>
                                    <p style={{ fontSize: '0.85rem', color: THEME.textMuted, margin: 0 }}>Financial analytics for this year</p>
                                </div>
                                <div style={{ background: '#F1F5F9', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600', color: THEME.textMuted }}>
                                    This Year ▼
                                </div>
                            </div>
                            
                            <div className="chart-wrapper" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                                <div className="chart-inner" style={{ minWidth: '400px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                    <div className="chart-bars-wrapper" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', gap: '10px' }}>
                                        {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 1, delay: i * 0.05 }} style={{ width: '100%', background: i === 11 ? '#6366F1' : '#E0E7FF', borderRadius: '8px 8px 0 0', position: 'relative' }}>
                                                {i === 11 && (
                                                    <div className="chart-tooltip" style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: '#1E293B', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                                        {formatCurrency(stats.revenue)}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="chart-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.7rem', color: THEME.textMuted, fontWeight: '600', padding: '0 10px' }}>
                                        <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>

                    <motion.div className="right-column" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '25px', height: '100%', border: THEME.glassBorder, boxShadow: THEME.shadow, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Recent Activity</h3>
                                <div style={{ width: '30px', height: '30px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Filter size={14} color="#64748B" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                                {/* ✅ REAL ACTIVITY MAPPING */}
                                {activities.length > 0 ? (
                                    activities.slice(0, 4).map((activity, idx) => {
                                        const style = getActivityStyle(activity.action_type);
                                        return (
                                            <ActivityItem
                                                key={idx}
                                                title={activity.action_type || 'System Action'}
                                                desc={activity.description || 'Action performed by user'}
                                                time={formatTimeAgo(activity.timestamp)}
                                                icon={style.icon}
                                                bg={style.bg}
                                            />
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', color: THEME.textMuted, padding: '20px 0', fontSize: '0.9rem' }}>
                                        No recent activities found.
                                    </div>
                                )}
                            </div>

                            {/* ✅ Added route to Logs */}
                            <motion.button onClick={() => navigate('/logs')} whileHover={{ scale: 1.02 }} style={{ width: '100%', padding: '14px', background: '#F8FAFC', border: 'none', borderRadius: '14px', color: THEME.textMuted, fontWeight: '700', marginTop: '25px', cursor: 'pointer' }}>
                                View All Logs
                            </motion.button>
                        </div>
                    </motion.div>

                </div>

            </div>

            {/* 🚀 CSS FOR 100% RESPONSIVENESS */}
            <style>{`
                /* Core Reset & Fixes */
                html, body, #root { margin: 0; padding: 0; height: 100%; }
                
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                /* Default Desktop Layout */
                .main-grid-container {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 30px;
                }

                /* 📱 RESPONSIVE MEDIA QUERIES */
                @media (max-width: 1024px) {
                    .dashboard-main-content { margin-left: 0 !important; max-width: 100%; width: 100%; }
                }

                @media (max-width: 850px) {
                    /* Unlock Scroll on Mobile completely */
                    html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
                    
                    .dashboard-page-wrapper {
                        display: block !important; 
                        height: auto !important;
                        min-height: 100vh !important;
                    }

                    .dashboard-main-content {
                        margin-left: 0 !important;
                        padding: 15px !important;
                        padding-top: 85px !important; 
                        padding-bottom: 120px !important; /* Space for chatbot */
                        width: 100vw !important;
                        max-width: 100vw !important;
                        height: auto !important;
                        min-height: 100vh !important;
                        overflow: visible !important;
                        display: block !important; /* Break Flex lock */
                    }

                    /* Header Fixes */
                    .header-wrapper { flex-direction: column; align-items: flex-start !important; gap: 20px; }
                    .header-actions { width: 100%; justify-content: space-between; }
                    .sys-status { flex: 1; justify-content: center; }

                    /* Stats Grid Mobile Fix */
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 15px !important; }
                    
                    /* ✅ FIXED: Main Grid Mobile Stack (Fixes right-side squishing) */
                    .main-grid-container { 
                        display: flex !important; 
                        flex-direction: column !important; 
                        gap: 20px !important; 
                        width: 100%;
                    }

                    /* Quick Actions Mobile Fix */
                    .quick-actions-grid { grid-template-columns: repeat(2, 1fr) !important; }

                    /* Fix Right Column Height */
                    .right-column > div { height: auto !important; min-height: 400px; }
                }

                /* Ultra small devices */
                @media (max-width: 400px) {
                    .stats-grid { grid-template-columns: 1fr !important; }
                    .header-actions { flex-wrap: wrap; }
                    .quick-actions-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

        </div>
    );
}

// 🧩 COMPONENTS

const StatCard = ({ title, value, trend, isPositive, icon, color }) => (
    <motion.div whileHover={{ y: -5, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.1)' }} style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: THEME.shadow, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '160px', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', background: `${color}15`, borderRadius: '14px', color: color }}>{icon}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: isPositive ? '#ECFDF5' : '#FEF2F2', color: isPositive ? '#10B981' : '#EF4444', fontSize: '0.75rem', fontWeight: '700' }}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
            </div>
        </div>
        <div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: THEME.textMain }}>{value}</div>
            <div style={{ fontSize: '0.9rem', color: THEME.textMuted, fontWeight: '500' }}>{title}</div>
        </div>
    </motion.div>
);

const ActionCard = ({ icon, label, color, onClick }) => (
    <motion.button onClick={onClick} whileHover={{ scale: 1.05, backgroundColor: `${color}10` }} whileTap={{ scale: 0.95 }} style={{ background: '#F8FAFC', border: 'none', padding: '20px 10px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.3s', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ padding: '12px', background: 'white', borderRadius: '50%', color: color, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            {icon}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: THEME.textMain }}>{label}</span>
    </motion.button>
);

const ActivityItem = ({ title, desc, time, icon, bg }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: THEME.textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            <div style={{ fontSize: '0.8rem', color: THEME.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
        </div>
        <div style={{ fontSize: '0.75rem', color: THEME.textMuted, fontWeight: '600', flexShrink: 0 }}>{time}</div>
    </div>
);