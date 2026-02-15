import os

BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Locations.jsx")
if not os.path.exists(TARGET_FILE):
    TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Locations.jsx")

print(f"ðŸ”§ Forcing Delete Button Visibility in: {TARGET_FILE}")

code_content = r"""import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Globe, Plus, RefreshCw, MoreHorizontal, ChevronLeft, ChevronRight, Zap, Eye, Edit, Trash2, X, MapPin, Mail, Server, Save, CheckCircle } from "lucide-react";
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
      toast.success("Node Deleted Successfully", {
          icon: 'ðŸ—‘ï¸',
          style: { background: '#fee2e2', color: '#b91c1c' }
      });
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
      toast.success("New Node Added!");
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
                            <select className="premium-select" value={selectedContinent} onChange={(e) => { setSelectedContinent(e.target.value); setSelectedCountry(""); }}>
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
                                {getFilteredCountries().map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="waoo-input-box">
                            <label>STATE / PROVINCE</label>
                            <select className="premium-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry}>
                                <option value="">Select State</option>
                                {getFilteredStates().map((s, i) => <option key={i} value={s}>{s}</option>)}
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
                        <h3>Regional Nodes ({filteredCenters.length})</h3>
                        <button onClick={fetchGlobalData} className="waoo-refresh-btn"><RefreshCw size={16}/></button>
                    </div>
                    <button onClick={() => setIsAddOpen(true)} className="waoo-primary-btn">
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
                            {currentItems.length > 0 ? currentItems.map((center, i) => (
                                <tr key={center.id} className="waoo-row">
                                    <td className="row-id">{indexOfFirstItem + i + 1}</td>
                                    <td className="row-name">{center.name}</td>
                                    <td className="row-addr">{center.address || "Sector 7 Hub"}</td>
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
                                            <div className="action-popup fade-in">
                                                <button onClick={(e) => { e.stopPropagation(); setViewNode(center); setActiveActionMenu(null); }} className="action-item"><Eye size={14}/> View</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEditClick(center); }} className="action-item"><Edit size={14}/> Edit</button>
                                                {/* FORCE VISIBLE DELETE BUTTON */}
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(center.id); }} className="action-item delete">
                                                    <Trash2 size={14} color="#ef4444"/> <span style={{color: '#ef4444'}}>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#64748b'}}>No Nodes found for this filter.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="waoo-pagination-bar">
                    <div className="p-content">
                        <button className="p-nav" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            <ChevronLeft size={20}/> Previous
                        </button>
                        <div className="p-numbers">
                            <span className="current-p">Page {currentPage} of {totalPages}</span>
                        </div>
                        <button className="p-nav" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                            Next <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {viewNode && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content scale-up-bounce">
                        <div className="modal-header">
                            <div className="modal-title-box"><Server size={24} color="#3b82f6"/><h2>Node Details</h2></div>
                            <button className="close-x" onClick={() => setViewNode(null)}><X size={24}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="hero-name-card"><h3>{viewNode.name}</h3><span className="id-tag">ID: {viewNode.id}</span></div>
                            <div className="detail-grid">
                                <div className="info-item"><MapPin size={18} color="#0f172a"/><p>{viewNode.address}</p></div>
                                <div className="info-item"><Mail size={18} color="#0f172a"/><p>{viewNode.contact_email}</p></div>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn-close" onClick={() => setViewNode(null)}>Close</button></div>
                    </div>
                </div>
            )}

            {editNode && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content scale-up-bounce">
                        <div className="modal-header">
                            <div className="modal-title-box"><Edit size={24} color="#f59e0b"/><h2>Edit Center</h2></div>
                            <button className="close-x" onClick={() => setEditNode(null)}><X size={24}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="edit-form-grid">
                                <div className="form-group"><label>Center Name</label><input type="text" defaultValue={editNode.name} className="modal-input" /></div>
                                <div className="form-group"><label>Location / Address</label><input type="text" defaultValue={editNode.address} className="modal-input" /></div>
                                <div className="form-group"><label>Email Contact</label><input type="email" defaultValue={editNode.contact_email} className="modal-input" /></div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setEditNode(null)}>Cancel</button>
                            <button className="btn-save" onClick={()=>toast.success("Updated!")}><Save size={18}/> Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddOpen && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content scale-up-bounce">
                        <div className="modal-header">
                            <div className="modal-title-box"><Plus size={24} color="#3b82f6"/><h2>New Node</h2></div>
                            <button className="close-x" onClick={() => setIsAddOpen(false)}><X size={24}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="edit-form-grid">
                                <div className="form-group"><label>Name</label><input className="modal-input" value={newCenterData.name} onChange={(e)=>setNewCenterData({...newCenterData, name:e.target.value})}/></div>
                                <div className="form-group"><label>Address</label><input className="modal-input" value={newCenterData.address} onChange={(e)=>setNewCenterData({...newCenterData, address:e.target.value})}/></div>
                                <div className="form-group"><label>Email</label><input className="modal-input" value={newCenterData.email} onChange={(e)=>setNewCenterData({...newCenterData, email:e.target.value})}/></div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsAddOpen(false)}>Abort</button>
                            <button className="btn-save" onClick={handleAddSubmit}><CheckCircle size={18}/> Initialize</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <style>{`
            .waoo-app-container { display: flex; background: #f8fafc; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
            .waoo-view { flex: 1; padding: 40px; margin-left: 280px; }

            .premium-select { 
                background: #ffffff !important; 
                color: #0f172a !important; 
                font-weight: 700; border: 2px solid #e2e8f0; 
                padding: 12px; border-radius: 12px; width: 100%;
            }
            .premium-select option { color: #000; background: #fff; }

            .hero-title { font-size: 3rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -2px; }
            .waoo-hero-head { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .waoo-dashboard { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 40px; }
            .glass-card { background: white; border-radius: 28px; padding: 30px; border: 1px solid #e2e8f0; }
            .deck-inputs { display: flex; gap: 20px; }
            .waoo-input-box { flex: 1; display: flex; flex-direction: column; gap: 5px; }
            .waoo-input-box label { font-size: 0.75rem; font-weight: 800; color: #334155; }

            .neon-id-card { background: #0f172a; border-radius: 28px; padding: 25px; color: white; }
            .neon-code { font-size: 1.8rem; font-weight: 900; margin: 15px 0; color: #3b82f6; }

            .waoo-list-section { background: white; border-radius: 32px; border: 1px solid #e2e8f0; padding-bottom: 20px; }
            .list-top { padding: 30px; display: flex; justify-content: space-between; align-items: center; }
            .waoo-main-table { width: 100%; border-collapse: collapse; }
            .waoo-main-table th { text-align: left; padding: 20px 30px; color: #475569; font-size: 0.75rem; font-weight: 800; }
            .waoo-row { border-bottom: 1px solid #f8fafc; }
            .row-name { font-weight: 800; color: #0f172a; }
            .row-action-btn { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin: 0 auto; position: relative; z-index: 5; }
            
            /* --- ACTION POPUP FIXED --- */
            .action-popup { 
                position: absolute; right: 50px; top: 0; 
                background: white; border-radius: 12px; 
                box-shadow: 0 10px 35px rgba(0,0,0,0.2); 
                border: 1px solid #e2e8f0; padding: 8px; 
                z-index: 10000; display: flex; flex-direction: column; gap: 4px; min-width: 140px;
                height: auto; /* Ensures it grows to fit all 3 buttons */
            }
            .action-item { 
                background: transparent; border: none; text-align: left; 
                padding: 10px 12px; border-radius: 8px; font-weight: 600; 
                color: #334155; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; width: 100%;
            }
            .action-item:hover { background: #eff6ff; color: #3b82f6; }
            .action-item.delete { color: #ef4444; }
            .action-item.delete:hover { background: #fee2e2; color: #b91c1c; }

            .waoo-status-pill { display: flex; align-items: center; gap: 8px; background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; }
            .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }

            .waoo-pagination-bar { padding: 20px 30px; border-top: 1px solid #f1f5f9; background: #fcfcfc; display: flex; justify-content: center; }
            .p-nav { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700; color: #0f172a; margin: 0 10px; }
            .current-p { font-weight: 800; color: #334155; }

            .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
            .modal-content { background: white; width: 500px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); padding: 30px; }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .modal-title-box { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; color: #0f172a; }
            .modal-input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; margin-top: 5px; font-weight: 600; color: #0f172a; background: #fff !important; }
            .btn-save { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; float: right; display: flex; gap: 8px; align-items: center; }
            .btn-close { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; float: right; font-weight: 700; }
            .btn-cancel { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 12px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; margin-right: 10px; float: right; }
            
            .fade-in { animation: fadeIn 0.3s ease; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ DELETE BUTTON FORCEFULLY ADDED & CSS FIXED!")
