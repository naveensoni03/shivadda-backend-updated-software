import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const SidebarModern = ({ forceOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const rawRole = localStorage.getItem("role") || "ADMIN";
  const userRole = rawRole.replace(/['"]/g, "").trim().toUpperCase();

  // 🎨 THEME COLOR MAPPING - Matches feature colors
  const FEATURE_COLORS = {
    // 0. HOME & ABOUT
    '/dashboard': { bg: '#6366F1', text: '#ffffff' },
    '/home': { bg: '#6366F1', text: '#ffffff' },
    
    // 1. PLACES
    '/superadmin/master-data': { bg: '#8B5CF6', text: '#ffffff' },
    '/ai-brain': { bg: '#8B5CF6', text: '#ffffff' },
    '/institutions': { bg: '#8B5CF6', text: '#ffffff' },
    '/locations': { bg: '#8B5CF6', text: '#ffffff' },
    
    // 2. SERVICES
    '/service-types': { bg: '#06B6D4', text: '#ffffff' },
    '/services': { bg: '#06B6D4', text: '#ffffff' },
    '/attendance': { bg: '#06B6D4', text: '#ffffff' },
    '/students': { bg: '#06B6D4', text: '#ffffff' },
    '/teachers': { bg: '#06B6D4', text: '#ffffff' },
    '/courses': { bg: '#06B6D4', text: '#ffffff' },
    '/exams': { bg: '#06B6D4', text: '#ffffff' },
    '/homework': { bg: '#06B6D4', text: '#ffffff' },
    '/visitors': { bg: '#06B6D4', text: '#ffffff' },
    
    // 3. USERS MANAGEMENT
    '/users': { bg: '#10B981', text: '#ffffff' },
    '/access-logs': { bg: '#10B981', text: '#ffffff' },
    '/virtual-space': { bg: '#10B981', text: '#ffffff' },
    
    // 10. ACCOUNTS MANAGEMENT
    '/fees': { bg: '#F59E0B', text: '#ffffff' },
    '/payroll': { bg: '#F59E0B', text: '#ffffff' },
    '/service-catalog': { bg: '#F59E0B', text: '#ffffff' },
    '/payment-accounts': { bg: '#F59E0B', text: '#ffffff' },
    '/teacher-salary': { bg: '#F59E0B', text: '#ffffff' },
    '/inventory': { bg: '#F59E0B', text: '#ffffff' },
    '/timetable': { bg: '#F59E0B', text: '#ffffff' },
    '/communication': { bg: '#F59E0B', text: '#ffffff' },
    
    // 11. UNACADEMIC SERVICES
    '/library': { bg: '#EC4899', text: '#ffffff' },
    '/hostel': { bg: '#EC4899', text: '#ffffff' },
    '/transport': { bg: '#EC4899', text: '#ffffff' },
  };

  // Get color for current route
  const getHeaderColor = () => {
    const currentPath = location.pathname;
    return FEATURE_COLORS[currentPath] || { bg: '#6366F1', text: '#ffffff' };
  };

  const headerColor = getHeaderColor();

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
    <>
      {/* 📱 MOBILE MENU BUTTON - Shows only on small screens */}
      <div className="mobile-header" style={{
        position: "fixed", top: 0, left: 0, right: 0,
        background: headerColor.bg, padding: "15px 20px", zIndex: 999,
        borderBottom: `2px solid ${headerColor.bg}`, alignItems: "center",
        justifyContent: "space-between", transition: "background 0.3s ease"
      }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "900", margin: 0, color: headerColor.text }}>
          SHIVADDA
        </h2>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 0, display: "flex", alignItems: "center"
          }}
        >
          {isMobileOpen ? <X size={24} color={headerColor.text} /> : <Menu size={24} color={headerColor.text} />}
        </button>
      </div>

      {/* 🔲 MOBILE OVERLAY - Click to close menu */}
      {isMobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🎯 MAIN SIDEBAR */}
      <aside className={`custom-sidebar ${isMobileOpen ? "open" : ""}`} style={{
        width: "280px", background: "#ffffff", height: "100vh", position: "fixed",
        padding: "20px", borderRight: "1px solid #f1f5f9", zIndex: 1000, overflowY: "auto",
        display: "flex", flexDirection: "column", justifyContent: "space-between"
      }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "900", margin: 0, color: "#0f172a" }}>
            SHIVADDA
          </h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="mobile-close-btn"
            style={{
              background: "#f1f5f9", border: "none",
              padding: "8px", borderRadius: "10px", cursor: "pointer"
            }}
          >
            <X size={20} color="#0f172a" />
          </button>
        </div>

        <nav>
          {/* 🏠 HOME & ABOUT SECTION */}
          <p style={sectionHeaderStyle}>0. HOME & ABOUT</p>
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
    </>
  );
};

export default SidebarModern;