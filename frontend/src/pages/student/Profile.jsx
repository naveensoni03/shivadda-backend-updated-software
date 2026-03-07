import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import {
  User, Mail, Phone, MapPin, Award,
  Shield, Edit3, Camera, CheckCircle, Sparkles, Loader2, X, Lock, EyeOff, Eye, QrCode
} from "lucide-react";
import StudentSidebar from "../../components/StudentSidebar";
import toast, { Toaster } from "react-hot-toast";

export default function StudentProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Security Modals State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Password Form State
  const [passForm, setPassForm] = useState({ old: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [isPassLoading, setIsPassLoading] = useState(false);

  // 2FA Form State
  const [twoFaStep, setTwoFaStep] = useState(1); // 1: Info, 2: QR Code
  const [twoFaCode, setTwoFaCode] = useState("");

  const [userData, setUserData] = useState({
    name: "Loading...", email: "Loading...", phone: "---", address: "---",
    course: "---", batch: "---", rollNo: "---", bloodGroup: "---", dob: "---"
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/student/login");
      return;
    }
    fetchMyProfile();
  }, [navigate]);

  const fetchMyProfile = async () => {
    setIsLoading(true);
    try {
      const loggedInEmail = (localStorage.getItem("user_email") || "").toLowerCase().trim();
      const loggedInName = (localStorage.getItem("user_name") || "Student").trim();

      setUserData(prev => ({ ...prev, name: loggedInName, email: loggedInEmail || "Email Loading..." }));

      const res = await api.get("/students/list/?limit=1000");
      const allStudents = Array.isArray(res.data) ? res.data : res.data.results || [];

      const myProfile = allStudents.find(s => {
        const backendEmail = (s.email || "").toLowerCase().trim();
        const backendLoginId = (s.login_id || "").toLowerCase().trim();
        const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase().trim();

        if (loggedInEmail && (backendEmail === loggedInEmail || backendLoginId === loggedInEmail)) return true;
        if (!loggedInEmail && loggedInName && fullName === loggedInName.toLowerCase()) return true;
        return false;
      });

      if (myProfile) {
        setUserData({
          name: `${myProfile.first_name || ""} ${myProfile.last_name || ""}`.trim() || loggedInName,
          email: myProfile.email || myProfile.login_id || loggedInEmail,
          phone: myProfile.primary_mobile || "---",
          address: myProfile.current_address || "---",
          course: myProfile.student_class ? `Class ${myProfile.student_class} - ${myProfile.section}` : "---",
          batch: myProfile.batch_session || "---",
          rollNo: myProfile.roll_number || myProfile.admission_number || "---",
          bloodGroup: myProfile.blood_group || "---",
          dob: myProfile.dob || "---"
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 HANDLE PASSWORD CHANGE API SUBMIT
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.old || !passForm.new || !passForm.confirm) return toast.error("All fields are required!");
    if (passForm.new !== passForm.confirm) return toast.error("New passwords do not match!");
    if (passForm.new.length < 8) return toast.error("Password must be at least 8 characters long.");

    setIsPassLoading(true);
    try {
      await api.post("/auth/change-password/", {
        old_password: passForm.old,
        new_password: passForm.new
      });
      toast.success("Password changed successfully! 🔐");
      setShowPasswordModal(false);
      setPassForm({ old: "", new: "", confirm: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password. Old password might be wrong.");
    } finally {
      setIsPassLoading(false);
    }
  };

  // 🚀 HANDLE 2FA VERIFICATION
  const handle2FAVerify = () => {
    if (twoFaCode.length !== 6) return toast.error("Enter a valid 6-digit code!");
    toast.success("2FA Authenticator Linked Successfully! 🛡️");
    setShow2FAModal(false);
    setTwoFaStep(1);
    setTwoFaCode("");
  };

  const pageTransition = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.15 } } };
  const slideUp = { hidden: { y: 40, opacity: 0, scale: 0.95 }, show: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 14 } } };
  const modalVariants = { hidden: { opacity: 0, scale: 0.9, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" } }, exit: { opacity: 0, scale: 0.95, y: 20 } };

  return (
    <div className="student-layout">
      <Toaster position="top-right" />
      <motion.div className="ambient-bg" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}></motion.div>
      <StudentSidebar />

      <main className="student-main-content">
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--primary)' }}>
            <Loader2 size={50} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <h2 style={{ marginTop: '20px' }}>Loading your profile...</h2>
          </div>
        ) : (
          <motion.div className="content-wrapper" variants={pageTransition} initial="hidden" animate="show">

            <motion.div className="profile-banner-container" variants={slideUp}>
              <div className="profile-banner"><div className="banner-pattern"></div></div>
              <div className="profile-header-content">
                <div className="profile-avatar-wrapper">
                  <motion.div className="profile-avatar" whileHover={{ scale: 1.05 }}>
                    <span className="avatar-text">{userData.name !== "Loading..." ? userData.name.charAt(0).toUpperCase() : "S"}</span>
                  </motion.div>
                </div>
                <div className="profile-titles">
                  <h1>{userData.name} <Sparkles size={20} color="#f59e0b" style={{ marginLeft: '10px' }} /></h1>
                  <p className="badge-primary">{userData.course}</p>
                </div>
                <div className="profile-actions">
                  <motion.button className={`action-btn ${isEditing ? 'btn-success' : 'btn-outline'}`} onClick={() => setIsEditing(!isEditing)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {isEditing ? <><CheckCircle size={18} /> Save Profile</> : <><Edit3 size={18} /> Edit Profile</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <div className="profile-grid">
              <div className="grid-col-left">
                <motion.div className="glass-panel info-card" variants={slideUp} whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
                  <div className="card-header"><h3><User size={20} className="icon-blue" /> Identity Card</h3></div>
                  <div className="card-body">
                    <div className="info-row"><span className="info-label">Roll Number</span><span className="info-value font-mono highlight">{userData.rollNo}</span></div>
                    <div className="info-row"><span className="info-label">Batch</span><span className="info-value">{userData.batch}</span></div>
                    <div className="info-row"><span className="info-label">Date of Birth</span><span className="info-value">{userData.dob}</span></div>
                    <div className="info-row"><span className="info-label">Blood Group</span><span className="info-value badge-red">{userData.bloodGroup}</span></div>
                  </div>
                </motion.div>

                {/* 🛡️ SECURITY SECTION */}
                <motion.div className="glass-panel info-card" variants={slideUp} whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
                  <div className="card-header"><h3><Shield size={20} className="icon-green" /> Account Security</h3></div>
                  <div className="card-body">
                    <button className="security-btn" onClick={() => setShowPasswordModal(true)}>Change Password</button>
                    <button className="security-btn outline" onClick={() => setShow2FAModal(true)}>Setup 2FA Authentication</button>
                  </div>
                </motion.div>
              </div>

              <div className="grid-col-right">
                <motion.div className="glass-panel info-card" variants={slideUp} whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
                  <div className="card-header"><h3><Mail size={20} className="icon-purple" /> Contact Information</h3></div>
                  <div className="card-body">
                    <div className="contact-grid">
                      <div className="contact-item">
                        <div className="c-icon"><Mail size={18} /></div>
                        <div className="c-details"><small>Email Address</small>{isEditing ? <input type="email" defaultValue={userData.email} className="edit-input" /> : <p style={{ color: '#4f46e5', fontWeight: '800' }}>{userData.email}</p>}</div>
                      </div>
                      <div className="contact-item">
                        <div className="c-icon"><Phone size={18} /></div>
                        <div className="c-details"><small>Phone Number</small>{isEditing ? <input type="text" defaultValue={userData.phone} className="edit-input" /> : <p>{userData.phone}</p>}</div>
                      </div>
                      <div className="contact-item full-width">
                        <div className="c-icon"><MapPin size={18} /></div>
                        <div className="c-details"><small>Residential Address</small>{isEditing ? <textarea defaultValue={userData.address} className="edit-textarea"></textarea> : <p>{userData.address}</p>}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="glass-panel info-card" variants={slideUp} whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
                  <div className="card-header"><h3><Award size={20} className="icon-orange" /> Academic Summary</h3></div>
                  <div className="card-body">
                    <div className="academic-stats">
                      <div className="stat-box"><h4>84.5%</h4><span>Current CGPA</span></div>
                      <div className="stat-box"><h4>92%</h4><span>Attendance</span></div>
                      <div className="stat-box"><h4>5</h4><span>Active Courses</span></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* 🔐 CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="modal-content security-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  {/* Fixed Text Visibility */}
                  <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '800' }}>Update Password</h2>
                  <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Ensure your account stays secure.</p>
                </div>
                <button className="close-btn" onClick={() => setShowPasswordModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handlePasswordChange} className="modal-body">

                <div className="input-group">
                  <label style={{ color: '#0f172a', fontWeight: '700' }}>Current Password</label>
                  <div className="pass-input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input style={{ color: '#0f172a', fontWeight: '600' }} type={showPass.old ? "text" : "password"} value={passForm.old} onChange={e => setPassForm({ ...passForm, old: e.target.value })} required placeholder="Enter old password" />
                    <button type="button" onClick={() => setShowPass({ ...showPass, old: !showPass.old })} className="eye-btn">{showPass.old ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ color: '#0f172a', fontWeight: '700' }}>New Password</label>
                  <div className="pass-input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input style={{ color: '#0f172a', fontWeight: '600' }} type={showPass.new ? "text" : "password"} value={passForm.new} onChange={e => setPassForm({ ...passForm, new: e.target.value })} required placeholder="Enter new password" />
                    <button type="button" onClick={() => setShowPass({ ...showPass, new: !showPass.new })} className="eye-btn">{showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ color: '#0f172a', fontWeight: '700' }}>Confirm New Password</label>
                  <div className="pass-input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input style={{ color: '#0f172a', fontWeight: '600' }} type={showPass.confirm ? "text" : "password"} value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} required placeholder="Confirm new password" />
                    <button type="button" onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })} className="eye-btn">{showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>

                <button type="submit" className="btn-primary-gradient full-btn" disabled={isPassLoading} style={{ marginTop: '20px' }}>
                  {isPassLoading ? <Loader2 size={18} className="spinner" /> : "Update Password"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛡️ SETUP 2FA MODAL (FIXED TEXT VISIBILITY) */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="modal-content security-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 style={{ color: '#0f172a', margin: 0, fontWeight: '800' }}>Two-Factor Auth</h2>
                  <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Add an extra layer of security.</p>
                </div>
                <button className="close-btn" onClick={() => setShow2FAModal(false)}><X size={20} /></button>
              </div>
              <div className="modal-body text-center">
                {twoFaStep === 1 ? (
                  <div className="two-fa-step1">
                    <Shield size={60} color="#10b981" style={{ margin: '0 auto 15px' }} />
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                      Protect your learning data
                    </h3>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '25px' }}>
                      When you enable 2FA, you'll be required to enter a code from Google Authenticator or Authy every time you sign in.
                    </p>
                    <button className="btn-success full-btn" onClick={() => setTwoFaStep(2)}>Begin Setup</button>
                  </div>
                ) : (
                  <div className="two-fa-step2">
                    <QrCode size={120} color="#0f172a" style={{ margin: '0 auto 15px', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <p style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem', marginBottom: '5px' }}>Scan this QR Code in your App</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Or enter code manually: <b style={{ color: '#4f46e5' }}>X7Y9-LMN2-K9P0-QR55</b></p>

                    <div className="input-group text-left" style={{ marginBottom: '0' }}>
                      <label style={{ color: '#0f172a', fontWeight: '800', fontSize: '0.9rem' }}>Enter 6-digit code</label>
                      <input
                        type="text"
                        value={twoFaCode}
                        onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                        className="modern-input text-center"
                        placeholder="000000"
                        style={{ letterSpacing: '10px', fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', background: '#f8fafc', border: '2px solid #e2e8f0' }}
                      />
                    </div>
                    <button className="btn-primary-gradient full-btn" onClick={handle2FAVerify} style={{ marginTop: '20px' }}>Verify & Activate</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
            --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f3e8ff 100%);
            --glass-bg: rgba(255, 255, 255, 0.85);
            --glass-border: 1px solid rgba(255, 255, 255, 0.9);
            --text-main: #0f172a;
            --text-muted: #64748b;
            --primary: #4f46e5;
            --primary-light: #e0e7ff;
        }

        * { box-sizing: border-box; }
        .student-layout { display: flex; height: 100vh; width: 100%; background: var(--bg-gradient); font-family: 'Inter', sans-serif; overflow: hidden; position: relative; }
        .ambient-bg { position: absolute; inset: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, rgba(248,250,252,0) 50%); z-index: 0; pointer-events: none; background-size: 200% 200%; }

        .student-main-content { flex: 1; margin-left: 280px; height: 100vh; overflow-y: auto; overflow-x: hidden; z-index: 1; scroll-behavior: smooth; width: calc(100% - 280px); }
        .content-wrapper { padding: 40px 50px 100px 50px; max-width: 1200px; margin: 0 auto; }
        
        .glass-panel { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border: var(--glass-border); box-shadow: 0 10px 40px rgba(31, 38, 135, 0.05); border-radius: 24px; transition: all 0.3s; }

        .profile-banner-container { margin-bottom: 40px; position: relative; }
        .profile-banner { height: 200px; border-radius: 24px; background: linear-gradient(135deg, #4f46e5, #8b5cf6, #d946ef); position: relative; overflow: hidden; box-shadow: 0 15px 30px rgba(79,70,229,0.2); }
        .banner-pattern { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 20px 20px; }
        .profile-header-content { display: flex; align-items: flex-end; padding: 0 40px; margin-top: -60px; position: relative; z-index: 10; flex-wrap: wrap; gap: 20px; }
        .profile-avatar { width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, #1e293b, #334155); border: 6px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative; }
        .avatar-text { font-size: 4rem; font-weight: 900; color: white; }
        .profile-titles { flex: 1; padding-bottom: 10px; }
        .profile-titles h1 { margin: 0 0 5px 0; font-size: 2.2rem; font-weight: 900; color: var(--text-main); display: flex; align-items: center; }
        .badge-primary { display: inline-block; background: var(--primary-light); color: var(--primary); padding: 6px 14px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; margin: 0; }
        .badge-red { background: #fee2e2; color: #ef4444; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; }
        
        .profile-actions { padding-bottom: 10px; }
        .action-btn { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.3s; border: none; font-size: 1rem;}
        .btn-outline { background: white; border: 2px solid #e2e8f0; color: var(--text-main); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
        .btn-success { background: #10b981; color: white; box-shadow: 0 8px 20px rgba(16,185,129,0.3); border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;}
        .btn-success:hover { background: #059669; }

        .profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
        @media (max-width: 1100px) { .profile-grid { grid-template-columns: 1fr; } }
        
        .grid-col-left, .grid-col-right { display: flex; flex-direction: column; gap: 30px; }
        .info-card { padding: 30px; }
        .card-header { border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 15px; margin-bottom: 20px; }
        .card-header h3 { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
        
        .icon-blue { color: #3b82f6; } .icon-green { color: #10b981; } .icon-purple { color: #8b5cf6; } .icon-orange { color: #f59e0b; }

        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; }
        .info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .info-label { color: var(--text-muted); font-weight: 600; font-size: 0.95rem; }
        .info-value { font-weight: 800; color: var(--text-main); text-align: right; }
        .font-mono { font-family: monospace; letter-spacing: 1px; }
        .highlight { color: var(--primary); }

        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .contact-item { display: flex; align-items: flex-start; gap: 15px; background: rgba(255,255,255,0.5); padding: 15px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.8); }
        .contact-item.full-width { grid-column: 1 / -1; }
        .c-icon { width: 40px; height: 40px; border-radius: 12px; background: white; display: flex; align-items: center; justify-content: center; color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); flex-shrink: 0;}
        .c-details { flex: 1; }
        .c-details small { display: block; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; font-size: 0.7rem;}
        .c-details p { margin: 0; font-weight: 700; color: var(--text-main); word-break: break-word;}
        
        .edit-input, .edit-textarea { width: 100%; padding: 8px 12px; border-radius: 8px; border: 2px solid var(--primary-light); outline: none; font-weight: 600; color: var(--primary); }
        .academic-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .stat-box { background: white; padding: 20px; border-radius: 16px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-box h4 { margin: 0 0 5px 0; font-size: 2rem; font-weight: 900; color: var(--primary); }
        .stat-box span { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        .security-btn { width: 100%; padding: 14px; margin-bottom: 12px; border-radius: 12px; background: #f1f5f9; border: none; font-weight: 700; color: #334155; cursor: pointer; transition: 0.2s; }
        .security-btn:hover { background: #e2e8f0; color: #0f172a; }
        .security-btn.outline { background: transparent; border: 2px dashed #cbd5e1; }
        .security-btn.outline:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

        /* 🔐 MODAL STYLES */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px); z-index: 999; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .modal-content { background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); width: 100%; position: relative; }
        .security-modal { max-width: 400px; overflow: hidden; }
        .modal-header { padding: 25px 30px 15px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
        .close-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: 0.2s; }
        .close-btn:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
        .modal-body { padding: 30px; }
        .text-center { text-align: center; }

        .input-group { margin-bottom: 15px; }
        .pass-input-wrapper { position: relative; display: flex; align-items: center; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; transition: 0.2s; }
        .pass-input-wrapper:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        .input-icon { margin-left: 15px; color: #94a3b8; }
        .pass-input-wrapper input { flex: 1; border: none; background: transparent; padding: 12px 10px; font-size: 0.95rem; outline: none; }
        .eye-btn { background: none; border: none; padding: 0 15px; cursor: pointer; color: #94a3b8; display: flex; align-items: center; }
        .modern-input { width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #e2e8f0; outline: none; transition: 0.2s; }
        .modern-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        
        .btn-primary-gradient { background: linear-gradient(to right, #4f46e5, #6366f1); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 1rem; display: flex; justify-content: center; align-items: center;}
        .btn-primary-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,70,229,0.3); }
        .full-btn { width: 100%; }
        .spinner { animation: spin 1s linear infinite; }

        @media (max-width: 1024px) {
            .student-main-content { margin-left: 0; width: 100%; }
            .content-wrapper { padding: 110px 30px 100px 30px; }
        }
        @media (max-width: 768px) {
            .content-wrapper { padding: 95px 15px 80px 15px; }
            .profile-header-content { flex-direction: column; align-items: center; text-align: center; margin-top: -70px; }
            .profile-actions { width: 100%; }
            .action-btn { width: 100%; justify-content: center; }
            .contact-grid { grid-template-columns: 1fr; }
            .academic-stats { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}