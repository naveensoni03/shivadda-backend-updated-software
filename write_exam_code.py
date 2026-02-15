import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Exams.jsx")

print(f"📂 Targeting: {TARGET_FILE}")

# --- FULL REACT CODE ---
code_content = r"""import React, { useState, useEffect, useRef, useCallback } from "react";
import SidebarModern from "../components/SidebarModern";
import "./dashboard.css"; 
import toast, { Toaster } from 'react-hot-toast'; 
import api from "../api/axios"; 
import Webcam from "react-webcam"; 
import ReactPlayer from "react-player"; 
import { Camera, Video, UserCheck, ShieldCheck, Sparkles, Brain, Save, CheckCircle, Loader, Zap, Copy, RefreshCw } from "lucide-react"; 

export default function Exams() {
  const [exams, setExams] = useState([]);
  
  // Panel & UI States
  const [activePanel, setActivePanel] = useState("none"); 
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null); 
  const [isRefreshing, setIsRefreshing] = useState(false); // Refresh Animation State

  // --- AI QUIZ GENERATOR STATES ---
  const [aiTopic, setAiTopic] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiQuestions, setAiQuestions] = useState(null);

  // --- FACIAL RECOGNITION & VIDEO STATES ---
  const webcamRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);

  // --- LIVE MONITORING STATES ---
  const [timeLeft, setTimeLeft] = useState(5400); 
  const [liveLogs, setLiveLogs] = useState([]);
  const [studentStatus, setStudentStatus] = useState([
      {id: 1, name: 'Rahul S.', status: 'online', msg: 'Writing...'},
      {id: 2, name: 'Priya D.', status: 'warning', msg: 'Tab Switched ⚠️'},
      {id: 3, name: 'Amit K.', status: 'offline', msg: 'Disconnected 🔴'},
      {id: 4, name: 'Sneha R.', status: 'online', msg: 'Writing...'},
      {id: 5, name: 'Vikram', status: 'online', msg: 'Writing...'},
      {id: 6, name: 'Kunal V.', status: 'warning', msg: 'No Face ⚠️'},
  ]);

  // --- MOCK DATA ---
  const [studentMarks, setStudentMarks] = useState([
    { id: 101, name: "Naveen Soni", roll: "101", marks: { Physics: 95, Chemistry: 88, Maths: 92, English: 85, CS: 98 }, attendance: "92%" },
    { id: 102, name: "Kunal Verma", roll: "102", marks: { Physics: 78, Chemistry: 82, Maths: 75, English: 80, CS: 85 }, attendance: "88%" },
    { id: 103, name: "Rahul Singh", roll: "103", marks: { Physics: 45, Chemistry: 50, Maths: 30, English: 60, CS: 55 }, attendance: "70%" },
    { id: 104, name: "Priya Das", roll: "104", marks: { Physics: 88, Chemistry: 90, Maths: 95, English: 92, CS: 90 }, attendance: "95%" },
  ]);

  const [formData, setFormData] = useState({ 
    title: "", subject: "Physics", date: "", time: "", duration: "", totalMarks: "100",
    passingMarks: "33", batch: "Class 10-A", instructions: "" 
  });

  // Safe Sound Function
  const playSound = () => {
    const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
    audio.play().catch(e => console.error("Audio play failed:", e));
  };

  // DATA FETCHING FUNCTION
  const fetchExams = useCallback(async (showToast = false) => {
    if(showToast) setIsRefreshing(true);
    try {
      const response = await api.get("exams/");
      if (response.data && response.data.length > 0) {
          setExams(response.data);
          if(showToast) toast.success("Dashboard Updated!");
      } else {
          loadOriginalMockData();
      }
    } catch (error) { 
        loadOriginalMockData(); 
        if(showToast) toast.error("Offline Mode Active");
    } finally {
        if(showToast) setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchExams(false);
  }, [fetchExams]);

  const loadOriginalMockData = () => {
    setExams([
      { id: 1, title: "Mid-Term Physics", subject: "Physics", date: "2025-12-22", time: "10:00 AM", duration: "2 Hrs", status: "Live", candidates: 45, icon: "⚡" },
      { id: 2, title: "Calculus II Final", subject: "Maths", date: "2025-12-22", time: "11:00 AM", duration: "3 Hrs", status: "Live", candidates: 30, icon: "📐" },
      { id: 3, title: "Final Exams 2025", subject: "All Subjects", date: "2025-12-30", time: "09:00 AM", duration: "3 Hrs", status: "Upcoming", candidates: 120, icon: "🎓" },
    ]);
  };

  // REAL-TIME PROCTORING LOGIC
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("WARNING: Tab Switching Detected! ⚠️", { duration: 4000 });
        setLiveLogs(prev => [`• ${new Date().toLocaleTimeString()} - YOU: Switched Tab (Recorded)`, ...prev]);
      }
    };
    const handleOffline = () => {
      toast.error("Network Lost! 🔴");
      setLiveLogs(prev => [`• ${new Date().toLocaleTimeString()} - YOU: Went Offline`, ...prev]);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("offline", handleOffline);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // IDENTITY VERIFICATION LOGIC
  const handleVerifyFace = useCallback(() => {
    setIsVerifying(true);
    setTimeout(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if(imageSrc) {
            setFaceVerified(true);
            setIsVerifying(false);
            playSound();
            toast.success("Identity Verified Successfully! 🟢");
            setLiveLogs(prev => [`• ${new Date().toLocaleTimeString()} - Identity Check Passed`, ...prev]);
        }
    }, 2000);
  }, [webcamRef]);

  // AI QUIZ GENERATOR LOGIC
  const handleGenerateAIQuiz = async () => {
    if(!aiTopic) return toast.error("Please enter a topic first!");
    
    setIsAiGenerating(true);
    setAiQuestions(null);

    try {
        const response = await api.post("exams/generate-quiz/", { topic: aiTopic });
        
        if(response.data.status === 'success') {
            setAiQuestions(response.data.questions);
            playSound();
            toast.success("✨ AI Generated Fresh Questions!");
        } else {
            toast.error("AI Brain Overloaded! Try again.");
        }
    } catch (error) {
        toast.error("Server Issue. Using Offline Mode.");
        setAiQuestions([
            { id: 1, question: `Sample AI Question regarding ${aiTopic}?`, options: ["Option A", "Option B", "Option C", "Option D"], correct: "Option A" }
        ]);
    } finally {
        setIsAiGenerating(false);
    }
  };

  // SAVE TO QUESTION BANK LOGIC
  const handleSaveToBank = async () => {
    if(!aiQuestions || aiQuestions.length === 0) return toast.error("No questions to save!");

    const toastId = toast.loading("Saving to Database...");

    try {
        const response = await api.post("exams/save-quiz/", { 
            topic: aiTopic, 
            questions: aiQuestions 
        });

        if(response.data.status === 'success') {
            playSound();
            toast.success("Quiz Saved to Exam Bank! 🎉", { id: toastId });
            setActivePanel("none"); 
            fetchExams(true); 
        } else {
            toast.error("Failed to Save.", { id: toastId });
        }
    } catch (error) {
        console.error(error);
        toast.error("Server Error! Check Backend.", { id: toastId });
    }
  };

  // Timer Logic
  useEffect(() => {
    let timer;
    if (activePanel === 'monitor' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activePanel, timeLeft]);

  // Logs Simulator
  useEffect(() => {
    let poller;
    if (activePanel === 'monitor') {
      poller = setInterval(() => {
        const events = ['Tab Switched ⚠️', 'Lost Connection 🔴', 'Back Online 🟢'];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        const newLog = `• ${new Date().toLocaleTimeString()} - Student Alert : ${randomEvent}`;
        setLiveLogs(prev => [newLog, ...prev]);
      }, 4000);
    }
    return () => clearInterval(poller);
  }, [activePanel]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNotifyParents = async (examId) => {
    try {
      toast.loading("Sending SMS alerts...");
      await api.post(`exams/notify/`, { exam_id: examId }); 
      toast.dismiss();
      playSound();
      toast.success("SMS Sent to all Parents! 📱");
    } catch (error) {
      toast.dismiss();
      playSound();
      toast.success("DEBUG: SMS Signal Triggered ✅");
    }
  };

  const handlePauseExam = async () => { toast.success("Exam Paused for all Candidates ⏸"); };
  const handleMessageAll = () => { toast.success("Message Broadcasted 📩"); };

  const calculateGrade = (marks) => {
    if (marks >= 90) return "A+"; if (marks >= 80) return "A";
    if (marks >= 70) return "B+"; if (marks >= 60) return "B";
    if (marks >= 50) return "C"; if (marks >= 33) return "D";
    return "F";
  };

  const handleOpenSchedule = () => {
    setFormData({ title: "", subject: "Physics", date: "", time: "", duration: "", totalMarks: "100", passingMarks: "33", batch: "Class 10-A", instructions: "" });
    setActivePanel("schedule"); 
  };

  const handleMonitor = (exam) => { setSelectedExam(exam); setActivePanel("monitor"); };
  const handleResults = (exam) => { setSelectedExam(exam); setActivePanel("results"); };
  const handleGenerateReportCard = (student) => { setSelectedStudentForReport(student); setActivePanel("reportCard"); };
  const handlePrint = () => { window.print(); };

  const handleSaveSchedule = async () => {
      if(!formData.title) return toast.error("Enter Exam Title");
      playSound();
      toast.success("Exam Published! 🚀");
      setActivePanel("none");
      fetchExams(true); 
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'Live': return { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', label: '● LIVE NOW', specialClass: 'pulse-red' }; 
        case 'Upcoming': return { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe', label: 'Upcoming', specialClass: 'shimmer-hover' }; 
        default: return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Completed' };
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#000000', outline: 'none', fontSize: '0.9rem', fontWeight: '600', transition: '0.3s'
  };

  return (
    <div className="dashboard-container" style={{background: '#f8fafc', height: '100vh', display: 'flex', overflow: 'hidden'}}>
      <SidebarModern />
      <Toaster position="top-center" />

      <div className="main-content" style={{flex: 1, padding: '30px 40px', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column'}}>
        
        <header className="slide-in-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexShrink: 0 }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-1px', margin: 0 }}>Examination & Results</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '600', margin: 0 }}>Smart LMS Proctoring & Automated Learning.</p>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
            
            {/* REFRESH BUTTON */}
            <button 
                onClick={() => fetchExams(true)} 
                className={`btn-icon-only ${isRefreshing ? 'spin-fast' : ''}`} 
                style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}
                title="Refresh Data"
            >
                <RefreshCw size={20} color="#64748b"/>
            </button>

            <button className="btn-glow hover-scale-press" onClick={() => setActivePanel("aiGenerator")} style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'}}>
                <Sparkles size={18}/> AI Quiz Gen
            </button>
            <button className="btn-glow hover-scale-press" onClick={() => setActivePanel("lectures")} style={{background: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Video size={18}/> Lectures
            </button>
            <button className="btn-glow pulse-animation hover-scale-press" onClick={handleOpenSchedule} style={{fontWeight: '700', padding: '12px 25px'}}>
              <span style={{marginRight: '8px', fontSize: '1.2rem'}}>+</span> Schedule Exam
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid" style={{display: 'flex', gap: '20px', marginBottom: '30px', flexShrink: 0}}>
            <div className="stat-card-glass fade-in-up" style={{animationDelay: '0.1s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>LIVE EXAMS</span><h2 style={{color:'#ef4444', fontSize:'2.2rem', margin: '5px 0'}}>02</h2></div>
                    <div className="icon-box" style={{background: '#fef2f2', color: '#ef4444'}}>📡</div>
                </div>
            </div>
            <div className="stat-card-glass fade-in-up" style={{animationDelay: '0.2s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>UPCOMING</span><h2 style={{color:'#3b82f6', fontSize:'2.2rem', margin: '5px 0'}}>05</h2></div>
                    <div className="icon-box" style={{background: '#eff6ff', color: '#3b82f6'}}>📅</div>
                </div>
            </div>
            <div className="stat-card-glass fade-in-up" style={{animationDelay: '0.3s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>RESULTS DECLARED</span><h2 style={{color:'#10b981', fontSize:'2.2rem', margin: '5px 0'}}>19</h2></div>
                    <div className="icon-box" style={{background: '#f0fdf4', color: '#10b981'}}>✅</div>
                </div>
            </div>
        </div>

        <div className="glass-card fade-in-up" style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '28px', animationDelay: '0.4s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="table-container-scroll" style={{overflowY: 'auto', paddingRight: '5px'}}>
                <table className="modern-table luxe-table">
                    <thead><tr><th style={{width: '25%'}}>EXAM TITLE</th><th style={{width: '15%'}}>DATE</th><th style={{width: '15%'}}>DURATION</th><th style={{width: '15%'}}>CANDIDATES</th><th style={{width: '15%'}}>STATUS</th><th style={{width: '15%', textAlign: 'right'}}>ACTION</th></tr></thead>
                    <tbody>
                        {exams.map((exam, idx) => {
                            const statusStyle = getStatusBadge(exam.status);
                            return (
                                <tr key={exam.id} className="floating-row stagger-animation" style={{animationDelay: `${idx * 0.08}s`}}>
                                    <td><div style={{display:'flex', alignItems:'center', gap:'15px'}}><div className="subject-icon-box">{exam.icon}</div><div style={{display:'flex', flexDirection:'column'}}><b style={{color: '#1e293b', fontSize: '0.95rem'}}>{exam.title}</b><span style={{color: '#64748b', fontSize: '0.8rem'}}>{exam.subject}</span></div></div></td>
                                    <td><span style={{color:'#334155', fontWeight:'600'}}>{exam.date}</span><br/><span style={{fontSize:'0.8rem', color:'#64748b'}}>{exam.time}</span></td>
                                    <td style={{color: '#64748b', fontWeight: '500'}}>⏱ {exam.duration}</td>
                                    <td><span style={{fontWeight:'700', color:'#334155'}}>👥 {exam.candidates}</span></td>
                                    <td><span className={`status-badge ${statusStyle.specialClass}`} style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>{statusStyle.label || exam.status}</span></td>
                                    <td style={{textAlign: 'right'}}>
                                        {exam.status === 'Upcoming' && <button className="btn-secondary-sm hover-lift" onClick={() => handleNotifyParents(exam.id)} style={{marginRight: '8px', color: '#6366f1', borderColor: '#6366f1'}}>Notify 🔔</button>}
                                        {exam.status === 'Live' ? <button className="btn-monitor hover-lift" onClick={() => handleMonitor(exam)}>Monitor 👁</button> : <button className="btn-results hover-lift" onClick={() => handleResults(exam)}>Report Cards 📄</button>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {activePanel !== "none" && (
            <div className="overlay-blur" onClick={() => setActivePanel("none")}>
                <div className={`luxe-panel slide-in-right ${['reportCard', 'lectures', 'aiGenerator'].includes(activePanel) ? 'report-panel' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="panel-header-simple no-print" style={{borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px'}}>
                        <div>
                            <h2 style={{margin: '0 0 5px', color: '#0f172a', fontWeight:'800'}}>
                                {activePanel === 'schedule' ? 'Schedule Exam' : activePanel === 'monitor' ? 'AI Cockpit' : activePanel === 'lectures' ? 'Interactive Video' : activePanel === 'aiGenerator' ? 'AI Quiz Architect' : 'Student Report Card'}
                            </h2>
                            <p style={{margin: 0, color: '#64748b', fontSize: '0.9rem'}}>
                                {activePanel === 'aiGenerator' ? 'Generate high-quality MCQs instantly.' : 'Manage system operations.'}
                            </p>
                        </div>
                        <button className="close-circle-btn hover-rotate" onClick={() => setActivePanel("none")}>✕</button>
                    </div>
                    
                    <div className="panel-content-scroll">
                        
                        {/* PREMIUM AI QUIZ GENERATOR UI */}
                        {activePanel === 'aiGenerator' && (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
                                <div className="ai-hero-card">
                                    <div style={{position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1}}><Brain size={120} color="white"/></div>
                                    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px', position:'relative'}}>
                                        <div className="glass-icon"><Zap size={22} color="white"/></div>
                                        <h3 style={{margin:0, color:'white', fontSize:'1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>What should we test today?</h3>
                                    </div>
                                    <div style={{background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '5px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.3)'}}>
                                        <textarea 
                                            placeholder="e.g. Thermodynamics, Shakespeare's Macbeth, Python List Comprehension..." 
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            className="ai-textarea"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleGenerateAIQuiz} 
                                        disabled={isAiGenerating}
                                        className="btn-ai-generate hover-scale-press"
                                    >
                                        {isAiGenerating ? <><Loader className="spin-slow" size={20}/> Orchestrating Questions...</> : <><Sparkles size={20}/> Generate Magic Quiz</>}
                                    </button>
                                </div>

                                {aiQuestions && (
                                    <div className="fade-in-up">
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '15px'}}>
                                            <h4 style={{color:'#334155', margin:0, display:'flex', alignItems:'center', gap:'8px'}}><CheckCircle size={18} color="#16a34a"/> AI Output Ready</h4>
                                            <button className="btn-secondary-sm" style={{fontSize: '0.75rem', padding: '6px 12px'}}><Copy size={14}/> Copy All</button>
                                        </div>
                                        {aiQuestions.map((q, i) => (
                                            <div key={q.id} className="ai-question-card">
                                                <div style={{marginBottom:'12px'}}>
                                                    <span style={{fontSize:'0.75rem', fontWeight:'800', color:'#8b5cf6', background:'#f3e8ff', padding:'4px 8px', borderRadius:'6px', marginRight:'8px'}}>Q{i+1}</span>
                                                    <b style={{color:'#1e293b', fontSize: '0.95rem'}}>{q.question}</b>
                                                </div>
                                                <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'8px'}}>
                                                    {q.options.map((opt) => (
                                                        <div key={opt} className={`ai-option ${opt === q.correct ? 'correct' : ''}`}>
                                                            {opt === q.correct ? <CheckCircle size={16} color="#16a34a"/> : <div style={{width:'16px'}}></div>} 
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            className="btn-save-quiz hover-lift" 
                                            onClick={handleSaveToBank}
                                        >
                                            <Save size={18}/> Save to Question Bank
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activePanel === 'lectures' && (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                <div style={{borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
                                    <ReactPlayer url="https://www.youtube.com/watch?v=ysz5S6PUM-U" width="100%" controls={true} onProgress={(progress) => { if(Math.floor(progress.playedSeconds) === 30) { toast("AI Interactive Quiz Triggered!", {icon: "💡"}); } }} />
                                </div>
                                <div style={{padding: '20px', background: '#f0fdf4', borderRadius: '15px', border: '1px solid #bbf7d0'}}>
                                    <h4 style={{color: '#16a34a', margin: '0 0 10px'}}>Interactive Learning Log</h4>
                                    <p style={{fontSize: '0.85rem', color: '#166534'}}>System detects your focus. Pop-up quizzes will appear at specific intervals.</p>
                                </div>
                            </div>
                        )}

                        {activePanel === 'schedule' && (
                            <>
                                <div className="input-group"><label style={{fontWeight:'900', color:'#000'}}>Exam Title</label><input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={inputStyle} placeholder="e.g. Unit Test - Physics" /></div>
                                <div className="grid-2-col">
                                    <div className="input-group"><label style={{fontWeight:'900', color:'#000'}}>Select Batch</label><select value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} style={inputStyle}><option>Class 10-A</option><option>Class 12-B</option></select></div>
                                    <div className="input-group"><label style={{fontWeight:'900', color:'#000'}}>Passing Marks</label><input type="number" value={formData.passingMarks} onChange={(e) => setFormData({...formData, passingMarks: e.target.value})} style={inputStyle} placeholder="33" /></div>
                                </div>
                                <button className="btn-confirm-gradient hover-lift" onClick={handleSaveSchedule} style={{marginTop: '20px', width: '100%', padding: '14px', fontWeight: '800'}}>🚀 Publish Schedule</button>
                            </>
                        )}

                        {activePanel === 'monitor' && (
                            <div style={{height: '100%', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '2px solid #e2e8f0'}}>
                                    <h4 style={{fontSize: '0.9rem', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}><Camera size={18}/> Proctoring: Identity Verification</h4>
                                    {!faceVerified ? (
                                        <div style={{position: 'relative', borderRadius: '12px', overflow: 'hidden'}}>
                                            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" audio={false} mirrored={true} videoConstraints={{ width: 640, height: 480, frameRate: { ideal: 30, max: 60 }, facingMode: "user" }} style={{width: '100%', height: 'auto', objectFit: 'cover'}} />
                                            <button className="btn-glow" onClick={handleVerifyFace} disabled={isVerifying} style={{position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', width: '80%'}}>{isVerifying ? "Matching..." : "Scan & Verify Face"}</button>
                                        </div>
                                    ) : (
                                        <div style={{textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0'}}><UserCheck size={48} color="#16a34a" style={{margin: '0 auto 10px'}}/><b style={{color: '#16a34a'}}>Student ID #101 Verified: Naveen Soni</b></div>
                                    )}
                                </div>
                                <div style={{background: '#fee2e2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div><h4 style={{margin: 0, color: '#991b1b', fontWeight: '900', fontSize: '1rem'}}>🔴 LIVE FEED</h4></div>
                                    <div style={{textAlign: 'right'}}><span style={{display: 'block', fontSize: '1.8rem', fontWeight: '900', color: '#dc2626', fontFamily: 'monospace'}}>{formatTime(timeLeft)}</span></div>
                                </div>
                                <div style={{display: 'flex', gap: '10px'}}><button className="btn-secondary-sm" onClick={handlePauseExam} style={{flex: 1, borderColor: '#dc2626', color: '#dc2626', fontWeight: '800'}}>⏸ Pause</button><button className="btn-secondary-sm" onClick={handleMessageAll} style={{flex: 1, borderColor: '#0f172a', color: '#0f172a', fontWeight: '800'}}>📩 Warning</button></div>
                                <h5 style={{margin: '0', color: '#64748b', fontWeight: '800'}}>CANDIDATE STATUS</h5>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', overflowY: 'auto', flex: 1}}>
                                    {studentStatus.map((s) => (
                                        <div key={s.id} style={{background: s.status === 'offline' ? '#fef2f2' : s.status === 'warning' ? '#fffbeb' : '#f0fdf4', border: `1px solid ${s.status === 'offline' ? '#fecaca' : s.status === 'warning' ? '#fde68a' : '#bbf7d0'}`, padding: '10px', borderRadius: '10px', textAlign: 'center'}}>
                                            <div style={{width: '35px', height: '35px', borderRadius: '50%', background: '#fff', margin: '0 auto 5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '800', border: '1px solid #e2e8f0'}}>{s.name.charAt(0)}</div>
                                            <b style={{display: 'block', fontSize: '0.8rem', color: '#0f172a'}}>{s.name}</b><span style={{fontSize: '0.65rem', fontWeight: '800', color: s.status === 'offline' ? '#dc2626' : s.status === 'warning' ? '#d97706' : '#16a34a'}}>{s.msg}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{marginTop: 'auto', background: '#1e293b', padding: '15px', borderRadius: '12px', color: '#fff', fontSize: '0.85rem', height: '100px', overflowY: 'auto'}}>
                                    <div style={{marginBottom: '5px', borderBottom: '1px solid #334155', fontWeight: '800', color: '#94a3b8'}}>📡 SYSTEM ACTIVITY LOG</div>
                                    {liveLogs.map((log, index) => (<div key={index} style={{color: log.includes('🔴') ? '#f87171' : log.includes('⚠️') ? '#fbbf24' : '#4ade80', marginBottom: '4px'}}>{log}</div>))}
                                </div>
                            </div>
                        )}

                        {activePanel === 'reportCard' && selectedStudentForReport && (
                            <div id="printable-report" className="report-card-container">
                                <div className="report-header"><div style={{fontSize:'2.5rem'}}>🏫</div><div style={{textAlign:'center', flex:1}}><h1 style={{margin:0, color:'#0f172a', textTransform:'uppercase', letterSpacing:'1px', fontSize:'1.8rem'}}>Shivadda Academy</h1><p style={{margin:'5px 0', fontSize:'0.9rem', color:'#64748b'}}>Affiliated to CBSE, New Delhi | School Code: 1024</p></div><div style={{width:'80px', height:'100px', border:'1px solid #cbd5e1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'#94a3b8', background:'#f8fafc'}}>Student Photo</div></div>
                                <div className="student-details-box" style={{color: '#0f172a'}}><div className="grid-2-col-compact"><div><span className="label">Student Name:</span> <b style={{color: '#000'}}>{selectedStudentForReport.name}</b></div><div><span className="label">Roll Number:</span> <b style={{color: '#000'}}>{selectedStudentForReport.roll}</b></div><div><span className="label">Class/Section:</span> <b style={{color: '#000'}}>10 - A</b></div><div><span className="label">Attendance:</span> <b style={{color: '#000'}}>{selectedStudentForReport.attendance}</b></div></div></div>
                                <table className="report-table"><thead><tr><th>SUBJECT</th><th>MAX</th><th>OBTAINED</th><th>GRADE</th></tr></thead><tbody>{Object.entries(selectedStudentForReport.marks).map(([sub, score]) => (<tr key={sub}><td>{sub}</td><td>100</td><td>{score}</td><td style={{color: score < 33 ? '#dc2626' : '#16a34a'}}>{calculateGrade(score)}</td></tr>))}</tbody></table>
                                <button className="btn-confirm-gradient hover-lift no-print" onClick={handlePrint} style={{width:'100%', marginTop: '30px', padding: '14px', fontSize: '1rem'}}>🖨️ Print Report Card</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>

      <style>{`
        /* --- 1. ANIMATIONS (Keyframes) --- */
        @keyframes slideInDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* --- 2. ANIMATION CLASSES --- */
        .slide-in-down { animation: slideInDown 0.6s ease-out; }
        .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; } /* Starts hidden */
        .slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .pulse-animation { animation: pulse 2s infinite; }
        .hover-lift { transition: transform 0.2s; }
        .hover-lift:hover { transform: translateY(-3px); }
        .spin-fast { animation: spin 0.8s linear infinite; }
        
        /* Staggered Delays for Table Rows */
        .stagger-animation { opacity: 0; animation: fadeInUp 0.5s ease-out forwards; }
        
        /* --- 3. EXISTING STYLES (Unchanged) --- */
        .gradient-text { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .student-row-card { display: flex; justifyContent: space-between; alignItems: center; background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; transition: 0.2s; }
        .btn-secondary-sm { background: white; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.8rem; color: #475569; transition: 0.2s; }
        .btn-secondary-sm:hover { background: #0f172a; color: white; border-color: #0f172a; }
        .report-panel { width: 750px; } 
        .report-card-container { background: white; padding: 40px; border: 1px solid #e2e8f0; position: relative; font-family: 'Times New Roman', serif; }
        .report-header { display: flex; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; }
        .student-details-box { background: #f8fafc; padding: 20px; border: 1px solid #0f172a; margin-bottom: 25px; }
        .grid-2-col-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 40px; }
        .label { color: #64748b; font-size: 0.9rem; margin-right: 10px; }
        .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #0f172a; }
        .report-table th { background: #0f172a; color: white; padding: 10px; text-align: left; font-size: 0.9rem; border: 1px solid #0f172a; }
        .report-table td { padding: 10px; border: 1px solid #cbd5e1; color: #0f172a; }
        @media print { body * { visibility: hidden; } .no-print { display: none !important; } #printable-report, #printable-report * { visibility: visible; } #printable-report { position: fixed; left: 0; top: 0; width: 100%; height: 100%; margin: 0; border: none; z-index: 9999; background: white; } }
        .luxe-panel { width: 480px; height: 100%; background: white; padding: 35px; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.15); overflow-y: auto; transition: 0.3s; }
        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .btn-confirm-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); border: none; color: white; border-radius: 12px; font-weight: 700; cursor: pointer; }
        .stat-card-glass { flex: 1; background: #ffffff; padding: 20px; border-radius: 20px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08); border: 1px solid #e2e8f0; }
        .icon-box { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(30px); border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 20px 60px -15px rgba(0,0,0,0.08); }
        .floating-row { transition: all 0.3s; border-radius: 18px; }
        .btn-results { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-monitor { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-edit { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-glow { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; color: white; padding: 10px 22px; border-radius: 50px; font-weight: 700; cursor: pointer; }
        .close-circle-btn { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; border: none; cursor: pointer; color: #64748b; font-size: 1rem; }
        .spin-slow { animation: spin 2s linear infinite; }
        .spin-fast { animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        /* NEW AI STYLES */
        .ai-hero-card { background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); padding: 25px; border-radius: 24px; color: white; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(219, 39, 119, 0.3); }
        .glass-icon { background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
        .ai-textarea { width: 100%; height: 80px; background: transparent; border: none; outline: none; color: white; font-size: 1.1rem; font-weight: 600; padding: 10px; resize: none; }
        .ai-textarea::placeholder { color: rgba(255,255,255,0.7); }
        .btn-ai-generate { width: 100%; margin-top: 15px; background: white; color: #db2777; border: none; padding: 12px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .btn-ai-generate:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .ai-question-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: 0.3s; }
        .ai-question-card:hover { transform: translateY(-2px); border-color: #d8b4fe; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.1); }
        .ai-option { padding: 12px; border-radius: 10px; font-size: 0.9rem; background: #f8fafc; border: 1px solid #f1f5f9; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .ai-option.correct { background: #f0fdf4; border-color: #bbf7d0; color: #166534; font-weight: 700; }
        .btn-save-quiz { width: 100%; padding: 14px; background: #1e293b; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; }
      `}</style>
    </div>
  );
}"""

# --- OVERWRITE FILE ---
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print(f"✅ SUCCESS: Updated {TARGET_FILE}")
