# import os

# # --- PATH SETUP ---
# BASE_DIR = os.getcwd()
# TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Locations.jsx")

# if not os.path.exists(TARGET_FILE):
#     TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Locations.jsx")

# print(f"🚀 Restoring State option & Adding Pagination in: {TARGET_FILE}")

# code_content = r"""import React, { useState, useEffect } from "react";
# import SidebarModern from "../components/SidebarModern";
# import { Globe, Plus, RefreshCw, Server, MoreHorizontal, ChevronLeft, ChevronRight, Zap } from "lucide-react";
# import toast, { Toaster } from 'react-hot-toast';
# import axios from 'axios';

# export default function Locations() {
#   const [selectedContinent, setSelectedContinent] = useState("");
#   const [selectedCountry, setSelectedCountry] = useState("");
#   const [selectedState, setSelectedState] = useState("");
#   const [loading, setLoading] = useState(true);
#   const [centers, setCenters] = useState([]);
#   const [locationsDB, setLocationsDB] = useState([]);

#   // --- PAGINATION STATE ---
#   const [currentPage, setCurrentPage] = useState(1);
#   const itemsPerPage = 5;

#   const API_BASE = "http://127.0.0.1:8000/api";

#   useEffect(() => {
#       fetchGlobalData();
#   }, []);

#   const fetchGlobalData = async () => {
#       setLoading(true);
#       try {
#           const [schoolsRes, locRes] = await Promise.all([
#               axios.get(`${API_BASE}/institutions/`),
#               axios.get(`${API_BASE}/locations/`)
#           ]);
#           setCenters(schoolsRes.data);
#           setLocationsDB(locRes.data);
#           toast.success("Database Synchronized");
#       } catch (error) {
#           toast.error("Connection Failed");
#       } finally {
#           setLoading(false);
#       }
#   };

#   // Logic for Dropdowns
#   const countries = [...new Set(locationsDB.map(l => l.country))];
#   const states = locationsDB
#       .filter(l => l.country === selectedCountry)
#       .map(l => l.state);

#   // Logic for Pagination
#   const indexOfLastItem = currentPage * itemsPerPage;
#   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
#   const currentItems = centers.slice(indexOfFirstItem, indexOfLastItem);
#   const totalPages = Math.ceil(centers.length / itemsPerPage);

#   const handleAddCenter = () => {
#       toast.success("Opening Center Creator...", {
#           style: { borderRadius: '12px', background: '#0f172a', color: '#fff' }
#       });
#   };

#   return (
#     <div className="waoo-app-container">
#         <SidebarModern />
#         <div className="waoo-view">
#             <Toaster position="top-right" />
            
#             <header className="waoo-hero-head animate-reveal">
#                 <div className="head-info">
#                     <div className="head-badge">NETWORK STATUS: LIVE</div>
#                     <h1 className="hero-title">Global Reach</h1>
#                     <p className="hero-sub">Synchronizing nodes with Shivadda Central Command.</p>
#                 </div>
#                 <div className="head-stats pulse-border">
#                     <Zap size={18} color="#10b981" />
#                     <span>DATA STREAM ACTIVE</span>
#                 </div>
#             </header>

#             <div className="waoo-dashboard">
#                 <div className="glass-card control-deck animate-slide-up">
#                     <div className="deck-header">
#                         <Globe size={18} /> <span>NAVIGATION FILTERS</span>
#                     </div>
#                     <div className="deck-inputs">
#                         <div className="waoo-input-box">
#                             <label>CONTINENT</label>
#                             <select className="premium-select" value={selectedContinent} onChange={(e) => setSelectedContinent(e.target.value)}>
#                                 <option value="">Entire Planet</option>
#                                 <option>Asia</option>
#                                 <option>Europe</option>
#                                 <option>North America</option>
#                             </select>
#                         </div>
#                         <div className="waoo-input-box">
#                             <label>COUNTRY</label>
#                             <select className="premium-select" value={selectedCountry} onChange={(e) => {setSelectedCountry(e.target.value); setSelectedState("");}}>
#                                 <option value="">All Regions</option>
#                                 {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
#                             </select>
#                         </div>
#                         {/* RESTORED STATE OPTION */}
#                         <div className="waoo-input-box">
#                             <label>STATE / PROVINCE</label>
#                             <select className="premium-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry}>
#                                 <option value="">Select State</option>
#                                 {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
#                             </select>
#                         </div>
#                     </div>
#                 </div>

#                 <div className="neon-id-card animate-slide-up delay-1">
#                     <div className="neon-inner">
#                         <div className="neon-tag">VIRTUAL SECTOR ID</div>
#                         <h2 className="neon-code">GLOB-NODE-2026</h2>
#                         <div className="neon-footer">
#                             <div className="coord-box"><span>LAT</span> 28.61</div>
#                             <div className="coord-box"><span>LNG</span> 77.20</div>
#                         </div>
#                     </div>
#                 </div>
#             </div>

#             <div className="waoo-list-section animate-slide-up delay-2">
#                 <div className="list-top">
#                     <div className="list-heading">
#                         <h3>Regional Nodes <span className="node-count">{centers.length}</span></h3>
#                         <button onClick={fetchGlobalData} className="waoo-refresh-btn"><RefreshCw size={16}/></button>
#                     </div>
#                     <button onClick={handleAddCenter} className="waoo-primary-btn">
#                         <Plus size={20}/> <span>ADD CENTER</span>
#                     </button>
#                 </div>

