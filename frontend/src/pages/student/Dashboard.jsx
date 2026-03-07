import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Search, Bell, CloudSun, Clock, Calendar as CalendarIcon,
  BookOpen, Target, CheckCircle, TrendingUp, PlayCircle, FileText, ChevronRight, Loader2
} from "lucide-react";
import StudentSidebar from "../../components/StudentSidebar";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Student");

  // Live Clock & Dynamic Data States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashData, setDashData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auth Check & Data Load
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/student/login");
      return;
    }
    const storedName = localStorage.getItem("user_name");
    if (storedName) setUserName(storedName);

    // Clock Timer
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Fetch Backend Data
    fetchDashboardData();

    return () => clearInterval(timer);
  }, [navigate]);

  // 🚀 FETCH FROM DJANGO API
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/students/dashboard-summary/");
      setDashData(res.data);
    } catch (error) {
      console.error("Dashboard API Error:", error);
      toast.error("Could not fetch latest data from server.");
    } finally {
      setIsLoading(false);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Animation variants
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="dashboard-layout">
      <Toaster position="top-right" />
      {/* Animated Background */}
      <motion.div className="ambient-bg" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />

      <StudentSidebar />

      <main className="dashboard-main custom-scroll">

        {/* 🌟 TOP BAR */}
        <header className="dash-header">
          <div className="header-left">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search courses, exams, or topics (AI Search)..." />
            </div>
          </div>

          <div className="header-right">
            {/* Weather & Clock Widgets */}
            <div className="widget-pill weather-pill">
              <CloudSun size={18} color="#f59e0b" />
              <span>28°C Haze | India</span>
            </div>
            <div className="widget-pill time-pill">
              <Clock size={18} color="#4f46e5" />
              <span style={{ fontWeight: '700' }}>{formattedTime}</span>
            </div>

            <button className="icon-btn notif-btn">
              <Bell size={20} />
              <span className="notif-badge">3</span>
            </button>
            <div className="header-avatar" onClick={() => navigate("/student/profile")}>
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--primary)' }}>
            <Loader2 size={50} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <h3 style={{ marginTop: '20px' }}>Loading your dashboard...</h3>
          </div>
        ) : (
          <motion.div className="dash-content" variants={staggerContainer} initial="hidden" animate="show">

            {/* 🌟 WELCOME BANNER */}
            <motion.div className="welcome-banner glass-panel" variants={fadeUp}>
              <div>
                <p className="date-text"><CalendarIcon size={14} /> {formattedDate}</p>
                <h1>Welcome back, <span className="highlight-text">{userName}</span>! 👋</h1>
                <p className="subtitle">
                  You have {dashData?.schedule?.filter(s => s.is_live).length || 0} live classes and {dashData?.tasks?.length || 0} pending tasks today. Let's make it a great day of learning.
                </p>
              </div>
              <div className="banner-graphic">
                <div className="floating-circle c1"></div>
                <div className="floating-circle c2"></div>
              </div>
            </motion.div>

            {/* 🌟 KPI STATS CARDS (Connected to API) */}
            <div className="stats-grid">
              <motion.div className="stat-card glass-panel" variants={fadeUp} whileHover={{ y: -5 }}>
                <div className="stat-icon-box bg-blue"><BookOpen size={24} color="#3b82f6" /></div>
                <div className="stat-info">
                  <h3>{dashData?.stats?.enrolled_courses || 0}</h3>
                  <p>Enrolled Courses</p>
                </div>
              </motion.div>
              <motion.div className="stat-card glass-panel" variants={fadeUp} whileHover={{ y: -5 }}>
                <div className="stat-icon-box bg-green"><CheckCircle size={24} color="#10b981" /></div>
                <div className="stat-info">
                  <h3>{dashData?.stats?.attendance_percentage || 0}%</h3>
                  <p>Overall Attendance</p>
                </div>
              </motion.div>
              <motion.div className="stat-card glass-panel" variants={fadeUp} whileHover={{ y: -5 }}>
                <div className="stat-icon-box bg-orange"><Target size={24} color="#f59e0b" /></div>
                <div className="stat-info">
                  <h3>{dashData?.stats?.average_cgpa || 0}%</h3>
                  <p>Average CGPA / Marks</p>
                </div>
              </motion.div>
              <motion.div className="stat-card glass-panel" variants={fadeUp} whileHover={{ y: -5 }}>
                <div className="stat-icon-box bg-purple"><TrendingUp size={24} color="#8b5cf6" /></div>
                <div className="stat-info">
                  <h3>+{dashData?.stats?.performance_growth || 0}%</h3>
                  <p>Performance Growth</p>
                </div>
              </motion.div>
            </div>

            <div className="dash-grid-2">
              {/* 🌟 TODAY'S SCHEDULE (Connected to API) */}
              <motion.div className="schedule-section glass-panel" variants={fadeUp}>
                <div className="section-header">
                  <h2>Today's Schedule</h2>
                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/student/timetable")}
                  >
                    View Timetable
                  </button>
                </div>
                <div className="schedule-list">
                  {dashData?.schedule?.map((item) => (
                    <div key={item.id} className={`schedule-item ${item.is_live ? 'active' : ''}`}>
                      <div className="time-col">
                        <span className="time">{item.time}</span>
                        <span className="duration">{item.duration}</span>
                      </div>
                      <div className="details-col">
                        <h4>{item.subject}</h4>
                        <p>{item.topic}</p>
                        <div className="action-row">
                          {item.is_live ? (
                            <>
                              <span className="badge live-badge">🔴 Live Now</span>
                              <button className="join-btn"><PlayCircle size={14} /> Join Class</button>
                            </>
                          ) : (
                            <span className="badge upcoming-badge">Upcoming</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!dashData?.schedule || dashData.schedule.length === 0) && (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>No classes scheduled for today.</p>
                  )}
                </div>
              </motion.div>

              {/* 🌟 PENDING TASKS & EXAMS (Connected to API) */}
              <div className="right-col-widgets">
                <motion.div className="widget-card glass-panel" variants={fadeUp}>
                  <div className="section-header">
                    <h2>Pending Tasks</h2>
                  </div>
                  <div className="task-list">
                    {dashData?.tasks?.map((task) => (
                      <div key={task.id} className="task-item">
                        <div className="task-icon">
                          {task.type === 'exam' ? <Target size={18} color="#3b82f6" /> : <FileText size={18} color="#ef4444" />}
                        </div>
                        <div className="task-details">
                          <h5>{task.title}</h5>
                          <span className={`due-date ${task.urgent ? 'text-red' : ''}`}>{task.due}</span>
                        </div>
                        <ChevronRight size={18} color="#cbd5e1" className="arrow" />
                      </div>
                    ))}
                    {(!dashData?.tasks || dashData.tasks.length === 0) && (
                      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>All caught up! 🎉</p>
                    )}
                  </div>
                </motion.div>

                {/* 🌟 PERFORMANCE MINI GRAPH (Connected to API) */}
                <motion.div className="widget-card glass-panel" variants={fadeUp}>
                  <div className="section-header">
                    <h2>Recent Performance</h2>
                  </div>
                  <div className="mini-chart">
                    {dashData?.performance_chart?.map((chart, index) => (
                      <div key={index} className="chart-bar-wrap">
                        <div
                          className="bar"
                          style={{
                            height: `${chart.value}%`,
                            background: chart.value >= 90 ? '#10b981' : chart.value >= 80 ? '#4f46e5' : '#e2e8f0'
                          }}
                        ></div>
                        <span>{chart.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

            </div>
          </motion.div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
            --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f3e8ff 100%);
            --glass-bg: rgba(255, 255, 255, 0.85);
            --glass-border: 1px solid rgba(255, 255, 255, 0.9);
            --text-main: #0f172a;
            --text-muted: #64748b;
            --primary: #4f46e5;
        }

        * { box-sizing: border-box; }
        .dashboard-layout { display: flex; height: 100vh; width: 100vw; background: var(--bg-gradient); font-family: 'Inter', sans-serif; overflow: hidden; position: relative; }
        .ambient-bg { position: absolute; inset: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, rgba(248,250,252,0) 50%); z-index: 0; pointer-events: none; }

        /* Scroll Area */
        .dashboard-main { flex: 1; margin-left: 280px; height: 100vh; overflow-y: auto; overflow-x: hidden; z-index: 1; display: flex; flex-direction: column; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        /* 🌟 TOP HEADER */
        .dash-header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: rgba(248,250,252,0.8); backdrop-filter: blur(15px); z-index: 50; border-bottom: 1px solid rgba(226,232,240,0.8); }
        .header-left { flex: 1; }
        .search-box { display: flex; align-items: center; background: white; padding: 10px 15px; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
        .search-box input { border: none; outline: none; background: transparent; margin-left: 10px; width: 100%; font-size: 0.9rem; color: var(--text-main); }
        
        .header-right { display: flex; align-items: center; gap: 15px; }
        .widget-pill { display: flex; align-items: center; gap: 8px; background: white; padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: var(--text-main); box-shadow: 0 4px 10px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; }
        .weather-pill { color: #334155; }
        
        .icon-btn { background: white; border: 1px solid #e2e8f0; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: var(--text-muted); cursor: pointer; position: relative; transition: 0.2s; }
        .icon-btn:hover { color: var(--primary); border-color: var(--primary); }
        .notif-badge { position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 0.65rem; font-weight: bold; width: 18px; height: 18px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white;}
        .header-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #4f46e5, #8b5cf6); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 10px rgba(79,70,229,0.3); border: 2px solid white; transition: 0.2s; }
        .header-avatar:hover { transform: scale(1.05); }

        /* 🌟 CONTENT AREA */
        .dash-content { padding: 30px 40px; display: flex; flex-direction: column; gap: 30px; max-width: 1400px; margin: 0 auto; width: 100%; }
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(20px); border: var(--glass-border); border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }

        /* Welcome Banner */
        .welcome-banner { padding: 40px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.4)); position: relative; overflow: hidden; }
        .date-text { display: flex; align-items: center; gap: 8px; color: var(--primary); font-weight: 700; font-size: 0.9rem; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
        .welcome-banner h1 { margin: 0 0 10px 0; font-size: 2.2rem; color: var(--text-main); font-weight: 800; }
        .highlight-text { color: transparent; background: linear-gradient(135deg, #4f46e5, #d946ef); -webkit-background-clip: text; }
        .welcome-banner .subtitle { margin: 0; color: var(--text-muted); font-size: 1.05rem; max-width: 600px; line-height: 1.5; }
        .banner-graphic { position: absolute; right: -50px; top: -50px; width: 300px; height: 300px; opacity: 0.5; pointer-events: none; }
        .floating-circle { position: absolute; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #a855f7); filter: blur(40px); }
        .c1 { width: 200px; height: 200px; top: 0; right: 0; animation: float 6s ease-in-out infinite; }
        .c2 { width: 150px; height: 150px; bottom: 20px; left: 20px; background: linear-gradient(135deg, #f472b6, #ec4899); animation: float 8s ease-in-out infinite reverse; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(20px); } 100% { transform: translateY(0px); } }

        /* KPI Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .stat-card { padding: 25px; display: flex; align-items: center; gap: 20px; transition: 0.3s; cursor: default; }
        .stat-icon-box { width: 60px; height: 60px; border-radius: 16px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
        .bg-blue { background: #eff6ff; } .bg-green { background: #ecfdf5; } .bg-orange { background: #fffbeb; } .bg-purple { background: #f5f3ff; }
        .stat-info h3 { margin: 0 0 5px 0; font-size: 1.8rem; font-weight: 900; color: var(--text-main); }
        .stat-info p { margin: 0; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }

        /* Lower Grid Split */
        .dash-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;}
        .section-header h2 { margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
        .view-all-btn { background: none; border: none; color: var(--primary); font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
        .view-all-btn:hover { color: #3730a3; text-decoration: underline; }

        /* Schedule / Timeline */
        .schedule-section { padding: 30px; }
        .schedule-list { display: flex; flex-direction: column; gap: 20px; }
        .schedule-item { display: flex; gap: 20px; padding: 20px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; transition: 0.2s; position: relative; overflow: hidden; }
        .schedule-item.active { border-color: #c7d2fe; background: #fafafa; box-shadow: 0 10px 25px -5px rgba(79,70,229,0.1); }
        .schedule-item.active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: var(--primary); }
        .time-col { min-width: 90px; text-align: right; display: flex; flex-direction: column; justify-content: center; border-right: 2px dashed #e2e8f0; padding-right: 20px; }
        .time-col .time { font-weight: 800; color: var(--text-main); font-size: 1.1rem; }
        .time-col .duration { color: var(--text-muted); font-size: 0.8rem; font-weight: 600; margin-top: 5px; }
        .details-col { flex: 1; }
        .details-col h4 { margin: 0 0 5px 0; font-size: 1.1rem; color: var(--text-main); font-weight: 800; }
        .details-col p { margin: 0 0 15px 0; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
        .action-row { display: flex; justify-content: space-between; align-items: center; }
        .badge { padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .live-badge { background: #fee2e2; color: #ef4444; animation: pulse 2s infinite; }
        .upcoming-badge { background: #f1f5f9; color: #64748b; }
        .join-btn { background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 10px rgba(79,70,229,0.3);}
        .join-btn:hover { transform: translateY(-2px); background: #4338ca; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .spinner { animation: spin 1s linear infinite; }

        /* Right Column Widgets */
        .right-col-widgets { display: flex; flex-direction: column; gap: 30px; }
        .widget-card { padding: 25px; }
        .task-list { display: flex; flex-direction: column; gap: 15px; }
        .task-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; }
        .task-item:hover { border-color: #cbd5e1; transform: translateX(5px); }
        .task-icon { width: 40px; height: 40px; background: #f8fafc; border-radius: 10px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
        .task-details { flex: 1; }
        .task-details h5 { margin: 0 0 5px 0; font-size: 0.95rem; color: var(--text-main); }
        .due-date { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .text-red { color: #ef4444; }

        /* Mini Chart CSS Only */
        .mini-chart { display: flex; justify-content: space-between; align-items: flex-end; height: 150px; padding-top: 20px; gap: 10px; }
        .chart-bar-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; gap: 10px; }
        .bar { width: 100%; max-width: 40px; background: #e2e8f0; border-radius: 8px 8px 0 0; transition: height 1s ease-out; }
        .chart-bar-wrap:hover .bar { filter: brightness(0.9); }
        .chart-bar-wrap span { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }

        /* Responsive */
        @media (max-width: 1200px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .dash-grid-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 1024px) {
            .dashboard-main { margin-left: 0; width: 100%; }
        }
        @media (max-width: 768px) {
            .dash-header { flex-direction: column; gap: 15px; padding: 15px 20px; }
            .header-left, .header-right { width: 100%; justify-content: space-between; }
            .search-box { max-width: 100%; }
            .weather-pill { display: none; } /* Hide on small screens to save space */
            .dash-content { padding: 20px; }
            .welcome-banner { padding: 25px; }
            .stats-grid { grid-template-columns: 1fr; }
            .schedule-item { flex-direction: column; gap: 10px; }
            .time-col { text-align: left; border-right: none; border-bottom: 2px dashed #e2e8f0; padding-bottom: 10px; padding-right: 0; flex-direction: row; align-items: center; gap: 15px;}
            .time-col .duration { margin-top: 0; }
        }
      `}} />
    </div>
  );
}