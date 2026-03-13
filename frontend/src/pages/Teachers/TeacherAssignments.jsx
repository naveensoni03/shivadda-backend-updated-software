import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen, Calendar, Clock, PlusCircle, Search, Edit, Trash2,
    UploadCloud, Users, CheckCircle, ChevronRight, FileText, ArrowLeft, CheckSquare
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TeacherAssignments() {
    const [activeTab, setActiveTab] = useState("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Dummy Assignments Data
    const [assignments, setAssignments] = useState([
        { id: 1, title: "Newton's Laws Worksheet", subject: "Class 11 Physics", deadlineDate: "2026-03-20", deadlineTime: "23:59", maxMarks: 20, status: "active", submitted: 35, totalStudents: 40 },
        { id: 2, title: "Organic Reactions Chart", subject: "Class 12 Chemistry", deadlineDate: "2026-03-10", deadlineTime: "10:00", maxMarks: 15, status: "closed", submitted: 45, totalStudents: 45 },
        { id: 3, title: "Trigonometry Ex 8.1", subject: "Class 10 Maths", deadlineDate: "2026-03-25", deadlineTime: "17:00", maxMarks: 10, status: "active", submitted: 10, totalStudents: 50 },
    ]);

    // Form State
    const [formData, setFormData] = useState({ title: "", subject: "", deadlineDate: "", deadlineTime: "", maxMarks: "", instructions: "" });

    // Dummy Student Submissions
    const dummySubmissions = [
        { id: 101, name: "Aarav Sharma", status: "submitted", file: "aarav_hw.pdf", date: "19 Mar 2026", marks: "", feedback: "" },
        { id: 102, name: "Priya Patel", status: "submitted", file: "priya_physics.jpg", date: "19 Mar 2026", marks: "18", feedback: "Good work" },
        { id: 103, name: "Rohan Singh", status: "pending", file: null, date: "-", marks: "", feedback: "" },
    ];

    const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
    const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } };

    // Add Assignment
    const handleSaveAssignment = (e) => {
        e.preventDefault();
        const newAss = {
            id: Date.now(),
            ...formData,
            status: "active",
            submitted: 0,
            totalStudents: 50 // Default for demo
        };
        setAssignments([newAss, ...assignments]);
        toast.success("Assignment Created & Published!");
        setActiveTab("list");
        setFormData({ title: "", subject: "", deadlineDate: "", deadlineTime: "", maxMarks: "", instructions: "" });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this assignment?")) {
            setAssignments(assignments.filter(a => a.id !== id));
            toast.error("Assignment Deleted");
        }
    };

    const openEvaluation = (assignment) => {
        setSelectedAssignment(assignment);
        setActiveTab("evaluate");
    };

    const filteredAssignments = assignments.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="premium-assign-wrapper">
            <Toaster position="top-right" />

            <div className="inner-container">
                {/* HEADER */}
                <motion.div className="header-section" initial="hidden" animate="show" variants={fadeUp}>
                    <div className="header-left">
                        <div className="title-row">
                            <div className="icon-box"><BookOpen size={28} color="#ffffff" /></div>
                            <h1 className="main-title">Assignments</h1>
                        </div>
                        <p className="sub-title">Distribute homework, track submissions, and grade student work.</p>
                    </div>

                    {activeTab !== "evaluate" && (
                        <div className="segmented-control">
                            <button className={`segment-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                                <FileText size={18} /> View All
                            </button>
                            <button className={`segment-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
                                <PlusCircle size={18} /> Create New
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* VIEW 1: ASSIGNMENT LIST */}
                {activeTab === "list" && (
                    <motion.div initial="hidden" animate="show" variants={fadeIn}>
                        <div className="search-wrapper">
                            <Search size={22} className="search-icon" />
                            <input
                                type="text" placeholder="Search assignments..."
                                className="premium-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="premium-grid">
                            {filteredAssignments.map((item) => (
                                <div key={item.id} className="premium-card">
                                    <div className="card-top-row">
                                        <div className={`status-pill ${item.status}`}>
                                            <span className="pulsing-dot"></span>
                                            {item.status.toUpperCase()}
                                        </div>
                                        <button className="icon-btn delete" onClick={() => handleDelete(item.id)} title="Delete"><Trash2 size={16} /></button>
                                    </div>

                                    <div className="card-middle">
                                        <h3 className="card-title">{item.title}</h3>
                                        <span className="badge">{item.subject}</span>
                                    </div>

                                    <div className="metrics-grid">
                                        <div className="metric-box">
                                            <Calendar size={14} className="m-icon" />
                                            <span>{item.deadlineDate}</span>
                                        </div>
                                        <div className="metric-box text-red">
                                            <Clock size={14} className="m-icon" />
                                            <span>{item.deadlineTime}</span>
                                        </div>
                                        <div className="metric-box">
                                            <CheckSquare size={14} className="m-icon" />
                                            <span>{item.maxMarks} Marks</span>
                                        </div>
                                    </div>

                                    {/* Submission Progress */}
                                    <div className="progress-section">
                                        <div className="progress-labels">
                                            <span>Submissions</span>
                                            <strong>{item.submitted} / {item.totalStudents}</strong>
                                        </div>
                                        <div className="progress-bg">
                                            <div className="progress-fill" style={{ width: `${(item.submitted / item.totalStudents) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <button className="btn-solid" onClick={() => openEvaluation(item)}>
                                            Evaluate Submissions <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {filteredAssignments.length === 0 && (
                                <div className="empty-state">
                                    <BookOpen size={48} color="#cbd5e1" />
                                    <h3>No Assignments Found</h3>
                                    <p>Create a new homework assignment for your students.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* VIEW 2: CREATE ASSIGNMENT */}
                {activeTab === "create" && (
                    <motion.div initial="hidden" animate="show" variants={fadeUp} className="builder-wrapper">
                        <form onSubmit={handleSaveAssignment} className="builder-block">
                            <div className="block-header">
                                <h3><span className="step-num">1</span> Assignment Details</h3>
                            </div>

                            <div className="premium-form-grid">
                                <div className="form-group full-span">
                                    <label>Assignment Title</label>
                                    <input type="text" placeholder="e.g. Chapter 4 Numerical Problems" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Select Subject</label>
                                    <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required>
                                        <option value="" disabled>-- Choose Class/Subject --</option>
                                        <option value="Class 12 Physics">Class 12 Physics</option>
                                        <option value="Class 11 Chemistry">Class 11 Chemistry</option>
                                        <option value="Class 10 Maths">Class 10 Maths</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Maximum Marks</label><input type="number" placeholder="20" value={formData.maxMarks} onChange={e => setFormData({ ...formData, maxMarks: e.target.value })} required /></div>
                                <div className="form-group"><label>Deadline Date</label><input type="date" value={formData.deadlineDate} onChange={e => setFormData({ ...formData, deadlineDate: e.target.value })} required /></div>
                                <div className="form-group"><label>Deadline Time</label><input type="time" value={formData.deadlineTime} onChange={e => setFormData({ ...formData, deadlineTime: e.target.value })} required /></div>

                                <div className="form-group full-span">
                                    <label>Upload Reference Material (Optional)</label>
                                    <div className="drag-drop-zone">
                                        <UploadCloud size={40} color="#3b82f6" />
                                        <p>Drag & Drop a PDF/Image here or <span>Browse</span></p>
                                        <small>Max file size: 10MB</small>
                                        <input type="file" className="hidden-input" />
                                    </div>
                                </div>

                                <div className="form-group full-span">
                                    <label>Instructions / Description</label>
                                    <textarea rows="4" placeholder="Write any specific instructions for students..." value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} className="premium-textarea"></textarea>
                                </div>
                            </div>

                            <div className="action-bar">
                                <button type="button" className="btn-outline" onClick={() => setActiveTab('list')}>Cancel</button>
                                <button type="submit" className="btn-solid-large">Publish Assignment</button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* VIEW 3: EVALUATION (GRADING) VIEW */}
                {activeTab === "evaluate" && selectedAssignment && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="results-top-bar">
                            <button className="back-btn" onClick={() => setActiveTab("list")}>
                                <ArrowLeft size={20} /> Back
                            </button>
                            <div className="results-meta">
                                <h2>{selectedAssignment.title}</h2>
                                <span className="badge">{selectedAssignment.subject} • Max Marks: {selectedAssignment.maxMarks}</span>
                            </div>
                        </div>

                        <div className="evaluation-list">
                            <div className="eval-header">
                                <h3>Student Submissions</h3>
                                <p>Review files and assign marks.</p>
                            </div>

                            <div className="students-eval-grid">
                                {dummySubmissions.map((student) => (
                                    <div key={student.id} className="student-eval-card">
                                        <div className="student-basic-info">
                                            <div className="s-avatar"><Users size={20} /></div>
                                            <div>
                                                <h4>{student.name}</h4>
                                                <span className={`status-text ${student.status}`}>{student.status.toUpperCase()}</span>
                                            </div>
                                        </div>

                                        {student.status === 'submitted' ? (
                                            <>
                                                <div className="file-box">
                                                    <FileText size={18} color="#3b82f6" />
                                                    <span>{student.file}</span>
                                                </div>
                                                <div className="grading-box">
                                                    <div className="g-input">
                                                        <label>Marks</label>
                                                        <input type="number" placeholder="0" defaultValue={student.marks} />
                                                    </div>
                                                    <div className="g-input full">
                                                        <label>Feedback (Optional)</label>
                                                        <input type="text" placeholder="Good work..." defaultValue={student.feedback} />
                                                    </div>
                                                    <button className="btn-save-marks" onClick={() => toast.success(`Marks saved for ${student.name}`)}>Save</button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="not-submitted-box">
                                                Student has not submitted the assignment yet.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <style>{`
        /* --- GLOBAL RESETS TO PREVENT THEME CLASHES --- */
        .premium-assign-wrapper * { box-sizing: border-box !important; }
        .premium-assign-wrapper { background-color: transparent; width: 100%; height: 100vh; overflow-y: auto; overflow-x: hidden; font-family: 'Inter', sans-serif; color: #0f172a; }
        .inner-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 30px; padding-bottom: 120px; }

        /* --- HEADER STYLES --- */
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 20px; }
        .header-left { display: flex; flex-direction: column; gap: 5px; }
        .title-row { display: flex; align-items: center; gap: 15px; }
        .icon-box { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 10px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);}
        .main-title { font-size: 2.2rem; font-weight: 800; color: #0f172a !important; margin: 0; line-height: 1; }
        .sub-title { color: #64748b; font-size: 1.05rem; margin: 0; }

        .segmented-control { background: #f1f5f9; padding: 6px; border-radius: 14px; display: flex; gap: 5px; border: 1px solid #e2e8f0; }
        .segment-btn { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border: none; background: transparent; color: #64748b; font-weight: 600; font-size: 0.95rem; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; }
        .segment-btn:hover { color: #0f172a; }
        .segment-btn.active { background: white; color: #3b82f6; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

        /* --- SEARCH BAR --- */
        .search-wrapper { position: relative; margin-bottom: 30px; width: 100%; max-width: 600px; }
        .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .premium-search-input { width: 100%; padding: 18px 20px 18px 55px; border-radius: 16px; border: 2px solid #e2e8f0 !important; font-size: 1.05rem; outline: none; background-color: #ffffff !important; color: #0f172a !important; transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.03);}
        .premium-search-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }

        /* --- PREMIUM GRID & CARDS --- */
        .premium-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }
        .premium-card { background: #ffffff !important; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
        .premium-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-color: #cbd5e1; }

        .card-top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .status-pill { display: inline-flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 800; padding: 6px 14px; border-radius: 50px; letter-spacing: 0.5px; }
        .pulsing-dot { width: 8px; height: 8px; border-radius: 50%; }
        
        .status-pill.active { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; }
        .status-pill.active .pulsing-dot { background: #3b82f6; animation: pulse 2s infinite;}
        .status-pill.closed { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
        .status-pill.closed .pulsing-dot { background: #ef4444; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .icon-btn.delete { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s;}
        .icon-btn.delete:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }

        .card-middle { margin-bottom: 20px; }
        .card-title { font-size: 1.4rem; font-weight: 800; color: #0f172a !important; margin: 0 0 10px 0; line-height: 1.3; }
        .badge { display: inline-block; background: #f1f5f9; color: #334155; padding: 4px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid #e2e8f0; }

        .metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 25px; }
        .metric-box { display: flex; flex-direction: column; gap: 5px; background: #f8fafc; padding: 12px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; color: #475569; border: 1px solid #f1f5f9;}
        .m-icon { color: #94a3b8; }
        .text-red { color: #ef4444; background: #fef2f2; border-color: #fee2e2;}
        .text-red .m-icon { color: #ef4444;}

        .progress-section { margin-bottom: 25px; }
        .progress-labels { display: flex; justify-content: space-between; font-size: 0.9rem; color: #64748b; margin-bottom: 8px; font-weight: 500;}
        .progress-labels strong { color: #0f172a; }
        .progress-bg { width: 100%; height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #3b82f6; border-radius: 10px; }

        .card-footer { margin-top: auto; }
        .btn-solid { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; border: none; background: #f1f5f9; color: #0f172a;}
        .btn-solid:hover { background: #3b82f6; color: white; box-shadow: 0 8px 25px rgba(59,130,246,0.3); transform: translateY(-2px); }

        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; background: white; border-radius: 24px; border: 2px dashed #e2e8f0; text-align: center; }
        .empty-state h3 { color: #1e293b; font-size: 1.5rem; margin: 15px 0 5px 0; }

        /* --- BUILDER UI --- */
        .builder-block { background: white; border-radius: 24px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.02); margin-bottom: 30px;}
        .block-header { margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .block-header h3 { font-size: 1.4rem; color: #0f172a !important; margin: 0; display: flex; align-items: center; gap: 10px; }
        .step-num { background: #3b82f6; color: white; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1rem; font-weight: 800; }

        .premium-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 0; }
        .form-group.full-span { grid-column: 1 / -1; }
        .form-group label { font-weight: 600; color: #475569; font-size: 0.9rem; }
        .form-group input, .form-group select { width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0 !important; border-radius: 12px; font-size: 1rem; outline: none; background-color: #f8fafc !important; color: #0f172a !important; transition: 0.3s; }
        .form-group input:focus, .form-group select:focus { border-color: #3b82f6 !important; background-color: white !important; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .premium-textarea { width: 100%; padding: 16px; border: 2px solid #e2e8f0 !important; border-radius: 14px; font-size: 1rem; outline: none; background: #f8fafc !important; color: #0f172a !important; resize: vertical; transition: 0.3s; font-family: inherit;}
        .premium-textarea:focus { border-color: #3b82f6 !important; background: white !important; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }

        .drag-drop-zone { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 30px 20px; text-align: center; background: #f8fafc; cursor: pointer; position: relative; transition: 0.3s; }
        .drag-drop-zone:hover { border-color: #3b82f6; background: #eff6ff; }
        .drag-drop-zone p { margin: 10px 0 5px 0; color: #475569; font-weight: 500; }
        .drag-drop-zone p span { color: #3b82f6; font-weight: 700; text-decoration: underline; }
        .drag-drop-zone small { color: #94a3b8; }
        .hidden-input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

        .action-bar { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
        .btn-outline { padding: 14px 30px; border: 2px solid #e2e8f0; background: white; color: #475569; font-weight: 700; border-radius: 14px; cursor: pointer; transition: 0.2s;}
        .btn-outline:hover { background: #f1f5f9; color: #0f172a; }
        .btn-solid-large { padding: 14px 40px; border: none; background: #3b82f6; color: white; font-weight: 700; border-radius: 14px; cursor: pointer; transition: 0.2s; box-shadow: 0 8px 20px rgba(59,130,246,0.3);}
        .btn-solid-large:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(59,130,246,0.4); }

        /* --- EVALUATION VIEW --- */
        .results-top-bar { display: flex; align-items: center; gap: 20px; background: white; padding: 20px 25px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); margin-bottom: 30px;}
        .back-btn { display: flex; align-items: center; gap: 8px; background: #f1f5f9; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; }
        .back-btn:hover { background: #e2e8f0; color: #0f172a; }
        .results-meta h2 { margin: 0 0 5px 0; font-size: 1.5rem; color: #1e293b; font-weight: 800; }

        .evaluation-list { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .eval-header { margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;}
        .eval-header h3 { margin: 0 0 5px 0; font-size: 1.4rem; color: #1e293b; font-weight: 800; }
        .eval-header p { margin: 0; color: #64748b; }

        .students-eval-grid { display: flex; flex-direction: column; gap: 20px; }
        .student-eval-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; background: #fdfdfd; transition: 0.2s; }
        .student-eval-card:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.03); border-color: #cbd5e1; background: white;}
        
        .student-basic-info { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .s-avatar { width: 45px; height: 45px; background: #eff6ff; color: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .student-basic-info h4 { margin: 0 0 5px 0; color: #1e293b; font-size: 1.1rem; font-weight: 700;}
        .status-text { font-size: 0.8rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; }
        .status-text.submitted { background: #dcfce7; color: #16a34a; }
        .status-text.pending { background: #fef2f2; color: #ef4444; }

        .file-box { display: flex; align-items: center; gap: 10px; background: #eff6ff; border: 1px dashed #bfdbfe; padding: 12px 15px; border-radius: 10px; color: #1e40af; font-weight: 600; cursor: pointer; margin-bottom: 15px; transition: 0.2s;}
        .file-box:hover { background: #dbeafe; }

        .grading-box { display: flex; align-items: flex-end; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9;}
        .g-input { display: flex; flex-direction: column; gap: 6px; }
        .g-input.full { flex: 1; }
        .g-input label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .g-input input { padding: 12px; border: 2px solid #e2e8f0 !important; border-radius: 10px; font-size: 0.95rem; outline: none; background: white !important; color: #0f172a !important; }
        .g-input input:focus { border-color: #3b82f6 !important; }
        .btn-save-marks { padding: 12px 25px; border: none; background: #10b981; color: white; font-weight: 700; border-radius: 10px; cursor: pointer; transition: 0.2s;}
        .btn-save-marks:hover { background: #059669; transform: translateY(-2px);}

        .not-submitted-box { background: #f8fafc; border: 1px dashed #e2e8f0; padding: 20px; text-align: center; color: #64748b; border-radius: 12px; font-weight: 500;}

        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 768px) {
            .inner-container { padding: 85px 15px 100px 15px !important; }
            .header-section { flex-direction: column; align-items: flex-start; gap: 20px; }
            .segmented-control { width: 100%; display: flex; }
            .segment-btn { flex: 1; justify-content: center; }
            
            .premium-grid { grid-template-columns: 1fr; width: 100%; }
            .premium-form-grid { grid-template-columns: 1fr; }
            .metrics-grid { grid-template-columns: 1fr; }
            
            .action-bar { flex-direction: column; }
            .btn-outline, .btn-solid-large { width: 100%; }
            
            .grading-box { flex-direction: column; align-items: stretch; }
            .btn-save-marks { width: 100%; }
        }
      `}</style>
        </div>
    );
}