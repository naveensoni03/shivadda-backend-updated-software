import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    padding: "10px 12px",
    borderRadius: "6px",
    color: "#fff",
    textDecoration: "none",
    background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
    display: "block",
    marginBottom: "6px",
    cursor: "pointer",
    fontSize: "0.95rem"
  });

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside style={{
      width: "240px",
      background: "#0d6efd",
      color: "#fff",
      padding: "20px",
      minHeight: "100vh",
      position: "sticky",
      top: 0
    }}>
      <h3 style={{ marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "10px" }}>
        Shivadda CRM
      </h3>

      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/agents" style={linkStyle}>Agents Management</NavLink>
      <NavLink to="/students" style={linkStyle}>Students List</NavLink>
      <NavLink to="/courses" style={linkStyle}>Courses & Fee Plans</NavLink>
      <NavLink to="/enrollments" style={linkStyle}>Enrollments</NavLink>
      <NavLink to="/attendance-report" style={linkStyle}>Attendance Analytics</NavLink>
      
      {/* Naye Links (Academic & Finance) */}
      <NavLink to="/homework" style={linkStyle}>Homework & Assignments</NavLink>
      <NavLink to="/finance" style={linkStyle}>My Fees & Ledger</NavLink>
      
      <NavLink to="/exams" style={linkStyle}>Online Exams</NavLink>
      <NavLink to="/parent-portal" style={linkStyle}>Parent Portal</NavLink>

      <div
        onClick={logout}
        style={{
          marginTop: "40px",
          padding: "10px 12px",
          cursor: "pointer",
          background: "rgba(220, 53, 69, 0.8)",
          borderRadius: "6px",
          textAlign: "center",
          fontWeight: "bold"
        }}
      >
        Logout
      </div>
    </aside>
  );
};

export default Sidebar;