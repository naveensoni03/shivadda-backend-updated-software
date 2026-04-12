import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Clock, RefreshCcw, Key, LogIn } from "lucide-react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  // --- EXISTING STATES ---
  const [emailOrPhone, setEmailOrPhone] = useState(""); // 🚀 UPDATED: Email OR Phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW AUTHENTICATION STATES ---
  const [loginMode, setLoginMode] = useState("standard"); // "standard" or "limited"
  const [authStep, setAuthStep] = useState(1); // 1: ID/Pass/Captcha, 2: OTP
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [otp, setOtp] = useState("");
  const [tempIdCode, setTempIdCode] = useState("");

  // Generate random Captcha on load
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaCode(code);
  };

  // --- STEP 1: VERIFY CREDENTIALS, CAPTCHA & SEND OTP ---
  // ============================================================
  // OTP_MODE = false  → Direct login (Email + Password only)
  // OTP_MODE = true   → OTP flow (enable jab zaroorat ho)
  // ============================================================
  const OTP_MODE = false;

  const verifyStepOne = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailOrPhone || !password) return setError("Please enter your ID and password");
    if (captchaInput.toUpperCase() !== captchaCode) {
      generateCaptcha();
      setCaptchaInput("");
      return setError("Invalid Captcha! Please try again.");
    }

    setIsLoading(true);

    // ── DIRECT LOGIN (OTP disabled) ──────────────────────────
    if (!OTP_MODE) {
      try {
        const res = await api.post("auth/login/", { email: emailOrPhone, password });
        if (res.data?.access) {
          localStorage.setItem("access_token", res.data.access);
          localStorage.setItem("refresh_token", res.data.refresh);
          localStorage.setItem("access", res.data.access);
          localStorage.setItem("refresh", res.data.refresh);
          if (res.data.role)  localStorage.setItem("user_role", res.data.role);
          if (res.data.name)  localStorage.setItem("user_name", res.data.name);
          if (res.data.email) localStorage.setItem("user_email", res.data.email);
          localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: emailOrPhone, role: res.data.role }));

          toast.success("Welcome Back! 🚀");

          const role = (res.data.role || "").toLowerCase();
          setTimeout(() => {
            if (role === "student")       window.location.href = "/student/dashboard";
            else if (role === "teacher")  window.location.href = "/teacher/dashboard";
            else if (role === "parent")   window.location.href = "/parent/dashboard";
            else                          window.location.href = "/dashboard";
          }, 400);
        } else {
          setError("Invalid server response. Try again.");
          generateCaptcha();
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.response?.data?.error || "Invalid credentials.");
        generateCaptcha();
        setCaptchaInput("");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // ── OTP FLOW (OTP_MODE = true) ───────────────────────────
    try {
      const res = await api.post("auth/send-otp/", { email_or_phone: emailOrPhone, password: password });
      toast.success(res.data.message || "OTP sent securely.");
      setAuthStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid Credentials. Try again.");
      generateCaptcha();
      setCaptchaInput("");
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP & GET FINAL TOKEN ---
  const handleLogin = async (e) => {
    e.preventDefault();

    if (otp.length !== 4) return setError("Please enter a valid 4-digit OTP.");

    setIsLoading(true);
    setError("");

    try {
      // 🚀 Hit the Real Login API with Email/Phone and OTP
      const res = await api.post("auth/verify-otp/", { email_or_phone: emailOrPhone, otp: otp });
      if (res.data && res.data.access) {
        // 1. Save Tokens
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);

        // 2. Save User Details (Role, Name, Email)
        if (res.data.role) localStorage.setItem("user_role", res.data.role);
        else if (res.data.user_role) localStorage.setItem("user_role", res.data.user_role);
        else localStorage.setItem("user_role", "Admin"); // Failsafe if backend doesn't send role

        if (res.data.name) localStorage.setItem("user_name", res.data.name);
        if (res.data.email) localStorage.setItem("user_email", res.data.email);

        toast.success("Welcome Back! 🚀");

        // 🚀 FIXED: Removed navigate() and reload(). Using window.location.href for proper hard redirect.
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        setError("Invalid server response");
        generateCaptcha();
        setAuthStep(1); // Go back if server fails weirdly
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
      setOtp(""); // Clear OTP box
    } finally {
      setIsLoading(false);
    }
  };

  // --- LIMITED ACCESS LOGIN ---
  const handleLimitedLogin = (e) => {
    e.preventDefault();
    if (!tempIdCode) return setError("Please enter the Time-Limited Access Code.");
    toast.success("Temporary ID Authenticated. Access granted.");
    // Mock Redirect for Temp ID
    // navigate("/guest-dashboard");
  };

  return (
    <div className="login-bg" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '10px' } }} />

      <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#6366f1', filter: 'blur(100px)', opacity: 0.2, top: '10%', left: '10%' }}></div>
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#a855f7', filter: 'blur(100px)', opacity: 0.2, bottom: '10%', right: '10%' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="login-card"
        style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '420px', color: 'white' }}
      >
        {/* --- MODE SWITCHER TABS --- */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '12px' }}>
          <button
            type="button"
            onClick={() => { setLoginMode("standard"); setAuthStep(1); setError(""); }}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: loginMode === "standard" ? '#6366f1' : 'transparent', color: loginMode === "standard" ? 'white' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <ShieldCheck size={16} /> Master
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode("limited"); setError(""); }}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: loginMode === "limited" ? '#f59e0b' : 'transparent', color: loginMode === "limited" ? 'white' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Clock size={16} /> Trial ID
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {loginMode === "standard" ? (authStep === 1 ? "Welcome Back" : "Verification") : "Guest Access"}
          </h2>
          <p className="subtitle" style={{ color: '#94a3b8', marginBottom: '25px' }}>
            {loginMode === "standard" ? (authStep === 1 ? "Secure access to Shivadda CRM" : "Enter 4-digit OTP to continue") : "Enter temporary access code"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="error"
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* --- STANDARD LOGIN MODE --- */}
        {loginMode === "standard" && (
          <>
            {authStep === 1 ? (
              /* STEP 1: ID / PASS / CAPTCHA */
              <form onSubmit={verifyStepOne} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="input-container" style={{ position: 'relative' }}>
                  <Mail className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Email or Mobile Number"
                    required
                    autoComplete="username"
                    value={emailOrPhone}
                    onChange={e => setEmailOrPhone(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                  />
                </div>

                <div className="input-container" style={{ position: 'relative' }}>
                  <Lock className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                  />
                </div>

                {/* CAPTCHA SECTION */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="input-container" style={{ position: 'relative', flex: 1 }}>
                    <ShieldCheck className="input-icon" size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Captcha"
                      required
                      maxLength="5"
                      value={captchaInput}
                      onChange={e => setCaptchaInput(e.target.value)}
                      style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', textTransform: 'uppercase' }}
                    />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0 15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px', color: '#c7d2fe', fontWeight: 'bold', letterSpacing: '4px', userSelect: 'none' }}>
                    <del>{captchaCode}</del>
                    <button type="button" onClick={generateCaptcha} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex' }} title="Reload Captcha">
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : <>Continue <ArrowRight size={20} /></>}
                </button>
              </form>
            ) : (
              /* STEP 2: OTP VERIFICATION */
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="input-container" style={{ position: 'relative' }}>
                  <Key className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Enter 4-Digit OTP"
                    required
                    maxLength="4"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', letterSpacing: '4px', fontWeight: 'bold', textAlign: 'center' }}
                  />
                </div>

                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <>Sign In <ShieldCheck size={20} /></>
                  )}
                </button>
                <button type="button" onClick={() => setAuthStep(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', marginTop: '5px' }}>
                  ← Back to Login
                </button>
              </form>
            )}

            {authStep === 1 && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <a href="#" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                  Forgot Password?
                </a>
              </div>
            )}
          </>
        )}

        {/* --- TIME-LIMITED (GUEST) MODE --- */}
        {loginMode === "limited" && (
          <form onSubmit={handleLimitedLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="input-container" style={{ position: 'relative' }}>
              <LogIn className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Enter Temporary ID Code"
                required
                value={tempIdCode}
                onChange={e => setTempIdCode(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', textTransform: 'uppercase' }}
              />
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '10px', fontSize: '0.75rem', color: '#fcd34d', display: 'flex', gap: '8px', marginTop: '5px' }}>
              <Clock size={16} style={{ flexShrink: 0 }} />
              <span>Note: This session will automatically expire after the assigned time limit ends.</span>
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
              Access Portal <ArrowRight size={20} />
            </button>
          </form>
        )}

      </motion.div>
    </div>
  );
}