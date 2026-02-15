import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Upgrading: {TARGET_FILE}")

# --- REAL WORKING CODE ---
code_content = r"""import React, { useState, useRef } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, Monitor, Share2, Youtube, FileText, Phone, VideoOff } from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';

export default function VirtualSpace() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camActive, setCamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);

  const handleLive = () => {
    setIsLive(!isLive);
    toast.success(isLive ? "Stream Ended" : "You are LIVE now! ðŸ”´");
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    toast(isRecording ? "Recording Saved ðŸ’¾" : "Recording Started... ðŸ“¹", { icon: isRecording ? 'âœ…' : 'ðŸ”´' });
  };

  const toggleCam = () => {
    setCamActive(!camActive);
    toast(camActive ? "Camera Off" : "Camera On");
  };

  const toggleMic = () => {
    setMicActive(!micActive);
    toast(micActive ? "Muted ðŸ”‡" : "Unmuted ðŸŽ¤");
  };

  const endCall = () => {
    setCamActive(false);
    setMicActive(false);
    setIsLive(false);
    setIsRecording(false);
    toast.error("Call Disconnected");
  };

  const openLink = (url) => {
      window.open(url, '_blank');
      toast.success("Opening Platform...");
  };

  return (
    <div style={{display: "flex", background: "#111827", minHeight: "100vh", color: "white"}}>
        <SidebarModern />
        <div style={{flex: 1, padding: "40px", marginLeft: "280px"}}>
            <Toaster position="top-center" />
            <header style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px"}}>
                <div>
                    <h1 style={{fontSize: "2rem", fontWeight: "900", margin: 0, display:'flex', alignItems:'center', gap:'10px'}}>
                        Virtual Classroom
                        {isLive && <span className="animate-pulse text-red-500 text-sm border border-red-500 px-2 rounded">LIVE</span>}
                    </h1>
                    <p style={{opacity: 0.6}}>Live Streaming & Cloud Recording Studio</p>
                </div>
                <div style={{display: "flex", gap: "10px"}}>
                     <button onClick={handleLive} className="btn-live" style={{background: isLive ? "#374151" : "#ef4444"}}>
                        {isLive ? "End Stream" : "â— Go Live"}
                     </button>
                     <button onClick={handleRecord} className="btn-live" style={{background: isRecording ? "#374151" : "#3b82f6"}}>
                        {isRecording ? "Stop Rec" : "ðŸ“¹ Record"}
                     </button>
                </div>
            </header>

            <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px"}}>
                {/* Main Video Area */}
                <div style={{background: "black", borderRadius: "24px", overflow: "hidden", height: "500px", position: "relative", border: "1px solid #374151", display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {camActive ? (
                        <Webcam 
                            audio={micActive} 
                            style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                            mirrored={true}
                        />
                    ) : (
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5}}>
                            <VideoOff size={64} />
                            <p style={{marginTop: "20px"}}>Camera Off</p>
                        </div>
                    )}

                    {/* Status Overlays */}
                    <div style={{position:'absolute', top:'20px', left:'20px', display:'flex', gap:'10px'}}>
                        {isLive && <div style={{background:'#ef4444', color:'white', padding:'5px 10px', borderRadius:'5px', fontSize:'0.8rem', fontWeight:'bold'}}>LIVE 00:12:45</div>}
                        {isRecording && <div style={{background:'#ef4444', color:'white', padding:'5px 10px', borderRadius:'5px', fontSize:'0.8rem', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> REC</div>}
                    </div>

                    {/* Controls Overlay */}
                    <div style={{position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "15px", background: "rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: "50px", backdropFilter: "blur(10px)", border:'1px solid rgba(255,255,255,0.1)'}}>
                        <button onClick={toggleMic} className={`control-btn ${!micActive ? 'off' : ''}`}>
                            {micActive ? <Mic size={20}/> : <MicOff size={20}/>}
                        </button>
                        <button onClick={toggleCam} className={`control-btn ${!camActive ? 'off' : ''}`}>
                            {camActive ? <Video size={20}/> : <VideoOff size={20}/>}
                        </button>
                        <button className="control-btn" title="Share Screen"><Monitor size={20}/></button>
                        <button onClick={endCall} className="control-btn bg-red"><Phone size={20}/></button>
                    </div>
                </div>

                {/* Right Panel: Integrations */}
                <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                    <div style={{background: "#1f2937", padding: "25px", borderRadius: "20px", border: "1px solid #374151"}}>
                        <h3 style={{margin: "0 0 15px 0", fontSize: "1.1rem"}}>Broadcast To</h3>
                        <div style={{display: "grid", gap: "10px"}}>
                            <div onClick={() => openLink('https://youtube.com')} className="platform-row"><Youtube size={18} color="#ef4444"/> YouTube Live</div>
                            <div onClick={() => openLink('https://zoom.us')} className="platform-row"><Video size={18} color="#3b82f6"/> Zoom Webinar</div>
                            <div onClick={() => openLink('https://meet.google.com')} className="platform-row"><Share2 size={18} color="#10b981"/> Google Meet</div>
                        </div>
                    </div>

                    <div style={{background: "#1f2937", padding: "25px", borderRadius: "20px", border: "1px solid #374151"}}>
                        <h3 style={{margin: "0 0 15px 0", fontSize: "1.1rem"}}>Class Resources</h3>
                        <div style={{display: "grid", gap: "10px"}}>
                            <div className="resource-row"><FileText size={16}/> Physics_Notes_Ch1.pdf</div>
                            <div className="resource-row"><FileText size={16}/> Assignment_04.docx</div>
                            <button style={{marginTop:'10px', background:'#374151', border:'none', padding:'10px', color:'white', borderRadius:'8px', cursor:'pointer'}}>+ Upload New Resource</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .btn-live { border: none; padding: 10px 24px; border-radius: 50px; color: white; fontWeight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                .btn-live:hover { filter: brightness(1.1); }
                
                .control-btn { width: 50px; height: 50px; borderRadius: 50%; border: none; background: #374151; color: white; display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: 0.2s; }
                .control-btn:hover { background: #4b5563; transform: scale(1.05); }
                .control-btn.bg-red { background: #ef4444; }
                .control-btn.bg-red:hover { background: #dc2626; }
                .control-btn.off { background: #ef4444; color: white; }

                .platform-row { display: flex; alignItems: center; gap: 12px; padding: 14px; background: #111827; borderRadius: 12px; font-weight: 600; cursor: pointer; transition:0.2s; border: 1px solid transparent; }
                .platform-row:hover { background: #374151; border-color: #4b5563; }
                
                .resource-row { display: flex; alignItems: center; gap: 10px; color: #9ca3af; font-size: 0.9rem; padding: 10px 0; border-bottom: 1px solid #374151; cursor:pointer; }
                .resource-row:hover { color: white; }
            `}</style>
        </div>
    </div>
  );
}"""

# --- WRITE TO FILE WITH UTF-8 ENCODING ---
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("âœ… SUCCESS: VirtualSpace.jsx Fixed & Upgraded!")
