import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import "./dashboard.css"; 
import toast, { Toaster } from 'react-hot-toast';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "", employee_id: "", email: "", phone: "", gender: "Male", 
    department: "", subject: "", qualification: "", experience: "", designation: "Assistant Teacher"
  });

  const getDummyTeachers = () => [
    { id: 1, full_name: "Dr. Kunal Verma", employee_id: "TCH-101", department: "Science", subject: "Physics", designation: "HOD", email: "kunal@shivadda.com", phone: "+91 9876543210", gender: "Male", qualification: "PhD", experience: "12 Years" },
    { id: 2, full_name: "Shivani Sharma", employee_id: "TCH-102", department: "Mathematics", subject: "Calculus", designation: "PGT", email: "shivani@shivadda.com", phone: "+91 9876543211", gender: "Female", qualification: "M.Sc", experience: "8 Years" }
  ];

  useEffect(() => { 
      fetchTeachers();
      fetchDeptStats(); 
  }, []);

  const fetchTeachers = async () => {
      try {
        const res = await api.get("/teachers/"); 
        setTeachers(res.data && res.data.length > 0 ? res.data : getDummyTeachers());
      } catch (err) { setTeachers(getDummyTeachers()); }
  };

  const fetchDeptStats = async () => {
      try {
          const res = await api.get("/teachers/department-stats/");
          setDeptStats(res.data);
      } catch (err) {
          console.error("Stats fetch error:", err);
      }
  };

  // 🚀 FIX: EKDUM SAFE UPDATE LOGIC (No Damage to anything)
  const handleOnboardSubmit = async () => {
    if (!formData.full_name || !formData.employee_id || !formData.email) return toast.error("Essential details required!");
    setLoading(true);
    
    try {
        const safeData = {
            ...formData,
            email: formData.email.trim().toLowerCase(),
            employee_id: formData.employee_id.trim()
        };

        if (editMode && selectedTeacher) {
            // 🔥 SMART FIX: Agar email change NAHI hua hai, toh use update list se hata do
            if (safeData.email === (selectedTeacher.email || "").trim().toLowerCase()) {
                delete safeData.email;
            }
            // 🔥 SMART FIX: Agar employee_id change NAHI hua hai, toh use bhi hata do
            if (safeData.employee_id === (selectedTeacher.employee_id || "").trim()) {
                delete safeData.employee_id;
            }

            const res = await api.patch(`/teachers/${selectedTeacher.id}/`, safeData);
            setTeachers(teachers.map(t => t.id === selectedTeacher.id ? res.data : t));
            toast.success("Profile Updated Successfully!");
        } else {
            const res = await api.post("/teachers/", safeData);
            setTeachers([res.data, ...teachers]); 
            toast.success("New Instructor Onboarded!");
            setShowSuccess(true);
            setTimeout(() => { setShowSuccess(false); }, 2000);
        }

        fetchDeptStats();

        setFormData({ full_name: "", employee_id: "", email: "", phone: "", gender: "Male", department: "", subject: "", qualification: "", experience: "", designation: "Assistant Teacher" });
        setShowAddModal(false);
        setEditMode(false);

    } catch (error) {
        console.error("Backend Error Data:", error.response?.data);
        const serverError = error.response?.data;
        if (serverError && typeof serverError === 'object') {
            const firstKey = Object.keys(serverError)[0];
            const errorMsg = Array.isArray(serverError[firstKey]) ? serverError[firstKey][0] : serverError[firstKey];
            toast.error(`${firstKey.toUpperCase()}: ${errorMsg}`, { duration: 4000 });
        } else {
            toast.error("Database connection failed!");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleEditClick = () => {
      setFormData({...selectedTeacher});
      setEditMode(true);
      setShowDetailPanel(false);
      setShowAddModal(true);
  };

  const handleDeleteClick = async () => {
      if(!window.confirm(`Are you sure you want to deactivate ${selectedTeacher.full_name}?`)) return;
      try {
          await api.delete(`/teachers/${selectedTeacher.id}/`);
          setTeachers(teachers.filter(t => t.id !== selectedTeacher.id));
          toast.success("Teacher deactivated successfully.");
          fetchDeptStats();
      } catch (err) {
          toast.error("Delete Action Failed.");
      }
      setShowDetailPanel(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = teachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(teachers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailPanel(true);
  };

  const handleInput = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const openNewAddModal = () => {
      setEditMode(false);
      setFormData({ full_name: "", employee_id: "", email: "", phone: "", gender: "Male", department: "", subject: "", qualification: "", experience: "", designation: "Assistant Teacher" });
      setShowAddModal(true);
  };

  const totalTeachers = teachers.length || 1; 
  const statColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  const existingDepartments = deptStats.map(stat => stat.department);

  return (
    <div className="dashboard-container" style={{background: '#f8fafc', height: '100vh', overflow: 'hidden', display: 'flex'}}>
      <SidebarModern />
      <Toaster position="top-center" />
      
      <div className="main-content" style={{flex: 1, padding: '30px 40px', position: 'relative', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto'}}>
        
        <header className="fade-in-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-1px', margin: 0 }}>
              Teachers Hub
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>Manage faculty profiles, payroll & roles.</p>
          </div>
          
          <button className="btn-glow" onClick={openNewAddModal} style={{ position: 'relative', zIndex: 50 }}>
            <span style={{marginRight: '8px', fontSize: '1.1rem'}}>+</span> Onboard Teacher
          </button>
        </header>

        <div style={{ display: 'flex', gap: '30px' }}>
          
          <div className="glass-card fade-in-up" style={{ flex: 2, background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', animationDelay: '0.1s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
                <h3 style={{marginBottom: '20px', color: '#0f172a'}}>Staff Directory</h3>
                <table className="modern-table">
                <thead>
                    <tr>
                    <th>INSTRUCTOR</th>
                    <th>DEPARTMENT / SUBJECT</th>
                    <th>CONTACT</th>
                    <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((t, idx) => (
                    <tr key={t.id} className="floating-row stagger-animation" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div className="mini-avatar">{t.full_name ? t.full_name.charAt(0).toUpperCase() : 'T'}</div>
                            <div>
                                <div style={{color: '#0f172a', fontWeight: '700', fontSize: '0.95rem'}}>{t.full_name}</div>
                                <div style={{fontSize: '0.75rem', color: '#6366f1'}}>#{t.employee_id}</div>
                            </div>
                        </div>
                        </td>
                        <td>
                            <span className="dept-badge">{t.department || "General"}</span>
                            <div style={{fontSize: '0.8rem', color: '#64748b', marginTop:'4px'}}>{t.subject || "N/A"}</div>
                        </td>
                        <td>
                            <div style={{fontSize: '0.85rem', color: '#334155'}}>{t.phone || "--"}</div>
                            <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>{t.email}</div>
                        </td>
                        <td>
                        <button className="btn-view-detail hover-scale" onClick={() => handleViewTeacher(t)}>
                            View ↗
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination-bar">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>← Prev</button>
                    <span className="page-info">Page <b>{currentPage}</b> of {totalPages}</span>
                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next →</button>
                </div>
            )}
          </div>

          <div className="glass-card fade-in-up" style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '24px', height: 'fit-content', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', animationDelay: '0.3s' }}>
             <h3 style={{marginBottom: '25px', color: '#0f172a'}}>Department Stats</h3>
             
             {deptStats.length === 0 ? (
                 <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>No stats available.</p>
             ) : (
                 deptStats.slice(0, 6).map((stat, i) => {
                     const fillPercentage = (stat.count / totalTeachers) * 100;
                     return (
                     <div key={i} className="stat-card-mini" style={{marginTop: i===0?0:'20px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                            <span style={{color: '#64748b', fontWeight: '600', fontSize: '0.9rem'}}>{stat.department}</span> 
                            <b style={{color: '#0f172a', fontSize: '1rem'}}>{stat.count} Staff</b>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{width: `${fillPercentage}%`, background: statColors[i % statColors.length]}}></div>
                        </div>
                     </div>
                 )})
             )}
          </div>

        </div>

        {/* --- DETAIL PANEL --- */}
        {showDetailPanel && selectedTeacher && (
          <div className="overlay-blur" onClick={() => setShowDetailPanel(false)}>
            <div className="luxe-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
              <div className="panel-header-simple">
                 <button className="close-circle-btn hover-rotate" onClick={() => setShowDetailPanel(false)}>✕</button>
                 <span>Staff Profile</span>
              </div>
              <div className="panel-content-scroll">
                <div className="student-profile-hero zoom-in">
                    <div className="hero-avatar">{selectedTeacher.full_name ? selectedTeacher.full_name.charAt(0).toUpperCase() : 'T'}</div>
                    <h2 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: '800', margin: '10px 0 5px 0' }}>{selectedTeacher.full_name}</h2>
                    <span className="course-tag">{selectedTeacher.designation} • {selectedTeacher.department || 'General'}</span>
                </div>
                <div className="stats-row fade-in-up" style={{animationDelay: '0.1s'}}>
                    <div className="stat-box"><small>Experience</small><b>{selectedTeacher.experience || "N/A"}</b></div>
                    <div className="stat-box"><small>Qualification</small><b>{selectedTeacher.qualification || "N/A"}</b></div>
                </div>
                <div className="detail-section fade-in-up" style={{animationDelay: '0.2s'}}>
                    <h4>Contact & Official Info</h4>
                    <div className="info-row"><label>Employee ID</label><p>#{selectedTeacher.employee_id}</p></div>
                    <div className="info-row"><label>Official Email</label><p>{selectedTeacher.email}</p></div>
                    <div className="info-row"><label>Phone</label><p>{selectedTeacher.phone || 'N/A'}</p></div>
                    <div className="info-row"><label>Department</label><p>{selectedTeacher.department || 'General'}</p></div>
                    <div className="info-row"><label>Subject Taught</label><p>{selectedTeacher.subject || 'N/A'}</p></div>
                    <div className="info-row"><label>Gender</label><p>{selectedTeacher.gender || 'Not Specified'}</p></div>
                </div>
                <div className="panel-footer-actions fade-in-up" style={{animationDelay: '0.4s'}}>
                    <button className="btn-edit-pro hover-lift" onClick={handleEditClick}>Edit Profile</button>
                    <button className="btn-suspend-pro hover-lift" onClick={handleDeleteClick}>Deactivate</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ADD / EDIT MODAL --- */}
        {showAddModal && (
          <div className="overlay-blur centered-flex" style={{zIndex: 3000}} onClick={() => setShowAddModal(false)}>
            <div className="luxe-modal zoom-in" style={{width: '600px'}} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 style={{fontSize: '1.5rem', color: '#0f172a', margin: 0}}>{editMode ? "Edit Profile" : "New Instructor"}</h2>
                        <p style={{fontSize: '0.9rem', color: '#64748b', margin: 0}}>Enter official staff details.</p>
                    </div>
                    <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
                </div>
                
                <div className="modal-body" style={{marginTop: '20px'}}>
                    <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                        <div style={{flex: 1}}>
                            <label className="form-label">Full Name</label>
                            <input type="text" name="full_name" className="luxe-input" placeholder="Dr. A.K. Gupta" value={formData.full_name} onChange={handleInput} />
                        </div>
                        <div style={{flex: 1}}>
                            <label className="form-label">Employee ID</label>
                            <input type="text" name="employee_id" className="luxe-input" placeholder="TCH-101" value={formData.employee_id} onChange={handleInput} />
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                        <div style={{flex: 1}}>
                            <label className="form-label">Email ID</label>
                            <input type="email" name="email" className="luxe-input" placeholder="official@school.com" value={formData.email} onChange={handleInput} />
                        </div>
                        <div style={{flex: 1}}>
                            <label className="form-label">Phone Number</label>
                            <input type="text" name="phone" className="luxe-input" placeholder="+91 98..." value={formData.phone} onChange={handleInput} />
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                        <div style={{flex: 1}}>
                            <label className="form-label">Designation</label>
                            <select name="designation" className="luxe-input" value={formData.designation} onChange={handleInput}>
                                <option>Assistant Teacher</option><option>PGT</option><option>TGT</option><option>HOD</option><option>Lab Instructor</option><option>Coach</option>
                            </select>
                        </div>
                        <div style={{flex: 1}}>
                            <label className="form-label">Department</label>
                            <input list="department-list" type="text" name="department" className="luxe-input" placeholder="e.g. Science, Arts" value={formData.department} onChange={handleInput} />
                            <datalist id="department-list">
                                {existingDepartments.map((dept, index) => <option key={index} value={dept} />)}
                            </datalist>
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                        <div style={{flex: 1}}>
                            <label className="form-label">Subject Taught</label>
                            <input type="text" name="subject" className="luxe-input" placeholder="e.g. Physics, History" value={formData.subject} onChange={handleInput} />
                        </div>
                        <div style={{flex: 1}}>
                            <label className="form-label">Qualification</label>
                            <input type="text" name="qualification" className="luxe-input" placeholder="M.Sc, B.Ed" value={formData.qualification} onChange={handleInput} />
                        </div>
                    </div>

                    <div style={{display: 'flex', gap: '15px'}}>
                        <div style={{flex: 1}}>
                            <label className="form-label">Experience</label>
                            <input type="text" name="experience" className="luxe-input" placeholder="5 Years" value={formData.experience} onChange={handleInput} />
                        </div>
                        <div style={{flex: 1}}>
                            <label className="form-label">Gender</label>
                            <select name="gender" className="luxe-input" value={formData.gender} onChange={handleInput}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={{marginTop: '30px', display: 'flex', gap: '10px'}}>
                        <button className="btn-confirm-gradient" style={{marginTop: 0, flex: 1}} onClick={handleOnboardSubmit} disabled={loading}>
                            {loading ? 'Saving...' : (editMode ? 'Update Profile' : 'Save Profile')}
                        </button>
                        <button className="btn-ghost" style={{flex: 1}} onClick={() => setShowAddModal(false)}>Cancel</button>
                    </div>
                </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="overlay-blur centered-flex" style={{zIndex: 3000}}>
              <div className="glass-card zoom-in" style={{background: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '350px'}}>
                <div className="success-ring"><span className="checkmark">L</span></div>
                <h2 style={{color: '#0f172a', marginTop: '20px'}}>Success!</h2>
                <p style={{color: '#64748b'}}>Action completed successfully.</p>
              </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes checkPop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }

        .fade-in-down { animation: fadeDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .fade-in-up { animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; } 
        .slide-in-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .zoom-in { animation: zoomIn 0.5s ease-out; }
        .stagger-animation { opacity: 0; animation: fadeUp 0.5s ease-out forwards; }

        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.05); }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .hover-rotate { transition: transform 0.3s; }
        .hover-rotate:hover { transform: rotate(90deg); background: #e2e8f0; }

        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        .modern-table th { color: #94a3b8; font-size: 0.75rem; letter-spacing: 1px; text-align: left; padding: 0 20px; font-weight: 700; }
        .floating-row { background: white; transition: all 0.2s ease; cursor: pointer; }
        .floating-row td { padding: 16px 20px; border-top: 1px solid transparent; border-bottom: 1px solid transparent; }
        .floating-row:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(148, 163, 184, 0.1); }
        
        .mini-avatar { width: 36px; height: 36px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
        .dept-badge { background: #f0fdf4; color: #166534; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
        
        .btn-view-detail { background: #eef2ff; color: #4f46e5; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.8rem; }
        .btn-view-detail:hover { background: #4f46e5; color: white; }

        .btn-glow { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; color: white; padding: 12px 25px; border-radius: 50px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25); transition: all 0.2s; display: flex; align-items: center; font-size: 0.9rem; }
        .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(99, 102, 241, 0.35); }

        .pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .page-info { color: #64748b; font-size: 0.9rem; }
        .page-btn { background: #fff; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; cursor: pointer; transition: 0.2s; color: #334155; font-weight: 600; font-size: 0.85rem; }
        .page-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.2); backdrop-filter: blur(8px); z-index: 1000; display: flex; justify-content: flex-end; }
        .centered-flex { justify-content: center; align-items: center; }
        
        .luxe-panel { width: 400px; height: 100%; background: white; padding: 30px; display: flex; flex-direction: column; box-shadow: -15px 0 45px rgba(0,0,0,0.08); overflow-y: auto; }
        .luxe-modal { background: white; padding: 30px; border-radius: 24px; width: 450px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
        .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }

        .panel-header-simple { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; font-weight: 700; font-size: 1.1rem; color: #0f172a; }
        .close-circle-btn { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; border: none; cursor: pointer; color: #64748b; font-size: 1rem; }
        
        .student-profile-hero { text-align: center; margin-bottom: 30px; }
        .hero-avatar { width: 90px; height: 90px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 30px; margin: 0 auto 15px; color: white; font-size: 2.5rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
        .course-tag { background: #f0f9ff; color: #0369a1; padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: 600; margin-top: 5px; display: inline-block; }

        .stats-row { display: flex; gap: 15px; margin-bottom: 30px; }
        .stat-box { flex: 1; background: #f8fafc; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-box small { display: block; color: #64748b; font-size: 0.75rem; margin-bottom: 5px; font-weight: 700; text-transform: uppercase; }
        .stat-box b { font-size: 1.1rem; color: #0f172a; }

        .detail-section { margin-bottom: 25px; }
        .detail-section h4 { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.5px; font-weight: 700; }
        .info-row { margin-bottom: 12px; border-bottom: 1px dashed #f1f5f9; padding-bottom: 8px; }
        .info-row label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 600; }
        .info-row p { font-size: 1rem; color: #334155; font-weight: 500; margin-top: 2px; }

        .panel-footer-actions { margin-top: auto; display: flex; gap: 10px; padding-top: 20px; }
        .btn-edit-pro { flex: 1; padding: 12px; background: #0f172a; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-edit-pro:hover { background: #1e293b; }
        .btn-suspend-pro { flex: 1; padding: 12px; background: #fff1f2; color: #e11d48; border: 1px solid #fee2e2; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-suspend-pro:hover { background: #fee2e2; }

        .form-label { display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 6px; }
        .luxe-input { width: 100%; padding: 12px; border: 1px solid #334155; border-radius: 10px; outline: none; transition: 0.2s; background: #ffffff; color: #0f172a; font-weight: 500; border-color: #cbd5e1; }
        .luxe-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .btn-confirm-gradient { width: 100%; padding: 14px; margin-top: 20px; background: #0f172a; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
        .btn-ghost { background: transparent; color: #64748b; border: 1px solid #e2e8f0; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; }

        .success-ring { width: 90px; height: 90px; background: #ecfdf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; animation: checkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .checkmark { font-size: 3rem; color: #10b981; transform: rotate(45deg) scaleX(-1); display: inline-block; }
        
        .stat-card-mini { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; transition: all 0.3s; }
        .progress-bar-bg { background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden; }
        .progress-bar-fill { height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}