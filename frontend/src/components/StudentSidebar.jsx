import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, BookOpen, Calendar, FileText,
    User, LogOut, Menu, X, ClipboardList, Wallet, CreditCard, Lock
} from "lucide-react";
import api from "../api/axios";

export default function StudentSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [permissions, setPermissions] = useState({
        course_access: false,
        assignment_exam_access: false,
    });

    useEffect(() => {
        api.get("payments/my-permissions/")
            .then(res => setPermissions(res.data))
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/student/login");
    };

    // Normal nav button
    const NavButton = ({ icon: Icon, label, path }) => {
        const active = location.pathname.includes(path);
        return (
            <motion.button
                onClick={() => { navigate(path); setIsOpen(false); }}
                whileHover={{ x: 6, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: '13px',
                    background: active ? '#4f46e5' : 'transparent',
                    border: 'none', padding: '13px 16px', borderRadius: '14px',
                    fontSize: '0.97rem', fontWeight: '700',
                    color: active ? '#ffffff' : '#64748b',
                    cursor: 'pointer', transition: 'all 0.25s ease', width: '100%', textAlign: 'left',
                    boxShadow: active ? "0 8px 20px -5px rgba(79,70,229,0.45)" : "none"
                }}
            >
                <Icon size={21} /> {label}
            </motion.button>
        );
    };

    // Locked nav button — shows lock icon, redirects to dashboard to pay
    const LockedNavButton = ({ icon: Icon, label }) => (
        <motion.button
            onClick={() => { navigate("/student/dashboard"); setIsOpen(false); }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            title="Payment required — go to Dashboard to unlock"
            style={{
                display: 'flex', alignItems: 'center', gap: '13px',
                background: '#fafafa', border: '1.5px dashed #e2e8f0',
                padding: '13px 16px', borderRadius: '14px',
                fontSize: '0.97rem', fontWeight: '700',
                color: '#cbd5e1', cursor: 'pointer',
                transition: 'all 0.25s ease', width: '100%', textAlign: 'left',
                position: 'relative'
            }}
        >
            <Icon size={21} style={{ opacity: 0.4 }} />
            <span style={{ flex: 1, opacity: 0.5 }}>{label}</span>
            <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: '#fef3c7', color: '#d97706',
                fontSize: '0.68rem', fontWeight: '800', padding: '3px 7px',
                borderRadius: '20px', letterSpacing: '0.3px'
            }}>
                <Lock size={10} /> PAY
            </span>
        </motion.button>
    );

    return (
        <>
            <div className="mobile-top-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen size={24} color="#4f46e5" />
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>SHIV ADDA</h2>
                </div>
                <motion.button whileTap={{ scale: 0.8 }} className="menu-btn" onClick={() => setIsOpen(true)}>
                    <Menu size={26} color="#0f172a" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="mobile-overlay" onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <aside className={`student-sidebar glass-sidebar ${isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '12px' }}>
                            <BookOpen size={22} color="#ffffff" />
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>SHIV ADDA</h2>
                    </div>
                    <button className="close-sidebar-btn" onClick={() => setIsOpen(false)}>
                        <X size={24} color="#ef4444" />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {/* ✅ Always accessible */}
                    <NavButton icon={LayoutDashboard} label="Dashboard" path="/student/dashboard" />

                    {/* 🔒 Requires course_access payment */}
                    {permissions.course_access ? (
                        <>
                            <NavButton icon={BookOpen} label="My Courses" path="/student/courses" />
                            <NavButton icon={Calendar} label="Timetable" path="/student/timetable" />
                        </>
                    ) : (
                        <>
                            <LockedNavButton icon={BookOpen} label="My Courses" />
                            <LockedNavButton icon={Calendar} label="Timetable" />
                        </>
                    )}

                    {/* 🔒 Requires assignment_exam_access payment */}
                    {permissions.assignment_exam_access ? (
                        <>
                            <NavButton icon={ClipboardList} label="Assignments" path="/student/assignments" />
                            <NavButton icon={FileText} label="Exams & Results" path="/student/exams" />
                        </>
                    ) : (
                        <>
                            <LockedNavButton icon={ClipboardList} label="Assignments" />
                            <LockedNavButton icon={FileText} label="Exams & Results" />
                        </>
                    )}

                    {/* ✅ Always accessible */}
                    <NavButton icon={Wallet} label="My Fees" path="/student/fees" />
                    <NavButton icon={CreditCard} label="My Account" path="/student/account" />
                    <NavButton icon={User} label="Profile" path="/student/profile" />
                </nav>

                <div className="sidebar-footer">
                    <motion.button
                        className="logout-btn"
                        onClick={handleLogout}
                        whileHover={{ x: 6, backgroundColor: "#fee2e2" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut size={20} /> Logout
                    </motion.button>
                </div>
            </aside>

            <style jsx="true">{`
                .glass-sidebar {
                    width: 260px; display: flex; flex-direction: column;
                    padding: 22px 18px; z-index: 1000;
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(20px);
                    border-right: 1px solid rgba(226,232,240,0.8);
                    position: fixed; top: 0; bottom: 0; left: 0;
                    overflow-y: auto;
                    box-shadow: 4px 0 24px rgba(0,0,0,0.04);
                    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sidebar-brand { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
                .sidebar-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; padding-right: 2px; }
                .sidebar-nav::-webkit-scrollbar { width: 3px; }
                .sidebar-nav::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .sidebar-footer { margin-top: auto; padding-top: 18px; border-top: 1px dashed #e2e8f0; }
                .logout-btn { color: #ef4444; width: 100%; border: none; background: transparent; padding: 13px 16px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 12px; font-size: 0.97rem; }
                .mobile-top-header { display: none; }
                .close-sidebar-btn { display: none; background: none; border: none; cursor: pointer; padding: 5px; border-radius: 8px; }
                .mobile-overlay { display: none; }
                @media (max-width: 1024px) {
                    .glass-sidebar { transform: translateX(-100%); z-index: 1001; }
                    .glass-sidebar.mobile-open { transform: translateX(0); box-shadow: 20px 0 50px rgba(0,0,0,0.25); }
                    .close-sidebar-btn { display: flex; }
                    .mobile-top-header { display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; right: 0; height: 70px; background: rgba(255,255,255,0.97); backdrop-filter: blur(15px); padding: 0 22px; z-index: 900; border-bottom: 1px solid #f1f5f9; }
                    .menu-btn { background: #f1f5f9; border: none; cursor: pointer; padding: 10px; border-radius: 12px; display: flex; }
                    .mobile-overlay { display: block; position: fixed; inset: 0; background: rgba(15,23,42,0.55); z-index: 995; }
                }
            `}</style>
        </>
    );
}
