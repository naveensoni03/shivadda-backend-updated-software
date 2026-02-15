import React, { useState } from "react";
import SidebarModern from "../components/SidebarModern";
import toast, { Toaster } from 'react-hot-toast';
import { 
  Calendar, Clock, User, Sparkles, RefreshCw, 
  ChevronDown, MapPin, MoreHorizontal, Filter, 
  Download, Zap, Coffee, Edit3, Plus, X, Trash2, CheckCircle
} from "lucide-react";

export default function Timetable() {
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Class 10-A");
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [currentTimePos, setCurrentTimePos] = useState(35); 

  // --- UI STATES ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false); 
  const [activeDayIndex, setActiveDayIndex] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All Classes"); // ✅ Added Filter State

  const [newSlot, setNewSlot] = useState({
      subject: "", teacher: "", room: "", time: "", color: "blue", icon: "📚"
  });

  // --- MOCK DATA ---
  const [routine, setRoutine] = useState([
    { day: "Mon", fullDay: "Monday", slots: [
        { subject: "Maths", teacher: "Amit Sir", room: "101", color: "blue", time: "09:00 - 10:00", icon: "📐" },
        { subject: "Physics", teacher: "Naveen Sir", room: "Lab 1", color: "purple", time: "10:00 - 11:00", icon: "⚛️" },
        { isBreak: true, time: "11:00 - 11:30" },
        { subject: "Chem", teacher: "Priya Mam", room: "101", color: "pink", time: "11:30 - 12:30", icon: "🧪" },
        { subject: "History", teacher: "Rajesh Sir", room: "102", color: "orange", time: "12:30 - 01:30", icon: "📜" },
    ]},
    { day: "Tue", fullDay: "Tuesday", slots: [
        { subject: "Physics", teacher: "Naveen Sir", room: "Lab 1", color: "purple", time: "09:00 - 10:00", icon: "⚛️" },
        { subject: "English", teacher: "Sonia Mam", room: "101", color: "green", time: "10:00 - 11:00", icon: "📝" },
        { isBreak: true, time: "11:00 - 11:30" },
        { subject: "Maths", teacher: "Amit Sir", room: "101", color: "blue", time: "11:30 - 12:30", icon: "📐" },
        { subject: "Comp", teacher: "Rahul Sir", room: "Lab 2", color: "indigo", time: "12:30 - 01:30", icon: "💻" },
    ]},
    { day: "Wed", fullDay: "Wednesday", slots: [
        { subject: "Bio", teacher: "Sneha Mam", room: "Bio Lab", color: "red", time: "09:00 - 10:00", icon: "🧬" },
        { subject: "Maths", teacher: "Amit Sir", room: "101", color: "blue", time: "10:00 - 11:00", icon: "📐" },
        { isBreak: true, time: "11:00 - 11:30" },
        { subject: "Library", teacher: "Staff", room: "Lib", color: "teal", time: "11:30 - 12:30", icon: "📚" },
        { subject: "Physics", teacher: "Naveen Sir", room: "101", color: "purple", time: "12:30 - 01:30", icon: "⚛️" },
    ]},
    { day: "Thu", fullDay: "Thursday", slots: [
        { subject: "History", teacher: "Rajesh Sir", room: "102", color: "orange", time: "09:00 - 10:00", icon: "📜" },
        { subject: "English", teacher: "Sonia Mam", room: "101", color: "green", time: "10:00 - 11:00", icon: "📝" },
        { isBreak: true, time: "11:00 - 11:30" },
        { subject: "Sports", teacher: "Coach", room: "Ground", color: "emerald", time: "11:30 - 12:30", icon: "⚽" },
        { subject: "Maths", teacher: "Amit Sir", room: "101", color: "blue", time: "12:30 - 01:30", icon: "📐" },
    ]},
  ]);

  // --- ACTIONS ---
  const handleAutoSchedule = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        toast.success(
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <Sparkles size={18} fill="#FFD700" color="#FFD700"/> 
                <span>AI Magic Applied! Routine Optimized.</span>
            </div>, 
            { style: { borderRadius: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '1px solid white', color: '#1e293b' } }
        );
    }, 2000);
  };

  const handleFilterClick = () => {
      setShowFilterMenu(!showFilterMenu);
  };

  // ✅ New: Handle Filter Selection
  const handleSelectFilter = (filter) => {
      setSelectedFilter(filter);
      setShowFilterMenu(false);
      toast.success(`Filter Applied: ${filter}`, { icon: '🔍' });
  };

  const handleDownload = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Day,Time,Subject,Teacher,Room\n";

      routine.forEach(day => {
          day.slots.forEach(slot => {
              if(!slot.isBreak) {
                  csvContent += `${day.fullDay},${slot.time},${slot.subject},${slot.teacher},${slot.room}\n`;
              }
          });
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "timetable_2025.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Timetable Downloaded as Excel (CSV)! 📄");
  };

  const openAddModal = (dayIdx) => {
      setActiveDayIndex(dayIdx);
      setNewSlot({ subject: "", teacher: "", room: "", time: "", color: "blue", icon: "📚" });
      setShowModal(true);
  };

  const handleSaveSlot = () => {
      if(!newSlot.subject || !newSlot.time) return toast.error("Subject & Time required!");
      
      const updatedRoutine = [...routine];
      updatedRoutine[activeDayIndex].slots.push(newSlot);
      setRoutine(updatedRoutine);
      setShowModal(false);
      toast.success("Class Added Successfully!");
  };

  const handleDeleteSlot = (dayIdx, slotIdx) => {
      const updatedRoutine = [...routine];
      updatedRoutine[dayIdx].slots.splice(slotIdx, 1);
      setRoutine(updatedRoutine);
      toast("Slot Removed", { icon: '🗑️' });
  };

  return (
    <div className="timetable-app">
      <SidebarModern />
      <Toaster position="bottom-right" />

      {/* --- ANIMATED BACKGROUND MESH --- */}
      <div className="mesh-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="main-content hide-scrollbar">
        
        {/* --- HEADER --- */}
        <header className="glass-header slide-down">
            <div className="header-left">
                <div className="calendar-badge">
                    <span className="cb-month">FEB</span>
                    <span className="cb-date">06</span>
                </div>
                <div>
                    <h1 className="title">Class Schedule <span className="highlight">2025</span></h1>
                    <p className="subtitle">Managing routine for {selectedClass}</p>
                </div>
            </div>
            
            <div className="header-actions">
                <button 
                    className={`icon-btn-glass ${isEditMode ? 'active-edit' : ''}`}
                    onClick={() => setIsEditMode(!isEditMode)}
                    title="Toggle Edit Mode"
                >
                    {isEditMode ? <CheckCircle size={18} color="#10B981"/> : <Edit3 size={18}/>}
                </button>
                
                <div className="separator"></div>
                
                {/* ✅ FILTER DROPDOWN FIXED (Z-INDEX 100) */}
                <div style={{position: 'relative'}}>
                    <button 
                        className={`icon-btn-glass ${showFilterMenu ? 'active-btn' : ''}`} 
                        onClick={handleFilterClick}
                        title="Filter View"
                    >
                        <Filter size={18}/>
                    </button>
                    {showFilterMenu && (
                        <div className="dropdown-menu">
                            {['All Classes', 'Morning Shift', 'Evening Shift', 'Exams Only'].map((item) => (
                                <div 
                                    key={item}
                                    className={`menu-item ${selectedFilter === item ? 'active' : ''}`}
                                    onClick={() => handleSelectFilter(item)} // ✅ Now Clickable
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button className="icon-btn-glass" onClick={handleDownload} title="Download Excel">
                    <Download size={18}/>
                </button>

                <button 
                    className={`ai-btn-glow ${loading ? 'loading' : ''}`} 
                    onClick={handleAutoSchedule}
                >
                    {loading ? <RefreshCw size={18} className="spin"/> : <Sparkles size={18}/>}
                    <span>AI Optimize</span>
                </button>
            </div>
        </header>

        {/* --- TIMELINE CONTAINER --- */}
        <div className="timeline-wrapper fade-in-up">
            
            {/* Top Time Markers */}
            <div className="timeline-header">
                <div className="corner-cell">
                    <div className="class-selector">
                        <span>{selectedClass}</span>
                        <ChevronDown size={14}/>
                    </div>
                </div>
                {["09:00", "10:00", "11:00", "11:30", "12:30", "01:30"].map((t, i) => (
                    <div key={i} className="time-marker">
                        <span className="tm-text">{t}</span>
                        <div className="tm-line"></div>
                    </div>
                ))}
                
                {/* Simulated Current Time Indicator */}
                <div className="current-time-line" style={{left: `${currentTimePos}%`}}>
                    <div className="ctl-badge">Now</div>
                    <div className="ctl-stroke"></div>
                </div>
            </div>

            {/* Days Rows */}
            <div className="routine-grid">
                {routine.map((row, idx) => (
                    <div key={idx} className="day-track" style={{animationDelay: `${idx * 0.1}s`}}>
                        
                        {/* Day Label (Left) */}
                        <div className="day-cell">
                            <span className="day-name">{row.day}</span>
                            <span className="day-full">{row.fullDay}</span>
                        </div>

                        {/* Slots */}
                        <div className="slots-track">
                            {row.slots.map((slot, sIdx) => (
                                <div 
                                    key={sIdx} 
                                    className={`slot-item ${slot.isBreak ? 'slot-break' : `slot-subject ${slot.color}`}`}
                                    onMouseEnter={() => setHoveredSlot(`${idx}-${sIdx}`)}
                                    onMouseLeave={() => setHoveredSlot(null)}
                                >
                                    {/* DELETE BUTTON (EDIT MODE ONLY) */}
                                    {isEditMode && !slot.isBreak && (
                                        <button className="delete-badge" onClick={(e) => { e.stopPropagation(); handleDeleteSlot(idx, sIdx); }}>
                                            <X size={12} color="white"/>
                                        </button>
                                    )}

                                    {slot.isBreak ? (
                                        <div className="break-visual">
                                            <div className="break-pattern"></div>
                                            <span className="break-icon"><Coffee size={16}/></span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="slot-glow"></div>
                                            <div className="slot-inner">
                                                <div className="slot-header">
                                                    <span className="subject-icon">{slot.icon}</span>
                                                    <span className="room-pill">{slot.room}</span>
                                                </div>
                                                <div className="slot-body">
                                                    <h3 className="subject-title">{slot.subject}</h3>
                                                    <div className="teacher-info">
                                                        <User size={12}/> {slot.teacher}
                                                    </div>
                                                </div>
                                                <div className="slot-footer">
                                                    <Clock size={12}/> {slot.time}
                                                </div>
                                            </div>
                                            
                                            {/* Hover Menu (Only show if NOT in edit mode) */}
                                            {hoveredSlot === `${idx}-${sIdx}` && !isEditMode && (
                                                <button className="slot-action-btn">
                                                    <MoreHorizontal size={14}/>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* ADD BUTTON (EDIT MODE ONLY) */}
                            {isEditMode && (
                                <button className="add-slot-placeholder" onClick={() => openAddModal(idx)}>
                                    <Plus size={24}/>
                                    <span>Add</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- MODAL FOR MANUAL ENTRY --- */}
      {showModal && (
          <div className="glass-modal-overlay">
              <div className="glass-modal">
                  <div className="modal-header">
                      <h3>Add Class ({routine[activeDayIndex].day})</h3>
                      <button onClick={() => setShowModal(false)} className="close-btn"><X size={20}/></button>
                  </div>
                  <div className="modal-form">
                      <div className="input-group">
                          <label>Subject</label>
                          <input placeholder="e.g. Mathematics" value={newSlot.subject} onChange={(e) => setNewSlot({...newSlot, subject: e.target.value})} />
                      </div>
                      <div className="row-group">
                          <div className="input-group">
                              <label>Teacher</label>
                              <input placeholder="Name" value={newSlot.teacher} onChange={(e) => setNewSlot({...newSlot, teacher: e.target.value})} />
                          </div>
                          <div className="input-group">
                              <label>Room</label>
                              <input placeholder="101" value={newSlot.room} onChange={(e) => setNewSlot({...newSlot, room: e.target.value})} />
                          </div>
                      </div>
                      <div className="row-group">
                          <div className="input-group">
                              <label>Time</label>
                              <input placeholder="00:00 - 00:00" value={newSlot.time} onChange={(e) => setNewSlot({...newSlot, time: e.target.value})} />
                          </div>
                          <div className="input-group">
                              <label>Color</label>
                              <select value={newSlot.color} onChange={(e) => setNewSlot({...newSlot, color: e.target.value})}>
                                  <option value="blue">Blue</option>
                                  <option value="purple">Purple</option>
                                  <option value="pink">Pink</option>
                                  <option value="orange">Orange</option>
                                  <option value="green">Green</option>
                              </select>
                          </div>
                      </div>
                      <button className="save-btn" onClick={handleSaveSlot}>Save Schedule</button>
                  </div>
              </div>
          </div>
      )}

      {/* ✨ PREMIUM STYLES ✨ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        :root {
            --glass-bg: rgba(255, 255, 255, 0.65);
            --glass-border: rgba(255, 255, 255, 0.8);
            --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
            --primary: #4F46E5;
        }

        .timetable-app { display: flex; height: 100vh; background: #F8FAFC; font-family: 'Outfit', sans-serif; overflow: hidden; position: relative; }
        .main-content { 
            flex: 1; margin-left: 280px; padding: 30px 40px; 
            position: relative; z-index: 10; 
            overflow-y: auto; height: 100vh;
            scrollbar-width: none; -ms-overflow-style: none;
        }
        .main-content::-webkit-scrollbar { display: none; }

        /* --- BACKGROUND MESH ANIMATION --- */
        .mesh-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.6; animation: float 10s infinite alternate; }
        .orb-1 { width: 400px; height: 400px; background: #C7D2FE; top: -100px; left: 20%; }
        .orb-2 { width: 500px; height: 500px; background: #FDE68A; bottom: -100px; right: 10%; animation-delay: -2s; }
        .orb-3 { width: 300px; height: 300px; background: #FECACA; top: 40%; left: 40%; animation-delay: -5s; }
        @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(30px, 50px); } }

        /* --- HEADER --- */
        .glass-header { 
            display: flex; justify-content: space-between; align-items: center; 
            background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border);
            padding: 16px 24px; borderRadius: 24px; margin-bottom: 30px; box-shadow: var(--glass-shadow);
            position: relative; z-index: 500; /* ✅ HIGH Z-INDEX FOR DROPDOWN */
        }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .calendar-badge { 
            background: white; padding: 8px 16px; border-radius: 16px; text-align: center; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;
        }
        .cb-month { display: block; font-size: 0.7rem; font-weight: 800; color: #EF4444; letter-spacing: 1px; }
        .cb-date { display: block; font-size: 1.4rem; font-weight: 800; color: #1E293B; line-height: 1; }
        
        .title { margin: 0; font-size: 1.8rem; font-weight: 800; color: #1E293B; letter-spacing: -0.5px; }
        .title .highlight { color: var(--primary); }
        .subtitle { margin: 0; color: #64748B; font-weight: 500; font-size: 0.95rem; }

        .header-actions { display: flex; align-items: center; gap: 15px; }
        
        .separator { width: 1px; height: 30px; background: #CBD5E1; margin: 0 5px; }
        
        /* ✅ FIXED BUTTON VISIBILITY */
        .icon-btn-glass { 
            width: 40px; height: 40px; border-radius: 12px; border: 1px solid #CBD5E1; background: #FFFFFF;
            display: flex; align-items: center; justify-content: center; cursor: pointer; color: #475569; transition: 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .icon-btn-glass:hover { background: #F8FAFC; transform: translateY(-2px); color: #1E293B; border-color: #94A3B8; }
        .icon-btn-glass.active-edit { background: #ECFDF5; border-color: #10B981; color: #047857; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); }
        .icon-btn-glass.active-btn { background: #EEF2FF; border-color: #6366F1; color: #4F46E5; }

        /* ✅ DROPDOWN MENU FIX */
        .dropdown-menu {
            position: absolute; top: 55px; right: 0; width: 200px; background: white; 
            border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); border: 1px solid #E2E8F0; 
            z-index: 9999; /* Super high z-index */
            overflow: hidden; animation: popIn 0.2s;
        }
        .menu-item { padding: 12px 15px; font-size: 0.85rem; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .menu-item:hover { background: #F8FAFC; color: #1E293B; }
        .menu-item.active { background: #EEF2FF; color: #4F46E5; }

        .ai-btn-glow {
            background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color: white; border: none;
            padding: 10px 20px; border-radius: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;
            cursor: pointer; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25); transition: 0.3s;
        }
        .ai-btn-glow:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(15, 23, 42, 0.35); }
        .spin { animation: spin 1s linear infinite; }

        /* --- TIMELINE --- */
        .timeline-wrapper {
            background: var(--glass-bg); backdrop-filter: blur(20px); border-radius: 30px;
            border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); padding: 30px;
            position: relative; overflow: visible; /* ✅ ALLOW DROPDOWN OVERFLOW IF NEEDED */
        }

        .timeline-header { display: flex; margin-bottom: 20px; position: relative; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 15px; }
        .corner-cell { width: 120px; flex-shrink: 0; }
        .class-selector { 
            display: inline-flex; align-items: center; gap: 8px; background: white; padding: 6px 12px;
            border-radius: 10px; font-weight: 700; font-size: 0.85rem; color: #1E293B; cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .time-marker { flex: 1; text-align: center; position: relative; }
        .tm-text { font-size: 0.85rem; font-weight: 700; color: #94A3B8; background: #F8FAFC; padding: 0 10px; position: relative; z-index: 2; }
        .tm-line { position: absolute; left: 50%; top: 25px; bottom: -500px; width: 1px; border-left: 2px dashed #E2E8F0; z-index: 0; }

        /* CURRENT TIME LINE */
        .current-time-line { position: absolute; top: 0; bottom: 0; width: 2px; z-index: 5; display: flex; flex-direction: column; align-items: center; transition: left 1s linear; }
        .ctl-badge { background: #EF4444; color: white; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 10px; margin-bottom: 5px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); }
        .ctl-stroke { width: 2px; height: 100%; background: #EF4444; }

        /* --- ROUTINE GRID --- */
        .routine-grid { display: flex; flex-direction: column; gap: 15px; }
        .day-track { display: flex; align-items: center; animation: slideInLeft 0.5s backwards; }
        
        .day-cell { width: 120px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; }
        .day-name { font-size: 1.2rem; font-weight: 800; color: #1E293B; line-height: 1; }
        .day-full { font-size: 0.75rem; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

        .slots-track { 
            flex: 1; display: flex; gap: 15px; 
            overflow-x: auto; padding-bottom: 5px;
            /* Hide scrollbar for this container too */
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .slots-track::-webkit-scrollbar { display: none; }
        
        /* SLOT ITEM */
        .slot-item { 
            flex: 0 0 160px; height: 130px; border-radius: 20px; position: relative; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            overflow: hidden; cursor: pointer;
        }
        
        /* SUBJECT SLOT STYLES */
        .slot-subject { background: white; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .slot-subject:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 40px -5px rgba(0,0,0,0.1); z-index: 10; }
        
        .slot-subject.blue { background: linear-gradient(145deg, #EFF6FF, #DBEAFE); border-left: 4px solid #3B82F6; }
        .slot-subject.purple { background: linear-gradient(145deg, #F5F3FF, #EDE9FE); border-left: 4px solid #8B5CF6; }
        .slot-subject.pink { background: linear-gradient(145deg, #FDF2F8, #FCE7F3); border-left: 4px solid #EC4899; }
        .slot-subject.orange { background: linear-gradient(145deg, #FFF7ED, #FFEDD5); border-left: 4px solid #F97316; }
        .slot-subject.green { background: linear-gradient(145deg, #F0FDF4, #DCFCE7); border-left: 4px solid #22C55E; }
        .slot-subject.red { background: linear-gradient(145deg, #FEF2F2, #FEE2E2); border-left: 4px solid #EF4444; }
        .slot-subject.teal { background: linear-gradient(145deg, #F0FDFA, #CCFBF1); border-left: 4px solid #14B8A6; }
        .slot-subject.emerald { background: linear-gradient(145deg, #ECFDF5, #D1FAE5); border-left: 4px solid #10B981; }
        .slot-subject.indigo { background: linear-gradient(145deg, #EEF2FF, #E0E7FF); border-left: 4px solid #6366F1; }

        .slot-inner { padding: 15px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 2; }
        .slot-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%); opacity: 0; transition: 0.3s; pointer-events: none; }
        .slot-subject:hover .slot-glow { opacity: 1; }

        .slot-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .subject-icon { font-size: 1.2rem; }
        .room-pill { font-size: 0.7rem; font-weight: 700; background: rgba(255,255,255,0.6); padding: 3px 8px; border-radius: 8px; color: #475569; }

        .slot-body { margin-top: 5px; }
        .subject-title { margin: 0; font-size: 1rem; font-weight: 800; color: #1E293B; letter-spacing: -0.3px; }
        .teacher-info { font-size: 0.75rem; color: #64748B; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

        .slot-footer { font-size: 0.75rem; font-weight: 600; color: #94A3B8; display: flex; align-items: center; gap: 5px; }

        .slot-action-btn { position: absolute; right: 10px; top: 50px; background: white; border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1); animation: popIn 0.2s; }

        /* BREAK SLOT */
        .slot-break { background: rgba(255,255,255,0.3); border: 2px dashed #E2E8F0; display: flex; align-items: center; justify-content: center; position: relative; max-width: 80px; flex: 0 0 80px; }
        .break-visual { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; color: #CBD5E1; }
        .break-pattern { position: absolute; inset: 0; background-image: radial-gradient(#CBD5E1 1px, transparent 1px); background-size: 8px 8px; opacity: 0.5; }
        .break-icon { position: relative; z-index: 2; background: white; padding: 8px; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: #94A3B8; }

        /* EDIT MODE ELEMENTS */
        .add-slot-placeholder {
            flex: 0 0 130px; height: 130px; border: 2px dashed #CBD5E1; border-radius: 20px;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
            color: #94A3B8; background: rgba(255,255,255,0.3); cursor: pointer; transition: 0.3s;
        }
        .add-slot-placeholder:hover { border-color: var(--primary); color: var(--primary); background: #F1F5F9; }
        
        .delete-badge {
            position: absolute; top: 5px; right: 5px; width: 22px; height: 22px; background: #EF4444; 
            border-radius: 50%; border: none; color: white; display: flex; align-items: center; justify-content: center;
            cursor: pointer; z-index: 20; box-shadow: 0 2px 5px rgba(0,0,0,0.2); animation: popIn 0.2s;
        }
        .delete-badge:hover { transform: scale(1.1); }

        /* MODAL */
        .glass-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(5px); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .glass-modal { background: white; width: 400px; border-radius: 24px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.8); animation: popIn 0.3s; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h3 { margin: 0; font-size: 1.2rem; color: #1E293B; }
        .close-btn { background: transparent; border: none; cursor: pointer; color: #64748B; }
        
        .input-group { margin-bottom: 15px; }
        .input-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #64748B; margin-bottom: 5px; }
        .input-group input, .input-group select { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #E2E8F0; outline: none; background: #F8FAFC; color: #1E293B; }
        .input-group input:focus { border-color: var(--primary); background: white; }
        .row-group { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        
        .save-btn { width: 100%; padding: 12px; background: #1E293B; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; }
        .save-btn:hover { background: var(--primary); }

        /* ANIMATIONS */
        @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

        .slide-down { animation: slideDown 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .fade-in-up { animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        
        /* RESPONSIVE */
        @media (max-width: 1024px) {
            .timeline-wrapper { overflow-x: auto; }
            .routine-grid { min-width: 800px; }
            .timeline-header { min-width: 800px; }
        }
      `}</style>
    </div>
  );
}