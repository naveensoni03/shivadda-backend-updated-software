import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react"; // Sirf zaroori UI icons rakhe hain

export default function SidebarTeacher() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/teacher/login");
    };

    // Icons hata diye gaye hain
    const menuItems = [
        { name: "Dashboard", path: "/teacher/dashboard" },
        { name: "My Classes", path: "/teacher/classes" },
        { name: "Study Material", path: "/teacher/material" },
        { name: "Assignments", path: "/teacher/assignments" },
        { name: "Exams & Quizzes", path: "/teacher/exams" },
        { name: "My Students", path: "/teacher/students" },
        { name: "Mailbox/Chat", path: "/teacher/messages" },
        { name: "Wallet & Earnings", path: "/teacher/wallet" },
        { name: "Settings", path: "/teacher/settings" },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside className={`teacher-sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="logo-icon">
                        <span style={{ color: "white", fontWeight: "900", fontSize: "1.2rem" }}>S</span>
                    </div>
                    <h2>SHIV ADDA</h2>
                </div>

                <div className="sidebar-menu">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                            onClick={() => setIsOpen(false)} // Close on mobile after click
                        >
                            {/* Serial Number logic added here */}
                            <span className="icon-wrapper" style={{ fontSize: '0.9rem', fontWeight: '800' }}>
                                {index + 1}.
                            </span>
                            <span className="menu-text">{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        {/* Logout button ka icon chhod diya hai, chahein toh ise bhi hata sakte hain */}
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* INJECTED PREMIUM CSS */}
            <style>{`
                /* Sidebar Layout */
                .teacher-sidebar {
                    width: 280px;
                    height: 100vh;
                    background: #ffffff; /* Light Theme matching Dashboard */
                    border-right: 1px solid #e2e8f0; /* Soft border */
                    position: fixed;
                    top: 0;
                    left: 0;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s ease;
                    z-index: 1000;
                    font-family: 'Inter', system-ui, sans-serif;
                }

                /* Header Area */
                .sidebar-header {
                    padding: 28px 24px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .sidebar-header h2 {
                    color: #1e293b;
                    font-size: 1.25rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    margin: 0;
                }

                .logo-icon {
                    background: linear-gradient(135deg, #4f46e5, #3b82f6);
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
                }

                /* Menu Area */
                .sidebar-menu {
                    flex: 1;
                    padding: 10px 16px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                /* Custom Scrollbar for Menu */
                .sidebar-menu::-webkit-scrollbar { width: 4px; }
                .sidebar-menu::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

                /* Menu Items */
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                }

                .icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    color: #94a3b8;
                    transition: color 0.2s ease;
                }

                .menu-text {
                    letter-spacing: 0.2px;
                }

                /* Hover State */
                .menu-item:hover {
                    background: #f1f5f9;
                    color: #334155;
                }
                
                .menu-item:hover .icon-wrapper {
                    color: #4f46e5;
                }

                /* Active State */
                .menu-item.active {
                    background: #eef2ff; /* Very light indigo background */
                    color: #4f46e5; /* Indigo text */
                }

                .menu-item.active .icon-wrapper {
                    color: #4f46e5; /* Indigo number */
                }

                /* Footer Area */
                .sidebar-footer {
                    padding: 24px;
                    border-top: 1px solid #f1f5f9;
                }

                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 12px;
                    background: white;
                    color: #ef4444;
                    border: 1px solid #fee2e2;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .logout-btn:hover {
                    background: #fef2f2;
                    border-color: #fca5a5;
                }

                /* Mobile Toggle */
                .mobile-toggle {
                    display: none;
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 1001;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }

                /* Responsive Adjustments */
                @media (max-width: 900px) {
                    .teacher-sidebar {
                        transform: translateX(-100%);
                        box-shadow: 10px 0 30px rgba(0,0,0,0.1);
                    }
                    .teacher-sidebar.open {
                        transform: translateX(0);
                    }
                    .mobile-toggle {
                        display: flex;
                    }
                }
            `}</style>
        </>
    );
}