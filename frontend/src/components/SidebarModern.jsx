import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// ✅ IMPORT ADDED FOR ACTIVITY ICON
import { Menu, X, Activity } from "lucide-react"; 

const SidebarModern = () => {
  const navigate = useNavigate();
  // State for mobile toggle
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const linkStyle = ({ isActive }) => ({
    padding: "12px 16px",
    borderRadius: "14px",
    color: isActive ? "#4f46e5" : "#64748b",
    textDecoration: "none",
    background: isActive ? "linear-gradient(145deg, #ffffff, #f5f3ff)" : "transparent",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px", 
    fontSize: "0.95rem",
    fontWeight: isActive ? "700" : "500",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: isActive ? "0 10px 20px -5px rgba(79, 70, 229, 0.15), inset 0 0 0 1px rgba(79, 70, 229, 0.1)" : "none",
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* 📱 MOBILE TOP HEADER (Sirf phone par dikhega) */}
      <div className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: '35px', height: '35px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
          }}>
            <span style={{ color: 'white', fontWeight: '900', fontSize: '1.2rem' }}>S</span>
          </div>
          <h2 style={{ color: "#0f172a", fontSize: "1.2rem", fontWeight: "900", margin: 0, letterSpacing: "1px" }}>SHIVADDA</h2>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(true)}>
          <Menu size={26} color="#0f172a" />
        </button>
      </div>

      {/* 📱 MOBILE BLACK OVERLAY */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)}></div>
      )}

      {/* 🖥️ MAIN SIDEBAR (Desktop par hamesha, Mobile par toggle) */}
      <aside className={`custom-sidebar ${isMobileOpen ? "open" : ""}`} style={{ 
        width: "280px", background: "#ffffff", height: "100vh", position: "fixed", 
        top: 0, display: "flex", flexDirection: "column", padding: "35px 25px",
        borderRight: "1px solid #f1f5f9", zIndex: 1000, overflowY: "auto"
      }}>
        
        {/* Mobile Close Button */}
        <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)}>
          <X size={24} color="#64748b" />
        </button>

        <div style={{ marginBottom: "40px", display: 'flex', alignItems: 'center', gap: '15px' }}>
           <div style={{ 
             width: '42px', height: '42px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
             borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
             boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)'
           }}>
             <span style={{color:'white', fontWeight: '900', fontSize: '1.4rem'}}>S</span>
           </div>
           <h2 style={{ color: "#0f172a", fontSize: "1.6rem", fontWeight: "900", letterSpacing: "-1px", margin: 0 }}>SHIVADDA</h2>
        </div>

        <nav style={{ flex: 1 }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1.5px', paddingLeft: '8px' }}>Super Controls</p>
          <NavLink to="/dashboard" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📊 Dashboard</NavLink>
          
          {/* ✅ ANALYTICS & LOGS MOVED TO SUPER CONTROLS */}
          <NavLink to="/analytics" style={linkStyle} onClick={() => setIsMobileOpen(false)}>
            <Activity size={18} /> Analytics & Logs
          </NavLink>
          
          <NavLink to="/ai-brain" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🧠 AI Brain</NavLink>
          <NavLink to="/institutions" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🏢 Institutions</NavLink>
          <NavLink to="/locations" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🌍 Global Locations</NavLink>
          
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>Access & Logs</p>
          <NavLink to="/users" style={linkStyle} onClick={() => setIsMobileOpen(false)}>👥 User Manager</NavLink>
          <NavLink to="/access-logs" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🔐 Audit Logs</NavLink>
          <NavLink to="/virtual-space" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📹 Virtual Space</NavLink> 

          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>School Ops</p>
          <NavLink to="/visitors" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🤝 Front Office</NavLink>
          <NavLink to="/admissions" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📝 Admissions</NavLink> 
          <NavLink to="/attendance" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📅 Attendance</NavLink>
          <NavLink to="/students" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🎓 Student Base</NavLink>
          <NavLink to="/teachers" style={linkStyle} onClick={() => setIsMobileOpen(false)}>👨‍🏫 Teachers</NavLink>
          <NavLink to="/courses" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📚 Course Manager</NavLink>
          <NavLink to="/exams" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📝 Exams & AI</NavLink>

          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>Finance & Assets</p>
          <NavLink to="/fees" style={linkStyle} onClick={() => setIsMobileOpen(false)}>💰 Fees Ledger</NavLink>
          <NavLink to="/payroll" style={linkStyle} onClick={() => setIsMobileOpen(false)}>💸 Payroll & Salary</NavLink>
          <NavLink to="/inventory" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📦 Inventory</NavLink>
          <NavLink to="/timetable" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📅 Timetable & Routine</NavLink>
          <NavLink to="/communication" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📢 Communication</NavLink>

          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>Facilities</p>
          <NavLink to="/library" style={linkStyle} onClick={() => setIsMobileOpen(false)}>📖 Library</NavLink>
          <NavLink to="/hostel" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🛏️ Hostel</NavLink>
          <NavLink to="/transport" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🚌 Transport</NavLink>
          
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>System</p>
          <NavLink to="/services" style={linkStyle} onClick={() => setIsMobileOpen(false)}>🛠️ Service Master</NavLink>
          <NavLink to="/system" style={linkStyle} onClick={() => setIsMobileOpen(false)}>⚙️ Config</NavLink>

        </nav>

        <div 
          onClick={handleLogout} 
          style={{ 
            color: "#ef4444", cursor: "pointer", padding: "16px", borderRadius: "16px", 
            display: "flex", alignItems: "center", gap: "12px", fontWeight: "700",
            background: "#fff1f2", border: "1px solid #fee2e2", marginTop: '30px'
          }}
        >
          🛰️ Terminate Session
        </div>
      </aside>
    </>
  );
};

export default SidebarModern;