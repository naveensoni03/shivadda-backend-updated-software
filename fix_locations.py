# import os

# # --- PATH SETUP ---
# BASE_DIR = os.getcwd()
# TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Locations.jsx")

# if not os.path.exists(TARGET_FILE):
#     TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Locations.jsx")

# print(f"ðŸ”§ Fixing Global Locations UI (Dropdowns & Clicks): {TARGET_FILE}")

# code_content = r"""import React, { useState } from "react";
# import SidebarModern from "../components/SidebarModern";
# import { MapPin, Globe, Navigation, Search, MoreHorizontal, Plus } from "lucide-react";
# import toast, { Toaster } from 'react-hot-toast';

# export default function Locations() {
#   const [selectedContinent, setSelectedContinent] = useState("");
#   const [selectedCountry, setSelectedCountry] = useState("");
  
#   // Dummy Data
#   const locations = [
#       { id: 1, name: "Shivadda HQ", city: "New Delhi", type: "Head Office", status: "Active", lat: "28.61", long: "77.20" },
#       { id: 2, name: "Tech Campus", city: "Bangalore", type: "Branch", status: "Active", lat: "12.97", long: "77.59" },
#       { id: 3, name: "North Hub", city: "Chandigarh", type: "Regional", status: "Inactive", lat: "30.73", long: "76.77" }
#   ];

#   const handleDropdownChange = (e, setter) => {
#       setter(e.target.value);
#       toast.success(`Selected: ${e.target.value}`);
#   };

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
#             </header>

#             {/* CONTROL PANEL */}
#             <div className="control-panel card shadow-md">
#                 <div className="grid-form">
#                     <div className="input-group">
#                         <label>CONTINENT</label>
#                         <select 
#                             className="custom-select" 
#                             value={selectedContinent} 
#                             onChange={(e) => handleDropdownChange(e, setSelectedContinent)}
#                         >
#                             <option value="" disabled>Select Continent</option>
#                             <option value="Asia">Asia</option>
#                             <option value="Europe">Europe</option>
#                             <option value="North America">North America</option>
#                         </select>
#                     </div>

#                     <div className="input-group">
#                         <label>COUNTRY</label>
#                         <select 
#                             className="custom-select" 
#                             value={selectedCountry}
#                             onChange={(e) => handleDropdownChange(e, setSelectedCountry)}
#                         >
#                             <option value="" disabled>Select Country</option>
#                             <option value="India">India</option>
#                             <option value="USA">USA</option>
#                             <option value="UK">UK</option>
#                         </select>
#                     </div>

#                     <div className="input-group">
#                         <label>STATE / PROVINCE</label>
#                         <select className="custom-select">
#                             <option>Delhi</option>
#                             <option>Karnataka</option>
#                             <option>Maharashtra</option>
#                         </select>
#                     </div>
#                 </div>

#                 {/* VIRTUAL ID CARD (Right Side) */}
#                 <div className="virtual-id-card">
#                     <span className="vid-label">VIRTUAL ID</span>
#                     <h2 className="vid-code">VID-XXX-1082</h2>
#                     <div className="coords">
#                         <span>Lat: 28.6139</span>
#                         <span>Long: 77.2090</span>
#                     </div>
#                 </div>
#             </div>

#             {/* TABLE SECTION */}
#             <div className="locations-list card shadow-md">
#                 <div className="list-header">
#                     <h3>Active Centers</h3>
#                     <button className="btn-add"><Plus size={18}/> Add Center</button>
#                 </div>
                
#                 <table className="modern-table">
#                     <thead>
#                         <tr>
#                             <th style={{width: '50px'}}></th>
#                             <th>S.NO</th>
#                             <th>CENTER NAME</th>
#                             <th>CITY</th>
#                             <th>TYPE</th>
#                             <th>STATUS</th>
#                             <th>ACTION</th>
#                         </tr>
#                     </thead>
#                     <tbody>
#                         {locations.map((loc, i) => (
#                             <tr key={loc.id} className="table-row">
#                                 <td><input type="checkbox" className="row-checkbox" /></td>
#                                 <td>{i + 1}</td>
#                                 <td style={{fontWeight: 600}}>{loc.name}</td>
#                                 <td>{loc.city}</td>
#                                 <td><span className="badge type">{loc.type}</span></td>
#                                 <td>
#                                     <span className={`status-indicator ${loc.status.toLowerCase()}`}>
#                                         <span className="dot"></span> {loc.status}
#                                     </span>
#                                 </td>
#                                 <td>
#                                     <button className="icon-btn"><MoreHorizontal size={18}/></button>
#                                 </td>
#                             </tr>
#                         ))}
#                     </tbody>
#                 </table>
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
            
#             .page-header { margin-bottom: 25px; }
#             .page-title { font-size: 2rem; font-weight: 800; margin: 0; color: var(--text-main); }
#             .page-subtitle { color: #64748b; margin: 5px 0 0; }

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
#                 background-color: white !important; /* Force White */
#                 color: #1e293b !important; /* Force Black Text */
#                 font-size: 0.95rem;
#                 cursor: pointer;
#                 outline: none;
#                 transition: 0.2s;
#                 appearance: auto; /* Uses default OS dropdown arrow which is reliable */
#             }
#             .custom-select:hover { border-color: var(--primary); }
#             .custom-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            
#             /* DROPDOWN OPTIONS (Specific for some browsers) */
#             option { background: white; color: #1e293b; padding: 10px; }

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
            
#             .row-checkbox { width: 18px; height: 18px; cursor: pointer; }
            
#             /* BADGES & STATUS */
#             .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; background: #f1f5f9; color: #475569; }
            
#             .status-indicator { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; }
#             .dot { width: 8px; height: 8px; border-radius: 50%; }
            
#             .active .dot { background: #10b981; box-shadow: 0 0 0 3px #d1fae5; }
#             .active { color: #047857; }
            
#             .inactive .dot { background: #ef4444; box-shadow: 0 0 0 3px #fee2e2; }
#             .inactive { color: #b91c1c; }

#             /* BUTTONS */
#             .btn-add { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
#             .btn-add:hover { background: #2563eb; transform: translateY(-2px); }

#             .icon-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 5px; border-radius: 5px; transition: 0.2s; }
#             .icon-btn:hover { background: #f1f5f9; color: var(--text-main); }

#             /* Z-INDEX FIX FOR CLICKS */
#             .main-content { position: relative; z-index: 1; }
#             .custom-select, button, input { position: relative; z-index: 10; }
#         `}</style>
#     </div>
#   );
# }"""

# with open(TARGET_FILE, "w", encoding="utf-8") as f:
#     f.write(code_content)

# print("✅ SUCCESS: Locations Page Fixed! (White Dropdowns, Clickable Buttons, Clean Status Icons)")
