import os

BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Institutions.jsx")
if not os.path.exists(TARGET_FILE):
    TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Institutions.jsx")

print(f"ðŸ”§ Fixing Institutions Page (Adding Principal Support) in: {TARGET_FILE}")

code_content = r"""import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Building2, Plus, Search, MapPin, User, Mail, MoreHorizontal, Edit, Trash2, X, Save, CheckCircle } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- MODAL STATES ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editNode, setEditNode] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // --- FORM STATES ---
  const [formData, setFormData] = useState({ name: "", address: "", principal_name: "", contact_email: "" });

  const API_BASE = "http://127.0.0.1:8000/api/institutions/";

  useEffect(() => {
      fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
      setLoading(true);
      try {
          const res = await axios.get(API_BASE);
          setInstitutions(res.data);
      } catch (error) {
          console.error("Fetch Error");
      } finally {
          setLoading(false);
      }
  };

  // --- HANDLERS ---
  const handleSave = async (isEdit = false) => {
      if (!formData.name) return toast.error("School Name is required!");

      try {
          if (isEdit && editNode) {
              // Update Logic
              await axios.put(`${API_BASE}${editNode.id}/`, formData);
              
              const updatedList = institutions.map(i => i.id === editNode.id ? { ...i, ...formData } : i);
              setInstitutions(updatedList);
              toast.success("Institution Updated!");
              setEditNode(null);
          } else {
              // Create Logic
              const res = await axios.post(API_BASE, formData);
              setInstitutions([res.data, ...institutions]);
              toast.success("New Institution Onboarded!");
              setIsAddOpen(false);
          }
          setFormData({ name: "", address: "", principal_name: "", contact_email: "" });
      } catch (error) {
          toast.error("Operation Failed");
      }
  };

  const openEdit = (inst) => {
      setEditNode(inst);
      setFormData({ 
          name: inst.name, 
          address: inst.address, 
          principal_name: inst.principal_name || "", 
          contact_email: inst.contact_email 
      });
      setActiveMenu(null);
  };

  const handleDelete = async (id) => {
      try {
          await axios.delete(`${API_BASE}${id}/`);
          setInstitutions(institutions.filter(i => i.id !== id));
          toast.success("Institution Removed");
          setActiveMenu(null);
      } catch (error) {
          toast.error("Delete Failed");
      }
  };

  // Filter Logic
  const filteredList = institutions.filter(i => 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (i.address && i.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="waoo-app-container">
        <SidebarModern />
        <div className="waoo-view">
            <Toaster position="top-right" />
            
            <header className="page-header">
                <div>
                    <h1 className="page-title">Institutions Directory</h1>
                    <p className="page-sub">Manage client schools, colleges & coaching centers.</p>
                </div>
                <button onClick={() => { setIsAddOpen(true); setFormData({ name: "", address: "", principal_name: "", contact_email: "" }); }} className="btn-primary">
                    <Plus size={18}/> Onboard School
                </button>
            </header>

            {/* SEARCH BAR */}
            <div className="search-bar-container">
                <Search size={18} className="search-icon"/>
                <input 
                    type="text" 
                    placeholder="Search schools by name or city..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* GRID VIEW */}
            <div className="grid-container">
                {filteredList.map((inst) => (
                    <div key={inst.id} className="inst-card fade-in">
                        <div className="card-header">
                            <div className="icon-box"><Building2 size={24} color="#3b82f6"/></div>
                            <div className="card-actions">
                                <button className="icon-btn" onClick={() => setActiveMenu(activeMenu === inst.id ? null : inst.id)}>
                                    <MoreHorizontal size={20}/>
                                </button>
                                {activeMenu === inst.id && (
                                    <div className="menu-dropdown">
                                        <button onClick={() => openEdit(inst)}><Edit size={14}/> Edit</button>
                                        <button onClick={() => handleDelete(inst.id)} className="danger"><Trash2 size={14}/> Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <h3 className="inst-name">{inst.name}</h3>
                        <p className="inst-city">{inst.address || "Location N/A"}</p>
                        
                        <div className="divider"></div>
                        
                        <div className="inst-meta">
                            <div className="meta-row">
                                <User size={16} className="meta-icon"/>
                                <span>Head: <strong>{inst.principal_name || "Not Assigned"}</strong></span>
                            </div>
                            <div className="meta-row">
                                <Mail size={16} className="meta-icon"/>
                                <span className="truncate">{inst.contact_email || "No Email"}</span>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredList.length === 0 && !loading && (
                    <div className="empty-state">No institutions found matching "{searchTerm}"</div>
                )}
            </div>

            {/* --- ADD / EDIT MODAL --- */}
            {(isAddOpen || editNode) && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content scale-up">
                        <div className="modal-head">
                            <h2>{editNode ? "Edit Institution" : "Onboard New School"}</h2>
                            <button className="close-btn" onClick={() => { setIsAddOpen(false); setEditNode(null); }}><X size={24}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Institution Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Shivadda High School" />
                            </div>
                            <div className="form-group">
                                <label>Principal / Head Name</label>
                                <input type="text" value={formData.principal_name} onChange={(e) => setFormData({...formData, principal_name: e.target.value})} placeholder="e.g. Dr. A.K. Sharma" />
                            </div>
                            <div className="form-group">
                                <label>Address / City</label>
                                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="e.g. New Delhi" />
                            </div>
                            <div className="form-group">
                                <label>Official Email</label>
                                <input type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} placeholder="admin@school.com" />
                            </div>
                        </div>
                        <div className="modal-foot">
                            <button className="btn-cancel" onClick={() => { setIsAddOpen(false); setEditNode(null); }}>Cancel</button>
                            <button className="btn-save" onClick={() => handleSave(!!editNode)}>
                                <CheckCircle size={18}/> {editNode ? "Update Changes" : "Onboard School"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <style>{`
            .waoo-app-container { display: flex; background: #f8fafc; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
            .waoo-view { flex: 1; padding: 40px; margin-left: 280px; }
            
            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .page-title { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
            .page-sub { color: #64748b; margin-top: 5px; }
            
            .btn-primary { background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
            .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2); }

            .search-bar-container { background: white; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
            .search-icon { color: #94a3b8; }
            .search-input { border: none; flex: 1; font-size: 1rem; outline: none; color: #0f172a; font-weight: 600; }

            .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
            
            .inst-card { background: white; border-radius: 20px; padding: 25px; border: 1px solid #f1f5f9; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.03); transition: 0.3s; position: relative; }
            .inst-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.08); border-color: #e2e8f0; }
            
            .card-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .icon-box { background: #eff6ff; padding: 12px; border-radius: 14px; }
            .icon-btn { background: transparent; border: none; cursor: pointer; color: #94a3b8; padding: 5px; }
            .icon-btn:hover { color: #0f172a; }

            .inst-name { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0 0 5px 0; }
            .inst-city { color: #64748b; font-size: 0.9rem; font-weight: 500; margin: 0; }
            
            .divider { height: 1px; background: #f1f5f9; margin: 20px 0; }
            
            .inst-meta { display: flex; flex-direction: column; gap: 12px; }
            .meta-row { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #334155; }
            .meta-icon { color: #94a3b8; }
            .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }

            .menu-dropdown { position: absolute; right: 20px; top: 60px; background: white; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; width: 120px; overflow: hidden; z-index: 10; }
            .menu-dropdown button { background: white; border: none; padding: 10px; text-align: left; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px; }
            .menu-dropdown button:hover { background: #f8fafc; color: #3b82f6; }
            .menu-dropdown button.danger:hover { background: #fee2e2; color: #ef4444; }

            /* MODAL */
            .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 999; }
            .modal-content { background: white; width: 450px; border-radius: 24px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
            .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .modal-head h2 { margin: 0; font-size: 1.4rem; font-weight: 800; color: #0f172a; }
            .close-btn { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; }
            
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 6px; }
            .form-group input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-weight: 600; color: #0f172a; font-size: 0.95rem; }
            .form-group input:focus { border-color: #3b82f6; outline: none; }

            .modal-foot { display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px; }
            .btn-save { background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
            .btn-cancel { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; }

            .fade-in { animation: fadeIn 0.3s ease; }
            .scale-up { animation: scaleUp 0.3s ease; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ INSTITUTIONS PAGE FIXED: Principal Field Added & UI Polished!")
