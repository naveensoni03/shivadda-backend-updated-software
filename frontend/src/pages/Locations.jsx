import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
// ✅ FIX: Added 'ChevronRight' and 'Save' to imports
import { 
  Globe, Map as MapIcon, Plus, Trash2, X, Flag, 
  Layers, ChevronDown, ChevronRight, Sparkles, LayoutList, MapPin, ArrowLeft, Save 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER COMPONENTS (NO UI CHANGE) ---

const GlassCard = ({ children, className, style }) => (
    <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
            background: "white",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.06)",
            overflow: "hidden",
            ...style
        }}
        className={className}
    >
        {children}
    </motion.div>
);

const GradientStat = ({ label, value, icon, color }) => (
    <motion.div 
        whileHover={{ scale: 1.05, y: -2 }}
        style={{
            background: color,
            padding: '12px 20px', borderRadius: '18px',
            color: 'white', display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 8px 20px -5px rgba(0,0,0,0.2)',
            minWidth: '140px'
        }}
    >
        <div style={{background:'rgba(255,255,255,0.2)', padding:'8px', borderRadius:'10px', display:'flex'}}>{icon}</div>
        <div>
            <div style={{fontSize:'0.7rem', fontWeight:'600', opacity:0.9, textTransform:'uppercase'}}>{label}</div>
            <div style={{fontSize:'1.3rem', fontWeight:'800', lineHeight:1}}>{value}</div>
        </div>
    </motion.div>
);

// --- MAIN COMPONENT ---

