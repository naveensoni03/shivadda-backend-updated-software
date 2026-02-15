# -*- coding: utf-8 -*-
import os

# --- CONFIGURATION ---
BASE_DIR = os.getcwd()
COMPONENTS_DIR = os.path.join(BASE_DIR, "frontend", "src", "components")
PAGES_DIR = os.path.join(BASE_DIR, "frontend", "src", "pages")

# Ensure directories exist
os.makedirs(COMPONENTS_DIR, exist_ok=True)
os.makedirs(PAGES_DIR, exist_ok=True)

print("ðŸ”§ Installing Remaining Features...")

# ==============================
# 1. WEATHER WIDGET (Req 0)
# ==============================
weather_code = r"""import React from "react";
import { CloudSun, MapPin } from "lucide-react";

export default function WeatherWidget() {
  return (
    <div style={{background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", padding: "20px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)", marginBottom: "25px"}}>
        <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
            <CloudSun size={40} strokeWidth={1.5} />
            <div>
                <h2 style={{margin: 0, fontSize: "1.8rem", fontWeight: "800"}}>24Â°C</h2>
                <p style={{margin: 0, opacity: 0.9, fontSize: "0.9rem"}}>Partly Cloudy</p>
            </div>
        </div>
        <div style={{textAlign: "right"}}>
            <div style={{display: "flex", alignItems: "center", gap: "5px", opacity: 0.8, fontSize: "0.85rem", justifyContent: "flex-end"}}>
                <MapPin size={14} /> New Delhi, IN
            </div>
            <div style={{fontSize: "0.75rem", opacity: 0.6, marginTop: "4px"}}>H: 28Â° L: 19Â°</div>
        </div>
    </div>
  );
}"""

with open(os.path.join(COMPONENTS_DIR, "WeatherWidget.jsx"), "w", encoding="utf-8") as f:
    f.write(weather_code)
print("âœ… Created: WeatherWidget.jsx")

# ==============================
# 2. SMART TABLE (Req 2)
# ==============================
table_code = r"""import React, { useState } from "react";
import { Trash2, CheckSquare, MoreHorizontal, Filter } from "lucide-react";

export default function SmartTable({ columns, data, title, onBulkAction }) {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    if(selected.includes(id)) setSelected(selected.filter(i => i !== id));
    else setSelected([...selected, id]);
  };

  const toggleAll = () => {
    if(selected.length === data.length) setSelected([]);
    else setSelected(data.map(d => d.id));
  };

  return (
    <div style={{background: "white", borderRadius: "20px", padding: "25px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"}}>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center"}}>
            <h3 style={{margin: 0, color: "#1e293b", fontSize: "1.1rem", fontWeight: "800"}}>{title}</h3>
            {selected.length > 0 && (
                <div style={{display: "flex", gap: "10px"}}>
                    <button onClick={() => onBulkAction('delete', selected)} style={{background: "#fef2f2", color: "#ef4444", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"}}><Trash2 size={16}/> Delete ({selected.length})</button>
                </div>
            )}
        </div>
        <table style={{width: "100%", borderCollapse: "collapse"}}>
            <thead>
                <tr style={{borderBottom: "2px solid #f1f5f9"}}>
                    <th style={{padding: "15px", width: "40px"}}><input type="checkbox" checked={selected.length === data.length && data.length > 0} onChange={toggleAll} style={{cursor: "pointer", width: "16px", height: "16px"}} /></th>
                    <th style={{padding: "15px", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase"}}>S.No</th>
                    {columns.map((col, i) => <th key={i} style={{padding: "15px", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase"}}>{col.header}</th>)}
                    <th style={{padding: "15px", textAlign: "right"}}>Action</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={row.id} style={{borderBottom: "1px solid #f8fafc"}}>
                        <td style={{padding: "15px"}}><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} style={{cursor: "pointer", width: "16px", height: "16px"}} /></td>
                        <td style={{padding: "15px", color: "#94a3b8", fontWeight: "600", fontSize: "0.9rem"}}>{idx + 1}</td>
                        {columns.map((col, cIdx) => (
                            <td key={cIdx} style={{padding: "15px", color: "#334155", fontWeight: "500", fontSize: "0.9rem"}}>
                                {col.render ? col.render(row) : row[col.field]}
                            </td>
                        ))}
                        <td style={{padding: "15px", textAlign: "right"}}><button style={{background: "none", border: "none", cursor: "pointer", color: "#94a3b8"}}><MoreHorizontal size={18}/></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}"""

with open(os.path.join(COMPONENTS_DIR, "SmartTable.jsx"), "w", encoding="utf-8") as f:
    f.write(table_code)
