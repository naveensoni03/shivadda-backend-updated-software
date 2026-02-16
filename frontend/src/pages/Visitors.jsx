import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, LogOut, Search, Clock, CheckCircle, 
  Users, Phone, Printer, Calendar, ShieldCheck, MapPin, Briefcase,
  Eye, X, FileText, BadgeCheck, Download 
} from "lucide-react";

export default function Visitors() {
  const today = new Date().toISOString().split('T')[0];
  const [visitors, setVisitors] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", purpose: "", person_to_meet: "" });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);

  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => { fetchVisitors(); }, [selectedDate]);

  const fetchVisitors = async () => {
    try {
      const res = await api.get(`visitors/?date=${selectedDate}`);
      setVisitors(res.data);
    } catch (err) { console.error(err); }
  };

  const handleEntry = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("visitors/", formData);
      toast.success("Pass Generated Successfully! 🎫");
      setFormData({ name: "", phone: "", purpose: "", person_to_meet: "" });
      fetchVisitors();
    } catch (error) { toast.error("Entry Failed"); }
    setLoading(false);
  };

  const handleCheckout = async (id) => {
    try {
      await api.post(`visitors/${id}/checkout/`);
      toast.success("Checked Out 👋");
      fetchVisitors();
    } catch (error) { toast.error("Error checking out"); }
  };

  const handlePrintPass = () => {
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>GATE PASS - ${selectedPass.name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; border: 2px solid #000; margin: 20px; }
            h2 { border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
            .row { text-align: left; margin-bottom: 10px; font-size: 14px; }
            .label { font-weight: bold; width: 100px; display: inline-block; }
            .footer { margin-top: 30px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>VISITOR PASS</h2>
          <div class="row"><span class="label">Name:</span> ${selectedPass.name}</div>
          <div class="row"><span class="label">Phone:</span> ${selectedPass.phone}</div>
          <div class="row"><span class="label">Meeting:</span> ${selectedPass.person_to_meet}</div>
          <div class="row"><span class="label">Purpose:</span> ${selectedPass.purpose}</div>
          <div class="row"><span class="label">Time In:</span> ${new Date(selectedPass.check_in_time).toLocaleTimeString()}</div>
          <div class="footer">Valid for one entry only.<br>Please return at gate.</div>
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
  const filteredVisitors = visitors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SidebarModern />
      
      {/* 🚀 Changed class structure for Mobile Responsiveness */}
      <div className="visitor-main-content">
        <Toaster position="top-center" />

        {/* 🌟 Header */}
        <div className="visitor-header">
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>Visitor Access</h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '5px 0 0 0' }}>Secure Gate Management System</p>
            </div>
            
            <div style={{ background: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={16} color="#6366f1" />
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ border: 'none', outline: 'none', fontWeight: '600', color: '#334155', fontSize: '0.9rem', cursor: 'pointer' }} />
            </div>
        </div>

        {/* 📊 Stats Row */}
        <div className="visitor-stats-grid">
            <div style={statCardStyle}>
                <div style={iconBox('#e0e7ff', '#4f46e5')}><Users size={22} /></div>
                <div><p style={statLabel}>Total Visitors</p><h3 style={statValue}>{visitors.length}</h3></div>
            </div>
            <div style={statCardStyle}>
                <div style={iconBox('#fee2e2', '#ef4444')}><Clock size={22} /></div>
                <div><p style={statLabel}>Inside Campus</p><h3 style={{...statValue, color:'#ef4444'}}>{insideCount}</h3></div>
            </div>
            <div style={statCardStyle}>
                <div style={iconBox('#dcfce7', '#16a34a')}><CheckCircle size={22} /></div>
                <div><p style={statLabel}>Checked Out</p><h3 style={{...statValue, color:'#16a34a'}}>{visitors.length - insideCount}</h3></div>
            </div>
        </div>

        <div className="visitor-content-grid">
            
            {/* 📝 COMPACT FORM PANEL */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', position: 'relative' }}>
                
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px' }}>
                        <UserPlus size={20} color="#0f172a" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>New Entry</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Enter visitor details</p>
                    </div>
                </div>
                
                <form onSubmit={handleEntry} style={{ display: 'grid', gap: '15px' }}>
                    
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input placeholder="e.g. Rahul Sharma" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={cleanInputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        <input placeholder="9876543210" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={cleanInputStyle} />
                    </div>

                    <div className="form-split-row">
                        <div>
                            <label style={labelStyle}>Purpose</label>
                            <input placeholder="Visit" required value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} style={cleanInputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>To Meet</label>
                            <input placeholder="Staff Name" required value={formData.person_to_meet} onChange={e => setFormData({...formData, person_to_meet: e.target.value})} style={cleanInputStyle} />
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.95 }} 
                        type="submit" 
                        disabled={loading} 
                        style={primaryBtnStyle}
                    >
                        {loading ? "Processing..." : "Generate Pass 🎫"}
                    </motion.button>
                </form>
            </div>

            {/* 🎫 List Section */}
            <div>
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '13px', color: '#94a3b8' }} />
                    <input 
                        placeholder="Search active visitors..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        style={searchStyle}
                    />
                </div>

                <div className="visitor-card-grid">
                    <AnimatePresence>
                        {filteredVisitors.map((v) => (
                            <motion.div 
                                key={v.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={ticketStyle(v.is_checked_out)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={avatarStyle}>{v.name.charAt(0)}</div>
                                        <div>
                                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem', fontWeight: '700' }}>{v.name}</h4>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.phone}</span>
                                        </div>
                                    </div>
                                    
                                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                        <button 
                                            onClick={() => setSelectedPass(v)} 
                                            style={{ background: '#f1f5f9', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                        {!v.is_checked_out && <div style={activeDot}></div>}
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', border: '1px solid #f1f5f9' }}>
                                    <div><span style={miniLabel}>TO MEET</span><div style={miniValue}>{v.person_to_meet}</div></div>
                                    <div style={{textAlign:'right'}}><span style={miniLabel}>TIME IN</span><div style={miniValue}>{new Date(v.check_in_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></div>
                                </div>

                                {!v.is_checked_out ? (
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <button onClick={() => setSelectedPass(v)} style={iconBtnStyle} title="View & Print"><Printer size={16}/></button>
                                        <button onClick={() => handleCheckout(v.id)} style={checkoutBtnStyle}>Mark Exit <LogOut size={14}/></button>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '5px' }}>Checked Out</div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* ✅ MODAL */}
        <AnimatePresence>
            {selectedPass && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ background: 'white', width: '100%', maxWidth: '380px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}
                        className="modal-responsive"
                    >
                        {/* Pass Header */}
                        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', padding: '25px', color: 'white', textAlign: 'center', position: 'relative' }}>
                            <button onClick={() => setSelectedPass(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><X size={16}/></button>
                            
                            <div style={{ background: 'white', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#4f46e5', fontWeight: '800', fontSize: '1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                                {selectedPass.name.charAt(0)}
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>{selectedPass.name}</h2>
                            <p style={{ margin: '5px 0 0', opacity: 0.9, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <BadgeCheck size={16}/> Authorized Visitor
                            </p>
                        </div>

                        {/* Pass Details */}
                        <div style={{ padding: '25px' }}>
                            <div style={passRow}><span style={passLabel}>Phone</span><span style={passValue}>{selectedPass.phone}</span></div>
                            <div style={passRow}><span style={passLabel}>Purpose</span><span style={passValue}>{selectedPass.purpose}</span></div>
                            <div style={passRow}><span style={passLabel}>To Meet</span><span style={passValue}>{selectedPass.person_to_meet}</span></div>
                            <div style={passRow}><span style={passLabel}>Check-In</span><span style={passValue}>{new Date(selectedPass.check_in_time).toLocaleString()}</span></div>
                            
                            <div style={{ background: selectedPass.is_checked_out ? '#f1f5f9' : '#dcfce7', color: selectedPass.is_checked_out ? '#64748b' : '#166534', padding: '8px', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '700', marginTop: '15px' }}>
                                {selectedPass.is_checked_out ? "❌ Checked Out" : "✅ Currently Inside Campus"}
                            </div>

                            <div style={{ borderTop: '2px dashed #e2e8f0', margin: '20px 0' }}></div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handlePrintPass} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Printer size={16}/> Print
                                </button>
                                <button onClick={handleDownloadPass} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <FileText size={16}/> Download
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </div>
      
      {/* 🚀 CSS FOR RESPONSIVENESS */}
      <style>{`
            .visitor-main-content { flex: 1; margin-left: 280px; padding: 30px; box-sizing: border-box; transition: all 0.3s ease; min-height: 100vh;}
            
            .visitor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .visitor-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .visitor-content-grid { display: grid; grid-template-columns: 360px 1fr; gap: 30px; align-items: start; }
            .visitor-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }
            .form-split-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

            /* 📱 MOBILE SPECIFIC STYLES */
            @media (max-width: 850px) {
                .visitor-main-content {
                    margin-left: 0 !important;
                    padding: 15px !important;
                    padding-top: 90px !important; /* Top bar space */
                    width: 100% !important;
                }
                
                .visitor-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                .visitor-stats-grid { grid-template-columns: 1fr; gap: 10px; }
                .visitor-content-grid { grid-template-columns: 1fr; gap: 20px; }
                
                .form-split-row { grid-template-columns: 1fr; }
                .visitor-card-grid { grid-template-columns: 1fr; }
                
                .modal-responsive { max-width: 90% !important; }
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

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: '700' };

const cleanInputStyle = {
    width: '100%', padding: '12px', borderRadius: '10px',
    border: '1px solid #e2e8f0', background: '#f8fafc',
    fontSize: '0.9rem', color: '#1e293b', fontWeight: '600',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
};

const primaryBtnStyle = {
    background: '#0f172a', color: 'white', padding: '14px', borderRadius: '10px',
    border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', width: '100%',
    marginTop: '10px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
};

const searchStyle = {
    width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px',
    border: '1px solid #e2e8f0', background: 'white', boxSizing: 'border-box',
    fontSize: '0.95rem', color: '#1e293b', outline: 'none'
};

const ticketStyle = (out) => ({
    background: 'white', padding: '15px', borderRadius: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9',
    opacity: out ? 0.7 : 1
});

const avatarStyle = {
    width: '40px', height: '40px', borderRadius: '10px', background: '#0f172a', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem'
};

const activeDot = { width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 0 3px #dcfce7' };
const miniLabel = { fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' };
const miniValue = { fontSize: '0.85rem', color: '#334155', fontWeight: '600' };

const checkoutBtnStyle = {
    flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2',
    background: '#fff1f2', color: '#ef4444', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem'
};

const iconBtnStyle = {
    padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0',
    background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center'
};

// Modal Styles
const passRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' };
const passLabel = { color: '#64748b', fontSize: '0.9rem', fontWeight: '600' };
const passValue = { color: '#1e293b', fontSize: '0.9rem', fontWeight: '700' };