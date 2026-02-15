import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import "./dashboard.css"; 

export default function Homework() {
  const [assignments, setAssignments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // Success Modal States
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successDesc, setSuccessDesc] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({ 
    title: "", subject: "", deadline: "", class: "", description: "", attachment: "" 
  });

  useEffect(() => {
    setAssignments([
      { id: 1, title: "Physics Laws Chapter 3", subject: "Physics", class: "Class 10-A", deadline: "2025-12-25", status: "Active", submissions: 12, description: "Complete the exercises in Chapter 3 covering Newton's Laws of Motion.", attachment: "physics_chap3.pdf" },
      { id: 2, title: "Algebra Linear Equations", subject: "Maths", class: "Class 9-B", deadline: "2025-12-24", status: "Active", submissions: 24, description: "Solve all linear equations in Exercise 4.2.", attachment: "math_worksheet.jpg" },
    ]);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = assignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assignments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleView = (task) => {
    setSelectedAssignment(task);
    setShowDetailPanel(true);
  };

  const handleViewSubmissions = () => {
    setShowSubmissions(true);
  };

  // --- FIXED: DOWNLOAD LOGIC (No Corrupt Zip) ---
  const handleDownloadReport = () => {
    // 1. Create a simple text summary instead of a fake zip
    const dummyContent = `
      Student Submissions Report
      Assignment: ${selectedAssignment.title}
      ---------------------------------------------------
      1. Aarav Sharma - On Time - Score: Pending
      2. Vivaan Gupta - On Time - Score: 8/10
      3. Diya Patel - Late - Score: Pending
      
      * This is a generated summary file for demo purposes.
    `;

    const blob = new Blob([dummyContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    // Changed extension to .txt so Windows opens it correctly
    link.download = `${selectedAssignment.title.replace(/\s+/g, '_')}_Report.txt`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // 2. UI Notification (Replaces Alert)
    setSuccessTitle("Downloading...");
    setSuccessDesc("Submission report has been saved.");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const handleCloseTask = () => {
    const updatedList = assignments.map(t => 
        t.id === selectedAssignment.id ? { ...t, status: "Closed" } : t
    );
    setAssignments(updatedList);
    setShowDetailPanel(false);
    setSuccessTitle("Task Closed!");
    setSuccessDesc("This assignment is no longer accepting submissions.");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const handleCreate = () => {
    if(!formData.title) return;
    const newWork = {
        id: assignments.length + 1,
        ...formData, 
        status: "Active",
        submissions: 0
    };
    setAssignments([newWork, ...assignments]);
    setFormData({ title: "", subject: "", deadline: "", class: "", description: "", attachment: "" });
    setShowAddModal(false);
    setSuccessTitle("Published!");
    setSuccessDesc("Homework assigned successfully.");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', 
    background: '#1e293b', color: '#ffffff', outline: 'none', fontSize: '0.95rem', transition: '0.3s'
  };

  return (
    <div className="dashboard-container" style={{background: '#f8fafc', height: '100vh', display: 'flex', overflow: 'hidden'}}>
      <SidebarModern />

      <div className="main-content" style={{flex: 1, padding: '30px 40px', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column'}}>
        
        <header className="fade-in-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-1px', margin: 0 }}>Homework & Tasks</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>Manage daily assignments and track submissions.</p>
          </div>
          <button className="btn-glow pulse-animation hover-lift" onClick={() => setShowAddModal(true)}>
            <span style={{marginRight: '8px', fontSize: '1.2rem'}}>+</span> Create Homework
          </button>
        </header>

        <div className="stats-grid fade-in-up" style={{display: 'flex', gap: '20px', marginBottom: '30px', animationDelay: '0.1s', flexShrink: 0}}>
            <div className="stat-card-mini hover-scale" style={{flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: '0.2s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <span style={{color:'#64748b', fontWeight: '600', fontSize: '0.9rem'}}>Active Tasks</span>
                    <b style={{color:'#6366f1', fontSize:'2rem'}}>{assignments.filter(a => a.status === 'Active').length}</b>
                </div>
            </div>
            <div className="stat-card-mini hover-scale" style={{flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: '0.2s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <span style={{color:'#64748b', fontWeight: '600', fontSize: '0.9rem'}}>Submissions</span>
                    <b style={{color:'#10b981', fontSize:'2rem'}}>124</b>
                </div>
            </div>
            <div className="stat-card-mini hover-scale" style={{flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: '0.2s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <span style={{color:'#64748b', fontWeight: '600', fontSize: '0.9rem'}}>Pending Grade</span>
                    <b style={{color:'#f59e0b', fontSize:'2rem'}}>18</b>
                </div>
            </div>
        </div>

        <div className="glass-card fade-in-up" style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '24px', animationDelay: '0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{width: '100%', overflowX: 'auto'}}>
                <h3 style={{marginBottom: '25px', color: '#0f172a', fontSize: '1.2rem'}}>Recent Assignments</h3>
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th style={{width: '15%'}}>SUBJECT</th>
                            <th style={{width: '30%'}}>TITLE</th>
                            <th style={{width: '15%'}}>CLASS</th>
                            <th style={{width: '15%'}}>DEADLINE</th>
                            <th style={{width: '15%'}}>STATUS</th>
                            <th style={{width: '10%'}}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((task, idx) => (
                            <tr key={task.id} className="floating-row stagger-animation" style={{animationDelay: `${idx * 0.1}s`}}>
                                <td><span className="dept-badge" style={{background: '#eef2ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.8rem'}}>{task.subject}</span></td>
                                <td><b style={{color: '#0f172a', fontSize: '0.95rem'}}>{task.title}</b></td>
                                <td style={{color: '#64748b', fontWeight: '500'}}>{task.class}</td>
                                <td style={{color: '#64748b', fontWeight: '500'}}>{task.deadline}</td>
                                <td>
                                    <span className={`status-pill`} style={{
                                        background: task.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                                        color: task.status === 'Active' ? '#166534' : '#991b1b',
                                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-block'
                                    }}>
                                        ● {task.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-view-detail hover-scale" onClick={() => handleView(task)} style={{
                                        background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', 
                                        padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem'
                                    }}>
                                        View ↗
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9'}}>
                <button className="page-btn hover-scale" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} style={{padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#334155', fontWeight: '600', transition: '0.2s'}}>← Prev</button>
                <span className="page-info" style={{color: '#64748b', fontSize: '0.9rem'}}>Page <b>{currentPage}</b> of {totalPages}</span>
                <button className="page-btn hover-scale" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} style={{padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: '#334155', fontWeight: '600', transition: '0.2s'}}>Next →</button>
            </div>
        </div>

        {/* --- DETAIL PANEL --- */}
        {showDetailPanel && selectedAssignment && (
            <div className="overlay-blur" onClick={() => setShowDetailPanel(false)}>
                <div className="luxe-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
                    <div className="panel-header-simple" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                        <h3 style={{margin: 0, color: '#0f172a'}}>Task Details</h3>
                        <button className="close-circle-btn hover-rotate" onClick={() => setShowDetailPanel(false)} style={{width: '35px', height: '35px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#f1f5f9', color: '#64748b'}}>✕</button>
                    </div>
                    
                    <div className="panel-content-scroll">
                        <div className="student-profile-hero zoom-in" style={{textAlign: 'center', marginBottom: '30px'}}>
                            <div className="hero-avatar" style={{width: '80px', height: '80px', margin: '0 auto 15px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', boxShadow: '0 10px 20px rgba(245, 158, 11, 0.3)'}}>📝</div>
                            <h2 style={{color: '#0f172a', margin: '0 0 5px', fontSize: '1.4rem'}}>{selectedAssignment.title}</h2>
                            <span className="course-tag" style={{background: '#fff7ed', color: '#c2410c', padding: '5px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: '600'}}>{selectedAssignment.subject} • {selectedAssignment.class}</span>
                        </div>

                        <div className="stats-row fade-in-up" style={{display: 'flex', gap: '15px', marginBottom: '30px', animationDelay: '0.1s'}}>
                            <div className="stat-box" style={{flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0'}}>
                                <small style={{display:'block', color:'#64748b', fontSize:'0.75rem', marginBottom:'5px', textTransform:'uppercase', fontWeight:'700'}}>Submissions</small>
                                <b style={{fontSize:'1.2rem', color:'#0f172a'}}>{selectedAssignment.submissions}</b>
                            </div>
                            <div className="stat-box" style={{flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0'}}>
                                <small style={{display:'block', color:'#64748b', fontSize:'0.75rem', marginBottom:'5px', textTransform:'uppercase', fontWeight:'700'}}>Due Date</small>
                                <b style={{fontSize:'1.1rem', color:'#ef4444'}}>{selectedAssignment.deadline}</b>
                            </div>
                        </div>

                        <div className="detail-section fade-in-up" style={{animationDelay: '0.2s', marginBottom: '30px'}}>
                            <h4 style={{fontSize:'0.8rem', color:'#94a3b8', textTransform:'uppercase', marginBottom:'15px', fontWeight:'700'}}>Description</h4>
                            <p style={{color: '#334155', lineHeight: '1.6', fontSize: '0.95rem', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #e2e8f0'}}>
                                {selectedAssignment.description || "No description provided."}
                            </p>
                            
                            {selectedAssignment.attachment && (
                                <div style={{marginTop: '15px', background: '#ecfdf5', padding: '10px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', color: '#047857', fontSize: '0.9rem'}}>
                                    <span style={{marginRight: '10px'}}>📎</span> 
                                    <b>{selectedAssignment.attachment}</b>
                                </div>
                            )}
                        </div>

                        <div className="panel-footer-actions fade-in-up" style={{display: 'flex', gap: '10px', marginTop: 'auto', animationDelay: '0.3s'}}>
                            <button className="btn-edit-pro hover-lift" onClick={handleViewSubmissions} style={{flex: 1, padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>View Submissions</button>
                            <button className="btn-suspend-pro hover-lift" onClick={handleCloseTask} style={{flex: 1, padding: '14px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fee2e2', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>Close Task</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- SUBMISSIONS MODAL --- */}
        {showSubmissions && (
            <div className="overlay-blur centered-flex" style={{zIndex: 4000}} onClick={() => setShowSubmissions(false)}>
                <div className="luxe-modal zoom-in" onClick={(e) => e.stopPropagation()} style={{background: 'white', width: '500px', padding: '30px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <h3 style={{margin: 0, color: '#0f172a'}}>Student Submissions</h3>
                        <button onClick={() => setShowSubmissions(false)} style={{background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b'}}>✕</button>
                    </div>
                    
                    <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '20px'}}>
                        Showing latest submissions for <b>{selectedAssignment?.title}</b>
                    </p>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto'}}>
                        {[
                            {name: "Aarav Sharma", date: "Dec 21, 10:30 AM", status: "On Time", score: "Pending"},
                            {name: "Vivaan Gupta", date: "Dec 21, 11:15 AM", status: "On Time", score: "8/10"},
                            {name: "Diya Patel", date: "Dec 22, 09:00 AM", status: "Late", score: "Pending"},
                        ].map((sub, i) => (
                            <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={{width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>{sub.name[0]}</div>
                                    <div>
                                        <div style={{fontWeight: '700', color: '#1e293b', fontSize: '0.9rem'}}>{sub.name}</div>
                                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>{sub.date}</div>
                                    </div>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <span style={{
                                        display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px',
                                        background: sub.status === 'Late' ? '#fef2f2' : '#f0fdf4',
                                        color: sub.status === 'Late' ? '#991b1b' : '#166534'
                                    }}>{sub.status}</span>
                                    <div style={{fontSize: '0.8rem', color: '#334155', fontWeight: '600'}}>Score: {sub.score}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleDownloadReport} 
                        style={{width: '100%', marginTop: '25px', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'}}
                    >
                        Download Report (.txt)
                    </button>
                </div>
            </div>
        )}

        {/* --- CREATE MODAL --- */}
        {showAddModal && (
            <div className="overlay-blur centered-flex" style={{zIndex: 3000}} onClick={() => setShowAddModal(false)}>
                <div className="luxe-modal bounce-in" onClick={(e) => e.stopPropagation()} style={{background: 'white', padding: '30px', borderRadius: '24px', width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'}}>
                    <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                        <h2 style={{margin: 0, color: '#0f172a'}}>Create Assignment</h2>
                        <button className="close-btn hover-rotate" onClick={() => setShowAddModal(false)} style={{background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b'}}>✕</button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="input-group" style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px', color: '#64748b', fontSize: '0.9rem'}}>Title</label>
                            <input type="text" placeholder="e.g. Newton's Laws" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={inputStyle} />
                        </div>
                        <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                            <div className="input-group" style={{flex: 1}}>
                                <label style={{display: 'block', marginBottom: '5px', color: '#64748b', fontSize: '0.9rem'}}>Subject</label>
                                <input type="text" placeholder="Physics" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} style={inputStyle}/>
                            </div>
                            <div className="input-group" style={{flex: 1}}>
                                <label style={{display: 'block', marginBottom: '5px', color: '#64748b', fontSize: '0.9rem'}}>Class</label>
                                <input type="text" placeholder="10-A" value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})} style={inputStyle}/>
                            </div>
                        </div>
                        <div className="input-group" style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px', color: '#64748b', fontSize: '0.9rem'}}>Deadline</label>
                            <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} style={inputStyle}/>
                        </div>
                        <div className="input-group" style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px', color: '#64748b', fontSize: '0.9rem'}}>Description</label>
                            <textarea placeholder="Enter detailed instructions..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{...inputStyle, height: '80px', resize: 'none', fontFamily: 'inherit'}}></textarea>
                        </div>
                        <div className="input-group" style={{marginBottom: '25px'}}>
                            <label style={{display: 'block', marginBottom: '5px', color: '#64748b', fontSize: '0.9rem'}}>Upload Material (PDF/Img)</label>
                            <div style={{position: 'relative'}}>
                                <input type="file" id="file-upload" onChange={(e) => setFormData({...formData, attachment: e.target.files[0]?.name})} style={{display: 'none'}} />
                                <label htmlFor="file-upload" style={{...inputStyle, display: 'flex', alignItems: 'center', cursor: 'pointer', color: formData.attachment ? '#10b981' : '#94a3b8'}}>
                                    <span style={{marginRight: '10px', fontSize: '1.2rem'}}>📎</span> {formData.attachment || "Choose file to upload..."}
                                </label>
                            </div>
                        </div>
                        <button className="btn-confirm-gradient hover-lift" onClick={handleCreate} style={{width: '100%', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'}}>Publish Homework</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- DYNAMIC SUCCESS MODAL --- */}
        {showSuccess && (
          <div className="overlay-blur centered-flex" style={{zIndex: 5000}}>
             <div className="glass-card zoom-in" style={{background: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '350px'}}>
                <div className="success-ring" style={{width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'}}>
                    <span className="checkmark" style={{color: '#10b981', fontSize: '2.5rem', transform: 'rotate(45deg) scaleX(-1)', display: 'block'}}>L</span>
                </div>
                <h2 style={{color: '#0f172a', marginTop: '20px'}}>{successTitle}</h2>
                <p style={{color: '#64748b'}}>{successDesc}</p>
             </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes bounceIn { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
        @keyframes checkPop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }

        .fade-in-down { animation: fadeDown 0.6s ease-out; }
        .fade-in-up { animation: fadeUp 0.6s ease-out forwards; opacity: 0; }
        .slide-in-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .zoom-in { animation: zoomIn 0.4s ease-out; }
        .bounce-in { animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .pulse-animation { animation: pulse 2s infinite; }
        .stagger-animation { opacity: 0; animation: fadeUp 0.5s ease-out forwards; }

        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.2); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .centered-flex { justify-content: center; align-items: center; }
        .luxe-panel { width: 400px; height: 100%; background: white; padding: 30px; display: flex; flex-direction: column; box-shadow: -10px 0 40px rgba(0,0,0,0.1); overflow-y: auto; }
        
        .hover-scale:hover { transform: scale(1.05); transition: 0.2s; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: 0.2s; }
        .hover-rotate:hover { transform: rotate(90deg); background: #e2e8f0; transition: 0.2s; }

        .btn-glow { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; color: white; padding: 10px 22px; border-radius: 50px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25); display: flex; align-items: center; font-size: 0.9rem; }
        .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(99, 102, 241, 0.35); }

        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        .modern-table th { color: #94a3b8; font-size: 0.75rem; letter-spacing: 1px; text-align: left; padding: 0 15px; font-weight: 700; }
        .floating-row { background: white; transition: 0.3s; cursor: default; }
        .floating-row td { padding: 15px; border-bottom: 1px solid #f1f5f9; }
        .floating-row:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); z-index: 10; position: relative; }
        
        .success-ring { animation: checkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        ::placeholder { color: #94a3b8; opacity: 1; }
      `}</style>
    </div>
  );
}