import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const SidebarModern = ({ forceOpen }) => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const rawRole = localStorage.getItem("role") || "ADMIN";
  const userRole = rawRole.replace(/['"]/g, "").trim().toUpperCase();

  useEffect(() => {
    if (forceOpen !== undefined) setIsMobileOpen(forceOpen);
  }, [forceOpen]);

  // 🚪 LOGOUT UTILITY ENGINE
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear all local and session credentials
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Logged out successfully! 👋");

      // Redirect to authentication layout
      navigate("/login");
    }
  };

  const linkStyle = ({ isActive }) => ({
    padding: "10px 14px",
    borderRadius: "10px",
    color: isActive ? "#4f46e5" : "#64748b",
    textDecoration: "none",
    background: isActive ? "#eef2ff" : "transparent",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
    fontSize: "0.9rem",
    fontWeight: isActive ? "700" : "500",
    transition: "all 0.2s",
  });

  const sectionHeaderStyle = {
    color: '#94a3b8', fontSize: '0.7rem', fontWeight: '800',
    textTransform: 'uppercase', marginTop: '20px', marginBottom: '8px',
    paddingLeft: '10px', letterSpacing: '1px'
  };

  return (
    <aside className={`custom-sidebar ${isMobileOpen ? "open" : ""}`} style={{
      width: "280px", background: "#ffffff", height: "100vh", position: "fixed",
      padding: "20px", borderRight: "1px solid #f1f5f9", zIndex: 1000, overflowY: "auto",
      display: "flex", flexDirection: "column", justifyContent: "space-between"
    }}>
      <div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "900", margin: "0 0 20px 10px", color: "#0f172a" }}>
          SHIVADDA
        </h2>

        <nav>
          {/* 🏠 MAIN CONSOLE CONTROL */}
          <p style={sectionHeaderStyle}>Main Console</p>
          <NavLink to="/dashboard" style={linkStyle}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          {/* 1. PLACES */}
          <p style={sectionHeaderStyle}>1. PLACES</p>
          <NavLink to="/superadmin/master-data" style={linkStyle}>Master Data</NavLink>
          <NavLink to="/ai-brain" style={linkStyle}>AI Brain</NavLink>
          <NavLink to="/institutions" style={linkStyle}>Institutions</NavLink>
          <NavLink to="/locations" style={linkStyle}>Global Locations</NavLink>

          {/* 2. SERVICES */}
          <p style={sectionHeaderStyle}>2. SERVICES</p>
          <NavLink to="/service-types" style={linkStyle}>Types of Services</NavLink>
          <NavLink to="/services" style={linkStyle}>Services Master</NavLink>
          <NavLink to="/attendance" style={linkStyle}>Attendance</NavLink>
          <NavLink to="/students" style={linkStyle}>Student Base</NavLink>
          <NavLink to="/teachers" style={linkStyle}>Teachers</NavLink>
          <NavLink to="/courses" style={linkStyle}>Course Manager</NavLink>
          <NavLink to="/exams" style={linkStyle}>Exams & AI</NavLink>
          <NavLink to="/homework" style={linkStyle}>Homework & Tasks</NavLink>
          <NavLink to="/visitors" style={linkStyle}>Front Office</NavLink>

          {/* 3. USERS MANAGEMENT */}
          <p style={sectionHeaderStyle}>3. USERS MANAGEMENT</p>
          <NavLink to="/users" style={linkStyle}>Academic Users</NavLink>
          <NavLink to="/access-logs" style={linkStyle}>Unacademic Users</NavLink>
          <NavLink to="/virtual-space" style={linkStyle}>Virtual Space</NavLink>

          {/* 10. ACCOUNTS MANAGEMENT */}
          <p style={sectionHeaderStyle}>10. ACCOUNTS MANAGEMENT</p>
          <NavLink to="/fees" style={linkStyle}>Fees Ledger</NavLink>
          <NavLink to="/payroll" style={linkStyle}>Payroll & Salary</NavLink>
          <NavLink to="/service-catalog" style={linkStyle}>Service Catalog</NavLink>
          <NavLink to="/payment-accounts" style={linkStyle}>Payment Accounts</NavLink>
          <NavLink to="/teacher-salary" style={linkStyle}>Teacher Salary</NavLink>
          <NavLink to="/inventory" style={linkStyle}>Inventory</NavLink>
          <NavLink to="/timetable" style={linkStyle}>Timetable</NavLink>
          <NavLink to="/communication" style={linkStyle}>Communication</NavLink>

          {/* 11. UNACADEMIC SERVICES */}
          <p style={sectionHeaderStyle}>11. UNACADEMIC SERVICES</p>
          <NavLink to="/library" style={linkStyle}>Library</NavLink>
          <NavLink to="/hostel" style={linkStyle}>Hostel</NavLink>
          <NavLink to="/transport" style={linkStyle}>Transport</NavLink>
        </nav>
      </div>

      {/* 🛑 SECURE LOGOUT ANCHOR INTERRUPT */}
      <div style={{ marginTop: "30px", paddingTop: "15px", borderTop: "1px solid #f1f5f9" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: "10px", background: "none",
            border: "none", color: "#ef4444", display: "flex", alignItems: "center",
            gap: "10px", fontSize: "0.9rem", fontWeight: "700", cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          <LogOut size={18} /> Logout Session
        </button>
      </div>
    </aside>
  );
};

export default SidebarModern;