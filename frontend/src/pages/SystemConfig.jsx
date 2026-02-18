import React, { useState } from "react";
import SidebarModern from "../components/SidebarModern";
import toast, { Toaster } from 'react-hot-toast'; 
import "./dashboard.css"; 

export default function SystemConfig() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // --- CONFIG STATE (Central Control) ---
  const [config, setConfig] = useState({
    // General
    schoolName: "Shivadda Academy",
    schoolCode: "SCH-1024",
    address: "123, Knowledge Park, New Delhi",
    phone: "+91 98765 43210",
    email: "admin@shivadda.com",
    
    // Images (Preview URLs)
    logoPreview: null,
    signPreview: null,

    // ID & Session
    currentSession: "2025-2026",
    studentPrefix: "STU",
    teacherPrefix: "TCH",
    dateFormat: "DD-MM-YYYY",

    // Fees
    currency: "₹",
    lateFinePerDay: 50,
    receiptPrefix: "REC",
    
    // Notifications (Toggles)
    smsAttendance: true,
    smsFee: true,
    emailResult: false,

    // Security
    allowTeacherEdit: false,
    maintenanceMode: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setConfig({ ...config, [e.target.name]: value });
  };

  // ✅ Handle Image Upload & Preview
  const handleImageUpload = (e, field) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setConfig(prev => ({ ...prev, [field]: reader.result }));
              toast.success("Image Uploaded Successfully! 🖼️");
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulation of API Call
    setTimeout(() => {
        setLoading(false);
        toast.success("System Settings Updated Successfully! ⚙️");
    }, 1500);
  };

  const handleBackup = () => {
      toast.loading("Generating Database Backup...");
      setTimeout(() => {
          toast.dismiss();
          toast.success("Backup Downloaded: shivadda_backup_2025.sql 📥");
      }, 2000);
  };

  // Modern Input Style
  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '12px', 
    border: '1px solid #cbd5e1', background: '#ffffff', 
    color: '#0f172a', outline: 'none', fontSize: '0.9rem', 
    fontWeight: '600', transition: '0.3s', boxSizing: 'border-box'
  };

  return (
    <div className="sys-config-wrapper">
      <SidebarModern />
      <Toaster position="top-center" />

      <div className="sys-config-main">
        
        {/* Header */}
        <header className="page-header" style={{marginBottom: '30px'}}>
            <h1 className="gradient-text" style={{fontSize: '2.5rem', fontWeight: '900', margin: 0}}>System Configuration</h1>
            <p style={{color: '#64748b', marginTop: '5px'}}>Control Center: Manage global settings, rules & automation.</p>
        </header>

        {/* --- TABS --- */}
        <div className="tabs-scroll-container">
            {[
                { id: 'general', label: '🏫 General Profile', icon: '' },
                { id: 'session', label: '⚙️ ID & Session', icon: '' },
                { id: 'fees', label: '💰 Fees Rules', icon: '' },
                { id: 'notify', label: '🔔 Notifications', icon: '' },
                { id: 'backup', label: '💾 Backup & Data', icon: '' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`config-tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="glass-card fade-in-up content-card">
            
            {/* 1. GENERAL TAB */}
            {activeTab === 'general' && (
                <div className="form-section">
                    <h3 className="section-title">School Identity</h3>
                    <div className="grid-2-col">
                        <div className="input-group">
                            <label>School Name</label>
                            <input type="text" name="schoolName" value={config.schoolName} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div className="input-group">
                            <label>School Code</label>
                            <input type="text" name="schoolCode" value={config.schoolCode} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                    
                    <div className="input-group">
                        <label>Address (For Receipts)</label>
                        <textarea name="address" value={config.address} onChange={handleChange} style={{...inputStyle, height: '80px', resize: 'none'}} />
                    </div>

                    <div className="grid-2-col">
                        <div className="input-group"><label>Official Phone</label><input type="text" name="phone" value={config.phone} onChange={handleChange} style={inputStyle} /></div>
                        <div className="input-group"><label>Official Email</label><input type="email" name="email" value={config.email} onChange={handleChange} style={inputStyle} /></div>
                    </div>

                    <h3 className="section-title" style={{marginTop: '30px'}}>Branding</h3>
                    
                    {/* Upload Buttons with Preview */}
                    <div className="branding-upload-wrapper">
                        {/* Logo Upload */}
                        <div className="upload-wrapper">
                            <input type="file" id="logo-upload" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'logoPreview')} />
                            <label htmlFor="logo-upload" className="upload-box">
                                {config.logoPreview ? (
                                    <img src={config.logoPreview} alt="Logo" style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:'12px'}} />
                                ) : (
                                    <>
                                        <span style={{fontSize: '2rem'}}>🏫</span>
                                        <small>Upload Logo</small>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Sign Upload */}
                        <div className="upload-wrapper">
                            <input type="file" id="sign-upload" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'signPreview')} />
                            <label htmlFor="sign-upload" className="upload-box">
                                {config.signPreview ? (
                                    <img src={config.signPreview} alt="Sign" style={{width:'100%', height:'100%', objectFit:'contain', borderRadius:'12px'}} />
                                ) : (
                                    <>
                                        <span style={{fontSize: '2rem'}}>✍️</span>
                                        <small>Principal Sign</small>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. SESSION TAB */}
            {activeTab === 'session' && (
                <div className="form-section">
                    <h3 className="section-title">Academic Session</h3>
                    <div className="grid-2-col">
                        <div className="input-group">
                            <label>Current Active Session</label>
                            <select name="currentSession" value={config.currentSession} onChange={handleChange} style={inputStyle}>
                                <option>2024-2025</option>
                                <option>2025-2026</option>
                                <option>2026-2027</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Date Format</label>
                            <select name="dateFormat" value={config.dateFormat} onChange={handleChange} style={inputStyle}>
                                <option>DD-MM-YYYY</option>
                                <option>MM/DD/YYYY</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="section-title" style={{marginTop: '30px'}}>Auto-ID Generation Rules</h3>
                    <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '15px'}}>System will automatically add these prefixes to new records.</p>
                    <div className="grid-3-col">
                        <div className="input-group"><label>Student ID Prefix</label><input type="text" name="studentPrefix" value={config.studentPrefix} onChange={handleChange} style={inputStyle} /></div>
                        <div className="input-group"><label>Teacher ID Prefix</label><input type="text" name="teacherPrefix" value={config.teacherPrefix} onChange={handleChange} style={inputStyle} /></div>
                        <div className="input-group"><label>Staff ID Prefix</label><input type="text" value="STF" readOnly style={{...inputStyle, background: '#f1f5f9'}} /></div>
                    </div>
                </div>
            )}

            {/* 3. FEES TAB */}
            {activeTab === 'fees' && (
                <div className="form-section">
                    <h3 className="section-title">Finance Configuration</h3>
                    <div className="grid-2-col">
                        <div className="input-group"><label>Currency Symbol</label><input type="text" name="currency" value={config.currency} onChange={handleChange} style={inputStyle} /></div>
                        <div className="input-group"><label>Receipt No Prefix</label><input type="text" name="receiptPrefix" value={config.receiptPrefix} onChange={handleChange} style={inputStyle} /></div>
                    </div>

                    <h3 className="section-title" style={{marginTop: '30px'}}>Fine & Penalties</h3>
                    <div className="grid-2-col">
                        <div className="input-group">
                            <label>Late Fee Calculation (Per Day)</label>
                            <input type="number" name="lateFinePerDay" value={config.lateFinePerDay} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div className="input-group">
                            <label>Grace Period (Days)</label>
                            <input type="number" value="5" readOnly style={{...inputStyle, background: '#f1f5f9'}} />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {activeTab === 'notify' && (
                <div className="form-section">
                    <h3 className="section-title">Automated Alerts (SMS/Email)</h3>
                    
                    <div className="toggle-row">
                        <div>
                            <h4>Attendance SMS</h4>
                            <p>Send SMS to parent when student is Absent.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" name="smsAttendance" checked={config.smsAttendance} onChange={handleChange} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="toggle-row">
                        <div>
                            <h4>Fee Payment Receipt</h4>
                            <p>Send Receipt link via SMS on payment success.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" name="smsFee" checked={config.smsFee} onChange={handleChange} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="toggle-row">
                        <div>
                            <h4>Exam Result Email</h4>
                            <p>Email report card PDF to registered email.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" name="emailResult" checked={config.emailResult} onChange={handleChange} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
            )}

            {/* 5. BACKUP TAB */}
            {activeTab === 'backup' && (
                <div className="form-section">
                    <h3 className="section-title">Data Management</h3>
                    <div className="backup-box">
                        <h4 style={{margin: '0 0 10px', color: '#0f172a'}}>Full Database Backup</h4>
                        <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>Download a complete SQL dump of your current system including Student, Fees, and Library data.</p>
                        <button className="btn-secondary" onClick={handleBackup}>⬇ Download SQL Backup</button>
                    </div>

                    <h3 className="section-title" style={{color: '#dc2626'}}>Danger Zone</h3>
                    <div className="danger-box">
                        <h4 style={{margin: '0 0 10px', color: '#991b1b'}}>System Reset</h4>
                        <p style={{fontSize: '0.9rem', color: '#b91c1c', marginBottom: '15px'}}>This will delete all student and fee records. Only for new session setup.</p>
                        <button className="btn-danger">⚠️ Reset All Data</button>
                    </div>
                </div>
            )}

            {/* FOOTER SAVE */}
            {activeTab !== 'backup' && (
                <div className="footer-save-row">
                    <button className="btn-confirm-gradient hover-lift" onClick={handleSave}>
                        {loading ? 'Saving...' : 'Save Configuration ✅'}
                    </button>
                </div>
            )}

        </div>
      </div>

      <style>{`
        /* Core */
        html, body, #root { margin: 0; padding: 0; height: 100%; }

        .sys-config-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #f8fafc;
            font-family: 'Inter', sans-serif;
        }

        .sys-config-main {
            flex: 1;
            margin-left: 280px; 
            padding: 40px;
            padding-bottom: 120px !important; 
            height: 100vh;
            overflow-y: auto !important; 
            box-sizing: border-box;
            max-width: calc(100% - 280px);
            position: relative;
            z-index: 1;
        }

        .gradient-text { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* Layout Grids */
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 20px; width: 100%; }
        .grid-3-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; width: 100%; }
        
        /* ✅ FIXED: Tab Scroll for Mobile */
        .tabs-scroll-container {
            display: flex; gap: 15px; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;
            overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch;
        }
        .tabs-scroll-container::-webkit-scrollbar { display: none; } /* Hide scrollbar for aesthetics */

        .config-tab { background: transparent; border: none; padding: 10px 20px; font-weight: 600; color: #64748b; cursor: pointer; border-radius: 30px; transition: 0.3s; font-size: 0.95rem; white-space: nowrap; flex-shrink: 0; }
        .config-tab:hover { background: #f1f5f9; color: #0f172a; }
        .config-tab.active { background: #0f172a; color: white; box-shadow: 0 5px 15px rgba(15, 23, 42, 0.2); }

        .content-card { background: white; padding: 40px; border-radius: 24px; min-height: 500px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }

        /* Form Styling */
        .section-title { font-size: 1.1rem; color: #334155; margin-bottom: 20px; border-left: 4px solid #6366f1; padding-left: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #64748b; margin-bottom: 8px; }
        
        /* Upload Boxes */
        .branding-upload-wrapper { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
        .upload-box { width: 120px; height: 120px; border: 2px dashed #cbd5e1; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; color: #64748b; position: relative; overflow: hidden; background: #f8fafc; flex-shrink: 0; }
        .upload-box:hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }

        /* Toggle Switch */
        .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f1f5f9; gap: 15px;}
        .toggle-row h4 { margin: 0 0 5px; color: #0f172a; }
        .toggle-row p { margin: 0; color: #64748b; font-size: 0.9rem; }
        
        .switch { position: relative; display: inline-block; width: 50px; height: 26px; flex-shrink: 0;}
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: #10b981; }
        input:checked + .slider:before { transform: translateX(24px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        /* Buttons & Boxes */
        .footer-save-row { margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: right; }
        .btn-confirm-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15); transition: 0.2s; padding: 12px 30px; }
        .btn-confirm-gradient:hover { transform: translateY(-2px); }
        
        .btn-secondary { background: white; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; color: #0f172a; }
        .btn-secondary:hover { background: #f8fafc; }

        .backup-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
        .danger-box { background: #fef2f2; padding: 20px; border-radius: 12px; border: 1px solid #fecaca; }
        .btn-danger { background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }

        /* Animation */
        .fade-in-up { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
            .sys-config-main { margin-left: 0 !important; max-width: 100%; width: 100%; }
        }

        @media (max-width: 850px) {
            /* Unlock Scroll on Mobile */
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            
            .sys-config-wrapper {
                display: block !important; 
                height: auto !important;
                min-height: 100vh !important;
            }

            .sys-config-main {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 85px !important; 
                padding-bottom: 180px !important; /* Prevents chatbot overlap */
                width: 100vw !important;
                max-width: 100vw !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                display: block !important; 
            }

            /* Responsive Grids */
            .grid-2-col { grid-template-columns: 1fr !important; gap: 15px; }
            .grid-3-col { grid-template-columns: 1fr !important; gap: 15px; }
            
            .content-card { padding: 20px !important; }
            
            .footer-save-row { text-align: center; }
            .footer-save-row button { width: 100%; }
            
            .branding-upload-wrapper { justify-content: center; }
        }
      `}</style>
    </div>
  );
}