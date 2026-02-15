# import os

# # --- PATH SETUP ---
# BASE_DIR = os.getcwd()
# TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Locations.jsx")

# if not os.path.exists(TARGET_FILE):
#     TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Locations.jsx")

# print(f"ðŸ”§ Connecting Locations Page to Live Database: {TARGET_FILE}")

# code_content = r"""import React, { useState, useEffect } from "react";
# import SidebarModern from "../components/SidebarModern";
# import { MapPin, Globe, Navigation, Search, MoreHorizontal, Plus, RefreshCw, Server } from "lucide-react";
# import toast, { Toaster } from 'react-hot-toast';
# import axios from 'axios';

# export default function Locations() {
#   const [selectedContinent, setSelectedContinent] = useState("");
#   const [selectedCountry, setSelectedCountry] = useState("");
#   const [loading, setLoading] = useState(true);
  
#   // --- REAL DATA STATE ---
#   const [centers, setCenters] = useState([]);
#   const [locationsDB, setLocationsDB] = useState([]);

#   // --- API ENDPOINTS ---
#   const API_BASE = "http://127.0.0.1:8000/api";

#   useEffect(() => {
#       fetchGlobalData();
#   }, []);

#   const fetchGlobalData = async () => {
#       setLoading(true);
#       try {
#           // 1. Fetch Schools (Centers)
#           const schoolsRes = await axios.get(`${API_BASE}/institutions/`);
#           setCenters(schoolsRes.data);

#           // 2. Fetch Locations (For Dropdowns)
#           const locRes = await axios.get(`${API_BASE}/locations/`);
#           setLocationsDB(locRes.data);
          
#           toast.success("Sync Complete: Locations & Centers loaded!");
#       } catch (error) {
#           console.error("API Error:", error);
#           toast.error("Failed to connect to Global Database");
#       } finally {
#           setLoading(false);
#       }
#   };

#   // Extract Unique Countries for Dropdown
#   const countries = [...new Set(locationsDB.map(l => l.country))];
  
#   // Filter States based on selected Country
#   const availableStates = locationsDB
#       .filter(l => l.country === selectedCountry)
#       .map(l => l.state);

#   return (
#     <div className="locations-container">
#         <SidebarModern />
#         <div className="main-content">
#             <Toaster position="top-center" />
            
#             <header className="page-header">
#                 <div>
#                     <h1 className="page-title">Global Locations</h1>
#                     <p className="page-subtitle">Manage physical centers & virtual coordinates.</p>
#                 </div>
#                 <div className="status-badge">
#                     <Server size={14} color="#10b981"/> 
#                     <span>Live Database Connected</span>
#                 </div>
#             </header>

#             {/* CONTROL PANEL */}
#             <div className="control-panel card shadow-md">
#                 <div className="grid-form">
#                     <div className="input-group">
#                         <label>CONTINENT</label>
#                         <select 
#                             className="custom-select" 
#                             value={selectedContinent} 
#                             onChange={(e) => setSelectedContinent(e.target.value)}
#                         >
#                             <option value="">Select Continent</option>
#                             <option value="Asia">Asia</option>
#                             <option value="Europe">Europe</option>
#                             <option value="North America">North America</option>
#                         </select>
#                     </div>

#                     <div className="input-group">
#                         <label>COUNTRY ({countries.length})</label>
#                         <select 
#                             className="custom-select" 
#                             value={selectedCountry}
#                             onChange={(e) => setSelectedCountry(e.target.value)}
#                         >
#                             <option value="">All Countries</option>
#                             {countries.map((c, i) => (
#                                 <option key={i} value={c}>{c}</option>
#                             ))}
#                         </select>
#                     </div>

#                     <div className="input-group">
#                         <label>STATE / PROVINCE</label>
#                         <select className="custom-select" disabled={!selectedCountry}>
#                             <option>Select State</option>
#                             {availableStates.map((s, i) => (
#                                 <option key={i} value={s}>{s}</option>
#                             ))}
#                         </select>
#                     </div>
#                 </div>

#                 {/* VIRTUAL ID CARD (Right Side) */}
#                 <div className="virtual-id-card">
#                     <span className="vid-label">VIRTUAL ID</span>
#                     <h2 className="vid-code">VID-GLOB-2026</h2>
#                     <div className="coords">
#                         <span>Lat: 28.6139</span>
#                         <span>Long: 77.2090</span>
#                     </div>
#                 </div>
#             </div>

#             {/* TABLE SECTION */}
#             <div className="locations-list card shadow-md">
#                 <div className="list-header">
#                     <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
#                         <h3>Active Centers ({centers.length})</h3>
#                         <button onClick={fetchGlobalData} className="icon-btn" title="Refresh"><RefreshCw size={16}/></button>
#                     </div>
#                     <button className="btn-add"><Plus size={18}/> Add Center</button>
#                 </div>
                
