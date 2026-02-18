import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, Layers, Cpu, Radio, Plus, Trash2, 
  Sparkles, LayoutGrid, Eye, AlertTriangle, X 
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="responsive-modal"
                    style={{
                        background: 'white', padding: '30px', borderRadius: '24px',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', textAlign:'center', position:'relative'
                    }}
                >
                    <button onClick={onClose} style={{position:'absolute', right:'20px', top:'20px', border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8'}}><X size={20}/></button>
                    <div style={{width:'60px', height:'60px', borderRadius:'50%', background:'#fee2e2', color:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                        <AlertTriangle size={32} strokeWidth={1.5}/>
                    </div>
                    <h3 style={{fontSize:'1.5rem', fontWeight:'800', color:'#1e293b', marginBottom:'10px'}}>Are you sure?</h3>
                    <p style={{color:'#64748b', marginBottom:'25px'}}>Do you really want to delete this service record? This action cannot be undone.</p>
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

const ViewModal = ({ data, onClose, config }) => (
    <AnimatePresence>
        {data && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', 
                    backdropFilter: 'blur(5px)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'
                }}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="responsive-modal"
                    style={{
                        background: 'white', padding: '0', borderRadius: '24px', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow:'hidden'
                    }}
                >
                    <div style={{background: config.color, padding:'30px', position:'relative'}}>
                        <button onClick={onClose} style={{position:'absolute', right:'20px', top:'20px', border:'none', background:'rgba(255,255,255,0.2)', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}><X size={18}/></button>
                        <div style={{width:'60px', height:'60px', borderRadius:'16px', background:'rgba(255,255,255,0.2)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'15px', backdropFilter:'blur(5px)'}}>
                            {config.icon}
                        </div>
                        <h2 style={{margin:0, color:'white', fontSize:'1.6rem', fontWeight:'800'}}>{data.name}</h2>
                        <p style={{margin:'5px 0 0', color:'rgba(255,255,255,0.8)', fontSize:'0.9rem'}}>{config.title} Details</p>
                    </div>

                    <div style={{padding:'30px', maxHeight: '60vh', overflowY: 'auto'}}>
                        <div style={{display:'grid', gap:'15px'}}>
                            <div style={{padding:'15px', background:'#f8fafc', borderRadius:'14px', border:'1px solid #f1f5f9'}}>
                                <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px'}}>Record ID</div>
                                <div style={{fontSize:'1rem', fontWeight:'700', color:'#334155'}}>#{data.id}</div>
                            </div>
                            
                            {data.description && (
                                <div style={{padding:'15px', background:'#f8fafc', borderRadius:'14px', border:'1px solid #f1f5f9'}}>
                                    <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px'}}>Description</div>
                                    <div style={{fontSize:'1rem', fontWeight:'600', color:'#334155'}}>{data.description}</div>
                                </div>
                            )}
                            
                            {data.code && (
                                <div style={{padding:'15px', background:'#f8fafc', borderRadius:'14px', border:'1px solid #f1f5f9'}}>
                                    <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px'}}>Short Code</div>
                                    <div style={{fontSize:'1rem', fontWeight:'700', color:'#334155', display:'flex', alignItems:'center', gap:'8px'}}>
                                        <span style={{background:'#e0e7ff', color:'#4f46e5', padding:'4px 10px', borderRadius:'8px', fontSize:'0.85rem'}}>{data.code}</span>
                                    </div>
                                </div>
                            )}

                            {data.icon_name && (
                                <div style={{padding:'15px', background:'#f8fafc', borderRadius:'14px', border:'1px solid #f1f5f9'}}>
                                    <div style={{fontSize:'0.7rem', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px'}}>Icon Identifier</div>
                                    <div style={{fontSize:'1rem', fontWeight:'600', color:'#334155'}}>{data.icon_name}</div>
                                </div>
                            )}
                        </div>

                        <button onClick={onClose} style={{marginTop:'25px', width:'100%', padding:'16px', borderRadius:'14px', border:'none', background:'#f1f5f9', color:'#64748b', fontWeight:'700', cursor:'pointer', fontSize:'1rem', transition:'all 0.2s'}}>
                            Close Panel
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
  const [data, setData] = useState({ levels: [], types: [], modes: [] });
  const [newItem, setNewItem] = useState({ name: "", desc: "", code: "", icon: "" });
  const [loading, setLoading] = useState(false);
  
  // State for Modals
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [isDeletingButton, setIsDeletingButton] = useState(false);
  const [viewData, setViewData] = useState(null); 

  useEffect(() => { fetchAllServices(); }, []);

  const fetchAllServices = async () => {
    try {
      const [l, t, m] = await Promise.all([
          api.get("services/levels/"),
          api.get("services/types/"),
          api.get("services/modes/")
      ]);
      setData({ levels: l.data, types: t.data, modes: m.data });
    } catch (err) { toast.error("Failed to load services"); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if(!newItem.name) return toast.error("Name is required");
    setLoading(true);
    
    let endpoint = "";
    let payload = { name: newItem.name };

    if(activeTab === 'levels') { endpoint = "services/levels/"; payload.description = newItem.desc; }
    else if(activeTab === 'types') { endpoint = "services/types/"; payload.code = newItem.code; }
    else { endpoint = "services/modes/"; payload.icon_name = newItem.icon; }

    try {
        await api.post(endpoint, payload);
        toast.success("Added Successfully! ✨");
        setNewItem({ name: "", desc: "", code: "", icon: "" });
        fetchAllServices();
    } catch(err) { toast.error("Creation Failed. Check duplicates."); }
    setLoading(false);
  };

  const openDeleteModal = (id) => {
      setDeleteModal({ show: true, id });
  };

  const executeDelete = async () => {
      const id = deleteModal.id;
      if(!id) return;
      setIsDeletingButton(true);
      let endpoint = activeTab === 'levels' ? `services/levels/${id}/` : activeTab === 'types' ? `services/types/${id}/` : `services/modes/${id}/`;
      try {
          await api.delete(endpoint);
          toast.success("Deleted successfully");
          fetchAllServices();
          setDeleteModal({ show: false, id: null }); 
      } catch(err) { toast.error("Delete failed"); }
      setIsDeletingButton(false);
  };

  const contentConfig = {
      levels: { title: "Education Levels", subtitle: "Define hierarchy (e.g. Primary, Secondary)", icon: <Layers size={24}/>, color: '#6366f1' },
      types: { title: "Service Types", subtitle: "Nature of institution (e.g. Academic, Technical)", icon: <Briefcase size={24}/>, color: '#ec4899' },
      modes: { title: "Delivery Modes", subtitle: "How is it taught? (e.g. Online, Hybrid)", icon: <Radio size={24}/>, color: '#f59e0b' }
  };

  const currentConfig = contentConfig[activeTab];

  return (
    <div className="service-master-wrapper">
      <SidebarModern />
      <Toaster position="top-right" toastOptions={{style: {borderRadius:'12px', background:'#0f172a', color:'#fff'}}}/>
      
      {/* Delete Modal */}
      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({ show: false, id: null })} 
        onConfirm={executeDelete}
        isDeleting={isDeletingButton}
      />

      {/* View Modal */}
      <ViewModal 
        data={viewData} 
        onClose={() => setViewData(null)} 
        config={currentConfig} 
      />

      <div className="service-main-content">
        
        {/* Animated Background Blobs */}
        <div style={{position: 'fixed', top: '-20%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none'}} />
        <div style={{position: 'fixed', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none'}} />

        {/* --- HEADER --- */}
        <div style={{marginBottom:'35px'}}>
            <h1 style={{fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin: '0 0 5px 0'}}>
                Service Master <span style={{fontSize:'2rem', verticalAlign:'middle'}}>🛠️</span>
            </h1>
            <p style={{color: '#64748b', fontSize: '1.05rem', fontWeight:'500', margin: 0}}>Configure global education parameters.</p>
        </div>

        {/* --- TABS --- */}
        <div className="tabs-container">
            <TabButton active={activeTab === 'levels'} onClick={() => setActiveTab('levels')} label="Education Levels" icon={<Layers size={18}/>} />
            <TabButton active={activeTab === 'types'} onClick={() => setActiveTab('types')} label="Service Types" icon={<Briefcase size={18}/>} />
            <TabButton active={activeTab === 'modes'} onClick={() => setActiveTab('modes')} label="Service Modes" icon={<Radio size={18}/>} />
        </div>

        {/* --- MAIN CONTENT (Split View) --- */}
        <div className="service-content-grid">
            
            {/* LEFT: FORM */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
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
                            <input 
                                placeholder="Name (e.g. Senior Secondary)" 
                                value={newItem.name} 
                                onChange={e=>setNewItem({...newItem, name:e.target.value})} 
                                style={inputStyle} 
                            />
                            
                            {/* Conditional Inputs based on Tab */}
                            {activeTab === 'levels' && (
                                <textarea 
                                    rows="3"
                                    placeholder="Description (Optional)" 
                                    value={newItem.desc} 
                                    onChange={e=>setNewItem({...newItem, desc:e.target.value})} 
                                    style={{...inputStyle, resize:'none'}} 
                                />
                            )}
                            {activeTab === 'types' && (
                                <input 
                                    placeholder="Short Code (e.g. K12)" 
                                    value={newItem.code} 
                                    onChange={e=>setNewItem({...newItem, code:e.target.value})} 
                                    style={{...inputStyle, textTransform:'uppercase', fontWeight:'700'}} 
                                />
                            )}
                            {activeTab === 'modes' && (
                                <input 
                                    placeholder="Icon Name (e.g. wifi)" 
                                    value={newItem.icon} 
                                    onChange={e=>setNewItem({...newItem, icon:e.target.value})} 
                                    style={inputStyle} 
                                />
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

            {/* RIGHT: LIST */}
            <div>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
                    <LayoutGrid size={20} color="#64748b"/>
                    <h3 style={{fontSize:'1.2rem', fontWeight:'800', color:'#334155', margin:0}}>Active Records</h3>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
                    <AnimatePresence mode="popLayout">
                        {data[activeTab].length === 0 ? (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{gridColumn:'1/-1', textAlign:'center', padding:'50px', background:'white', borderRadius:'20px', border:'2px dashed #cbd5e1', color:'#94a3b8'}}>
                                <Cpu size={40} style={{marginBottom:'10px', opacity:0.5}}/>
                                <p>No records found. Add one to begin.</p>
                            </motion.div>
                        ) : data[activeTab].map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                style={listCardStyle}
                            >
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                    <div>
                                        <div style={{fontSize:'1rem', fontWeight:'800', color:'#1e293b'}}>{item.name}</div>
                                        {activeTab === 'levels' && <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'4px'}}>{item.description || 'No description'}</div>}
                                        {activeTab === 'types' && <div style={{fontSize:'0.75rem', fontWeight:'700', background:'#f1f5f9', padding:'2px 8px', borderRadius:'6px', display:'inline-block', marginTop:'5px', color:'#475569'}}>{item.code}</div>}
                                        {activeTab === 'modes' && item.icon_name && <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'4px'}}>Icon: {item.icon_name}</div>}
                                    </div>
                                    
                                    {/* ACTIONS BUTTONS (High Visibility) */}
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => setViewData(item)} 
                                            style={viewIconStyle} title="View Details"
                                        >
                                            <Eye size={20}/>
                                        </motion.button>
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => openDeleteModal(item.id)} 
                                            style={deleteIconStyle} title="Delete Item"
                                        >
                                            <Trash2 size={20}/>
                                        </motion.button>
                                    </div>

                                </div>
                                <div style={{marginTop:'15px', height:'4px', width:'40px', borderRadius:'2px', background: currentConfig.color}}></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

        </div>
      </div>
      
      {/* 🚀 CSS FOR 100% RESPONSIVENESS */}
      <style>{`
        /* Reset & Core Setup */
        html, body, #root { margin: 0; padding: 0; height: 100%; }
        
        .service-master-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #f8fafc;
            font-family: 'Inter', sans-serif;
        }

        .service-main-content {
            flex: 1;
            margin-left: 280px; 
            padding: 35px;
            padding-bottom: 120px !important; 
            height: 100vh;
            overflow-y: auto !important; 
            box-sizing: border-box;
            max-width: calc(100% - 280px);
            position: relative;
            z-index: 1;
        }

        /* ✅ FIXED: Desktop Split View and Mobile Stack View */
        .service-content-grid {
            display: grid;
            grid-template-columns: 380px 1fr;
            gap: 35px;
            padding-bottom: 50px;
            align-items: start;
        }

        /* ✅ FIXED: Horizontal Scroll for Tabs on Mobile */
        .tabs-container {
            display: flex; gap: 15px; margin-bottom: 35px;
            overflow-x: auto; padding-bottom: 5px;
            -webkit-overflow-scrolling: touch;
        }
        .tabs-container::-webkit-scrollbar { display: none; } /* Hides scrollbar for cleaner look */

        /* Modal Responsive Classes */
        .responsive-modal {
            width: 420px;
            max-width: 90vw !important;
            box-sizing: border-box;
        }

        /* Animations */
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
            .service-main-content { margin-left: 0 !important; max-width: 100%; width: 100%; }
        }

        @media (max-width: 850px) {
            /* Unlock Scroll on Mobile completely */
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            
            .service-master-wrapper {
                display: block !important; 
                height: auto !important;
                min-height: 100vh !important;
            }

            .service-main-content {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 85px !important; 
                padding-bottom: 180px !important; /* Space for chatbot */
                width: 100vw !important;
                max-width: 100vw !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                display: block !important; /* Break Flex lock */
            }

            /* ✅ FIXED: Break the grid into a single column for mobile */
            .service-content-grid {
                grid-template-columns: 1fr !important;
                gap: 25px;
            }
        }
      `}</style>
    </div>
  );
}

// --- STYLES ---
const inputStyle = { 
    width:'100%', padding:'16px 20px', borderRadius:'14px', 
    border:'2px solid #f1f5f9', outline:'none', background:'#f8fafc', 
    fontSize:'0.95rem', color:'#1e293b', fontWeight:'600', transition:'all 0.2s',
    boxShadow:'inset 0 2px 4px rgba(0,0,0,0.01)',
    boxSizing: 'border-box' // Essential for full width inputs
};

const btnPrimary = { 
    width:'100%', padding:'16px', border:'none', borderRadius:'14px', 
    color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', 
    boxShadow:'0 8px 20px -5px rgba(0,0,0,0.2)', fontSize:'1rem', fontWeight:'700',
    marginTop:'10px', boxSizing: 'border-box'
};

const listCardStyle = { 
    background:'white', borderRadius:'20px', padding:'20px',
    border:'1px solid #f1f5f9', boxShadow:'0 4px 10px -2px rgba(0,0,0,0.03)',
    cursor:'default'
};

const deleteIconStyle = { 
    width:'42px', height:'42px', borderRadius:'12px', border:'none', 
    background:'#ef4444', color:'white', cursor:'pointer', 
    display:'flex', alignItems:'center', justifyContent:'center', 
    boxShadow:'0 4px 10px rgba(239, 68, 68, 0.4)', transition:'all 0.2s', flexShrink: 0
};

const viewIconStyle = { 
    width:'42px', height:'42px', borderRadius:'12px', border:'none', 
    background:'#3b82f6', color:'white', cursor:'pointer', 
    display:'flex', alignItems:'center', justifyContent:'center', 
    boxShadow:'0 4px 10px rgba(59, 130, 246, 0.4)', transition:'all 0.2s', flexShrink: 0
};