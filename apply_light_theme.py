import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Applying Premium Light Theme UI: {TARGET_FILE}")

# --- PREMIUM LIGHT THEME CODE ---
code_content = r"""import React, { useState, useCallback } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, Monitor, Share2, Youtube, FileText, PhoneOff, VideoOff, Radio, UploadCloud, Cast, Layers, Settings, Users, MessageSquare } from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';

export default function VirtualSpace() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camActive, setCamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);

  // --- CONFIGURATION ---
  const videoConstraints = {
    width: 1280,
    height: 720,
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
                    <p className="vs-subtitle">Interactive Studio & Cloud Recording.</p>
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
                <div className="video-card shadow-lg">
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
                                <div className="placeholder-circle">
                                    <VideoOff size={60} strokeWidth={1.5} />
                                </div>
                                <h3>Camera is Off</h3>
                            </div>
                        )}

                        {/* Status Tags */}
                        <div className="status-tags">
                            {isLive && <span className="tag live">LIVE 00:12:45</span>}
                            {isRecording && <span className="tag rec">REC</span>}
                        </div>

                        {/* Floating Control Bar (Zoom Style) */}
                        <div className="control-bar shadow-xl">
                            <button onClick={toggleMic} className={`ctrl-btn ${!micActive ? 'is-off' : ''}`} title="Mic">
                                {micActive ? <Mic size={20}/> : <MicOff size={20}/>}
                            </button>
                            <button onClick={toggleCam} className={`ctrl-btn ${!camActive ? 'is-off' : ''}`} title="Camera">
                                {camActive ? <Video size={20}/> : <VideoOff size={20}/>}
                            </button>
                            <button className="ctrl-btn" title="Share Screen">
                                <Monitor size={20}/>
                            </button>
                            <button className="ctrl-btn" title="Chat">
                                <MessageSquare size={20}/>
                            </button>
                            <button className="ctrl-btn" title="Participants">
                                <Users size={20}/>
                            </button>
                            <div className="divider"></div>
                            <button onClick={endCall} className="ctrl-btn btn-hangup" title="End Call">
                                <PhoneOff size={22}/>
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
            --bg-body: #f8fafc;
            --text-main: #0f172a;
            --text-light: #64748b;
            --primary: #6366f1;
            --danger: #ef4444;
        }

        .virtual-space-container {
            display: flex;
            background: var(--bg-body);
            min-height: 100vh;
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', sans-serif;
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
            grid-template-columns: 2.5fr 1fr;
            gap: 25px;
            height: calc(100vh - 140px);
        }

        /* HEADER */
        .vs-header { display: flex; justifyContent: space-between; alignItems: center; margin-bottom: 25px; }
        .vs-title { font-size: 1.8rem; font-weight: 800; margin: 0; display: flex; alignItems: center; gap: 10px; color: #1e293b; }
        .vs-subtitle { color: var(--text-light); margin-top: 5px; font-size: 0.95rem; font-weight: 500; }
        .live-badge { display: flex; alignItems: center; gap: 6px; background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .header-actions { display: flex; gap: 12px; }

        /* BUTTONS */
        .btn-action { border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
        .btn-primary { background: #0f172a; color: white; }
        .btn-primary:hover { background: #1e293b; transform: translateY(-2px); }
        .btn-secondary { background: white; border: 1px solid #e2e8f0; color: #334155; }
        .btn-secondary:hover { background: #f1f5f9; }
        .btn-danger { background: #dc2626; color: white; }
        .btn-danger-outline { background: white; border: 1px solid #fee2e2; color: #dc2626; }

        /* VIDEO CARD */
        .video-card { background: white; border-radius: 24px; padding: 10px; display: flex; flex-direction: column; height: 100%; border: 1px solid #e2e8f0; position: relative; }
        .video-frame { flex: 1; background: #000; border-radius: 20px; position: relative; overflow: hidden; display: flex; alignItems: center; justifyContent: center; }
        .camera-off-placeholder { color: white; text-align: center; opacity: 0.7; }
        .placeholder-circle { width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; alignItems: center; justifyContent: center; margin: 0 auto 15px; }
        
        .status-tags { position: absolute; top: 20px; left: 20px; display: flex; gap: 10px; }
        .tag { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; color: white; backdrop-filter: blur(4px); }
        .tag.live { background: rgba(220, 38, 38, 0.9); }
        .tag.rec { background: rgba(37, 99, 235, 0.9); }

        /* CONTROLS */
        .control-bar { position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; background: rgba(255, 255, 255, 0.95); padding: 10px 20px; border-radius: 50px; align-items: center; }
        .ctrl-btn { width: 45px; height: 45px; border-radius: 50%; border: none; background: transparent; color: #475569; display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: 0.2s; }
        .ctrl-btn:hover { background: #f1f5f9; color: #0f172a; }
        .ctrl-btn.is-off { background: #fee2e2; color: #dc2626; }
        .btn-hangup { background: #dc2626; color: white; width: 50px; height: 50px; }
        .btn-hangup:hover { background: #b91c1c; transform: scale(1.1); }
        .divider { width: 1px; height: 25px; background: #cbd5e1; margin: 0 5px; }

        /* SIDEBAR PANELS */
        .sidebar-panels { display: flex; flex-direction: column; gap: 20px; height: 100%; }
        .info-card { background: white; border-radius: 20px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; flex: 1; }
        .card-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; alignItems: center; gap: 10px; }
        .card-header h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #1e293b; }
        .card-body { padding: 15px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        
        .list-item { display: flex; alignItems: center; gap: 12px; padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; background: #f8fafc; border: 1px solid transparent; }
        .list-item:hover { background: #f1f5f9; border-color: #e2e8f0; transform: translateX(5px); }
        .icon-bg { width: 36px; height: 36px; border-radius: 10px; display: flex; alignItems: center; justifyContent: center; }
        .icon-bg.red { background: #fee2e2; color: #dc2626; }
        .icon-bg.blue { background: #eff6ff; color: #2563eb; }
        .icon-bg.green { background: #dcfce7; color: #16a34a; }
        .icon-bg.gray { background: #e2e8f0; color: #475569; }
        
        .item-title { display: block; font-size: 0.9rem; font-weight: 600; color: #334155; }
        .item-meta { font-size: 0.75rem; color: #94a3b8; }

        .card-footer { padding: 20px; border-top: 1px solid #f1f5f9; text-align: center; }
        .btn-outline-primary { width: 100%; padding: 10px; border: 1px dashed #6366f1; color: #6366f1; background: #eef2ff; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        
        .text-purple { color: #8b5cf6; }
        .text-blue { color: #3b82f6; }
        
        /* Utils */
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.05); }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .slide-down { animation: slideDown 0.5s ease-out; }
        .fade-in-up { animation: fadeInUp 0.6s ease-out; }
        
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}"""

# --- WRITE TO FILE WITH UTF-8 ENCODING ---
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: VirtualSpace.jsx updated to Premium Light Theme!")
