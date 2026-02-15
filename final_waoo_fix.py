import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Locations.jsx")

if not os.path.exists(TARGET_FILE):
    TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Locations.jsx")

print(f"ðŸš€ Applying Final Waoo Fix (No Encoding Errors) in: {TARGET_FILE}")

code_content = r"""import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Compass, Zap, Plus, RefreshCw, Server, MoreHorizontal, FileText, Globe } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function Locations() {
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState([]);
  const [locationsDB, setLocationsDB] = useState([]);

  const API_BASE = "http://127.0.0.1:8000/api";

  useEffect(() => {
      fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
      setLoading(true);
      try {
          const schoolsRes = await axios.get(`${API_BASE}/institutions/`);
          setCenters(schoolsRes.data);
          const locRes = await axios.get(`${API_BASE}/locations/`);
          setLocationsDB(locRes.data);
          toast.success("Grid Synced Successfully", { duration: 3000 });
      } catch (error) {
          toast.error("Central Server Offline");
      } finally {
          setLoading(false);
      }
  };

  const countries = [...new Set(locationsDB.map(l => l.country))];

  const handleAddCenter = () => {
      // Fixed: Plain text for toast to avoid encoding issues
      toast.success("Initializing Center Creator...", {
          icon: '🚀',
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }
      });
  };

  return (
    <div className="waoo-app-container">
        <SidebarModern />
        <div className="waoo-view">
            <Toaster position="top-right" reverseOrder={false} />
            
            {/* HERO HEADER */}
            <header className="waoo-hero-head animate-reveal">
                <div className="head-info">
                    <div className="head-badge">NETWORK STATUS: LIVE</div>
                    <h1 className="hero-title">Global Reach</h1>
                    <p className="hero-sub">Synchronizing nodes with Shivadda Central Command.</p>
                </div>
                <div className="head-stats pulse-border">
                    <Zap size={18} className="zap-icon"/>
                    <span>DATA STREAM ACTIVE</span>
                </div>
            </header>

            {/* DASHBOARD GRID */}
            <div className="waoo-dashboard">
                <div className="glass-card control-deck animate-slide-up">
                    <div className="deck-header">
                        <Globe size={18} /> <span>NAVIGATION FILTERS</span>
                    </div>
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
                            <label>REGION / COUNTRY</label>
                            <select className="premium-select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                                <option value="">All Regions</option>
                                {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="neon-id-card animate-slide-up delay-1">
                    <div className="neon-inner">
                        <div className="neon-tag">VIRTUAL SECTOR ID</div>
                        <h2 className="neon-code">GLOB-NODE-2026</h2>
                        <div className="neon-footer">
                            <div className="coord-box"><span>LAT</span> 28.61</div>
                            <div className="coord-box"><span>LNG</span> 77.20</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DATA TABLE SECTION */}
            <div className="waoo-list-section animate-slide-up delay-2">
                <div className="list-top">
                    <div className="list-heading">
                        <h3>Regional Nodes <span className="node-count">{centers.length}</span></h3>
                        <button onClick={fetchGlobalData} className="waoo-refresh-btn"><RefreshCw size={16}/></button>
                    </div>
                    <button onClick={handleAddCenter} className="waoo-primary-btn">
                        <Plus size={20}/> <span>ADD CENTER</span>
                    </button>
                </div>

                <div className="waoo-table-wrapper">
                    <table className="waoo-main-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>CENTER IDENTITY</th>
                                <th>COORDINATES</th>
                                <th>ENCRYPTED EMAIL</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {centers.map((center, i) => (
                                <tr key={center.id} className="waoo-row" style={{animationDelay: `${i * 0.1}s`}}>
                                    <td className="row-id">{i + 1}</td>
                                    <td className="row-name">{center.name}</td>
                                    <td className="row-addr">{center.address || "Main Grid Sector"}</td>
                                    <td className="row-mail">{center.contact_email}</td>
                                    <td>
                                        <div className="waoo-status-pill online">
                                            <span className="dot"></span> ACTIVE
                                        </div>
                                    </td>
                                    <td>
                                        <button className="row-action-btn"><MoreHorizontal size={20}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <style>{`
            :root {
                --neon-blue: #3b82f6;
                --neon-green: #10b981;
                --waoo-bg: #f8fafc;
                --dark-panel: #0f172a;
            }

            .waoo-app-container { display: flex; background: var(--waoo-bg); min-height: 100vh; overflow-x: hidden; }
            .waoo-view { flex: 1; padding: 40px; margin-left: 280px; }

            /* ANIMATIONS */
            .animate-reveal { animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            .delay-1 { animation-delay: 0.1s; }
            .delay-2 { animation-delay: 0.2s; }

            @keyframes reveal { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

            /* HEADER */
            .waoo-hero-head { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .head-badge { background: #dbeafe; color: var(--neon-blue); padding: 4px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; width: fit-content; margin-bottom: 10px; }
            .hero-title { font-size: 3rem; font-weight: 900; color: var(--dark-panel); margin: 0; letter-spacing: -2px; }
            .hero-sub { color: #64748b; font-weight: 500; font-size: 1.1rem; }
            .head-stats { background: #f0fdf4; color: var(--neon-green); padding: 12px 20px; border-radius: 16px; display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 0.8rem; border: 1px solid #bbf7d0; }
            .zap-icon { animation: blink 1.5s infinite; }
            @keyframes blink { 50% { opacity: 0.3; } }

            /* DASHBOARD */
            .waoo-dashboard { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 40px; }
            .glass-card { background: white; border-radius: 28px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
            .deck-header { display: flex; align-items: center; gap: 10px; color: #94a3b8; font-weight: 800; font-size: 0.75rem; margin-bottom: 20px; letter-spacing: 1px; }
            .deck-inputs { display: flex; gap: 20px; }
            .waoo-input-box { flex: 1; display: flex; flex-direction: column; gap: 8px; }
            .waoo-input-box label { font-size: 0.7rem; font-weight: 800; color: #64748b; }
            .premium-select { padding: 14px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f8fafc; color: var(--dark-panel); font-weight: 700; transition: 0.3s; cursor: pointer; }
            .premium-select:hover { border-color: var(--neon-blue); background: white; }

            .neon-id-card { background: var(--dark-panel); border-radius: 28px; padding: 25px; position: relative; overflow: hidden; }
            .neon-inner { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
            .neon-tag { color: var(--neon-blue); font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; }
            .neon-code { color: white; margin: 15px 0; font-size: 1.8rem; font-weight: 900; }
            .neon-footer { display: flex; gap: 20px; }
            .coord-box { color: #475569; font-weight: 800; font-size: 0.8rem; }
            .coord-box span { color: #334155; margin-right: 5px; }

            /* TABLE */
            .waoo-list-section { background: white; border-radius: 32px; padding: 10px; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05); }
            .list-top { padding: 30px; display: flex; justify-content: space-between; align-items: center; }
            .list-heading h3 { font-size: 1.4rem; font-weight: 800; color: var(--dark-panel); margin: 0; }
            .node-count { background: #f1f5f9; padding: 4px 10px; border-radius: 10px; font-size: 0.9rem; color: var(--neon-blue); margin-left: 10px; }
            .waoo-refresh-btn { background: #f8fafc; border: none; padding: 10px; border-radius: 12px; cursor: pointer; color: #64748b; transition: 0.3s; }
            .waoo-refresh-btn:hover { background: #eff6ff; color: var(--neon-blue); transform: rotate(180deg); }

            .waoo-primary-btn { 
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                color: white; border: none; padding: 16px 32px; border-radius: 18px; 
                font-weight: 800; display: flex; align-items: center; gap: 12px; 
                cursor: pointer; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
            }
            .waoo-primary-btn:hover { transform: scale(1.05) translateY(-5px); box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.6); }

            .waoo-main-table { width: 100%; border-collapse: collapse; }
            .waoo-main-table th { text-align: left; padding: 20px 30px; color: #94a3b8; font-size: 0.75rem; font-weight: 800; border-bottom: 1px solid #f1f5f9; }
            .waoo-row { border-bottom: 1px solid #f8fafc; transition: 0.3s; opacity: 0; animation: slideUp 0.5s ease-out forwards; }
            .waoo-row:hover { background: #f8fafc; transform: scale(1.01); }
            
            .row-id { color: #cbd5e1; font-weight: 800; padding-left: 30px; }
            .row-name { font-weight: 800; color: var(--dark-panel); font-size: 1rem; }
            .row-addr { color: #64748b; font-size: 0.9rem; }
            .row-mail { color: var(--neon-blue); font-weight: 700; font-size: 0.85rem; }

            .waoo-status-pill { display: flex; align-items: center; gap: 8px; width: fit-content; padding: 6px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; }
            .waoo-status-pill.online { background: #dcfce7; color: #166534; }
            .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--neon-green); box-shadow: 0 0 10px var(--neon-green); }

            .row-action-btn { background: transparent; border: none; color: #cbd5e1; cursor: pointer; transition: 0.2s; }
            .row-action-btn:hover { color: var(--dark-panel); transform: scale(1.2); }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: Final Waoo UI applied. Text prompt fixed!")
