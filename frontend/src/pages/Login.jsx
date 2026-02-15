import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import "./login.css"; // Ensure this file exists

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // ✅ FIX 1: Correct Endpoint (auth/token/)
      const res = await api.post("auth/token/", { email, password });
      
      // ✅ FIX 2: Check for access token
      if (res.data && res.data.access) {
        // ✅ FIX 3: Store with correct name 'access_token'
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        
        toast.success("Welcome Back! 🚀");

        // ✅ FIX 4: Reload to update App.js state
        setTimeout(() => {
            navigate("/dashboard");
            window.location.reload();
        }, 500);
      } else {
        setError("Invalid server response");
      }

    } catch (err) {
      console.error("Login Error:", err);
      // Show specific error if available, else generic message
      setError("Incorrect email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
      <Toaster position="top-right" />
      
      {/* Background Decorative Circles */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#6366f1', filter: 'blur(100px)', opacity: 0.2, top: '10%', left: '10%' }}></div>
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#a855f7', filter: 'blur(100px)', opacity: 0.2, bottom: '10%', right: '10%' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="login-card"
        style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px', color: 'white' }}
      >
        <div style={{ textAlign: 'center' }}>
            <motion.div 
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              style={{ display: 'inline-block', marginBottom: '1rem' }}
            >
               <ShieldCheck size={48} color="#6366f1" />
            </motion.div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>Welcome Back</h2>
            <p className="subtitle" style={{ color: '#94a3b8', marginBottom: '25px' }}>Secure access to Shivadda CRM</p>
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

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="input-container" style={{ position: 'relative' }}>
            <Mail className="input-icon" size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="email"
              placeholder="Email Address" 
              required
              autoComplete="email"
              onChange={e => setEmail(e.target.value)} 
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
              onChange={e => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
            />
          </div>

          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
            {isLoading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                Sign In <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a href="#" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
              Forgot Password?
            </a>
        </div>
      </motion.div>
    </div>
  );
}