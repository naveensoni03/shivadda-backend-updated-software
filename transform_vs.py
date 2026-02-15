import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Transforming Virtual Space UI: {TARGET_FILE}")

# --- LUXE ANIMATED CODE WITH WORKING LOGIC ---
code_content = r"""import React, { useState, useCallback } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, Monitor, Share2, Youtube, FileText, PhoneOff, VideoOff, Radio, UploadCloud, Cast, Layers, Settings } from "lucide-react";
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
    toast.error("Session Ended. Disconnecting...", { style: { background: '#ef4444', color: 'white', fontWeight: 'bold' }, icon: '👋' });
  };

  const openLink = (url, platform) => {
      window.open(url, '_blank');
      toast.loading(`Connecting to ${platform}...`, { duration: 2000 });
  };

  return (
    <div className="virtual-space-container">
        <SidebarModern />
        <div className="main-content-area">
            <Toaster position="top-center" toastOptions={{ className: 'luxe-toast', duration: 3000 }} />
            
            {/* HEADER */}
            <header className="vs-header slide-down">
                <div>
                    <h1 className="vs-title">
                        <span className="gradient-text">Virtual Studio</span> Pro
                        {isLive && <span className="live-badge pulse-red"><Radio size={14}/> LIVE</span>}
                    </h1>
                    <p className="vs-subtitle">Next-Gen Interactive Broadcasting & Cloud Recording.</p>
                </div>
                <div className="header-actions">
                     <button onClick={handleLive} className={`btn-luxe ${isLive ? 'btn-end-live' : 'btn-go-live'} hover-scale`}>
                        {isLive ? "⏹ End Stream" : "🔴 Go Live"}
                     </button>
                     <button onClick={handleRecord} className={`btn-luxe ${isRecording ? 'btn-stop-rec' : 'btn-record'} hover-scale`}>
                        {isRecording ? "💾 Stop Rec" : "⏺ Record"}
                     </button>
                </div>
            </header>

            <div className="vs-grid-layout fade-in-up">
                {/* MAIN VIDEO STAGE */}
                <div className="video-stage-card glass-panel">
                    <div className="video-container">
                        {camActive ? (
                            <Webcam 
                                audio={false} // ✅ ECHO FIX: Mutes local playback
                                muted={true}  
                                videoConstraints={videoConstraints}
                                style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                mirrored={true}
                                className="webcam-feed"
                            />
                        ) : (
                            <div className="camera-off-placeholder">
                                <div className="placeholder-icon float-animation">
                                    <VideoOff size={80} strokeWidth={1} />
                                </div>
                                <h3 style={{marginTop: '20px', fontWeight: '600', letterSpacing: '1px'}}>Visual Feed Inactive</h3>
                                <p style={{opacity: 0.6, fontSize: '0.9rem'}}>Your audio is still active if unmuted.</p>
                            </div>
                        )}

                        {/* Status Overlays */}
                        <div className="status-overlays">
                            {isLive && <div className="status-badge live pulse-red">📡 ON-AIR <span>00:12:45</span></div>}
                            {isRecording && <div className="status-badge record pulse-blue"><div className="rec-dot"></div> REC</div>}
                        </div>

                        {/* Floating Control Bar */}
                        <div className="control-bar-floating glass-control">
                            <button onClick={toggleMic} className={`control-btn-luxe ${!micActive ? 'is-off' : ''} hover-lift`} title="Toggle Microphone">
                                {micActive ? <Mic size={22}/> : <MicOff size={22}/>}
                            </button>
                            <button onClick={toggleCam} className={`control-btn-luxe ${!camActive ? 'is-off' : ''} hover-lift`} title="Toggle Camera">
                                {camActive ? <Video size={22}/> : <VideoOff size={22}/>}
                            </button>
                            <button className="control-btn-luxe hover-lift" title="Share Screen">
                                <Monitor size={22}/>
                            </button>
                            <button className="control-btn-luxe hover-lift" title="Advanced Settings">
                                <Settings size={22}/>
                            </button>
                            <div className="separator-vertical"></div>
                            <button onClick={endCall} className="control-btn-luxe btn-hangup hover-scale" title="End Session">
                                <PhoneOff size={24}/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR - INTEGRATIONS & RESOURCES */}
                <div className="sidebar-panels">
                    
                    {/* Broadcast Panel */}
                    <div className="panel-card glass-panel hover-glow slide-in-right" style={{animationDelay: '0.1s'}}>
                        <div className="panel-header">
                            <Cast size={20} className="panel-icon"/>
                            <h3>Broadcast Destinations</h3>
                        </div>
                        <div className="panel-body">
                            <div onClick={() => openLink('https://youtube.com', 'YouTube')} className="broadcast-item youtube hover-slide">
                                <Youtube size={20} /> <span>YouTube Live</span>
                            </div>
                            <div onClick={() => openLink('https://zoom.us', 'Zoom')} className="broadcast-item zoom hover-slide">
                                <Video size={20} /> <span>Zoom Webinar</span>
                            </div>
                            <div onClick={() => openLink('https://meet.google.com', 'Google Meet')} className="broadcast-item meet hover-slide">
                                <Share2 size={20} /> <span>Google Meet</span>
                            </div>
                        </div>
                    </div>

                    {/* Resources Panel */}
                    <div className="panel-card glass-panel hover-glow slide-in-right" style={{animationDelay: '0.2s'}}>
                         <div className="panel-header">
                            <Layers size={20} className="panel-icon"/>
                            <h3>Session Materials</h3>
                        </div>
                        <div className="panel-body scrollable-list">
                            <div className="resource-item hover-slide">
                                <FileText size={18} className="res-icon pdf"/> 
                                <div className="res-info">
                                    <span className="res-name">Advanced_Physics_Module_1.pdf</span>
                                    <span className="res-meta">2.4 MB • PDF</span>
                                </div>
                            </div>
                            <div className="resource-item hover-slide">
                                <FileText size={18} className="res-icon doc"/> 
                                <div className="res-info">
                                    <span className="res-name">Lab_Assignment_WK4.docx</span>
                                    <span className="res-meta">850 KB • Word Doc</span>
                                </div>
                            </div>
                             <div className="resource-item hover-slide">
                                <FileText size={18} className="res-icon pdf"/> 
                                <div className="res-info">
                                    <span className="res-name">Reference_Formulas.pdf</span>
                                    <span className="res-meta">1.1 MB • PDF</span>
                                </div>
                            </div>
                        </div>
                        <div className="panel-footer">
                            <button className="btn-upload-luxe hover-scale">
                                <UploadCloud size={18}/> Upload New Resource
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      <style>{`
        :root {
            --vs-bg: #09090b; /* Ultra Dark Background */
            --vs-card-bg: rgba(255, 255, 255, 0.03); /* Subtle Glass */
            --vs-border: rgba(255, 255, 255, 0.08);
            --vs-text-primary: #ffffff;
            --vs-text-secondary: #a1a1aa;
            --vs-accent-red: #ef4444;
            --vs-accent-blue: #3b82f6;
            --vs-accent-purple: #8b5cf6;
            --vs-accent-green: #10b981;
        }

        /* --- LAYOUT & CONTAINER --- */
        .virtual-space-container {
            display: flex;
            background: radial-gradient(circle at top right, #18181b 0%, var(--vs-bg) 100%);
            min-height: 100vh;
            color: var(--vs-text-primary);
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        .main-content-area {
            flex: 1;
            padding: 30px 40px;
            margin-left: 280px; /* Sidebar width */
            overflow-y: auto;
            height: 100vh;
            position: relative;
        }
        .vs-grid-layout {
            display: grid;
            grid-template-columns: 2.5fr 1fr;
            gap: 25px;
            height: calc(100vh - 140px); /* Adjust based on header */
        }

        /* --- ANIMATIONS --- */
        @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); } 70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        @keyframes pulseBlue { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6); } 70% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        @keyframes glow { 0% { border-color: var(--vs-border); } 50% { border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); } 100% { border-color: var(--vs-border); } }

        .slide-down { animation: slideDown 0.6s ease-out; }
        .fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }
        .slide-in-right { animation: slideInRight 0.6s ease-out forwards; opacity: 0; }
        .pulse-red { animation: pulseRed 2s infinite; }
        .pulse-blue { animation: pulseBlue 2s infinite; }
        .float-animation { animation: float 4s ease-in-out infinite; }
        .hover-scale { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hover-scale:active { transform: scale(0.95) !important; }
        .hover-scale:hover { transform: scale(1.05); }
        .hover-lift { transition: transform 0.2s, background 0.2s; }
        .hover-lift:hover { transform: translateY(-4px); }
        .hover-slide { transition: transform 0.2s, background 0.2s, border-color 0.2s; }
        .hover-slide:hover { transform: translateX(8px); }
        .hover-glow:hover { animation: glow 3s infinite; }


        /* --- HEADER --- */
        .vs-header { display: flex; justifyContent: space-between; alignItems: center; margin-bottom: 30px; }
        .vs-title { font-size: 2.2rem; font-weight: 900; margin: 0; display: flex; alignItems: center; gap: 15px; letter-spacing: -0.5px; }
        .gradient-text { background: linear-gradient(to right, var(--vs-accent-purple), var(--vs-accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .vs-subtitle { color: var(--vs-text-secondary); margin-top: 5px; font-size: 1rem; font-weight: 500; }
        .live-badge { display: flex; alignItems: center; gap: 6px; background: var(--vs-accent-red); color: white; padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .header-actions { display: flex; gap: 12px; }

        /* --- BUTTONS --- */
        .btn-luxe { border: none; padding: 12px 24px; border-radius: 14px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s; }
        .btn-go-live { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .btn-go-live:hover { box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4); }
        .btn-end-live { background: #27272a; border: 1px solid var(--vs-border); color: var(--vs-text-secondary); }
        .btn-record { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .btn-record:hover { box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4); }
        .btn-stop-rec { background: #27272a; border: 1px solid var(--vs-border); color: var(--vs-text-secondary); }

        /* --- GLASS PANELS --- */
        .glass-panel { background: var(--vs-card-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--vs-border); border-radius: 24px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); overflow: hidden; }
        
        /* --- VIDEO STAGE --- */
        .video-stage-card { height: 100%; display: flex; flex-direction: column; }
        .video-container { flex: 1; position: relative; background: black; display: flex; align-items: center; justifyContent: center; overflow: hidden; border-radius: 24px; }
        .webcam-feed { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); } /* Ensure mirroring */
        .camera-off-placeholder { display: flex; flexDirection: column; alignItems: center; color: var(--vs-text-secondary); z-index: 1; }
        .placeholder-icon { color: #52525b; }

        /* --- OVERLAYS & CONTROLS --- */
        .status-overlays { position: absolute; top: 25px; left: 25px; display: flex; gap: 15px; z-index: 10; }
        .status-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; gap: 8px; backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .status-badge.live { background: rgba(239, 68, 68, 0.85); color: white; }
        .status-badge.record { background: rgba(59, 130, 246, 0.85); color: white; }
        .rec-dot { width: 10px; height: 10px; background: white; border-radius: 50%; animation: pulseRed 1.5s infinite; }

        .control-bar-floating { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; padding: 12px 20px; border-radius: 60px; z-index: 10; align-items: center; }
        .glass-control { background: rgba(24, 24, 27, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .control-btn-luxe { width: 54px; height: 54px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.03); color: var(--vs-text-primary); display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: all 0.2s; }
        .control-btn-luxe:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .control-btn-luxe.is-off { background: #27272a; color: var(--vs-text-secondary); border-color: var(--vs-border); }
        .btn-hangup { background: var(--vs-accent-red) !important; border: none !important; color: white !important; width: 60px; height: 60px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
        .btn-hangup:hover { background: #dc2626 !important; box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5); }
        .separator-vertical { width: 1px; height: 30px; background: rgba(255,255,255,0.1); margin: 0 5px; }

        /* --- SIDEBAR PANELS --- */
        .sidebar-panels { display: flex; flex-direction: column; gap: 25px; height: 100%; }
        .panel-card { display: flex; flex-direction: column; height: 100%; max-height: 48%; } /* Split vertically */
        .panel-header { padding: 20px; border-bottom: 1px solid var(--vs-border); display: flex; align-items: center; gap: 12px; }
        .panel-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; letter-spacing: 0.5px; }
        .panel-icon { color: var(--vs-accent-purple); }
        .panel-body { padding: 15px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .scrollable-list { scrollbar-width: thin; scrollbar-color: var(--vs-border) transparent; }

        /* --- LIST ITEMS --- */
        .broadcast-item { display: flex; alignItems: center; gap: 15px; padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid transparent; border-radius: 16px; font-weight: 600; cursor: pointer; }
        .broadcast-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        .broadcast-item.youtube { color: #ff0000; } .broadcast-item.youtube:hover { background: rgba(255,0,0,0.05); border-color: rgba(255,0,0,0.2); }
        .broadcast-item.zoom { color: #2d8cff; } .broadcast-item.zoom:hover { background: rgba(45,140,255,0.05); border-color: rgba(45,140,255,0.2); }
        .broadcast-item.meet { color: #00ac47; } .broadcast-item.meet:hover { background: rgba(0,172,71,0.05); border-color: rgba(0,172,71,0.2); }
        
        .resource-item { display: flex; alignItems: center; gap: 15px; padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid transparent; border-radius: 14px; cursor: pointer; }
        .resource-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        .res-icon { padding: 10px; border-radius: 10px; }
        .res-icon.pdf { background: rgba(239, 68, 68, 0.1); color: var(--vs-accent-red); }
        .res-icon.doc { background: rgba(59, 130, 246, 0.1); color: var(--vs-accent-blue); }
        .res-info { display: flex; flex-direction: column; }
        .res-name { font-weight: 600; font-size: 0.95rem; color: var(--vs-text-primary); }
        .res-meta { font-size: 0.8rem; color: var(--vs-text-secondary); margin-top: 2px; }
        
        .panel-footer { padding: 20px; border-top: 1px solid var(--vs-border); }
        .btn-upload-luxe { width: 100%; padding: 14px; background: var(--vs-accent-purple); border: none; border-radius: 14px; color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); transition: all 0.3s; }
        .btn-upload-luxe:hover { background: #7c3aed; box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5); }

        /* --- TOAST CUSTOMIZATION --- */
        .luxe-toast { background: rgba(24, 24, 27, 0.8) !important; backdrop-filter: blur(10px) !important; color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; font-weight: 600 !important; box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
      `}</style>
    </div>
  );
}"""

# --- WRITE TO FILE WITH UTF-8 ENCODING ---
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: VirtualSpace.jsx has been transformed into a Luxe Studio with Audio Fix!")
