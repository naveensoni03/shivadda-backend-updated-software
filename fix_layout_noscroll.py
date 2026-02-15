import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Fixing Layout: Removing Scroll & Optimizing Full Screen UI: {TARGET_FILE}")

# --- FULL HEIGHT FIXED CODE ---
code_content = r"""import React, { useState, useRef, useCallback } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, VideoOff, Radio, UploadCloud, FileText, Share2, MessageSquare, PlayCircle, PhoneOff, Youtube, Monitor, Download } from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';

export default function VirtualSpace() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camActive, setCamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  
  // --- RESOURCES STATE ---
  const [resources, setResources] = useState([
      { id: 1, name: "Physics_Chapter1_Notes.pdf", size: "2.4 MB" },
      { id: 2, name: "Assignment_04_Gravitation.docx", size: "850 KB" },
      { id: 3, name: "Lab_Manual_Experiment_1.pdf", size: "1.2 MB" }
  ]);

  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  // --- HANDLERS ---
  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
          const newFile = {
              id: Date.now(),
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(2) + " MB"
          };
          setResources([...resources, newFile]);
          toast.success(`${file.name} Added!`);
      }
  };

  const handleDownload = (fileName) => {
      toast.loading(`Downloading ${fileName}...`);
      setTimeout(() => toast.dismiss(), 1500);
  };

  const openLink = (url) => {
      window.open(url, '_blank');
      toast.success("Opening Link...");
  };

  return (
    <div className="virtual-space-container">
        <SidebarModern />
        
        <div className="main-content-area">
            <Toaster position="top-center" />
            <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />

            {/* HEADER (Fixed Height) */}
            <header className="vs-header">
                <div>
                    <h1 className="vs-title">Virtual Studio <span className="pro-badge">PRO</span></h1>
                    <p className="vs-subtitle">Live Classroom</p>
                </div>
                <div className="header-actions">
                     <button onClick={() => setIsLive(!isLive)} className={`btn-action ${isLive ? 'btn-danger' : 'btn-primary'}`}>
                        {isLive ? "End Stream" : "Go Live"}
                     </button>
                     <button onClick={() => setIsRecording(!isRecording)} className={`btn-action ${isRecording ? 'btn-danger-outline' : 'btn-secondary'}`}>
                        {isRecording ? "Stop" : "Record"}
                     </button>
                </div>
            </header>

            {/* MAIN CONTENT (Flex Grow - No Scroll) */}
            <div className="vs-grid-layout">
                
                {/* LEFT: VIDEO AREA (Full Height) */}
                <div className="video-card shadow-lg">
                    <div className="video-frame">
                        {camActive ? (
                            <Webcam audio={false} ref={webcamRef} style={{width: '100%', height: '100%', objectFit: 'cover'}} mirrored={true} />
                        ) : <div className="camera-off-placeholder">Camera Off</div>}
                        
                        <div className="status-tags">
                            {isLive && <span className="tag live">LIVE</span>}
                            {isRecording && <span className="tag rec">REC</span>}
                        </div>

                        <div className="control-overlay">
                            <div className="control-bar glass-effect">
                                <button onClick={() => setMicActive(!micActive)} className={`ctrl-btn ${!micActive ? 'off' : ''}`}>{micActive ? <Mic size={20}/> : <MicOff size={20}/>}</button>
                                <button onClick={() => setCamActive(!camActive)} className={`ctrl-btn ${!camActive ? 'off' : ''}`}>{camActive ? <Video size={20}/> : <VideoOff size={20}/>}</button>
                                <div className="divider"></div>
                                <button className="ctrl-btn btn-hangup"><PhoneOff size={20}/></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: SIDEBAR PANELS (Flex Column) */}
                <div className="sidebar-panels">
                    
                    {/* Broadcast Links (Fixed Height) */}
                    <div className="info-card broadcast-card shadow-sm">
                        <div className="card-header">
                            <Share2 size={16} className="text-purple"/>
                            <h3>Broadcast</h3>
                        </div>
                        <div className="card-body">
                            <div onClick={() => openLink('https://meet.google.com')} className="list-item clickable">
                                <div className="icon-box green"><Video size={16}/></div> <span>Meet</span>
                            </div>
                            <div onClick={() => openLink('https://zoom.us')} className="list-item clickable">
                                <div className="icon-box blue"><Monitor size={16}/></div> <span>Zoom</span>
                            </div>
                        </div>
                    </div>

                    {/* Resources (Flex Grow - Internal Scroll) */}
                    <div className="info-card resources-card shadow-sm">
                         <div className="card-header">
                            <FileText size={16} className="text-blue"/>
                            <h3>Resources</h3>
                        </div>
                        <div className="card-body scrollable-list">
                            {resources.map((res) => (
                                <div key={res.id} className="resource-item" onClick={() => handleDownload(res.name)}>
                                    <div className="res-icon"><FileText size={18}/></div>
                                    <div className="res-info">
                                        <span className="res-name">{res.name}</span>
                                        <span className="res-meta">{res.size}</span>
                                    </div>
                                    <button className="btn-download"><Download size={14}/></button>
                                </div>
                            ))}
                        </div>
                        <div className="card-footer">
                            <button onClick={handleUploadClick} className="btn-upload">
                                <UploadCloud size={16}/> Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>{`
            :root {
                --bg-body: #f8fafc;
                --text-main: #1e293b;
                --text-muted: #64748b;
                --primary: #3b82f6;
                --danger: #ef4444;
                --border-light: #e2e8f0;
            }
            
            /* --- LAYOUT FIXES (NO SCROLL) --- */
            .virtual-space-container { display: flex; height: 100vh; background: var(--bg-body); font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; }
            .main-content-area { flex: 1; padding: 20px; margin-left: 280px; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
            
            /* Header (Fixed Height) */
            .vs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-shrink: 0; }
            .vs-title { font-size: 1.4rem; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; }
            .vs-subtitle { color: var(--text-muted); margin-top: 2px; font-size: 0.85rem; font-weight: 500; }
            .pro-badge { background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px; }

            /* Grid Layout (Fills remaining height) */
            .vs-grid-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; flex: 1; min-height: 0; /* Critical for nested scroll */ }
            
            /* Video Area */
            .video-card { background: black; border-radius: 16px; overflow: hidden; position: relative; border: 1px solid #334155; height: 100%; }
            .video-frame { width: 100%; height: 100%; position: relative; display: flex; justify-content: center; alignItems: center; }
            .camera-off-placeholder { color: white; font-size: 1.2rem; opacity: 0.7; }
            
            /* Controls */
            .control-overlay { position: absolute; bottom: 20px; width: 100%; display: flex; justify-content: center; }
            .control-bar { display: flex; gap: 10px; background: rgba(0,0,0,0.6); padding: 8px 20px; border-radius: 40px; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); }
            .ctrl-btn { color: white; background: rgba(255,255,255,0.1); border: none; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; alignItems: center; justify-content: center; transition: 0.2s; }
            .ctrl-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.05); }
            .ctrl-btn.off { background: var(--danger); }
            .btn-hangup { background: var(--danger); }
            .divider { width: 1px; height: 25px; background: rgba(255,255,255,0.2); margin: 0 5px; align-self: center; }

            /* Tags */
            .status-tags { position: absolute; top: 15px; left: 15px; display: flex; gap: 8px; }
            .tag { padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; color: white; }
            .tag.live { background: var(--danger); }
            .tag.rec { background: var(--primary); }

            /* Sidebar (Flex Column) */
            .sidebar-panels { display: flex; flex-direction: column; gap: 15px; height: 100%; }
            .info-card { background: white; border-radius: 14px; border: 1px solid var(--border-light); overflow: hidden; display: flex; flex-direction: column; }
            .broadcast-card { flex-shrink: 0; } /* Don't shrink */
            .resources-card { flex: 1; min-height: 0; /* Grow to fill space */ }

            .card-header { padding: 12px 15px; background: #f8fafc; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
            .card-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
            .text-purple { color: #8b5cf6; } .text-blue { color: #3b82f6; }

            .card-body { padding: 10px; }
            .scrollable-list { overflow-y: auto; flex: 1; padding: 10px; } /* Internal Scroll */
            
            /* List Items */
            .list-item { padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px; color: var(--text-main); font-size: 0.85rem; font-weight: 600; border: 1px solid transparent; transition: 0.2s; cursor: pointer; }
            .list-item:hover { background: #f1f5f9; border-color: var(--border-light); }
            .icon-box { width: 28px; height: 28px; border-radius: 6px; display: flex; alignItems: center; justifyContent: center; color: white; }
            .green { background: #10b981; } .blue { background: #3b82f6; } .red { background: #ef4444; }

            /* Resources */
            .resource-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: 0.2s; margin-bottom: 8px; }
            .resource-item:hover { border-color: var(--primary); background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .res-icon { color: var(--text-muted); }
            .res-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
            .res-name { font-size: 0.8rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .res-meta { font-size: 0.7rem; color: var(--text-muted); }
            .btn-download { background: white; border: 1px solid var(--border-light); width: 26px; height: 26px; border-radius: 50%; display: flex; alignItems: center; justify-content: center; color: var(--primary); cursor: pointer; }

            /* Buttons */
            .card-footer { padding: 10px; border-top: 1px solid var(--border-light); text-align: center; background: #f8fafc; flex-shrink: 0; }
            .btn-upload { width: 100%; padding: 10px; background: white; border: 1px dashed var(--primary); color: var(--primary); border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem; transition: 0.2s; }
            .btn-upload:hover { background: #eff6ff; }

            .btn-action { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 700; font-size: 0.85rem; transition: 0.2s; }
            .btn-primary { background: var(--text-main); color: white; }
            .btn-danger { background: var(--danger); color: white; }
            .btn-secondary { background: white; border: 1px solid var(--border-light); color: var(--text-main); }
            .btn-danger-outline { background: white; border: 1px solid var(--danger); color: var(--danger); }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: UI Fixed! No main scrollbar, perfect fit layout.")
