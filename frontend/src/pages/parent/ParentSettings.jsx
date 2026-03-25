import React, { useState, useEffect } from "react";
import SidebarParent from "../../components/SidebarParent";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Bell, Camera, Save, ShieldCheck, Smartphone, Mail, Loader2, KeyRound } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";

export default function ParentSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    const [formData, setFormData] = useState({
        fullName: "", email: "", phone: "", address: "",
        currentPassword: "", newPassword: "", confirmPassword: ""
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true, smsAlerts: true, attendanceAlerts: true, feeReminders: true
    });

    // 🚀 Forgot Password States
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
    const [resetData, setResetData] = useState({ emailOrPhone: "", otp: "", newPass: "", confirmPass: "" });

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await api.get("auth/parents/profile/settings/");
            setFormData(prev => ({
                ...prev,
                fullName: response.data.fullName || "",
                email: response.data.email || "",
                phone: response.data.phone || "",
                address: response.data.address || ""
            }));
            // Pre-fill email/phone for reset
            setResetData(prev => ({ ...prev, emailOrPhone: response.data.email || response.data.phone || "" }));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load real profile data.");
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleResetChange = (e) => setResetData({ ...resetData, [e.target.name]: e.target.value });
    const handleToggle = (key) => setNotifications({ ...notifications, [key]: !notifications[key] });

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        const loadId = toast.loading("Saving Profile Details...");
        try {
            const res = await api.patch("auth/parents/profile/settings/", {
                fullName: formData.fullName, phone: formData.phone, address: formData.address
            });
            toast.success(res.data.message || "Profile Updated Successfully! ✅", { id: loadId });
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update profile.", { id: loadId });
        } finally { setSaving(false); }
    };

    // 🔒 Standard Password Update
    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) return toast.error("New Passwords do not match! ❌");
        setSaving(true);
        const loadId = toast.loading("Updating Password...");
        try {
            const res = await api.patch("auth/parents/profile/settings/", {
                currentPassword: formData.currentPassword, newPassword: formData.newPassword
            });
            toast.success(res.data.message || "Password Changed Successfully! 🔒", { id: loadId });
            setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.error || "Incorrect current password.", { id: loadId });
        } finally { setSaving(false); }
    };

    // 📩 Send OTP for Reset
    const handleSendResetOTP = async (e) => {
        e.preventDefault();
        if (!resetData.emailOrPhone) return toast.error("Please enter Email or Phone.");
        setSaving(true);
        const loadId = toast.loading("Sending OTP...");
        try {
            // Using your existing SendOTPView API
            await api.post("auth/send-otp/", { email_or_phone: resetData.emailOrPhone });
            toast.success("OTP Sent! Please check your inbox/messages.", { id: loadId });
            setResetStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send OTP.", { id: loadId });
        } finally { setSaving(false); }
    };

    // 🔑 Verify OTP & Reset Password
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (resetData.newPass !== resetData.confirmPass) return toast.error("New Passwords do not match! ❌");
        setSaving(true);
        const loadId = toast.loading("Verifying OTP & Resetting...");
        try {
            const res = await api.patch("auth/parents/profile/settings/", {
                emailOrPhone: resetData.emailOrPhone,
                otp: resetData.otp,
                newPassword: resetData.newPass
            });
            toast.success(res.data.message || "Password Reset Successful! 🎉", { id: loadId });
            setForgotPasswordMode(false);
            setResetStep(1);
            setResetData({ ...resetData, otp: "", newPass: "", confirmPass: "" });
        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid OTP.", { id: loadId });
        } finally { setSaving(false); }
    };

    const handleSavePreferences = async () => {
        const loadId = toast.loading("Saving Preferences...");
        try {
            const res = await api.patch("auth/parents/profile/settings/", { notifications });
            toast.success(res.data.message || "Preferences Saved! ⚙️", { id: loadId });
        } catch (error) {
            toast.error("Failed to save preferences.", { id: loadId });
        }
    };

    const containerVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    return (
        <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            <SidebarParent />
            <Toaster position="top-center" />

            <div className="main-content">
                <div className="dashboard-top-nav">
                    <div className="search-placeholder">
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Account Settings</span>
                    </div>
                </div>

                <div className="welcome-hero">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
                        Profile <span className="text-gradient">Settings</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
                        Manage your account details, security, and preferences.
                    </p>
                </div>

                <div className="settings-container premium-shadow">

                    <div className="settings-sidebar">
                        <button className={`set-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setForgotPasswordMode(false); }}>
                            <User size={18} /> Personal Details
                        </button>
                        <button className={`set-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                            <Lock size={18} /> Security & Password
                        </button>
                        <button className={`set-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => { setActiveTab('notifications'); setForgotPasswordMode(false); }}>
                            <Bell size={18} /> Notifications
                        </button>
                    </div>

                    <div className="settings-content">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 size={40} className="spin" color="#4f46e5" /></div>
                        ) : (
                            <AnimatePresence mode="wait">

                                {/* 👤 PROFILE TAB */}
                                {activeTab === 'profile' && (
                                    <motion.div key="profile" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                                        <div className="content-header">
                                            <h3>Personal Information</h3>
                                            <p>Update your photo and personal details.</p>
                                        </div>

                                        <div className="profile-photo-section">
                                            <div className="photo-circle">
                                                <span>{formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'P'}</span>
                                                <button className="cam-btn" onClick={() => toast("Photo upload will connect to backend soon!", { icon: '📸' })}><Camera size={14} /></button>
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>Profile Picture</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>PNG, JPG up to 5MB</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleSaveProfile} className="settings-form">
                                            <div className="form-row">
                                                <div className="input-group">
                                                    <label>Full Name</label>
                                                    <div className="input-with-icon">
                                                        <User size={16} className="input-icon" />
                                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                                    </div>
                                                </div>
                                                <div className="input-group">
                                                    <label>Phone Number</label>
                                                    <div className="input-with-icon">
                                                        <Smartphone size={16} className="input-icon" />
                                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>Email Address</label>
                                                <div className="input-with-icon">
                                                    <Mail size={16} className="input-icon" />
                                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled style={{ background: '#e2e8f0', cursor: 'not-allowed' }} title="Email cannot be changed" />
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>Residential Address</label>
                                                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" required></textarea>
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" className="save-btn" disabled={saving}>
                                                    {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                                    {saving ? "Saving..." : "Save Changes"}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* 🔒 SECURITY TAB */}
                                {activeTab === 'security' && (
                                    <motion.div key="security" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>

                                        {!forgotPasswordMode ? (
                                            <>
                                                <div className="content-header">
                                                    <h3>Security & Password</h3>
                                                    <p>Ensure your account is using a strong password.</p>
                                                </div>

                                                <div className="security-banner">
                                                    <ShieldCheck size={30} color="#10b981" />
                                                    <div>
                                                        <h4 style={{ margin: '0 0 5px 0', color: '#065f46' }}>Account is Secure</h4>
                                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}>Your account is protected with enterprise-grade encryption.</p>
                                                    </div>
                                                </div>

                                                <form onSubmit={handleSavePassword} className="settings-form">
                                                    <div className="input-group">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <label>Current Password</label>
                                                            <button type="button" className="forgot-btn" onClick={() => setForgotPasswordMode(true)}>Forgot Password?</button>
                                                        </div>
                                                        <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Enter current password" required />
                                                    </div>
                                                    <div className="form-row">
                                                        <div className="input-group">
                                                            <label>New Password</label>
                                                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Minimum 8 characters" required minLength="8" />
                                                        </div>
                                                        <div className="input-group">
                                                            <label>Confirm New Password</label>
                                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter new password" required minLength="8" />
                                                        </div>
                                                    </div>
                                                    <div className="form-actions">
                                                        <button type="submit" className="save-btn" disabled={saving}>
                                                            {saving ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
                                                            {saving ? "Updating..." : "Update Password"}
                                                        </button>
                                                    </div>
                                                </form>
                                            </>
                                        ) : (
                                            // 🔑 FORGOT PASSWORD MODE UI
                                            <div className="forgot-password-section">
                                                <div className="content-header">
                                                    <h3>Reset Password</h3>
                                                    <p>Verify your identity via OTP to create a new password.</p>
                                                </div>

                                                {resetStep === 1 ? (
                                                    <form onSubmit={handleSendResetOTP} className="settings-form">
                                                        <div className="input-group">
                                                            <label>Registered Email or Phone Number</label>
                                                            <input type="text" name="emailOrPhone" value={resetData.emailOrPhone} onChange={handleResetChange} placeholder="e.g., parent@example.com or 9876543210" required />
                                                        </div>
                                                        <div className="form-actions" style={{ justifyContent: 'flex-start', gap: '15px' }}>
                                                            <button type="submit" className="save-btn" disabled={saving}>
                                                                {saving ? <Loader2 size={16} className="spin" /> : <Mail size={16} />}
                                                                {saving ? "Sending..." : "Send Reset OTP"}
                                                            </button>
                                                            <button type="button" className="cancel-btn" onClick={() => setForgotPasswordMode(false)}>Cancel</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <form onSubmit={handleResetSubmit} className="settings-form fade-in">
                                                        <div className="input-group">
                                                            <label style={{ color: '#4f46e5' }}>OTP Sent to: {resetData.emailOrPhone}</label>
                                                            <input type="text" name="otp" value={resetData.otp} onChange={handleResetChange} placeholder="Enter 4-digit OTP" required maxLength="4" style={{ letterSpacing: '5px', fontSize: '1.2rem', textAlign: 'center' }} />
                                                        </div>
                                                        <div className="form-row">
                                                            <div className="input-group">
                                                                <label>New Password</label>
                                                                <input type="password" name="newPass" value={resetData.newPass} onChange={handleResetChange} placeholder="Minimum 8 characters" required minLength="8" />
                                                            </div>
                                                            <div className="input-group">
                                                                <label>Confirm New Password</label>
                                                                <input type="password" name="confirmPass" value={resetData.confirmPass} onChange={handleResetChange} placeholder="Re-enter new password" required minLength="8" />
                                                            </div>
                                                        </div>
                                                        <div className="form-actions" style={{ justifyContent: 'flex-start', gap: '15px' }}>
                                                            <button type="submit" className="save-btn" disabled={saving}>
                                                                {saving ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
                                                                {saving ? "Resetting..." : "Verify & Reset Password"}
                                                            </button>
                                                            <button type="button" className="cancel-btn" onClick={() => { setResetStep(1); setForgotPasswordMode(false); }}>Cancel</button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* 🔔 NOTIFICATIONS TAB */}
                                {activeTab === 'notifications' && (
                                    <motion.div key="notifications" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                                        <div className="content-header">
                                            <h3>Notification Preferences</h3>
                                            <p>Choose what updates you want to receive.</p>
                                        </div>

                                        <div className="toggle-list">
                                            <div className="toggle-item">
                                                <div>
                                                    <h4>Email Alerts</h4>
                                                    <p>Receive school notices and updates directly to your email.</p>
                                                </div>
                                                <label className="switch">
                                                    <input type="checkbox" checked={notifications.emailAlerts} onChange={() => handleToggle('emailAlerts')} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className="toggle-item">
                                                <div>
                                                    <h4>SMS Notifications</h4>
                                                    <p>Get urgent alerts and OTPs on your registered mobile number.</p>
                                                </div>
                                                <label className="switch">
                                                    <input type="checkbox" checked={notifications.smsAlerts} onChange={() => handleToggle('smsAlerts')} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className="toggle-item">
                                                <div>
                                                    <h4>Attendance Alerts</h4>
                                                    <p>Notify me instantly if my child is marked absent.</p>
                                                </div>
                                                <label className="switch">
                                                    <input type="checkbox" checked={notifications.attendanceAlerts} onChange={() => handleToggle('attendanceAlerts')} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className="toggle-item">
                                                <div>
                                                    <h4>Fee Reminders</h4>
                                                    <p>Receive reminders 5 days before the fee due date.</p>
                                                </div>
                                                <label className="switch">
                                                    <input type="checkbox" checked={notifications.feeReminders} onChange={() => handleToggle('feeReminders')} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="form-actions" style={{ marginTop: '30px' }}>
                                            <button className="save-btn" onClick={handleSavePreferences}><Save size={16} /> Save Preferences</button>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .main-content { 
                    flex: 1; 
                    margin-left: 280px; 
                    padding: 30px 50px 150px 50px; 
                    height: 100vh; 
                    overflow-y: auto; 
                    overflow-x: hidden; 
                    width: calc(100% - 280px); 
                    box-sizing: border-box; 
                }
                
                .main-content::-webkit-scrollbar { width: 8px; }
                .main-content::-webkit-scrollbar-track { background: #f1f5f9; }
                .main-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .main-content::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                .dashboard-top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .search-placeholder { background: white; padding: 10px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; color: #94a3b8; }
                .text-gradient { background: linear-gradient(to right, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .welcome-hero { margin-bottom: 30px; }
                
                .premium-shadow { background: white; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
                
                .settings-container { display: flex; min-height: max-content; height: auto; background: white; margin-bottom: 80px; }
                
                .settings-sidebar { width: 260px; border-right: 1px solid #f1f5f9; padding: 30px 20px; background: #fafaf9; display: flex; flex-direction: column; gap: 8px; border-top-left-radius: 24px; border-bottom-left-radius: 24px; }
                .set-tab { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 12px; border: none; background: transparent; color: #64748b; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: 0.2s; text-align: left; }
                .set-tab:hover { background: #f1f5f9; color: #0f172a; }
                .set-tab.active { background: white; color: #4f46e5; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }

                .settings-content { flex: 1; padding: 40px 50px 80px 50px; height: auto; }
                
                .content-header { margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; }
                .content-header h3 { margin: 0 0 5px 0; font-size: 1.5rem; color: #0f172a; font-weight: 800; }
                .content-header p { margin: 0; color: #64748b; font-size: 0.95rem; }

                .profile-photo-section { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
                .photo-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #ec4899); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; position: relative; }
                .cam-btn { position: absolute; bottom: 0; right: 0; background: white; border: 1px solid #e2e8f0; color: #475569; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: 0.2s; }
                .cam-btn:hover { background: #f8fafc; color: #4f46e5; }

                .settings-form { display: flex; flex-direction: column; gap: 20px; padding-bottom: 20px; }
                .form-row { display: flex; gap: 20px; }
                .form-row .input-group { flex: 1; }
                .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
                .settings-form input, .settings-form textarea { width: 100%; padding: 12px 15px; border-radius: 12px; border: 1px solid #cbd5e1; outline: none; font-size: 0.95rem; color: #0f172a; transition: 0.2s; box-sizing: border-box; background: #f8fafc; }
                .settings-form input:focus, .settings-form textarea:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                .settings-form textarea { resize: vertical; }
                
                .input-with-icon { position: relative; }
                .input-with-icon .input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .input-with-icon input { padding-left: 45px; }

                .forgot-btn { background: none; border: none; color: #4f46e5; font-size: 0.8rem; font-weight: 700; cursor: pointer; padding: 0; transition: 0.2s; }
                .forgot-btn:hover { text-decoration: underline; color: #312e81; }

                .form-actions { display: flex; justify-content: flex-end; margin-top: 20px; }
                .save-btn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; padding: 12px 25px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); }
                .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4); }
                .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                
                .cancel-btn { background: #f1f5f9; color: #475569; padding: 12px 25px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; }
                .cancel-btn:hover { background: #e2e8f0; color: #0f172a; }

                .security-banner { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }

                .toggle-list { display: flex; flex-direction: column; gap: 20px; }
                .toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px; transition: 0.2s; }
                .toggle-item:hover { border-color: #cbd5e1; background: #f8fafc; }
                .toggle-item h4 { margin: 0 0 5px 0; color: #0f172a; font-size: 1.05rem; }
                .toggle-item p { margin: 0; color: #64748b; font-size: 0.85rem; }

                .switch { position: relative; display: inline-block; width: 46px; height: 26px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
                .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
                input:checked + .slider { background-color: #4f46e5; }
                input:focus + .slider { box-shadow: 0 0 1px #4f46e5; }
                input:checked + .slider:before { transform: translateX(20px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }

                .fade-in { animation: fadeIn 0.4s ease-out; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) {
                    .main-content { margin-left: 0; padding: 25px; padding-top: 80px; width: 100%; }
                    .settings-container { flex-direction: column; }
                    .settings-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #f1f5f9; flex-direction: row; overflow-x: auto; padding: 20px; border-radius: 24px 24px 0 0; }
                    .set-tab { white-space: nowrap; }
                    .settings-content { padding: 30px 20px 80px 20px; }
                    .form-row { flex-direction: column; gap: 20px; }
                }
            `}</style>
        </div>
    );
}