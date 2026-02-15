import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Applying Professional Light Theme & Fixing Video Resolution: {TARGET_FILE}")

# --- PROFESSIONAL LIGHT THEME CODE ---
code_content = r"""import React, { useState, useCallback } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, Monitor, Share2, Youtube, FileText, PhoneOff, VideoOff, Radio, UploadCloud, Cast, Layers, Settings, Users, MessageSquare, Layout } from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';

export default function VirtualSpace() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camActive, setCamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);

  // --- IMPROVED VIDEO CONFIGURATION (Fixes Pixelation) ---
  const videoConstraints = {
    width: { min: 1280, ideal: 1920 }, // Request higher resolution
    height: { min: 720, ideal: 1080 },
    aspectRatio: 16 / 9, // Force standard widescreen aspect ratio
    facingMode: "user"
  };

  // --- HANDLERS ---
  const handleLive = () => {
    setIsLive(!isLive);
    if (!isLive) {
        toast.success("🔴 You are LIVE! Broadcast Started.", { style: { background: '#ef4444', color: 'white', fontWeight: 'bold' }, icon: '📡' });
    } else {
        toast("Broadcast Ended.", { icon: '⏹️' });
    }
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
        toast("Recording Started... 💾", { style: { background: '#3b82f6', color: 'white', fontWeight: 'bold' }, icon: '🔴' });
    } else {
        toast.success("Recording Saved! ✅", { icon: '📼' });
    }
  };

  const toggleCam = useCallback(() => {
    setCamActive(prev => !prev);
    toast(camActive ? "Camera Disabled" : "Camera Enabled", { icon: camActive ? <VideoOff size={18}/> : <Video size={18}/> });
  }, [camActive]);

  const toggleMic = useCallback(() => {
    setMicActive(prev => !prev);
    toast(micActive ? "Microphone Muted" : "Microphone Unmuted", { icon: micActive ? <MicOff size={18}/> : <Mic size={18}/> });
  }, [micActive]);

  const endCall = () => {
    setCamActive(false);
    setMicActive(false);
    setIsLive(false);
    setIsRecording(false);
    toast.error("Session Ended.", { icon: '👋' });
  };

  const openLink = (url, platform) => {
      window.open(url, '_blank');
      toast.loading(`Connecting to ${platform}...`, { duration: 2000 });
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
                        Virtual Classroom
                        {isLive && <span className="live-badge pulse-red"><Radio size={14}/> LIVE</span>}
                    </h1>
                    <p className="vs-subtitle">Premium Interactive Studio & Cloud Recording.</p>
                </div>
                <div className="header-actions">
                     <button onClick={handleLive} className={`btn-action ${isLive ? 'btn-danger' : 'btn-primary'} hover-scale`}>
                        {isLive ? "End Stream" : "Go Live"}
                     </button>
                     <button onClick={handleRecord} className={`btn-action ${isRecording ? 'btn-danger-outline' : 'btn-secondary'} hover-scale`}>
                        {isRecording ? "Stop Rec" : "Record"}
                     </button>
                </div>
            </header>

            <div className="vs-grid-layout fade-in-up">
                {/* MAIN VIDEO STAGE */}
                <div className="video-card shadow-xl">
                    <div className="video-frame-container">
                        <div className="video-frame">
                            {camActive ? (
                                <Webcam 
                                    audio={false} 
                                    muted={true}  
                                    videoConstraints={videoConstraints}
                                    style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                    mirrored={true}
                                    className="webcam-feed"
                                />
                            ) : (
                                <div className="camera-off-placeholder">
                                    <div className="placeholder-circle pulse-gray">
                                        <VideoOff size={50} strokeWidth={1.5} />
                                    </div>
                                    <h3>Camera is Off</h3>
                                </div>
                            )}

                            {/* Status Tags */}
                            <div className="status-tags">
                                {isLive && <span className="tag live">LIVE 00:12:45</span>}
                                {isRecording && <span className="tag rec">REC</span>}
                            </div>
                        </div>
                    </div>

                    {/* Control Bar (Below Video) */}
                    <div className="control-bar-container">
                        <div className="control-bar shadow-md">
                            <button onClick={toggleMic} className={`ctrl-btn ${!micActive ? 'is-off' : ''}`} title={micActive ? "Mute" : "Unmute"}>
                                {micActive ? <Mic size={22}/> : <MicOff size={22}/>}
                            </button>
                            <button onClick={toggleCam} className={`ctrl-btn ${!camActive ? 'is-off' : ''}`} title={camActive ? "Turn Off Camera" : "Turn On Camera"}>
                                {camActive ? <Video size={22}/> : <VideoOff size={22}/>}
                            </button>
                            <button className="ctrl-btn" title="Share Screen">
                                <Monitor size={22}/>
                            </button>
                            <div className="divider"></div>
                            <button className="ctrl-btn" title="Chat">
                                <MessageSquare size={22}/>
                            </button>
                            <button className="ctrl-btn" title="Participants">
                                <Users size={22}/>
                            </button>
                             <button className="ctrl-btn" title="Change Layout">
                                <Layout size={22}/>
                            </button>
                            <div className="divider"></div>
                            <button onClick={endCall} className="ctrl-btn btn-hangup" title="Leave Call">
                                <PhoneOff size={24}/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="sidebar-panels">
                    
                    {/* Broadcast Card */}
                    <div className="info-card shadow-sm hover-lift">
                        <div className="card-header">
                            <Cast size={18} className="text-purple"/>
                            <h3>Broadcast To</h3>
                        </div>
                        <div className="card-body">
                            <div onClick={() => openLink('https://youtube.com', 'YouTube')} className="list-item">
                                <div className="icon-bg red"><Youtube size={18} /></div> <span>YouTube Live</span>
                            </div>
                            <div onClick={() => openLink('https://zoom.us', 'Zoom')} className="list-item">
                                <div className="icon-bg blue"><Video size={18} /></div> <span>Zoom Webinar</span>
                            </div>
                            <div onClick={() => openLink('https://meet.google.com', 'Google Meet')} className="list-item">
                                <div className="icon-bg green"><Share2 size={18} /></div> <span>Google Meet</span>
                            </div>
                        </div>
                    </div>

                    {/* Resources Card */}
                    <div className="info-card shadow-sm hover-lift">
                         <div className="card-header">
                            <Layers size={18} className="text-blue"/>
                            <h3>Class Materials</h3>
                        </div>
                        <div className="card-body">
                            <div className="list-item">
                                <div className="icon-bg gray"><FileText size={18}/></div> 
                                <div>
                                    <span className="item-title">Physics_Notes.pdf</span>
                                    <span className="item-meta">2.4 MB</span>
                                </div>
                            </div>
                            <div className="list-item">
                                <div className="icon-bg gray"><FileText size={18}/></div> 
                                <div>
                                    <span className="item-title">Assignment_04.docx</span>
                                    <span className="item-meta">850 KB</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <button className="btn-outline-primary">
                                <UploadCloud size={16}/> Upload File
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      <style>{`
        :root {
            --bg-body: #f1f5f9; /* Lighter gray background */
            --bg-card: #ffffff;
            --text-main: #0f172a;
            --text-light: #64748b;
            --primary: #3b82f6;
            --primary-dark: #1d4ed8;
            --danger: #ef4444;
            --danger-dark: #b91c1c;
            --border-color: #e2e8f0;
        }

        .virtual-space-container {
            display: flex;
            background: var(--bg-body);
            min-height: 100vh;
            color: var(--text-main);
            font-family: 'Inter', sans-serif; /* Using a clean, modern font */
            overflow: hidden;
        }
        .main-content-area {
            flex: 1;
            padding: 30px 40px;
            margin-left: 280px; 
            overflow-y: auto;
            height: 100vh;
        }
        .vs-grid-layout {
            display: grid;
            grid-template-columns: 3fr 1fr; /* More space for video */
            gap: 25px;
            height: calc(100vh - 140px);
        }

        /* HEADER */
        .vs-header { display: flex; justifyContent: space-between; alignItems: center; margin-bottom: 25px; }
        .vs-title { font-size: 2rem; font-weight: 800; margin: 0; display: flex; alignItems: center; gap: 12px; color: #1e293b; letter-spacing: -0.5px; }
        .vs-subtitle { color: var(--text-light); margin-top: 5px; font-size: 1rem; font-weight: 500; }
        .live-badge { display: flex; alignItems: center; gap: 6px; background: #fee2e2; color: #dc2626; padding: 6px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 800; }
        .header-actions { display: flex; gap: 12px; }

        /* BUTTONS */
        .btn-action { border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
        .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2); }
        .btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.3); }
        .btn-secondary { background: white; border: 1px solid var(--border-color); color: var(--text-main); }
        .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-2px); }
        .btn-danger { background: var(--danger); color: white; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); }
        .btn-danger:hover { background: var(--danger-dark); transform: translateY(-2px); }
        .btn-danger-outline { background: white; border: 2px solid #fee2e2; color: var(--danger); font-weight: 800; }
        .btn-danger-outline:hover { background: #fef2f2; border-color: var(--danger); }

        /* VIDEO CARD & FRAME */
        .video-card { background: var(--bg-card); border-radius: 24px; display: flex; flex-direction: column; height: 100%; border: 1px solid var(--border-color); overflow: hidden; }
        .video-frame-container { flex: 1; padding: 15px; background: #f1f5f9; display: flex; align-items: center; justifyContent: center; }
        .video-frame { width: 100%; height: 100%; background: #e2e8f0; border-radius: 20px; position: relative; overflow: hidden; display: flex; alignItems: center; justifyContent: center; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        .webcam-feed { width: 100%; height: 100%; object-fit: cover; border-radius: 20px; }
        
        .camera-off-placeholder { color: var(--text-light); text-align: center; display: flex; flex-direction: column; alignItems: center; }
        .camera-off-placeholder h3 { margin-top: 15px; font-weight: 600; }
        .placeholder-circle { width: 100px; height: 100px; background: white; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; margin-bottom: 15px; border: 2px solid var(--border-color); color: #94a3b8; }
        
        .status-tags { position: absolute; top: 20px; left: 20px; display: flex; gap: 10px; z-index: 10; }
        .tag { padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; color: white; backdrop-filter: blur(4px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .tag.live { background: rgba(220, 38, 38, 0.95); }
        .tag.rec { background: rgba(37, 99, 235, 0.95); }

        /* CONTROLS BAR */
        .control-bar-container { padding: 20px; background: white; border-top: 1px solid var(--border-color); display: flex; justify-content: center; }
        .control-bar { display: flex; gap: 15px; background: white; padding: 12px 25px; border-radius: 50px; align-items: center; border: 1px solid var(--border-color); }
        .ctrl-btn { width: 50px; height: 50px; border-radius: 50%; border: 1px solid var(--border-color); background: white; color: var(--text-main); display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .ctrl-btn:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); color: var(--primary); }
        .ctrl-btn.is-off { background: #fee2e2; color: var(--danger); border-color: #fca5a5; }
        .ctrl-btn.is-off:hover { background: #fecaca; }
        .btn-hangup { background: var(--danger); color: white; border: none; width: 55px; height: 55px; }
        .btn-hangup:hover { background: var(--danger-dark); transform: scale(1.05); box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3); color: white; }
        .divider { width: 1px; height: 30px; background: var(--border-color); margin: 0 5px; }

        /* SIDEBAR PANELS */
        .sidebar-panels { display: flex; flex-direction: column; gap: 25px; height: 100%; }
        .info-card { background: var(--bg-card); border-radius: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .card-header { padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; alignItems: center; gap: 12px; background: #f8fafc; }
        .card-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #1e293b; }
        .card-body { padding: 15px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        
        .list-item { display: flex; alignItems: center; gap: 15px; padding: 14px; border-radius: 16px; cursor: pointer; transition: all 0.2s; background: white; border: 1px solid var(--border-color); }
        .list-item:hover { border-color: var(--primary); transform: translateX(5px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .icon-bg { width: 40px; height: 40px; border-radius: 12px; display: flex; alignItems: center; justifyContent: center; }
        .icon-bg.red { background: #fee2e2; color: #dc2626; }
        .icon-bg.blue { background: #eff6ff; color: #2563eb; }
        .icon-bg.green { background: #dcfce7; color: #16a34a; }
        .icon-bg.gray { background: #f1f5f9; color: #64748b; }
        
        .item-title { display: block; font-size: 0.95rem; font-weight: 600; color: var(--text-main); }
        .item-meta { font-size: 0.8rem; color: var(--text-light); }

        .card-footer { padding: 20px; border-top: 1px solid var(--border-color); text-align: center; background: #f8fafc; }
        .btn-outline-primary { width: 100%; padding: 12px; border: 2px dashed var(--primary); color: var(--primary); background: #eef2ff; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; }
        .btn-outline-primary:hover { background: #e0e7ff; border-style: solid; transform: translateY(-2px); }
        
        .text-purple { color: #8b5cf6; }
        .text-blue { color: #3b82f6; }
        
        /* Utils & Animations */
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:active { transform: scale(0.98); }
        .hover-lift { transition: all 0.2s; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
        .slide-down { animation: slideDown 0.5s ease-out; }
        .fade-in-up { animation: fadeInUp 0.6s ease-out; }
        @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        @keyframes pulseGray { 0% { box-shadow: 0 0 0 0 rgba(148, 163, 184, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(148, 163, 184, 0); } 100% { box-shadow: 0 0 0 0 rgba(148, 163, 184, 0); } }
        .pulse-red { animation: pulseRed 2s infinite; }
        .pulse-gray { animation: pulseGray 2s infinite; }
        
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}"""

# --- WRITE TO FILE WITH UTF-8 ENCODING ---
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: VirtualSpace.jsx updated to Professional Light Theme with Improved Video Quality!")
