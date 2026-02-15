# import os

# # --- PATH SETUP ---
# BASE_DIR = os.getcwd()
# TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Locations.jsx")

# if not os.path.exists(TARGET_FILE):
#     TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Locations.jsx")

# print(f"ðŸš€ Applying Ultra Waoo UI & Fixing Clicks in: {TARGET_FILE}")

# code_content = r"""import React, { useState, useEffect } from "react";
# import SidebarModern from "../components/SidebarModern";
# import { MapPin, Globe, Navigation, Search, MoreHorizontal, Plus, RefreshCw, Server, Zap, Compass } from "lucide-react";
# import toast, { Toaster } from 'react-hot-toast';
# import axios from 'axios';

# export default function Locations() {
#   const [selectedContinent, setSelectedContinent] = useState("");
#   const [selectedCountry, setSelectedCountry] = useState("");
#   const [loading, setLoading] = useState(true);
#   const [centers, setCenters] = useState([]);
#   const [locationsDB, setLocationsDB] = useState([]);

#   const API_BASE = "http://127.0.0.1:8000/api";

#   useEffect(() => {
#       fetchGlobalData();
#   }, []);

#   const fetchGlobalData = async () => {
#       setLoading(true);
#       try {
#           const schoolsRes = await axios.get(`${API_BASE}/institutions/`);
#           setCenters(schoolsRes.data);
#           const locRes = await axios.get(`${API_BASE}/locations/`);
#           setLocationsDB(locRes.data);
#           toast.success("Coordinates Synced! âœ¨");
#       } catch (error) {
#           toast.error("Database Connection Lost!");
#       } finally {
#           setLoading(false);
#       }
#   };

#   const countries = [...new Set(locationsDB.map(l => l.country))];
#   const availableStates = locationsDB.filter(l => l.country === selectedCountry).map(l => l.state);

#   const handleAddCenter = () => {
#       console.log("Add Center Clicked!");
#       toast("Launching Center Creator...", { icon: 'ðŸš€' });
#   };

#   return (
#     <div className="locations-wrapper">
#         <SidebarModern />
#         <div className="main-viewport">
#             <Toaster position="top-right" />
            
#             {/* --- HEADER --- */}
#             <header className="waoo-header slide-down">
#                 <div className="title-section">
#                     <div className="icon-glow"><Compass size={32} color="#3b82f6"/></div>
#                     <div>
#                         <h1 className="main-title">Global Locations</h1>
#                         <p className="sub-title">Monitoring physical nodes across the grid.</p>
#                     </div>
#                 </div>
#                 <div className="live-badge pulse-neon">
#                     <Zap size={14} fill="#10b981"/> 
#                     <span>DATABASE LIVE</span>
#                 </div>
#             </header>

#             {/* --- TOP CONTROL PANEL --- */}
#             <div className="waoo-grid-top">
#                 <div className="control-card slide-up-stagger">
#                     <div className="input-row">
#                         <div className="field">
#                             <label>CONTINENT</label>
#                             <select className="waoo-select" value={selectedContinent} onChange={(e) => setSelectedContinent(e.target.value)}>
#                                 <option value="">Global Reach</option>
#                                 <option value="Asia">Asia</option>
#                                 <option value="Europe">Europe</option>
#                                 <option value="North America">North America</option>
#                             </select>
#                         </div>
#                         <div className="field">
#                             <label>COUNTRY</label>
#                             <select className="waoo-select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
#                                 <option value="">All Regions</option>
#                                 {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
#                             </select>
#                         </div>
#                     </div>
#                 </div>

#                 <div className="vid-neon-card slide-up-stagger-2">
#                     <div className="vid-inner">
#                         <span className="vid-tag">VIRTUAL COORDINATES</span>
#                         <h2 className="vid-val text-glitch">VID-GLOB-2026</h2>
#                         <div className="vid-footer">
#                             <span>LAT: 28.61Â° N</span>
#                             <span>LONG: 77.20Â° E</span>
#                         </div>
#                     </div>
#                 </div>
#             </div>

#             {/* --- LIST SECTION --- */}
#             <div className="list-card slide-up-stagger-3">
#                 <div className="list-nav">
#                     <div className="list-meta">
#                         <h3>Regional Centers ({centers.length})</h3>
#                         <button onClick={fetchGlobalData} className="refresh-btn rotate-hover"><RefreshCw size={18}/></button>
#                     </div>
#                     {/* FIXED BUTTON: Higher Z-Index and Pointer Events */}
#                     <button onClick={handleAddCenter} className="waoo-add-btn">
#                         <Plus size={20}/> Add Center
#                     </button>
#                 </div>
                
#                 <div className="table-flow">
#                     <table className="waoo-table">
#                         <thead>
#                             <tr>
#                                 <th>#</th>
#                                 <th>NAME</th>
#                                 <th>COORDINATES</th>
#                                 <th>SECURE EMAIL</th>
#                                 <th>STATUS</th>
#                                 <th>OP</th>
#                             </tr>
#                         </thead>
#                         <tbody>
#                             {centers.map((center, i) => (
#                                 <tr key={center.id} className="waoo-row" style={{animationDelay: `${i * 0.1}s`}}>
#                                     <td className="row-num">{i + 1}</td>
#                                     <td className="center-name">{center.name}</td>
#                                     <td className="center-addr">{center.address || "Main Grid"}</td>
#                                     <td className="center-mail">{center.contact_email}</td>
#                                     <td>
#                                         <div className="status-chip active">
#                                             <span className="glow-dot"></span> Online
#                                         </div>
#                                     </td>
#                                     <td>
#                                         <button className="row-opt"><MoreHorizontal size={20}/></button>
#                                     </td>
#                                 </tr>
#                             ))}
#                         </tbody>
#                     </table>
#                 </div>
#             </div>
#         </div>