#                 {loading ? (
#                     <div style={{padding:'40px', textAlign:'center', color:'#64748b'}}>Loading Global Data...</div>
#                 ) : (
#                     <table className="modern-table">
#                         <thead>
#                             <tr>
#                                 <th style={{width: '50px'}}></th>
#                                 <th>S.NO</th>
#                                 <th>CENTER NAME</th>
#                                 <th>ADDRESS / CITY</th>
#                                 <th>CONTACT</th>
#                                 <th>STATUS</th>
#                                 <th>ACTION</th>
#                             </tr>
#                         </thead>
#                         <tbody>
#                             {centers.map((center, i) => (
#                                 <tr key={center.id} className="table-row">
#                                     <td><input type="checkbox" className="row-checkbox" /></td>
#                                     <td>{i + 1}</td>
#                                     <td style={{fontWeight: 600, color:'#1e293b'}}>{center.name}</td>
#                                     <td style={{maxWidth:'200px', fontSize:'0.9rem'}} className="truncate">{center.address || "N/A"}</td>
#                                     <td style={{color:'#3b82f6'}}>{center.contact_email}</td>
#                                     <td>
#                                         <span className="status-indicator active">
#                                             <span className="dot"></span> Active
#                                         </span>
#                                     </td>
#                                     <td>
#                                         <button className="icon-btn"><MoreHorizontal size={18}/></button>
#                                     </td>
#                                 </tr>
#                             ))}
#                             {centers.length === 0 && (
#                                 <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>No Centers Found in DB</td></tr>
#                             )}
#                         </tbody>
#                     </table>
#                 )}
#             </div>
#         </div>

#         <style>{`
#             :root {
#                 --primary: #3b82f6;
#                 --bg-body: #f8fafc;
#                 --text-main: #1e293b;
#                 --border: #e2e8f0;
#             }
#             .locations-container { display: flex; background: var(--bg-body); min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-main); }
#             .main-content { flex: 1; padding: 30px; marginLeft: 280px; }
            
#             .page-header { margin-bottom: 25px; display:flex; justify-content:space-between; align-items:center; }
#             .page-title { font-size: 2rem; font-weight: 800; margin: 0; color: var(--text-main); }
#             .page-subtitle { color: #64748b; margin: 5px 0 0; }
#             .status-badge { background:#dcfce7; color:#166534; padding:5px 12px; border-radius:20px; font-size:0.8rem; font-weight:700; display:flex; gap:6px; align-items:center; }

#             /* CARD & SHADOWS */
#             .card { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
#             .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

#             /* CONTROL PANEL GRID */
#             .control-panel { padding: 25px; display: flex; gap: 30px; justify-content: space-between; align-items: center; margin-bottom: 25px; }
#             .grid-form { display: flex; gap: 20px; flex: 1; }
            
#             .input-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
#             .input-group label { font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
            
#             /* FIXED DROPDOWN STYLES */
#             .custom-select {
#                 padding: 12px;
#                 border: 1px solid #cbd5e1;
#                 border-radius: 8px;
#                 background-color: white !important;
#                 color: #1e293b !important;
#                 font-size: 0.95rem;
#                 cursor: pointer;
#                 outline: none;
#                 transition: 0.2s;
#             }
#             .custom-select:hover { border-color: var(--primary); }
            
#             /* VIRTUAL ID CARD */
#             .virtual-id-card { 
#                 background: #eff6ff; border: 1px dashed #bfdbfe; 
#                 padding: 15px 25px; border-radius: 12px; 
#                 text-align: right; min-width: 200px;
#             }
#             .vid-label { font-size: 0.7rem; font-weight: 700; color: #3b82f6; display: block; margin-bottom: 5px; }
#             .vid-code { margin: 0; font-size: 1.4rem; color: #1e40af; letter-spacing: 1px; }
#             .coords { font-size: 0.8rem; color: #60a5fa; margin-top: 5px; display: flex; gap: 10px; justify-content: flex-end; }

#             /* TABLE STYLES */
#             .locations-list { padding: 0; }
#             .list-header { padding: 20px 25px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
#             .list-header h3 { margin: 0; font-size: 1.1rem; }

#             .modern-table { width: 100%; border-collapse: collapse; }
#             .modern-table th { text-align: left; padding: 15px 25px; color: #64748b; font-size: 0.85rem; background: #f8fafc; border-bottom: 1px solid var(--border); }
#             .modern-table td { padding: 15px 25px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: var(--text-main); }
#             .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            
#             .row-checkbox { width: 18px; height: 18px; cursor: pointer; }
            
#             .status-indicator { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; }
#             .dot { width: 8px; height: 8px; border-radius: 50%; }
#             .active .dot { background: #10b981; box-shadow: 0 0 0 3px #d1fae5; }
#             .active { color: #047857; }

#             /* BUTTONS */
#             .btn-add { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
#             .btn-add:hover { background: #2563eb; transform: translateY(-2px); }

#             .icon-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 5px; border-radius: 5px; transition: 0.2s; }
#             .icon-btn:hover { background: #f1f5f9; color: var(--text-main); }
#         `}</style>
#     </div>
#   );
# }"""

# with open(TARGET_FILE, "w", encoding="utf-8") as f:
#     f.write(code_content)

# print("✅ SUCCESS: Locations Page Connected to DB!")