export default function Locations() {
  const [places, setPlaces] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]); 
  const [newPlace, setNewPlace] = useState({ name: "", place_type: "Country" });
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => { fetchPlaces(null); }, []);

  // ✅ FIXED: Safety check for Array to prevent map error
  const fetchPlaces = async (parentId) => {
    try {
      let url = parentId ? `locations/places/${parentId}/children/` : "locations/places/roots/";
      const res = await api.get(url);
      setPlaces(Array.isArray(res.data) ? res.data : []); 
    } catch (err) { 
        setPlaces([]); 
    }
  };

  const handleEnter = (place) => {
    setBreadcrumbs([...breadcrumbs, place]);
    fetchPlaces(place.id);
  };

  const handleBack = () => {
    const newBreadcrumbs = [...breadcrumbs];
    newBreadcrumbs.pop();
    setBreadcrumbs(newBreadcrumbs);
    const parentId = newBreadcrumbs.length > 0 ? newBreadcrumbs[newBreadcrumbs.length - 1].id : null;
    fetchPlaces(parentId);
  };

  const addPlace = async (e) => {
    e.preventDefault();
    if(!newPlace.name) return toast.error("Please enter a name");
    
    setLoadingId('addPlace');
    try {
        const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
        const payload = {
            ...newPlace,
            parent: parentId
        };
        await api.post("locations/places/", payload);
        toast.success(`${newPlace.place_type} Added!`);
        setNewPlace({ ...newPlace, name: "" });
        fetchPlaces(parentId);
    } catch(err) { 
        toast.error("Error adding location"); 
    }
    setLoadingId(null);
  };

  const deleteItem = async (id) => {
      if(!window.confirm("Delete this item?")) return;
      try {
          await api.delete(`locations/places/${id}/`);
          toast.success("Deleted");
          const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
          fetchPlaces(parentId);
      } catch(err) { toast.error("Delete failed"); }
  };

  const currentLevelName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : "Global";

  return (
    <div style={{display: "flex", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflow:'hidden'}}>
      <SidebarModern />
      <Toaster position="top-right" toastOptions={{style: {borderRadius:'12px', background:'#1e293b', color:'#fff'}}}/>
      
      <div style={{flex: 1, marginLeft: "280px", padding: "35px", height:'100vh', overflowY:'auto', position:'relative'}}>
        
        <div style={{position: 'fixed', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none'}} />
        
        {/* --- HEADER --- */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'35px'}}>
            <div>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                    {breadcrumbs.length > 0 && (
                        <button onClick={handleBack} style={{background:'white', border:'none', padding:'8px', borderRadius:'10px', cursor:'pointer', display:'flex', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}><ArrowLeft size={18} color="#4f46e5"/></button>
                    )}
                    <span style={{fontSize:'0.8rem', fontWeight:'bold', color:'#6366f1', textTransform:'uppercase', letterSpacing:'1px'}}>{currentLevelName} Directory</span>
                </div>
                <h1 style={{fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', marginBottom:'5px'}}>
                    Place Master <span style={{fontSize:'2rem', verticalAlign:'middle'}}>🌍</span>
                </h1>
                <p style={{color: '#64748b', fontSize: '1.05rem', fontWeight:'500'}}>Recursive Hierarchy for Virtual Space.</p>
            </div>
            <div style={{display:'flex', gap:'15px'}}>
                <GradientStat label="Sub-Regions" value={places.length} icon={<Layers size={18}/>} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
            </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:'35px', paddingBottom:'20px'}}>
            
            {/* LEFT: FORMS */}
            <div style={{display:'flex', flexDirection:'column', gap:'25px'}}>
                <GlassCard style={{padding:'25px', borderLeft:'5px solid #6366f1'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
                        <div style={{padding:'10px', borderRadius:'12px', background:'#eef2ff', color:'#4f46e5'}}><Plus size={20}/></div>
                        <div>
                            <h3 style={{fontSize:'1.1rem', fontWeight:'800', margin:0, color:'#1e293b'}}>Add in {currentLevelName}</h3>
                            <p style={{margin:0, fontSize:'0.75rem', color:'#64748b'}}>Define sub-level region</p>
                        </div>
                    </div>
                    <form onSubmit={addPlace} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <input 
                            placeholder="Location Name (e.g. India)" 
                            value={newPlace.name} 
                            onChange={e=>setNewPlace({...newPlace, name:e.target.value})} 
                            style={inputStyle} 
                        />
                        <div style={{position:'relative'}}>
                            <select 
                                value={newPlace.place_type} 
                                onChange={e=>setNewPlace({...newPlace, place_type:e.target.value})} 
                                style={{...inputStyle, appearance:'none', cursor:'pointer'}}
                            >
                                <option value="Continent">Continent</option>
                                <option value="Country">Country</option>
                                <option value="State">State</option>
                                <option value="District">District</option>
                                <option value="Tehsil">Tehsil</option>
                                <option value="Village">Village</option>
                                <option value="School">School/Center</option>
                            </select>
                            <ChevronDown size={18} style={{position:'absolute', right:'15px', top:'16px', color:'#94a3b8', pointerEvents:'none'}}/>
                        </div>
                        <motion.button whileTap={{scale:0.95}} type="submit" style={{...btnPrimary, width: '100%'}}>
                            {loadingId === 'addPlace' ? <Sparkles size={20} className="spin"/> : <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Save size={18}/> Save Location</span>}
                        </motion.button>
                    </form>
                </GlassCard>
            </div>

            {/* RIGHT: LIST (Retaining Card UI) */}
            <div>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', paddingLeft:'5px'}}>
                    <LayoutList size={22} color="#64748b"/>
                    <h3 style={{fontSize:'1.3rem', fontWeight:'800', color:'#334155', margin:0}}>Explore Hierarchy</h3>
                </div>

                <div style={{display:'grid', gap:'20px', paddingBottom:'50px'}}>
                    <AnimatePresence>
                    {places.length === 0 ? (
                        <div style={{textAlign:'center', padding:'60px', background:'white', borderRadius:'24px', border:'2px dashed #cbd5e1', color:'#94a3b8'}}>
                            <MapPin size={48} strokeWidth={1.5} style={{marginBottom:'15px', opacity:0.5}}/>
                            <p style={{fontSize:'1.1rem', fontWeight:'600'}}>Empty Region.</p>
                            <p style={{fontSize:'0.9rem'}}>Add sub-locations to this territory.</p>
                        </div>
                    ) : places.map(place => (
                        <motion.div 
                            key={place.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{
                                background:'white', borderRadius:'20px', overflow:'hidden',
                                boxShadow:'0 4px 15px -3px rgba(0,0,0,0.05)',
                                border:'1px solid #f1f5f9'
                            }}
                        >
                            <div style={{padding:'18px 24px', background:'linear-gradient(to right, #f8fafc, #fff)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'15px', cursor:'pointer'}} onClick={() => handleEnter(place)}>
                                    <div style={{width:'42px', height:'42px', borderRadius:'12px', background: place.children_count > 0 ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#f1f5f9', color: place.children_count > 0 ? 'white' : '#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem'}}>
                                        {place.place_type === 'Country' ? '🇮🇳' : <MapIcon size={20}/>}
                                    </div>
                                    <div>
                                        <div style={{fontWeight:'800', color:'#1e293b', fontSize:'1.1rem'}}>{place.name}</div>
                                        <div style={{fontSize:'0.7rem', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'1px'}}>
                                            {place.place_type} • Code: {place.hierarchy_code}
                                        </div>
                                    </div>
                                </div>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button onClick={() => handleEnter(place)} style={{...iconBtnStyle, color:'#6366f1'}}><ChevronRight size={18}/></button>
                                    <button onClick={() => deleteItem(place.id)} style={{...iconBtnStyle, color:'#ef4444'}}><Trash2 size={18}/></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// --- STYLES (NO CHANGE) ---
const inputStyle = { 
    width:'100%', padding:'14px 18px', borderRadius:'14px', 
    border:'2px solid #f1f5f9', outline:'none', background:'#f8fafc', 
    fontSize:'0.95rem', color:'#1e293b', fontWeight:'600', transition:'all 0.2s'
};

const btnPrimary = { 
    height:'52px', border:'none', borderRadius:'14px', 
    background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'white', 
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', 
    boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)', fontWeight:'bold'
};

const iconBtnStyle = { 
    width:'36px', height:'36px', borderRadius:'10px', border:'1px solid #f1f5f9', 
    background:'white', cursor:'pointer', 
    display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' 
};