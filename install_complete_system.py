# -*- coding: utf-8 -*-
import os

BASE_DIR = os.getcwd()
PAGES_DIR = os.path.join(BASE_DIR, "frontend", "src", "pages")
COMPONENTS_DIR = os.path.join(BASE_DIR, "frontend", "src", "components")

print("ðŸ”§ Installing Complete Shivadda System (Req 0-8)...")

# ==========================================
# 1. SCHOOL OPS (Req 0, 1, 2, 3)
# ==========================================
school_ops_code = r"""import React, { useState } from "react";
import SidebarModern from "../components/SidebarModern";
import WeatherWidget from "../components/WeatherWidget"; // Req 0
import { MapPin, Calendar, Clock, Edit3, Save, Trash2, CheckSquare, MoreHorizontal, Filter } from "lucide-react";

export default function SchoolOps() {
  // --- REQ 1: LOCATIONS & VIRTUAL ID ---
  const [loc, setLoc] = useState({ continent: "Asia", country: "India", city: "Meerut" });
  const virtualID = `VID-${loc.country.substring(0,3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`;
  
  // --- REQ 3: CALENDAR & TIME ---
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("10:00");

  // --- REQ 2: SMART TABLE DATA ---
  const [records, setRecords] = useState([
      { id: 1, name: "Rahul Sharma", role: "Student", status: "Active" },
      { id: 2, name: "Priya Verma", role: "Teacher", status: "On Leave" },
      { id: 3, name: "Amit Singh", role: "Admin", status: "Active" },
  ]);
  const [selected, setSelected] = useState([]);

  // --- REQ 3: EDITOR (Simple Simulation) ---
  const [editorText, setEditorText] = useState("<b>Notice:</b> Exams starting next week.");

  // Bulk Actions
  const toggleSelect = (id) => {
      if(selected.includes(id)) setSelected(selected.filter(i => i !== id));
      else setSelected([...selected, id]);
  };

  return (
    <div style={{display: "flex", background: "#f8fafc", minHeight: "100vh"}}>
        <SidebarModern />
        <div style={{flex: 1, padding: "30px", marginLeft: "280px"}}>
            
            {/* REQ 0: WEATHER */}
            <div style={{marginBottom: "20px"}}><WeatherWidget /></div>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "30px"}}>
                
                {/* REQ 1: LOCATION & VIRTUAL ID */}
                <div style={{background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)"}}>
                    <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:'10px'}}><MapPin size={20} color="#3b82f6"/> Geo-Location & ID</h3>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "15px"}}>
                        <select className="modern-input" value={loc.continent} onChange={e=>setLoc({...loc, continent:e.target.value})}><option>Asia</option><option>Europe</option></select>
                        <select className="modern-input" value={loc.country} onChange={e=>setLoc({...loc, country:e.target.value})}><option>India</option><option>USA</option></select>
                        <select className="modern-input" value={loc.city} onChange={e=>setLoc({...loc, city:e.target.value})}><option>Meerut</option><option>Delhi</option></select>
                    </div>
                    <div style={{background: "#eff6ff", padding: "15px", borderRadius: "10px", border: "1px dashed #3b82f6"}}>
                        <small style={{color: "#64748b", fontWeight: "bold"}}>GENERATED VIRTUAL ID</small>
                        <div style={{fontSize: "1.4rem", fontWeight: "900", color: "#1e40af", fontFamily: "monospace"}}>{virtualID}</div>
                        <div style={{fontSize: "0.8rem", color: "#60a5fa"}}>Lat: 28.9845 N | Long: 77.7064 E</div>
                    </div>
                </div>

                {/* REQ 3: CALENDAR & EDITOR */}
                <div style={{background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)"}}>
                    <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:'10px'}}><Calendar size={20} color="#8b5cf6"/> Scheduler & Editor</h3>
                    <div style={{display: "flex", gap: "10px", marginBottom: "15px"}}>
                        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="modern-input" />
                        <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="modern-input" />
                    </div>
                    <div style={{border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px"}}>
                        <div style={{display: "flex", gap: "10px", marginBottom: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "5px"}}>
                            <button className="editor-btn"><b>B</b></button>
                            <button className="editor-btn"><i>I</i></button>
                            <button className="editor-btn"><u>U</u></button>
                        </div>
                        <textarea className="editor-area" value={editorText} onChange={e=>setEditorText(e.target.value)} rows="3"></textarea>
                    </div>
                </div>
            </div>

            {/* REQ 2: CHECKBOXES & BULK ACTIONS */}
            <div style={{background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                    <h3 style={{margin:0}}>Records Database</h3>
                    {selected.length > 0 && <button className="btn-danger"><Trash2 size={16}/> Delete ({selected.length})</button>}
                </div>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                    <thead style={{background: "#f8fafc"}}>
                        <tr>
                            <th style={{padding: "15px", width: "40px"}}><CheckSquare size={18} color="#64748b"/></th>
                            <th style={{padding: "15px", textAlign: "left"}}>Serial No.</th>
                            <th style={{padding: "15px", textAlign: "left"}}>Name</th>
                            <th style={{padding: "15px", textAlign: "left"}}>Role</th>
                            <th style={{padding: "15px", textAlign: "left"}}>Status</th>
                            <th style={{padding: "15px", textAlign: "right"}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r, i) => (
                            <tr key={r.id} style={{borderBottom: "1px solid #f1f5f9"}}>
                                <td style={{padding: "15px"}}><input type="checkbox" checked={selected.includes(r.id)} onChange={()=>toggleSelect(r.id)} style={{width: "16px", height: "16px"}}/></td>
                                <td style={{padding: "15px"}}><b>{i+1}</b></td>
                                <td style={{padding: "15px"}}>{r.name}</td>
                                <td style={{padding: "15px"}}><span className="role-tag">{r.role}</span></td>
                                <td style={{padding: "15px"}}><span style={{color: r.status==='Active'?'green':'orange'}}>â— {r.status}</span></td>
                                <td style={{padding: "15px", textAlign: "right"}}><MoreHorizontal size={18} color="#94a3b8"/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .modern-input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; borderRadius: 8px; outline: none; font-weight: 600; }
                .editor-btn { background: #f1f5f9; border: none; padding: 5px 10px; borderRadius: 5px; cursor: pointer; font-weight: bold; }
                .editor-area { width: 100%; border: none; outline: none; font-family: sans-serif; resize: none; }
                .role-tag { background: #eef2ff; color: #6366f1; padding: 4px 10px; borderRadius: 20px; font-size: 0.8rem; fontWeight: 700; }
                .btn-danger { background: #fee2e2; color: #ef4444; border: none; padding: 8px 16px; borderRadius: 8px; fontWeight: 700; display: flex; alignItems: center; gap: 5px; cursor: pointer; }
            `}</style>
        </div>
    </div>
  );
}"""

