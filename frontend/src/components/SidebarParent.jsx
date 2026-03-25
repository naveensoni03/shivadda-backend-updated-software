import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";

export default function SidebarParent() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const menuItems = [
        { name: "Dashboard Overview", path: "/parent/dashboard" },
        { name: "My Children Progress", path: "/parent/children" },
        { name: "Fees & Account Ledger", path: "/parent/fees" },
        { name: "Exam Results & Marks", path: "/parent/exams" },
        { name: "Communication / Mailbox", path: "/parent/messages" },
        { name: "Profile Settings", path: "/parent/settings" },
    ];

    return (
        <>
            <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`custom-sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="logo-icon">
                        <span style={{ color: "white", fontWeight: "900", fontSize: "1.2rem" }}>S</span>
                    </div>
                    <h2>SHIV ADDA</h2>
                </div>

                <div className="sidebar-menu">
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px', paddingLeft: '16px' }}>
                        Parent Panel
                    </p>
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="icon-wrapper" style={{ fontSize: '0.9rem', fontWeight: '800' }}>
                                {index + 1}.
                            </span>
                            <span className="menu-text">{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout Session</span>
                    </button>
                </div>
            </aside>

            <style>{`
                .custom-sidebar { width: 280px; height: 100vh; background: #ffffff; border-right: 1px solid #e2e8f0; position: fixed; top: 0; left: 0; display: flex; flex-direction: column; transition: transform 0.3s ease; z-index: 1000; font-family: 'Inter', sans-serif; }
                .sidebar-header { padding: 28px 24px; display: flex; align-items: center; gap: 14px; }
                .sidebar-header h2 { color: #1e293b; font-size: 1.25rem; font-weight: 900; letter-spacing: 0.5px; margin: 0; }
                .logo-icon { background: linear-gradient(135deg, #4f46e5, #3b82f6); width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2); }
                .sidebar-menu { flex: 1; padding: 10px 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
                .menu-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; text-decoration: none; color: #64748b; font-weight: 600; font-size: 0.95rem; transition: all 0.2s ease; }
                .icon-wrapper { display: flex; align-items: center; justify-content: center; min-width: 24px; color: #94a3b8; transition: color 0.2s ease; }
                .menu-item:hover { background: #f1f5f9; color: #334155; }
                .menu-item:hover .icon-wrapper { color: #4f46e5; }
                .menu-item.active { background: #eef2ff; color: #4f46e5; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.1); }
                .menu-item.active .icon-wrapper { color: #4f46e5; }
                .sidebar-footer { padding: 24px; border-top: 1px solid #f1f5f9; }
                .logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; background: #fff1f2; color: #ef4444; border: 1px solid #fee2e2; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
                .logout-btn:hover { background: #ef4444; color: white; }
                .mobile-toggle { display: none; position: fixed; top: 20px; left: 20px; z-index: 1001; background: #4f46e5; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
                @media (max-width: 900px) { .custom-sidebar { transform: translateX(-100%); } .custom-sidebar.open { transform: translateX(0); } .mobile-toggle { display: flex; } }
            `}</style>
        </>
    );
}