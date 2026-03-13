import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Users, Search, Filter, Mail, TrendingUp, Award,
    ChevronRight, X, Phone, Calendar, BookOpen, AlertCircle, CheckCircle, Loader2, Send
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TeacherStudents() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("All");
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAlerting, setIsAlerting] = useState(false);

    // 🔥 NAYA STATE: Custom Message Modal ke liye
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [customMessage, setCustomMessage] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/teachers/my-students/");
            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();
            setStudents(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Could not load students data from server.");
            setIsLoading(false);
        }
    };

    const handleAlertParents = async (student) => {
        setIsAlerting(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/api/teachers/send-message/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: student.id,
                    recipient_type: "parent",
                    message: `Dear Parent, this is an urgent alert regarding ${student.name}. Please check their portal for recent low attendance or performance drops.`
                })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(`🚨 SMS/Email Alert sent to ${student.name}'s parents!`);
            } else {
                toast.error(data.error || "Failed to send alert.");
            }
        } catch (error) {
            toast.error("Server connection error.");
        } finally {
            setIsAlerting(false);
        }
    };

    // 🔥 NAYA FUNCTION: Jab Submit dabaaye
    const submitCustomMessage = async () => {
        if (!customMessage.trim()) {
            toast.error("Please type a message first!");
            return;
        }

        setIsSendingMessage(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/api/teachers/send-message/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: selectedStudent.id,
                    recipient_type: "student",
                    message: customMessage
                })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("✅ Message Delivered Successfully!");
                setIsMessageModalOpen(false); // Close modal on success
                setCustomMessage(""); // Reset input
            } else {
                toast.error(data.error || "Message delivery failed.");
            }
        } catch (error) {
            toast.error("Server connection error.");
        } finally {
            setIsSendingMessage(false);
        }
    };

    const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
    const batches = ["All", ...new Set(students.map(s => s.batch))];
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBatch = selectedBatch === "All" || student.batch === selectedBatch;
        return matchesSearch && matchesBatch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'excellent': return '#10b981';
            case 'good': return '#3b82f6';
            case 'average': return '#f59e0b';
            case 'danger': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <div className="premium-students-wrapper">
            <Toaster position="top-right" />

            <div className="inner-container">
                <motion.div className="header-section" initial="hidden" animate="show" variants={fadeUp}>
                    <div className="header-left">
                        <div className="title-row">
                            <div className="icon-box"><Users size={28} color="#ffffff" /></div>
                            <h1 className="main-title">My Students</h1>
                        </div>
                        <p className="sub-title">Track attendance, monitor performance, and manage your batches.</p>
                    </div>
                    <div className="stats-row">
                        <div className="stat-pill"><strong>{students.length}</strong> Total Students</div>
                        <div className="stat-pill danger"><strong>{students.filter(s => s.attendance < 50).length}</strong> Low Attendance</div>
                    </div>
                </motion.div>

                <motion.div className="toolbar" initial="hidden" animate="show" variants={fadeUp}>
                    <div className="search-wrapper">
                        <Search size={20} className="input-icon" />
                        <input
                            type="text" placeholder="Search by name or Roll No..."
                            className="premium-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-wrapper">
                        <Filter size={20} className="input-icon" />
                        <select className="premium-select" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '30vh', color: '#64748b' }}>
                        <Loader2 size={40} className="spinner" style={{ animation: 'spin 1s linear infinite', color: '#10b981', marginBottom: '10px' }} />
                        <p>Fetching real student data from server...</p>
                    </div>
                ) : (
                    <motion.div className="students-grid" initial="hidden" animate="show" variants={fadeUp}>
                        {filteredStudents.map((student) => (
                            <div key={student.id} className="student-card" onClick={() => setSelectedStudent(student)}>
                                <div className="card-top">
                                    <div className="avatar-wrapper">
                                        <div className="avatar">{student.name.charAt(0).toUpperCase()}</div>
                                        <span className="status-indicator" style={{ background: getStatusColor(student.status) }}></span>
                                    </div>
                                    <div className="student-identity">
                                        <h3>{student.name}</h3>
                                        <p>{student.id} • {student.batch}</p>
                                    </div>
                                </div>
                                <div className="metrics-container">
                                    <div className="metric-box">
                                        <span className="metric-title">Attendance</span>
                                        <div className="metric-value">
                                            <span style={{ color: student.attendance < 75 ? '#ef4444' : '#10b981' }}>{student.attendance}%</span>
                                        </div>
                                    </div>
                                    <div className="vertical-divider"></div>
                                    <div className="metric-box">
                                        <span className="metric-title">Avg Score</span>
                                        <div className="metric-value">
                                            <span>{student.score}%</span>
                                        </div>
                                    </div>
                                    <div className="vertical-divider"></div>
                                    <div className="metric-box">
                                        <span className="metric-title">Grade</span>
                                        <div className="metric-value">
                                            <span className="grade-badge">{student.grade}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-bottom">
                                    <button className="btn-message" onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedStudent(student);
                                        setIsMessageModalOpen(true);
                                    }}>
                                        <Mail size={16} /> Message
                                    </button>
                                    <button className="btn-profile" onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedStudent(student);
                                    }}>
                                        View Profile <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredStudents.length === 0 && (
                            <div className="empty-state">
                                <Users size={48} color="#cbd5e1" />
                                <h3>No Students Found</h3>
                                <p>No real students found in the database.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* 🔥 STUDENT 360° PROFILE MODAL (DRAWER) 🔥 */}
            <AnimatePresence>
                {selectedStudent && !isMessageModalOpen && (
                    <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
                        <motion.div
                            className="profile-modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            <div className="modal-header">
                                <h2>Student Profile</h2>
                                <button className="close-btn" onClick={() => setSelectedStudent(null)}><X size={24} /></button>
                            </div>

                            <div className="modal-body">
                                <div className="profile-banner">
                                    <div className="profile-avatar-large" style={{ background: getStatusColor(selectedStudent.status) }}>{selectedStudent.name.charAt(0).toUpperCase()}</div>
                                    <div className="profile-info-large">
                                        <h3>{selectedStudent.name}</h3>
                                        <p>{selectedStudent.id} | {selectedStudent.batch}</p>
                                    </div>
                                </div>

                                <div className="contact-grid">
                                    <div className="contact-item"><Phone size={16} /> {selectedStudent.phone}</div>
                                    <div className="contact-item"><Mail size={16} /> {selectedStudent.email}</div>
                                </div>

                                <div className="section-title"><TrendingUp size={18} /> Performance Summary</div>
                                <div className="summary-cards">
                                    <div className="s-card">
                                        <h4>Attendance</h4>
                                        <h2 style={{ color: selectedStudent.attendance < 75 ? '#ef4444' : '#10b981' }}>{selectedStudent.attendance}%</h2>
                                        <div className="progress-bar"><div className="fill" style={{ width: `${selectedStudent.attendance}%`, background: selectedStudent.attendance < 75 ? '#ef4444' : '#10b981' }}></div></div>
                                    </div>
                                    <div className="s-card">
                                        <h4>Average Score</h4>
                                        <h2>{selectedStudent.score}%</h2>
                                        <div className="progress-bar"><div className="fill" style={{ width: `${selectedStudent.score}%`, background: '#3b82f6' }}></div></div>
                                    </div>
                                </div>

                                <div className="section-title"><BookOpen size={18} /> Recent Activities</div>
                                <div className="activity-list">
                                    <div className="activity-item">
                                        <div className="act-icon"><Award size={16} color="#10b981" /></div>
                                        <div className="act-details">
                                            <h4>Physics Term 1 Exam</h4>
                                            <p>Scored {selectedStudent.score}/100</p>
                                        </div>
                                        <span className="act-date">2 days ago</span>
                                    </div>
                                    <div className="activity-item">
                                        <div className="act-icon"><CheckCircle size={16} color="#3b82f6" /></div>
                                        <div className="act-details">
                                            <h4>Assignment: Chapter 4</h4>
                                            <p>Submitted successfully</p>
                                        </div>
                                        <span className="act-date">1 week ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn-alert"
                                    onClick={() => handleAlertParents(selectedStudent)}
                                    disabled={isAlerting}
                                    style={{ opacity: isAlerting ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                >
                                    {isAlerting ? <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : null}
                                    {isAlerting ? 'Sending Alert...' : 'Alert Parents'}
                                </button>

                                <button
                                    className="btn-primary"
                                    onClick={() => setIsMessageModalOpen(true)}
                                >
                                    Direct Message
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🔥 NAYA: BEAUTIFUL CUSTOM MESSAGE MODAL (CENTER POPUP) 🔥 */}
            <AnimatePresence>
                {isMessageModalOpen && selectedStudent && (
                    <div className="custom-modal-backdrop" onClick={() => setIsMessageModalOpen(false)}>
                        <motion.div
                            className="custom-message-modal"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        >
                            <div className="c-modal-header">
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Send Message</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>To: {selectedStudent.name}</p>
                                </div>
                                <button className="c-close-btn" onClick={() => setIsMessageModalOpen(false)}><X size={20} /></button>
                            </div>

                            <div className="c-modal-body">
                                <textarea
                                    className="custom-textarea"
                                    placeholder={`Type your message for ${selectedStudent.name}...`}
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    rows={5}
                                    autoFocus
                                ></textarea>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <AlertCircle size={14} /> This message will be sent via Email/SMS.
                                </p>
                            </div>

                            <div className="c-modal-footer">
                                <button className="c-btn-cancel" onClick={() => setIsMessageModalOpen(false)}>Cancel</button>
                                <button
                                    className="c-btn-send"
                                    onClick={submitCustomMessage}
                                    disabled={isSendingMessage || !customMessage.trim()}
                                >
                                    {isSendingMessage ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
                                    {isSendingMessage ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
        /* --- ORIGINAL CSS --- */
        .premium-students-wrapper * { box-sizing: border-box !important; }
        .premium-students-wrapper { background-color: transparent; width: 100%; height: 100vh; overflow-y: auto; overflow-x: hidden; font-family: 'Inter', sans-serif; color: #0f172a; }
        .inner-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 30px; padding-bottom: 120px; }
        .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        .header-left { display: flex; flex-direction: column; gap: 5px; }
        .title-row { display: flex; align-items: center; gap: 15px; }
        .icon-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 10px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);}
        .main-title { font-size: 2.2rem; font-weight: 800; color: #0f172a !important; margin: 0; line-height: 1; }
        .sub-title { color: #64748b; font-size: 1.05rem; margin: 0; }
        .stats-row { display: flex; gap: 10px; flex-wrap: wrap;}
        .stat-pill { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 50px; font-size: 0.9rem; color: #475569; }
        .stat-pill strong { color: #0f172a; font-size: 1rem;}
        .stat-pill.danger { background: #fef2f2; border-color: #fecaca; color: #ef4444; }
        .stat-pill.danger strong { color: #dc2626; }
        .toolbar { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
        .search-wrapper, .filter-wrapper { position: relative; flex: 1; min-width: 250px;}
        .input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .premium-input, .premium-select { width: 100%; padding: 16px 16px 16px 45px; border-radius: 16px; border: 2px solid #e2e8f0 !important; font-size: 1rem; outline: none; background-color: #ffffff !important; color: #0f172a !important; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.02); appearance: none; }
        .premium-input:focus, .premium-select:focus { border-color: #10b981 !important; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
        .students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .student-card { background: white; border-radius: 20px; padding: 20px; border: 1px solid #e2e8f0; transition: 0.3s; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column;}
        .student-card:hover { transform: translateY(-5px); border-color: #10b981; box-shadow: 0 15px 30px rgba(16,185,129,0.1); }
        .card-top { display: flex; align-items: center; gap: 15px; margin-bottom: 20px;}
        .avatar-wrapper { position: relative; }
        .avatar { width: 50px; height: 50px; border-radius: 16px; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; }
        .status-indicator { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; }
        .student-identity h3 { margin: 0 0 4px 0; font-size: 1.2rem; color: #1e293b; font-weight: 700;}
        .student-identity p { margin: 0; font-size: 0.85rem; color: #64748b; font-weight: 500;}
        .metrics-container { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #f1f5f9;}
        .metric-box { display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1;}
        .metric-title { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;}
        .metric-value { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
        .vertical-divider { width: 1px; height: 30px; background: #e2e8f0; }
        .grade-badge { background: #1e293b; color: white; padding: 2px 10px; border-radius: 6px; font-size: 0.9rem;}
        .card-bottom { display: flex; gap: 10px; margin-top: auto;}
        .btn-message { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; color: #475569; font-weight: 600; cursor: pointer; transition: 0.2s;}
        .btn-message:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1;}
        .btn-profile { flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 10px; border: none; border-radius: 10px; background: #ecfdf5; color: #059669; font-weight: 700; cursor: pointer; transition: 0.2s;}
        .btn-profile:hover { background: #10b981; color: white; }
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; background: white; border-radius: 24px; border: 2px dashed #e2e8f0; text-align: center; }
        .empty-state h3 { color: #1e293b; font-size: 1.5rem; margin: 15px 0 5px 0; }
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 9998; display: flex; justify-content: flex-end; }
        .profile-modal { width: 100%; max-width: 450px; height: 100%; background: white; box-shadow: -10px 0 40px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
        .modal-header { padding: 25px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
        .modal-header h2 { margin: 0; color: #0f172a; font-size: 1.5rem; font-weight: 800;}
        .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; padding: 5px;}
        .close-btn:hover { color: #ef4444; transform: rotate(90deg); }
        .modal-body { flex: 1; overflow-y: auto; padding: 30px; }
        .modal-body::-webkit-scrollbar { width: 6px; }
        .modal-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .profile-banner { display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
        .profile-avatar-large { width: 80px; height: 80px; color: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; box-shadow: 0 10px 20px rgba(16,185,129,0.3);}
        .profile-info-large h3 { margin: 0 0 5px 0; font-size: 1.6rem; color: #1e293b; font-weight: 800;}
        .profile-info-large p { margin: 0; color: #64748b; font-weight: 500;}
        .contact-grid { display: flex; flex-direction: column; gap: 10px; background: #f8fafc; padding: 15px; border-radius: 16px; margin-bottom: 30px; border: 1px solid #f1f5f9;}
        .contact-item { display: flex; align-items: center; gap: 10px; color: #475569; font-size: 0.9rem; font-weight: 500;}
        .contact-item svg { color: #94a3b8; }
        .section-title { font-size: 1.1rem; color: #1e293b; font-weight: 800; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;}
        .summary-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;}
        .s-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; }
        .s-card h4 { margin: 0 0 10px 0; color: #64748b; font-size: 0.9rem;}
        .s-card h2 { margin: 0 0 15px 0; color: #0f172a; font-size: 1.8rem; font-weight: 800;}
        .progress-bar { width: 100%; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .progress-bar .fill { height: 100%; border-radius: 10px; }
        .activity-list { display: flex; flex-direction: column; gap: 15px; }
        .activity-item { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #f1f5f9; border-radius: 16px; background: white; transition: 0.2s;}
        .activity-item:hover { border-color: #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);}
        .act-icon { width: 40px; height: 40px; border-radius: 12px; background: #f8fafc; display: flex; align-items: center; justify-content: center;}
        .act-details { flex: 1; }
        .act-details h4 { margin: 0 0 3px 0; color: #1e293b; font-size: 0.95rem; font-weight: 700;}
        .act-details p { margin: 0; color: #64748b; font-size: 0.85rem;}
        .act-date { font-size: 0.75rem; color: #94a3b8; font-weight: 500;}
        .modal-footer { padding: 20px 30px; border-top: 1px solid #f1f5f9; display: flex; gap: 15px; background: white;}
        .btn-alert { flex: 1; padding: 14px; border: 2px solid #fee2e2; background: white; color: #ef4444; font-weight: 700; border-radius: 14px; cursor: pointer; transition: 0.2s;}
        .btn-alert:hover { background: #fef2f2; }
        .btn-primary { flex: 2; padding: 14px; border: none; background: #10b981; color: white; font-weight: 700; border-radius: 14px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(16,185,129,0.3);}
        .btn-primary:hover { background: #059669; transform: translateY(-2px); }

        /* 🔥 NAYA CSS: CUSTOM MESSAGE MODAL 🔥 */
        .custom-modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; justify-content: center; align-items: center; }
        .custom-message-modal { width: 90%; max-width: 500px; background: white; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow: hidden; display: flex; flex-direction: column; }
        .c-modal-header { padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
        .c-close-btn { background: #e2e8f0; border: none; width: 32px; height: 32px; border-radius: 50%; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .c-close-btn:hover { background: #ef4444; color: white; }
        .c-modal-body { padding: 25px; }
        .custom-textarea { width: 100%; border: 2px solid #e2e8f0; border-radius: 16px; padding: 15px; font-size: 1rem; font-family: inherit; color: #0f172a; resize: none; outline: none; transition: border-color 0.3s; }
        .custom-textarea:focus { border-color: #10b981; }
        .c-modal-footer { padding: 20px 25px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 15px; background: white; }
        .c-btn-cancel { padding: 12px 24px; border: 1px solid #cbd5e1; background: white; color: #475569; font-weight: 600; border-radius: 12px; cursor: pointer; transition: 0.2s; }
        .c-btn-cancel:hover { background: #f1f5f9; color: #0f172a; }
        .c-btn-send { padding: 12px 24px; border: none; background: #10b981; color: white; font-weight: 600; border-radius: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .c-btn-send:hover:not(:disabled) { background: #059669; transform: translateY(-2px); }
        .c-btn-send:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 768px) {
            .inner-container { padding: 85px 15px 100px 15px !important; }
            .header-section { flex-direction: column; align-items: flex-start; }
            .toolbar { flex-direction: column; gap: 15px; }
            .search-wrapper, .filter-wrapper { width: 100%; }
            .students-grid { grid-template-columns: 1fr !important; }
            .metrics-container { padding: 10px; }
            .profile-modal { max-width: 100%; border-radius: 20px 20px 0 0; height: 90vh; margin-top: 10vh;}
            .custom-message-modal { width: 95%; }
        }
      `}</style>
        </div>
    );
}