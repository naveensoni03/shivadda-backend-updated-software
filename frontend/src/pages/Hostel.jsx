import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios"; 
import "./dashboard.css"; 

export default function Hostel() {
  const [activeBlock, setActiveBlock] = useState("Boys Hostel A");
  const [currentView, setCurrentView] = useState("rooms"); 
  
  // Data States
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  
  // UI States
  const [showAllocPanel, setShowAllocPanel] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form State
  const [studentId, setStudentId] = useState("");
  const [studentsList, setStudentsList] = useState([]); 

  useEffect(() => {
    // MOCK DATA
    setRooms([
      { id: 101, type: "AC", capacity: 3, occupants: [{name: "Rahul"}, {name: "Amit"}], status: "Available", floor: 1 },
      { id: 102, type: "Non-AC", capacity: 4, occupants: [{name: "Sumit"}, {name: "Rohan"}, {name: "Vikram"}, {name: "Yash"}], status: "Full", floor: 1 },
      { id: 103, type: "AC", capacity: 2, occupants: [], status: "Empty", floor: 1 },
      { id: 201, type: "Deluxe", capacity: 1, occupants: [{name: "Arjun"}], status: "Full", floor: 2 },
    ]);

    setComplaints([
      { id: 1, student: "Amit (101)", issue: "Fan Making Noise", status: "Pending", date: "27-12-2025" },
      { id: 2, student: "Rohan (102)", issue: "Tap Leaking", status: "Resolved", date: "26-12-2025" },
    ]);

    setGatePasses([
      { id: 101, student: "Vikram Singh", reason: "Going Home", outTime: "5:00 PM", status: "Pending Approval" },
      { id: 102, student: "Arjun Das", reason: "Market", outTime: "6:00 PM", status: "Approved" },
    ]);

    setStudentsList([
        { id: 1, name: "Naveen Soni (Class 10)" },
        { id: 2, name: "Rahul Kumar (Class 12)" },
    ]);

  }, [activeBlock]);

  // Actions
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    if(room.occupants.length < room.capacity) setShowAllocPanel(true);
  };

  const handleAllocate = async () => {
    if(!studentId || !selectedRoom) return;
    const updatedRooms = rooms.map(r => {
        if(r.id === selectedRoom.id) {
            return { 
                ...r, 
                occupants: [...r.occupants, {name: "Student #" + studentId}], 
                status: (r.occupants.length + 1) === r.capacity ? "Full" : "Available" 
            };
        }
        return r;
    });
    setRooms(updatedRooms);
    setShowAllocPanel(false);
    setStudentId("");
    setSuccessMsg("Room Allocated Successfully!"); 
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const resolveComplaint = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? {...c, status: "Resolved"} : c));
    setSuccessMsg("Complaint Marked Resolved! ✅");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const approveGatePass = (id) => {
    setGatePasses(prev => prev.map(g => g.id === id ? {...g, status: "Approved"} : g));
    setSuccessMsg("Gate Pass Approved! 🔓");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupants.length, 0);

  return (
    <div className="dashboard-container" style={{background: '#f8fafc', height: '100vh', display: 'flex', overflow: 'hidden'}}>
      <div className="ambient-bg"></div>
      <SidebarModern />

      <div className="main-content" style={{flex: 1, padding: '30px 40px', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column'}}>
        
        {/* HEADER */}
        <header className="slide-in-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexShrink: 0 }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: '#0f172a' }}>Hostel Manager</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: '5px 0 0' }}>Manage Rooms, Complaints & Student Safety.</p>
          </div>
          
          <div style={{display: 'flex', gap: '10px', background: 'white', padding: '5px', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
             {["Boys Hostel A", "Girls Hostel B"].map(tab => (
                 <button key={tab} onClick={() => setActiveBlock(tab)} style={{
                        padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s',
                        background: activeBlock === tab ? '#0f172a' : 'transparent', color: activeBlock === tab ? 'white' : '#64748b'
                    }}>
                    {tab}
                 </button>
             ))}
          </div>
        </header>

        {/* --- FIXED: VISIBLE TABS --- */}
        <div style={{display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px'}}>
            {[
                {id: 'rooms', icon: '🛏️', label: 'Room View'},
                {id: 'complaints', icon: '🛠️', label: 'Complaints'},
                {id: 'gatepass', icon: '🚶', label: 'Gate Pass'},
                {id: 'mess', icon: '🍛', label: 'Mess Menu'}
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id)}
                    className="hover-lift"
                    style={{
                        padding: '10px 20px', borderRadius: '30px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        background: currentView === tab.id ? '#6366f1' : 'white',
                        // Fixed: Text color is now explicitly set for both active and inactive states
                        color: currentView === tab.id ? 'white' : '#475569', 
                        boxShadow: currentView === tab.id ? '0 5px 15px rgba(99, 102, 241, 0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
                        border: currentView === tab.id ? 'none' : '1px solid #e2e8f0'
                    }}
                >
                    <span>{tab.icon}</span> {tab.label}
                </button>
            ))}
        </div>

        {/* --- VIEW 1: ROOMS GRID --- */}
        {currentView === 'rooms' && (
            <div className="fade-in-up">
                <div className="stats-grid" style={{display: 'flex', gap: '25px', marginBottom: '35px'}}>
                    <div className="stat-card-3d" style={{'--accent': '#6366f1'}}>
                        <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>TOTAL CAPACITY</span><h2 style={{color:'#6366f1', fontSize:'2.5rem', margin: '5px 0'}}>{totalBeds}</h2></div>
                    </div>
                    <div className="stat-card-3d" style={{'--accent': '#10b981'}}>
                        <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>OCCUPIED</span><h2 style={{color:'#10b981', fontSize:'2.5rem', margin: '5px 0'}}>{occupiedBeds}</h2></div>
                    </div>
                    <div className="stat-card-3d" style={{'--accent': '#f59e0b'}}>
                        <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>AVAILABLE</span><h2 style={{color:'#f59e0b', fontSize:'2.5rem', margin: '5px 0'}}>{totalBeds - occupiedBeds}</h2></div>
                    </div>
                </div>

                <div className="books-grid-modern" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px'}}>
                    {rooms.map((room, idx) => (
                        <div key={room.id} className="book-card-premium" style={{cursor: 'pointer', borderTop: `4px solid ${room.status === 'Full' ? '#ef4444' : '#22c55e'}`}} onClick={() => handleRoomClick(room)}>
                            <div style={{padding: '20px', background: 'white'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                                    <h2 style={{margin: 0, color: '#0f172a'}}>Room {room.id}</h2>
                                    <span style={{background: room.status === 'Full' ? '#fee2e2' : '#dcfce7', color: room.status === 'Full' ? '#dc2626' : '#166534', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800'}}>{room.status}</span>
                                </div>
                                <div style={{display: 'flex', gap: '10px', marginBottom: '15px', background: '#f8fafc', padding: '15px', borderRadius: '12px'}}>
                                    {Array.from({ length: room.capacity }).map((_, i) => {
                                        const isOccupied = i < room.occupants.length;
                                        return <div key={i} style={{fontSize: '1.5rem', opacity: isOccupied ? 1 : 0.3, filter: isOccupied ? 'grayscale(0)' : 'grayscale(1)'}}>{isOccupied ? '🛌' : '🛏️'}</div>
                                    })}
                                </div>
                                <small style={{color: '#64748b'}}>{room.occupants.length === room.capacity ? "No vacancy" : "Tap to allocate ➜"}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- VIEW 2: COMPLAINTS --- */}
        {currentView === 'complaints' && (
            <div className="fade-in-up">
                <h3 style={{marginBottom:'20px', color:'#0f172a'}}>Maintenance Requests</h3>
                <div style={{background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}>
                    <table className="modern-table" style={{width:'100%'}}>
                        <thead><tr><th>ROOM/STUDENT</th><th>ISSUE</th><th>DATE</th><th>STATUS</th><th>ACTION</th></tr></thead>
                        <tbody>
                            {complaints.map(c => (
                                <tr key={c.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                    <td style={{padding:'15px', fontWeight:'bold', color:'#334155'}}>{c.student}</td>
                                    <td style={{padding:'15px', color:'#475569'}}>{c.issue}</td>
                                    <td style={{padding:'15px', color:'#64748b'}}>{c.date}</td>
                                    <td style={{padding:'15px'}}><span style={{background: c.status==='Resolved'?'#dcfce7':'#ffedd5', color: c.status==='Resolved'?'#166534':'#c2410c', padding:'5px 12px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:'bold'}}>{c.status}</span></td>
                                    <td style={{padding:'15px'}}>
                                        {c.status !== 'Resolved' && <button onClick={() => resolveComplaint(c.id)} className="btn-confirm-gradient" style={{padding:'8px 15px', fontSize:'0.8rem'}}>Mark Done</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- VIEW 3: GATE PASS --- */}
        {currentView === 'gatepass' && (
            <div className="fade-in-up">
                <h3 style={{marginBottom:'20px', color:'#0f172a'}}>Student Outing Requests</h3>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px'}}>
                    {gatePasses.map(g => (
                        <div key={g.id} style={{background:'white', padding:'20px', borderRadius:'16px', borderLeft: g.status === 'Approved' ? '5px solid #22c55e' : '5px solid #f59e0b', boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                <h4 style={{margin:0, color:'#1e293b'}}>{g.student}</h4>
                                <span style={{fontSize:'0.8rem', color:'#64748b'}}>Room {g.id}</span>
                            </div>
                            <p style={{margin:'0 0 10px', color:'#475569'}}>Reason: <b>{g.reason}</b></p>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div style={{background:'#f1f5f9', padding:'5px 10px', borderRadius:'8px', fontSize:'0.85rem', color:'#334155'}}>🕒 Out: {g.outTime}</div>
                                {g.status === 'Pending Approval' ? (
                                    <button onClick={() => approveGatePass(g.id)} style={{background:'#22c55e', color:'white', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Approve</button>
                                ) : (
                                    <span style={{color:'#166534', fontWeight:'bold'}}>✅ Allowed</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- VIEW 4: MESS MENU --- */}
        {currentView === 'mess' && (
            <div className="fade-in-up" style={{display:'flex', gap:'30px'}}>
                <div style={{flex: 1, background: 'linear-gradient(135deg, #1e293b, #0f172a)', color:'white', padding:'30px', borderRadius:'24px'}}>
                    <h2 style={{marginTop:0}}>🍛 Today's Menu</h2>
                    <p style={{opacity:0.7}}>Friday, 27 Dec</p>
                    
                    <div style={{marginTop:'30px'}}>
                        <div style={{marginBottom:'20px'}}>
                            <small style={{color:'#94a3b8', fontWeight:'bold', letterSpacing:'1px'}}>BREAKFAST (8:00 AM)</small>
                            <h3 style={{margin:'5px 0'}}>Aloo Paratha, Curd, Tea</h3>
                        </div>
                        <div style={{marginBottom:'20px'}}>
                            <small style={{color:'#94a3b8', fontWeight:'bold', letterSpacing:'1px'}}>LUNCH (1:00 PM)</small>
                            <h3 style={{margin:'5px 0'}}>Rajma Chawal, Roti, Salad</h3>
                        </div>
                        <div>
                            <small style={{color:'#94a3b8', fontWeight:'bold', letterSpacing:'1px'}}>DINNER (8:00 PM)</small>
                            <h3 style={{margin:'5px 0'}}>Paneer Butter Masala, Naan, Kheer</h3>
                        </div>
                    </div>
                </div>
                <div style={{flex: 1, background:'white', borderRadius:'24px', padding:'30px'}}>
                    <h3 style={{color:'#0f172a'}}>Mess Feedback</h3>
                    <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px', marginBottom:'10px', color:'#334155'}}>
                        <b>Rohan (102):</b> "Lunch was too spicy today." 🌶️
                    </div>
                    <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px', color:'#334155'}}>
                        <b>Amit (101):</b> "Breakfast tea was cold." ☕
                    </div>
                </div>
            </div>
        )}

        {/* --- ALLOCATION PANEL --- */}
        {showAllocPanel && selectedRoom && (
            <div className="overlay-blur" onClick={() => setShowAllocPanel(false)}>
                <div className="luxe-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
                    <div className="panel-header-simple">
                        <h2 style={{color:'#0f172a'}}>Allocate Bed</h2>
                        <button className="close-circle-btn hover-rotate" onClick={() => setShowAllocPanel(false)}>✕</button>
                    </div>
                    <div className="panel-content-scroll">
                        <div className="input-group">
                            <label style={{color:'#475569'}}>Select Student</label>
                            <select style={{width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', color:'white', background:'#1e293b'}} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                                <option value="">-- Choose Student --</option>
                                {studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <button className="btn-confirm-gradient hover-lift" onClick={handleAllocate} style={{width: '100%', marginTop:'30px'}}>Confirm Allocation</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- SUCCESS TOAST --- */}
        {showSuccess && (
          <div className="overlay-blur centered-flex" style={{zIndex: 3000}}>
              <div className="glass-card bounce-in-glass success-card-luxe">
                <div className="success-ring-luxe"><span className="checkmark-anim">L</span></div>
                <h2 style={{color: '#0f172a'}}>Done!</h2>
                <p style={{color: '#475569'}}>{successMsg}</p>
              </div>
          </div>
        )}

      </div>

      <style>{`
        /* Animations */
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes bounceInGlass { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes checkPop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
        
        .slide-in-down { animation: slideInDown 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .fade-in-up { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .slide-in-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .bounce-in-glass { animation: bounceInGlass 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        .stat-card-3d { flex: 1; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 25px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative; overflow: hidden; }
        .stat-card-3d:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15); }
        .book-card-premium { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .book-card-premium:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        
        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
        .modern-table th { text-align: left; padding: 15px; color: #64748b; font-size: 0.8rem; }
        .btn-confirm-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); border: none; color: white; border-radius: 12px; font-weight: 700; cursor: pointer; padding: 16px; }
        
        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .luxe-panel { width: 450px; height: 100%; background: white; padding: 35px; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.15); overflow-y: auto; }
        .success-card-luxe { background: white; padding: 40px; border-radius: 30px; text-align: center; width: 380px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .success-ring-luxe { width: 100px; height: 100px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; animation: checkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .checkmark-anim { font-size: 3.5rem; color: #10b981; transform: rotate(45deg) scaleX(-1); display: inline-block; }
      `}</style>
    </div>
  );
}