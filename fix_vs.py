import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "VirtualSpace.jsx")

print(f"ðŸ”§ Fixing: {TARGET_FILE}")

# --- CORRECTED CODE (Added 'Phone' to imports) ---
code_content = r"""import React from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, Monitor, Share2, Youtube, FileText, Phone } from "lucide-react";

export default function VirtualSpace() {
  return (
    <div style={{display: "flex", background: "#111827", minHeight: "100vh", color: "white"}}>
        <SidebarModern />
        <div style={{flex: 1, padding: "40px", marginLeft: "280px"}}>
            <header style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px"}}>
                <div>
                    <h1 style={{fontSize: "2rem", fontWeight: "900", margin: 0}}>Virtual Classroom</h1>
                    <p style={{opacity: 0.6}}>Live Streaming & Cloud Recording Studio</p>
                </div>
                <div style={{display: "flex", gap: "10px"}}>
                     <button className="btn-live" style={{background: "#ef4444"}}>â— Go Live</button>
                     <button className="btn-live" style={{background: "#3b82f6"}}>ðŸ“¹ Record</button>
                </div>
            </header>

            <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px"}}>
                {/* Main Video Area */}
                <div style={{background: "#1f2937", borderRadius: "24px", overflow: "hidden", height: "500px", position: "relative", border: "1px solid #374151"}}>
                    <div style={{position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 0.5}}>
                        <Video size={64} />
                        <p style={{marginTop: "20px"}}>Camera Feed Inactive</p>
                    </div>
                    {/* Controls Overlay */}
                    <div style={{position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "15px", background: "rgba(0,0,0,0.6)", padding: "10px 20px", borderRadius: "50px", backdropFilter: "blur(10px)"}}>
                        <button className="control-btn"><Mic size={20}/></button>
                        <button className="control-btn"><Video size={20}/></button>
                        <button className="control-btn"><Monitor size={20}/></button>
                        <button className="control-btn bg-red"><Phone size={20}/></button>
                    </div>
                </div>

                {/* Right Panel: Integrations */}
                <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                    <div style={{background: "#1f2937", padding: "25px", borderRadius: "20px", border: "1px solid #374151"}}>
                        <h3 style={{margin: "0 0 15px 0", fontSize: "1.1rem"}}>Broadcast To</h3>
                        <div style={{display: "grid", gap: "10px"}}>
                            <div className="platform-row"><Youtube size={18} color="#ef4444"/> YouTube Live</div>
                            <div className="platform-row"><Video size={18} color="#3b82f6"/> Zoom Webinar</div>
                            <div className="platform-row"><Share2 size={18} color="#10b981"/> Google Meet</div>
                        </div>
                    </div>

                    <div style={{background: "#1f2937", padding: "25px", borderRadius: "20px", border: "1px solid #374151"}}>
                        <h3 style={{margin: "0 0 15px 0", fontSize: "1.1rem"}}>Resources</h3>
                        <div style={{display: "grid", gap: "10px"}}>
                            <div className="resource-row"><FileText size={16}/> Class_Notes_Physics.pdf</div>
                            <div className="resource-row"><FileText size={16}/> Assignment_04.docx</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .btn-live { border: none; padding: 10px 24px; border-radius: 50px; color: white; fontWeight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .control-btn { width: 45px; height: 45px; borderRadius: 50%; border: none; background: #374151; color: white; display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: 0.2s; }
                .control-btn:hover { background: #4b5563; }
                .control-btn.bg-red { background: #ef4444; }
                .platform-row { display: flex; alignItems: center; gap: 12px; padding: 12px; background: #111827; borderRadius: 12px; font-weight: 600; cursor: pointer; }
                .resource-row { display: flex; alignItems: center; gap: 10px; color: #9ca3af; font-size: 0.9rem; padding: 8px 0; border-bottom: 1px solid #374151; }
            `}</style>
        </div>
    </div>
  );
}"""

# --- WRITE TO FILE WITH UTF-8 ENCODING ---
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("âœ… SUCCESS: VirtualSpace.jsx fixed!")