with open(os.path.join(PAGES_DIR, "SchoolOps.jsx"), "w", encoding="utf-8") as f:
    f.write(school_ops_code)

# ==========================================
# 2. EXAMS (Req 5, 6)
# ==========================================
exams_code = r"""import React, { useState } from "react";
import SidebarModern from "../components/SidebarModern";
import { Clock, CheckCircle, AlertCircle, FileText, UserCheck, Brain, Award } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function Exams() {
  const [activeTab, setActiveTab] = useState('evaluation');

  // --- REQ 5: 3 TEACHER EVALUATION ---
  const [evaluations, setEvaluations] = useState({
      teacher1: { score: 85, comments: "Good concepts", status: "Done" },
      teacher2: { score: 82, comments: "Needs more diagrams", status: "Done" },
      teacher3: { score: null, comments: "", status: "Pending" } // 3rd Teacher Pending
  });

  const [aiScore, setAiScore] = useState(null);

  // --- REQ 6: AI EVALUATION ---
  const handleAiCheck = () => {
      toast.loading("AI Scanning Answer Sheet...");
      setTimeout(() => {
          toast.dismiss();
          setAiScore(84); // Simulated AI Score
          toast.success("AI Evaluation Complete!");
      }, 2000);
  };

  return (
    <div style={{display: "flex", background: "#f8fafc", minHeight: "100vh"}}>
        <SidebarModern />
        <div style={{flex: 1, padding: "30px", marginLeft: "280px"}}>
            <Toaster />
            <h1 style={{fontSize: "2rem", fontWeight: "800", color: "#1e293b", marginBottom: "10px"}}>Exam Controller</h1>
            <p style={{color: "#64748b", marginBottom: "30px"}}>Multi-Tier Evaluation & Question Bank Management</p>

            <div style={{background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)"}}>
                
                {/* Exam Header */}
                <div style={{borderBottom: "1px solid #e2e8f0", paddingBottom: "20px", marginBottom: "20px", display: "flex", justifyContent: "space-between"}}>
                    <div>
                        <h2 style={{margin:0}}>Mid-Term Physics (Descriptive)</h2>
                        <span style={{background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: "5px", fontSize: "0.8rem", fontWeight: "bold"}}>Max Marks: 100</span>
                        <span style={{marginLeft: "10px", background: "#e0f2fe", color: "#0284c7", padding: "4px 10px", borderRadius: "5px", fontSize: "0.8rem", fontWeight: "bold"}}>Time: 3 Hrs</span>
                    </div>
                    <div style={{textAlign: "right"}}>
                        <div style={{fontWeight: "bold", color: "#64748b"}}>Examinee Body: CBSE</div>
                        <div style={{fontSize: "0.9rem"}}>Paper Set: A-102</div>
                    </div>
                </div>

                {/* Answer Sheet Preview (Dummy) */}
                <div style={{background: "#f1f5f9", padding: "20px", borderRadius: "10px", marginBottom: "30px", border: "1px solid #cbd5e1"}}>
                    <h4 style={{margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "10px"}}><FileText size={18}/> Answer Sheet: Q1 - Explain Newton's Law</h4>
                    <p style={{fontFamily: "serif", fontSize: "1.1rem", color: "#334155", lineHeight: "1.6"}}>
                        "Newton's first law states that an object remains in a state of rest or of uniform motion in a straight line unless compelled to change that state by an applied force."
                    </p>
                </div>

                {/* REQ 5: 3-TIER EVALUATION GRID */}
                <h3 style={{marginBottom: "15px", color: "#1e293b"}}>Evaluation Status (3-Tier)</h3>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "30px"}}>
                    
                    {/* Teacher 1 */}
                    <div className="eval-card done">
                        <div className="eval-header"><UserCheck size={18}/> Evaluator 1</div>
                        <div className="eval-score">{evaluations.teacher1.score}/100</div>
                        <p className="eval-comment">"{evaluations.teacher1.comments}"</p>
                    </div>

                    {/* Teacher 2 */}
                    <div className="eval-card done">
                        <div className="eval-header"><UserCheck size={18}/> Evaluator 2</div>
                        <div className="eval-score">{evaluations.teacher2.score}/100</div>
                        <p className="eval-comment">"{evaluations.teacher2.comments}"</p>
                    </div>

                    {/* Teacher 3 (Pending) */}
                    <div className="eval-card pending">
                        <div className="eval-header"><Clock size={18}/> Evaluator 3</div>
                        <div className="eval-score">--/100</div>
                        <p className="eval-comment">Waiting for review...</p>
                    </div>
                </div>

                {/* REQ 6: AI CHECK */}
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", padding: "20px", borderRadius: "15px", border: "1px solid #bbf7d0"}}>
                    <div>
                        <h3 style={{margin:0, color: "#166534", display: "flex", alignItems: "center", gap: "10px"}}><Brain size={24}/> AI Auto-Check</h3>
                        <p style={{margin:0, color: "#15803d"}}>Use AI to verify descriptive answers against keywords.</p>
                    </div>
                    {aiScore ? (
                        <div style={{textAlign: "right"}}>
                            <span style={{fontSize: "2rem", fontWeight: "900", color: "#16a34a"}}>{aiScore}/100</span>
                            <div style={{fontSize: "0.8rem", color: "#166534"}}>AI Confidence: 98%</div>
                        </div>
                    ) : (
                        <button onClick={handleAiCheck} style={{background: "#16a34a", color: "white", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer"}}>Run AI Analysis</button>
                    )}
                </div>

            </div>

            <style>{`
                .eval-card { padding: 20px; borderRadius: 15px; border: 1px solid #e2e8f0; }
                .eval-card.done { background: #f8fafc; border-left: 5px solid #10b981; }
                .eval-card.pending { background: #fffbeb; border-left: 5px solid #f59e0b; opacity: 0.8; }
                .eval-header { display: flex; alignItems: center; gap: 8px; font-weight: 700; color: #64748b; marginBottom: 10px; }
                .eval-score { fontSize: 2.5rem; fontWeight: 800; color: #1e293b; }
                .eval-comment { color: #475569; font-style: italic; }
            `}</style>
        </div>
    </div>
  );
}"""

