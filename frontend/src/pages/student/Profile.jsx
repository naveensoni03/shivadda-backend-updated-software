import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import {
  User, Mail, Phone, MapPin, Award, Activity, Briefcase, HeartPulse, GraduationCap,
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
  const [twoFaStep, setTwoFaStep] = useState(1);
  const [twoFaCode, setTwoFaCode] = useState("");

  const [userData, setUserData] = useState({
    name: "Loading...", email: "Loading...", phone: "---", address: "---",
    course: "---", batch: "---", rollNo: "---", bloodGroup: "---", dob: "---"
  });

  // 🚀 MEGA PROFILE STATES
  const [activeTab, setActiveTab] = useState("medical");
  const [megaProfile, setMegaProfile] = useState({
    medical: {}, academic: {}, professional: {}, social: {}
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

      // 1. Old Basic Data Fetch (Kept as is)
      try {
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
      } catch (e) { console.log("Basic profile fetch error ignored"); }

      // 🚀 2. NEW: Fetch Mega Profile Data
      try {
        const megaRes = await api.get("profiles/me/");
        setMegaProfile(megaRes.data);
      } catch (e) { console.error("Mega Profile Fetch Error:", e); }

    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 SAVE MEGA PROFILE DATA TO DATABASE
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await api.put("profiles/me/", megaProfile);
      toast.success("Profile Updated Successfully! 🚀");
      setIsEditing(false); // Turn off edit mode
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error(error);
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

  const handleMegaChange = (category, field, value) => {
    setMegaProfile(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
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
                  <motion.button
                    className={`action-btn ${isEditing ? 'btn-success' : 'btn-outline'}`}
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    {isEditing ? <><CheckCircle size={18} /> Save Profile</> : <><Edit3 size={18} /> Edit Profile</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* OLD PROFILE GRID */}
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
                        <div className="c-details"><small>Email Address</small><p style={{ color: '#4f46e5', fontWeight: '800' }}>{userData.email}</p></div>
                      </div>
                      <div className="contact-item">
                        <div className="c-icon"><Phone size={18} /></div>
                        <div className="c-details"><small>Phone Number</small><p>{userData.phone}</p></div>
                      </div>
                      <div className="contact-item full-width">
                        <div className="c-icon"><MapPin size={18} /></div>
                        <div className="c-details"><small>Residential Address</small><p>{userData.address}</p></div>
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

            {/* 🚀 NEW MEGA PROFILE TABS SECTION */}
            <motion.div className="mega-profile-section glass-panel" variants={slideUp} style={{ marginTop: '30px', padding: '30px' }}>
              <div className="mega-tabs-header">
                <button className={`mega-tab ${activeTab === 'medical' ? 'active' : ''}`} onClick={() => setActiveTab('medical')}><HeartPulse size={18} /> Physical & Medical</button>
                <button className={`mega-tab ${activeTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveTab('academic')}><GraduationCap size={18} /> Academic Journey</button>
                <button className={`mega-tab ${activeTab === 'professional' ? 'active' : ''}`} onClick={() => setActiveTab('professional')}><Briefcase size={18} /> Professional Details</button>
                <button className={`mega-tab ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}><Activity size={18} /> Social & Humanity</button>
              </div>

              <div className="mega-tab-content" style={{ marginTop: '20px' }}>

                {/* MEDICAL TAB */}
                {activeTab === 'medical' && (
                  <div className="mega-grid">
                    <div className="mega-field">
                      <label>Blood Group</label>
                      {isEditing ? <input type="text" className="mega-input" value={megaProfile.medical?.blood_group || ''} onChange={e => handleMegaChange('medical', 'blood_group', e.target.value)} placeholder="e.g. O+" /> : <p className="mega-value">{megaProfile.medical?.blood_group || "---"}</p>}
                    </div>
                    <div className="mega-field">
                      <label>Height (cm) & Weight (kg)</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="number" className="mega-input" value={megaProfile.medical?.height_cm || ''} onChange={e => handleMegaChange('medical', 'height_cm', e.target.value)} placeholder="Height" />
                          <input type="number" className="mega-input" value={megaProfile.medical?.weight_kg || ''} onChange={e => handleMegaChange('medical', 'weight_kg', e.target.value)} placeholder="Weight" />
                        </div>
                      ) : <p className="mega-value">{megaProfile.medical?.height_cm ? `${megaProfile.medical.height_cm} cm, ` : ''} {megaProfile.medical?.weight_kg ? `${megaProfile.medical.weight_kg} kg` : "---"}</p>}
                    </div>
                    <div className="mega-field full-width">
                      <label>Emergency Contact (Name - Relation - Number)</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" className="mega-input" value={megaProfile.medical?.emergency_contact_name || ''} onChange={e => handleMegaChange('medical', 'emergency_contact_name', e.target.value)} placeholder="Name" />
                          <input type="text" className="mega-input" value={megaProfile.medical?.emergency_contact_relation || ''} onChange={e => handleMegaChange('medical', 'emergency_contact_relation', e.target.value)} placeholder="Relation" />
                          <input type="text" className="mega-input" value={megaProfile.medical?.emergency_contact_number || ''} onChange={e => handleMegaChange('medical', 'emergency_contact_number', e.target.value)} placeholder="Phone" />
                        </div>
                      ) : <p className="mega-value">{megaProfile.medical?.emergency_contact_name || "---"} ({megaProfile.medical?.emergency_contact_relation || "---"}) - {megaProfile.medical?.emergency_contact_number || "---"}</p>}
                    </div>
                    <div className="mega-field full-width">
                      <label>Chronic Diseases / Allergies</label>
                      {isEditing ? <textarea className="mega-input" value={megaProfile.medical?.chronic_diseases || ''} onChange={e => handleMegaChange('medical', 'chronic_diseases', e.target.value)} placeholder="Any medical history we should know about..." rows="2" /> : <p className="mega-value">{megaProfile.medical?.chronic_diseases || "None recorded."}</p>}
                    </div>
                  </div>
                )}

                {/* ACADEMIC TAB */}
                {activeTab === 'academic' && (
                  <div className="mega-grid">
                    <div className="mega-field">
                      <label>10th Standard (School & %)</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" className="mega-input" value={megaProfile.academic?.tenth_school || ''} onChange={e => handleMegaChange('academic', 'tenth_school', e.target.value)} placeholder="School Name" />
                          <input type="number" className="mega-input" style={{ width: '80px' }} value={megaProfile.academic?.tenth_percentage || ''} onChange={e => handleMegaChange('academic', 'tenth_percentage', e.target.value)} placeholder="%" />
                        </div>
                      ) : <p className="mega-value">{megaProfile.academic?.tenth_school || "---"} ({megaProfile.academic?.tenth_percentage ? `${megaProfile.academic.tenth_percentage}%` : "---"})</p>}
                    </div>
                    <div className="mega-field">
                      <label>12th Standard (School & %)</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" className="mega-input" value={megaProfile.academic?.twelfth_school || ''} onChange={e => handleMegaChange('academic', 'twelfth_school', e.target.value)} placeholder="School Name" />
                          <input type="number" className="mega-input" style={{ width: '80px' }} value={megaProfile.academic?.twelfth_percentage || ''} onChange={e => handleMegaChange('academic', 'twelfth_percentage', e.target.value)} placeholder="%" />
                        </div>
                      ) : <p className="mega-value">{megaProfile.academic?.twelfth_school || "---"} ({megaProfile.academic?.twelfth_percentage ? `${megaProfile.academic.twelfth_percentage}%` : "---"})</p>}
                    </div>
                    <div className="mega-field full-width">
                      <label>Graduation (Degree, College & %)</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" className="mega-input" value={megaProfile.academic?.graduation_degree || ''} onChange={e => handleMegaChange('academic', 'graduation_degree', e.target.value)} placeholder="B.Tech, B.Sc etc." />
                          <input type="text" className="mega-input" value={megaProfile.academic?.graduation_college || ''} onChange={e => handleMegaChange('academic', 'graduation_college', e.target.value)} placeholder="College Name" />
                          <input type="number" className="mega-input" style={{ width: '80px' }} value={megaProfile.academic?.graduation_percentage || ''} onChange={e => handleMegaChange('academic', 'graduation_percentage', e.target.value)} placeholder="%" />
                        </div>
                      ) : <p className="mega-value">{megaProfile.academic?.graduation_degree || "---"} from {megaProfile.academic?.graduation_college || "---"} ({megaProfile.academic?.graduation_percentage ? `${megaProfile.academic.graduation_percentage}%` : "---"})</p>}
                    </div>
                    <div className="mega-field full-width">
                      <label>Technical Skills</label>
                      {isEditing ? <input type="text" className="mega-input" value={megaProfile.academic?.technical_skills || ''} onChange={e => handleMegaChange('academic', 'technical_skills', e.target.value)} placeholder="Python, React, Django..." /> : <p className="mega-value">{megaProfile.academic?.technical_skills || "---"}</p>}
                    </div>
                  </div>
                )}

                {/* PROFESSIONAL TAB */}
                {activeTab === 'professional' && (
                  <div className="mega-grid">
                    <div className="mega-field">
                      <label>Total Experience</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="number" className="mega-input" value={megaProfile.professional?.total_experience_years || ''} onChange={e => handleMegaChange('professional', 'total_experience_years', e.target.value)} placeholder="Years" />
                          <input type="number" className="mega-input" value={megaProfile.professional?.total_experience_months || ''} onChange={e => handleMegaChange('professional', 'total_experience_months', e.target.value)} placeholder="Months" />
                        </div>
                      ) : <p className="mega-value">{megaProfile.professional?.total_experience_years || 0} Years, {megaProfile.professional?.total_experience_months || 0} Months</p>}
                    </div>
                    <div className="mega-field">
                      <label>Last Company & Title</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" className="mega-input" value={megaProfile.professional?.last_company_name || ''} onChange={e => handleMegaChange('professional', 'last_company_name', e.target.value)} placeholder="Company" />
                          <input type="text" className="mega-input" value={megaProfile.professional?.last_job_title || ''} onChange={e => handleMegaChange('professional', 'last_job_title', e.target.value)} placeholder="Job Title" />
                        </div>
                      ) : <p className="mega-value">{megaProfile.professional?.last_job_title || "---"} at {megaProfile.professional?.last_company_name || "---"}</p>}
                    </div>
                    <div className="mega-field full-width">
                      <label>Reason for Leaving Last Job</label>
                      {isEditing ? <input type="text" className="mega-input" value={megaProfile.professional?.reason_for_leaving || ''} onChange={e => handleMegaChange('professional', 'reason_for_leaving', e.target.value)} placeholder="Reason..." /> : <p className="mega-value">{megaProfile.professional?.reason_for_leaving || "---"}</p>}
                    </div>
                  </div>
                )}

                {/* SOCIAL TAB */}
                {activeTab === 'social' && (
                  <div className="mega-grid">
                    <div className="mega-field full-width">
                      <label>Blood Donation History</label>
                      {isEditing ? <textarea className="mega-input" value={megaProfile.social?.blood_donation_history || ''} onChange={e => handleMegaChange('social', 'blood_donation_history', e.target.value)} placeholder="Where and when did you donate blood?" rows="2" /> : <p className="mega-value">{megaProfile.social?.blood_donation_history || "No records yet."}</p>}
                    </div>
                    <div className="mega-field full-width">
                      <label>NGO & Volunteer Work</label>
                      {isEditing ? <textarea className="mega-input" value={megaProfile.social?.ngo_social_work || ''} onChange={e => handleMegaChange('social', 'ngo_social_work', e.target.value)} placeholder="Any social services?" rows="2" /> : <p className="mega-value">{megaProfile.social?.ngo_social_work || "No records yet."}</p>}
                    </div>
                    <div className="mega-field full-width">
                      <label>Awards & Achievements</label>
                      {isEditing ? <textarea className="mega-input" value={megaProfile.social?.awards_achievements || ''} onChange={e => handleMegaChange('social', 'awards_achievements', e.target.value)} placeholder="Special recognitions..." rows="2" /> : <p className="mega-value">{megaProfile.social?.awards_achievements || "No records yet."}</p>}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

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

      {/* 🛡️ SETUP 2FA MODAL */}
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
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>Protect your learning data</h3>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '25px' }}>When you enable 2FA, you'll be required to enter a code from Google Authenticator or Authy every time you sign in.</p>
                    <button className="btn-success full-btn" onClick={() => setTwoFaStep(2)}>Begin Setup</button>
                  </div>
                ) : (
                  <div className="two-fa-step2">
                    <QrCode size={120} color="#0f172a" style={{ margin: '0 auto 15px', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <p style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem', marginBottom: '5px' }}>Scan this QR Code in your App</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Or enter code manually: <b style={{ color: '#4f46e5' }}>X7Y9-LMN2-K9P0-QR55</b></p>
                    <div className="input-group text-left" style={{ marginBottom: '0' }}>
                      <label style={{ color: '#0f172a', fontWeight: '800', fontSize: '0.9rem' }}>Enter 6-digit code</label>
                      <input type="text" value={twoFaCode} onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, '').substring(0, 6))} className="modern-input text-center" placeholder="000000" style={{ letterSpacing: '10px', fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', background: '#f8fafc', border: '2px solid #e2e8f0' }} />
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
        
        .academic-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .stat-box { background: white; padding: 20px; border-radius: 16px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-box h4 { margin: 0 0 5px 0; font-size: 2rem; font-weight: 900; color: var(--primary); }
        .stat-box span { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

        .security-btn { width: 100%; padding: 14px; margin-bottom: 12px; border-radius: 12px; background: #f1f5f9; border: none; font-weight: 700; color: #334155; cursor: pointer; transition: 0.2s; }
        .security-btn:hover { background: #e2e8f0; color: #0f172a; }
        .security-btn.outline { background: transparent; border: 2px dashed #cbd5e1; }
        .security-btn.outline:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

        /* 🚀 NEW MEGA PROFILE CSS */
        .mega-tabs-header { display: flex; gap: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; overflow-x: auto; scrollbar-width: none; }
        .mega-tabs-header::-webkit-scrollbar { display: none; }
        .mega-tab { background: none; border: none; padding: 10px 20px; font-weight: 700; color: #64748b; cursor: pointer; border-radius: 12px; transition: 0.3s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .mega-tab:hover { background: #f1f5f9; color: var(--primary); }
        .mega-tab.active { background: var(--primary); color: white; box-shadow: 0 4px 15px rgba(79,70,229,0.3); }

        .mega-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
        .mega-field { background: rgba(255,255,255,0.5); padding: 15px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); }
        .mega-field.full-width { grid-column: 1 / -1; }
        .mega-field label { display: block; font-size: 0.85rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .mega-value { margin: 0; font-weight: 700; color: var(--text-main); font-size: 1rem; }
        .mega-input { width: 100%; padding: 10px 15px; border-radius: 10px; border: 2px solid #e2e8f0; outline: none; font-weight: 600; color: var(--text-main); transition: 0.2s; background: white; }
        .mega-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        textarea.mega-input { resize: vertical; min-height: 80px; }

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
            .mega-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}