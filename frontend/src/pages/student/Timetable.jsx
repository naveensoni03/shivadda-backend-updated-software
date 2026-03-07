import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, User, Sparkles, BookOpen, Loader2 } from "lucide-react";
import StudentSidebar from "../../components/StudentSidebar";
import api from "../../api/axios"; // ✅ Backend API
import toast, { Toaster } from 'react-hot-toast';

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Mapped to backend keys
const displayDays = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

export default function StudentTimetable() {
    const navigate = useNavigate();
    const [activeDay, setActiveDay] = useState("Mon");

    // 🚀 States for Backend Data
    const [scheduleData, setScheduleData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            // navigate("/student/login"); // Production me uncomment karein
        }

        // Set Current Day dynamically
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = days[new Date().getDay()];
        if (weekDays.includes(today)) {
            setActiveDay(today);
        }

        // Fetch Timetable
        fetchTimetable();
    }, [navigate]);

    // ✅ FETCH TIMETABLE FROM DJANGO API
    const fetchTimetable = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('timetable/list/');

            // Reformat backend data to match our frontend structure
            // Backend sends: [{day: 'Mon', slots: [...]}, {day: 'Tue', slots: [...]}]
            const formattedData = {};
            if (response.data && response.data.length > 0) {
                response.data.forEach(item => {
                    formattedData[item.day] = item.slots;
                });
            }
            setScheduleData(formattedData);
        } catch (error) {
            console.error("Error fetching timetable:", error);
            toast.error("Failed to load timetable from server.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 🌟 ANIMATION VARIANTS 🌟 ---
    const pageTransition = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const slideUp = {
        hidden: { y: 30, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90, damping: 14 } }
    };

    const listContainer = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    const itemSlide = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120 } }
    };

    return (
        <div className="student-layout">
            {/* 🌪️ BACKGROUND */}
            <motion.div
                className="ambient-bg"
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            ></motion.div>

            {/* ✅ IMPORTED SIDEBAR COMPONENT */}
            <StudentSidebar />
            <Toaster position="top-right" />

            {/* 🖥️ MAIN CONTENT SCROLLABLE AREA */}
            <main className="student-main-content">
                <motion.div className="content-wrapper" variants={pageTransition} initial="hidden" animate="show">

                    {/* 🌟 HEADER */}
                    <motion.header className="student-header" variants={slideUp}>
                        <div>
                            <h1 className="greeting">
                                Weekly Schedule <Calendar size={32} style={{ display: 'inline', color: 'var(--primary)', verticalAlign: 'middle', marginLeft: '10px' }} />
                            </h1>
                            <p className="sub-greeting">Stay on top of your classes and activities.</p>
                        </div>
                    </motion.header>

                    {/* 📅 DAY SELECTOR TABS */}
                    <motion.div className="day-tabs-container glass-panel" variants={slideUp}>
                        <div className="day-tabs">
                            {weekDays.map((day) => (
                                <button
                                    key={day}
                                    className={`day-tab ${activeDay === day ? 'active' : ''}`}
                                    onClick={() => setActiveDay(day)}
                                >
                                    {displayDays[day]}
                                    {activeDay === day && (
                                        <motion.div layoutId="activeDay" className="active-indicator" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* 🕒 TIMETABLE LIST */}
                    <div className="timetable-container">
                        {isLoading ? (
                            <div className="loader-container">
                                <Loader2 size={40} className="spinner" color="#4f46e5" />
                                <p>Syncing schedule...</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeDay}
                                    variants={listContainer}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className="schedule-list"
                                >
                                    {scheduleData[activeDay] && scheduleData[activeDay].length > 0 ? (
                                        scheduleData[activeDay].map((cls, index) => (
                                            <motion.div
                                                key={cls.id || index}
                                                variants={itemSlide}
                                                className={`class-card glass-panel ${cls.is_break ? 'break-card' : `slot-subject ${cls.color || 'blue'}`}`}
                                                whileHover={!cls.is_break ? { scale: 1.02, x: 10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" } : {}}
                                            >
                                                {!cls.is_break && <div className="shine-layer"></div>}

                                                <div className="time-block">
                                                    <Clock size={20} strokeWidth={2.5} />
                                                    {/* Format time nicely */}
                                                    <span>{cls.time ? cls.time.split(" - ")[0] : cls.start_time}</span>
                                                    <small>to {cls.time ? cls.time.split(" - ")[1] : cls.end_time}</small>
                                                </div>

                                                <div className="details-block">
                                                    <div className="subject-header">
                                                        <h3>{cls.subject}</h3>
                                                        <span className={`type-badge ${cls.is_break ? 'break' : 'lecture'}`}>
                                                            {cls.is_break ? "Recess" : "Lecture"}
                                                        </span>
                                                    </div>

                                                    {!cls.is_break && (
                                                        <div className="meta-info">
                                                            <p><User size={16} className="meta-icon" /> {cls.teacher}</p>
                                                            <p><MapPin size={16} className="meta-icon" /> {cls.room}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        /* 🌴 EMPTY STATE FOR FREE DAYS */
                                        <motion.div className="empty-state glass-panel" variants={slideUp}>
                                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                                <span style={{ fontSize: '4rem' }}>🌴</span>
                                            </motion.div>
                                            <h2>No Classes Scheduled</h2>
                                            <p>Take a break, revise your notes, or work on your side projects!</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>

                </motion.div>
            </main>

            {/* 🚀 BULLETPROOF RESPONSIVE CSS */}
            <style jsx="true">{`
                :root {
                    --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f3e8ff 100%);
                    --glass-bg: rgba(255, 255, 255, 0.85);
                    --glass-border: 1px solid rgba(255, 255, 255, 0.9);
                    --text-main: #0f172a;
                    --text-muted: #64748b;
                    --primary: #4f46e5;
                    --primary-light: #e0e7ff;
                }

                * { box-sizing: border-box; }

                .student-layout { display: flex; height: 100vh; width: 100%; background: var(--bg-gradient); font-family: 'Inter', sans-serif; overflow: hidden; position: relative; }
                .ambient-bg { position: absolute; inset: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, rgba(248,250,252,0) 50%); z-index: 0; pointer-events: none; }

                /* ✅ MAIN CONTENT */
                .student-main-content { 
                    flex: 1; margin-left: 280px; height: 100vh; overflow-y: auto; overflow-x: hidden; 
                    z-index: 1; transition: margin-left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); 
                    scroll-behavior: smooth; width: calc(100% - 280px);
                }
                .content-wrapper { padding: 40px 50px 100px 50px; max-width: 1200px; margin: 0 auto; }
                
                .glass-panel { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border: var(--glass-border); box-shadow: 0 10px 40px rgba(31, 38, 135, 0.05); border-radius: 24px; }

                .student-header { margin-bottom: 35px; }
                .greeting { margin: 0 0 8px 0; font-size: 2.5rem; font-weight: 900; color: var(--text-main); letter-spacing: -0.5px; }
                .sub-greeting { margin: 0; color: var(--text-muted); font-size: 1.15rem; font-weight: 500; }

                /* DAY TABS */
                .day-tabs-container { padding: 10px !important; border-radius: 20px !important; margin-bottom: 30px; }
                .day-tabs { display: flex; gap: 10px; overflow-x: auto; white-space: nowrap; padding-bottom: 5px; }
                .day-tabs::-webkit-scrollbar { display: none; }
                .day-tab { flex: 1; background: transparent; border: none; padding: 14px 20px; border-radius: 14px; font-size: 1.05rem; font-weight: 700; color: var(--text-muted); cursor: pointer; transition: color 0.3s; position: relative; text-align: center; }
                .day-tab:hover { color: var(--text-main); background: rgba(0,0,0,0.02); }
                .day-tab.active { color: var(--primary); }
                .active-indicator { position: absolute; bottom: 0; left: 10%; width: 80%; height: 4px; background: var(--primary); border-radius: 10px 10px 0 0; }

                /* SCHEDULE LIST */
                .schedule-list { display: flex; flex-direction: column; gap: 20px; }
                
                .class-card { display: flex; overflow: hidden; padding: 0 !important; cursor: default; border: 1px solid rgba(255,255,255,1); position: relative;}
                .shine-layer { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); transition: 0s; z-index: 10; pointer-events: none; }
                .class-card:hover .shine-layer { left: 200%; transition: 0.8s ease-in-out; }

                /* Dynamic Colors for Subjects */
                .slot-subject.blue { border-left: 6px solid #3B82F6; }
                .slot-subject.purple { border-left: 6px solid #8B5CF6; }
                .slot-subject.pink { border-left: 6px solid #EC4899; }
                .slot-subject.orange { border-left: 6px solid #F97316; }
                .slot-subject.green { border-left: 6px solid #22C55E; }
                .slot-subject.red { border-left: 6px solid #EF4444; }
                .slot-subject.indigo { border-left: 6px solid #6366F1; }

                .time-block { background: var(--primary); color: white; width: 160px; padding: 25px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; flex-shrink: 0; }
                .time-block span { font-size: 1.2rem; font-weight: 900; margin-top: 8px; }
                .time-block small { font-size: 0.85rem; opacity: 0.8; font-weight: 600; }

                .details-block { padding: 25px 30px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
                .subject-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .subject-header h3 { margin: 0; font-size: 1.4rem; font-weight: 800; color: var(--text-main); }
                
                .type-badge { padding: 6px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
                .type-badge.lecture { background: #e0e7ff; color: #4338ca; }
                .type-badge.break { background: #fee2e2; color: #b91c1c; }

                .meta-info { display: flex; gap: 30px; }
                .meta-info p { margin: 0; display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 1.05rem; font-weight: 600; }
                .meta-icon { color: var(--primary); }

                /* BREAK CARD SPECIAL STYLING */
                .break-card { opacity: 0.8; background: rgba(248, 250, 252, 0.8); border-left: 6px dashed #cbd5e1; }
                .break-card .time-block { background: #cbd5e1; color: #475569; }
                .break-card .subject-header h3 { color: #64748b; font-style: italic; }

                /* EMPTY STATE */
                .empty-state { text-align: center; padding: 80px 20px; }
                .empty-state h2 { color: var(--text-main); margin: 15px 0 10px; font-weight: 900; }
                .empty-state p { color: var(--text-muted); font-size: 1.1rem; }

                /* LOADER */
                .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: var(--primary); font-weight: 600;}
                .spinner { animation: spin 1s linear infinite; margin-bottom: 15px; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* 📱 RESPONSIVENESS */
                @media (max-width: 1024px) {
                    .student-main-content { margin-left: 0; width: 100%; }
                    .content-wrapper { padding: 110px 30px 100px 30px; }
                }

                @media (max-width: 768px) {
                    .content-wrapper { padding: 95px 15px 80px 15px; }
                    .student-header { margin-bottom: 20px; }
                    .greeting { font-size: 2rem; }
                    
                    .day-tabs { display: flex; }
                    .day-tab { padding: 12px 15px; font-size: 0.95rem; }

                    .class-card { flex-direction: column; }
                    .time-block { width: 100%; flex-direction: row; padding: 15px; gap: 15px; justify-content: flex-start; }
                    .time-block span { margin-top: 0; font-size: 1.1rem; }
                    .details-block { padding: 20px; }
                    .subject-header { flex-direction: column; align-items: flex-start; gap: 10px; }
                    .meta-info { flex-direction: column; gap: 10px; }
                }
            `}</style>
        </div>
    );
}