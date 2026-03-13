import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Calendar, IndianRupee, Video,
  FileText, CheckCircle, Bell, ArrowRight, BookOpen, LogOut, Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// 🔥 REAL API IMPORT
import api from "../../api/axios";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("Instructor");
  const [isLoading, setIsLoading] = useState(true);

  // Stats state ab khali hai, backend se bharega
  const [stats, setStats] = useState({
    totalStudents: 0,
    upcomingClasses: 0,
    walletBalance: 0,
    pendingEvaluations: 0
  });

  const [todaysSchedule, setTodaysSchedule] = useState([]);

  useEffect(() => {
    // Local storage se pehle naam nikal lo (Taaki turant dikh jaye)
    const name = localStorage.getItem("user_name");
    if (name) setTeacherName(name);

    // Backend se data fetch karo
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/teachers/dashboard-stats/');

      // Backend se aayi hui real values set karo
      setStats({
        totalStudents: response.data.stats.totalStudents,
        upcomingClasses: response.data.stats.upcomingClasses,
        walletBalance: response.data.stats.walletBalance,
        pendingEvaluations: response.data.stats.pendingEvaluations
      });

      setTodaysSchedule(response.data.schedule || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load real dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    setTimeout(() => {
      navigate("/teacher/login");
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="teacher-dashboard-wrapper">
      <Toaster position="top-right" />

      <div className="dashboard-inner-area">

        {/* HEADER ANIMATED */}
        <motion.header
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-titles">
            <h1 className="gradient-text">Welcome back, {teacherName} 🎓</h1>
            <p className="subtitle">Here's what's happening in your classes today.</p>
          </div>
          <div className="header-actions">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="icon-btn" title="Notifications">
              <Bell size={20} />
              <span className="badge">3</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="logout-btn">
              <LogOut size={18} className="logout-icon" /> <span className="logout-text">Logout</span>
            </motion.button>
          </div>
        </motion.header>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Loader2 size={40} className="spin-icon" color="#4f46e5" />
          </div>
        ) : (
          <>
            {/* STATS GRID ANIMATED */}
            <motion.div
              className="stats-grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="stat-card">
                <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <Users size={24} />
                </div>
                <div className="stat-details">
                  <h3>Total Students</h3>
                  <p>{stats.totalStudents}</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="stat-card">
                <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                  <Calendar size={24} />
                </div>
                <div className="stat-details">
                  <h3>Upcoming Classes</h3>
                  <p>{stats.upcomingClasses}</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="stat-card">
                <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <IndianRupee size={24} />
                </div>
                <div className="stat-details">
                  <h3>Wallet Balance</h3>
                  <p>₹{Number(stats.walletBalance).toLocaleString('en-IN')}</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="stat-card">
                <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <CheckCircle size={24} />
                </div>
                <div className="stat-details">
                  <h3>Pending Evaluations</h3>
                  <p>{stats.pendingEvaluations}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* HORIZONTAL SCROLL WRAPPER FOR MOBILE */}
            <div className="horizontal-scroll-container">
              <div className="content-grid">

                {/* LEFT: TODAY'S SCHEDULE */}
                <motion.div
                  className="card-glass schedule-section"
                  variants={slideInLeft}
                  initial="hidden"
                  animate="show"
                >
                  <div className="section-header">
                    <h2>📅 Today's Schedule</h2>
                    <button className="text-link">View Full Calendar</button>
                  </div>

                  <motion.div
                    className="schedule-list"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {todaysSchedule.length > 0 ? (
                      todaysSchedule.map((item) => (
                        <motion.div key={item.id} variants={itemVariants} className="schedule-item">
                          <div className="time-block">{item.time}</div>
                          <div className="info-block">
                            <h4>{item.subject}</h4>
                            <span className={`tag ${item.type.includes('Live') ? 'live' : 'task'}`}>
                              {item.type}
                            </span>
                          </div>
                          <button className="action-arrow">
                            <ArrowRight size={20} />
                          </button>
                        </motion.div>
                      ))
                    ) : (
                      <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0" }}>No schedule for today.</p>
                    )}
                  </motion.div>
                </motion.div>

                {/* RIGHT: QUICK ACTIONS */}
                <motion.div
                  className="card-glass quick-actions-section"
                  variants={slideInRight}
                  initial="hidden"
                  animate="show"
                >
                  <div className="section-header">
                    <h2>⚡ Quick Actions</h2>
                  </div>
                  <motion.div
                    className="actions-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {/* 🔥 ASLI BUTTON LINKS YAHAN HAIN 🔥 */}
                    <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} className="quick-action-btn" onClick={() => navigate('/teacher/classes')}>
                      <div className="action-icon live-icon"><Video size={24} /></div>
                      <span>Start Live Class</span>
                    </motion.button>

                    <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} className="quick-action-btn" onClick={() => navigate('/teacher/material')}>
                      <div className="action-icon material-icon"><BookOpen size={24} /></div>
                      <span>Upload Material</span>
                    </motion.button>

                    <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} className="quick-action-btn" onClick={() => navigate('/teacher/exams')}>
                      <div className="action-icon exam-icon"><FileText size={24} /></div>
                      <span>Create Test</span>
                    </motion.button>

                    <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} className="quick-action-btn" onClick={() => navigate('/teacher/assignments')}>
                      <div className="action-icon evaluate-icon"><CheckCircle size={24} /></div>
                      <span>Evaluate Papers</span>
                    </motion.button>
                  </motion.div>
                </motion.div>

              </div>
            </div>
          </>
        )}
      </div>

      {/* 🎨 SCROLL FIX CSS */}
      <style>{`
        .teacher-dashboard-wrapper {
          background: transparent; 
          width: 100%;
          height: 100vh;           
          overflow-y: auto;        
          overflow-x: hidden;      
          font-family: 'Inter', sans-serif;
        }
        
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .teacher-dashboard-wrapper::-webkit-scrollbar { width: 8px; height: 8px; }
        .teacher-dashboard-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .teacher-dashboard-wrapper::-webkit-scrollbar-track { background: transparent; }

        .dashboard-inner-area {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          box-sizing: border-box;
          padding: 20px 30px 100px 30px; 
        }

        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        
        .gradient-text {
          font-size: 2.2rem; font-weight: 800; margin: 0 0 5px 0;
          background: linear-gradient(135deg, #0f172a 0%, #4f46e5 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        
        .subtitle { color: #64748b; margin: 0; font-size: 1rem; }
        .header-actions { display: flex; gap: 15px; align-items: center; }

        .icon-btn {
          position: relative; background: white; border: 1px solid #e2e8f0;
          border-radius: 50%; width: 45px; height: 45px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #475569; transition: 0.3s;
        }
        .icon-btn:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); color: #0f172a; }
        
        .badge {
          position: absolute; top: 0px; right: 0px; background: #ef4444; color: white;
          font-size: 0.7rem; font-weight: bold; width: 18px; height: 18px;
          display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white;
        }

        .logout-btn {
          display: flex; align-items: center; gap: 8px; background: #ffe4e6; color: #e11d48;
          border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s;
        }
        .logout-btn:hover { background: #fda4af; color: #9f1239; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; width: 100%; }
        
        .stat-card {
          background: white; padding: 20px; border-radius: 20px; display: flex;
          align-items: center; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;
        }
        
        .stat-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .stat-details h3 { margin: 0 0 5px 0; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-details p { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }

        .horizontal-scroll-container { width: 100%; }
        .content-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 30px; width: 100%; align-items: stretch; }

        .card-glass {
          background: white; padding: 25px; border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; flex-direction: column;
        }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-header h2 { margin: 0; font-size: 1.3rem; color: #1e293b; font-weight: 800; }
        .text-link { background: none; border: none; color: #4f46e5; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
        .text-link:hover { text-decoration: underline; }

        .schedule-list { display: flex; flex-direction: column; gap: 15px; width: 100%; }

        .schedule-item {
          display: flex; align-items: center; padding: 16px; background: #f8fafc;
          border-radius: 16px; border: 1px solid #e2e8f0; transition: 0.3s; width: 100%; box-sizing: border-box;
        }
        .schedule-item:hover { background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-color: #cbd5e1; }

        .time-block { width: 100px; font-weight: 800; color: #0f172a; font-size: 0.95rem; border-right: 2px solid #e2e8f0; margin-right: 15px; }
        .info-block { flex: 1; display: flex; flex-direction: column; gap: 5px; }
        .info-block h4 { margin: 0; font-size: 1rem; color: #1e293b; font-weight: 700; }
        
        .tag { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; width: max-content; }
        .tag.live { background: #fee2e2; color: #dc2626; }
        .tag.task { background: #e0e7ff; color: #4f46e5; }

        .action-arrow { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.3s; }
        .schedule-item:hover .action-arrow { color: #4f46e5; transform: translateX(5px); }

        .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; height: 100%; }

        .quick-action-btn {
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; cursor: pointer; transition: 0.3s; padding: 25px 10px; min-height: 120px;
        }
        .quick-action-btn:hover { background: white; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #cbd5e1; transform: translateY(-3px);}
        .quick-action-btn span { font-weight: 700; color: #334155; font-size: 0.9rem; text-align: center; }

        .action-icon { width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .live-icon { background: #fee2e2; color: #dc2626; }
        .material-icon { background: #dcfce7; color: #16a34a; }
        .exam-icon { background: #e0e7ff; color: #4f46e5; }
        .evaluate-icon { background: #fef3c7; color: #d97706; }

        @media (max-width: 1024px) {
          .horizontal-scroll-container { overflow-x: auto; overflow-y: hidden; padding-bottom: 15px; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
          .horizontal-scroll-container::-webkit-scrollbar { height: 6px; }
          .horizontal-scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .content-grid { display: flex; flex-direction: row; width: max-content; gap: 20px; }
          .schedule-section { width: 350px; min-width: 350px; }
          .quick-actions-section { width: 350px; min-width: 350px; }
        }

        @media (max-width: 768px) {
          .dashboard-inner-area { padding: 15px 15px 100px 15px; }
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .header-actions { width: 100%; justify-content: flex-end; }
          .gradient-text { font-size: 1.6rem; }
          .stats-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
          .stat-card { flex-direction: column; align-items: flex-start; padding: 15px; gap: 10px; }
          .stat-icon { width: 45px; height: 45px; }
          .stat-details p { font-size: 1.5rem; }
          .schedule-section { width: 300px; min-width: 300px; }
          .quick-actions-section { width: 300px; min-width: 300px; }
          .card-glass { padding: 15px; }
          .schedule-item { padding: 12px; }
          .time-block { width: 80px; font-size: 0.85rem; padding-right: 10px; margin-right: 10px; }
          .quick-action-btn { padding: 20px 10px; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .stat-card { flex-direction: row; align-items: center; }
          .actions-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .logout-text { display: none; }
          .quick-action-btn { padding: 15px 5px; }
          .quick-action-btn span { font-size: 0.75rem; }
          .action-icon { width: 40px; height: 40px; }
          .action-icon svg { width: 20px; height: 20px; }
          .schedule-section { width: 85vw; min-width: 85vw; }
          .quick-actions-section { width: 85vw; min-width: 85vw; }
        }
      `}</style>
    </div>
  );
}