#                 <div className="waoo-table-wrapper">
#                     <table className="waoo-main-table">
#                         <thead>
#                             <tr>
#                                 <th>#</th>
#                                 <th>CENTER IDENTITY</th>
#                                 <th>COORDINATES</th>
#                                 <th>ENCRYPTED EMAIL</th>
#                                 <th>STATUS</th>
#                                 <th>ACTIONS</th>
#                             </tr>
#                         </thead>
#                         <tbody>
#                             {currentItems.map((center, i) => (
#                                 <tr key={center.id} className="waoo-row">
#                                     <td className="row-id">{indexOfFirstItem + i + 1}</td>
#                                     <td className="row-name">{center.name}</td>
#                                     <td className="row-addr">{center.address || "Main Grid Sector"}</td>
#                                     <td className="row-mail">{center.contact_email}</td>
#                                     <td>
#                                         <div className="waoo-status-pill online">
#                                             <span className="dot"></span> ACTIVE
#                                         </div>
#                                     </td>
#                                     <td>
#                                         <button className="row-action-btn"><MoreHorizontal size={20}/></button>
#                                     </td>
#                                 </tr>
#                             ))}
#                         </tbody>
#                     </table>
#                 </div>

#                 {/* PAGINATION UI */}
#                 <div className="waoo-pagination">
#                     <button className="p-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
#                         <ChevronLeft size={18}/>
#                     </button>
#                     <div className="p-info">Page {currentPage} of {totalPages || 1}</div>
#                     <button className="p-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
#                         <ChevronRight size={18}/>
#                     </button>
#                 </div>
#             </div>
#         </div>

#         <style>{`
#             .waoo-app-container { display: flex; background: #f8fafc; min-height: 100vh; }
#             .waoo-view { flex: 1; padding: 40px; margin-left: 280px; }
            
#             .animate-reveal { animation: reveal 0.8s ease-out; }
#             .animate-slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; }
#             .delay-1 { animation-delay: 0.1s; }
#             .delay-2 { animation-delay: 0.2s; }

#             @keyframes reveal { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
#             @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

#             .waoo-hero-head { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
#             .hero-title { font-size: 3rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -2px; }
#             .hero-sub { color: #64748b; font-size: 1.1rem; }
#             .head-badge { background: #dbeafe; color: #3b82f6; padding: 4px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; margin-bottom: 10px; width: fit-content; }
#             .head-stats { background: #f0fdf4; color: #10b981; padding: 12px 20px; border-radius: 16px; display: flex; align-items: center; gap: 10px; font-weight: 800; border: 1px solid #bbf7d0; }

#             .waoo-dashboard { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 40px; }
#             .glass-card { background: white; border-radius: 28px; padding: 30px; border: 1px solid #e2e8f0; }
#             .deck-inputs { display: flex; gap: 20px; }
#             .waoo-input-box { flex: 1; display: flex; flex-direction: column; gap: 8px; }
#             .waoo-input-box label { font-size: 0.7rem; font-weight: 800; color: #64748b; }
#             .premium-select { padding: 14px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f8fafc; font-weight: 700; width: 100%; }

#             .neon-id-card { background: #0f172a; border-radius: 28px; padding: 25px; color: white; }
#             .neon-tag { color: #3b82f6; font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; }
#             .neon-code { font-size: 1.8rem; font-weight: 900; margin: 15px 0; }
#             .neon-footer { display: flex; gap: 20px; color: #475569; font-weight: 800; font-size: 0.8rem; }

#             .waoo-list-section { background: white; border-radius: 32px; border: 1px solid #e2e8f0; overflow: hidden; }
#             .list-top { padding: 30px; display: flex; justify-content: space-between; align-items: center; }
#             .list-heading h3 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0; }
#             .node-count { background: #f1f5f9; padding: 4px 10px; border-radius: 10px; color: #3b82f6; font-size: 0.9rem; margin-left: 10px; }
            
#             .waoo-primary-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 16px 32px; border-radius: 18px; font-weight: 800; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; }
#             .waoo-primary-btn:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(37,99,235,0.4); }

#             .waoo-main-table { width: 100%; border-collapse: collapse; }
#             .waoo-main-table th { text-align: left; padding: 20px 30px; color: #94a3b8; font-size: 0.75rem; font-weight: 800; border-bottom: 1px solid #f1f5f9; }
#             .waoo-row { border-bottom: 1px solid #f8fafc; transition: 0.3s; }
#             .waoo-row:hover { background: #f8fafc; }
#             .row-id { padding-left: 30px; color: #cbd5e1; font-weight: 800; }
#             .row-name { font-weight: 800; color: #0f172a; }
#             .row-mail { color: #3b82f6; font-weight: 700; }

#             .waoo-status-pill { display: flex; align-items: center; gap: 8px; background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; width: fit-content; }
#             .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; }

#             .waoo-pagination { padding: 20px 30px; display: flex; justify-content: flex-end; align-items: center; gap: 20px; background: #fcfcfc; border-top: 1px solid #f1f5f9; }
#             .p-btn { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
#             .p-btn:hover:not(:disabled) { background: #3b82f6; color: white; }
#             .p-btn:disabled { opacity: 0.4; cursor: not-allowed; }
#             .p-info { font-weight: 700; color: #64748b; font-size: 0.9rem; }
#         `}</style>
#     </div>
#   );
# }"""

# with open(TARGET_FILE, "w", encoding="utf-8") as f:
#     f.write(code_content)

# print("✅ FIXED: State option restored & Pagination added! Check it now.")