with open(os.path.join(PAGES_DIR, "Exams.jsx"), "w", encoding="utf-8") as f:
    f.write(exams_code)

# ==========================================
# 3. VIRTUAL SPACE (Req 4, 7, 8)
# ==========================================
# Updating only the relevant parts to include Req 4, 7, 8 specifically
vs_code = r"""import React, { useState, useRef, useCallback } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, Monitor, Share2, Youtube, FileText, PhoneOff, VideoOff, Radio, UploadCloud, Cast, Layers, Settings, Users, MessageSquare, Layout, Maximize, PlayCircle } from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';

export default function VirtualSpace() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camActive, setCamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // --- REQ 4: REAL RECORDING LOGIC ---
  const webcamRef = useRef(null);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setRecordedChunks([]);
    const stream = webcamRef.current.stream;
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.addEventListener("dataavailable", ({ data }) => {
      if (data.size > 0) setRecordedChunks((prev) => [...prev, data]);
    });
    recorder.start();
    setMediaRecorder(recorder);
    toast.success("Recording Started ðŸ“¹");
  }, [webcamRef, setMediaRecorder, setRecordedChunks]);

  const handleStopRecording = useCallback(() => {
    setMediaRecorder(null);
    setIsRecording(false);
    toast("Recording Stopped. Saving...");
    // Download logic
    if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "class_recording.webm";
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("File Downloaded! ðŸ’¾");
    }
  }, [mediaRecorder, recordedChunks]);

  // --- REQ 7: PAY AS YOU GO & LINKS ---
  const openLink = (url) => window.open(url, '_blank');

  return (
    <div className="virtual-space-container">
        <SidebarModern />
        <div className="main-content-area">
            <Toaster position="top-center" />
            <header className="vs-header slide-down">
                <div>
                    <h1 className="vs-title">Virtual Studio <span className="pro-badge">PRO</span></h1>
                    <p className="vs-subtitle">Cloud Recording (Pay-As-You-Go) & Live Streaming</p>
                </div>
                <div className="header-actions">
                     <button onClick={() => setIsLive(!isLive)} className="btn-action btn-danger hover-scale">{isLive ? "End Stream" : "Go Live"}</button>
                     {isRecording ? (
                        <button onClick={handleStopRecording} className="btn-action btn-secondary hover-scale">Stop Rec</button>
                     ) : (
                        <button onClick={handleStartRecording} className="btn-action btn-secondary hover-scale">Record</button>
                     )}
                </div>
            </header>

            <div className="vs-grid-layout fade-in-up">
                <div className="video-card shadow-xl">
                    <div className="video-frame">
                        {camActive ? (
                            <Webcam audio={false} ref={webcamRef} style={{width: '100%', height: '100%', objectFit: 'cover'}} mirrored={true} />
                        ) : <div className="camera-off-placeholder">Camera Off</div>}
                        
                        <div className="control-overlay">
                            <div className="control-bar shadow-2xl glass-effect">
                                <button onClick={() => setMicActive(!micActive)} className="ctrl-btn">{micActive ? <Mic/> : <MicOff/>}</button>
                                <button onClick={() => setCamActive(!camActive)} className="ctrl-btn">{camActive ? <Video/> : <VideoOff/>}</button>
                                <button className="ctrl-btn btn-hangup"><PhoneOff/></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REQ 7 & 8: LINKS & RESOURCES */}
                <div className="sidebar-panels">
                    <div className="info-card shadow-sm hover-lift">
                        <div className="card-header"><h3>Broadcast To (Req 7)</h3></div>
                        <div className="card-body">
                            <div onClick={() => openLink('https://meet.google.com')} className="list-item"><Share2 size={18}/> Google Meet</div>
                            <div onClick={() => openLink('https://zoom.us')} className="list-item"><Video size={18}/> Zoom</div>
                            <div onClick={() => openLink('https://whatsapp.com')} className="list-item"><MessageSquare size={18}/> WhatsApp Group</div>
                        </div>
                    </div>

                    <div className="info-card shadow-sm hover-lift">
                         <div className="card-header"><h3>Resources (Req 8)</h3></div>
                        <div className="card-body">
                            <div className="list-item"><PlayCircle size={18}/> Recorded_Lec_01.mp4</div>
                            <div className="list-item"><FileText size={18}/> Syllabus.pdf</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>{`
            :root { --bg-body: #f8fafc; --text-main: #0f172a; --primary: #3b82f6; }
            .virtual-space-container { display: flex; background: var(--bg-body); min-height: 100vh; font-family: 'Inter', sans-serif; }
            .main-content-area { flex: 1; padding: 30px; margin-left: 280px; height: 100vh; overflow-y: auto; }
            .vs-grid-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; height: 80vh; }
            .video-card { background: black; border-radius: 20px; overflow: hidden; position: relative; display: flex; justify-content: center; alignItems: center; }
            .video-frame { width: 100%; height: 100%; position: relative; }
            .control-overlay { position: absolute; bottom: 20px; width: 100%; display: flex; justify-content: center; }
            .control-bar { display: flex; gap: 15px; background: rgba(0,0,0,0.6); padding: 10px 20px; border-radius: 50px; backdrop-filter: blur(10px); }
            .ctrl-btn { color: white; background: transparent; border: none; cursor: pointer; }
            .btn-hangup { color: #ef4444; }
            .list-item { padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center; gap: 10px; }
            .list-item:hover { background: #f1f5f9; }
            .info-card { background: white; border-radius: 15px; padding: 15px; }
            .vs-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .vs-title { font-size: 1.5rem; font-weight: 800; }
            .btn-action { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; }
            .btn-danger { background: #ef4444; color: white; }
            .btn-secondary { background: white; border: 1px solid #ccc; }
        `}</style>
    </div>
  );
}"""

with open(os.path.join(PAGES_DIR, "VirtualSpace.jsx"), "w", encoding="utf-8") as f:
    f.write(vs_code)

print("âœ… SUCCESS: Installed 3-Module Complete System (SchoolOps, Exams, VirtualSpace)")
