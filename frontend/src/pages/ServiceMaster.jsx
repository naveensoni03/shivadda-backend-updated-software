import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, Layers, Cpu, Radio, Plus, Trash2, 
  Sparkles, LayoutGrid, Eye, AlertTriangle, X, Shield, MapPin 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER COMPONENTS ---
const GlassCard = ({ children, className, style }) => (
    <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 15px 35px -10px rgba(0,0,0,0.05)",
            overflow: "hidden",
            width: "100%",
            boxSizing: "border-box",
            ...style
        }}
        className={className}
    >
        {children}
    </motion.div>
);

const TabButton = ({ active, onClick, label, icon }) => (
    <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            padding: '12px 24px', borderRadius: '16px', border: 'none',
            background: active ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'white',
            color: active ? 'white' : '#64748b',
            fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: active ? '0 8px 20px -5px rgba(99, 102, 241, 0.4)' : '0 2px 5px rgba(0,0,0,0.02)',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap', flexShrink: 0
        }}
    >
        {icon} {label}
    </motion.button>
);

// --- MODALS ---
const DeleteModal = ({ isOpen, onClose, onConfirm, isDeleting }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', 
                    backdropFilter: 'blur(5px)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', boxSizing: 'border-box'
                }}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="responsive-modal"
                    style={{
                        background: 'white', padding: '30px', borderRadius: '24px',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', textAlign:'center', position:'relative',
                        width: '100%', maxWidth: '400px', boxSizing: 'border-box'
                    }}
                >
                    <button onClick={onClose} style={{position:'absolute', right:'20px', top:'20px', border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8'}}><X size={20}/></button>
                    <div style={{width:'60px', height:'60px', borderRadius:'50%', background:'#fee2e2', color:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                        <AlertTriangle size={32} strokeWidth={1.5}/>
                    </div>
                    <h3 style={{fontSize:'1.5rem', fontWeight:'800', color:'#1e293b', marginBottom:'10px'}}>Are you sure?</h3>
                    <p style={{color:'#64748b', marginBottom:'25px'}}>Do you really want to delete this record? This action cannot be undone.</p>
                    <div style={{display:'flex', gap:'15px'}}>
                        <button onClick={onClose} style={{flex:1, padding:'12px', borderRadius:'12px', border:'2px solid #e2e8f0', background:'white', fontWeight:'700', color:'#64748b', cursor:'pointer'}}>Cancel</button>
                        <button onClick={onConfirm} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', background:'#ef4444', fontWeight:'700', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                            {isDeleting ? <Sparkles size={18} className="spin"/> : <>Yes, Delete <Trash2 size={18}/></>}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// --- MAIN COMPONENT ---
export default function ServiceMaster() {
  const [activeTab, setActiveTab] = useState('levels');
  const [data, setData] = useState({ levels: [], types: [], modes: [], management: [], place_codes: [] });
  const [newItem, setNewItem] = useState({ name: "", desc: "", code: "", icon: "", place_code: "", longitude: "", latitude: "", services_code: "", users_code: "" });
  const [loading, setLoading] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [isDeletingButton, setIsDeletingButton] = useState(false);

  // API Endpoints
  const endpoints = {
      levels: 'services/levels/',
      types: 'services/types/',
      modes: 'services/modes/',
      management: 'services/management/',
      place_codes: 'services/place-codes/'
  };

  useEffect(() => { fetchAllServices(); }, []);

  const fetchAllServices = async () => {
    try {
      const [l, t, m, mg, pc] = await Promise.all([
          api.get(endpoints.levels).catch(() => ({data: []})),
          api.get(endpoints.types).catch(() => ({data: []})),
          api.get(endpoints.modes).catch(() => ({data: []})),
          api.get(endpoints.management).catch(() => ({data: []})), 
          api.get(endpoints.place_codes).catch(() => ({data: []})) 
      ]);
      setData({ 
          levels: l.data || [], 
          types: t.data || [], 
          modes: m.data || [], 
          management: mg.data || [], 
          place_codes: pc.data || [] 
      });
    } catch (err) { 
        console.error("API Fetch Error", err); 
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    let payload = {};

    if(activeTab === 'place_codes') {
        if(!newItem.place_code) { toast.error("Place Code is required"); setLoading(false); return; }
        payload = { 
            place_code: newItem.place_code, 
            longitude: newItem.longitude || null, 
            latitude: newItem.latitude || null, 
            services_code: newItem.services_code, 
            users_code: newItem.users_code 
        };
    } else {
        if(!newItem.name) { toast.error("Name is required"); setLoading(false); return; }
        payload = { name: newItem.name };
        if(activeTab === 'levels') payload.description = newItem.desc;
        if(activeTab === 'types') payload.code = newItem.code;
        if(activeTab === 'modes') payload.icon_name = newItem.icon;
    }

    try {
        await api.post(endpoints[activeTab], payload);
        toast.success("Added Successfully! ✨");
        setNewItem({ name: "", desc: "", code: "", icon: "", place_code: "", longitude: "", latitude: "", services_code: "", users_code: "" });
        fetchAllServices();
    } catch(err) { 
        toast.error("Creation Failed. Please ensure Backend is updated on Live Server."); 
    }
    setLoading(false);
  };

  const openDeleteModal = (id) => {
      setDeleteModal({ show: true, id });
  };

  const executeDelete = async () => {
      const id = deleteModal.id;
      if(!id) return;
      setIsDeletingButton(true);
      try {
          await api.delete(`${endpoints[activeTab]}${id}/`);
          toast.success("Deleted successfully");
          fetchAllServices();
          setDeleteModal({ show: false, id: null }); 
      } catch(err) { toast.error("Delete failed"); }
      setIsDeletingButton(false);
  };

  const contentConfig = {
      levels: { title: "Education Levels", subtitle: "(Foundation, Middle, Secondary...)", icon: <Layers size={24}/>, color: '#6366f1' },
      types: { title: "Service Types", subtitle: "(Academic, Unacademic, Both...)", icon: <Briefcase size={24}/>, color: '#ec4899' },
      modes: { title: "Service Modes", subtitle: "(Online, Offline, Hybrid...)", icon: <Radio size={24}/>, color: '#f59e0b' },
      management: { title: "Management Roles", subtitle: "(Official, Unofficial, Both...)", icon: <Shield size={24}/>, color: '#10b981' },
      place_codes: { title: "Place Codes Mapping", subtitle: "Map Location with Service & User Codes", icon: <MapPin size={24}/>, color: '#8b5cf6' }
  };

  const currentConfig = contentConfig[activeTab];

  return (
    <div className="service-master-wrapper">
      <SidebarModern />
      <Toaster position="top-right" toastOptions={{style: {borderRadius:'12px', background:'#0f172a', color:'#fff'}}}/>
      
      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({ show: false, id: null })} 
        onConfirm={executeDelete}
        isDeleting={isDeletingButton}
      />

      <div className="service-main-content">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />

        {/* --- HEADER --- */}
        <div style={{marginBottom:'35px', position: 'relative', zIndex: 2}}>
            <h1 style={{fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin: '0 0 5px 0'}}>
                Service Master <span style={{fontSize:'2rem', verticalAlign:'middle'}}>🛠️</span>
            </h1>
            <p style={{color: '#64748b', fontSize: '1.05rem', fontWeight:'500', margin: 0}}>Manage Tabular Records for Services, Management, and Place Codes.</p>
        </div>

        {/* --- TABS --- */}
        <div className="tabs-container" style={{position: 'relative', zIndex: 2}}>
            <TabButton active={activeTab === 'levels'} onClick={() => setActiveTab('levels')} label="Educational Levels" icon={<Layers size={18}/>} />
            <TabButton active={activeTab === 'types'} onClick={() => setActiveTab('types')} label="Service Types" icon={<Briefcase size={18}/>} />
            <TabButton active={activeTab === 'modes'} onClick={() => setActiveTab('modes')} label="Service Modes" icon={<Radio size={18}/>} />
            <TabButton active={activeTab === 'management'} onClick={() => setActiveTab('management')} label="Management Types" icon={<Shield size={18}/>} />
            <TabButton active={activeTab === 'place_codes'} onClick={() => setActiveTab('place_codes')} label="Place Codes" icon={<MapPin size={18}/>} />
        </div>

        {/* --- MAIN CONTENT (Grid) --- */}
        <div className="service-content-grid" style={{position: 'relative', zIndex: 2}}>
            
            {/* LEFT: FORM */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="form-wrapper-box"
                >
                    <GlassCard style={{padding:'30px', borderTop: `5px solid ${currentConfig.color}`}}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'25px'}}>
                            <div style={{padding:'12px', borderRadius:'14px', background:`${currentConfig.color}20`, color: currentConfig.color}}>
                                {currentConfig.icon}
                            </div>
                            <div>
                                <h3 style={{fontSize:'1.2rem', fontWeight:'800', margin:0, color:'#1e293b'}}>Add {currentConfig.title}</h3>
                                <p style={{margin:0, fontSize:'0.8rem', color:'#64748b', marginTop:'2px'}}>{currentConfig.subtitle}</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdd} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                            
                            {activeTab !== 'place_codes' && (
                                <input 
                                    placeholder={activeTab === 'management' ? "Name (e.g. Official, Unofficial)" : "Name (e.g. Academic, Foundation...)"} 
                                    value={newItem.name} 
                                    onChange={e=>setNewItem({...newItem, name:e.target.value})} 
                                    style={inputStyle} 
                                />
                            )}
                            
                            {activeTab === 'levels' && <textarea rows="3" placeholder="Description (Optional)" value={newItem.desc} onChange={e=>setNewItem({...newItem, desc:e.target.value})} style={{...inputStyle, resize:'none'}} />}
                            {activeTab === 'types' && <input placeholder="Short Code (e.g. ACD)" value={newItem.code} onChange={e=>setNewItem({...newItem, code:e.target.value})} style={{...inputStyle, textTransform:'uppercase', fontWeight:'700'}} />}
                            {activeTab === 'modes' && <input placeholder="Icon Name (e.g. wifi)" value={newItem.icon} onChange={e=>setNewItem({...newItem, icon:e.target.value})} style={inputStyle} />}
                            
                            {activeTab === 'place_codes' && (
                                <>
                                    <input placeholder="Place Code (e.g. DEL-01)" value={newItem.place_code} onChange={e=>setNewItem({...newItem, place_code:e.target.value})} style={inputStyle} />
                                    <input placeholder="Longitude (e.g. 77.2090)" type="number" step="any" value={newItem.longitude} onChange={e=>setNewItem({...newItem, longitude:e.target.value})} style={inputStyle} />
                                    <input placeholder="Latitude (e.g. 28.6139)" type="number" step="any" value={newItem.latitude} onChange={e=>setNewItem({...newItem, latitude:e.target.value})} style={inputStyle} />
                                    <input placeholder="Services Code" value={newItem.services_code} onChange={e=>setNewItem({...newItem, services_code:e.target.value})} style={inputStyle} />
                                    <input placeholder="Users Code" value={newItem.users_code} onChange={e=>setNewItem({...newItem, users_code:e.target.value})} style={inputStyle} />
                                </>
                            )}

                            <motion.button 
                                whileTap={{scale:0.95}} 
                                type="submit" 
                                style={{...btnPrimary, background: currentConfig.color}}
                            >
                                {loading ? <Sparkles size={20} className="spin"/> : <div style={{display:'flex',alignItems:'center',gap:'8px'}}>Add Entry <Plus size={20}/></div>}
                            </motion.button>
                        </form>
                    </GlassCard>
                </motion.div>
            </AnimatePresence>

            {/* RIGHT: TABULAR LIST */}
            <div className="table-wrapper-box">
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
                    <LayoutGrid size={20} color="#64748b"/>
                    <h3 style={{fontSize:'1.2rem', fontWeight:'800', color:'#334155', margin:0}}>Tabular Records</h3>
                </div>

                <div className="table-card glass-card">
                    {(!data[activeTab] || data[activeTab].length === 0) ? (
                        <div style={{textAlign:'center', padding:'50px', color:'#94a3b8'}}>
                            <Cpu size={40} style={{marginBottom:'10px', opacity:0.5, margin:'0 auto'}}/>
                            <p>No records found. Data will load after Server Update.</p>
                        </div>
                    ) : (
                        <div className="table-responsive-wrapper hide-scrollbar">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th style={{width: '10%'}}>ID</th>
                                        {activeTab === 'place_codes' ? (
                                            <>
                                                <th>Place Code</th>
                                                <th>Coordinates</th>
                                                <th>Service Code</th>
                                                <th>User Code</th>
                                            </>
                                        ) : (
                                            <>
                                                <th style={{width: '35%'}}>Name</th>
                                                {activeTab === 'levels' && <th style={{width: '40%'}}>Description</th>}
                                                {activeTab === 'types' && <th style={{width: '40%'}}>Code</th>}
                                                {activeTab === 'modes' && <th style={{width: '40%'}}>Icon</th>}
                                            </>
                                        )}
                                        <th style={{width: '15%', textAlign: 'right'}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {data[activeTab].map((item, idx) => (
                                            <motion.tr 
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="table-row-hover"
                                            >
                                                <td style={{fontWeight: '700', color: '#64748b'}}>#{item.id}</td>
                                                
                                                {activeTab === 'place_codes' ? (
                                                    <>
                                                        <td style={{fontWeight: '800', color: '#1e293b'}}>{item.place_code}</td>
                                                        <td style={{color: '#64748b', fontSize: '0.85rem'}}>Lat: {item.latitude || '-'} <br/> Lng: {item.longitude || '-'}</td>
                                                        <td><span className="badge-code">{item.services_code}</span></td>
                                                        <td><span className="badge-code">{item.users_code}</span></td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{fontWeight: '800', color: '#1e293b'}}>{item.name}</td>
                                                        {activeTab === 'levels' && <td style={{color: '#64748b', fontSize: '0.85rem'}}>{item.description || '-'}</td>}
                                                        {activeTab === 'types' && <td><span className="badge-code">{item.code || '-'}</span></td>}
                                                        {activeTab === 'modes' && <td style={{color: '#64748b'}}>{item.icon_name || '-'}</td>}
                                                    </>
                                                )}
                                                
                                                <td style={{textAlign: 'right'}}>
                                                    <button onClick={() => openDeleteModal(item.id)} className="action-btn-del" title="Delete">
                                                        <Trash2 size={16}/>
                                                    </button>
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
      
      {/* 🚀 CSS FOR 100% RESPONSIVENESS AND TABLE VIEW */}
      <style>{`
        /* Master Reset to strictly prevent horizontal scroll */
        html, body, #root { 
            margin: 0; padding: 0; height: 100%; 
            overflow: hidden; background: #f8fafc; 
            max-width: 100%; box-sizing: border-box; 
        }
        
        *, *::before, *::after { box-sizing: inherit; }

        .service-master-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
            font-family: 'Inter', sans-serif;
            position: relative;
            overflow: hidden;
        }

        .service-main-content {
            flex: 1;
            margin-left: 280px; 
            padding: 35px;
            padding-bottom: 120px !important; 
            height: 100vh;
            overflow-y: auto; 
            overflow-x: hidden;
            width: calc(100% - 280px);
            position: relative;
            z-index: 1;
            scroll-behavior: smooth;
        }

        .bg-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .blob-1 { top: -20%; left: 20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%); }
        .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(0,0,0,0) 70%); }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .service-content-grid {
            display: grid;
            grid-template-columns: 380px 1fr;
            gap: 35px;
            align-items: start;
            width: 100%;
        }

        .form-wrapper-box { width: 100%; overflow: hidden; }
        .table-wrapper-box { width: 100%; overflow: hidden; }

        .tabs-container {
            display: flex; gap: 15px; margin-bottom: 35px;
            overflow-x: auto; padding-bottom: 5px;
            -webkit-overflow-scrolling: touch;
            width: 100%;
        }

        .table-card { background: white; padding: 0; border-radius: 20px; overflow: hidden; width: 100%; }
        .table-responsive-wrapper { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }
        
        .modern-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .modern-table th { background: #f8fafc; padding: 18px 20px; text-align: left; color: #64748b; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; white-space: nowrap;}
        .modern-table td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .table-row-hover { transition: 0.2s; }
        .table-row-hover:hover { background: #f8fafc; }

        .badge-code { background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; white-space: nowrap;}
        .action-btn-del { background: #fee2e2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; flex-shrink: 0;}
        .action-btn-del:hover { background: #ef4444; color: white; transform: scale(1.1); }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
            .service-main-content { margin-left: 0; width: 100%; max-width: 100%; }
        }

        @media (max-width: 850px) {
            .service-main-content {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 85px !important; 
                padding-bottom: 150px !important; 
                width: 100% !important;
                max-width: 100% !important;
            }

            .service-content-grid { 
                grid-template-columns: 1fr !important; /* Stack format for mobile */
                gap: 25px; 
                width: 100% !important;
            }
        }
      `}</style>
    </div>
  );
}

// --- STYLES ---
// ✅ Vite Error FIX (justifyContent properly written)
const inputStyle = { 
    width:'100%', padding:'16px 20px', borderRadius:'14px', 
    border:'2px solid #f1f5f9', outline:'none', background:'#f8fafc', 
    fontSize:'0.95rem', color:'#1e293b', fontWeight:'600', transition:'all 0.2s',
    boxShadow:'inset 0 2px 4px rgba(0,0,0,0.01)', boxSizing: 'border-box' 
};

const btnPrimary = { 
    width:'100%', padding:'16px', border:'none', borderRadius:'14px', 
    color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', 
    boxShadow:'0 8px 20px -5px rgba(0,0,0,0.2)', fontSize:'1rem', fontWeight:'700',
    marginTop:'10px', boxSizing: 'border-box'
};