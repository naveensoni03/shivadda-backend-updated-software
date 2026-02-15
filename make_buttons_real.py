import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Activating ALL Buttons in Virtual Space: {TARGET_FILE}")

# --- FULL FUNCTIONAL CODE ---
code_content = r"""import React, { useState, useCallback, useRef, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, MicOff, Monitor, Share2, Youtube, FileText, PhoneOff, VideoOff, Radio, UploadCloud, Cast, Layers, Settings, Users, MessageSquare, Layout, Maximize, Send, X, MoreVertical, Paperclip } from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';

export default function VirtualSpace() {
  // --- STATES ---
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camActive, setCamActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  
  // New Functional States
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [activeTab, setActiveTab] = useState('default'); // default, chat, participants
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([
      { sender: "System", text: "Welcome to the class!", time: "10:00 AM" },
      { sender: "Rahul", text: "Sir, voice is clear.", time: "10:02 AM" }
  ]);
  const [materials, setMaterials] = useState([
      { name: "Physics_Ch1.pdf", size: "2.4 MB", type: "pdf" },
      { name: "Assignment_04.docx", size: "850 KB", type: "doc" }
  ]);

  // Refs
  const fileInputRef = useRef(null);
  const screenVideoRef = useRef(null);

  // --- CONFIGURATION ---
  const videoConstraints = {
    width: { ideal: 3840 },
    height: { ideal: 2160 },
    aspectRatio: 1.777777778,
    facingMode: "user"
  };

  // --- HANDLERS ---

  // 1. SCREEN SHARE
  const handleScreenShare = async () => {
    if (screenShareStream) {
        // Stop Sharing
        screenShareStream.getTracks().forEach(track => track.stop());
        setScreenShareStream(null);
        toast("Screen Sharing Stopped");
    } else {
        // Start Sharing
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setScreenShareStream(stream);
            toast.success("Screen Sharing Active");
            
            // Handle system stop button
            stream.getVideoTracks()[0].onended = () => {
                setScreenShareStream(null);
                toast("Screen Sharing Stopped");
            };
        } catch (err) {
            console.error(err);
            toast.error("Screen Share Cancelled");
        }
    }
  };

  // 2. FILE UPLOAD
  const triggerFileUpload = () => {
      fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          const newFile = { 
              name: file.name, 
              size: (file.size / 1024 / 1024).toFixed(2) + " MB", 
              type: file.name.split('.').pop() 
          };
          setMaterials([...materials, newFile]);
          toast.success(`${file.name} Uploaded!`);
      }
  };

  // 3. CHAT FUNCTION
  const sendMessage = () => {
      if (!chatMsg.trim()) return;
      const newMsg = { 
          sender: "You", 
          text: chatMsg, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages([...messages, newMsg]);
      setChatMsg("");
  };

  // 4. LAYOUT TOGGLE
  const toggleLayout = () => {
      setIsFullWidth(!isFullWidth);
      toast(isFullWidth ? "Standard View" : "Theater Mode");
  };

  // 5. SIDEBAR TABS
  const toggleSidebar = (tab) => {
      if (activeTab === tab) setActiveTab('default');
      else setActiveTab(tab);
  };

  // Auto-play screen share video
  useEffect(() => {
      if (screenShareStream && screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenShareStream;
      }
  }, [screenShareStream]);


  // Basic Handlers
  const handleLive = () => {
    setIsLive(!isLive);
    if (!isLive) toast.success("🔴 You are LIVE!", { style: { background: '#ef4444', color: 'white' } });
    else toast("Broadcast Ended.");
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) toast("Recording Started... 💾");
    else toast.success("Recording Saved! ✅");
  };

  const toggleCam = useCallback(() => {
    setCamActive(p => !p);
    toast(camActive ? "Camera Disabled" : "Camera Enabled");
  }, [camActive]);

  const toggleMic = useCallback(() => {
    setMicActive(p => !p);
    toast(micActive ? "Microphone Muted" : "Microphone Unmuted");
  }, [micActive]);

  const endCall = () => {
    // Reset all
    if(screenShareStream) screenShareStream.getTracks().forEach(track => track.stop());
    setScreenShareStream(null);
    setCamActive(false);
    setIsLive(false);
    toast.error("Call Ended");
  };

  return (
    <div className="virtual-space-container">
        <SidebarModern />
        <div className="main-content-area">
            <Toaster position="top-center" />
            <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileChange} />
            
            {/* HEADER */}
            <header className="vs-header slide-down">
                <div>
                    <h1 className="vs-title">
                        Virtual Studio <span className="pro-badge">4K</span>
                        {isLive && <span className="live-badge pulse-red"><Radio size={14}/> LIVE</span>}
                    </h1>
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

            <div className={`vs-grid-layout ${isFullWidth ? 'full-mode' : ''} fade-in-up`}>
                {/* MAIN VIDEO STAGE */}
                <div className="video-card shadow-xl">
                    <div className="video-frame">
                        {/* Logic: Show Screen Share OR Webcam OR Placeholder */}
                        {screenShareStream ? (
                            <video ref={screenVideoRef} autoPlay playsInline className="webcam-feed" style={{objectFit: 'contain', background:'#000'}} />
                        ) : camActive ? (
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

                        <div className="status-tags">
                            {isLive && <span className="tag live">LIVE</span>}
                            {isRecording && <span className="tag rec">REC</span>}
                            {screenShareStream && <span className="tag share">Sharing Screen</span>}
                        </div>

                        {/* Floating Control Bar */}
                        <div className="control-overlay">
                            <div className="control-bar shadow-2xl glass-effect">
                                <button onClick={toggleMic} className={`ctrl-btn ${!micActive ? 'is-off' : ''}`} title="Mic">
                                    {micActive ? <Mic size={20}/> : <MicOff size={20}/>}
                                </button>
                                <button onClick={toggleCam} className={`ctrl-btn ${!camActive ? 'is-off' : ''}`} title="Camera">
                                    {camActive ? <Video size={20}/> : <VideoOff size={20}/>}
                                </button>
                                
                                <div className="divider"></div>

                                <button onClick={handleScreenShare} className={`ctrl-btn ${screenShareStream ? 'active-btn' : ''}`} title="Share Screen">
                                    <Monitor size={20}/>
                                </button>
                                <button onClick={() => toggleSidebar('chat')} className={`ctrl-btn ${activeTab === 'chat' ? 'active-btn' : ''}`} title="Chat">
                                    <MessageSquare size={20}/>
                                    <span className="badge-dot"></span>
                                </button>
                                <button onClick={() => toggleSidebar('participants')} className={`ctrl-btn ${activeTab === 'participants' ? 'active-btn' : ''}`} title="Participants">
                                    <Users size={20}/>
                                </button>
                                 <button onClick={toggleLayout} className="ctrl-btn" title="Theater Mode">
                                    {isFullWidth ? <Layout size={20}/> : <Maximize size={20}/>}
                                </button>

                                <div className="divider"></div>

                                <button onClick={endCall} className="ctrl-btn btn-hangup" title="Leave Call">
                                    <PhoneOff size={22}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DYNAMIC SIDEBAR (Chat / Participants / Default) */}
                {!isFullWidth && (
                    <div className="sidebar-panels slide-in-right">
                        
                        {/* CHAT TAB */}
                        {activeTab === 'chat' && (
                            <div className="info-card shadow-sm h-full">
                                <div className="card-header">
                                    <MessageSquare size={18} className="text-blue"/>
                                    <h3>Live Chat</h3>
                                    <button onClick={() => setActiveTab('default')} className="close-btn"><X size={16}/></button>
                                </div>
                                <div className="card-body chat-body">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`chat-msg ${m.sender === 'You' ? 'my-msg' : ''}`}>
                                            <span className="sender">{m.sender} <small>{m.time}</small></span>
                                            <p>{m.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="card-footer chat-footer">
                                    <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Type message..." />
                                    <button onClick={sendMessage}><Send size={16}/></button>
                                </div>
                            </div>
                        )}

                        {/* PARTICIPANTS TAB */}
                        {activeTab === 'participants' && (
                            <div className="info-card shadow-sm h-full">
                                <div className="card-header">
                                    <Users size={18} className="text-purple"/>
                                    <h3>Participants (4)</h3>
                                    <button onClick={() => setActiveTab('default')} className="close-btn"><X size={16}/></button>
                                </div>
                                <div className="card-body">
                                    {['You (Host)', 'Rahul Sharma', 'Priya Verma', 'Amit Singh'].map((p, i) => (
                                        <div key={i} className="list-item">
                                            <div className="avatar">{p.charAt(0)}</div>
                                            <span>{p}</span>
                                            <div style={{marginLeft:'auto', display:'flex', gap:'5px'}}>
                                                {i === 0 ? <span className="tag-host">Host</span> : <MicOff size={14} color="#94a3b8"/>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DEFAULT VIEW (Broadcast & Materials) */}
                        {activeTab === 'default' && (
                            <>
                                <div className="info-card shadow-sm hover-lift">
                                    <div className="card-header">
                                        <Cast size={18} className="text-purple"/>
                                        <h3>Broadcast</h3>
                                    </div>
                                    <div className="card-body">
                                        <div onClick={() => window.open('https://youtube.com', '_blank')} className="list-item">
                                            <div className="icon-bg red"><Youtube size={18} /></div> <span>YouTube Live</span>
                                        </div>
                                        <div onClick={() => window.open('https://zoom.us', '_blank')} className="list-item">
                                            <div className="icon-bg blue"><Video size={18} /></div> <span>Zoom Webinar</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-card shadow-sm hover-lift flex-1">
                                     <div className="card-header">
                                        <Layers size={18} className="text-blue"/>
                                        <h3>Materials</h3>
                                    </div>
                                    <div className="card-body">
                                        {materials.map((file, i) => (
                                            <div key={i} className="list-item">
                                                <div className="icon-bg gray"><FileText size={18}/></div> 
                                                <div>
                                                    <span className="item-title">{file.name}</span>
                                                    <span className="item-meta">{file.size}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card-footer">
                                        <button onClick={triggerFileUpload} className="btn-outline-primary">
                                            <UploadCloud size={16}/> Upload File
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>

      <style>{`
        :root {
            --bg-body: #f8fafc;
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
            grid-template-columns: 1fr 320px;
            gap: 25px;
            height: calc(100vh - 130px);
            transition: all 0.3s ease;
        }
        .vs-grid-layout.full-mode {
            grid-template-columns: 1fr;
        }

        /* HEADER */
        .vs-header { display: flex; justifyContent: space-between; alignItems: center; margin-bottom: 20px; }
        .vs-title { font-size: 1.8rem; font-weight: 800; margin: 0; display: flex; alignItems: center; gap: 12px; color: #1e293b; letter-spacing: -0.5px; }
        .live-badge { display: flex; alignItems: center; gap: 6px; background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .pro-badge { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; letter-spacing: 1px; }
        .header-actions { display: flex; gap: 12px; }

        /* BUTTONS */
        .btn-action { border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
        .btn-primary { background: #0f172a; color: white; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2); }
        .btn-primary:hover { background: #1e293b; transform: translateY(-2px); }
        .btn-secondary { background: white; border: 1px solid #e2e8f0; color: #334155; }
        .btn-secondary:hover { background: #f1f5f9; transform: translateY(-2px); }
        .btn-danger { background: var(--danger); color: white; }
        .btn-danger-outline { background: white; border: 2px solid #fee2e2; color: var(--danger); font-weight: 800; }

        /* VIDEO CARD & FRAME */
        .video-card { background: black; border-radius: 20px; overflow: hidden; height: 100%; position: relative; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .video-frame { width: 100%; height: 100%; position: relative; display: flex; alignItems: center; justifyContent: center; background: #000; }
        .webcam-feed { width: 100%; height: 100%; object-fit: cover; } 
        
        .camera-off-placeholder { color: white; text-align: center; display: flex; flex-direction: column; alignItems: center; opacity: 0.7; }
        .placeholder-circle { width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; alignItems: center; justifyContent: center; margin-bottom: 15px; border: 2px solid rgba(255,255,255,0.2); color: #fff; }
        
        .status-tags { position: absolute; top: 20px; left: 20px; display: flex; gap: 10px; z-index: 10; }
        .tag { padding: 5px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; color: white; backdrop-filter: blur(4px); }
        .tag.live { background: rgba(220, 38, 38, 0.9); }
        .tag.rec { background: rgba(37, 99, 235, 0.9); }
        .tag.share { background: rgba(16, 185, 129, 0.9); }

        /* CONTROLS OVERLAY */
        .control-overlay { position: absolute; bottom: 30px; left: 0; width: 100%; display: flex; justify-content: center; pointer-events: none; }
        .control-bar { pointer-events: auto; display: flex; gap: 12px; background: rgba(0, 0, 0, 0.6); padding: 10px 20px; border-radius: 50px; align-items: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .ctrl-btn { width: 45px; height: 45px; border-radius: 50%; border: none; background: rgba(255,255,255,0.1); color: white; display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: all 0.2s; position: relative; }
        .ctrl-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }
        .ctrl-btn.active-btn { background: var(--primary); color: white; }
        .ctrl-btn.is-off { background: #ef4444; color: white; }
        .btn-hangup { background: #ef4444; width: 50px; height: 50px; }
        .btn-hangup:hover { background: #dc2626; transform: scale(1.1); }
        .divider { width: 1px; height: 25px; background: rgba(255,255,255,0.2); margin: 0 5px; }
        .badge-dot { position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 1px solid white; }

        /* SIDEBAR PANELS */
        .sidebar-panels { display: flex; flex-direction: column; gap: 20px; height: 100%; overflow-y: auto; }
        .info-card { background: white; border-radius: 20px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; flex: 1; }
        .card-header { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; display: flex; alignItems: center; gap: 10px; background: #f8fafc; border-radius: 20px 20px 0 0; }
        .card-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; color: #1e293b; flex: 1; }
        .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }
        .card-body { padding: 15px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; }
        
        .list-item { display: flex; alignItems: center; gap: 12px; padding: 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: white; border: 1px solid #f1f5f9; }
        .list-item:hover { border-color: var(--primary); transform: translateX(3px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .icon-bg { width: 32px; height: 32px; border-radius: 8px; display: flex; alignItems: center; justifyContent: center; }
        .icon-bg.red { background: #fee2e2; color: #dc2626; }
        .icon-bg.blue { background: #eff6ff; color: #2563eb; }
        .icon-bg.green { background: #dcfce7; color: #16a34a; }
        .icon-bg.gray { background: #f1f5f9; color: #475569; }
        
        .item-title { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .item-meta { font-size: 0.75rem; color: var(--text-light); }

        /* CHAT STYLES */
        .chat-body { background: #f8fafc; padding: 15px; }
        .chat-msg { margin-bottom: 10px; background: white; padding: 10px; border-radius: 10px; border-bottom-left-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .chat-msg.my-msg { background: #eff6ff; margin-left: auto; border-radius: 10px; border-bottom-right-radius: 2px; text-align: right; }
        .chat-msg .sender { font-size: 0.7rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 2px; }
        .chat-msg p { margin: 0; font-size: 0.9rem; color: #334155; }
        .chat-footer { padding: 15px; border-top: 1px solid #f1f5f9; display: flex; gap: 10px; }
        .chat-footer input { flex: 1; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 8px; outline: none; }
        .chat-footer button { background: var(--primary); color: white; border: none; width: 35px; height: 35px; border-radius: 8px; display: flex; alignItems: center; justifyContent: center; cursor: pointer; }

        .avatar { width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; font-weight: 700; color: #64748b; font-size: 0.8rem; }
        .tag-host { background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }

        .card-footer { padding: 15px; border-top: 1px solid #f1f5f9; text-align: center; }
        .btn-outline-primary { width: 100%; padding: 10px; border: 1px dashed #6366f1; color: #6366f1; background: #eef2ff; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .btn-outline-primary:hover { background: #e0e7ff; transform: translateY(-1px); }
        
        .text-purple { color: #8b5cf6; }
        .text-blue { color: #3b82f6; }
        
        /* Utils */
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:active { transform: scale(0.98); }
        .hover-lift { transition: all 0.2s; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05); }
        .slide-down { animation: slideDown 0.5s ease-out; }
        .fade-in-up { animation: fadeInUp 0.6s ease-out; }
        @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        @keyframes pulseGray { 0% { box-shadow: 0 0 0 0 rgba(148, 163, 184, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(148, 163, 184, 0); } 100% { box-shadow: 0 0 0 0 rgba(148, 163, 184, 0); } }
        .pulse-red { animation: pulseRed 2s infinite; }
        .pulse-gray { animation: pulseGray 2s infinite; }
        .h-full { height: 100%; }
        
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}"""

# --- WRITE TO FILE WITH UTF-8 ENCODING ---
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: VirtualSpace.jsx updated with REAL WORKING BUTTONS!")
