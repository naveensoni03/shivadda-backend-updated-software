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
                    style={{ width: "100%", maxWidth: "420px", background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}
                >
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#4f46e5,#3b82f6)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <BookOpen size={28} color="white" />
                        </div>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" }}>Welcome Student!</h2>
                        <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>Sign in to access your classes.</p>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        {/* Email Field */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Email Address
                            </label>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <Mail size={17} color="#9ca3af" style={{ position: "absolute", left: 14, pointerEvents: "none", zIndex: 1 }} />
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="sld-input"
                                    style={{ width: "100%", padding: "13px 14px 13px 42px", border: "1.5px solid #e5e7eb", borderRadius: "12px", fontSize: "0.95rem", color: "#111827", background: "white", outline: "none", fontWeight: "500", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" }}
                                    onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)"; }}
                                    onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Password
                            </label>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <Lock size={17} color="#9ca3af" style={{ position: "absolute", left: 14, pointerEvents: "none", zIndex: 1 }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    style={{ width: "100%", padding: "13px 44px 13px 42px", border: "1.5px solid #e5e7eb", borderRadius: "12px", fontSize: "0.95rem", color: "#111827", background: "white", outline: "none", fontWeight: "500", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" }}
                                    onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)"; }}
                                    onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: 14, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#9ca3af" }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember + Forgot */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", cursor: "pointer", fontWeight: "500" }}>
                                <input type="checkbox" style={{ accentColor: "#4f46e5", width: "15px", height: "15px", cursor: "pointer" }} />
                                Remember me
                            </label>
                            <span style={{ color: "#4f46e5", fontWeight: "600", cursor: "pointer" }}>Forgot Password?</span>
                        </div>

                        {/* Submit */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: "4px", height: "52px",
                                background: isLoading ? "#a5b4fc" : "linear-gradient(135deg, #4f46e5, #3b82f6)",
                                color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "700",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                display: "flex", justifyContent: "center", alignItems: "center", gap: "10px",
                                boxShadow: "0 4px 15px rgba(79,70,229,0.35)", transition: "all 0.2s"
                            }}
                        >
                            {isLoading ? <Loader2 size={22} className="animate-spin" /> : <>Login to Portal <ArrowRight size={18} /></>}
                        </motion.button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "#64748b" }}>
                        Don't have an account? <span style={{ color: "#4f46e5", fontWeight: "700", cursor: "pointer" }}>Register Now</span>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0px 1000px white inset !important;
                    -webkit-text-fill-color: #111827 !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                @media (max-width: 900px) { .login-left-panel { display: none !important; } }
            `}} />
        </div>
    );
}