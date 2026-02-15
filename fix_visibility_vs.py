import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Fixing Text Visibility in: {TARGET_FILE}")

# --- CODE WITH FIXED CSS COLORS ---
code_content = r"""import React, { useState, useRef, useCallback } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, VideoOff, Radio, UploadCloud, FileText, Share2, MessageSquare, PlayCircle, PhoneOff } from "lucide-react";
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
                        <div className="card-header"><h3>Broadcast To</h3></div>
                        <div className="card-body">
                            <div onClick={() => openLink('https://meet.google.com')} className="list-item"><Share2 size={18}/> Google Meet</div>
                            <div onClick={() => openLink('https://zoom.us')} className="list-item"><Video size={18}/> Zoom</div>
                            <div onClick={() => openLink('https://whatsapp.com')} className="list-item"><MessageSquare size={18}/> WhatsApp Group</div>
                        </div>
                    </div>

                    <div className="info-card shadow-sm hover-lift">
                         <div className="card-header"><h3>Resources</h3></div>
                        <div className="card-body">
                            <div className="list-item"><PlayCircle size={18}/> Recorded_Lec_01.mp4</div>
                            <div className="list-item"><FileText size={18}/> Syllabus.pdf</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>{`
            :root {
                --bg-body: #f8fafc;
                --text-main: #1e293b; /* Dark text for visibility */
                --text-muted: #64748b;
                --primary: #3b82f6;
                --border-light: #e2e8f0;
            }
            .virtual-space-container { display: flex; background: var(--bg-body); min-height: 100vh; font-family: 'Inter', sans-serif; color: var(--text-main); }
            .main-content-area { flex: 1; padding: 30px; margin-left: 280px; height: 100vh; overflow-y: auto; }
            
            /* Header Text Visibility Fix */
            .vs-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .vs-title { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin: 0; }
            .vs-subtitle { color: var(--text-muted); margin-top: 5px; }
            .pro-badge { background: var(--primary); color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.8rem; margin-left: 10px; }

            .vs-grid-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; height: 80vh; }
            .video-card { background: black; border-radius: 20px; overflow: hidden; position: relative; display: flex; justify-content: center; alignItems: center; }
            .video-frame { width: 100%; height: 100%; position: relative; }
            .camera-off-placeholder { color: white; }
            
            .control-overlay { position: absolute; bottom: 20px; width: 100%; display: flex; justify-content: center; }
            .control-bar { display: flex; gap: 15px; background: rgba(0,0,0,0.6); padding: 10px 20px; border-radius: 50px; backdrop-filter: blur(10px); }
            .ctrl-btn { color: white; background: transparent; border: none; cursor: pointer; }
            .btn-hangup { color: #ef4444; }
            
            /* Sidebar Cards Text Visibility Fix */
            .sidebar-panels { display: flex; flex-direction: column; gap: 20px; }
            .info-card { background: white; border-radius: 15px; border: 1px solid var(--border-light); overflow: hidden; }
            .card-header { padding: 15px; background: #f1f5f9; border-bottom: 1px solid var(--border-light); }
            .card-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
            .card-body { padding: 10px; }
            .list-item { padding: 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; color: var(--text-main); font-weight: 500; transition: 0.2s; border: 1px solid transparent; }
            .list-item:hover { background: #f1f5f9; border-color: var(--border-light); }

            .btn-action { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; transition: 0.2s; }
            .btn-action:hover { transform: translateY(-2px); }
            .btn-danger { background: #ef4444; color: white; }
            .btn-secondary { background: white; border: 1px solid #ccc; color: var(--text-main); }
            
            .hover-scale { transition: transform 0.2s; }
            .hover-lift { transition: box-shadow 0.2s, transform 0.2s; }
            .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.1); }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: Text visibility fixed in VirtualSpace.jsx (Dark text on light background).")
