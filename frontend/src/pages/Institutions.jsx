import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Building2, Plus, Search, MapPin, User, Mail, MoreHorizontal, Edit, Trash2, X, Phone, Eye, CheckCircle, RefreshCw, Filter } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

// ✅ Normal axios hata kar aapka custom 'api' import kiya (Taaki Token pass ho sake)
import api from '../api/axios'; 

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  
  const [viewNode, setViewNode] = useState(null);
  const [editNode, setEditNode] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "", principal_name: "", contact_email: "", phone: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ URL ab chota ho gaya kyunki 'https://...onrender.com/api/' aapke axios.js mein pehle se set hai
  const API_ENDPOINT = "institutions/";

  useEffect(() => {
      fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
      setLoading(true);
      try {
          // ✅ axios.get ki jagah api.get use kiya
          const res = await api.get(API_ENDPOINT);
          setInstitutions(res.data);
      } catch (error) {
          console.error("Fetch Error", error);
          toast.error("Failed to load institutions.");
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async (isEdit = false) => {
      if (!formData.name) return toast.error("School Name is required!");

      try {
          if (isEdit && editNode) {
              // ✅ api.patch use kiya
              await api.patch(`${API_ENDPOINT}${editNode.id}/`, formData);
              const updatedList = institutions.map(i => i.id === editNode.id ? { ...i, ...formData } : i);
              setInstitutions(updatedList);
              toast.success("Institution Updated!");
              setEditNode(null);
          } else {
              // ✅ api.post use kiya
              const res = await api.post(API_ENDPOINT, formData);
              setInstitutions([res.data, ...institutions]);
              toast.success("New Institution Onboarded!", { icon: '🎓' });
              setIsAddOpen(false);
          }
          setFormData({ name: "", address: "", principal_name: "", contact_email: "", phone: "" });
      } catch (error) {
          console.error("Save Error:", error.response?.data || error);
          toast.error("Operation Failed! Check console.");
      }
  };

  const handleDelete = async (id) => {
      try {
          // ✅ api.delete use kiya
          await api.delete(`${API_ENDPOINT}${id}/`);
          setInstitutions(institutions.filter(i => i.id !== id));
          toast.success("Institution Removed", { icon: '🗑️' });
          setActiveActionMenu(null);
      } catch (error) {
          toast.error("Delete Failed");
      }
  };

  const toggleActionMenu = (id) => {
      setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const openEdit = (inst) => {
      setEditNode(inst);
      setFormData({ 
          name: inst.name || "", 
          address: inst.address || "", 
          principal_name: inst.principal_name || "", 
          contact_email: inst.contact_email || "",
          phone: inst.phone || ""
      });
      setActiveActionMenu(null);
  };

  // Filter & Pagination
  const filteredList = institutions.filter(i => 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (i.address && i.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  return (
    <div className="waoo-app-container">
        <SidebarModern />
        <div className="waoo-view">
            <Toaster position="top-right" />
            
            {/* HERO HEADER */}
            <header className="waoo-header fade-in-down">
                <div className="header-content">
                    <h1 className="waoo-title">Academic <span className="gradient-text">Hub</span></h1>
                    <p className="waoo-subtitle">Managing {institutions.length} partner institutions.</p>
                </div>
                <button onClick={() => { setIsAddOpen(true); setFormData({ name: "", address: "", principal_name: "", contact_email: "", phone: "" }); }} className="waoo-fab-btn hover-scale">
                    <Plus size={24} color="#fff"/> <span className="btn-text">Onboard School</span>
                </button>
            </header>

            {/* SEARCH DECK - FIXED UI */}
            <div className="filter-deck glass-panel fade-in-up">
                <div className="deck-icon"><Search size={20} color="#6366f1"/></div>
                <input 
                    type="text" 
                    placeholder="Search schools..." 
                    className="waoo-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="deck-actions">
                    <button onClick={fetchInstitutions} className="refresh-icon-btn"><RefreshCw size={18}/></button>
                </div>
            </div>

            {/* DATA GRID */}
            <div className="waoo-grid fade-in-up-delay">
                <div className="grid-header">
                    <span>INSTITUTION</span>
                    <span>LEADERSHIP</span>
                    <span>CONTACT INFO</span>
                    <span style={{textAlign:'right'}}>STATUS</span>
                </div>
                
                {currentItems.length > 0 ? currentItems.map((inst, i) => (
                    <div key={inst.id} className="waoo-card-row hover-lift">
                        <div className="col-identity">
                            <div className="avatar-icon"><Building2 size={20} color="#4338ca"/></div>
                            <div>
                                <h4>{inst.name}</h4>
                                <span className="id-badge">{inst.address || "Location N/A"}</span>
                            </div>
                        </div>
                        <div className="col-addr">
                            <User size={14} className="faint-icon"/> {inst.principal_name || "Principal: N/A"}
                        </div>
                        <div className="col-mail">
                            <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                                <span style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'0.85rem'}}><Phone size={12} className="faint-icon"/> {inst.phone || "--"}</span>
                                <span style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'0.85rem'}}><Mail size={12} className="faint-icon"/> {inst.contact_email}</span>
                            </div>
                        </div>
                        <div className="col-status">
                            <div className="status-pill active"><div className="pulse-dot"></div> ACTIVE</div>
                            
                            {/* ACTION BUTTON */}
                            <div className="action-wrapper">
                                <button className="more-btn" onClick={(e) => { e.stopPropagation(); toggleActionMenu(inst.id); }}>
                                    <MoreHorizontal size={20}/>
                                </button>
                                {activeActionMenu === inst.id && (
                                    <div className="waoo-popover swing-in">
                                        <button onClick={(e) => { e.stopPropagation(); setViewNode(inst); setActiveActionMenu(null); }} className="pop-item"><Eye size={16}/> View</button>
                                        <button onClick={(e) => { e.stopPropagation(); openEdit(inst); }} className="pop-item"><Edit size={16}/> Edit</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(inst.id); }} className="pop-item delete"><Trash2 size={16}/> Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state-waoo">
                        <Building2 size={48} color="#cbd5e1"/>
                        <p>No institutions found in database.</p>
                    </div>
                )}
            </div>

            {/* PAGINATION */}
            <div className="waoo-pagination">
                <button className="p-pill" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                <span className="p-text">Page <b>{currentPage}</b> / {totalPages}</span>
                <button className="p-pill" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>

            {/* --- MODALS --- */}
            {(viewNode || editNode || isAddOpen) && (
                <div className="glass-overlay fade-in">
                    <div className="glass-modal scale-up">
                        <div className="g-modal-head">
                            <h3>{viewNode ? "School Profile" : editNode ? "Update Details" : "Onboard School"}</h3>
                            <button className="g-close" onClick={() => { setViewNode(null); setEditNode(null); setIsAddOpen(false); }}><X size={20}/></button>
                        </div>
                        
                        {viewNode && (
                            <div className="g-modal-body">
                                <div className="intel-card">
                                    <div className="intel-row"><span className="lbl">Name</span> <span className="val highlight">{viewNode.name}</span></div>
                                    <div className="intel-row"><span className="lbl">Principal</span> <span className="val">{viewNode.principal_name || "N/A"}</span></div>
                                    <div className="intel-row"><span className="lbl">Phone</span> <span className="val">{viewNode.phone || "N/A"}</span></div>
                                    <div className="intel-row"><span className="lbl">Email</span> <span className="val">{viewNode.contact_email || "N/A"}</span></div>
                                    <div className="intel-row"><span className="lbl">Address</span> <span className="val">{viewNode.address || "N/A"}</span></div>
                                </div>
                                <div className="g-modal-foot">
                                    <button className="waoo-btn-cancel" onClick={() => setViewNode(null)}>Close</button>
                                </div>
                            </div>
                        )}

                        {(editNode || isAddOpen) && (
                            <div className="g-modal-body">
                                <div className="waoo-form">
                                    <div className="waoo-form-group">
                                        <label className="waoo-label">Institution Name</label>
                                        <input className="waoo-input-modern" value={formData.name} onChange={(e) => setFormData({...formData, name:e.target.value})} placeholder="e.g. St. Xavier's High School"/>
                                    </div>
                                    
                                    <div className="waoo-form-row">
                                        <div className="waoo-form-group half">
                                            <label className="waoo-label">Principal Name</label>
                                            <input className="waoo-input-modern" value={formData.principal_name} onChange={(e) => setFormData({...formData, principal_name:e.target.value})} placeholder="Dr. A.K. Sharma"/>
                                        </div>
                                        <div className="waoo-form-group half">
                                            <label className="waoo-label">Phone Number</label>
                                            <input className="waoo-input-modern" value={formData.phone} onChange={(e) => setFormData({...formData, phone:e.target.value})} placeholder="+91 9876543210"/>
                                        </div>
                                    </div>

                                    <div className="waoo-form-group">
                                        <label className="waoo-label">Address / City</label>
                                        <input className="waoo-input-modern" value={formData.address} onChange={(e) => setFormData({...formData, address:e.target.value})} placeholder="Sector 62, Noida"/>
                                    </div>

                                    <div className="waoo-form-group">
                                        <label className="waoo-label">Official Email</label>
                                        <input className="waoo-input-modern" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email:e.target.value})} placeholder="info@stxaviers.com"/>
                                    </div>
                                </div>
                                
                                <div className="g-modal-foot">
                                    <button className="waoo-btn-cancel" onClick={() => { setIsAddOpen(false); setEditNode(null); }}>Cancel</button>
                                    <button className="waoo-btn-primary-gradient" onClick={() => handleSave(!!editNode)}>
                                        <CheckCircle size={18}/> {editNode ? "Update Details" : "Onboard School"}
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
                --primary-glow: rgba(99, 102, 241, 0.25);
                --bg-body: #f3f4f6;
                --text-dark: #1e293b;
                --text-light: #64748b;
            }

            .waoo-app-container { display: flex; background: var(--bg-body); min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
            .waoo-view { flex: 1; padding: 20px 40px; margin-left: 280px; position: relative; }
            .waoo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .waoo-title { font-size: 2.5rem; font-weight: 800; color: var(--text-dark); margin: 0; letter-spacing: -1px; }
            .gradient-text { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .waoo-subtitle { color: var(--text-light); font-weight: 500; font-size: 1rem; margin-top: 5px; }
            
            .waoo-fab-btn { background: var(--text-dark); color: white; border: none; padding: 12px 24px; border-radius: 50px; display: flex; align-items: center; gap: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 25px -10px rgba(0,0,0,0.5); transition: 0.3s; }
            .waoo-fab-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.6); background: var(--primary); }
            
            /* FILTER DECK */
            .filter-deck { display: flex; align-items: center; background: white; padding: 12px 20px; border-radius: 20px; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05); margin-bottom: 30px; gap: 15px; border: 1px solid rgba(255,255,255,0.5); }
            .deck-icon { background: #e0e7ff; padding: 8px; border-radius: 12px; }
            
            /* FIXED SEARCH INPUT */
            .waoo-search-input { 
                border: 2px solid #e2e8f0; 
                background: #ffffff; 
                flex: 1; 
                padding: 12px 16px; 
                border-radius: 12px;
                font-size: 1rem; 
                outline: none; 
                color: var(--text-dark); 
                font-weight: 500; 
                transition: 0.2s;
            }
            .waoo-search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-glow); }
            
            .refresh-icon-btn { border: none; background: #f1f5f9; padding: 10px; border-radius: 50%; color: var(--text-light); cursor: pointer; transition: 0.3s; }
            .refresh-icon-btn:hover { background: #e0e7ff; color: var(--primary); transform: rotate(180deg); }

            /* TABLE & REST OF UI */
            .grid-header { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr; padding: 0 25px 15px 25px; color: #94a3b8; font-weight: 800; font-size: 0.75rem; letter-spacing: 1px; }
            .waoo-card-row { display: grid; grid-template-columns: 2fr 1.5fr 1.5fr 1fr; background: white; padding: 18px 25px; border-radius: 20px; margin-bottom: 12px; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 1px solid transparent; transition: all 0.25s ease; position: relative; }
            .waoo-card-row:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.15); border-color: #e0e7ff; z-index: 10; }
            .col-identity { display: flex; align-items: center; gap: 15px; }
            .avatar-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #4338ca; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .col-identity h4 { margin: 0; font-size: 1rem; color: var(--text-dark); font-weight: 800; }
            .id-badge { font-size: 0.8rem; color: var(--text-light); font-weight: 500; }
            .col-addr, .col-mail { color: #475569; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
            .faint-icon { color: #94a3b8; }
            .col-status { display: flex; justify-content: flex-end; align-items: center; gap: 15px; position: relative; }
            .status-pill { background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 30px; font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 8px; border: 1px solid #bbf7d0; }
            .pulse-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); animation: pulse-green 2s infinite; }
            .more-btn { background: transparent; border: none; cursor: pointer; color: #cbd5e1; transition: 0.2s; padding: 5px; }
            .more-btn:hover { color: var(--text-dark); background: #f1f5f9; border-radius: 8px; }
            .waoo-popover { position: absolute; top: -10px; right: 40px; background: white; padding: 8px; border-radius: 16px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 4px; min-width: 130px; z-index: 100; }
            .pop-item { background: transparent; border: none; text-align: left; padding: 10px 12px; font-weight: 700; font-size: 0.85rem; color: #475569; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .pop-item:hover { background: #f8fafc; color: var(--primary); }
            .pop-item.delete { color: #ef4444; }
            .pop-item.delete:hover { background: #fef2f2; color: #dc2626; }
            .waoo-pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px; }
            .p-pill { background: white; border: 1px solid #e2e8f0; padding: 8px 20px; border-radius: 12px; cursor: pointer; color: var(--text-dark); font-weight: 700; font-size: 0.9rem; transition: 0.2s; }
            .p-pill:hover:not(:disabled) { background: var(--text-dark); color: white; transform: translateY(-2px); }
            .p-text { font-weight: 700; color: var(--text-light); }
            
            /* MODALS */
            .glass-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(12px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
            .glass-modal { background: rgba(255, 255, 255, 0.98); border: 1px solid rgba(255, 255, 255, 0.8); padding: 35px; border-radius: 32px; width: 520px; box-shadow: 0 30px 60px -15px rgba(0,0,0,0.25); }
            .g-modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .g-modal-head h3 { margin: 0; font-size: 1.6rem; font-weight: 900; color: var(--text-dark); letter-spacing: -0.5px; }
            .g-close { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; color: var(--text-light); display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .g-close:hover { background: #ef4444; color: white; transform: rotate(90deg); }
            .waoo-form-group { margin-bottom: 20px; }
            .waoo-form-row { display: flex; gap: 20px; margin-bottom: 20px; }
            .waoo-form-row .waoo-form-group { margin-bottom: 0; }
            .half { flex: 1; }
            .waoo-label { display: block; font-size: 0.85rem; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; letter-spacing: 0.3px; }
            .waoo-input-modern { width: 100%; padding: 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; font-weight: 600; color: var(--text-dark); font-size: 1rem; transition: all 0.25s ease; }
            .waoo-input-modern:focus { background: white; border-color: var(--primary); outline: none; box-shadow: 0 4px 12px var(--primary-glow); transform: translateY(-2px); }
            .waoo-input-modern::placeholder { color: #cbd5e1; font-weight: 500; }
            
            .intel-card { background: #ffffff; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .intel-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f1f5f9; }
            .intel-row:last-child { border-bottom: none; }
            .intel-row .lbl { color: #64748b; font-weight: 700; font-size: 0.9rem; }
            .intel-row .val { color: #0f172a; font-weight: 800; text-align: right; }
            .intel-row .highlight { color: var(--primary); }

            .g-modal-foot { display: flex; justify-content: flex-end; gap: 12px; margin-top: 35px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
            .waoo-btn-cancel { background: white; border: 2px solid #e2e8f0; color: var(--text-light); padding: 14px 24px; border-radius: 14px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: 0.2s; }
            .waoo-btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; color: var(--text-dark); }
            .waoo-btn-primary-gradient { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4); transition: 0.25s; }
            .waoo-btn-primary-gradient:hover { transform: translateY(-3px); box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.6); filter: brightness(1.05); }
            
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
}