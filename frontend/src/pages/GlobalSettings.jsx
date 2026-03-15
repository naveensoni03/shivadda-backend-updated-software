import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import {
    Globe, Settings, CloudSun, ShieldAlert, FileText,
    Save, Loader2, DollarSign, Languages
} from "lucide-react";
import { motion } from "framer-motion";

// --- REUSABLE GLASS CARD ---
const GlassCard = ({ children, className, style, title, icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(20px)", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 15px 35px -10px rgba(0,0,0,0.05)", overflow: "hidden", width: "100%", padding: '25px', ...style }}
        className={className}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <div style={{ padding: '12px', borderRadius: '14px', background: `${color}20`, color: color }}>
                {icon}
            </div>
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>{title}</h3>
            </div>
        </div>
        {children}
    </motion.div>
);

export default function GlobalSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        site_name: "",
        default_language: "English",
        default_currency: "INR",
        currency_symbol: "₹",
        show_weather: true,
        default_weather_location: "New Delhi, India",
        enable_file_converter: true,
        maintenance_mode: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/services/global-settings/');
            if (res.data) setSettings(res.data);
        } catch (err) {
            toast.error("Failed to load global settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/services/global-settings/', settings);
            toast.success("Global Settings Updated Successfully! 🌍");
        } catch (err) {
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleToggle = (field) => {
        setSettings({ ...settings, [field]: !settings[field] });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', marginLeft: '280px' }}>
                <Loader2 size={40} className="spin" color="#4f46e5" />
            </div>
        );
    }

    return (
        <div className="global-settings-wrapper">
            <SidebarModern />
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#0f172a', color: '#fff' } }} />

            <div className="service-main-content hide-scrollbar">
                {/* Animated Background Blobs */}
                <div className="bg-blob blob-1" />
                <div className="bg-blob blob-2" />

                {/* --- HEADER --- */}
                {/* ✅ FIX: Added flexWrap and gap so button and text don't overlap on medium screens */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '35px', position: 'relative', zIndex: 2 }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin: '0 0 5px 0' }}>
                            Global Settings <span style={{ fontSize: '2rem', verticalAlign: 'middle' }}>⚙️</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: '500', margin: 0 }}>Manage Site-Wide Configurations & Features.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={saving}
                        style={{ ...btnPrimary, width: 'auto', padding: '14px 30px', background: '#0f172a' }}
                    >
                        {saving ? <Loader2 size={20} className="spin" /> : <><Save size={20} style={{ marginRight: '8px' }} /> Save Changes</>}
                    </motion.button>
                </div>

                {/* --- SETTINGS GRID --- */}
                <div className="settings-grid" style={{ position: 'relative', zIndex: 2 }}>

                    {/* 1. Core Branding */}
                    <GlassCard title="Core Branding" icon={<Globe size={24} />} color="#6366f1" style={{ borderTop: '5px solid #6366f1' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Website Name</label>
                                <input name="site_name" value={settings.site_name} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </GlassCard>

                    {/* 2. Regional & Localization */}
                    <GlassCard title="Localization" icon={<Languages size={24} />} color="#ec4899" style={{ borderTop: '5px solid #ec4899' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Default Language</label>
                                <select name="default_language" value={settings.default_language} onChange={handleChange} style={inputStyle}>
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Spanish">Spanish</option>
                                </select>
                            </div>
                            <div className="responsive-grid">
                                <div className="form-group">
                                    <label>Currency Code</label>
                                    <input name="default_currency" value={settings.default_currency} onChange={handleChange} placeholder="e.g. INR" style={inputStyle} />
                                </div>
                                <div className="form-group">
                                    <label>Currency Symbol</label>
                                    <input name="currency_symbol" value={settings.currency_symbol} onChange={handleChange} placeholder="e.g. ₹" style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 3. Weather Module */}
                    <GlassCard title="Weather Module" icon={<CloudSun size={24} />} color="#f59e0b" style={{ borderTop: '5px solid #f59e0b' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="toggle-row">
                                <div>
                                    <h4 style={{ margin: 0, color: '#1e293b' }}>Show Weather Info</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Display live weather on frontend header</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={settings.show_weather} onChange={() => handleToggle('show_weather')} />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            {settings.show_weather && (
                                <div className="form-group" style={{ marginTop: '10px' }}>
                                    <label>Default Location (City, Country)</label>
                                    <input name="default_weather_location" value={settings.default_weather_location} onChange={handleChange} style={inputStyle} />
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* 4. Advanced Toggles */}
                    <GlassCard title="Advanced Toggles" icon={<ShieldAlert size={24} />} color="#ef4444" style={{ borderTop: '5px solid #ef4444' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="toggle-row">
                                <div>
                                    <h4 style={{ margin: 0, color: '#1e293b' }}>File Converter Tool</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Enable PDF/Word converter for users</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={settings.enable_file_converter} onChange={() => handleToggle('enable_file_converter')} />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-row" style={{ paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#ef4444' }}>Maintenance Mode</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Lock the website for updates</p>
                                </div>
                                <label className="switch danger">
                                    <input type="checkbox" checked={settings.maintenance_mode} onChange={() => handleToggle('maintenance_mode')} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </GlassCard>

                </div>
            </div>

            {/* --- FIX: RESPONSIVE STYLES --- */}
            <style>{`
        html, body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #f8fafc; }
        *, *::before, *::after { box-sizing: border-box; } /* ✅ MUST HAVE for accurate widths */
        
        .global-settings-wrapper { display: flex; width: 100%; height: 100vh; font-family: 'Inter', sans-serif; position: relative; overflow: hidden; }
        
        /* ✅ FIX: Perfect padding and exact width calculation */
        .service-main-content { 
            margin-left: 280px; 
            padding: 40px; 
            padding-bottom: 120px !important; 
            height: 100vh; 
            overflow-y: auto; 
            overflow-x: hidden; 
            width: calc(100% - 280px); 
            position: relative; 
            z-index: 1; 
        }
        
        .bg-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .blob-1 { top: -20%; left: 20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%); }
        .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(0,0,0,0) 70%); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; }
        .responsive-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        
        .form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;}
        .toggle-row { display: flex; justify-content: space-between; align-items: center; gap: 15px; }
        
        /* Modern Switch CSS */
        .switch { position: relative; display: inline-block; width: 52px; height: 28px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        input:checked + .slider { background-color: #10b981; }
        input:checked + .slider:before { transform: translateX(24px); }
        .switch.danger input:checked + .slider { background-color: #ef4444; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        /* ✅ FIX: Smooth Mobile Adaptation */
        @media (max-width: 1024px) { 
            .service-main-content { 
                margin-left: 0; 
                width: 100%; 
                padding: 20px;
                padding-top: 85px !important;
            } 
            .settings-grid { grid-template-columns: 1fr; gap: 20px; }
        }

        @media (max-width: 600px) {
            .responsive-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}

// --- SHARED STYLES ---
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '0.95rem', color: '#1e293b', fontWeight: '600', transition: 'all 0.2s', boxSizing: 'border-box' };
const btnPrimary = { border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -5px rgba(0,0,0,0.3)', fontSize: '0.95rem', fontWeight: '700', boxSizing: 'border-box' };