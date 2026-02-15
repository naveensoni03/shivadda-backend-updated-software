import os

BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Locations.jsx")
if not os.path.exists(TARGET_FILE):
    TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Locations.jsx")

print(f"ðŸ”§ FIXING GARBAGE TEXT & VIEW MODAL VISIBILITY in: {TARGET_FILE}")

code_content = r"""import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Globe, Plus, RefreshCw, MoreHorizontal, ChevronLeft, ChevronRight, Zap, Eye, Edit, Trash2, X, MapPin, Mail, Server, Save, CheckCircle, Filter } from "lucide-react";
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
  
  const [viewNode, setViewNode] = useState(null);
  const [editNode, setEditNode] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCenterData, setNewCenterData] = useState({ name: "", address: "", email: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_BASE = "http://127.0.0.1:8000/api";

  const continentMap = {
      "India": "Asia", "China": "Asia", "Japan": "Asia",
      "USA": "North America", "Canada": "North America",
      "UK": "Europe", "Germany": "Europe", "France": "Europe"
  };

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
      } catch (error) {
          console.error("Connection Error", error);
      } finally {
          setLoading(false);
      }
  };

  const getFilteredCountries = () => {
      const allCountries = [...new Set(locationsDB.map(l => l.country))];
      if (!selectedContinent) return allCountries;
      return allCountries.filter(c => continentMap[c] === selectedContinent);
  };

  const getFilteredStates = () => {
      return locationsDB
          .filter(l => l.country === selectedCountry)
          .map(l => l.state);
  };

  const filteredCenters = centers.filter(center => {
      const addr = (center.address || "").toLowerCase();
      const countrySel = selectedCountry.toLowerCase();
      const stateSel = selectedState.toLowerCase();

      if (selectedContinent) {
          const countriesInCont = Object.keys(continentMap).filter(c => continentMap[c] === selectedContinent);
          const hasCountryMatch = countriesInCont.some(c => addr.includes(c.toLowerCase()));
          if (!hasCountryMatch) return false;
      }
      if (selectedCountry && !addr.includes(countrySel)) return false;
      if (selectedState && !addr.includes(stateSel)) return false;

      return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCenters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage) || 1;

  const toggleActionMenu = (id) => {
      setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const handleDelete = (id) => {
      setCenters(centers.filter(c => c.id !== id));
      toast.success("Node Deleted", { icon: 'ðŸ—‘ï¸' });
      setActiveActionMenu(null);
  };

  const handleEditClick = (center) => {
      setEditNode({ ...center });
      setActiveActionMenu(null);
  };

  const handleAddSubmit = () => {
      if(!newCenterData.name) return toast.error("Name is required!");
      const newEntry = {
          id: Date.now(),
          name: newCenterData.name,
          address: newCenterData.address || "New Location",
          contact_email: newCenterData.email || "pending@shivadda.com"
      };
      setCenters([newEntry, ...centers]); 
      setIsAddOpen(false);
      setNewCenterData({ name: "", address: "", email: "" }); 
      toast.success("New Node Added!", { icon: 'ðŸš€' });
  };

  return (
    <div className="waoo-app-container">
        <SidebarModern />
        <div className="waoo-view">
            <Toaster position="top-right" />
            
            <header className="waoo-header fade-in-down">
                <div className="header-content">
                    <h1 className="waoo-title">Global <span className="gradient-text">Nexus</span></h1>
                    <p className="waoo-subtitle">Managing {centers.length} active nodes across the grid.</p>
                </div>
                <button onClick={() => setIsAddOpen(true)} className="waoo-fab-btn hover-scale">
                    <Plus size={24} color="#fff"/> <span className="btn-text">New Node</span>
                </button>
            </header>

            {/* FILTERS - FIXED TEXT (NO EMOJIS TO PREVENT BUGS) */}
            <div className="filter-deck glass-panel fade-in-up">
                <div className="deck-icon"><Filter size={20} color="#6366f1"/></div>
                <div className="deck-inputs">
                    <select className="waoo-select" value={selectedContinent} onChange={(e) => { setSelectedContinent(e.target.value); setSelectedCountry(""); }}>
                        <option value="">Global View</option>
                        <option>Asia</option>
                        <option>Europe</option>
                        <option>North America</option>
                    </select>
                    <div className="divider-v"></div>
                    <select className="waoo-select" value={selectedCountry} onChange={(e) => {setSelectedCountry(e.target.value); setSelectedState("");}}>
                        <option value="">All Countries</option>
                        {getFilteredCountries().map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                    <div className="divider-v"></div>
                    <select className="waoo-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry}>
                        <option value="">Select State</option>
                        {getFilteredStates().map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="deck-actions">
                    <button onClick={fetchGlobalData} className="refresh-icon-btn"><RefreshCw size={18}/></button>
                </div>
            </div>

            <div className="waoo-grid fade-in-up-delay">
                <div className="grid-header">
                    <span>IDENTITY</span>
                    <span>COORDINATES</span>
                    <span>COMMUNICATION</span>
                    <span style={{textAlign:'right'}}>STATUS</span>
                </div>
                
                {currentItems.length > 0 ? currentItems.map((center, i) => (
                    <div key={center.id} className="waoo-card-row hover-lift">
                        <div className="col-identity">
                            <div className="avatar-icon">{center.name.charAt(0)}</div>
                            <div>
                                <h4>{center.name}</h4>
                                <span className="id-badge">ID: {1000 + i}</span>
                            </div>
                        </div>
                        <div className="col-addr">
                            <MapPin size={14} className="faint-icon"/> {center.address || "Sector 7, Grid Alpha"}
                        </div>
                        <div className="col-mail">
                            <Mail size={14} className="faint-icon"/> {center.contact_email}
                        </div>
                        <div className="col-status">
                            <div className="status-pill active"><div className="pulse-dot"></div> ONLINE</div>
                            
                            <div className="action-wrapper">
                                <button className="more-btn" onClick={(e) => { e.stopPropagation(); toggleActionMenu(center.id); }}>
                                    <MoreHorizontal size={20}/>
                                </button>
                                {activeActionMenu === center.id && (
                                    <div className="waoo-popover swing-in">
                                        <button onClick={(e) => { e.stopPropagation(); setViewNode(center); setActiveActionMenu(null); }} className="pop-item"><Eye size={16}/> View</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(center); }} className="pop-item"><Edit size={16}/> Edit</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(center.id); }} className="pop-item delete"><Trash2 size={16}/> Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state-waoo">
                        <Globe size={48} color="#cbd5e1"/>
                        <p>No signals found in this sector.</p>
                    </div>
                )}
            </div>

            <div className="waoo-pagination">
                <button className="p-pill" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft size={18}/>
                </button>
                <span className="p-text">Page <b>{currentPage}</b> / {totalPages}</span>
                <button className="p-pill" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight size={18}/>
                </button>
            </div>

            {/* --- MODALS --- */}
            {(viewNode || editNode || isAddOpen) && (
                <div className="glass-overlay fade-in">
                    <div className="glass-modal scale-up">
                        <div className="g-modal-head">
                            <h3>{viewNode ? "Node Intel" : editNode ? "Modify Protocol" : "Initialize Node"}</h3>
                            <button className="g-close" onClick={() => { setViewNode(null); setEditNode(null); setIsAddOpen(false); }}><X size={20}/></button>
                        </div>
                        
                        {/* --- VIEW NODE (FIXED VISIBILITY) --- */}
                        {viewNode && (
                            <div className="g-modal-body">
                                <div className="intel-card">
                                    <div className="intel-row">
                                        <span className="lbl">Identity</span> 
                                        <span className="val highlight">{viewNode.name}</span>
                                    </div>
                                    <div className="intel-row">
                                        <span className="lbl">Location</span> 
                                        <span className="val">{viewNode.address || "N/A"}</span>
                                    </div>
                                    <div className="intel-row">
                                        <span className="lbl">Uplink</span> 
                                        <span className="val">{viewNode.contact_email || "N/A"}</span>
                                    </div>
                                    <div className="intel-row">
                                        <span className="lbl">System ID</span> 
                                        <span className="val">NODE-{viewNode.id}</span>
                                    </div>
                                </div>
                                <div className="g-modal-foot">
                                    <button className="waoo-btn-primary-gradient" onClick={() => setViewNode(null)}>Close Intel</button>
                                </div>
                            </div>
                        )}

                        {(editNode || isAddOpen) && (
                            <div className="g-modal-body">
                                <div className="waoo-form">
                                    <div className="waoo-form-group">
                                        <label className="waoo-label">Entity Name</label>
                                        <input 
                                            className="waoo-input-modern" 
                                            placeholder="e.g. Alpha Base"
                                            defaultValue={editNode ? editNode.name : newCenterData.name} 
                                            onChange={(e) => editNode ? null : setNewCenterData({...newCenterData, name:e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="waoo-form-group">
                                        <label className="waoo-label">Grid Coordinates (Address)</label>
                                        <input 
                                            className="waoo-input-modern" 
                                            placeholder="e.g. Sector 7, NY"
                                            defaultValue={editNode ? editNode.address : newCenterData.address} 
                                            onChange={(e) => editNode ? null : setNewCenterData({...newCenterData, address:e.target.value})}
                                        />
                                    </div>

                                    <div className="waoo-form-group">
                                        <label className="waoo-label">Secure Comms (Email)</label>
                                        <input 
                                            className="waoo-input-modern" 
                                            placeholder="admin@base.com"
                                            defaultValue={editNode ? editNode.contact_email : newCenterData.email} 
                                            onChange={(e) => editNode ? null : setNewCenterData({...newCenterData, email:e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="g-modal-foot">
                                    <button className="waoo-btn-primary-gradient" onClick={editNode ? () => toast.success("Updated") : handleAddSubmit}>
                                        {editNode ? "Save Patch" : "Launch Node"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        <style>{`
            :root {
                --primary: #6366f1;
                --primary-glow: rgba(99, 102, 241, 0.4);
                --bg-body: #f3f4f6;
                --text-dark: #1e293b;
                --text-light: #64748b;
            }

            .waoo-app-container { display: flex; background: var(--bg-body); min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
            .waoo-view { flex: 1; padding: 20px 40px; margin-left: 280px; position: relative; }

            .waoo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .waoo-title { font-size: 2.8rem; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -1px; }
            .gradient-text { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .waoo-subtitle { color: #64748b; font-weight: 500; font-size: 1rem; margin-top: 5px; }

            .waoo-fab-btn { background: #1e293b; color: white; border: none; padding: 12px 24px; border-radius: 50px; display: flex; align-items: center; gap: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 25px -10px rgba(0,0,0,0.5); transition: 0.3s; }
            .waoo-fab-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.6); background: var(--primary); }

            .filter-deck { display: flex; align-items: center; background: white; padding: 12px 20px; border-radius: 20px; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05); margin-bottom: 30px; gap: 20px; border: 1px solid rgba(255,255,255,0.5); }
            .deck-icon { background: #e0e7ff; padding: 8px; border-radius: 12px; }
            .deck-inputs { display: flex; flex: 1; gap: 15px; align-items: center; }
            
            /* FIXED: TEXT COLOR IS DARK NOW */
            .waoo-select { border: none; background: transparent; font-weight: 700; color: #1e293b; font-size: 0.95rem; cursor: pointer; outline: none; padding: 8px; border-radius: 8px; transition: 0.2s; }
            .waoo-select:hover { background: #f8fafc; color: var(--primary); }
            
            .divider-v { width: 1px; height: 24px; background: #e2e8f0; }
            .refresh-icon-btn { border: none; background: #f1f5f9; padding: 10px; border-radius: 50%; color: #64748b; cursor: pointer; transition: 0.3s; }
            .refresh-icon-btn:hover { background: #e0e7ff; color: var(--primary); transform: rotate(180deg); }

            .grid-header { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr; padding: 0 25px 15px 25px; color: #94a3b8; font-weight: 800; font-size: 0.75rem; letter-spacing: 1px; }
            
            .waoo-card-row { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr; background: white; padding: 18px 25px; border-radius: 20px; margin-bottom: 12px; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 1px solid transparent; transition: all 0.25s ease; position: relative; }
            .waoo-card-row:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.15); border-color: #e0e7ff; z-index: 10; }

            .col-identity { display: flex; align-items: center; gap: 15px; }
            .avatar-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #4338ca; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.1rem; }
            .col-identity h4 { margin: 0; font-size: 1rem; color: #1e293b; font-weight: 800; }
            .id-badge { font-size: 0.7rem; background: #f1f5f9; padding: 2px 6px; border-radius: 6px; color: #64748b; font-weight: 700; }

            .col-addr, .col-mail { color: #475569; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
            .faint-icon { color: #94a3b8; }

            .col-status { display: flex; justify-content: flex-end; align-items: center; gap: 15px; position: relative; }
            .status-pill { background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 30px; font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 8px; border: 1px solid #bbf7d0; }
            .pulse-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); animation: pulse-green 2s infinite; }

            .more-btn { background: transparent; border: none; cursor: pointer; color: #cbd5e1; transition: 0.2s; padding: 5px; }
            .more-btn:hover { color: #1e293b; background: #f1f5f9; border-radius: 8px; }

            .waoo-popover { position: absolute; top: -10px; right: 40px; background: white; padding: 8px; border-radius: 16px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px; min-width: 140px; z-index: 100; transform-origin: top right; }
            .pop-item { background: transparent; border: none; text-align: left; padding: 10px 12px; font-weight: 700; font-size: 0.85rem; color: #475569; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pop-item:hover { background: #f8fafc; color: var(--primary); }
            .pop-item.delete { color: #ef4444; }
            .pop-item.delete:hover { background: #fef2f2; color: #dc2626; }

            .waoo-pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px; }
            .p-pill { background: white; border: 1px solid #e2e8f0; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1e293b; transition: 0.2s; }
            .p-pill:hover:not(:disabled) { background: #1e293b; color: white; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .p-text { font-weight: 700; color: #64748b; font-size: 0.9rem; }

            .glass-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
            .glass-modal { background: rgba(255, 255, 255, 0.95); border: 1px solid white; padding: 30px; border-radius: 30px; width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); }
            .g-modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .g-modal-head h3 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
            .g-close { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: #64748b; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
            .g-close:hover { background: #ef4444; color: white; transform: rotate(90deg); }
            
            /* --- FIXED VISIBILITY --- */
            .waoo-form-group { margin-bottom: 18px; }
            .waoo-label { display: block; font-size: 0.85rem; font-weight: 800; color: #1e293b; margin-bottom: 8px; letter-spacing: 0.3px; }
            .waoo-input-modern { 
                width: 100%; padding: 14px; 
                background: #f8fafc; /* Light Gray BG */
                border: 2px solid #e2e8f0; /* Visible Border */
                border-radius: 14px; 
                font-weight: 600; color: #1e293b; /* Dark Text */
                font-size: 1rem;
                transition: all 0.25s ease;
            }
            .waoo-input-modern:focus { 
                background: white; border-color: var(--primary); outline: none; 
                box-shadow: 0 4px 12px var(--primary-glow); transform: translateY(-2px);
            }
            .waoo-input-modern::placeholder { color: #94a3b8; font-weight: 500; }
            
            /* VIEW INTEL CARD FIXED */
            .intel-card { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
            .intel-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .intel-row:last-child { border-bottom: none; }
            .intel-row .lbl { color: #64748b; font-weight: 700; font-size: 0.9rem; }
            .intel-row .val { color: #1e293b; font-weight: 800; text-align: right; }
            .intel-row .highlight { color: #4f46e5; }

            .waoo-btn-primary-gradient { width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 14px; font-weight: 800; font-size: 1rem; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4); transition: 0.2s; }
            .waoo-btn-primary-gradient:hover { transform: translateY(-2px); filter: brightness(1.1); }

            .fade-in-down { animation: fadeInDown 0.6s ease; }
            .fade-in-up { animation: fadeInUp 0.6s ease; }
            .scale-up { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ FIX APPLIED: Text cleaned & View Modal is now High-Contrast!")
