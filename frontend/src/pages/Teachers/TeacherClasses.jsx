import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Video, Calendar as CalendarIcon, Clock, Users,
    Link as LinkIcon, PlusCircle, Search, Edit, Trash2, X, PlayCircle, AlertTriangle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TeacherClasses() {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [showModal, setShowModal] = useState(false);

    // NAYE STATES: Edit aur Delete Modal ke liye
    const [editingClass, setEditingClass] = useState(null);
    const [classToDelete, setClassToDelete] = useState(null);

    // Dummy Data (Backend se aayega)
    const [classes, setClasses] = useState([
        { id: 1, topic: "Rotational Motion Concepts", subject: "Class 12 Physics", date: "2026-03-10", time: "10:00", duration: "60", status: "upcoming", link: "https://zoom.us/test" },
        { id: 2, topic: "Hydrocarbons Q&A", subject: "Class 11 Chemistry", date: "2026-03-10", time: "14:00", duration: "45", status: "upcoming", link: "https://meet.google.com/test" },
        { id: 3, topic: "Trigonometry Basics", subject: "Class 10 Maths", date: "2026-03-08", time: "11:00", duration: "60", status: "past", link: "-" },
    ]);

    const [formData, setFormData] = useState({
        topic: "", subject: "", date: "", time: "", duration: "60", link: ""
    });

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    // 🔥 ADD NEW CLASS
    const handleSchedule = (e) => {
        e.preventDefault();
        const newClass = {
            id: Date.now(),
            ...formData,
            status: "upcoming"
        };
        setClasses([newClass, ...classes]);
        toast.success("Live Class Scheduled Successfully!");
        setShowModal(false);
        setFormData({ topic: "", subject: "", date: "", time: "", duration: "60", link: "" });
    };

    // 🔥 OPEN EDIT MODAL
    const openEditModal = (item) => {
        setEditingClass({ ...item });
    };

    // 🔥 SAVE EDITED CLASS
    const handleEditSave = (e) => {
        e.preventDefault();
        setClasses(classes.map(c => c.id === editingClass.id ? editingClass : c));
        toast.success("Class Updated Successfully!");
        setEditingClass(null);
    };

    // 🔥 CUSTOM DELETE LOGIC
    const confirmDelete = (item) => {
        setClassToDelete(item); // Opens the Delete Popup
    };

    const executeDelete = () => {
        setClasses(classes.filter(c => c.id !== classToDelete.id));
        toast.success("Class Cancelled!");
        setClassToDelete(null); // Closes the Delete Popup
    };

    // 🔥 START CLASS LOGIC (REDIRECT TO LINK)
    const handleStartClass = (link) => {
        if (!link || link === "-") {
            toast.error("No valid meeting link found for this class!");
            return;
        }
        toast.success("Opening Live Class window...");

        // Thodi der baad naye tab me class ka link open karega
        setTimeout(() => {
            window.open(link, "_blank", "noopener,noreferrer");
        }, 1000);
    };

    const filteredClasses = classes.filter(c => c.status === activeTab);

    // Helper for displaying time nicely
    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hour, minute] = timeString.split(':');
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    return (
        <div className="page-wrapper">
            <Toaster position="top-right" />

            <div className="dashboard-inner-area">
                {/* HEADER */}
                <motion.div className="page-header" initial="hidden" animate="show" variants={fadeUp}>
                    <div className="header-titles">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "5px" }}>
                            <h1 className="gradient-text" style={{ margin: 0 }}>Live Classes</h1>
                            <Video size={32} color="#ef4444" />
                        </div>
                        <p className="subtitle">Schedule and manage your interactive live sessions.</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                            onClick={() => setActiveTab('past')}
                        >
                            Past Classes
                        </button>
                        <button
                            className="tab-btn primary active"
                            onClick={() => setShowModal(true)}
                            style={{ marginLeft: '10px' }}
                        >
                            <PlusCircle size={18} /> Schedule New
                        </button>
                    </div>
                </motion.div>

                {/* SEARCH BAR */}
                <motion.div className="search-bar-container" initial="hidden" animate="show" variants={fadeUp}>
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Search classes by topic or subject..." className="search-input" />
                </motion.div>

                {/* CLASSES GRID */}
                <motion.div className="classes-grid" initial="hidden" animate="show" variants={fadeUp}>
                    {filteredClasses.length === 0 ? (
                        <p style={{ color: "#64748b", padding: "20px" }}>No classes found for this category.</p>
                    ) : filteredClasses.map((item) => (
                        <div key={item.id} className="class-card">
                            <div className="card-top">
                                <div className="status-badge">
                                    <span className={`dot ${item.status}`}></span>
                                    {item.status === 'upcoming' ? 'Scheduled' : 'Completed'}
                                </div>
                                <div className="class-actions">
                                    {/* 🔥 WORKING EDIT BUTTON */}
                                    {item.status === 'upcoming' && (
                                        <button className="icon-btn edit" onClick={() => openEditModal(item)}>
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {/* 🔥 WORKING DELETE BUTTON */}
                                    <button className="icon-btn delete" onClick={() => confirmDelete(item)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="class-title">{item.topic || item.title}</h3>
                            <p className="class-subject">{item.subject}</p>

                            <div className="class-details-grid">
                                <div className="detail-item">
                                    <CalendarIcon size={16} /> <span>{item.date}</span>
                                </div>
                                <div className="detail-item">
                                    <Clock size={16} /> <span>{formatTime(item.time)} ({item.duration} mins)</span>
                                </div>
                            </div>

                            {item.status === 'upcoming' && (
                                // 🔥 START CLASS WALA ASLI BUTTON 🔥
                                <button className="join-btn" onClick={() => handleStartClass(item.link)}>
                                    <PlayCircle size={18} /> Start Class
                                </button>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* 🔥 1. SCHEDULE NEW CLASS MODAL */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-glass" initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}>
                            <div className="modal-header">
                                <h2>Schedule Live Class</h2>
                                <button type="button" className="close-modal-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                            </div>
                            <div className="modal-scroll-area">
                                <form onSubmit={handleSchedule} className="modern-form">
                                    <div className="form-group full-width">
                                        <label>Topic / Chapter Name</label>
                                        <input type="text" placeholder="e.g. Current Electricity Basics" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} required />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Select Subject / Class</label>
                                        <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required>
                                            <option value="">-- Select Class --</option>
                                            <option value="Class 12 Physics">Class 12 Physics</option>
                                            <option value="Class 11 Chemistry">Class 11 Chemistry</option>
                                            <option value="Class 10 Maths">Class 10 Maths</option>
                                        </select>
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group"><label>Date</label><input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required /></div>
                                        <div className="form-group"><label>Time</label><input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required /></div>
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group"><label>Duration (Mins)</label><input type="number" placeholder="60" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required /></div>
                                        <div className="form-group"><label>Meeting Link (Zoom/Meet)</label><input type="url" placeholder="https://..." value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} required /></div>
                                    </div>
                                    <div className="form-footer">
                                        <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="submit-btn">Schedule Class</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔥 2. EDIT CLASS MODAL */}
            <AnimatePresence>
                {editingClass && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-glass" initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}>
                            <div className="modal-header">
                                <h2>Edit Live Class</h2>
                                <button type="button" className="close-modal-btn" onClick={() => setEditingClass(null)}><X size={24} /></button>
                            </div>
                            <div className="modal-scroll-area">
                                <form onSubmit={handleEditSave} className="modern-form">
                                    <div className="form-group full-width">
                                        <label>Topic / Chapter Name</label>
                                        <input type="text" value={editingClass.topic} onChange={e => setEditingClass({ ...editingClass, topic: e.target.value })} required />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Select Subject / Class</label>
                                        <select value={editingClass.subject} onChange={e => setEditingClass({ ...editingClass, subject: e.target.value })} required>
                                            <option value="Class 12 Physics">Class 12 Physics</option>
                                            <option value="Class 11 Chemistry">Class 11 Chemistry</option>
                                            <option value="Class 10 Maths">Class 10 Maths</option>
                                        </select>
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group"><label>Date</label><input type="date" value={editingClass.date} onChange={e => setEditingClass({ ...editingClass, date: e.target.value })} required /></div>
                                        <div className="form-group"><label>Time</label><input type="time" value={editingClass.time} onChange={e => setEditingClass({ ...editingClass, time: e.target.value })} required /></div>
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group"><label>Duration (Mins)</label><input type="number" value={editingClass.duration} onChange={e => setEditingClass({ ...editingClass, duration: e.target.value })} required /></div>
                                        <div className="form-group"><label>Meeting Link (Zoom/Meet)</label><input type="url" value={editingClass.link} onChange={e => setEditingClass({ ...editingClass, link: e.target.value })} required /></div>
                                    </div>
                                    <div className="form-footer">
                                        <button type="button" className="cancel-btn" onClick={() => setEditingClass(null)}>Cancel</button>
                                        <button type="submit" className="submit-btn">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔥 3. CUSTOM UI DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {classToDelete && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="delete-modal-glass" initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}>
                            <div className="delete-icon-wrapper">
                                <AlertTriangle size={40} color="#ef4444" />
                            </div>
                            <h3 className="delete-title">Cancel Class?</h3>
                            <p className="delete-desc">
                                Are you sure you want to cancel the class <strong>"{classToDelete.topic}"</strong>? This action cannot be undone.
                            </p>
                            <div className="delete-actions">
                                <button type="button" className="cancel-btn" onClick={() => setClassToDelete(null)}>No, Keep it</button>
                                <button type="button" className="confirm-delete-btn" onClick={executeDelete}>Yes, Cancel Class</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .page-wrapper * { box-sizing: border-box !important; }

                .page-wrapper {
                    background: transparent; 
                    width: 100%; height: 100vh; overflow-y: auto; overflow-x: hidden; font-family: 'Inter', sans-serif;
                }
                .page-wrapper::-webkit-scrollbar { width: 8px; }
                .page-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                
                .dashboard-inner-area {
                    width: 100%; max-width: 1400px; margin: 0 auto; padding: 20px 30px 100px 30px; 
                }

                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .gradient-text { font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, #0f172a 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .subtitle { color: #64748b; margin: 0; font-size: 1rem; }

                .header-actions { display: flex; background: white; padding: 6px; border-radius: 12px; border: 1px solid #e2e8f0; flex-wrap: wrap; }
                .tab-btn { padding: 10px 20px; border: none; background: transparent; color: #64748b; font-weight: 600; border-radius: 8px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
                .tab-btn:hover { color: #0f172a; }
                .tab-btn.active { background: #f1f5f9; color: #0f172a; }
                .tab-btn.primary.active { background: #ef4444; color: white; }
                .tab-btn.primary.active:hover { background: #dc2626; }

                .search-bar-container { position: relative; margin-bottom: 25px; width: 100%; }
                .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .search-input { width: 100%; padding: 16px 16px 16px 45px; border: 1px solid #e2e8f0; border-radius: 16px; font-size: 1rem; outline: none; color: #1e293b !important; background-color: #ffffff !important; box-shadow: 0 4px 6px rgba(0,0,0,0.02);}
                .search-input:focus { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239,68,68,0.1); }

                /* Grid Layout */
                .classes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
                .class-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
                .class-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.06); border-color: #cbd5e1; }

                .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .status-badge { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: #475569; background: #f8fafc; padding: 5px 10px; border-radius: 20px; }
                .dot { width: 8px; height: 8px; border-radius: 50%; }
                .dot.upcoming { background: #10b981; box-shadow: 0 0 8px #10b981; }
                .dot.past { background: #94a3b8; }

                .class-actions { display: flex; gap: 8px; }
                .icon-btn { border: none; background: #f8fafc; padding: 6px; border-radius: 8px; cursor: pointer; transition: 0.2s; color: #64748b; display: flex; align-items: center; justify-content: center;}
                .icon-btn.edit:hover { background: #e0e7ff; color: #4f46e5; }
                .icon-btn.delete:hover { background: #fee2e2; color: #dc2626; }

                .class-title { margin: 0 0 5px 0; font-size: 1.2rem; color: #1e293b; font-weight: 700; word-wrap: break-word; }
                .class-subject { color: #4f46e5; font-weight: 600; font-size: 0.85rem; margin: 0 0 15px 0; }

                .class-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 12px;}
                .detail-item { display: flex; align-items: center; gap: 8px; color: #475569; font-size: 0.85rem; font-weight: 500;}

                .join-btn { width: 100%; padding: 12px; border: none; background: #ef4444; color: white; font-weight: 700; border-radius: 12px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 1rem; margin-top: auto;}
                .join-btn:hover { background: #dc2626; box-shadow: 0 5px 15px rgba(239,68,68,0.3); transform: translateY(-2px);}

                /* MODAL STYLING */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
                .modal-glass { background: white; border-radius: 24px; width: 100%; max-width: 600px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.15);}
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-bottom: 1px solid #f1f5f9; background: white;}
                .modal-header h2 { margin: 0; font-size: 1.4rem; color: #1e293b; }
                .close-modal-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; padding: 0;}
                .close-modal-btn:hover { color: #ef4444; transform: rotate(90deg); }
                
                .modal-scroll-area { padding: 25px; overflow-y: auto; }
                .modal-scroll-area::-webkit-scrollbar { width: 6px; }
                .modal-scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

                .modern-form { display: flex; flex-direction: column; gap: 15px; }
                .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; width: 100%; min-width: 0; } 
                .form-group label { font-weight: 600; color: #475569; font-size: 0.85rem; }
                .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; font-family: inherit; transition: 0.3s; outline: none; background: #f8fafc; color: #1e293b !important; }
                .form-group input:focus, .form-group select:focus { border-color: #ef4444; background: white; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }

                .form-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 15px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
                .cancel-btn { padding: 12px 25px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
                .cancel-btn:hover { background: #f8fafc; color: #1e293b; }
                .submit-btn { padding: 12px 30px; border: none; background: #ef4444; color: white; font-weight: 700; border-radius: 10px; cursor: pointer; transition: 0.2s; }
                .submit-btn:hover { background: #dc2626; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(239,68,68,0.2); }

                /* CUSTOM DELETE POPUP CSS */
                .delete-modal-glass { background: white; border-radius: 24px; width: 100%; max-width: 400px; padding: 30px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.15); display: flex; flex-direction: column; align-items: center; }
                .delete-icon-wrapper { background: #fee2e2; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
                .delete-title { margin: 0 0 10px 0; font-size: 1.5rem; color: #1e293b; }
                .delete-desc { color: #64748b; font-size: 0.95rem; margin: 0 0 25px 0; line-height: 1.5; }
                .delete-actions { display: flex; gap: 15px; width: 100%; }
                .delete-actions button { flex: 1; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; border: none; }
                .confirm-delete-btn { background: #ef4444; color: white; }
                .confirm-delete-btn:hover { background: #dc2626; box-shadow: 0 5px 15px rgba(239,68,68,0.3); }

                /* 🔥 MOBILE FIXES 🔥 */
                @media (max-width: 768px) {
                    .dashboard-inner-area { 
                        padding: 85px 15px 100px 15px !important; 
                        max-width: 100vw !important; 
                        overflow-x: hidden;
                    }
                    .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .header-actions { width: 100%; }
                    .tab-btn { flex: 1; justify-content: center; margin: 0 !important; }
                    .form-row-2 { grid-template-columns: 1fr; gap: 15px; }
                    .form-footer { flex-direction: column; }
                    .cancel-btn, .submit-btn { width: 100%; }
                    .modal-glass { margin-top: 40px; max-height: 85vh;}
                    .delete-actions { flex-direction: column; }

                    /* 🔥 FIX FOR RIGHT CUTOFF IN MOBILE 🔥 */
                    .classes-grid {
                        grid-template-columns: 1fr !important; /* Ek column me layega taaki width bahar na jaye */
                        width: 100%;
                    }
                    .class-card {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .dashboard-inner-area { padding: 85px 10px 100px 10px !important; }
                    .class-card { padding: 15px; }
                    .class-title { font-size: 1.1rem; }
                }
            `}</style>
        </div>
    );
}