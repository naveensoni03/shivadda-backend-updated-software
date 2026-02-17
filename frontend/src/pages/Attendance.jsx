import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Toaster, toast } from 'react-hot-toast';
import api from "../api/axios"; 
import { 
  Calendar, CheckCircle, XCircle, Clock, 
  BarChart2, Users, Save, Bell, Filter, Search, MoreHorizontal,
  Trophy, AlertTriangle, TrendingUp, Target, Zap
} from "lucide-react";

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);

  // --- DAILY ATTENDANCE STATES ---
  const [students, setStudents] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(1); 
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notifyParents, setNotifyParents] = useState(true);
  
  // --- REPORT STATES ---
  const [report, setReport] = useState([]);

  // --- INITIAL DATA LOAD (CONNECTED TO DB) ---
  useEffect(() => {
    fetchData();
  }, [selectedBatchId, selectedDate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
        if (activeTab === 'daily') {
            const res = await api.get(`attendance/daily/?batch_id=${selectedBatchId}&date=${selectedDate}`);
            setStudents(res.data);
        } else {
            const res = await api.get(`attendance/eligibility/${selectedBatchId}/`);
            setReport(res.data);
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
        toast.error("Failed to load data.");
        // Fallback for visual testing if DB is down
        if(activeTab === 'daily' && students.length === 0){
             setStudents([
                { id: 1, roll: 101, name: "Aarav Sharma", status: "Present", remarks: "", attendance_record: "95%", color: "#6366F1", img: "A" },
                { id: 2, roll: 102, name: "Isha Verma", status: "Absent", remarks: "", attendance_record: "80%", color: "#EC4899", img: "I" },
             ]);
        }
    } finally {
        setTimeout(() => setLoading(false), 500); 
    }
  };

  // --- HANDLERS ---
  const handleStatusChange = (id, newStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleRemarkChange = (id, text) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, remarks: text } : s));
  };

  const playSound = () => {
    const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio error:", e));
  };

  const handleSave = async () => {
    playSound();
    const loadId = toast.loading("Saving to Database...");
    
    try {
        await api.post('attendance/daily/', {
            batch_id: selectedBatchId,
            date: selectedDate,
            attendance_list: students
        });

        const absentCount = students.filter(s => s.status === 'Absent').length;
        
        toast.dismiss(loadId);
        toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} glass-toast`}>
            <div className="icon-box">💾</div>
            <div className="content-box">
                <b>Attendance Saved!</b>
                <p>{notifyParents ? `SMS queued for ${absentCount} parents.` : "Updated in database."}</p>
            </div>
        </div>
        ), { duration: 3000 });

    } catch (error) {
        toast.dismiss(loadId);
        toast.error("Failed to save attendance.");
    }
  };

  // --- STATS CALCULATION ---
  const total = students.length;
  const present = students.filter(s => s.status === "Present").length;
  const absent = students.filter(s => s.status === "Absent").length;
  const late = students.filter(s => s.status === "Late").length;

  const getAvg = () => report.length > 0 ? Math.round(report.reduce((acc, curr) => acc + curr.percentage, 0) / report.length) : 0;
  const getTopStudent = () => report.length > 0 ? report.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current) : {student: "None", percentage: 0};

  return (
    <div className="app-container app-mobile-scroll">
      <SidebarModern />
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="main-content hide-scrollbar">
        
        <header className="glass-header slide-down">
            <div className="header-left">
                <h1>Attendance<span className="text-gradient">Hub</span></h1>
                <p>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="header-actions">
                 <div className="glass-tab-container">
                    <button 
                        onClick={() => setActiveTab('daily')}
                        className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
                    >
                        <Calendar size={18} /> Daily Log
                    </button>
                    <button 
                        onClick={() => setActiveTab('report')}
                        className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                    >
                        <BarChart2 size={18} /> Analytics
                    </button>
                </div>
                <div className="profile-bubble">
                    <img src="https://i.pravatar.cc/150?img=12" alt="Admin" />
                </div>
            </div>
        </header>

        {loading ? (
             <div className="loader-container">
                <div className="loader"></div>
             </div>
        ) : (
        <>
            {/* ======================= VIEW 1: DAILY LOG ======================= */}
            {activeTab === 'daily' && (
                <div className="content-wrapper">
                    
                    <div className="controls-bar fade-in-up" style={{animationDelay: '0.1s'}}>
                        <div className="control-group">
                            <Users size={18} className="text-slate-400"/>
                            <select className="ghost-select" value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
                                <option value={1}>Class 10-A (Science)</option>
                                <option value={2}>Class 12-B (Commerce)</option>
                            </select>
                        </div>
                        <div className="control-group">
                            <Calendar size={18} className="text-slate-400"/>
                            <input type="date" className="ghost-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        </div>
                        
                        <div className="spacer"></div>

                        <div 
                            className={`toggle-pill ${notifyParents ? 'on' : 'off'}`} 
                            onClick={() => setNotifyParents(!notifyParents)}
                        >
                            <div className="toggle-circle">
                                <Bell size={12} />
                            </div>
                            <span>Notify Parents</span>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <StatCard delay="0.1s" label="Total Students" value={total} icon={<Users size={24}/>} color="indigo" />
                        <StatCard delay="0.2s" label="Present" value={present} icon={<CheckCircle size={24}/>} color="emerald" />
                        <StatCard delay="0.3s" label="Absent" value={absent} icon={<XCircle size={24}/>} color="rose" />
                        <StatCard delay="0.4s" label="Late Arrivals" value={late} icon={<Clock size={24}/>} color="amber" />
                    </div>

                    <div className="table-container fade-in-up" style={{animationDelay: '0.5s'}}>
                        <table className="floating-table">
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Student Details</th>
                                    <th className="text-center">Mark Attendance</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? students.map((s, idx) => (
                                    <tr key={s.id} className="table-row" style={{animationDelay: `${0.05 * idx}s`}}>
                                        <td><span className="roll-pill">#{s.roll}</span></td>
                                        <td>
                                            <div className="student-info">
                                                <div className="avatar" style={{background: s.color || '#6366F1'}}>{s.img || s.name[0]}</div>
                                                <div className="info-text">
                                                    <span className="name">{s.name}</span>
                                                    <span className="sub-text">Record: {s.attendance_record || 'New'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="status-selector">
                                                <button className={`st-btn present ${s.status === 'Present' ? 'active' : ''}`} onClick={() => handleStatusChange(s.id, 'Present')}>P</button>
                                                <button className={`st-btn absent ${s.status === 'Absent' ? 'active' : ''}`} onClick={() => handleStatusChange(s.id, 'Absent')}>A</button>
                                                <button className={`st-btn late ${s.status === 'Late' ? 'active' : ''}`} onClick={() => handleStatusChange(s.id, 'Late')}>L</button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="input-group">
                                                <input 
                                                    className={`remark-input ${s.status === 'Absent' ? 'required' : ''}`} 
                                                    placeholder={s.status === 'Absent' ? "Reason required..." : "Optional note"} 
                                                    value={s.remarks || ''}
                                                    onChange={(e) => handleRemarkChange(s.id, e.target.value)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color: '#64748B'}}>No students found for this batch.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="floating-action-bar slide-up-reveal">
                         <div className="summary-text">
                            <span>{present} Present</span> • <span>{absent} Absent</span>
                         </div>
                        <button className="save-btn-glowing" onClick={handleSave}>
                            <Save size={20} /> Save Record
                        </button>
                    </div>
                </div>
            )}

            {/* ======================= VIEW 2: ANALYTICS ======================= */}
            {activeTab === 'report' && (
                <div className="content-wrapper fade-in-up">
                    
                    <div className="insights-header">
                        <div className="insight-card primary">
                            <div className="ic-icon"><Target size={24}/></div>
                            <div>
                                <div className="ic-label">Class Average</div>
                                <div className="ic-val">{getAvg()}%</div>
                            </div>
                            <div className="ic-bg-icon"><BarChart2 size={80}/></div>
                        </div>

                        <div className="insight-card gold">
                            <div className="ic-icon"><Trophy size={24}/></div>
                            <div>
                                <div className="ic-label">Top Performer</div>
                                <div className="ic-val">{getTopStudent().student}</div>
                            </div>
                            <div className="ic-bg-icon"><Trophy size={80}/></div>
                        </div>

                        <div className="insight-card danger">
                            <div className="ic-icon"><AlertTriangle size={24}/></div>
                            <div>
                                <div className="ic-label">Risk Alert</div>
                                <div className="ic-val">{report.filter(r => !r.eligible).length} Students</div>
                            </div>
                            <div className="ic-bg-icon"><AlertTriangle size={80}/></div>
                        </div>
                    </div>

                    <div className="analytics-card-pro">
                        <div className="card-header-pro">
                            <div>
                                <h2>Performance Leaderboard</h2>
                                <p className="subtitle">Real-time attendance tracking</p>
                            </div>
                            <button className="filter-btn-pro"><Filter size={16}/> Filter</button>
                        </div>
                        
                        <div className="leaderboard-list">
                             {report.sort((a,b) => b.percentage - a.percentage).map((r, idx) => (
                                <div key={idx} className="leaderboard-row" style={{animationDelay: `${idx * 0.1}s`}}>
                                    
                                    <div className="lb-rank">
                                        {idx === 0 ? <div className="rank-badge gold">1</div> : 
                                         idx === 1 ? <div className="rank-badge silver">2</div> :
                                         idx === 2 ? <div className="rank-badge bronze">3</div> :
                                         <div className="rank-badge normal">#{idx+1}</div>}
                                    </div>

                                    <div className="lb-info">
                                        <div className="lb-name">
                                            {r.student}
                                            {r.percentage >= 90 && <Zap size={14} className="icon-zap" fill="currentColor"/>}
                                        </div>
                                        <div className="lb-status">
                                            {r.eligible ? 
                                                <span className="badge-pill safe">Eligible</span> : 
                                                <span className="badge-pill danger">At Risk</span>
                                            }
                                        </div>
                                    </div>

                                    <div className="lb-progress">
                                        <div className="lb-bar-bg">
                                            <div 
                                                className={`lb-bar-fill ${r.percentage < 75 ? 'warn-fill' : 'safe-fill'}`}
                                                style={{ width: `${r.percentage}%` }}
                                            >
                                                <div className="shimmer-effect"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lb-score">
                                        <span className="score-big">{r.percentage}%</span>
                                        <span className="trend-icon">
                                            <TrendingUp size={14} color={r.percentage > 75 ? "#10B981" : "#EF4444"}/>
                                        </span>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}
        </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        :root {
            --primary: #4F46E5;
            --glass: rgba(255, 255, 255, 0.7);
            --glass-border: rgba(255, 255, 255, 0.5);
            --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .app-container {
            display: flex;
            background: #F8FAFC;
            height: 100vh;
            overflow: hidden;
            font-family: 'Outfit', sans-serif;
            position: relative;
        }

        .bg-shape { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.6; z-index: 0; pointer-events: none; }
        .shape-1 { width: 400px; height: 400px; background: #C7D2FE; top: -100px; left: 200px; animation: float 10s infinite alternate; }
        .shape-2 { width: 300px; height: 300px; background: #FECACA; bottom: -50px; right: 100px; animation: float 12s infinite alternate-reverse; }

        @keyframes float { from { transform: translate(0, 0); } to { transform: translate(30px, 50px); } }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .main-content {
            flex: 1;
            padding: 20px 40px;
            margin-left: 280px; 
            overflow-y: auto;
            height: 100vh;
            position: relative;
            z-index: 10;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }

        .glass-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;
            padding: 15px 0; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(10px); 
        }
        .header-left h1 { font-size: 2rem; font-weight: 800; color: #1E293B; margin: 0; letter-spacing: -1px; }
        .header-left p { color: #64748B; font-weight: 500; font-size: 0.9rem; margin-top: 5px; }
        .text-gradient { background: linear-gradient(135deg, #4F46E5, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .header-actions { display: flex; align-items: center; gap: 20px; }
        .profile-bubble img { width: 45px; height: 45px; border-radius: 50%; border: 3px solid white; box-shadow: var(--shadow-sm); cursor: pointer; transition: 0.3s; }
        .profile-bubble img:hover { transform: scale(1.1); }

        .glass-tab-container {
            background: rgba(255,255,255,0.8); padding: 5px; border-radius: 16px; display: flex; gap: 5px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid white;
        }
        .tab-btn {
            display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent;
            color: #64748B; font-weight: 600; cursor: pointer; border-radius: 12px; transition: all 0.3s ease;
        }
        .tab-btn.active { background: #EEF2FF; color: #4F46E5; box-shadow: 0 2px 10px rgba(79, 70, 229, 0.1); }
        .tab-btn:hover:not(.active) { background: #F1F5F9; }

        .controls-bar { display: flex; gap: 15px; margin-bottom: 30px; align-items: center; flex-wrap: wrap; }
        .control-group { 
            display: flex; align-items: center; gap: 10px; background: white; padding: 10px 20px; 
            border-radius: 14px; box-shadow: var(--shadow-sm); border: 1px solid #E2E8F0; transition: 0.3s;
        }
        .control-group:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateY(-2px); }
        .ghost-select, .ghost-input { border: none; outline: none; font-weight: 600; color: #334155; background: transparent; font-size: 0.95rem; }
        .spacer { flex: 1; }

        .toggle-pill {
            display: flex; align-items: center; gap: 12px; padding: 6px 8px 6px 16px; border-radius: 30px; 
            cursor: pointer; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-weight: 600; font-size: 0.9rem; user-select: none;
            background: white; border: 1px solid #E2E8F0; box-shadow: var(--shadow-sm);
        }
        .toggle-circle { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .toggle-pill.on { border-color: #10B981; color: #065F46; }
        .toggle-pill.on .toggle-circle { background: #10B981; color: white; transform: scale(1.1); }
        .toggle-pill.off { color: #64748B; }
        .toggle-pill.off .toggle-circle { background: #F1F5F9; color: #94A3B8; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }

        .table-container { overflow-x: auto; padding-bottom: 10px; -webkit-overflow-scrolling: touch; }
        .floating-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; min-width: 800px; }
        .floating-table th { text-align: left; padding: 0 20px 10px 20px; color: #94A3B8; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        .table-row { background: white; box-shadow: var(--shadow-sm); transition: 0.3s; animation: fadeInUp 0.5s backwards; }
        .table-row td { padding: 15px 20px; vertical-align: middle; border-top: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; }
        .table-row td:first-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; border-left: 1px solid #F1F5F9; }
        .table-row td:last-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; border-right: 1px solid #F1F5F9; }
        .table-row:hover { transform: translateY(-3px) scale(1.005); box-shadow: var(--shadow-lg); z-index: 5; position: relative; }

        .roll-pill { background: #F8FAFC; color: #64748B; padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; border: 1px solid #E2E8F0; }
        .student-info { display: flex; align-items: center; gap: 15px; }
        .avatar { min-width: 42px; height: 42px; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .info-text { display: flex; flex-direction: column; }
        .info-text .name { font-weight: 700; color: #1E293B; font-size: 1rem; }
        .info-text .sub-text { font-size: 0.75rem; color: #94A3B8; font-weight: 500; }

        .status-selector { background: #F1F5F9; padding: 4px; border-radius: 12px; display: inline-flex; gap: 5px; }
        .st-btn { width: 38px; height: 38px; border-radius: 10px; border: none; font-weight: 800; cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); color: #94A3B8; background: transparent; font-size: 0.9rem; }
        .st-btn:hover { background: rgba(255,255,255,0.5); }
        .st-btn.present.active { background: linear-gradient(135deg, #10B981, #059669); color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); transform: scale(1.05); }
        .st-btn.absent.active { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); transform: scale(1.05); }
        .st-btn.late.active { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); transform: scale(1.05); }
        .st-btn:active { transform: scale(0.9); }

        .remark-input { width: 100%; border: 1px solid transparent; background: #F8FAFC; padding: 10px 15px; border-radius: 10px; outline: none; transition: 0.3s; color: #334155; font-size: 0.9rem; min-width: 150px; }
        .remark-input:focus { background: white; border-color: #CBD5E1; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
        .remark-input.required { background: #FEF2F2; border-color: #FECACA; }
        .remark-input.required:focus { border-color: #EF4444; }

        .floating-action-bar {
            position: fixed; bottom: 30px; right: 40px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(15px);
            padding: 12px 15px 12px 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.8);
            display: flex; align-items: center; gap: 20px; z-index: 1000;
        }
        .summary-text { font-size: 0.9rem; font-weight: 600; color: #64748B; }
        .save-btn-glowing {
            background: #0F172A; color: white; padding: 12px 24px; border-radius: 14px; border: none; font-weight: 700;
            display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s; box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.1);
        }
        .save-btn-glowing:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15, 23, 42, 0.3); }

        .insights-header { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .insight-card { background: white; border-radius: 20px; padding: 25px; position: relative; overflow: hidden; display: flex; align-items: center; gap: 20px; box-shadow: var(--shadow-sm); transition: 0.3s; }
        .insight-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        
        .ic-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; position: relative; z-index: 2; flex-shrink: 0;}
        .primary .ic-icon { background: linear-gradient(135deg, #6366F1, #4F46E5); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
        .gold .ic-icon { background: linear-gradient(135deg, #F59E0B, #D97706); box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
        .danger .ic-icon { background: linear-gradient(135deg, #EF4444, #B91C1C); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }

        .ic-label { font-size: 0.85rem; color: #64748B; font-weight: 600; margin-bottom: 4px; position: relative; z-index: 2; }
        .ic-val { font-size: 1.5rem; font-weight: 800; color: #1E293B; position: relative; z-index: 2; }
        .ic-bg-icon { position: absolute; right: -15px; bottom: -15px; color: rgba(0,0,0,0.05); transform: rotate(-15deg); z-index: 1; }

        .analytics-card-pro { background: white; border-radius: 24px; padding: 35px; box-shadow: var(--shadow-sm); border: 1px solid white;}
        .card-header-pro { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .filter-btn-pro { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 20px; border-radius: 12px; font-weight: 600; color: #475569; display: flex; gap: 8px; cursor: pointer; transition: 0.2s; }
        .filter-btn-pro:hover { background: #F1F5F9; color: #0F172A; }

        .leaderboard-list { display: flex; flex-direction: column; gap: 15px; }
        .leaderboard-row { display: flex; align-items: center; background: #F8FAFC; padding: 15px 25px; border-radius: 18px; transition: 0.3s; border: 1px solid transparent; animation: fadeInUp 0.5s backwards; flex-wrap: wrap; }
        .leaderboard-row:hover { background: white; border-color: #E2E8F0; box-shadow: 0 8px 25px -5px rgba(0,0,0,0.08); transform: scale(1.01); }

        .lb-rank { width: 40px; }
        .rank-badge { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
        .gold { background: linear-gradient(135deg, #FFD700, #FDB931); color: #78350F; box-shadow: 0 2px 10px rgba(255, 215, 0, 0.4); }
        .silver { background: linear-gradient(135deg, #E0E0E0, #BDBDBD); color: #424242; }
        .bronze { background: linear-gradient(135deg, #CD7F32, #A0522D); color: #3E2723; }
        .normal { color: #94A3B8; background: transparent; }

        .lb-info { flex: 2; margin-left: 15px; min-width: 150px; }
        .lb-name { font-weight: 700; color: #334155; font-size: 1rem; display: flex; align-items: center; gap: 6px; }
        .icon-zap { color: #F59E0B; animation: pulse 2s infinite; }
        .lb-status { margin-top: 4px; }
        .badge-pill { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .safe { background: #ECFDF5; color: #059669; }
        .danger { background: #FEF2F2; color: #B91C1C; }

        .lb-progress { flex: 3; padding: 0 20px; min-width: 150px;}
        .lb-bar-bg { height: 10px; background: #E2E8F0; border-radius: 20px; overflow: hidden; position: relative; }
        .lb-bar-fill { height: 100%; border-radius: 20px; position: relative; overflow: hidden; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .safe-fill { background: linear-gradient(90deg, #10B981, #34D399); box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
        .warn-fill { background: linear-gradient(90deg, #EF4444, #F87171); box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }

        .shimmer-effect { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transform: skewX(-20deg) translateX(-150%); animation: shimmer 2s infinite; }

        .lb-score { text-align: right; width: 80px; }
        .score-big { display: block; font-weight: 800; font-size: 1.2rem; color: #1E293B; }
        .trend-icon { display: block; margin-top: 2px; }

        @keyframes shimmer { 100% { transform: skewX(-20deg) translateX(150%); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        
        .glass-toast { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid white; padding: 15px 20px; border-radius: 20px; display: flex; gap: 15px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); align-items: center; max-width: 400px; }
        .icon-box { font-size: 1.5rem; }
        .content-box b { display: block; color: #0F172A; }
        .content-box p { margin: 2px 0 0; font-size: 0.85rem; color: #64748B; }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        
        .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .slide-down { animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .slide-up-reveal { animation: fadeInUp 0.8s 0.5s backwards; }

        .loader-container { display: flex; justify-content: center; align-items: center; height: 50vh; }
        .loader { width: 40px; height: 40px; border: 4px solid #E2E8F0; border-top-color: #4F46E5; border-radius: 50%; animation: spin 1s linear infinite; }

        /* 📱 100% PROPER MOBILE SCROLL FIX + BUTTON FIX MERGED */
        @media (max-width: 850px) {
            .app-mobile-scroll {
                display: block !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow-x: hidden !important;
                overflow-y: visible !important; /* Lets body handle the scroll natively */
            }

            .main-content {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 80px !important; 
                width: 100% !important;
                height: auto !important;
                overflow: visible !important; 
            }

            .content-wrapper {
                height: auto !important;
                overflow: visible !important;
            }

            .glass-header { flex-direction: column; align-items: flex-start; gap: 15px; }
            .header-actions { width: 100%; justify-content: space-between; }
            .glass-tab-container { width: 100%; display: flex; }
            .tab-btn { flex: 1; justify-content: center; }
            .profile-bubble { display: none; }
            
            /* 🚀 EXACT FIX: Date & Class Buttons COMPACT SIZE */
            .controls-bar { 
                flex-direction: row !important; 
                flex-wrap: wrap !important; 
                align-items: center !important; 
                gap: 10px !important; 
            }
            .control-group { 
                width: auto !important; 
                flex: 0 0 auto !important; 
                justify-content: flex-start !important; 
                padding: 8px 14px !important; 
            }
            .ghost-select, .ghost-input { font-size: 0.85rem !important; }
            .spacer { display: none; }
            .toggle-pill { width: auto !important; padding: 6px 12px !important; margin-left: auto;}
            
            .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; } 
            
            /* 🚀 EXACT FIX FOR SCROLL: ADDING 180px MARGIN BOTTOM TO AVOID BUTTON OVERLAP */
            .table-container { margin-bottom: 180px !important; }
            .leaderboard-list { margin-bottom: 180px !important; }

            .insights-header { grid-template-columns: 1fr; gap: 15px; }
            .analytics-card-pro { padding: 20px; }
            .card-header-pro { flex-direction: column; align-items: flex-start; gap: 15px; }
            
            .leaderboard-row { padding: 15px; gap: 10px; }
            .lb-progress { padding: 10px 0; width: 100%; order: 3; }
            .lb-score { order: 2; margin-left: auto;}
            
            .floating-action-bar {
                width: calc(100% - 30px);
                left: 15px;
                right: 15px;
                bottom: 15px;
                justify-content: space-between;
                padding: 15px;
                box-sizing: border-box;
                position: fixed; 
            }
            .summary-text { font-size: 0.8rem; }
            .save-btn-glowing { padding: 10px 15px; font-size: 0.85rem; }
        }

        @media (max-width: 400px) {
            .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// ✨ REUSABLE 3D STAT CARD
const StatCard = ({ label, value, icon, color, delay }) => {
    const colors = {
        indigo: { bg: 'linear-gradient(135deg, #6366F1, #4F46E5)', shadow: 'rgba(99, 102, 241, 0.3)' },
        emerald: { bg: 'linear-gradient(135deg, #10B981, #059669)', shadow: 'rgba(16, 185, 129, 0.3)' },
        rose: { bg: 'linear-gradient(135deg, #F43F5E, #E11D48)', shadow: 'rgba(244, 63, 94, 0.3)' },
        amber: { bg: 'linear-gradient(135deg, #F59E0B, #D97706)', shadow: 'rgba(245, 158, 11, 0.3)' }
    };
    const theme = colors[color];

    return (
        <div style={{ animation: `scaleIn 0.5s ${delay} backwards`, height: '100%' }}>
            <div 
                style={{ 
                    background: theme.bg, 
                    borderRadius: '20px', 
                    padding: '24px', 
                    color: 'white', 
                    position: 'relative', 
                    overflow: 'hidden',
                    boxShadow: `0 10px 25px -5px ${theme.shadow}`,
                    transition: 'transform 0.3s',
                    height: '100%',
                    boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
                <div style={{position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', background:'rgba(255,255,255,0.15)', borderRadius:'50%'}}></div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                        <p style={{margin:0, opacity:0.9, fontSize:'0.9rem', fontWeight:'600'}}>{label}</p>
                        <h3 style={{margin:'5px 0 0', fontSize:'2.2rem', fontWeight:'800'}}>{value}</h3>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.2)', padding:'10px', borderRadius:'12px', backdropFilter:'blur(5px)'}}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};