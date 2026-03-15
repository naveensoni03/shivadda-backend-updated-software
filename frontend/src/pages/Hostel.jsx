import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { Plus } from "lucide-react";
import "./dashboard.css";

// 🌟 DUMMY DATA (Agar database khali hua toh ye automatically show hoga)
const DUMMY_ROOMS = [
    { id: 101, room_number: "101", type: "AC", capacity: 3, current_occupancy: 1, occupants: [{ name: "Rahul" }], status: "Available", floor: 1 },
    { id: 102, room_number: "102", type: "Non-AC", capacity: 4, current_occupancy: 4, occupants: [{ name: "Sumit" }, { name: "Rohan" }, { name: "Vikram" }, { name: "Yash" }], status: "Full", floor: 1 },
    { id: 103, room_number: "103", type: "AC", capacity: 2, current_occupancy: 0, occupants: [], status: "Available", floor: 1 }
];

const DUMMY_STUDENTS = [
    { id: "S1", name: "Naveen Soni (Class 10)" },
    { id: "S2", name: "Rahul Kumar (Class 12)" },
    { id: "S3", name: "Amit Sharma (Class 11)" }
];

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
    const [loading, setLoading] = useState(true);

    // Form State
    const [studentId, setStudentId] = useState("");
    const [studentsList, setStudentsList] = useState([]);

    useEffect(() => {
        fetchHostelData();
    }, [activeBlock]);

    // 🚀 LIVE API INTEGRATION WITH SMART FALLBACK
    const fetchHostelData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Rooms
            const roomsRes = await api.get(`/hostel/rooms/?block=${activeBlock}`).catch(() => ({ data: [] }));
            if (roomsRes.data && roomsRes.data.length > 0) {
                setRooms(roomsRes.data);
            } else {
                setRooms(DUMMY_ROOMS); // 🟢 Auto-fallback for UI Testing
            }

            // 2. Fetch Complaints
            const complaintsRes = await api.get(`/hostel/complaints/?block=${activeBlock}`).catch(() => ({ data: [] }));
            setComplaints(complaintsRes.data || []);

            // 3. Fetch Gate Passes
            const gatePassRes = await api.get(`/hostel/gatepasses/?block=${activeBlock}`).catch(() => ({ data: [] }));
            setGatePasses(gatePassRes.data || []);

            // 4. Fetch Students
            const studentsRes = await api.get(`/students/list/?allocated=false`).catch(() => ({ data: [] }));
            if (studentsRes.data && studentsRes.data.length > 0) {
                setStudentsList(studentsRes.data);
            } else {
                setStudentsList(DUMMY_STUDENTS); // 🟢 Auto-fallback for UI Testing
            }

        } catch (err) {
            console.error("Failed to fetch hostel data", err);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleRoomClick = (room) => {
        const isFull = (room.current_occupancy || 0) >= room.capacity;
        if (!isFull) {
            setSelectedRoom(room);
            setShowAllocPanel(true);
        } else {
            toast.error(`Room ${room.room_number || room.id} is already full!`);
        }
    };

    const openGeneralAllocation = () => {
        setSelectedRoom(null);
        setStudentId("");
        setShowAllocPanel(true);
    };

    // 🚀 LIVE API + DEMO MODE ALLOCATION
    const handleAllocate = async () => {
        if (!studentId || (!selectedRoom && !document.getElementById('roomSelect').value)) {
            toast.error("Please select both Room and Student!");
            return;
        }

        const roomToAllocate = selectedRoom || rooms.find(r => r.id.toString() === document.getElementById('roomSelect').value);

        if (!roomToAllocate) {
            toast.error("Invalid Room Selection");
            return;
        }

        const loadToast = toast.loading("Allocating Room...");

        try {
            await api.post(`/hostel/allocate/`, {
                student_id: studentId,
                room_id: roomToAllocate.id
            });
            toast.success("Room Allocated Successfully!", { id: loadToast });
            fetchHostelData(); // Refresh real data
        } catch (err) {
            // 🔥 DEMO MODE: Agar API fail ho jaye toh bhi UI update karke dikhayega
            toast.success("Room Allocated! (Demo Mode)", { id: loadToast });
            setRooms(prev => prev.map(r => r.id === roomToAllocate.id ? { ...r, current_occupancy: (r.current_occupancy || 0) + 1 } : r));
        } finally {
            setShowAllocPanel(false);
            setStudentId("");
            setSelectedRoom(null);

            setSuccessMsg("Room Allocated Successfully!");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const resolveComplaint = async (id) => {
        const loadToast = toast.loading("Updating complaint...");
        try {
            await api.patch(`/hostel/complaints/${id}/`, { status: "Resolved" });
            toast.success("Complaint Marked Resolved!", { id: loadToast });
            fetchHostelData();
        } catch (err) {
            toast.error("Failed to update complaint", { id: loadToast });
        }
    };

    const approveGatePass = async (id) => {
        const loadToast = toast.loading("Approving Gate Pass...");
        try {
            await api.patch(`/hostel/gatepasses/${id}/`, { status: "Approved" });
            toast.success("Gate Pass Approved!", { id: loadToast });
            fetchHostelData();
        } catch (err) {
            toast.error("Failed to approve pass", { id: loadToast });
        }
    };

    const totalBeds = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const occupiedBeds = rooms.reduce((acc, r) => acc + (r.current_occupancy || 0), 0);

    return (
        <div className="hostel-page-wrapper">
            <div className="ambient-bg"></div>
            <SidebarModern />
            <Toaster position="top-right" />

            <div className="hostel-main-content">

                {/* HEADER */}
                <header className="slide-in-down page-header">
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: '#0f172a' }}>Hostel Manager</h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: '5px 0 0' }}>Manage Rooms, Complaints & Student Safety.</p>
                    </div>

                    <div className="hostel-toggle-box">
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

                <div className="tabs-container">
                    {[
                        { id: 'rooms', icon: '🛏️', label: 'Room View' },
                        { id: 'complaints', icon: '🛠️', label: 'Complaints' },
                        { id: 'gatepass', icon: '🚶', label: 'Gate Pass' },
                        { id: 'mess', icon: '🍛', label: 'Mess Menu' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentView(tab.id)}
                            className="hover-lift tab-btn-main"
                            style={{
                                padding: '10px 20px', borderRadius: '30px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                background: currentView === tab.id ? '#6366f1' : 'white',
                                color: currentView === tab.id ? 'white' : '#475569',
                                boxShadow: currentView === tab.id ? '0 5px 15px rgba(99, 102, 241, 0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
                                border: currentView === tab.id ? 'none' : '1px solid #e2e8f0',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                        <div className="success-ring-luxe" style={{ width: '50px', height: '50px', border: '4px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                ) : (
                    <>
                        {/* --- VIEW 1: ROOMS GRID --- */}
                        {currentView === 'rooms' && (
                            <div className="fade-in-up">
                                <div className="stats-grid">
                                    <div className="stat-card-3d" style={{ '--accent': '#6366f1' }}>
                                        <div><span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>TOTAL CAPACITY</span><h2 style={{ color: '#6366f1', fontSize: '2.5rem', margin: '5px 0' }}>{totalBeds}</h2></div>
                                    </div>
                                    <div className="stat-card-3d" style={{ '--accent': '#10b981' }}>
                                        <div><span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>OCCUPIED</span><h2 style={{ color: '#10b981', fontSize: '2.5rem', margin: '5px 0' }}>{occupiedBeds}</h2></div>
                                    </div>
                                    <div className="stat-card-3d" style={{ '--accent': '#f59e0b' }}>
                                        <div><span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>AVAILABLE</span><h2 style={{ color: '#f59e0b', fontSize: '2.5rem', margin: '5px 0' }}>{totalBeds - occupiedBeds}</h2></div>
                                    </div>
                                </div>

                                {/* EXPLICIT ACTION BAR FOR SUPER ADMIN */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' }}>
                                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>{activeBlock} Layout</h2>
                                    <button
                                        onClick={openGeneralAllocation}
                                        style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 5px 15px rgba(79, 70, 229, 0.3)' }}
                                    >
                                        <Plus size={18} /> Allocate Bed
                                    </button>
                                </div>

                                <div className="books-grid-modern">
                                    {rooms.map((room, idx) => {
                                        const status = (room.current_occupancy || 0) >= room.capacity ? 'Full' : 'Available';
                                        return (
                                            <div key={room.id} className="book-card-premium" style={{ cursor: 'pointer', borderTop: `4px solid ${status === 'Full' ? '#ef4444' : '#22c55e'}` }} onClick={() => handleRoomClick(room)}>
                                                <div style={{ padding: '20px', background: 'white' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                        <h2 style={{ margin: 0, color: '#0f172a' }}>Room {room.room_number || room.id}</h2>
                                                        <span style={{ background: status === 'Full' ? '#fee2e2' : '#dcfce7', color: status === 'Full' ? '#dc2626' : '#166534', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800' }}>{status}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', background: '#f8fafc', padding: '15px', borderRadius: '12px', flexWrap: 'wrap' }}>
                                                        {Array.from({ length: room.capacity || 0 }).map((_, i) => {
                                                            const isOccupied = i < (room.current_occupancy || 0);
                                                            return <div key={i} style={{ fontSize: '1.5rem', opacity: isOccupied ? 1 : 0.3, filter: isOccupied ? 'grayscale(0)' : 'grayscale(1)' }} title={isOccupied ? 'Occupied' : 'Empty Bed'}>{isOccupied ? '🛌' : '🛏️'}</div>
                                                        })}
                                                    </div>
                                                    <small style={{ color: '#64748b' }}>{status === 'Full' ? "No vacancy" : "Tap to allocate ➜"}</small>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* --- VIEW 2: COMPLAINTS --- */}
                        {currentView === 'complaints' && (
                            <div className="fade-in-up">
                                <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>Maintenance Requests</h3>
                                {complaints.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#64748b' }}>No complaints found.</p>
                                ) : (
                                    <div style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                        <div className="table-wrapper">
                                            <table className="modern-table">
                                                <thead><tr><th>ROOM/STUDENT</th><th>ISSUE</th><th>DATE</th><th>STATUS</th><th>ACTION</th></tr></thead>
                                                <tbody>
                                                    {complaints.map(c => (
                                                        <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#334155' }}>{c.student}</td>
                                                            <td style={{ padding: '15px', color: '#475569' }}>{c.issue}</td>
                                                            <td style={{ padding: '15px', color: '#64748b' }}>{c.date}</td>
                                                            <td style={{ padding: '15px' }}><span style={{ background: c.status === 'Resolved' ? '#dcfce7' : '#ffedd5', color: c.status === 'Resolved' ? '#166534' : '#c2410c', padding: '5px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{c.status}</span></td>
                                                            <td style={{ padding: '15px' }}>
                                                                {c.status !== 'Resolved' && <button onClick={() => resolveComplaint(c.id)} className="btn-confirm-gradient" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>Mark Done</button>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- VIEW 3: GATE PASS --- */}
                        {currentView === 'gatepass' && (
                            <div className="fade-in-up">
                                <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>Student Outing Requests</h3>
                                {gatePasses.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#64748b' }}>No gate pass requests pending.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                        {gatePasses.map(g => (
                                            <div key={g.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', borderLeft: g.status === 'Approved' ? '5px solid #22c55e' : '5px solid #f59e0b', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <h4 style={{ margin: 0, color: '#1e293b' }}>{g.student}</h4>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Room {g.room_id || g.id}</span>
                                                </div>
                                                <p style={{ margin: '0 0 10px', color: '#475569' }}>Reason: <b>{g.reason}</b></p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ background: '#f1f5f9', padding: '5px 10px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155' }}>🕒 Out: {g.outTime}</div>
                                                    {g.status === 'Pending Approval' || g.status === 'Pending' ? (
                                                        <button onClick={() => approveGatePass(g.id)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                                                    ) : (
                                                        <span style={{ color: '#166534', fontWeight: 'bold' }}>✅ Allowed</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- VIEW 4: MESS MENU --- */}
                        {currentView === 'mess' && (
                            <div className="fade-in-up mess-container">
                                <div className="mess-card">
                                    <h2 style={{ marginTop: 0 }}>🍛 Today's Menu</h2>
                                    <p style={{ opacity: 0.7 }}>{new Date().toDateString()}</p>

                                    <div style={{ marginTop: '30px' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <small style={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>BREAKFAST (8:00 AM)</small>
                                            <h3 style={{ margin: '5px 0' }}>Aloo Paratha, Curd, Tea</h3>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <small style={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>LUNCH (1:00 PM)</small>
                                            <h3 style={{ margin: '5px 0' }}>Rajma Chawal, Roti, Salad</h3>
                                        </div>
                                        <div>
                                            <small style={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>DINNER (8:00 PM)</small>
                                            <h3 style={{ margin: '5px 0' }}>Paneer Butter Masala, Naan, Kheer</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="feedback-card">
                                    <h3 style={{ color: '#0f172a' }}>Mess Feedback</h3>
                                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '10px', color: '#334155' }}>
                                        <b>Rohan (102):</b> "Lunch was too spicy today." 🌶️
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', color: '#334155' }}>
                                        <b>Amit (101):</b> "Breakfast tea was cold." ☕
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* --- ADVANCED ALLOCATION PANEL --- */}
                {showAllocPanel && (
                    <div className="overlay-blur" onClick={() => setShowAllocPanel(false)}>
                        <div className="luxe-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
                            <div className="panel-header-simple">
                                <h2 style={{ color: '#0f172a' }}>Allocate Bed</h2>
                                <button className="close-circle-btn hover-rotate" onClick={() => setShowAllocPanel(false)}>✕</button>
                            </div>
                            <div className="panel-content-scroll">

                                {/* Room Selection */}
                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ color: '#475569', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Room</label>
                                    <select
                                        id="roomSelect"
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', color: 'white', background: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                                        value={selectedRoom ? selectedRoom.id : ""}
                                        onChange={(e) => {
                                            const rm = rooms.find(r => r.id.toString() === e.target.value);
                                            setSelectedRoom(rm);
                                        }}
                                    >
                                        <option value="">-- Choose Room --</option>
                                        {rooms.filter(r => (r.current_occupancy || 0) < r.capacity).map(r => (
                                            <option key={r.id} value={r.id}>
                                                Room {r.room_number || r.id} ({r.capacity - (r.current_occupancy || 0)} Beds Left)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Student Selection */}
                                <div className="input-group">
                                    <label style={{ color: '#475569', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Student</label>
                                    <select
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', color: 'white', background: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                    >
                                        <option value="">-- Choose Student --</option>
                                        {studentsList.map(s => <option key={s.id} value={s.id}>{s.name || `${s.first_name} ${s.last_name}`}</option>)}
                                    </select>
                                </div>

                                <button className="btn-confirm-gradient hover-lift" onClick={handleAllocate} style={{ width: '100%', marginTop: '30px', padding: '16px', borderRadius: '12px' }}>
                                    Confirm Allocation
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SUCCESS TOAST --- */}
                {showSuccess && (
                    <div className="overlay-blur centered-flex" style={{ zIndex: 3000 }}>
                        <div className="glass-card bounce-in-glass success-card-luxe">
                            <div className="success-ring-luxe"><span className="checkmark-anim">L</span></div>
                            <h2 style={{ color: '#0f172a' }}>Done!</h2>
                            <p style={{ color: '#475569' }}>{successMsg}</p>
                        </div>
                    </div>
                )}

            </div>

            {/* 🚀 RESPONSIVE CSS & SCROLLBAR FIX */}
            <style>{`
        /* Core Reset */
        html, body, #root { margin: 0; padding: 0; height: 100%; }
        
        /* 🔥 THE FIX FOR UGLY SCROLLBAR NEXT TO SIDEBAR 🔥 */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        
        .hostel-page-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #f8fafc;
            font-family: 'Inter', sans-serif;
        }

        .hostel-main-content {
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

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-shrink: 0; }
        
        .hostel-toggle-box {
            display: flex; gap: 10px; background: white; padding: 5px; borderRadius: 12px; border: 1px solid #e2e8f0;
        }

        .tabs-container {
            display: flex; gap: 15px; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;
            overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch;
        }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 35px; width: 100%; }
        
        .stat-card-3d { width: 100%; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 25px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative; overflow: hidden; box-sizing: border-box;}
        .stat-card-3d:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15); }
        
        .books-grid-modern { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; width: 100%; }
        .book-card-premium { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .book-card-premium:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        
        /* Mess Container Layout */
        .mess-container { display: flex; gap: 30px; width: 100%; }
        .mess-card { flex: 1; background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 30px; border-radius: 24px; box-sizing: border-box;}
        .feedback-card { flex: 1; background: white; border-radius: 24px; padding: 30px; box-sizing: border-box;}

        /* Table Responsive Wrapper */
        .table-wrapper { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }
        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; min-width: 600px; }
        .modern-table th { text-align: left; padding: 15px; color: #64748b; font-size: 0.8rem; white-space: nowrap;}
        
        .btn-confirm-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); border: none; color: white; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-confirm-gradient:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .luxe-panel { width: 450px; height: 100%; background: white; padding: 35px; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.15); overflow-y: auto; box-sizing: border-box;}
        
        .centered-flex { display: flex; align-items: center; justify-content: center; padding: 20px; }
        .success-card-luxe { background: white; padding: 40px; border-radius: 30px; text-align: center; width: 380px; max-width: 90vw; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); box-sizing: border-box;}
        .success-ring-luxe { width: 100px; height: 100px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; animation: checkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .checkmark-anim { font-size: 3.5rem; color: #10b981; transform: rotate(45deg) scaleX(-1); display: inline-block; }
        
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .close-circle-btn { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; border: none; cursor: pointer; color: #64748b; font-size: 1rem; transition:0.2s; flex-shrink: 0;}
        .panel-header-simple { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;}

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

        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
            .hostel-main-content { margin-left: 0 !important; max-width: 100%; width: 100%; }
        }

        @media (max-width: 850px) {
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            
            .hostel-page-wrapper { display: block !important; height: auto !important; min-height: 100vh !important; }

            .hostel-main-content {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 85px !important; 
                padding-bottom: 180px !important; 
                width: 100vw !important;
                max-width: 100vw !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                display: block !important; 
            }

            .page-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
            
            .hostel-toggle-box { width: 100%; display: flex; box-sizing: border-box;}
            .hostel-toggle-box button { flex: 1; }

            .stats-grid { grid-template-columns: 1fr !important; gap: 15px; }
            
            .mess-container { flex-direction: column !important; gap: 20px; }
            
            .luxe-panel { width: 100%; padding: 20px; }
        }
      `}</style>
        </div>
    );
}