import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Lock, Bell, Camera, Save, Mail, Phone, BookOpen, ShieldCheck, Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// 🔥 BACKEND API IMPORT
import api from "../../api/axios";

export default function TeacherSettings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // --- Real State for Profile ---
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "" // Backend me ise qualification ke roop me save karenge
    });

    // --- State for Security ---
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        studentMessages: true
    });

    // ==========================
    // 🔥 FETCH REAL PROFILE FROM DB
    // ==========================
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/teachers/me/');
            const data = res.data;

            // Naam ko first aur last me split karna UI ke liye
            const nameParts = data.full_name ? data.full_name.split(' ') : ['User'];
            const fName = nameParts[0];
            const lName = nameParts.slice(1).join(' ');

            setProfile({
                firstName: fName,
                lastName: lName,
                email: data.email || "",
                phone: data.phone || "",
                bio: data.qualification || "" // Qualification ko bio ki jagah dikha rahe hain
            });
        } catch (error) {
            console.error("Error loading profile:", error);
            toast.error("Failed to load your profile data.");
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================
    // HANDLERS
    // ==========================
    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleToggle = (key) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
        toast.success(`Settings updated!`);
    };

    // ==========================
    // 🔥 UPDATE REAL PROFILE TO DB
    // ==========================
    const saveProfile = async () => {
        try {
            setIsSaving(true);

            // First aur Last name ko wapas jod kar 'full_name' banayenge
            const fullName = `${profile.firstName} ${profile.lastName}`.trim();

            await api.patch('/teachers/me/', {
                full_name: fullName,
                phone: profile.phone,
                qualification: profile.bio
            });

            toast.success("Profile information updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    // ==========================
    // 🔥 UPDATE PASSWORD TO DB
    // ==========================
    const updatePassword = async () => {
        if (!passwords.current) {
            toast.error("Please enter current password");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match!");
            return;
        }
        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        try {
            setIsSaving(true);
            await api.post('/teachers/change-password/', {
                current: passwords.current,
                new: passwords.new
            });

            toast.success("Password updated successfully!");
            setPasswords({ current: "", new: "", confirm: "" }); // Form clear
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to update password.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 size={40} className="spin-icon" color="#3b82f6" />
                <style>{`.spin-icon { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="settings-wrapper">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="settings-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-subtitle">Manage your profile, security, and notification preferences.</p>
            </div>

            <div className="settings-layout">
                {/* SIDEBAR TABS */}
                <div className="settings-sidebar">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> Personal Info
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Lock size={18} /> Security & Password
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Bell size={18} /> Notifications
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="settings-content">
                    <AnimatePresence mode="wait">

                        {/* --- PROFILE TAB --- */}
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="tab-pane"
                            >
                                <h2 className="pane-title">Personal Information</h2>
                                <div className="profile-pic-section">
                                    <div className="avatar-large">
                                        {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "U"}
                                        {profile.lastName ? profile.lastName.charAt(0).toUpperCase() : ""}
                                        <button className="edit-avatar-btn"><Camera size={14} /></button>
                                    </div>
                                    <div className="avatar-info">
                                        <h3>Profile Picture</h3>
                                        <p>PNG, JPEG under 5MB.</p>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <div className="input-with-icon">
                                            <User size={16} className="input-icon" />
                                            <input type="text" name="firstName" value={profile.firstName} onChange={handleProfileChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <div className="input-with-icon">
                                            <User size={16} className="input-icon" />
                                            <input type="text" name="lastName" value={profile.lastName} onChange={handleProfileChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address <small>(Read Only)</small></label>
                                        <div className="input-with-icon disabled-input">
                                            <Mail size={16} className="input-icon" />
                                            <input type="email" name="email" value={profile.email} disabled />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <div className="input-with-icon">
                                            <Phone size={16} className="input-icon" />
                                            <input type="text" name="phone" value={profile.phone} onChange={handleProfileChange} />
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Qualification / Bio</label>
                                        <div className="input-with-icon">
                                            <BookOpen size={16} className="input-icon top-align" />
                                            <textarea name="bio" rows="3" value={profile.bio} onChange={handleProfileChange}></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="action-footer">
                                    <button className="save-btn" onClick={saveProfile} disabled={isSaving}>
                                        {isSaving ? <Loader2 size={18} className="spin-icon" /> : <Save size={18} />}
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* --- SECURITY TAB --- */}
                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="tab-pane"
                            >
                                <h2 className="pane-title">Update Password</h2>
                                <p className="pane-subtitle">Ensure your account is using a long, random password to stay secure.</p>

                                <div className="form-grid single-col">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={16} className="input-icon" />
                                            <input type="password" name="current" placeholder="Enter current password" value={passwords.current} onChange={handlePasswordChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <div className="input-with-icon">
                                            <ShieldCheck size={16} className="input-icon" />
                                            <input type="password" name="new" placeholder="Enter new password" value={passwords.new} onChange={handlePasswordChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={16} className="input-icon" />
                                            <input type="password" name="confirm" placeholder="Confirm new password" value={passwords.confirm} onChange={handlePasswordChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="action-footer">
                                    <button className="save-btn" onClick={updatePassword} disabled={isSaving || !passwords.new}>
                                        {isSaving ? <Loader2 size={18} className="spin-icon" /> : <Save size={18} />}
                                        {isSaving ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* --- NOTIFICATIONS TAB --- */}
                        {activeTab === 'notifications' && (
                            <motion.div
                                key="notifications"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="tab-pane"
                            >
                                <h2 className="pane-title">Notification Preferences</h2>
                                <p className="pane-subtitle">Choose how you receive alerts and updates.</p>

                                <div className="toggle-list">
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>Email Alerts</h4>
                                            <p>Receive daily summaries and important updates via email.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={notifications.emailAlerts} onChange={() => handleToggle('emailAlerts')} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>SMS Alerts</h4>
                                            <p>Get instant text messages for urgent notifications.</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={notifications.smsAlerts} onChange={() => handleToggle('smsAlerts')} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* STYLES */}
            <style>{`
        .settings-wrapper { 
            padding: 20px; 
            font-family: 'Inter', system-ui, sans-serif; 
            background-color: #f8fafc; 
            min-height: calc(100vh - 70px); 
            color: #0f172a;
        }
        .settings-wrapper * { box-sizing: border-box; }
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Header */
        .settings-header { margin-bottom: 30px; }
        .page-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 5px; color: #0f172a;}
        .page-subtitle { color: #64748b; font-size: 0.95rem; }

        /* Layout */
        .settings-layout { display: flex; gap: 25px; align-items: flex-start; }
        
        /* Sidebar */
        .settings-sidebar { 
            width: 260px; 
            background: white; 
            border-radius: 16px; 
            padding: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
            border: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex-shrink: 0;
        }
        .tab-btn { 
            display: flex; align-items: center; gap: 12px; 
            padding: 12px 15px; width: 100%; text-align: left;
            background: transparent; border: none; border-radius: 10px;
            font-size: 0.95rem; font-weight: 600; color: #64748b;
            cursor: pointer; transition: all 0.2s ease;
        }
        .tab-btn:hover { background: #f1f5f9; color: #0f172a; }
        .tab-btn.active { background: #eff6ff; color: #3b82f6; }

        /* Content Area */
        .settings-content { 
            flex: 1; 
            background: white; 
            border-radius: 16px; 
            padding: 35px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
            border: 1px solid #e2e8f0;
            min-height: 500px;
        }
        .pane-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; color: #0f172a; }
        .pane-subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 30px; }

        /* Profile Pic Section */
        .profile-pic-section { display: flex; align-items: center; gap: 20px; margin-bottom: 35px; padding-bottom: 25px; border-bottom: 1px solid #f1f5f9;}
        .avatar-large { 
            width: 80px; height: 80px; border-radius: 50%; 
            background: linear-gradient(135deg, #3b82f6, #2563eb); 
            color: white; font-size: 2rem; font-weight: 700; 
            display: flex; align-items: center; justify-content: center;
            position: relative;
        }
        .edit-avatar-btn {
            position: absolute; bottom: 0; right: 0;
            background: white; border: 1px solid #e2e8f0; color: #475569;
            width: 28px; height: 28px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .avatar-info h3 { font-size: 1rem; color: #0f172a; margin-bottom: 3px; }
        .avatar-info p { font-size: 0.85rem; color: #64748b; }

        /* Forms */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;}
        .form-grid.single-col { grid-template-columns: max-content; }
        .form-grid.single-col .form-group { width: 400px; max-width: 100%; }
        .form-group.full-width { grid-column: 1 / -1; }
        
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 8px; }
        .form-group label small { color: #94a3b8; font-weight: 400;}
        
        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .input-icon.top-align { top: 14px; transform: none; }
        
        .input-with-icon input, .input-with-icon textarea {
            width: 100%; padding: 12px 15px 12px 42px;
            background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
            font-size: 0.95rem; color: #0f172a; outline: none; transition: 0.2s; font-family: inherit;
        }
        .input-with-icon input:focus, .input-with-icon textarea:focus { background: white; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .input-with-icon textarea { resize: vertical; min-height: 100px; }
        
        .disabled-input input { background: #f1f5f9; color: #94a3b8; cursor: not-allowed;}
        .disabled-input input:focus { border-color: #e2e8f0; box-shadow: none;}

        /* Action Footer */
        .action-footer { display: flex; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .save-btn { 
            display: flex; align-items: center; gap: 8px; 
            background: #3b82f6; color: white; padding: 12px 24px; 
            border: none; border-radius: 10px; font-weight: 600; font-size: 0.95rem; 
            cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
        }
        .save-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Toggles */
        .toggle-list { display: flex; flex-direction: column; gap: 20px; }
        .toggle-item { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
        .toggle-info h4 { font-size: 1rem; color: #0f172a; margin-bottom: 4px; }
        .toggle-info p { font-size: 0.85rem; color: #64748b; margin: 0; }

        /* Switch CSS */
        .switch { position: relative; display: inline-block; width: 46px; height: 26px; flex-shrink: 0;}
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);}
        input:checked + .slider { background-color: #10b981; }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        /* Responsive */
        @media (max-width: 900px) {
            .settings-layout { flex-direction: column; }
            .settings-sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding: 10px; }
            .tab-btn { white-space: nowrap; width: auto; justify-content: center; }
            .settings-content { width: 100%; padding: 20px; }
            .form-grid { grid-template-columns: 1fr; }
            .form-grid.single-col .form-group { width: 100%; }
        }
      `}</style>
        </div>
    );
}