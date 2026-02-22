import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { 
  Globe, Map as MapIcon, Plus, Trash2, X, Flag, 
  Layers, ChevronDown, ChevronRight, Sparkles, LayoutList, MapPin, ArrowLeft, Save,
  CheckSquare, Check, Eye, EyeOff, Power 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER COMPONENTS ---
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
  
  // ✅ FIXED: Changed default status to 'Active' to match backend
  const [newPlace, setNewPlace] = useState({ 
      name: "", 
      place_type: "Country",
      space_type: "Physical", 
      place_uses_for: "None", 
      pin_code: "",
      zip_code: "",
      beat_no: "",
      village_code: "",
      virtual_id: "",
      google_map_id: "",
      latitude: "",
      longitude: "",
      work_status: "Ministerial Office",
      status: "Active" 
  });
  
  const [loadingId, setLoadingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { 
      fetchPlaces(null); 
      setSelectedIds([]); 
  }, []);

  const fetchPlaces = async (parentId) => {
    try {
      let url = parentId ? `locations/places/${parentId}/children/` : "locations/places/roots/";
      const res = await api.get(url);
      setPlaces(Array.isArray(res.data) ? res.data : []); 
      setSelectedIds([]); 
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
    if(!newPlace.name) return toast.error("Please enter a location name");
    
    setLoadingId('addPlace');
    try {
        const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
        
        // 🔥 SMART PAYLOAD CLEANER: Jo box khali hain, unhe backend ko mat bhejo (Prevents 400 Error)
        const payload = { ...newPlace, parent: parentId };
        Object.keys(payload).forEach(key => {
            if (payload[key] === "" || payload[key] === "None") {
                delete payload[key];
            }
        });

        await api.post("locations/places/", payload);
        toast.success(`${newPlace.place_type} Added Successfully!`);
        
        // Reset form
        setNewPlace({ 
            name: "", place_type: "Country", space_type: "Physical", place_uses_for: "None", 
            pin_code: "", zip_code: "", beat_no: "", village_code: "", virtual_id: "", 
            google_map_id: "", latitude: "", longitude: "", work_status: "Ministerial Office", status: "Active" 
        });
        fetchPlaces(parentId);
    } catch(err) { 
        let errorMsg = "Error adding location.";
        if (err.response && err.response.data) {
            const data = err.response.data;
            const firstKey = Object.keys(data)[0];
            errorMsg = Array.isArray(data[firstKey]) ? `${firstKey}: ${data[firstKey][0]}` : `${firstKey}: ${data[firstKey]}`;
        }
        toast.error(`Error: ${errorMsg}`); 
        console.error("EXACT 400 ERROR:", err.response?.data);
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

  const handleSelectAll = () => {
      if (selectedIds.length === places.length) setSelectedIds([]); 
      else setSelectedIds(places.map(p => p.id)); 
  };

  const toggleSelect = (id) => {
      if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(itemId => itemId !== id));
      else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkDelete = async () => {
      if(!window.confirm(`Delete ${selectedIds.length} locations permanently?`)) return;
      const loadToast = toast.loading(`Deleting ${selectedIds.length} items...`);
      try {
          await Promise.all(selectedIds.map(id => api.delete(`locations/places/${id}/`)));
          toast.success(`Successfully deleted ${selectedIds.length} items!`, {id: loadToast});
          const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
          fetchPlaces(parentId);
      } catch (err) {
          toast.error("Some items failed to delete.", {id: loadToast});
      }
  };

  // ✅ FIXED: Bulk Status ab backend format me bhejega ('Active' / 'Inactive')
  const handleBulkStatus = async (newStatus) => {
      const loadToast = toast.loading(`Updating status...`);
      try {
          await Promise.all(selectedIds.map(id => api.patch(`locations/places/${id}/`, { status: newStatus })));
          toast.success(`Status updated!`, {id: loadToast});
          const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
          fetchPlaces(parentId);
      } catch (err) {
          let errorMsg = "Status update failed.";
          if (err.response && err.response.data) {
              const data = err.response.data;
              const firstKey = Object.keys(data)[0];
              errorMsg = Array.isArray(data[firstKey]) ? `${firstKey}: ${data[firstKey][0]}` : `${firstKey}: ${data[firstKey]}`;
          }
          toast.error(`Error: ${errorMsg}`, {id: loadToast});
      }
  };

  const currentLevelName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : "Global";

  return (
    <div style={{display: "flex", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflow:'hidden'}}>
      <SidebarModern />
      <Toaster position="top-right" toastOptions={{style: {borderRadius:'12px', background:'#1e293b', color:'#fff'}}}/>
      
      <div className="locations-main-view hide-scrollbar">
        <div style={{position: 'fixed', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none'}} />
        
        {/* --- HEADER --- */}
        <div className="locations-header">
            <div>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                    {breadcrumbs.length > 0 && (
                        <button onClick={handleBack} style={{background:'white', border:'none', padding:'8px', borderRadius:'10px', cursor:'pointer', display:'flex', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}><ArrowLeft size={18} color="#4f46e5"/></button>
                    )}
                    <span style={{fontSize:'0.8rem', fontWeight:'bold', color:'#6366f1', textTransform:'uppercase', letterSpacing:'1px'}}>{currentLevelName} Directory</span>
                </div>
                <h1 style={{fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin:0}}>
                    Place Master <span style={{fontSize:'2rem', verticalAlign:'middle'}}>🌍</span>
                </h1>
                <p style={{color: '#64748b', fontSize: '1.05rem', fontWeight:'500', marginTop:'5px'}}>Advanced Global Hierarchy & Space Control.</p>
            </div>
            <div style={{display:'flex', gap:'15px'}}>
                <GradientStat label="Sub-Regions" value={places.length} icon={<Layers size={18}/>} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
            </div>
        </div>

        <div className="locations-content-grid">
            
            {/* LEFT: ADVANCED FORMS */}
            <div style={{display:'flex', flexDirection:'column', gap:'25px'}}>
                <GlassCard style={{padding:'25px', borderLeft:'5px solid #6366f1'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
                        <div style={{padding:'10px', borderRadius:'12px', background:'#eef2ff', color:'#4f46e5'}}><Plus size={20}/></div>
                        <div>
                            <h3 style={{fontSize:'1.1rem', fontWeight:'800', margin:0, color:'#1e293b'}}>Add in {currentLevelName}</h3>
                            <p style={{margin:0, fontSize:'0.75rem', color:'#64748b'}}>Super Admin Place Configuration</p>
                        </div>
                    </div>

                    <form onSubmit={addPlace} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                        
                        <div className="form-row">
                            <input placeholder="Location Name" value={newPlace.name} onChange={e=>setNewPlace({...newPlace, name:e.target.value})} style={inputStyle} />
                            <div style={{position:'relative', flex: 1}}>
                                <select value={newPlace.place_type} onChange={e=>setNewPlace({...newPlace, place_type:e.target.value})} style={{...inputStyle, appearance:'none'}}>
                                    <option value="Global">Global</option>
                                    <option value="Continent">Continent</option>
                                    <option value="Country">Country</option>
                                    <option value="State">State</option>
                                    <option value="District">District</option>
                                    <option value="Tehsil">Tehsil</option>
                                    <option value="Block">Block</option>
                                    <option value="Colony">Colony</option>
                                    <option value="Village">Village</option>
                                    <option value="School">School/Center</option>
                                </select>
                                <ChevronDown size={18} className="select-icon"/>
                            </div>
                        </div>

                        <div className="form-row">
                            <div style={{position:'relative', flex: 1}}>
                                <select value={newPlace.space_type} onChange={e=>setNewPlace({...newPlace, space_type:e.target.value})} style={{...inputStyle, appearance:'none', color:'#4f46e5'}}>
                                    <option value="Physical">Physical Space</option>
                                    <option value="Virtual">Virtual Space</option>
                                </select>
                                <ChevronDown size={18} className="select-icon"/>
                            </div>
                            <div style={{position:'relative', flex: 1}}>
                                <select value={newPlace.place_uses_for} onChange={e=>setNewPlace({...newPlace, place_uses_for:e.target.value})} style={{...inputStyle, appearance:'none'}}>
                                    <option value="None">-- Uses For --</option>
                                    <option value="Foundation">Foundation</option>
                                    <option value="Preparatory">Preparatory</option>
                                    <option value="Middle">Middle</option>
                                    <option value="Secondary">Secondary</option>
                                    <option value="Higher Classes">Higher Classes</option>
                                    <option value="PHD Plus">PHD Plus</option>
                                    <option value="Professional">Professional</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Vacational">Vacational</option>
                                    <option value="Academic Professional">Academic Professional</option>
                                    <option value="Academic and Technical">Academic & Technical</option>
                                    <option value="Academic Vacational">Academic Vacational</option>
                                    <option value="Others">Others</option>
                                </select>
                                <ChevronDown size={18} className="select-icon"/>
                            </div>
                        </div>

                        <div className="form-row">
                            <input placeholder="PIN Code" value={newPlace.pin_code} onChange={e=>setNewPlace({...newPlace, pin_code:e.target.value})} style={inputStyle} />
                            <input placeholder="ZIP Code" value={newPlace.zip_code} onChange={e=>setNewPlace({...newPlace, zip_code:e.target.value})} style={inputStyle} />
                        </div>

                        <div className="form-row">
                            <input placeholder="Beat No." value={newPlace.beat_no} onChange={e=>setNewPlace({...newPlace, beat_no:e.target.value})} style={inputStyle} />
                            <input placeholder="Village Code" value={newPlace.village_code} onChange={e=>setNewPlace({...newPlace, village_code:e.target.value})} style={inputStyle} />
                        </div>

                        <div className="form-row">
                            <input placeholder="Virtual ID" value={newPlace.virtual_id} onChange={e=>setNewPlace({...newPlace, virtual_id:e.target.value})} style={inputStyle} />
                            <input placeholder="Google Map Virtual ID" value={newPlace.google_map_id} onChange={e=>setNewPlace({...newPlace, google_map_id:e.target.value})} style={inputStyle} />
                        </div>

                        <div className="form-row">
                            <input placeholder="Latitude" value={newPlace.latitude} onChange={e=>setNewPlace({...newPlace, latitude:e.target.value})} style={inputStyle} />
                            <input placeholder="Longitude" value={newPlace.longitude} onChange={e=>setNewPlace({...newPlace, longitude:e.target.value})} style={inputStyle} />
                        </div>

                        <div className="form-row">
                            <div style={{position:'relative', flex: 1}}>
                                <select value={newPlace.work_status} onChange={e=>setNewPlace({...newPlace, work_status:e.target.value})} style={{...inputStyle, appearance:'none'}}>
                                    <option value="Ministerial Office">Ministerial Office</option>
                                    <option value="Working Fields">Working Fields</option>
                                    <option value="Both">Both (Office + Field)</option>
                                    <option value="None">None</option>
                                </select>
                                <ChevronDown size={18} className="select-icon"/>
                            </div>
                            <div style={{position:'relative', flex: 1}}>
                                {/* ✅ FIXED: Matches Backend Choices Exactly */}
                                <select value={newPlace.status} onChange={e=>setNewPlace({...newPlace, status:e.target.value})} style={{...inputStyle, appearance:'none'}}>
                                    <option value="Active">Active / Show</option>
                                    <option value="Inactive">Inactive / Hide</option>
                                </select>
                                <ChevronDown size={18} className="select-icon"/>
                            </div>
                        </div>

                        <motion.button whileTap={{scale:0.98}} type="submit" style={{...btnPrimary, width: '100%', marginTop:'10px'}}>
                            {loadingId === 'addPlace' ? <Sparkles size={20} className="spin"/> : <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Save size={18}/> Save Master Place</span>}
                        </motion.button>
                    </form>
                </GlassCard>
            </div>

            {/* RIGHT: EXPLORE LIST WITH BULK ACTIONS */}
            <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', paddingLeft:'5px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <LayoutList size={22} color="#64748b"/>
                        <h3 style={{fontSize:'1.3rem', fontWeight:'800', color:'#334155', margin:0}}>Explore Hierarchy</h3>
                    </div>

                    {places.length > 0 && (
                        <button 
                            onClick={handleSelectAll} 
                            style={{background:'white', border:'1px solid #cbd5e1', padding:'8px 15px', borderRadius:'10px', fontSize:'0.85rem', fontWeight:'700', color:'#475569', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}
                        >
                            {selectedIds.length === places.length ? <CheckSquare size={16} color="#6366f1"/> : <span style={{width:'14px', height:'14px', border:'2px solid #cbd5e1', borderRadius:'4px'}}></span>}
                            {selectedIds.length === places.length ? "Deselect All" : "Select All"}
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            style={{background:'#1e293b', padding:'12px 20px', borderRadius:'16px', marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', color:'white', boxShadow:'0 10px 25px rgba(0,0,0,0.2)'}}
                        >
                            <span style={{fontWeight:'700', fontSize:'0.9rem'}}>{selectedIds.length} Selected</span>
                            <div style={{display:'flex', gap:'10px'}}>
                                {/* ✅ FIXED: Sending 'Active' and 'Inactive' to Backend */}
                                <button onClick={() => handleBulkStatus('Active')} style={bulkBtnStyle} title="Activate"><Check size={16}/> Activate</button>
                                <button onClick={() => handleBulkStatus('Inactive')} style={bulkBtnStyle} title="Hide / Deactivate"><EyeOff size={16}/> Hide</button>
                                <button onClick={handleBulkDelete} style={{...bulkBtnStyle, background:'#ef4444', border:'none'}} title="Delete Selected"><Trash2 size={16} color="white"/> Delete</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                background: selectedIds.includes(place.id) ? '#eef2ff' : 'white', 
                                borderRadius:'20px', overflow:'hidden',
                                boxShadow:'0 4px 15px -3px rgba(0,0,0,0.05)',
                                border: selectedIds.includes(place.id) ? '1px solid #818cf8' : '1px solid #f1f5f9',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div className="location-card-inner">
                                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(place.id)} 
                                        onChange={() => toggleSelect(place.id)}
                                        style={{width:'20px', height:'20px', cursor:'pointer', accentColor:'#6366f1'}}
                                    />
                                    
                                    <div style={{width:'42px', height:'42px', borderRadius:'12px', background: place.children_count > 0 ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#f1f5f9', color: place.children_count > 0 ? 'white' : '#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', cursor:'pointer'}} onClick={() => handleEnter(place)}>
                                        {place.place_type === 'Country' ? '🇮🇳' : <MapIcon size={20}/>}
                                    </div>
                                    <div style={{cursor:'pointer'}} onClick={() => handleEnter(place)}>
                                        <div style={{fontWeight:'800', color:'#1e293b', fontSize:'1.1rem'}}>{place.name}</div>
                                        <div style={{fontSize:'0.7rem', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'1px', display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'4px'}}>
                                            <span style={{background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px'}}>{place.place_type}</span>
                                            {place.space_type && <span style={{background:'#eef2ff', color:'#4f46e5', padding:'2px 6px', borderRadius:'4px'}}>{place.space_type}</span>}
                                            {place.place_uses_for && place.place_uses_for !== "None" && <span>• {place.place_uses_for}</span>}
                                            {place.status && (
                                                <span style={{color: place.status === 'Active' ? '#10b981' : '#ef4444'}}>
                                                    • {place.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button onClick={() => handleEnter(place)} style={{...iconBtnStyle, color:'#6366f1'}} title="Explore Inside"><ChevronRight size={18}/></button>
                                    <button onClick={() => deleteItem(place.id)} style={{...iconBtnStyle, color:'#ef4444'}} title="Delete"><Trash2 size={18}/></button>
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }

        .locations-main-view { flex: 1; margin-left: 280px; padding: 35px; height: 100vh; overflow-y: auto; position: relative; box-sizing: border-box; transition: all 0.3s ease; }
        .locations-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .locations-content-grid { display: grid; grid-template-columns: 400px 1fr; gap: 35px; padding-bottom: 20px; }
        .location-card-inner { padding: 18px 24px; background: transparent; display: flex; justify-content: space-between; align-items: center; }
        
        .form-row { display: flex; gap: 12px; width: 100%; }
        .form-row > input, .form-row > div { flex: 1; min-width: 0; }
        .select-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }

        @media (max-width: 850px) {
            .locations-main-view { margin-left: 0 !important; padding: 15px !important; padding-top: 90px !important; width: 100% !important; }
            .locations-header { flex-direction: column; align-items: flex-start; gap: 20px; }
            .locations-content-grid { grid-template-columns: 1fr; gap: 25px; }
            .location-card-inner { padding: 15px; }
        }
      `}</style>
    </div>
  );
}

// --- STYLES ---
const inputStyle = { 
    width:'100%', padding:'12px 15px', borderRadius:'12px', 
    border:'2px solid #f1f5f9', outline:'none', background:'#f8fafc', 
    fontSize:'0.85rem', color:'#1e293b', fontWeight:'600', transition:'all 0.2s', boxSizing:'border-box'
};

const btnPrimary = { 
    height:'48px', border:'none', borderRadius:'12px', 
    background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'white', 
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', 
    boxShadow:'0 4px 12px rgba(99, 102, 241, 0.3)', fontWeight:'bold', fontSize:'0.95rem'
};

const iconBtnStyle = { 
    width:'36px', height:'36px', borderRadius:'10px', border:'1px solid #f1f5f9', 
    background:'white', cursor:'pointer', 
    display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' 
};

const bulkBtnStyle = {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', 
    color: 'white', padding: '6px 12px', borderRadius: '8px', 
    fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', 
    display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
};