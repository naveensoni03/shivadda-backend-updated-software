import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, BookOpen, ArrowRight, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";

export default function TeacherLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            return toast.error("Please enter both email and password!");
        }

        setLoading(true);
        const loadingToast = toast.loading("Verifying credentials...");

        try {
            const response = await api.post("auth/login/", {
                email: email.toLowerCase().trim(),
                password: password.trim()
            });

            if (response.data && response.data.access) {
                const { access, refresh, role, user_role, name, user_id } = response.data;

                // 🚀 THE FIX: Agar backend se role na aaye, par login successful ho jaye, 
                // toh use by default "Teacher" maan lo (kyunki ye teacher login page hi hai).
                let actualRole = (role || user_role || "").toLowerCase().trim();

                // Agar actualRole khali hai, toh hum forcefully usko "teacher" set kar rahe hain.
                if (!actualRole) {
                    actualRole = "teacher";
                }

                if (actualRole !== "teacher" && actualRole !== "super admin") {
                    toast.error(`Access Denied! Your role is '${actualRole}'. Only Teachers can login here.`, { id: loadingToast });
                    setLoading(false);
                    return;
                }

                localStorage.setItem("access_token", access);
                localStorage.setItem("refresh_token", refresh);
                // Force save as Teacher if missing
                localStorage.setItem("user_role", role || user_role || "Teacher");
                localStorage.setItem("user_name", name || "Instructor");
                if (user_id) localStorage.setItem("user_id", user_id);

                toast.success(`Welcome back, ${name || "Instructor"}!`, { id: loadingToast });

                setTimeout(() => {
                    navigate("/teacher/dashboard");
                }, 1000);
            } else {
                toast.error("Invalid server response", { id: loadingToast });
            }

        } catch (err) {
            console.error("Login Error:", err);

            if (err.response?.status === 401) {
                toast.error("Incorrect email or password!", { id: loadingToast });
            } else if (err.response?.status === 400) {
                toast.error("Data error! Check if account is active.", { id: loadingToast });
                console.log("Payload error: ", err.response?.data);
            } else {
                const errMsg = err.response?.data?.error || err.response?.data?.detail || "Server Error. Please try again.";
                toast.error(errMsg, { id: loadingToast });
            }
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
    };

    return (
        <div className="split-login-container">
            <Toaster position="top-right" />

            <div className="login-left-panel">
                <motion.div className="bg-shape shape-1" animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="bg-shape shape-2" animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="bg-shape shape-3" animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />

                <motion.div className="brand-logo" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                    <div className="logo-icon-box">
                        <BookOpen size={24} color="#4f46e5" />
                    </div>
                    <span>SHIV ADDA</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="left-content">
                    <h1>Empower Minds,<br />Shape the Future.</h1>
                    <p>Join Shiv Adda's elite faculty and manage your digital classroom with our advanced E-Learning platform.</p>
                </motion.div>

                <div className="footer-copyright">
                    © 2026 Shiv Adda Edu. All rights reserved.
                </div>
            </div>

            <div className="login-right-panel">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: "spring" }} className="login-card">
                    <div className="form-header">
                        <h2>Welcome Instructor! 👋</h2>
                        <p>Please enter your details to access your dashboard.</p>
                    </div>

                    <motion.form onSubmit={handleLogin} className="login-form" variants={containerVariants} initial="hidden" animate="show">
                        <motion.div className="input-group" variants={itemVariants}>
                            <label>Email Address / Login ID</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </motion.div>

                        <motion.div className="input-group" variants={itemVariants}>
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div className="form-options" variants={itemVariants}>
                            <label className="remember-me">
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                <span>Remember me</span>
                            </label>
                            <button type="button" className="forgot-link" onClick={() => toast("Please contact Admin to reset your password.")}>
                                Forgot Password?
                            </button>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <motion.button whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} type="submit" className="primary-submit-btn" disabled={loading}>
                                {loading ? (
                                    <><Loader2 className="spinner" size={18} /> Verifying...</>
                                ) : (
                                    <>Login to Portal <ArrowRight size={18} /></>
                                )}
                            </motion.button>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </div>

            <style>{`
                .split-login-container { display: flex; height: 100vh; width: 100%; font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; }
                .login-left-panel { flex: 1.1; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 50px 70px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
                .bg-shape { position: absolute; border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%); z-index: 1; }
                .shape-1 { width: 300px; height: 300px; top: -50px; left: -100px; }
                .shape-2 { width: 400px; height: 400px; bottom: -100px; right: -150px; }
                .shape-3 { width: 200px; height: 200px; top: 40%; right: 10%; background: rgba(255,255,255,0.05); }
                .brand-logo, .left-content, .footer-copyright { z-index: 10; position: relative; }
                .brand-logo { display: flex; align-items: center; gap: 12px; font-size: 1.5rem; font-weight: 800; letter-spacing: 1px; }
                .logo-icon-box { background: white; padding: 10px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .left-content { margin-top: -5vh; }
                .left-content h1 { font-size: 3.8rem; font-weight: 800; line-height: 1.1; margin-bottom: 24px; text-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .left-content p { font-size: 1.15rem; line-height: 1.7; opacity: 0.9; max-width: 85%; font-weight: 300; }
                .footer-copyright { font-size: 0.9rem; opacity: 0.7; }
                .login-right-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; background: #f8fafc; }
                .login-card { background: white; width: 100%; max-width: 440px; padding: 50px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); }
                .form-header { text-align: center; margin-bottom: 35px; }
                .form-header h2 { margin: 0 0 10px 0; color: #0f172a; font-size: 1.8rem; font-weight: 800; }
                .form-header p { margin: 0; color: #64748b; font-size: 0.95rem; }
                .login-form { display: flex; flex-direction: column; gap: 20px; }
                .input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 8px; }
                .input-wrapper { position: relative; display: flex; align-items: center; }
                .input-icon { position: absolute; left: 14px; color: #94a3b8; transition: color 0.3s ease; }
                .input-wrapper input { width: 100%; padding: 14px 40px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; color: #0f172a; background: #f8fafc; transition: all 0.3s ease; outline: none; }
                .input-wrapper input:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                .input-wrapper input:focus ~ .input-icon { color: #4f46e5; }
                .toggle-password { position: absolute; right: 14px; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0; display: flex; transition: 0.2s; }
                .toggle-password:hover { color: #4f46e5; }
                .form-options { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
                .remember-me { display: flex; align-items: center; gap: 8px; color: #475569; cursor: pointer; font-weight: 500; }
                .remember-me input { width: 16px; height: 16px; accent-color: #4f46e5; cursor: pointer; }
                .forgot-link { background: none; border: none; color: #4f46e5; font-weight: 600; cursor: pointer; padding: 0; }
                .forgot-link:hover { text-decoration: underline; }
                .primary-submit-btn { width: 100%; padding: 14px; background: #4f46e5; color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.3s ease; margin-top: 5px; }
                .primary-submit-btn:hover:not(:disabled) { background: #4338ca; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
                .primary-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                
                /* ✅ 100% FIXED FOR MOBILE KEYBOARD OVERFLOW */
                @media (max-width: 900px) {
                    .split-login-container { 
                        flex-direction: column; 
                        height: 100%; 
                        min-height: 100vh;
                        overflow-y: auto; 
                    }
                    .login-left-panel { 
                        flex: none; 
                        padding: 30px 20px; 
                        border-bottom-left-radius: 30px; 
                        border-bottom-right-radius: 30px; 
                    }
                    .left-content { margin-top: 15px; }
                    .left-content h1 { font-size: 2rem; margin-bottom: 10px; }
                    .left-content p { font-size: 1rem; max-width: 100%; }
                    .footer-copyright { display: none; }
                    
                    .login-right-panel { 
                        background: #f8fafc; 
                        padding: 20px 15px; 
                        align-items: flex-start; 
                    }
                    .login-card { 
                        box-shadow: none; 
                        background: transparent; 
                        padding: 10px; 
                        max-width: 100%;
                    }
                    .form-header h2 { font-size: 1.5rem; }
                    .login-form { gap: 15px; }
                    .primary-submit-btn { margin-bottom: 20px; } 
                }
            `}</style>
        </div>
    );
}