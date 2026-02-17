import React, { useState, useRef, useCallback, useEffect } from "react";
import SidebarModern from "../components/SidebarModern"; 
import { Video, Mic, MicOff, VideoOff, UploadCloud, FileText, Share2, PhoneOff, Monitor, Download, ScreenShare, StopCircle } from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';

export default function VirtualSpace() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camActive, setCamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  
  // --- REFS ---
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const screenVideoRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [stream, setStream] = useState(null);

  // --- RESOURCES STATE ---
  const [resources, setResources] = useState([
      { id: 1, name: "Physics_Chapter1_Notes.pdf", size: "2.4 MB", file: null },
      { id: 2, name: "Assignment_04_Gravitation.docx", size: "850 KB", file: null },
      { id: 3, name: "Lab_Manual_Experiment_1.pdf", size: "1.2 MB", file: null },
  ]);

  const fileInputRef = useRef(null);

  // --- 1. GO LIVE (SCREEN SHARE) LOGIC ---
  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      setStream(displayStream);
      setIsLive(true);
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = displayStream;
      }

      displayStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      toast.success("You are presenting your screen!");

    } catch (err) {
      console.error("Error: " + err);
      toast.error("Screen Share Cancelled");
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsLive(false);
    toast.success("Stopped Presenting");
  };

  const toggleLive = () => {
      if (isLive) {
          stopScreenShare();
      } else {
          startScreenShare();
      }
  };

  // --- 2. RECORDING LOGIC ---
  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setRecordedChunks([]); 

    let recorderStream;

    if (isLive && stream) {
        recorderStream = stream;
    } else if (webcamRef.current && webcamRef.current.stream) {
        recorderStream = webcamRef.current.stream;
    }

    if (recorderStream) {
        mediaRecorderRef.current = new MediaRecorder(recorderStream, {
            mimeType: "video/webm"
        });

        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            (event) => {
                if (event.data.size > 0) {
                    setRecordedChunks((prev) => [...prev, event.data]);
                }
            }
        );

        mediaRecorderRef.current.start();
        toast.success(isLive ? "Recording Screen..." : "Recording Camera...");
    } else {
        toast.error("No video source to record!");
        setIsRecording(false);
    }
  }, [webcamRef, isLive, stream]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast("Processing Recording...", { icon: '⏳' });
        
        setTimeout(() => {
            saveVideoToDatabase(); 
        }, 1000);
    }
  }, [mediaRecorderRef]);

  const saveVideoToDatabase = useCallback(() => {
      if (recordedChunks.length) {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          a.href = url;
          a.download = `recording-${isLive ? 'screen' : 'cam'}-${Date.now()}.webm`; 
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success("Recording Saved!");
      }
  }, [recordedChunks, isLive]);

  const handleHangup = () => {
      if (isRecording) handleStopRecording();
      if (isLive) stopScreenShare();
      setCamActive(false);
      setMicActive(false);
      toast.error("Session Ended");
  };

  // --- HANDLERS ---
  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
          const newFile = {
              id: Date.now(),
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(2) + " MB",
              file: file 
          };
          setResources([newFile, ...resources]); 
          toast.success(`${file.name} Added!`);
      }
      event.target.value = null;
  };

  const handleDownload = (resource) => {
      if (resource.file) {
          const url = URL.createObjectURL(resource.file);
          const a = document.createElement("a");
          a.style = "display: none";
          a.href = url;
          a.download = resource.name; 
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success("File Downloaded!");
      } else {
          toast.loading(`Downloading Demo: ${resource.name}...`);
          setTimeout(() => {
              toast.dismiss();
              const safeFileName = resource.name.replace(/\.(pdf|docx)$/, ".txt");
              const content = `Demo file for: ${resource.name}`;
              const blob = new Blob([content], {type: 'text/plain'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = safeFileName; 
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
          }, 1000);
      }
  };

  const openLink = (url) => {
      window.open(url, '_blank');
      toast.success("Opening...");
  };

  return (
    <div className="virtual-space-container">
        <SidebarModern />
        
        <div className="vs-main-content">
            <Toaster position="top-center" />
            <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileChange} />

            {/* HEADER */}
            <header className="vs-header">
                <div>
                    <h1 className="vs-title">Virtual Studio <span className="pro-badge">PRO</span></h1>
                    <p className="vs-subtitle">Live Classroom</p>
                </div>
                <div className="header-actions">
                      <button onClick={toggleLive} className={`btn-action ${isLive ? 'btn-danger' : 'btn-primary'}`}>
                          {isLive ? <><StopCircle size={16}/> Stop Sharing</> : <><ScreenShare size={16}/> Go Live</>}
                      </button>
                      
                      {isRecording ? (
                          <button onClick={handleStopRecording} className="btn-action btn-danger-outline">
                             Stop Recording
                          </button>
                      ) : (
                          <button onClick={handleStartRecording} className="btn-action btn-secondary">
                             Start Recording
                          </button>
                      )}
                </div>
            </header>

            {/* MAIN CONTENT GRID */}
            <div className="vs-grid-layout">
                
                {/* VIDEO AREA */}
                <div className="video-card shadow-lg">
                    <div className="video-frame">
                        {isLive ? (
                            <video 
                                ref={screenVideoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                style={{width: '100%', height: '100%', objectFit: 'contain', background: '#222'}} 
                            />
                        ) : (
                            camActive ? (
                                <Webcam 
                                    audio={micActive} 
                                    muted={true} 
                                    ref={webcamRef} 
                                    style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                    mirrored={true} 
                                />
                            ) : <div className="camera-off-placeholder">Camera Off</div>
                        )}
                        
                        <div className="status-tags">
                            {isLive && <span className="tag live">ON AIR (SCREEN)</span>}
                            {isRecording && <span className="tag rec">REC</span>}
                        </div>

                        <div className="control-overlay">
                            <div className="control-bar glass-effect">
                                <button onClick={() => setMicActive(!micActive)} className={`ctrl-btn ${!micActive ? 'off' : ''}`}>{micActive ? <Mic size={20}/> : <MicOff size={20}/>}</button>
                                <button onClick={() => setCamActive(!camActive)} className={`ctrl-btn ${!camActive ? 'off' : ''}`}>{camActive ? <Video size={20}/> : <VideoOff size={20}/>}</button>
                                <div className="divider"></div>
                                <button onClick={handleHangup} className="ctrl-btn btn-hangup"><PhoneOff size={20}/></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR PANELS */}
                <div className="sidebar-panels">
                    <div className="info-card broadcast-card shadow-sm">
                        <div className="card-header">
                            <Share2 size={16} className="text-purple"/>
                            <h3>Broadcast</h3>
                        </div>
                        <div className="card-body">
                            <div onClick={() => openLink('https://meet.google.com')} className="list-item clickable">
                                <div className="icon-box green"><Video size={16}/></div> <span>Google Meet</span>
                            </div>
                            <div onClick={() => openLink('https://zoom.us')} className="list-item clickable">
                                <div className="icon-box blue"><Monitor size={16}/></div> <span>Zoom</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-card resources-card shadow-sm">
                         <div className="card-header">
                            <FileText size={16} className="text-blue"/>
                            <h3>Resources</h3>
                        </div>
                        <div className="card-body scrollable-list">
                            {resources.map((res) => (
                                <div key={res.id} className="resource-item" onClick={() => handleDownload(res)}>
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
                                <UploadCloud size={16}/> Upload Resource
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 🚀 CSS WITH 100% BULLETPROOF SCROLL FIX */}
        <style>{`
            :root { --bg-body: #f8fafc; --text-main: #1e293b; --text-muted: #64748b; --primary: #3b82f6; --danger: #ef4444; --border-light: #e2e8f0; }
            
            /* Desktop Layout */
            .virtual-space-container { display: flex; height: 100vh; background: var(--bg-body); font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; }
            .vs-main-content { flex: 1; padding: 20px; margin-left: 280px; height: 100vh; display: flex; flex-direction: column; overflow-y: auto; box-sizing: border-box; transition: all 0.3s ease;}
            .vs-grid-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; flex: 1; min-height: 0; }
            
            .sidebar-panels { display: flex; flex-direction: column; gap: 15px; height: 100%; overflow: hidden; } 
            .info-card { background: white; border-radius: 14px; border: 1px solid var(--border-light); overflow: hidden; display: flex; flex-direction: column; }
            .broadcast-card { flex-shrink: 0; }
            .resources-card { flex: 1; min-height: 250px; display: flex; flex-direction: column; } 
            
            .scrollable-list { overflow-y: auto; flex: 1; padding: 10px; min-height: 0; }
            .scrollable-list::-webkit-scrollbar { width: 6px; }
            .scrollable-list::-webkit-scrollbar-track { background: transparent; }
            .scrollable-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            
            .card-header { padding: 12px 15px; background: #f8fafc; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
            .vs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-shrink: 0; }
            .vs-title { font-size: 1.4rem; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; }
            .vs-subtitle { color: var(--text-muted); margin-top: 2px; font-size: 0.85rem; font-weight: 500; }
            .pro-badge { background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px; }
            
            .video-card { background: black; border-radius: 16px; overflow: hidden; position: relative; border: 1px solid #334155; height: 100%; display: flex; flex-direction: column; }
            .video-frame { width: 100%; height: 100%; position: relative; display: flex; justify-content: center; align-items: center; flex: 1; }
            .camera-off-placeholder { color: white; font-size: 1.2rem; opacity: 0.7; }
            
            .control-overlay { position: absolute; bottom: 20px; width: 100%; display: flex; justify-content: center; z-index: 10; }
            .control-bar { display: flex; gap: 10px; background: rgba(0,0,0,0.6); padding: 8px 20px; border-radius: 40px; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); }
            .ctrl-btn { color: white; background: rgba(255,255,255,0.1); border: none; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .ctrl-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.05); }
            .ctrl-btn.off { background: var(--danger); }
            .btn-hangup { background: var(--danger); }
            .divider { width: 1px; height: 25px; background: rgba(255,255,255,0.2); margin: 0 5px; align-self: center; }
            
            .status-tags { position: absolute; top: 15px; left: 15px; display: flex; gap: 8px; z-index: 10; }
            .tag { padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; color: white; }
            .tag.live { background: var(--danger); }
            .tag.rec { background: var(--primary); }
            
            .card-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
            .text-purple { color: #8b5cf6; } .text-blue { color: #3b82f6; }
            .list-item { padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px; color: var(--text-main); font-size: 0.85rem; font-weight: 600; border: 1px solid transparent; transition: 0.2s; cursor: pointer; }
            .list-item:hover { background: #f1f5f9; border-color: var(--border-light); }
            .icon-box { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; }
            .green { background: #10b981; } .blue { background: #3b82f6; }
            
            .resource-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: 0.2s; margin-bottom: 8px; }
            .resource-item:hover { border-color: var(--primary); background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .res-icon { color: var(--text-muted); }
            .res-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
            .res-name { font-size: 0.8rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .res-meta { font-size: 0.7rem; color: var(--text-muted); }
            .btn-download { background: white; border: 1px solid var(--border-light); width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); cursor: pointer; }
            
            .card-footer { padding: 15px; border-top: 1px solid var(--border-light); text-align: center; background: #f8fafc; flex-shrink: 0; }
            .btn-upload { width: 100%; padding: 12px; background: white; border: 1px dashed var(--primary); color: var(--primary); border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.9rem; transition: 0.2s; }
            .btn-upload:hover { background: #eff6ff; }
            
            .header-actions { display: flex; gap: 10px;}
            .btn-action { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 700; font-size: 0.85rem; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
            .btn-primary { background: var(--text-main); color: white; }
            .btn-danger { background: var(--danger); color: white; }
            .btn-secondary { background: white; border: 1px solid var(--border-light); color: var(--text-main); }
            .btn-danger-outline { background: white; border: 1px solid var(--danger); color: var(--danger); }

            /* ==============================================================
               📱 THE ULTIMATE SCROLL FIX FOR ANY MOBILE IN THE WORLD
               ============================================================== */
            @media (max-width: 850px) {
                
                /* KILL ALL HEIGHT RESTRICTIONS AND OVERFLOW LOCKS */
                .virtual-space-container, 
                .vs-main-content, 
                .vs-grid-layout, 
                .sidebar-panels, 
                .info-card,
                .resources-card,
                .scrollable-list {
                    height: auto !important;
                    min-height: 0 !important;
                    max-height: none !important;
                    overflow: visible !important;
                }

                .virtual-space-container { 
                    display: block !important; 
                    padding-bottom: 50px !important; /* Safety padding for bottom nav bars */
                }

                .vs-main-content {
                    margin-left: 0 !important;
                    padding: 15px !important;
                    padding-top: 90px !important; /* Top space for Mobile Header */
                    width: 100% !important;
                    box-sizing: border-box !important;
                    display: block !important;
                }
                
                /* Stack header buttons */
                .vs-header { display: flex !important; flex-direction: column; align-items: flex-start; gap: 15px; margin-bottom: 20px; }
                .header-actions { display: flex !important; width: 100%; flex-wrap: wrap; }
                .header-actions button { flex: 1; justify-content: center; }

                /* Stack Video and Sidebar */
                .vs-grid-layout { display: flex !important; flex-direction: column !important; gap: 25px; }
                
                /* Video Player - Keep aspect ratio but allow it to sit in document flow */
                .video-card { 
                    display: block !important;
                    width: 100%;
                    aspect-ratio: 4/3; 
                }
                
                /* Make controls smaller for mobile */
                .control-bar { padding: 5px 15px; }
                .ctrl-btn { width: 35px; height: 35px; }
                .control-overlay { bottom: 10px; }
                
                /* Sidebar panels adjustments for mobile */
                .sidebar-panels { 
                    display: flex !important; 
                    flex-direction: column !important; 
                    gap: 20px; 
                }
                
                .info-card { 
                    border: 1px solid var(--border-light) !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                
                /* 🚀 UPLOAD BUTTON VISIBILITY FIX */
                .card-footer {
                    display: block !important;
                    padding: 15px;
                    background: #f8fafc;
                    border-top: 1px solid var(--border-light);
                }
            }
        `}</style>
    </div>
  );
}