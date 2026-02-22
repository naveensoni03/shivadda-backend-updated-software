import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, Layers, Cpu, Radio, Plus, Trash2, 
  Sparkles, LayoutGrid, Eye, AlertTriangle, X, Shield, MapPin,
  Users, UserCheck, DollarSign, CheckSquare, Check, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER COMPONENTS ---
const GlassCard = ({ children, className, style }) => (
    <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(20px)", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 15px 35px -10px rgba(0,0,0,0.05)", overflow: "hidden", width: "100%", boxSizing: "border-box", ...style }}
        className={className}
    >
        {children}
    </motion.div>
);

const TabButton = ({ active, onClick, label, icon }) => (
    <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick}
        style={{ padding: '12px 24px', borderRadius: '16px', border: 'none', background: active ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'white', color: active ? 'white' : '#64748b', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: active ? '0 8px 20px -5px rgba(99, 102, 241, 0.4)' : '0 2px 5px rgba(0,0,0,0.02)', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
    >
        {icon} {label}
    </motion.button>
);

// --- MAIN COMPONENT ---
export default function ServiceMaster() {
  const [activeTab, setActiveTab] = useState('levels');
  const [data, setData] = useState({ levels: [], types: [], modes: [], management: [], place_codes: [], nature: [], seekers: [], providers: [], charges: [] });
  
  // ✅ NEW: Added Fields for Super Admin
  const [newItem, setNewItem] = useState({ 
      name: "", desc: "", code: "", icon: "", place_code: "", longitude: "", latitude: "", services_code: "", users_code: "", 
      amount: "", validity_months: "", status: "Active" 
  });
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // API Endpoints Mapping
  const endpoints = {
      levels: 'services/levels/',
      types: 'services/types/',
      modes: 'services/modes/',
      management: 'services/management/',
      place_codes: 'services/place-codes/',
      nature: 'services/nature/',       // NEW
      seekers: 'services/seekers/',     // NEW
      providers: 'services/providers/', // NEW
      charges: 'services/charges/'      // NEW
  };

  useEffect(() => { 
      fetchAllServices(); 
      setSelectedIds([]); 
  }, [activeTab]); // Reset selection on tab change

  const fetchAllServices = async () => {
    try {
        const res = await api.get(endpoints[activeTab]);
        setData(prev => ({ ...prev, [activeTab]: Array.isArray(res.data) ? res.data : [] }));
        setSelectedIds([]);
    } catch (err) { 
        setData(prev => ({ ...prev, [activeTab]: [] })); 
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    let payload = { status: newItem.status };

    if(activeTab === 'place_codes') {
        if(!newItem.place_code) return toast.error("Place Code is required");
        payload = { ...payload, place_code: newItem.place_code, longitude: newItem.longitude || null, latitude: newItem.latitude || null, services_code: newItem.services_code, users_code: newItem.users_code };
    } else if (activeTab === 'charges') {
        if(!newItem.name || !newItem.amount) return toast.error("Name and Amount are required");
        payload = { ...payload, service_name: newItem.name, amount: newItem.amount, validity_months: newItem.validity_months || 1 };
    } else {
        if(!newItem.name) return toast.error("Name is required");
        payload = { ...payload, name: newItem.name };
        if(activeTab === 'levels') payload.description = newItem.desc;
        if(activeTab === 'types') payload.code = newItem.code;
        if(activeTab === 'modes') payload.icon_name = newItem.icon;
    }

    try {
        await api.post(endpoints[activeTab], payload);
        toast.success("Added Successfully! ✨");
        setNewItem({ name: "", desc: "", code: "", icon: "", place_code: "", longitude: "", latitude: "", services_code: "", users_code: "", amount: "", validity_months: "", status: "Active" });
        fetchAllServices();
    } catch(err) { 
        toast.error("Creation Failed. Ensure Backend is updated."); 
    }
    setLoading(false);
  };

  const deleteItem = async (id) => {
      if(!window.confirm("Delete this item?")) return;
      try {
          await api.delete(`${endpoints[activeTab]}${id}/`);
          toast.success("Deleted");
          fetchAllServices();
      } catch(err) { toast.error("Delete failed"); }
  };

  // ✅ BULK ACTIONS
  const handleSelectAll = () => {
      if (selectedIds.length === data[activeTab].length) setSelectedIds([]); 
      else setSelectedIds(data[activeTab].map(item => item.id)); 
  };

  const toggleSelect = (id) => {
      if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(itemId => itemId !== id));
      else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkDelete = async () => {
      if(!window.confirm(`Delete ${selectedIds.length} items permanently?`)) return;
      const loadToast = toast.loading(`Deleting ${selectedIds.length} items...`);
      try {
          await Promise.all(selectedIds.map(id => api.delete(`${endpoints[activeTab]}${id}/`)));
          toast.success(`Deleted ${selectedIds.length} items!`, {id: loadToast});
          fetchAllServices();
      } catch (err) { toast.error("Some items failed to delete.", {id: loadToast}); }
  };

  const handleBulkStatus = async (newStatus) => {
      const loadToast = toast.loading(`Updating status...`);
      try {
          await Promise.all(selectedIds.map(id => api.patch(`${endpoints[activeTab]}${id}/`, { status: newStatus })));
          toast.success(`Status updated!`, {id: loadToast});
          fetchAllServices();
      } catch (err) { toast.error("Status update failed.", {id: loadToast}); }
  };

  // Configuration for dynamic UI rendering
  const contentConfig = {
      levels: { title: "Education Levels", subtitle: "Foundation, Middle, Secondary...", icon: <Layers size={24}/>, color: '#6366f1' },
      types: { title: "Service Types", subtitle: "Academic, Unacademic...", icon: <Briefcase size={24}/>, color: '#ec4899' },
      modes: { title: "Service Modes", subtitle: "Online, Offline, Hybrid...", icon: <Radio size={24}/>, color: '#f59e0b' },
      management: { title: "Management Roles", subtitle: "Official, Unofficial...", icon: <Shield size={24}/>, color: '#10b981' },
      place_codes: { title: "Place Codes Mapping", subtitle: "Map Location with Codes", icon: <MapPin size={24}/>, color: '#8b5cf6' },
      nature: { title: "Nature of Services", subtitle: "Permanent, Adhoc, Guest...", icon: <Sparkles size={24}/>, color: '#0ea5e9' },
      seekers: { title: "Seekers Groups", subtitle: "Students, Parents, Guests...", icon: <Users size={24}/>, color: '#f43f5e' },
      providers: { title: "Providers Groups", subtitle: "Office, Field Working...", icon: <UserCheck size={24}/>, color: '#84cc16' },
      charges: { title: "Service Charges", subtitle: "Fees & Validity Configuration", icon: <DollarSign size={24}/>, color: '#eab308' }
  };

  const currentConfig = contentConfig[activeTab];
  const currentData = data[activeTab] || [];

  return (
    <div className="service-master-wrapper">
      <SidebarModern />
      <Toaster position="top-right" toastOptions={{style: {borderRadius:'12px', background:'#0f172a', color:'#fff'}}}/>
      
      <div className="service-main-content hide-scrollbar">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />

        {/* --- HEADER --- */}
        <div style={{marginBottom:'25px', position: 'relative', zIndex: 2}}>
            <h1 style={{fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin: '0 0 5px 0'}}>
                Service Master <span style={{fontSize:'2rem', verticalAlign:'middle'}}>🛠️</span>
            </h1>
            <p style={{color: '#64748b', fontSize: '1.05rem', fontWeight:'500', margin: 0}}>Comprehensive Record & Policy Configuration.</p>
        </div>

        {/* --- TABS --- */}
        <div className="tabs-container" style={{position: 'relative', zIndex: 2}}>
            <TabButton active={activeTab === 'levels'} onClick={() => setActiveTab('levels')} label="Edu. Levels" icon={<Layers size={18}/>} />
            <TabButton active={activeTab === 'types'} onClick={() => setActiveTab('types')} label="Service Types" icon={<Briefcase size={18}/>} />
            <TabButton active={activeTab === 'modes'} onClick={() => setActiveTab('modes')} label="Service Modes" icon={<Radio size={18}/>} />
            <TabButton active={activeTab === 'nature'} onClick={() => setActiveTab('nature')} label="Nature of Services" icon={<Sparkles size={18}/>} />
            <TabButton active={activeTab === 'seekers'} onClick={() => setActiveTab('seekers')} label="Seekers" icon={<Users size={18}/>} />
            <TabButton active={activeTab === 'providers'} onClick={() => setActiveTab('providers')} label="Providers" icon={<UserCheck size={18}/>} />
            <TabButton active={activeTab === 'charges'} onClick={() => setActiveTab('charges')} label="Charges/Validity" icon={<DollarSign size={18}/>} />
            <TabButton active={activeTab === 'management'} onClick={() => setActiveTab('management')} label="Management" icon={<Shield size={18}/>} />
            <TabButton active={activeTab === 'place_codes'} onClick={() => setActiveTab('place_codes')} label="Place Codes" icon={<MapPin size={18}/>} />
        </div>

        <div className="service-content-grid" style={{position: 'relative', zIndex: 2}}>
            {/* LEFT: FORM */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="form-wrapper-box">
                    <GlassCard style={{padding:'25px', borderTop: `5px solid ${currentConfig.color}`}}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'25px'}}>
                            <div style={{padding:'12px', borderRadius:'14px', background:`${currentConfig.color}20`, color: currentConfig.color}}>{currentConfig.icon}</div>
                            <div>
                                <h3 style={{fontSize:'1.1rem', fontWeight:'800', margin:0, color:'#1e293b'}}>Add {currentConfig.title}</h3>
                                <p style={{margin:0, fontSize:'0.75rem', color:'#64748b', marginTop:'2px'}}>{currentConfig.subtitle}</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdd} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                            {activeTab !== 'place_codes' && (
                                <input placeholder="Name / Title" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value})} style={inputStyle} />
                            )}
                            
                            {activeTab === 'levels' && <textarea rows="3" placeholder="Description (Optional)" value={newItem.desc} onChange={e=>setNewItem({...newItem, desc:e.target.value})} style={{...inputStyle, resize:'none'}} />}
                            {activeTab === 'types' && <input placeholder="Short Code (e.g. ACD)" value={newItem.code} onChange={e=>setNewItem({...newItem, code:e.target.value})} style={{...inputStyle, textTransform:'uppercase'}} />}
                            {activeTab === 'modes' && <input placeholder="Icon Name (e.g. wifi)" value={newItem.icon} onChange={e=>setNewItem({...newItem, icon:e.target.value})} style={inputStyle} />}
                            
                            {activeTab === 'charges' && (
                                <div style={{display:'flex', gap:'10px'}}>
                                    <input placeholder="Amount (₹)" type="number" value={newItem.amount} onChange={e=>setNewItem({...newItem, amount:e.target.value})} style={inputStyle} />
                                    <input placeholder="Validity (Months)" type="number" value={newItem.validity_months} onChange={e=>setNewItem({...newItem, validity_months:e.target.value})} style={inputStyle} />
                                </div>
                            )}

                            {activeTab === 'place_codes' && (
                                <>
                                    <input placeholder="Place Code (e.g. DEL-01)" value={newItem.place_code} onChange={e=>setNewItem({...newItem, place_code:e.target.value})} style={inputStyle} />
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <input placeholder="Latitude" type="number" step="any" value={newItem.latitude} onChange={e=>setNewItem({...newItem, latitude:e.target.value})} style={inputStyle} />
                                        <input placeholder="Longitude" type="number" step="any" value={newItem.longitude} onChange={e=>setNewItem({...newItem, longitude:e.target.value})} style={inputStyle} />
                                    </div>
                                    <input placeholder="Services Code" value={newItem.services_code} onChange={e=>setNewItem({...newItem, services_code:e.target.value})} style={inputStyle} />
                                    <input placeholder="Users Code" value={newItem.users_code} onChange={e=>setNewItem({...newItem, users_code:e.target.value})} style={inputStyle} />
                                </>
                            )}

                            <select value={newItem.status} onChange={e=>setNewItem({...newItem, status:e.target.value})} style={inputStyle}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive / Hidden</option>
                            </select>

                            <motion.button whileTap={{scale:0.95}} type="submit" style={{...btnPrimary, background: currentConfig.color, marginTop:'5px'}}>
                                {loading ? <Sparkles size={20} className="spin"/> : <div style={{display:'flex',alignItems:'center',gap:'8px'}}>Add Entry <Plus size={20}/></div>}
                            </motion.button>
                        </form>
                    </GlassCard>
                </motion.div>
            </AnimatePresence>

            {/* RIGHT: TABULAR LIST WITH BULK ACTIONS */}
            <div className="table-wrapper-box">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <LayoutGrid size={20} color="#64748b"/>
                        <h3 style={{fontSize:'1.2rem', fontWeight:'800', color:'#334155', margin:0}}>Tabular Records</h3>
                    </div>

                    {currentData.length > 0 && (
                        <button onClick={handleSelectAll} style={{background:'white', border:'1px solid #cbd5e1', padding:'8px 12px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'700', color:'#475569', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}>
                            {selectedIds.length === currentData.length ? <CheckSquare size={16} color={currentConfig.color}/> : <span style={{width:'14px', height:'14px', border:'2px solid #cbd5e1', borderRadius:'4px'}}></span>}
                            Select All
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0, y: -10 }} style={{background:'#1e293b', padding:'12px 20px', borderRadius:'16px', marginBottom:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', color:'white', boxShadow:'0 10px 25px rgba(0,0,0,0.2)'}}>
                            <span style={{fontWeight:'700', fontSize:'0.9rem'}}>{selectedIds.length} Selected</span>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => handleBulkStatus('Active')} style={bulkBtnStyle}><Check size={16}/> Active</button>
                                <button onClick={() => handleBulkStatus('Inactive')} style={bulkBtnStyle}><EyeOff size={16}/> Hide</button>
                                <button onClick={handleBulkDelete} style={{...bulkBtnStyle, background:'#ef4444', border:'none'}}><Trash2 size={16}/> Delete</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="table-card glass-card">
                    {currentData.length === 0 ? (
                        <div style={{textAlign:'center', padding:'50px', color:'#94a3b8'}}>
                            <Cpu size={40} style={{marginBottom:'10px', opacity:0.5, margin:'0 auto'}}/>
                            <p>No records found. Data will load after Server Update.</p>
                        </div>
                    ) : (
                        <div className="table-responsive-wrapper hide-scrollbar">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th style={{width: '5%'}}></th>
                                        <th style={{width: '10%'}}>ID</th>
                                        {activeTab === 'place_codes' ? (
                                            <>
                                                <th>Place Code</th>
                                                <th>Service Code</th>
                                            </>
                                        ) : activeTab === 'charges' ? (
                                            <>
                                                <th>Service Name</th>
                                                <th>Fee / Validity</th>
                                            </>
                                        ) : (
                                            <th style={{width: '40%'}}>Name</th>
                                        )}
                                        <th>Status</th>
                                        <th style={{width: '15%', textAlign: 'right'}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {currentData.map((item, idx) => (
                                            <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.05 }} className="table-row-hover">
                                                <td>
                                                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} style={{width:'18px', height:'18px', cursor:'pointer', accentColor: currentConfig.color}}/>
                                                </td>
                                                <td style={{fontWeight: '700', color: '#64748b'}}>#{item.id}</td>
                                                
                                                {activeTab === 'place_codes' ? (
                                                    <>
                                                        <td style={{fontWeight: '800', color: '#1e293b'}}>{item.place_code}</td>
                                                        <td><span className="badge-code">{item.services_code}</span></td>
                                                    </>
                                                ) : activeTab === 'charges' ? (
                                                    <>
                                                        <td style={{fontWeight: '800', color: '#1e293b'}}>{item.service_name || item.name}</td>
                                                        <td style={{fontWeight: '600', color: '#10b981'}}>₹{item.amount} / {item.validity_months} Mo.</td>
                                                    </>
                                                ) : (
                                                    <td style={{fontWeight: '800', color: '#1e293b'}}>{item.name}</td>
                                                )}

                                                <td>
                                                    <span style={{fontSize:'0.75rem', fontWeight:'800', padding:'4px 8px', borderRadius:'6px', background: item.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: item.status === 'Active' ? '#16a34a' : '#94a3b8'}}>
                                                        {item.status || 'Active'}
                                                    </span>
                                                </td>
                                                
                                                <td style={{textAlign: 'right'}}>
                                                    <button onClick={() => deleteItem(item.id)} className="action-btn-del" title="Delete"><Trash2 size={16}/></button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        html, body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #f8fafc; max-width: 100%; box-sizing: border-box; }
        *, *::before, *::after { box-sizing: inherit; }
        .service-master-wrapper { display: flex; width: 100%; height: 100vh; font-family: 'Inter', sans-serif; position: relative; overflow: hidden; }
        .service-main-content { flex: 1; margin-left: 280px; padding: 35px; padding-bottom: 120px !important; height: 100vh; overflow-y: auto; overflow-x: hidden; width: calc(100% - 280px); position: relative; z-index: 1; scroll-behavior: smooth; }
        .bg-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .blob-1 { top: -20%; left: 20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%); }
        .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(0,0,0,0) 70%); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .service-content-grid { display: grid; grid-template-columns: 360px 1fr; gap: 30px; align-items: start; width: 100%; }
        .form-wrapper-box { width: 100%; overflow: hidden; }
        .table-wrapper-box { width: 100%; overflow: hidden; }
        .tabs-container { display: flex; gap: 12px; margin-bottom: 35px; overflow-x: auto; padding-bottom: 10px; -webkit-overflow-scrolling: touch; width: 100%; }
        .table-card { background: white; padding: 0; border-radius: 20px; overflow: hidden; width: 100%; }
        .table-responsive-wrapper { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }
        .modern-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .modern-table th { background: #f8fafc; padding: 16px 20px; text-align: left; color: #64748b; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; white-space: nowrap;}
        .modern-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .table-row-hover { transition: 0.2s; }
        .table-row-hover:hover { background: #f8fafc; }
        .badge-code { background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; white-space: nowrap;}
        .action-btn-del { background: #fff1f2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; flex-shrink: 0;}
        .action-btn-del:hover { background: #ef4444; color: white; transform: scale(1.1); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @media (max-width: 1024px) { .service-main-content { margin-left: 0; width: 100%; max-width: 100%; } }
        @media (max-width: 850px) {
            .service-main-content { margin-left: 0 !important; padding: 15px !important; padding-top: 85px !important; padding-bottom: 150px !important; width: 100% !important; max-width: 100% !important; }
            .service-content-grid { grid-template-columns: 1fr !important; gap: 25px; width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

// --- STYLES ---
const inputStyle = { width:'100%', padding:'14px 18px', borderRadius:'12px', border:'2px solid #f1f5f9', outline:'none', background:'#f8fafc', fontSize:'0.9rem', color:'#1e293b', fontWeight:'600', transition:'all 0.2s', boxSizing: 'border-box' };
const btnPrimary = { width:'100%', padding:'14px', border:'none', borderRadius:'12px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px -5px rgba(0,0,0,0.2)', fontSize:'0.95rem', fontWeight:'700', boxSizing: 'border-box' };
const bulkBtnStyle = { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' };