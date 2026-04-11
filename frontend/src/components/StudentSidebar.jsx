import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, BookOpen, Calendar, FileText,
    User, LogOut, Menu, X, ClipboardList, Wallet, CreditCard
} from "lucide-react";

export default function StudentSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/student/login");
    };

    const NavButton = ({ icon: Icon, label, path }) => {
        const active = location.pathname.includes(path);
        return (
            <motion.button
                onClick={() => {
                    navigate(path);
                    setIsOpen(false);
                }}
                whileHover={{ x: 8, backgroundColor: active ? '#4f46e5' : '#f8fafc', scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: '15px',
                    background: active ? '#4f46e5' : 'transparent', // 🔥 FIX: Hardcoded Primary Color
                    border: 'none', padding: '14px 18px', borderRadius: '16px', fontSize: '1.05rem', fontWeight: '700',
                    color: active ? '#ffffff' : '#64748b', // 🔥 FIX: Dark Gray color instead of variable
                    cursor: 'pointer', transition: 'all 0.3s ease', width: '100%', textAlign: 'left',
                    boxShadow: active ? "0 10px 20px -5px rgba(79,70,229,0.5)" : "none"
                }}
            >
                <Icon size={24} /> {label}
            </motion.button>
        );
    };

    return (
        <>
            <div className="mobile-top-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                        <BookOpen size={24} color="#4f46e5" />
                    </motion.div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>SHIV ADDA</h2>
                </div>
                <motion.button whileTap={{ scale: 0.8 }} className="menu-btn" onClick={() => setIsOpen(true)}>
                    <Menu size={26} color="#0f172a" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(5px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="mobile-overlay"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <aside className={`student-sidebar glass-sidebar ${isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <motion.div className="brand-icon" animate={{ boxShadow: ["0px 0px 0px rgba(79,70,229,0)", "0px 0px 15px rgba(79,70,229,0.6)", "0px 0px 0px rgba(79,70,229,0)"] }} transition={{ duration: 2, repeat: Infinity }}>
                            <BookOpen size={24} color="#ffffff" style={{ background: '#4f46e5', padding: '6px', borderRadius: '10px', width: '36px', height: '36px' }} />
                        </motion.div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>SHIV ADDA</h2>
                    </div>
                    <button className="close-sidebar-btn" onClick={() => setIsOpen(false)}>
                        <X size={26} color="#ef4444" />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <NavButton icon={LayoutDashboard} label="Dashboard" path="/student/dashboard" />
                    <NavButton icon={BookOpen} label="My Courses" path="/student/courses" />
                    <NavButton icon={Calendar} label="Timetable" path="/student/timetable" />
                    <NavButton icon={ClipboardList} label="Assignments" path="/student/assignments" />
                    <NavButton icon={FileText} label="Exams & Results" path="/student/exams" />
                    <NavButton icon={Wallet} label="My Fees" path="/student/fees" />
                    <NavButton icon={CreditCard} label="My Account" path="/student/account" />
                    <NavButton icon={User} label="Profile" path="/student/profile" />
                </nav>

                <div className="sidebar-footer">
                    <motion.button
                        className="nav-item logout-btn"
                        onClick={handleLogout}
                        whileHover={{ x: 8, scale: 1.02, backgroundColor: "#fee2e2" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut size={20} /> Logout
                    </motion.button>
                </div>
            </aside>

            <style jsx="true">{`
                .glass-sidebar { 
                    backdrop-filter: blur(20px); 
                    border-right: 1px solid rgba(255, 255, 255, 0.9); 
                    width: 280px; 
                    display: flex; 
                    flex-direction: column; 
                    padding: 25px; 
                    z-index: 1000; 
                    background: rgba(255,255,255,0.85); 
                    position: fixed; 
                    top: 0; bottom: 0; left: 0; 
                    overflow-y: auto; 
                    box-shadow: 5px 0 30px rgba(0,0,0,0.02); 
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sidebar-brand { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
                .sidebar-nav { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 5px;}
                .sidebar-nav::-webkit-scrollbar { width: 4px; }
                .sidebar-nav::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .sidebar-footer { margin-top: auto; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
                .logout-btn { color: #ef4444; width: 100%; border: none; background: transparent; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; text-align: left; }
                .mobile-top-header { display: none; }
                .close-sidebar-btn { display: none; background: none; border: none; cursor: pointer; align-items: center; justify-content: center; padding: 5px; border-radius: 8px;}
                .close-sidebar-btn:hover { background: #fee2e2; }
                .mobile-overlay { display: none; }

                @media (max-width: 1024px) {
                    .glass-sidebar { transform: translateX(-100%); z-index: 1001; box-shadow: none; }
                    .glass-sidebar.mobile-open { transform: translateX(0); box-shadow: 20px 0 50px rgba(0,0,0,0.3); }
                    .close-sidebar-btn { display: flex; }
                    .mobile-top-header { 
                        display: flex; justify-content: space-between; align-items: center; 
                        position: fixed; top: 0; left: 0; right: 0; height: 75px; 
                        background: rgba(255,255,255,0.95); backdrop-filter: blur(15px); 
                        padding: 0 25px; z-index: 900; border-bottom: 1px solid rgba(0,0,0,0.05); 
                        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    }
                    .menu-btn { background: #f1f5f9; border: none; cursor: pointer; padding: 10px; border-radius: 12px; display: flex;}
                    .mobile-overlay { display: block; position: fixed; inset: 0; background: rgba(15,23,42,0.6); z-index: 995; }
                }
                @media (max-width: 480px) { .glass-sidebar { width: 260px; padding: 20px; } }
            `}</style>
        </>
    );
}