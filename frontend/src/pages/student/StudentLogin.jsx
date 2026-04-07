import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function StudentLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both Email and Password!");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                username: email,
                email: email,
                password: password
            };

            const res = await api.post("auth/login/", payload, {
                headers: { "Content-Type": "application/json" }
            });

            if (res.data && res.data.access) {
                let userRole = res.data.role || "Student";

                if (userRole === "Super Admin" || userRole === "Admin" || userRole === "Staff" || userRole === "Teacher") {
                    toast.error(`Access Denied! You are a ${userRole}. Redirecting to your portal...`);

                    setTimeout(() => {
                        if (userRole === "Teacher") {
                            navigate("/teacher/dashboard");
                        } else {
                            navigate("/dashboard");
                        }
                    }, 1500);
                    return;
                }

                // 🔥 STEP 1: Purana saara data clear karo
                sessionStorage.clear();
                localStorage.clear();

                // 🔥 STEP 2: Ab naya data strictly localStorage mein save karo (Taki loop na bane)
                localStorage.setItem("access_token", res.data.access);
                if (res.data.refresh) {
                    localStorage.setItem("refresh_token", res.data.refresh);
                }

                localStorage.setItem("user_role", userRole.trim());
                localStorage.setItem("user_email", res.data.email || email);
                localStorage.setItem("user_name", res.data.name || res.data.full_name || "Student");

                toast.success("Welcome to your Learning Portal! 🎓");

                // Dashboard par redirect
                setTimeout(() => {
                    navigate("/student/dashboard");
                }, 500);
            } else {
                toast.error("Invalid server response. Token missing.");
            }
        } catch (err) {
            console.log("BACKEND REJECT REASON:", err.response?.data);

            if (err.response?.status === 401) {
                if (err.response.data?.detail) {
                    toast.error(err.response.data.detail);
                } else {
                    toast.error("Incorrect email or password");
                }
            } else if (err.response?.status === 400) {
                const backendErrors = err.response?.data;
                let errorMsg = "Invalid login data format.";

                if (backendErrors && typeof backendErrors === "object") {
                    if (backendErrors.non_field_errors) {
                        errorMsg = backendErrors.non_field_errors[0];
                    } else {
                        const firstErrorKey = Object.keys(backendErrors)[0];
                        errorMsg = backendErrors[firstErrorKey];
                        if (Array.isArray(errorMsg)) errorMsg = errorMsg[0];
                    }
                }
                toast.error(`Login Failed: ${errorMsg}`);
            } else {
                toast.error("Server Error. Check your internet connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const leftPanelStyle = { flex: 1, background: "linear-gradient(135deg, #4f46e5, #3b82f6)", padding: "50px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" };
    const labelStyle = { display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "8px" };
    const inputContainerStyle = { display: "flex", alignItems: "center", background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", transition: "all 0.2s ease-in-out" };
    const inputStyle = { flex: 1, border: "none", background: "transparent", padding: "14px 15px", fontSize: "0.95rem", color: "#1e293b", outline: "none", fontWeight: "500" };

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#f8fafc" }}>
            <Toaster position="top-right" />

            <div className="login-left-panel" style={leftPanelStyle}>
                <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "white" }}>
                        <div style={{ background: "white", padding: "8px", borderRadius: "10px" }}>
                            <BookOpen size={24} color="#4f46e5" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", letterSpacing: "1px" }}>SHIV ADDA</h2>
                    </div>

                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{ fontSize: "3.5rem", fontWeight: "900", color: "white", lineHeight: "1.1", marginBottom: "20px" }}
                        >
                            Your Journey<br />to Excellence<br />Starts Here.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            style={{ color: "#e0e7ff", fontSize: "1.1rem", maxWidth: "80%", lineHeight: "1.6" }}
                        >
                            Join thousands of students achieving their dreams with our advanced E-Learning and Competition platform.
                        </motion.p>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                        © 2026 Shiv Adda Edu. All rights reserved.
                    </div>
                </div>

                <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%" }} />
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative" }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: "100%", maxWidth: "420px", background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}
                >
                    <div style={{ textAlign: "center", marginBottom: "35px" }}>
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>Welcome Student!</h2>
                        <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>Please enter your details to access your classes.</p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                            <label style={labelStyle}>Email Address / Login ID</label>
                            <div style={inputContainerStyle}>
                                <Mail size={18} color="#94a3b8" style={{ marginLeft: "15px" }} />
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={inputContainerStyle}>
                                <Lock size={18} color="#94a3b8" style={{ marginLeft: "15px" }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={inputStyle}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0 15px", display: "flex", alignItems: "center" }}
                                >
                                    {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", marginTop: "-5px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", cursor: "pointer" }}>
                                <input type="checkbox" style={{ accentColor: "#4f46e5", width: "16px", height: "16px", cursor: "pointer" }} />
                                Remember me
                            </label>
                            <span style={{ color: "#4f46e5", fontWeight: "600", cursor: "pointer" }}>Forgot Password?</span>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: "10px", height: "50px", background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                                color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "bold",
                                cursor: isLoading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px",
                                boxShadow: "0 10px 20px -10px rgba(99, 102, 241, 0.5)"
                            }}
                        >
                            {isLoading ? <Loader2 size={22} className="animate-spin" /> : <>Login to Portal <ArrowRight size={18} /></>}
                        </motion.button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "30px", fontSize: "0.9rem", color: "#64748b" }}>
                        Don't have an account? <span style={{ color: "#4f46e5", fontWeight: "bold", cursor: "pointer" }}>Register Now</span>
                    </div>
                </motion.div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } } @media (max-width: 900px) { .login-left-panel { display: none !important; } }` }} />
        </div>
    );
}