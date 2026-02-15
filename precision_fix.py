import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Locations.jsx")

if not os.path.exists(TARGET_FILE):
    TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Locations.jsx")

print(f"🚀 Precision Fixing Logic & Layers in: {TARGET_FILE}")

code_content = r"""import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Globe, Plus, RefreshCw, MoreHorizontal, ChevronLeft, ChevronRight, Zap, Eye, Edit, Trash2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function Locations() {
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState([]);
  const [locationsDB, setLocationsDB] = useState([]);
  const [activeActionMenu, setActiveActionMenu] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_BASE = "http://127.0.0.1:8000/api";

  useEffect(() => {
      fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
      setLoading(true);
      try {
          const [schoolsRes, locRes] = await Promise.all([
              axios.get(`${API_BASE}/institutions/`),
              axios.get(`${API_BASE}/locations/`)
          ]);
          setCenters(schoolsRes.data);
          setLocationsDB(locRes.data);
          toast.success("Sync Complete");
      } catch (error) {
          toast.error("Database Connection Issue");
      } finally {
          setLoading(false);
      }
  };

  const countries = [...new Set(locationsDB.map(l => l.country))];
  const states = locationsDB.filter(l => l.country === selectedCountry).map(l => l.state);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = centers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(centers.length / itemsPerPage);

  const toggleActionMenu = (id) => {
      setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const handleAction = (type, name) => {
      toast.success(`${type}: ${name}`, {
          style: { borderRadius: '10px', background: '#1e293b', color: '#fff', zIndex: 99999 }
      });
      setActiveActionMenu(null);
  };

  return (
    <div className="waoo-app-container">
        <SidebarModern />
        <div className="waoo-view">
            <Toaster position="top-right" />
            
            <header className="waoo-hero-head">
                <div className="head-info">
                    <div className="head-badge">GRID STATUS: SECURE</div>
                    <h1 className="hero-title">Global Reach</h1>
                    <p className="hero-sub">Managing node clusters and physical assets.</p>
                </div>
                <div className="head-stats pulse-border">
                    <Zap size={18} color="#10b981" />
                    <span>NETWORK ACTIVE</span>
                </div>
            </header>

            <div className="waoo-dashboard">
                <div className="glass-card control-deck">
                    <div className="deck-header">NAV FILTERS</div>
                    <div className="deck-inputs">
                        <div className="waoo-input-box">
                            <label>CONTINENT</label>
                            <select className="premium-select" value={selectedContinent} onChange={(e) => setSelectedContinent(e.target.value)}>
                                <option value="">Entire Planet</option>
                                <option>Asia</option>
                                <option>Europe</option>
                                <option>North America</option>
                            </select>
                        </div>
                        <div className="waoo-input-box">
                            <label>COUNTRY</label>
                            <select className="premium-select" value={selectedCountry} onChange={(e) => {setSelectedCountry(e.target.value); setSelectedState("");}}>
                                <option value="">All Regions</option>
                                {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="waoo-input-box">
                            <label>STATE / PROVINCE</label>
                            <select className="premium-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry}>
                                <option value="">Select State</option>
                                {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="neon-id-card">
                    <div className="neon-inner">
                        <div className="neon-tag">VIRTUAL SECTOR</div>
                        <h2 className="neon-code">GLOB-NODE-2026</h2>
                        <div className="neon-footer">
                            <div className="coord">LAT: 28.61</div>
                            <div className="coord">LNG: 77.20</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="waoo-list-section">
                <div className="list-top">
                    <div className="list-heading">
                        <h3>Regional Nodes ({centers.length})</h3>
                        <button onClick={fetchGlobalData} className="waoo-refresh-btn"><RefreshCw size={16}/></button>
                    </div>
                    <button onClick={() => toast.success("Initializing...")} className="waoo-primary-btn">
                        <Plus size={20}/> ADD CENTER
                    </button>
                </div>

                <div className="waoo-table-wrapper">
                    <table className="waoo-main-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>CENTER IDENTITY</th>
                                <th>ADDRESS</th>
                                <th>ENCRYPTED EMAIL</th>
                                <th>STATUS</th>
                                <th style={{textAlign: 'center'}}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((center, i) => (
                                <tr key={center.id} className="waoo-row">
                                    <td className="row-id">{indexOfFirstItem + i + 1}</td>
                                    <td className="row-name">{center.name}</td>
                                    <td className="row-addr">{center.address || "Sector 7"}</td>
                                    <td className="row-mail">{center.contact_email}</td>
                                    <td>
                                        <div className="waoo-status-pill online">
                                            <span className="dot"></span> ACTIVE
                                        </div>
                                    </td>
                                    <td style={{textAlign: 'center', position: 'relative'}}>
                                        <button className="row-action-btn" onClick={(e) => { e.stopPropagation(); toggleActionMenu(center.id); }}>
                                            <MoreHorizontal size={20}/>
                                        </button>
                                        
                                        {activeActionMenu === center.id && (
                                            <div className="action-popup" style={{ display: 'flex' }}>
                                                <button className="action-item" onClick={() => handleAction('View', center.name)}><Eye size={14}/> View</button>
                                                <button className="action-item" onClick={() => handleAction('Edit', center.name)}><Edit size={14}/> Edit</button>
                                                <button className="action-item delete" onClick={() => handleAction('Delete', center.name)}><Trash2 size={14}/> Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION FIX: Added margin and forced visibility --- */}
                <div className="waoo-pagination-container">
                    <div className="p-controls">
                        <button className="p-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            <ChevronLeft size={18}/>
                        </button>
                        <div className="p-info">Page {currentPage} of {totalPages || 1}</div>
                        <button className="p-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                            <ChevronRight size={18}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <style>{`
            .waoo-app-container { display: flex; background: #f8fafc; min-height: 100vh; }
            .waoo-view { flex: 1; padding: 40px; margin-left: 280px; color: #0f172a; position: relative; }

            .hero-title { font-size: 3rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -2px; }
            .hero-sub { color: #475569; font-size: 1.1rem; }
            .waoo-hero-head { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }

            .waoo-dashboard { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 40px; }
            .glass-card { background: white; border-radius: 28px; padding: 30px; border: 1px solid #e2e8f0; color: #0f172a; }
            .deck-inputs { display: flex; gap: 20px; }
            .waoo-input-box { flex: 1; display: flex; flex-direction: column; gap: 8px; }
            .waoo-input-box label { font-size: 0.7rem; font-weight: 800; color: #475569; }

            .premium-select { 
                padding: 14px; border-radius: 14px; border: 2px solid #f1f5f9; 
                background: #ffffff !important; 
                color: #0f172a !important; 
                font-weight: 700; width: 100%; cursor: pointer;
            }

            .neon-id-card { background: #0f172a; border-radius: 28px; padding: 25px; color: #ffffff; }
            .neon-code { font-size: 1.8rem; font-weight: 900; margin: 15px 0; color: #60a5fa; }

            .waoo-list-section { background: white; border-radius: 32px; border: 1px solid #e2e8f0; position: relative; padding-bottom: 20px; }
            .list-top { padding: 30px; display: flex; justify-content: space-between; align-items: center; }
            .waoo-primary-btn { background: #3b82f6; color: white; border: none; padding: 16px 32px; border-radius: 18px; font-weight: 800; display: flex; align-items: center; gap: 12px; cursor: pointer; }
            
            .waoo-main-table { width: 100%; border-collapse: collapse; }
            .waoo-main-table th { text-align: left; padding: 20px 30px; color: #94a3b8; font-size: 0.75rem; font-weight: 800; }
            .waoo-row { border-bottom: 1px solid #f8fafc; transition: 0.3s; }
            .waoo-row:hover { background: #f8fafc; }

            .row-action-btn { 
                background: #f1f5f9; border: none; color: #475569; 
                width: 36px; height: 36px; border-radius: 10px; 
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; margin: 0 auto; position: relative; z-index: 5;
            }

            /* --- ACTION POPUP FIX: Higher Z-index & Pointer events --- */
            .action-popup { 
                position: absolute; right: 50px; top: -10px; 
                background: #ffffff; border-radius: 12px; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                border: 1px solid #e2e8f0; padding: 8px; 
                z-index: 99999 !important; flex-direction: column; gap: 4px; min-width: 140px;
                pointer-events: auto !important;
            }
            .action-item { 
                background: transparent; border: none; text-align: left; 
                padding: 10px 15px; border-radius: 8px; font-weight: 700; 
                color: #334155 !important; cursor: pointer !important; display: flex; align-items: center; gap: 10px; 
                font-size: 0.85rem; width: 100%; pointer-events: auto !important;
            }
            .action-item:hover { background: #eff6ff !important; color: #3b82f6 !important; }
            .action-item.delete:hover { background: #fee2e2 !important; color: #ef4444 !important; }

            .waoo-status-pill { display: flex; align-items: center; gap: 8px; background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; width: fit-content; }
            .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }

            /* --- PAGINATION FIX --- */
            .waoo-pagination-container { 
                padding: 20px 30px; 
                display: flex; 
                justify-content: flex-end; 
                border-top: 1px solid #f1f5f9;
                margin-top: 10px;
                background: #fcfcfc;
            }
            .p-controls { display: flex; align-items: center; gap: 20px; }
            .p-btn { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; color: #0f172a; display: flex; align-items: center; }
            .p-btn:hover:not(:disabled) { background: #3b82f6; color: white; }
            .p-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            .p-info { font-weight: 700; color: #475569; font-size: 0.9rem; }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ FIX APPLIED: Pagination visible & Action buttons clickable.")
