import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const SidebarModern = () => {
  const navigate = useNavigate();

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
    <aside style={{ 
      width: "280px", background: "#ffffff", height: "100vh", position: "fixed", 
      left: 0, top: 0, display: "flex", flexDirection: "column", padding: "35px 25px",
      borderRight: "1px solid #f1f5f9", zIndex: 1000, overflowY: "auto"
    }}>
      <div style={{ marginBottom: "40px", display: 'flex', alignItems: 'center', gap: '15px' }}>
         <div style={{ 
           width: '42px', height: '42px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
           borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
           boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)'
         }}>
           <span style={{color:'white', fontWeight: '900', fontSize: '1.4rem'}}>S</span>
         </div>
         <h2 style={{ color: "#0f172a", fontSize: "1.6rem", fontWeight: "900", letterSpacing: "-1px" }}>SHIVADDA</h2>
      </div>

      <nav style={{ flex: 1 }}>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1.5px', paddingLeft: '8px' }}>Super Controls</p>
        <NavLink to="/dashboard" style={linkStyle}>📊 Dashboard</NavLink>
        <NavLink to="/ai-brain" style={linkStyle}>🧠 AI Brain</NavLink> {/* ✅ MOVED HERE FOR BETTER VISIBILITY */}
        <NavLink to="/institutions" style={linkStyle}>🏢 Institutions</NavLink>
        <NavLink to="/locations" style={linkStyle}>🌍 Global Locations</NavLink>
        
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>Access & Logs</p>
        <NavLink to="/users" style={linkStyle}>👥 User Manager</NavLink>
        <NavLink to="/access-logs" style={linkStyle}>🔐 Audit Logs</NavLink>
        <NavLink to="/virtual-space" style={linkStyle}>📹 Virtual Space</NavLink> 

        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>School Ops</p>
        <NavLink to="/visitors" style={linkStyle}>🤝 Front Office</NavLink>
        <NavLink to="/admissions" style={linkStyle}>📝 Admissions</NavLink> 
        <NavLink to="/attendance" style={linkStyle}>📅 Attendance</NavLink>
        <NavLink to="/students" style={linkStyle}>🎓 Student Base</NavLink>
        <NavLink to="/teachers" style={linkStyle}>👨‍🏫 Teachers</NavLink>
        <NavLink to="/courses" style={linkStyle}>📚 Course Manager</NavLink>
        <NavLink to="/exams" style={linkStyle}>📝 Exams & AI</NavLink>

        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>Finance & Assets</p>
        <NavLink to="/fees" style={linkStyle}>💰 Fees Ledger</NavLink>
        <NavLink to="/payroll" style={linkStyle}>💸 Payroll & Salary</NavLink>
        <NavLink to="/inventory" style={linkStyle}>📦 Inventory</NavLink>
        <NavLink to="/timetable" style={linkStyle}>📅 Timetable & Routine</NavLink>
        <NavLink to="/communication" style={linkStyle}>📢 Communication</NavLink>

        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>Facilities</p>
        <NavLink to="/library" style={linkStyle}>📖 Library</NavLink>
        <NavLink to="/hostel" style={linkStyle}>🛏️ Hostel</NavLink>
        <NavLink to="/transport" style={linkStyle}>🚌 Transport</NavLink>
        
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', marginTop: '30px', letterSpacing: '1.5px', paddingLeft: '8px' }}>System</p>
        <NavLink to="/services" style={linkStyle}>🛠️ Service Master</NavLink>
        <NavLink to="/system" style={linkStyle}>⚙️ Config</NavLink>
      
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
  );
};

export default SidebarModern;