print("âœ… Created: SmartTable.jsx")

# ==============================
# 3. LOCATIONS PAGE (Req 1)
# ==============================
loc_code = r"""import React, { useState } from "react";
import SidebarModern from "../components/SidebarModern";
import SmartTable from "../components/SmartTable";
import { Globe, MapPin, Navigation } from "lucide-react";

export default function Locations() {
  const [region, setRegion] = useState({ continent: "", country: "", state: "" });
  
  const virtualID = `VID-${region.country.slice(0,3).toUpperCase() || 'XXX'}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div style={{display: "flex", background: "#f8fafc", minHeight: "100vh"}}>
        <SidebarModern />
        <div style={{flex: 1, padding: "40px", marginLeft: "280px"}}>
            <h1 style={{fontSize: "2rem", fontWeight: "800", color: "#1e293b", marginBottom: "30px"}}>Global Locations</h1>
            
            {/* Req 1: Dropdowns & Virtual ID */}
            <div style={{background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "30px", display: "flex", gap: "30px", alignItems: "center"}}>
                <div style={{flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px"}}>
                    <div>
                        <label style={{display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#64748b", marginBottom: "8px"}}>CONTINENT</label>
                        <select className="modern-select" onChange={e => setRegion({...region, continent: e.target.value})}>
                            <option>Asia</option><option>Europe</option><option>North America</option>
                        </select>
                    </div>
                    <div>
                        <label style={{display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#64748b", marginBottom: "8px"}}>COUNTRY</label>
                        <select className="modern-select" onChange={e => setRegion({...region, country: e.target.value})}>
                            <option value="">Select...</option><option value="India">India</option><option value="USA">USA</option><option value="UK">UK</option>
                        </select>
                    </div>
                    <div>
                        <label style={{display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#64748b", marginBottom: "8px"}}>STATE / PROVINCE</label>
                        <select className="modern-select">
                            <option>Delhi</option><option>Maharashtra</option><option>California</option>
                        </select>
                    </div>
                </div>
                
                <div style={{background: "#eff6ff", padding: "20px", borderRadius: "16px", border: "1px dashed #bfdbfe", minWidth: "250px"}}>
                    <div style={{fontSize: "0.75rem", fontWeight: "800", color: "#3b82f6", letterSpacing: "1px", marginBottom: "5px"}}>VIRTUAL ID</div>
                    <div style={{fontSize: "1.5rem", fontWeight: "900", color: "#1e40af", fontFamily: "monospace"}}>{virtualID}</div>
                    <div style={{display: "flex", gap: "10px", marginTop: "10px", fontSize: "0.8rem", color: "#60a5fa"}}>
                        <span>Lat: 28.6139</span><span>Long: 77.2090</span>
                    </div>
                </div>
            </div>

            {/* Req 2: Smart Table */}
            <SmartTable 
                title="Active Centers"
                columns={[
                    {header: "Center Name", field: "name"},
                    {header: "City", field: "city"},
                    {header: "Type", field: "type"},
                    {header: "Status", field: "status", render: row => <span style={{color: row.status==='Active'?'#16a34a':'#ef4444', fontWeight:'700'}}>â— {row.status}</span>}
                ]}
                data={[
                    {id: 1, name: "Shivadda HQ", city: "New Delhi", type: "Head Office", status: "Active"},
                    {id: 2, name: "Tech Campus", city: "Bangalore", type: "Branch", status: "Active"},
                ]}
                onBulkAction={(action) => alert(action)}
            />

            <style>{`
                .modern-select { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-weight: 600; color: #334155; }
            `}</style>
        </div>
    </div>
  );
}"""

with open(os.path.join(PAGES_DIR, "Locations.jsx"), "w", encoding="utf-8") as f:
    f.write(loc_code)
print("âœ… Created: Locations.jsx")

# ==============================
# 4. VIRTUAL SPACE (Req 4, 7)
# ==============================
virt_code = r"""import React from "react";
import SidebarModern from "../components/SidebarModern";
import { Video, Mic, Monitor, Share2, Youtube, FileText } from "lucide-react";

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

                {/* Right Panel: Integrations (Req 7) */}
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
                        <h3 style={{margin: "0 0 15px 0", fontSize: "1.1rem"}}>Resources (Req 8)</h3>
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

with open(os.path.join(PAGES_DIR, "VirtualSpace.jsx"), "w", encoding="utf-8") as f:
    f.write(virt_code)
print("âœ… Created: VirtualSpace.jsx")

print("\n🚀 SUCCESS: All requested features (Weather, Locations, SmartTable, LiveClass) installed!")
