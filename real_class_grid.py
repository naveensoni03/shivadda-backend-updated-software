import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Applying Real Student Grid Layout to: {TARGET_FILE}")

# --- FULL REAL-CLASS CODE ---
code_content = r"""import React, { useState, useCallback, useRef, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, Monitor, Share2, Youtube, FileText, PhoneOff, VideoOff, Radio, UploadCloud, Cast, Layers, Settings, Users, MessageSquare, Layout, Maximize, Grid, User } from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';

export default function VirtualSpace() {
  // --- STATES ---
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camActive, setCamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  
  // VIEW MODES: 'focus' (Teacher only) | 'grid' (Gallery View)
  const [viewMode, setViewMode] = useState('grid'); 
  const [screenShareStream, setScreenShareStream] = useState(null);
  
  // SIMULATED STUDENTS (Mock Data)
  const students = [
      { id: 1, name: "Rahul Sharma", mic: false, video: false, color: "#ef4444" },
      { id: 2, name: "Priya Verma", mic: true, video: false, color: "#3b82f6", speaking: true },
      { id: 3, name: "Amit Singh", mic: false, video: false, color: "#10b981" },
      { id: 4, name: "Sneha Gupta", mic: false, video: false, color: "#8b5cf6" },
      { id: 5, name: "Vikram Malhotra", mic: false, video: false, color: "#f59e0b" },
  ];

  // --- CONFIGURATION ---
  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
  };

  // --- HANDLERS ---
  const handleLive = () => {
    setIsLive(!isLive);
    toast.success(isLive ? "Stream Ended" : "🔴 You are LIVE!");
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    toast(isRecording ? "Recording Saved" : "Recording Started...");
  };

  const toggleLayout = () => {
      setViewMode(viewMode === 'grid' ? 'focus' : 'grid');
      toast(viewMode === 'grid' ? "Focus View" : "Gallery View");
  };

  return (
    <div className="virtual-space-container">
        <SidebarModern />
        <div className="main-content-area">
            <Toaster position="top-center" />
            
            {/* HEADER */}
            <header className="vs-header slide-down">
                <div>
                    <h1 className="vs-title">
                        Classroom <span className="pro-badge">PRO</span>
                        {isLive && <span className="live-badge pulse-red"><Radio size={14}/> LIVE</span>}
                    </h1>
                </div>
                <div className="header-actions">
                     <button onClick={toggleLayout} className="btn-action btn-secondary hover-scale" title="Change View">
                        {viewMode === 'grid' ? <Maximize size={18}/> : <Grid size={18}/>}
                        {viewMode === 'grid' ? " Focus" : " Gallery"}
                     </button>
                     <button onClick={handleLive} className={`btn-action ${isLive ? 'btn-danger' : 'btn-primary'} hover-scale`}>
                        {isLive ? "End Class" : "Go Live"}
                     </button>
                </div>
            </header>

            {/* MAIN LAYOUT AREA */}
            <div className={`class-grid ${viewMode === 'focus' ? 'focus-mode' : 'gallery-mode'}`}>
                
                {/* 1. TEACHER (USER) FEED - Always Visible */}
                <div className={`participant-card user-card ${micActive ? 'speaking' : ''}`}>
                    {camActive ? (
                        <Webcam 
                            audio={false} 
                            muted={true}  
                            videoConstraints={videoConstraints}
                            style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                            mirrored={true}
                        />
                    ) : (
                        <div className="avatar-placeholder">
                            <div className="avatar-circle user-avatar">YOU</div>
                        </div>
                    )}
                    <div className="name-tag">
                        <span>You (Teacher)</span>
                        {!micActive && <MicOff size={14} className="text-red"/>}
                    </div>
                    {/* Floating Controls inside User Card when in Grid */}
                    <div className="mini-controls">
                        <button onClick={() => setMicActive(!micActive)} className={`mini-btn ${!micActive ? 'red' : ''}`}><Mic size={16}/></button>
                        <button onClick={() => setCamActive(!camActive)} className={`mini-btn ${!camActive ? 'red' : ''}`}><Video size={16}/></button>
                    </div>
                </div>

                {/* 2. STUDENTS GRID (Hidden in Focus Mode, Visible in Grid Mode) */}
                {viewMode === 'grid' && students.map((student) => (
                    <div key={student.id} className={`participant-card ${student.speaking ? 'speaking-pulse' : ''}`}>
                        <div className="avatar-placeholder" style={{background: '#1e293b'}}>
                            <div className="avatar-circle" style={{background: student.color}}>
                                {student.name.charAt(0)}
                            </div>
                        </div>
                        <div className="name-tag">
                            <span>{student.name}</span>
                            {student.mic ? <Mic size={14} className="text-green"/> : <MicOff size={14} className="text-red"/>}
                        </div>
                    </div>
                ))}

                {/* 3. SCREEN SHARE PLACEHOLDER (If Focus Mode & No Screen Share) */}
                {viewMode === 'focus' && (
                    <div className="focus-stage shadow-xl">
                        <div className="empty-stage">
                            <Monitor size={60} style={{opacity:0.2}}/>
                            <h3>Screen Sharing / Whiteboard Area</h3>
                            <p>Switch to Gallery View to see students</p>
                        </div>
                    </div>
                )}

            </div>

            {/* BOTTOM CONTROL BAR (Fixed) */}
            <div className="bottom-bar shadow-2xl glass-effect">
                <div className="bar-left">
                    <span className="time-display">10:42 AM | Physics 101</span>
                </div>
                <div className="bar-center">
                    <button onClick={() => setMicActive(!micActive)} className={`ctrl-btn ${!micActive ? 'is-off' : ''}`}>
                        {micActive ? <Mic size={20}/> : <MicOff size={20}/>}
                    </button>
                    <button onClick={() => setCamActive(!camActive)} className={`ctrl-btn ${!camActive ? 'is-off' : ''}`}>
                        {camActive ? <Video size={20}/> : <VideoOff size={20}/>}
                    </button>
                    <button className="ctrl-btn main-action">
                        <Monitor size={20}/>
                    </button>
                    <button className="ctrl-btn">
                        <Users size={20}/>
                        <span className="badge">6</span>
                    </button>
                    <button className="ctrl-btn">
                        <MessageSquare size={20}/>
                    </button>
                </div>
                <div className="bar-right">
                    <button className="ctrl-btn btn-end">
                        <PhoneOff size={22}/> End
                    </button>
                </div>
            </div>
        </div>

      <style>{`
        :root {
            --bg-body: #0f172a;
            --card-bg: #1e293b;
            --text-main: #ffffff;
            --border: #334155;
        }

        .virtual-space-container {
            display: flex;
            background: var(--bg-body);
            min-height: 100vh;
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        .main-content-area {
            flex: 1;
            padding: 20px 30px;
            margin-left: 280px; 
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* HEADER */
        .vs-header { display: flex; justifyContent: space-between; alignItems: center; margin-bottom: 20px; flex-shrink: 0; }
        .vs-title { font-size: 1.5rem; font-weight: 800; display: flex; alignItems: center; gap: 10px; }
        .pro-badge { background: #3b82f6; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; }
        .live-badge { background: #ef4444; font-size: 0.7rem; padding: 4px 10px; border-radius: 20px; display: flex; alignItems: center; gap: 5px; }
        .header-actions { display: flex; gap: 10px; }
        .btn-action { padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-secondary { background: #334155; color: white; }
        .btn-action:hover { transform: translateY(-2px); filter: brightness(1.1); }

        /* GRID SYSTEM */
        .class-grid {
            flex: 1;
            display: grid;
            gap: 15px;
            overflow-y: auto;
            padding-bottom: 80px; /* Space for bottom bar */
        }
        
        /* GALLERY MODE: Auto-fit cards */
        .gallery-mode {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            grid-auto-rows: minmax(200px, 1fr);
            align-content: center;
        }

        /* FOCUS MODE: Teacher Small, Stage Big */
        .focus-mode {
            grid-template-columns: 250px 1fr;
            grid-template-rows: 1fr;
        }

        /* PARTICIPANT CARD */
        .participant-card {
            background: #000;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
            display: flex;
            flex-direction: column;
            transition: 0.2s;
            aspect-ratio: 16/9;
        }
        .participant-card.speaking { border-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
        .participant-card.speaking-pulse { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }

        .avatar-placeholder { width: 100%; height: 100%; display: flex; alignItems: center; justifyContent: center; background: #111; }
        .avatar-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; font-size: 1.5rem; font-weight: 700; color: white; }
        .user-avatar { background: #475569; border: 2px solid white; }

        .name-tag {
            position: absolute; bottom: 10px; left: 10px;
            background: rgba(0,0,0,0.6); color: white;
            padding: 4px 10px; border-radius: 6px;
            font-size: 0.8rem; font-weight: 600;
            display: flex; alignItems: center; gap: 8px;
            backdrop-filter: blur(4px);
        }
        .text-red { color: #ef4444; }
        .text-green { color: #10b981; }

        .mini-controls {
            position: absolute; top: 10px; right: 10px;
            display: flex; gap: 5px; opacity: 0; transition: 0.2s;
        }
        .participant-card:hover .mini-controls { opacity: 1; }
        .mini-btn { background: rgba(0,0,0,0.6); color: white; border: none; padding: 6px; border-radius: 50%; cursor: pointer; }
        .mini-btn.red { background: #ef4444; }

        /* FOCUS STAGE */
        .focus-stage {
            background: #1e293b;
            border-radius: 16px;
            display: flex; alignItems: center; justifyContent: center;
            border: 1px dashed #475569;
        }
        .empty-stage { text-align: center; color: #64748b; }

        /* BOTTOM BAR */
        .bottom-bar {
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-35%);
            background: #1e293b;
            padding: 10px 20px;
            border-radius: 50px;
            display: flex; alignItems: center; gap: 30px;
            border: 1px solid #334155;
            z-index: 100;
            width: auto;
            min-width: 600px;
            justify-content: space-between;
        }
        .bar-center { display: flex; gap: 15px; }
        .ctrl-btn { width: 45px; height: 45px; border-radius: 50%; border: none; background: #334155; color: white; display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: 0.2s; position: relative; }
        .ctrl-btn:hover { background: #475569; transform: scale(1.1); }
        .ctrl-btn.is-off { background: #ef4444; }
        .ctrl-btn.main-action { background: #3b82f6; }
        .btn-end { background: #ef4444; border-radius: 20px; width: auto; padding: 0 20px; gap: 8px; }
        .badge { position: absolute; top: -2px; right: -2px; background: #ef4444; font-size: 0.6rem; padding: 2px 5px; border-radius: 10px; }
        .time-display { font-size: 0.9rem; font-weight: 600; color: #94a3b8; }

      `}</style>
    </div>
  );
}"""

# --- WRITE TO FILE WITH UTF-8 ENCODING ---
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: VirtualSpace.jsx updated to REAL CLASSROOM GRID LAYOUT!")