#         <style>{`
#             @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

#             .locations-wrapper { 
#                 display: flex; background: #fdfdfd; min-height: 100vh; 
#                 font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden;
#             }
#             .main-viewport { flex: 1; padding: 40px; margin-left: 280px; position: relative; z-index: 1; }

#             /* --- ANIMATIONS --- */
#             @keyframes slideInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
#             @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
#             @keyframes neonPulse { 0% { box-shadow: 0 0 5px #10b981; } 50% { box-shadow: 0 0 15px #10b981; } 100% { box-shadow: 0 0 5px #10b981; } }
#             @keyframes rowEntry { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }

#             .slide-down { animation: slideInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
#             .slide-up-stagger { animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
#             .slide-up-stagger-2 { animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
#             .slide-up-stagger-3 { animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }

#             /* --- HEADER --- */
#             .waoo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
#             .title-section { display: flex; gap: 20px; align-items: center; }
#             .icon-glow { background: #eff6ff; padding: 12px; border-radius: 16px; box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.2); }
#             .main-title { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -1px; }
#             .sub-title { color: #64748b; margin-top: 5px; font-weight: 500; }
#             .live-badge { 
#                 background: #f0fdf4; color: #15803d; padding: 8px 16px; border-radius: 30px; 
#                 display: flex; gap: 8px; align-items: center; font-weight: 800; font-size: 0.75rem;
#                 border: 1px solid #bbf7d0; animation: neonPulse 2s infinite;
#             }

#             /* --- TOP GRID --- */
#             .waoo-grid-top { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; margin-bottom: 30px; }
#             .control-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
#             .input-row { display: flex; gap: 20px; }
#             .field { flex: 1; display: flex; flex-direction: column; gap: 10px; }
#             .field label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; }
#             .waoo-select { 
#                 padding: 14px; border-radius: 12px; border: 2px solid #f1f5f9; 
#                 background: #f8fafc; color: #1e293b; font-weight: 600; cursor: pointer;
#                 transition: 0.3s;
#             }
#             .waoo-select:hover { border-color: #3b82f6; background: white; }

#             .vid-neon-card { 
#                 background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
#                 border-radius: 24px; padding: 2px; position: relative; overflow: hidden;
#             }
#             .vid-inner { background: #0f172a; height: 100%; border-radius: 22px; padding: 25px; display: flex; flex-direction: column; justify-content: center; }
#             .vid-tag { color: #3b82f6; font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; }
#             .vid-val { color: white; margin: 10px 0; font-size: 1.8rem; font-weight: 900; }
#             .vid-footer { display: flex; justify-content: space-between; color: #475569; font-size: 0.75rem; font-weight: 700; border-top: 1px solid #1e293b; padding-top: 10px; }

#             /* --- LIST & TABLE --- */
#             .list-card { background: white; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
#             .list-nav { padding: 25px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
#             .list-meta { display: flex; align-items: center; gap: 15px; }
#             .list-meta h3 { margin: 0; font-weight: 800; color: #1e293b; }
            
#             /* ADD BUTTON FIX */
#             .waoo-add-btn { 
#                 background: #3b82f6; color: white; border: none; padding: 14px 28px; 
#                 border-radius: 14px; font-weight: 800; display: flex; align-items: center; gap: 10px;
#                 cursor: pointer !important; position: relative; z-index: 999; 
#                 transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
#                 box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
#                 pointer-events: auto !important;
#             }
#             .waoo-add-btn:hover { transform: scale(1.05) translateY(-3px); box-shadow: 0 20px 30px -10px rgba(59, 130, 246, 0.6); background: #2563eb; }
#             .waoo-add-btn:active { transform: scale(0.95); }

#             .waoo-table { width: 100%; border-collapse: collapse; }
#             .waoo-table th { text-align: left; padding: 20px 30px; background: #fcfcfc; color: #94a3b8; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; }
#             .waoo-row { border-bottom: 1px solid #f8fafc; transition: 0.3s; opacity: 0; animation: rowEntry 0.5s ease-out forwards; }
#             .waoo-row:hover { background: #f1f5f9; transform: scale(1.005); }
            
#             .row-num { color: #cbd5e1; font-weight: 800; padding-left: 30px; }
#             .center-name { font-weight: 800; color: #1e293b; font-size: 1rem; }
#             .center-addr { color: #64748b; font-size: 0.9rem; }
#             .center-mail { color: #3b82f6; font-weight: 600; font-size: 0.85rem; }

#             .status-chip { display: flex; align-items: center; gap: 8px; width: fit-content; padding: 6px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; }
#             .status-chip.active { background: #dcfce7; color: #166534; }
#             .glow-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; }

#             .row-opt { background: transparent; border: none; color: #cbd5e1; cursor: pointer; transition: 0.2s; }
#             .row-opt:hover { color: #1e293b; transform: scale(1.2); }

#             .rotate-hover:hover { animation: rotate 1s linear infinite; }
#             @keyframes rotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }
#         `}</style>
#     </div>
#   );
# }"""

# with open(TARGET_FILE, "w", encoding="utf-8") as f:
#     f.write(code_content)

# print("✅ SUCCESS: Locations Page is now Ultra Waoo! Check the Add Center button now.")
