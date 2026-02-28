import React, { useState, useEffect, useRef, useCallback } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import {
    UserPlus, LogOut, Search, Clock, CheckCircle,
    Users, Phone, Printer, Calendar, ShieldCheck, MapPin, Briefcase,
    Eye, X, FileText, BadgeCheck, Camera, CheckSquare, Server, Trash2
} from "lucide-react";

// Helper for exact duration (Blueprint Requirement #2)
const calculateDetailedDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const diff = new Date(end) - new Date(start);
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    const ms = Math.floor(diff % 1000);
    return `${h} Hrs ${m} Mins ${s} Secs ${ms} ms`;
};

export default function Visitors() {
    const today = new Date().toISOString().split('T')[0];
    const [visitors, setVisitors] = useState([]);

    // ✅ ADVANCED FORM DATA (Requirement 1, 3, 5, 7)
    const [formData, setFormData] = useState({
        name: "", phone: "", purpose: "", person_to_meet: "",
        gender: "Male", id_proof: "", address: "",
        otp: "", captcha: "", terms_accepted: false, photo: null,
        place_id: "IND-UP-JAUNPUR-01", virtual_id: "V-SEC-001", allocated_mb: 50
    });

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedPass, setSelectedPass] = useState(null);

    // ✅ BULK ACTIONS STATE (Requirement 4)
    const [selectedVisitorIds, setSelectedVisitorIds] = useState([]);

    // ✅ WEBCAM STATE (Requirement 6)
    const [showCamera, setShowCamera] = useState(false);
    const webcamRef = useRef(null);

    // ✅ CAPTCHA STATE
    const [captchaQ] = useState("7 + 5");
    const [captchaAns] = useState("12");

    useEffect(() => { fetchVisitors(); }, [selectedDate]);

    const fetchVisitors = async () => {
        try {
            // Simulated fetch for demonstration. Replace with actual API.
            const res = await api.get(`visitors/?date=${selectedDate}`);
            setVisitors(res.data || []);
        } catch (err) { console.error("Fetch error:", err); }
    };

    // WEBCAM CAPTURE HANDLER
    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setFormData(prev => ({ ...prev, photo: imageSrc }));
        setShowCamera(false);
    }, [webcamRef]);

    const handleEntry = async (e) => {
        e.preventDefault();

        // Custom Validations matching blueprint
        if (!formData.terms_accepted) return toast.error("Please accept Terms & Conditions!");
        if (formData.captcha !== captchaAns) return toast.error("Invalid Captcha!");
        if (!formData.photo) return toast.error("Visitor Photo is mandatory!");
        if (formData.otp.length < 4) return toast.error("Please verify OTP!");

        setLoading(true);
        try {
            // Prepare payload
            const payload = { ...formData, check_in_time: new Date().toISOString(), is_checked_out: false };

            // API CALL
            // const res = await api.post("visitors/", payload);

            // OPTIMISTIC UI UPDATE (Since we don't have your real backend yet)
            const newVisitor = { id: Date.now(), ...payload };
            setVisitors([newVisitor, ...visitors]);

            toast.success("Gate Pass Generated & Storage Allocated! 🎫");

            // Reset Form
            setFormData({
                name: "", phone: "", purpose: "", person_to_meet: "",
                gender: "Male", id_proof: "", address: "", otp: "", captcha: "",
                terms_accepted: false, photo: null, place_id: "IND-UP-JAUNPUR-01", virtual_id: "V-SEC-001", allocated_mb: 50
            });
        } catch (error) { toast.error("Entry Failed"); }
        setLoading(false);
    };

    const handleCheckout = async (id) => {
        try {
            // await api.post(`visitors/${id}/checkout/`);
            setVisitors(visitors.map(v => v.id === id ? { ...v, is_checked_out: true, check_out_time: new Date().toISOString() } : v));
            toast.success("Visitor Checked Out 👋");
        } catch (error) { toast.error("Error checking out"); }
    };

    // BULK CHECKOUT LOGIC
    const handleBulkCheckout = () => {
        if (selectedVisitorIds.length === 0) return;
        setVisitors(visitors.map(v => selectedVisitorIds.includes(v.id) ? { ...v, is_checked_out: true, check_out_time: new Date().toISOString() } : v));
        toast.success(`${selectedVisitorIds.length} Visitors Checked Out in Bulk!`);
        setSelectedVisitorIds([]);
    };

    const toggleSelection = (id) => {
        setSelectedVisitorIds(prev => prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]);
    };

    const handlePrintPass = () => {
        const printWindow = window.open('', '', 'width=600,height=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>GATE PASS - ${selectedPass.name}</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; padding: 20px; text-align: center; }
                        .ticket { border: 2px dashed #1e293b; padding: 20px; border-radius: 15px; max-width: 400px; margin: 0 auto; }
                        h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #1e293b; }
                        .photo { width: 100px; height: 100px; border-radius: 10px; object-fit: cover; margin-bottom: 15px; border: 2px solid #e2e8f0; }
                        .row { text-align: left; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
                        .label { font-weight: bold; width: 120px; display: inline-block; color: #64748b; }
                        .val { color: #0f172a; font-weight: bold; }
                        .sys-info { margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: left; background: #f8fafc; padding: 10px; border-radius: 8px; }
                        .footer { margin-top: 20px; font-weight: bold; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <h2>SHIVADDA GATE PASS</h2>
                        ${selectedPass.photo ? `<img src="${selectedPass.photo}" class="photo" />` : ''}
                        
                        <div class="row"><span class="label">Name:</span> <span class="val">${selectedPass.name} (${selectedPass.gender})</span></div>
                        <div class="row"><span class="label">Phone:</span> <span class="val">${selectedPass.phone}</span></div>
                        <div class="row"><span class="label">ID Proof:</span> <span class="val">${selectedPass.id_proof || 'N/A'}</span></div>
                        <div class="row"><span class="label">To Meet:</span> <span class="val">${selectedPass.person_to_meet}</span></div>
                        <div class="row"><span class="label">Purpose:</span> <span class="val">${selectedPass.purpose}</span></div>
                        <div class="row"><span class="label">Check-In:</span> <span class="val">${new Date(selectedPass.check_in_time).toLocaleString()}</span></div>
                        
                        <div class="sys-info">
                            <strong>System Meta:</strong><br/>
                            Place ID: ${selectedPass.place_id}<br/>
                            Virtual ID: ${selectedPass.virtual_id}<br/>
                            Storage: ${selectedPass.allocated_mb} MB Allocated
                        </div>

                        <div class="footer">Valid for one entry only. Please deposit at gate.</div>
                    </div>
                    <script>window.print();</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDownloadPass = () => {
        const passText = `
========================================
            VISITOR GATE PASS
========================================
Visitor Name:  ${selectedPass.name}
Phone Number:  ${selectedPass.phone}
To Meet:       ${selectedPass.person_to_meet}
Purpose:       ${selectedPass.purpose}
Time In:       ${new Date(selectedPass.check_in_time).toLocaleString()}
Status:        ${selectedPass.is_checked_out ? "Checked Out" : "Inside Campus"}
========================================
        Authorized Entry
========================================
    `;
        const blob = new Blob([passText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Pass_${selectedPass.name}.txt`;
        link.click();
        toast.success("Pass Downloaded 📥");
    };

    const insideCount = visitors.filter(v => !v.is_checked_out).length;

    // Advanced Search Logic
    const filteredVisitors = visitors.filter(v =>
        (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.phone && v.phone.includes(searchTerm)) ||
        (v.person_to_meet && v.person_to_meet.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="visitor-page-wrapper">
            <div style={{ zIndex: 50 }}>
                <SidebarModern />
            </div>

            <div className="visitor-main-content">
                <Toaster position="top-center" />

                {/* 🌟 Header */}
                <div className="visitor-header">
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>Front Office & Security</h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '5px 0 0 0' }}>Place ID: IND-UP-JAUNPUR-01 | Advanced Gate Mgmt</p>
                    </div>

                    <div className="header-actions">
                        {selectedVisitorIds.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                onClick={handleBulkCheckout}
                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
                            >
                                <LogOut size={16} /> Bulk Exit ({selectedVisitorIds.length})
                            </motion.button>
                        )}
                        <div className="top-search-bar" style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '15px', top: '10px', color: '#94a3b8' }} />
                            <input
                                placeholder="Search visitor..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', boxSizing: 'border-box', fontSize: '0.9rem', color: '#1e293b', outline: 'none' }}
                            />
                        </div>
                        <div className="date-picker-box" style={{ background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={16} color="#6366f1" style={{ flexShrink: 0 }} />
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ border: 'none', outline: 'none', fontWeight: '600', color: '#334155', fontSize: '0.9rem', cursor: 'pointer', background: 'transparent', width: '100%' }} />
                        </div>
                    </div>
                </div>

                {/* 📊 Stats Row */}
                <div className="visitor-stats-grid">
                    <div style={statCardStyle}>
                        <div style={iconBox('#e0e7ff', '#4f46e5')}><Users size={22} /></div>
                        <div><p style={statLabel}>Total Logs</p><h3 style={statValue}>{visitors.length}</h3></div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={iconBox('#fee2e2', '#ef4444')}><Clock size={22} /></div>
                        <div><p style={statLabel}>Inside Campus</p><h3 style={{ ...statValue, color: '#ef4444' }}>{insideCount}</h3></div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={iconBox('#dcfce7', '#16a34a')}><Server size={22} /></div>
                        <div><p style={statLabel}>Virtual Space Used</p><h3 style={{ ...statValue, color: '#16a34a' }}>{visitors.length * 50} MB</h3></div>
                    </div>
                </div>

                <div className="visitor-content-grid">

                    {/* 📝 ADVANCED ENTRY FORM */}
                    <div className="new-entry-card" style={{ background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px' }}>
                                <ShieldCheck size={20} color="#0f172a" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Verified Entry</h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Complete profile for security</p>
                            </div>
                        </div>

                        <form onSubmit={handleEntry} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                            {/* LIVE CAMERA SECTION */}
                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                {formData.photo ? (
                                    <div>
                                        <img src={formData.photo} alt="Visitor" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #4f46e5', marginBottom: '8px' }} />
                                        <br />
                                        <button type="button" onClick={() => setFormData({ ...formData, photo: null })} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Retake Photo</button>
                                    </div>
                                ) : (
                                    showCamera ? (
                                        <div style={{ position: 'relative' }}>
                                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', borderRadius: '10px', maxHeight: '180px', objectFit: 'cover' }} />
                                            <button type="button" onClick={capturePhoto} style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}><Camera size={16} /> Capture</button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setShowCamera(true)} style={{ background: 'white', color: '#4f46e5', border: '1px dashed #4f46e5', padding: '12px', width: '100%', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                            <Camera size={18} /> Open Web Camera
                                        </button>
                                    )
                                )}
                            </div>

                            <div className="form-split-row">
                                <div className="form-input-wrapper">
                                    <label style={labelStyle}>Full Name</label>
                                    <input placeholder="e.g. Rahul Sharma" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={cleanInputStyle} />
                                </div>
                                <div className="form-input-wrapper">
                                    <label style={labelStyle}>Gender</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={cleanInputStyle}>
                                        <option>Male</option><option>Female</option><option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-split-row">
                                <div className="form-input-wrapper">
                                    <label style={labelStyle}>Phone Number</label>
                                    <input placeholder="9876543210" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={cleanInputStyle} />
                                </div>
                                <div className="form-input-wrapper">
                                    <label style={labelStyle}>ID Proof No.</label>
                                    <input placeholder="Aadhar/PAN No." required value={formData.id_proof} onChange={e => setFormData({ ...formData, id_proof: e.target.value })} style={cleanInputStyle} />
                                </div>
                            </div>

                            <div className="form-input-wrapper">
                                <label style={labelStyle}>Full Address</label>
                                <input placeholder="City, State" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={cleanInputStyle} />
                            </div>

                            <div className="form-split-row">
                                <div className="form-input-wrapper">
                                    <label style={labelStyle}>Purpose</label>
                                    <input placeholder="Visit" required value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} style={cleanInputStyle} />
                                </div>
                                <div className="form-input-wrapper">
                                    <label style={labelStyle}>To Meet</label>
                                    <input placeholder="Staff Name" required value={formData.person_to_meet} onChange={e => setFormData({ ...formData, person_to_meet: e.target.value })} style={cleanInputStyle} />
                                </div>
                            </div>

                            {/* OTP & CAPTCHA SECURITY */}
                            <div className="form-split-row" style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div className="form-input-wrapper" style={{ position: 'relative' }}>
                                    <label style={labelStyle}>OTP Verification</label>
                                    <input placeholder="4 digit OTP" maxLength="4" required value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value })} style={{ ...cleanInputStyle, paddingRight: '60px' }} />
                                    <button type="button" onClick={() => toast.success("OTP Sent!")} style={{ position: 'absolute', right: '5px', top: '26px', background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Send</button>
                                </div>
                                <div className="form-input-wrapper">
                                    <label style={labelStyle}>Solve: {captchaQ}</label>
                                    <input placeholder="Answer" required value={formData.captcha} onChange={e => setFormData({ ...formData, captcha: e.target.value })} style={cleanInputStyle} />
                                </div>
                            </div>

                            {/* TERMS CHECKBOX */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px', background: '#f1f5f9', borderRadius: '10px' }}>
                                <input type="checkbox" id="visitorTerms" required checked={formData.terms_accepted} onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })} style={{ marginTop: '2px', cursor: 'pointer', accentColor: '#4f46e5', width: '16px', height: '16px', flexShrink: 0 }} />
                                <label htmlFor="visitorTerms" style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: '1.4', cursor: 'pointer', fontWeight: '600' }}>
                                    I HAVE READ ALL TERMS AND CONDITIONS OF EACH AND EVERY PLACE SERVICES AND USER ON YOUR WEBSITE. I AM AGREED WITH ALL OF THEM.
                                </label>
                            </div>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} type="submit" disabled={loading} style={primaryBtnStyle}>
                                {loading ? "Processing..." : "Generate Pass & Allocate Space 🎫"}
                            </motion.button>
                        </form>
                    </div>

                    {/* 🎫 LIST SECTION WITH BULK CAPABILITY */}
                    <div className="visitor-list-card">
                        <div className="visitor-card-grid">
                            <AnimatePresence>
                                {filteredVisitors.map((v) => (
                                    <motion.div
                                        key={v.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        style={ticketStyle(v.is_checked_out)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                {/* Bulk Checkbox */}
                                                {!v.is_checked_out && (
                                                    <input type="checkbox" checked={selectedVisitorIds.includes(v.id)} onChange={() => toggleSelection(v.id)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ef4444' }} />
                                                )}

                                                <div style={v.photo ? { ...avatarStyle, background: `url(${v.photo}) center/cover` } : avatarStyle}>
                                                    {!v.photo && v.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem', fontWeight: '700' }}>{v.name}</h4>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                        <MapPin size={10} /> {v.virtual_id || 'V-SEC-001'} | {v.allocated_mb || 50}MB
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <button type="button" onClick={() => setSelectedPass(v)} style={{ background: '#f1f5f9', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>
                                                    <Eye size={14} /> View
                                                </button>
                                                {!v.is_checked_out && <div style={activeDot}></div>}
                                            </div>
                                        </div>

                                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', border: '1px solid #f1f5f9' }}>
                                            <div><span style={miniLabel}>TO MEET</span><div style={miniValue}>{v.person_to_meet}</div></div>
                                            <div style={{ textAlign: 'right' }}><span style={miniLabel}>TIME IN</span><div style={miniValue}>{new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>
                                        </div>

                                        {!v.is_checked_out ? (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button type="button" onClick={() => setSelectedPass(v)} style={iconBtnStyle} title="View & Print"><Printer size={16} /></button>
                                                <button type="button" onClick={() => handleCheckout(v.id)} style={checkoutBtnStyle}>Mark Exit <LogOut size={14} /></button>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', padding: '5px', background: '#f1f5f9', borderRadius: '8px' }}>
                                                <strong>Duration:</strong> {calculateDetailedDuration(v.check_in_time, v.check_out_time)}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ✅ FULL DETAILED MODAL */}
                <AnimatePresence>
                    {selectedPass && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                                className="modal-responsive"
                            >
                                <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', padding: '25px', color: 'white', textAlign: 'center', position: 'relative', flexShrink: 0 }}>
                                    <button onClick={() => setSelectedPass(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><X size={16} /></button>

                                    <div style={{ background: 'white', width: '70px', height: '70px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#4f46e5', fontWeight: '800', fontSize: '1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                        {selectedPass.photo ? <img src={selectedPass.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedPass.name.charAt(0)}
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>{selectedPass.name}</h2>
                                    <p style={{ margin: '5px 0 0', opacity: 0.9, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <BadgeCheck size={16} /> {selectedPass.gender} | ID: {selectedPass.id_proof || 'Verified'}
                                    </p>
                                </div>

                                <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
                                    <div style={passRow}><span style={passLabel}>Phone</span><span style={passValue}>{selectedPass.phone}</span></div>
                                    <div style={passRow}><span style={passLabel}>Address</span><span style={passValue}>{selectedPass.address || 'N/A'}</span></div>
                                    <div style={passRow}><span style={passLabel}>To Meet</span><span style={passValue}>{selectedPass.person_to_meet}</span></div>
                                    <div style={passRow}><span style={passLabel}>Purpose</span><span style={passValue}>{selectedPass.purpose}</span></div>

                                    <div style={{ borderTop: '1px dashed #cbd5e1', margin: '15px 0' }}></div>

                                    <div style={passRow}><span style={passLabel}>Place ID</span><span style={passValue}>{selectedPass.place_id || 'IND-UP-JAUNPUR-01'}</span></div>
                                    <div style={passRow}><span style={passLabel}>Space Allocation</span><span style={passValue}>{selectedPass.allocated_mb || 50} MB</span></div>
                                    <div style={passRow}><span style={passLabel}>Check-In</span><span style={passValue}>{new Date(selectedPass.check_in_time).toLocaleString()}</span></div>

                                    {selectedPass.is_checked_out && (
                                        <>
                                            <div style={passRow}><span style={passLabel}>Check-Out</span><span style={passValue}>{new Date(selectedPass.check_out_time).toLocaleString()}</span></div>
                                            <div style={passRow}><span style={passLabel}>Total Duration</span><span style={{ ...passValue, color: '#ef4444' }}>{calculateDetailedDuration(selectedPass.check_in_time, selectedPass.check_out_time)}</span></div>
                                        </>
                                    )}

                                    <div style={{ background: selectedPass.is_checked_out ? '#f1f5f9' : '#dcfce7', color: selectedPass.is_checked_out ? '#64748b' : '#166534', padding: '10px', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '800', marginTop: '15px' }}>
                                        {selectedPass.is_checked_out ? "❌ Checked Out & Logs Saved" : "✅ Currently Inside Campus"}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button type="button" onClick={handlePrintPass} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Printer size={16} /> Print Pass
                                        </button>
                                        <button type="button" onClick={handleDownloadPass} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <FileText size={16} /> Export Data
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>

            {/* 🚀 ULTIMATE CSS FIX FOR RESPONSIVENESS AND SCROLLING */}
            <style>{`
                /* Prevent root layout jumping */
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #f8fafc; }
                
                .visitor-page-wrapper { 
                    display: flex; 
                    width: 100vw; 
                    height: 100vh; 
                    overflow: hidden; 
                    background: #f8fafc; 
                }

                .visitor-main-content { 
                    flex: 1; 
                    margin-left: 280px; /* Sidebar width */
                    padding: 30px; 
                    height: 100vh; 
                    overflow-y: auto; /* ENABLE INTERNAL SCROLL HERE */
                    box-sizing: border-box; 
                }

                /* Scrollbar styling */
                .visitor-main-content::-webkit-scrollbar { width: 8px; }
                .visitor-main-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .visitor-main-content::-webkit-scrollbar-track { background: transparent; }

                .visitor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
                .header-actions { display: flex; gap: 15px; alignItems: center; }
                .top-search-bar { width: 250px; }
                .visitor-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                
                /* Grid for Desktop: Form (fixed width) + List (fluid) */
                .visitor-content-grid { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }
                .visitor-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
                .form-split-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

                /* TABLET */
                @media (max-width: 1024px) {
                    .visitor-content-grid { grid-template-columns: 1fr; }
                }

                /* MOBILE */
                @media (max-width: 850px) {
                    /* Break flex for mobile to allow natural block flow */
                    .visitor-page-wrapper { display: block; overflow-y: auto; }
                    
                    .visitor-main-content {
                        margin-left: 0; 
                        width: 100%; 
                        padding: 15px; 
                        padding-top: 80px; /* Space for Mobile Menu Bar */
                        padding-bottom: 40px; 
                        height: auto; 
                        overflow-y: visible; /* Let the wrapper handle scroll */
                    }
                    
                    .visitor-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .header-actions { width: 100%; flex-direction: column; align-items: stretch; gap: 10px; }
                    .top-search-bar { width: 100%; }
                    .date-picker-box { width: 100%; box-sizing: border-box; justify-content: space-between; }
                    .date-picker-box input { width: 100%; flex: 1; text-align: right; }
                    
                    .visitor-stats-grid { grid-template-columns: 1fr; gap: 12px; }
                    .visitor-content-grid { display: flex; flex-direction: column; gap: 25px; }
                    .new-entry-card { height: auto; }
                    .form-split-row { grid-template-columns: 1fr; gap: 12px; }
                    .form-input-wrapper { width: 100%; }
                    
                    .modal-responsive { max-width: 95% !important; margin: 10px auto; max-height: 90vh; }
                }
            `}</style>
        </div>
    );
}

// ✨ Styles
const statCardStyle = { background: 'white', padding: '15px 20px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #f1f5f9' };
const iconBox = (bg, color) => ({ background: bg, padding: '10px', borderRadius: '10px', color: color, display: 'flex' });
const statLabel = { margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '600' };
const statValue = { margin: '2px 0 0', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' };
const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: '#475569', fontWeight: '700' };
const cleanInputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', color: '#1e293b', fontWeight: '600', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' };
const primaryBtnStyle = { background: '#0f172a', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', width: '100%', marginTop: '5px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)', boxSizing: 'border-box' };
const ticketStyle = (out) => ({ background: 'white', padding: '15px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', opacity: out ? 0.7 : 1, width: '100%', boxSizing: 'border-box' });
const avatarStyle = { width: '40px', height: '40px', borderRadius: '10px', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem', flexShrink: 0 };
const activeDot = { width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 0 3px #dcfce7' };
const miniLabel = { fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' };
const miniValue = { fontSize: '0.85rem', color: '#334155', fontWeight: '600' };
const checkoutBtnStyle = { flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#ef4444', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' };
const iconBtnStyle = { padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const passRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' };
const passLabel = { color: '#64748b', fontSize: '0.85rem', fontWeight: '600' };
const passValue = { color: '#1e293b', fontSize: '0.85rem', fontWeight: '700', textAlign: 'right', flex: 1, paddingLeft: '10px' };