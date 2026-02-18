import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./dashboard.css"; 

// --- FIX LEAFLET DEFAULT ICON ISSUE ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Bus Icon
    shadowUrl: iconShadow,
    iconSize: [38, 38], 
    iconAnchor: [19, 38],
    popupAnchor: [0, -30]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to Center Map on Bus
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function Transport() {
  const [routes, setRoutes] = useState([]);
  
  // States
  const [activePanel, setActivePanel] = useState("none"); 
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Realtime Location State
  const [busLocation, setBusLocation] = useState({ lat: 28.6139, lng: 77.2090 }); 

  // Form State
  const [formData, setFormData] = useState({ 
    routeName: "", busNumber: "", driverName: "", driverPhone: "", capacity: 40, fee: 2000 
  });

  useEffect(() => {
    setRoutes([
      { id: 1, name: "Route 1: City Center", busNumber: "UP-15-AB-1234", driver: "Ramesh Kumar", phone: "9876543210", capacity: 50, filled: 45, status: "On Time", color: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", startLat: 28.6139, startLng: 77.2090 },
      { id: 2, name: "Route 2: Shastri Nagar", busNumber: "UP-15-XY-9876", driver: "Suresh Singh", phone: "8765432109", capacity: 40, filled: 38, status: "Delayed", color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", startLat: 28.5355, startLng: 77.3910 },
      { id: 3, name: "Route 3: Delhi Road", busNumber: "UP-15-CD-4567", driver: "Mahesh Yadav", phone: "7654321098", capacity: 50, filled: 20, status: "On Time", color: "linear-gradient(135deg, #10b981 0%, #059669 100%)", startLat: 28.7041, startLng: 77.1025 },
      { id: 4, name: "Route 4: Kanker Khera", busNumber: "UP-15-EF-1122", driver: "Rajesh Gupta", phone: "6543210987", capacity: 30, filled: 30, status: "Full", color: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", startLat: 28.4595, startLng: 77.0266 },
    ]);
  }, []);

  // --- GPS SIMULATION ---
  useEffect(() => {
    let interval;
    if (activePanel === 'track' && selectedRoute) {
        interval = setInterval(() => {
            setBusLocation(prev => ({
                lat: prev.lat + 0.0001,
                lng: prev.lng + 0.0001
            }));
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [activePanel, selectedRoute]);

  // --- ACTIONS ---

  const handleOpenAdd = () => {
    setSelectedRoute(null);
    setFormData({ routeName: "", busNumber: "", driverName: "", driverPhone: "", capacity: 40, fee: 2000 });
    setActivePanel("form");
  };

  const handleEdit = (route) => {
    setSelectedRoute(route);
    setFormData({
        routeName: route.name, busNumber: route.busNumber, driverName: route.driver,
        driverPhone: route.phone, capacity: route.capacity, fee: 2000 
    });
    setActivePanel("form");
  };

  const handleTrack = (route) => {
    setSelectedRoute(route);
    setBusLocation({ lat: route.startLat, lng: route.startLng });
    setActivePanel("track");
  };

  const handleDelete = () => {
    const updated = routes.filter(r => r.id !== selectedRoute.id);
    setRoutes(updated);
    setActivePanel("none");
    setNotificationMsg("Route Deleted Successfully! 🗑️");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSave = () => {
    if(!formData.routeName) return;
    
    if (selectedRoute) {
        const updatedRoutes = routes.map(r => 
            r.id === selectedRoute.id ? { ...r, name: formData.routeName, busNumber: formData.busNumber, driver: formData.driverName, phone: formData.driverPhone, capacity: formData.capacity } : r
        );
        setRoutes(updatedRoutes);
        setNotificationMsg("Route Updated Successfully! ✅");
    } else {
        const newRoute = {
            id: routes.length + 1,
            name: formData.routeName,
            busNumber: formData.busNumber,
            driver: formData.driverName,
            phone: formData.driverPhone,
            capacity: formData.capacity,
            filled: 0,
            status: "Scheduled",
            color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            startLat: 28.6139, startLng: 77.2090
        };
        setRoutes([...routes, newRoute]);
        setNotificationMsg("New Vehicle Route Added! 🚌");
    }
    setActivePanel("none");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  // ✅ REAL CALL INTEGRATION LOGIC
  const handleCallDriver = (phone) => {
    // 1. Remove spaces/dashes to make it a clean number (e.g., "987 65" -> "98765")
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    
    // 2. Trigger the Native Dialer
    window.location.href = `tel:${cleanNumber}`;
  };

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: '#ffffff', outline: 'none', fontSize: '0.95rem', transition: '0.3s', boxSizing: 'border-box' };

  return (
    <div className="transport-page-wrapper">
      <div className="ambient-bg"></div>
      <SidebarModern />

      <div className="transport-main-content">
        
        {/* HEADER */}
        <header className="slide-in-down page-header">
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: '#0f172a' }}>Transport Fleet</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: '5px 0 0' }}>Live tracking, route management & driver details.</p>
          </div>
          <button className="btn-glow pulse-animation hover-scale-press" onClick={handleOpenAdd}>
            <span style={{marginRight: '8px', fontSize: '1.2rem'}}>+</span> Add Route
          </button>
        </header>

        {/* ROUTES GRID */}
        <div className="books-grid-modern">
            {routes.map((route, idx) => (
                <div key={route.id} className="book-card-premium fade-in-up" style={{animationDelay: `${idx * 0.1}s`, cursor:'default'}}>
                    <div style={{height: '140px', background: route.color, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'white', position: 'relative'}}>
                        <div>
                            <span style={{background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', backdropFilter: 'blur(5px)'}}>{route.busNumber}</span>
                            <h3 style={{margin: '10px 0 0', fontSize: '1.3rem', fontWeight: '800'}}>{route.name}</h3>
                        </div>
                        <div style={{fontSize: '2.5rem', opacity: 0.3}}>🚍</div>
                    </div>
                    <div style={{padding: '20px', background: 'white', flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #f1f5f9'}}>
                            <div>
                                <small style={{color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'}}>Driver</small>
                                <div style={{color: '#334155', fontWeight: '700'}}>{route.driver}</div>
                                
                                {/* ✅ CLICKABLE PHONE BUTTON */}
                                <button 
                                    onClick={() => handleCallDriver(route.phone)} 
                                    style={{
                                        background: 'transparent', border: 'none', padding: 0, 
                                        color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', 
                                        marginTop: '4px', display:'flex', alignItems:'center', gap:'5px', fontWeight:'600'
                                    }}
                                    className="hover-text-blue"
                                >
                                    📞 {route.phone}
                                </button>

                            </div>
                            <div style={{textAlign: 'right'}}>
                                <small style={{color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'}}>Status</small>
                                <div style={{color: route.status === 'Delayed' ? '#ef4444' : '#10b981', fontWeight: '800'}}>{route.status}</div>
                            </div>
                        </div>
                        <div style={{marginBottom: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#64748b'}}>
                            <span>Occupancy</span>
                            <span>{route.filled}/{route.capacity}</span>
                        </div>
                        <div style={{height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden'}}>
                            <div style={{width: `${(route.filled/route.capacity)*100}%`, background: route.filled >= route.capacity ? '#ef4444' : '#3b82f6', height: '100%'}}></div>
                        </div>
                        <div style={{display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '20px'}}>
                            <button className="btn-edit hover-lift" onClick={() => handleEdit(route)} style={{flex: 1, justifyContent: 'center'}}>Edit ✏️</button>
                            <button className="btn-monitor hover-lift" onClick={() => handleTrack(route)} style={{flex: 1, justifyContent: 'center'}}>Track GPS 🛰️</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* --- SLIDING PANEL --- */}
        {activePanel !== "none" && (
            <div className="overlay-blur" onClick={() => setActivePanel("none")}>
                <div className="luxe-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
                    
                    <div className="panel-header-simple" style={{borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px', flexShrink: 0}}>
                        <div>
                            <h2 style={{margin: '0 0 5px', color: '#0f172a', fontWeight:'800'}}>
                                {activePanel === 'track' ? 'Live GPS Tracking' : (selectedRoute ? 'Update Route' : 'Add New Route')}
                            </h2>
                            <p style={{margin: 0, color: '#64748b', fontSize: '0.9rem'}}>
                                {activePanel === 'track' ? `Tracking: ${selectedRoute?.busNumber}` : 'Manage fleet details.'}
                            </p>
                        </div>
                        <button className="close-circle-btn hover-rotate" onClick={() => setActivePanel("none")}>✕</button>
                    </div>
                    
                    <div className="panel-content-scroll" style={{overflowY: 'auto', flex: 1, paddingBottom: '20px'}}>
                        {/* 1. FORM VIEW */}
                        {activePanel === 'form' && (
                            <>
                                <div className="input-group"><label>Route Name</label><input type="text" placeholder="e.g. City Center Express" value={formData.routeName} onChange={(e) => setFormData({...formData, routeName: e.target.value})} style={inputStyle} /></div>
                                <div className="input-group"><label>Bus Number</label><input type="text" placeholder="e.g. UP-15-AB-9999" value={formData.busNumber} onChange={(e) => setFormData({...formData, busNumber: e.target.value})} style={inputStyle} /></div>
                                
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Driver Name</label><input type="text" placeholder="Driver Name" value={formData.driverName} onChange={(e) => setFormData({...formData, driverName: e.target.value})} style={inputStyle} /></div>
                                    <div className="input-group"><label>Driver Phone</label><input type="text" placeholder="+91..." value={formData.driverPhone} onChange={(e) => setFormData({...formData, driverPhone: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Seat Capacity</label><input type="number" placeholder="50" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} style={inputStyle} /></div>
                                    <div className="input-group"><label>Monthly Fee (₹)</label><input type="number" placeholder="2000" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} style={inputStyle} /></div>
                                </div>

                                <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                                    <button className="btn-confirm-gradient hover-lift" onClick={handleSave} style={{flex: 1, padding: '16px', fontSize: '1rem'}}>
                                        {selectedRoute ? 'Update Details' : 'Launch Route'}
                                    </button>
                                    {selectedRoute && (
                                        <button className="btn-glow hover-lift" onClick={handleDelete} style={{background:'#fee2e2', color:'#dc2626', flex: 0.4}}>
                                            Delete 🗑️
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {/* 2. REAL MAP VIEW (LEAFLET) */}
                        {activePanel === 'track' && selectedRoute && (
                            <div className="fade-in-up">
                                <div className="map-container-style">
                                    <MapContainer center={[busLocation.lat, busLocation.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[busLocation.lat, busLocation.lng]}>
                                            <Popup>
                                                <b>{selectedRoute.busNumber}</b><br />
                                                Driver: {selectedRoute.driver}<br />
                                                Speed: 45 km/h
                                            </Popup>
                                        </Marker>
                                        <RecenterAutomatically lat={busLocation.lat} lng={busLocation.lng} />
                                    </MapContainer>
                                </div>

                                <div className="grid-2-col">
                                    <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px'}}>
                                        <small style={{color:'#64748b', fontWeight:'700'}}>CURRENT SPEED</small>
                                        <h2 style={{margin:'5px 0', color:'#10b981'}}>45 km/h</h2>
                                    </div>
                                    <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px'}}>
                                        <small style={{color:'#64748b', fontWeight:'700'}}>LIVE STATUS</small>
                                        <h2 style={{margin:'5px 0', color:'#3b82f6'}}>Moving...</h2>
                                    </div>
                                </div>

                                <div style={{background:'#fff', border:'1px solid #f1f5f9', padding:'20px', borderRadius:'16px', marginTop:'10px'}}>
                                    <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                                        <div style={{width:'50px', height:'50px', background:'#e0e7ff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink: 0}}>👮‍♂️</div>
                                        <div>
                                            <h4 style={{margin:0, color:'#1e293b'}}>{selectedRoute.driver}</h4>
                                            <span style={{color:'#64748b', fontSize:'0.9rem'}}>Driver • ⭐ 4.8</span>
                                        </div>
                                        {/* ✅ CLICKABLE CALL BUTTON IN MAP */}
                                        <button 
                                            onClick={() => handleCallDriver(selectedRoute.phone)}
                                            style={{marginLeft:'auto', background:'#22c55e', border:'none', width:'40px', height:'40px', borderRadius:'50%', color:'white', cursor:'pointer', fontSize:'1.2rem', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', flexShrink: 0}}
                                            className="hover-scale-press"
                                        >
                                            📞
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        )}

        {/* --- SUCCESS TOAST --- */}
        {showSuccess && (
          <div className="overlay-blur centered-flex" style={{zIndex: 3000}}>
              <div className="glass-card bounce-in-glass success-card-luxe">
                <div className="success-ring-luxe"><span className="checkmark-anim">L</span></div>
                <h2 style={{fontSize: '1.5rem', fontWeight: '900', margin: '20px 0 10px', color: '#0f172a'}}>Success!</h2>
                <p style={{color: '#64748b', fontSize: '1rem', margin: 0}}>{notificationMsg}</p>
              </div>
          </div>
        )}

      </div>

      {/* 🚀 RESPONSIVE STYLES */}
      <style>{`
        /* Core Reset */
        html, body, #root { margin: 0; padding: 0; height: 100%; }
        
        .transport-page-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #f8fafc;
            font-family: 'Inter', sans-serif;
        }

        .transport-main-content {
            flex: 1;
            margin-left: 280px; 
            padding: 30px 40px;
            padding-bottom: 120px !important; 
            height: 100vh;
            overflow-y: auto !important; 
            box-sizing: border-box;
            max-width: calc(100% - 280px);
            position: relative;
            z-index: 1;
        }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; flex-shrink: 0; }

        /* Animations */
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes bounceInGlass { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes checkPop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes pulseBlue { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }

        .slide-in-down { animation: slideInDown 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .fade-in-up { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .slide-in-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .bounce-in-glass { animation: bounceInGlass 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .pulse-animation { animation: pulseBlue 2s infinite; }

        .btn-edit { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 10px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.9rem; display: flex; align-items: center; gap: 5px; }
        .btn-edit:hover { background: #0f172a; color: white; }
        .btn-monitor { background: #ecfdf5; color: #10b981; border: 1px solid #bbf7d0; padding: 10px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;}
        .btn-monitor:hover { background: #10b981; color: white; }

        .hover-text-blue:hover { color: #3b82f6 !important; text-decoration: underline; }
        .hover-scale-press:hover { transform: scale(1.05); transition: 0.1s; }

        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .luxe-panel { width: 450px; height: 100%; background: white; padding: 35px; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.15); box-sizing: border-box; }
        .close-circle-btn { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; border: none; cursor: pointer; color: #64748b; font-size: 1rem; flex-shrink: 0;}
        .btn-confirm-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); border: none; color: white; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;}
        .btn-glow { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; color: white; padding: 10px 22px; border-radius: 50px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; white-space: nowrap;}
        
        .success-card-luxe { background: white; padding: 40px; border-radius: 30px; text-align: center; width: 380px; max-width: 90vw; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); box-sizing: border-box;}
        .success-ring-luxe { width: 100px; height: 100px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; animation: checkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .checkmark-anim { font-size: 3.5rem; color: #10b981; transform: rotate(45deg) scaleX(-1); display: inline-block; }
        .centered-flex { display: flex; align-items: center; justify-content: center; padding: 20px;}
        
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; width: 100%;}
        .input-group label { display: block; font-size: 0.85rem; color: #64748b; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.3px; }
        
        .books-grid-modern { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; width: 100%; padding-bottom: 40px;}
        .book-card-premium { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; }
        .book-card-premium:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

        .map-container-style { height: 350px; border-radius: 16px; overflow: hidden; margin-bottom: 20px; border: 2px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }

        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
            .transport-main-content { margin-left: 0 !important; max-width: 100%; width: 100%; }
        }

        @media (max-width: 850px) {
            /* Unlock Scroll on Mobile completely */
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            
            .transport-page-wrapper {
                display: block !important; 
                height: auto !important;
                min-height: 100vh !important;
            }

            .transport-main-content {
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

            .page-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
            .page-header .btn-glow { width: 100%; justify-content: center; }

            .luxe-panel { width: 100%; padding: 20px; }
            .grid-2-col { grid-template-columns: 1fr !important; gap: 15px !important; }
            .map-container-style { height: 250px; }
        }
      `}</style>
    </div>
  );
}