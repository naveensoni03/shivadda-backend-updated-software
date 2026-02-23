import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Loader2, ArrowRight, ShieldCheck, KeyRound, Smartphone, MessageSquare } from "lucide-react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import "./login.css"; 

export default function Login() {
  const navigate = useNavigate();
  
  // View State: 'login' | 'request_otp' | 'verify_otp' | 'set_new_password'
  const [currentView, setCurrentView] = useState("login");

  // Login States
  const [identifier, setIdentifier] = useState(""); // Email OR Phone
  const [password, setPassword] = useState("");
  
  // Forgot Password States
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // UI States
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ----------------------------------------
  // 1. STANDARD LOGIN (Email or Phone)
  // ----------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Backend ko identifier (email ya phone) aur password bhej rahe hain
      const res = await api.post("api/auth/login/", { identifier, password });
      
      if (res.data && res.data.access) {
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        
        if (res.data.role) localStorage.setItem("user_role", res.data.role);
        if (res.data.full_name) localStorage.setItem("user_name", res.data.full_name);
        
        toast.success(`Welcome Back, ${res.data.full_name || 'User'}! 🚀`);

        setTimeout(() => {
            navigate("/dashboard");
            window.location.reload();
        }, 800);
      } else {
        setError("Invalid server response");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Incorrect Email/Phone or Password");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // 2. REQUEST OTP (Forgot Password)
  // ----------------------------------------
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!resetIdentifier) return setError("Please enter Email or Phone Number");

    setIsLoading(true);
    setError("");

    try {
      // Backend Endpoint Call setup
      // await api.post("api/auth/request-otp/", { identifier: resetIdentifier });
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // UI Simulation
      
      toast.success("OTP sent successfully! 📲");
      setCurrentView("verify_otp"); // Move to OTP screen
    } catch (err) {
      setError("User not found. Check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // 3. VERIFY OTP
  // ----------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 4) return setError("Please enter a valid OTP");

    setIsLoading(true);
    setError("");

    try {
      // await api.post("api/auth/verify-otp/", { identifier: resetIdentifier, otp });
      await new Promise(resolve => setTimeout(resolve, 1500)); // UI Simulation
      
      toast.success("OTP Verified! ✅");
      setCurrentView("set_new_password"); // Move to New Password screen
    } catch (err) {
      setError("Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // 4. SET NEW PASSWORD
  // ----------------------------------------
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");

    setIsLoading(true);
    setError("");

    try {
      // await api.post("api/auth/reset-password/", { identifier: resetIdentifier, new_password: newPassword });
      await new Promise(resolve => setTimeout(resolve, 1500)); // UI Simulation
      
      toast.success("Password Changed Successfully! 🎉");
      // Reset everything and go to login
      setIdentifier(resetIdentifier);
      setPassword("");
      setResetIdentifier("");
      setOtp("");
      setNewPassword("");
      setCurrentView("login");
    } catch (err) {
      setError("Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
      <Toaster position="top-center" />
      
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#6366f1', filter: 'blur(100px)', opacity: 0.2, top: '10%', left: '10%' }}></div>
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#a855f7', filter: 'blur(100px)', opacity: 0.2, bottom: '10%', right: '10%' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="login-card"
        style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px', color: 'white', minHeight: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <AnimatePresence mode="wait">
          
          {/* =========================================
              VIEW 1: STANDARD LOGIN
          ============================================= */}
          {currentView === "login" && (
            <motion.div key="login-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div style={{ textAlign: 'center' }}>
                  <motion.div initial={{ y: -10 }} animate={{ y: 0 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }} style={{ display: 'inline-block', marginBottom: '1rem' }}>
                     <ShieldCheck size={48} color="#6366f1" />
                  </motion.div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Welcome Back</h2>
                  <p className="subtitle" style={{ color: '#94a3b8', marginBottom: '25px' }}>Secure access to Shivadda CRM</p>
              </div>

              {error && (<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px' }}>{error}</motion.p>)}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="input-container" style={{ position: 'relative' }}>
                  <User className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="text"
                    placeholder="Email or Phone Number" 
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)} 
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="input-container" style={{ position: 'relative' }}>
                  <Lock className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', transition: '0.3s' }}>
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : <>Sign In <ArrowRight size={20} /></>}
                </button>
              </form>
              
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button onClick={() => { setError(""); setCurrentView("request_otp"); }} style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                    Forgot Password?
                  </button>
              </div>
            </motion.div>
          )}

          {/* =========================================
              VIEW 2: REQUEST OTP (Forgot Password)
          ============================================= */}
          {currentView === "request_otp" && (
            <motion.div key="request-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div style={{ textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: "spring" }} style={{ display: 'inline-block', marginBottom: '1rem', background: 'rgba(99, 102, 241, 0.2)', padding: '15px', borderRadius: '50%' }}>
                     <Smartphone size={40} color="#818cf8" />
                  </motion.div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Find Account</h2>
                  <p className="subtitle" style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.9rem' }}>Enter your Email or Phone to receive an OTP.</p>
              </div>

              {error && (<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px' }}>{error}</motion.p>)}

              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="input-container" style={{ position: 'relative' }}>
                  <User className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="text"
                    placeholder="Email or Phone Number" 
                    required
                    value={resetIdentifier}
                    onChange={e => setResetIdentifier(e.target.value)} 
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', transition: '0.3s' }}>
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : "Send OTP"}
                </button>
              </form>
              
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button onClick={() => { setError(""); setCurrentView("login"); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Login
                  </button>
              </div>
            </motion.div>
          )}

          {/* =========================================
              VIEW 3: VERIFY OTP
          ============================================= */}
          {currentView === "verify_otp" && (
            <motion.div key="verify-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div style={{ textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: "spring" }} style={{ display: 'inline-block', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: '50%' }}>
                     <MessageSquare size={40} color="#34d399" />
                  </motion.div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Enter OTP</h2>
                  <p className="subtitle" style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.9rem' }}>We sent a code to <b style={{color:'white'}}>{resetIdentifier}</b></p>
              </div>

              {error && (<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px' }}>{error}</motion.p>)}

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="input-container" style={{ position: 'relative' }}>
                  <KeyRound className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="number"
                    placeholder="Enter 4 or 6 digit OTP" 
                    required
                    value={otp}
                    onChange={e => setOtp(e.target.value)} 
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px' }}
                  />
                </div>

                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', transition: '0.3s' }}>
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : "Verify OTP"}
                </button>
              </form>
              
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button onClick={() => { setError(""); setCurrentView("request_otp"); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Change Email/Phone
                  </button>
              </div>
            </motion.div>
          )}

          {/* =========================================
              VIEW 4: SET NEW PASSWORD
          ============================================= */}
          {currentView === "set_new_password" && (
            <motion.div key="new-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div style={{ textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: "spring" }} style={{ display: 'inline-block', marginBottom: '1rem', background: 'rgba(99, 102, 241, 0.2)', padding: '15px', borderRadius: '50%' }}>
                     <Lock size={40} color="#818cf8" />
                  </motion.div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>New Password</h2>
                  <p className="subtitle" style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.9rem' }}>Create a strong password for your account.</p>
              </div>

              {error && (<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px' }}>{error}</motion.p>)}

              <form onSubmit={handleSetNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="input-container" style={{ position: 'relative' }}>
                  <Lock className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="password"
                    placeholder="Enter New Password" 
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} 
                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', transition: '0.3s' }}>
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : "Update Password"}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}