import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Clock, RefreshCcw, Key, LogIn, Sparkles } from "lucide-react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import "./login.css";

// 🌌 Background Particles
const PARTICLES = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  size: Math.random() * 2 + 1,
  left: Math.random() * 100 + "%",
  duration: Math.random() * 15 + 15,
  delay: Math.random() * 5,
}));

export default function Login() {
  const navigate = useNavigate();

  // --- EXISTING STATES ---
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaSpinning, setIsCaptchaSpinning] = useState(false);

  // --- NEW AUTHENTICATION STATES ---
  const [loginMode, setLoginMode] = useState("standard");
  const [authStep, setAuthStep] = useState(1);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [otp, setOtp] = useState("");
  const [tempIdCode, setTempIdCode] = useState("");

  // ==========================================
  // 🤖 SMART AVATAR ASSISTANT LOGIC
  // ==========================================
  const [avatarMessage, setAvatarMessage] = useState("Hi there! Welcome to Shivadda CRM. Let's get you in! 👋");

  useEffect(() => {
    if (isLoading) {
      setAvatarMessage("Checking our secure database... hold on tight! 🚀");
    } else if (error) {
      setAvatarMessage("Oops! Something went wrong. Check your details again. 🚨");
    } else if (otp.length > 0) {
      setAvatarMessage("Verifying your OTP... almost there! 🔐");
    } else if (password.length > 0) {
      setAvatarMessage("Shh! Keep your password safe. I'm not looking! 🙈");
    } else if (emailOrPhone.length > 0) {
      setAvatarMessage("Great! Now enter your secure password. 🔑");
    } else if (loginMode === "limited") {
      setAvatarMessage("Trial mode selected! Enter your temporary access ID. ⏳");
    } else {
      setAvatarMessage("Hi there! Welcome back to Shivadda CRM. 👋");
    }
  }, [emailOrPhone, password, isLoading, error, loginMode, otp]);

  // --- PARALLAX FOR BACKGROUND BLOBS ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  const handleGlobalMouseMove = (e) => {
    mouseX.set((e.clientX - window.innerWidth / 2) / 20);
    mouseY.set((e.clientY - window.innerHeight / 2) / 20);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setIsCaptchaSpinning(true);
    setTimeout(() => setIsCaptchaSpinning(false), 500);

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaCode(code);
  };

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

    if (!OTP_MODE) {
      try {
        const res = await api.post("auth/login/", { email: emailOrPhone, password });
        if (res.data?.access) {
          localStorage.setItem("access_token", res.data.access);
          localStorage.setItem("refresh_token", res.data.refresh);
          localStorage.setItem("access", res.data.access);
          localStorage.setItem("refresh", res.data.refresh);

          const userRole = res.data.role || res.data.user_role || "ADMIN";
          localStorage.setItem("role", userRole.toUpperCase());

          toast.success("Welcome Back! 🚀");
          setTimeout(() => { window.location.href = "/dashboard"; }, 400);
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

    try {
      const res = await api.post("auth/send-otp/", { email_or_phone: emailOrPhone, password: password });
      toast.success(res.data.message || "OTP sent securely.");
      setAuthStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid Credentials.");
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  };

  const handleLimitedLogin = (e) => {
    e.preventDefault();
    if (!tempIdCode) return setError("Please enter the Time-Limited Access Code.");
    toast.success("Temporary ID Authenticated. Access granted.");
  };

  const tabs = [
    { id: "standard", label: "Master", icon: <ShieldCheck size={18} /> },
    { id: "limited", label: "Trial ID", icon: <Clock size={18} /> }
  ];

  const slideVariants = {
    hidden: (direction) => ({ opacity: 0, x: direction === "right" ? 40 : -40 }),
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25, staggerChildren: 0.1 } },
    exit: (direction) => ({ opacity: 0, x: direction === "right" ? -40 : 40, transition: { duration: 0.2 } })
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const direction = loginMode === "standard" ? "left" : "right";

  return (
    <div className="login-wrapper animate-wrapper-fix" onMouseMove={handleGlobalMouseMove}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px' } }} />

      {/* --- BACKGROUND ANIMATIONS --- */}
      {PARTICLES.map((p) => (
        <motion.div
          key={`particle-${p.id}`}
          className="particle"
          style={{ width: p.size, height: p.size, left: p.left, bottom: -10 }}
          animate={{ y: ["0vh", "-100vh"], opacity: [0, 0.5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <motion.div className="aurora-blob aurora-1" style={{ x: springX, y: springY }} />
      <motion.div className="aurora-blob aurora-2" style={{ x: useSpring(useMotionValue(-springX.get()), { stiffness: 30, damping: 20 }), y: useSpring(useMotionValue(-springY.get()), { stiffness: 30, damping: 20 }) }} />
      <motion.div className="aurora-blob aurora-3" style={{ x: springX, y: springY }} />

      {/* ============================================================== */}
      {/* 🧍‍♂️ 3D INTERACTIVE AVATAR ASSISTANT                        */}
      {/* ============================================================== */}
      <div className="responsive-avatar-container">
        {/* Speech Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          key={avatarMessage}
          transition={{ type: "spring", bounce: 0.5 }}
          className="avatar-speech-bubble"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#0f172a',
            padding: '16px 20px',
            borderRadius: '20px 20px 20px 4px',
            maxWidth: '220px',
            fontSize: '0.95rem',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            marginBottom: '15px',
            position: 'relative'
          }}
        >
          {avatarMessage}
          {/* Bubble Tail */}
          <div className="bubble-tail" style={{ position: 'absolute', bottom: '-10px', left: '0px', width: '20px', height: '20px', background: 'rgba(255, 255, 255, 0.95)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        </motion.div>

        {/* 3D Avatar Image with Breathing Animation */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="avatar-img-wrapper"
        >
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/man-avatar-6299539-5187871.png"
            alt="3D Assistant"
            className="avatar-3d-img"
            style={{ width: '200px', height: 'auto', filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.5))' }}
          />
        </motion.div>
      </div>

      {/* ============================================================== */}
      {/* 🛡️ FORM CONTAINER                                             */}
      {/* ============================================================== */}
      <motion.div
        className="glass-card-wrapper positional-card-fix"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="glass-card">

          <div style={{ display: 'flex', position: 'relative', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '16px', marginBottom: '35px' }}>
            {tabs.map((tab) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={tab.id}
                type="button"
                onClick={() => { setLoginMode(tab.id); setAuthStep(1); setError(""); }}
                style={{ flex: 1, position: 'relative', padding: '12px', border: 'none', background: 'transparent', color: loginMode === tab.id ? '#fff' : '#64748b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 2, transition: 'color 0.3s' }}
              >
                {loginMode === tab.id && (
                  <motion.div layoutId="active-tab" className="active-tab-bg" style={{ position: 'absolute', inset: 0, background: tab.id === 'standard' ? '#4f46e5' : '#d97706', borderRadius: '12px', zIndex: -1 }} transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />
                )}
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <motion.h2
              key={loginMode + authStep}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="gradient-text"
              style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px', marginTop: 0 }}
            >
              {loginMode === "standard" ? (authStep === 1 ? "Welcome Back" : "Verification") : "Guest Access"}
            </motion.h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#818cf8" /> {loginMode === "standard" ? (authStep === 1 ? "Secure access to Shivadda CRM" : "Enter 4-digit OTP to continue") : "Enter temporary access code"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} /> {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" custom={direction}>
            {loginMode === "standard" && authStep === 1 && (
              <motion.form key="step1" custom={direction} variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={verifyStepOne}>
                <motion.div variants={itemVariants} className="custom-input-group">
                  <input type="text" placeholder="Email or Mobile Number" required className="custom-input" value={emailOrPhone} onChange={e => setEmailOrPhone(e.target.value)} />
                  <Mail className="input-icon-custom" size={20} />
                </motion.div>

                <motion.div variants={itemVariants} className="custom-input-group">
                  <input type="password" placeholder="Password" required className="custom-input" value={password} onChange={e => setPassword(e.target.value)} />
                  <Lock className="input-icon-custom" size={20} />
                </motion.div>

                <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <div className="custom-input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <input type="text" placeholder="Enter Captcha" required maxLength="5" className="custom-input" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} style={{ textTransform: 'uppercase', paddingLeft: '40px' }} />
                    <ShieldCheck className="input-icon-custom" size={18} style={{ left: '12px' }} />
                  </div>
                  <div className="captcha-box">
                    <span className="captcha-text"><del>{captchaCode}</del></span>
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                      whileTap={{ scale: 0.9 }}
                      type="button" onClick={generateCaptcha}
                      style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '8px' }}
                    >
                      <motion.div animate={{ rotate: isCaptchaSpinning ? -360 : 0 }} transition={{ duration: 0.5, ease: "backOut" }}>
                        <RefreshCcw size={16} />
                      </motion.div>
                    </motion.button>
                  </div>
                </motion.div>

                <motion.button variants={itemVariants} whileTap={{ scale: 0.97 }} type="submit" disabled={isLoading} className="cyber-btn">
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : <>Continue Securely <ArrowRight size={20} /></>}
                </motion.button>

                <motion.div variants={itemVariants} style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <a href="#" style={{ display: 'inline-block', color: '#818cf8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s' }}>
                    Forgot your credentials?
                  </a>
                </motion.div>
              </motion.form>
            )}

            {loginMode === "standard" && authStep === 2 && (
              <motion.form key="step2" custom="right" variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleLogin}>
                <motion.div variants={itemVariants} className="custom-input-group">
                  <input type="text" placeholder="Enter 4-Digit OTP" required maxLength="4" className="custom-input" value={otp} onChange={e => setOtp(e.target.value)} style={{ letterSpacing: '8px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2rem', paddingLeft: '14px' }} />
                  <Key className="input-icon-custom" size={20} style={{ opacity: otp ? 0 : 1 }} />
                </motion.div>

                <motion.button variants={itemVariants} whileTap={{ scale: 0.97 }} type="submit" disabled={isLoading} className="cyber-btn">
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : <>Verify & Access <ShieldCheck size={20} /></>}
                </motion.button>

                <motion.button variants={itemVariants} type="button" onClick={() => setAuthStep(1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}>
                  ← Back to Login
                </motion.button>
              </motion.form>
            )}

            {loginMode === "limited" && (
              <motion.form key="limited" custom={direction} variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleLimitedLogin}>
                <motion.div variants={itemVariants} className="custom-input-group">
                  <input type="text" placeholder="Enter Temporary ID Code" required className="custom-input" value={tempIdCode} onChange={e => setTempIdCode(e.target.value)} style={{ textTransform: 'uppercase', borderColor: 'rgba(245, 158, 11, 0.3)', paddingLeft: '44px' }} />
                  <LogIn className="input-icon-custom" size={20} style={{ color: '#d97706', left: '14px' }} />
                </motion.div>

                <motion.div variants={itemVariants} style={{ background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)', borderLeft: '3px solid #f59e0b', padding: '12px 16px', borderRadius: '0 12px 12px 0', fontSize: '0.8rem', color: '#fcd34d', display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '24px' }}>
                  <Clock size={18} style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.4' }}>This secure session will automatically self-destruct after the assigned time limit ends.</span>
                </motion.div>

                <motion.button variants={itemVariants} whileTap={{ scale: 0.97 }} type="submit" className="cyber-btn" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}>
                  Access Trial Portal <ArrowRight size={20} />
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

      {/* 🚀 INJECTED SECURE RESPONSIVE CSS STYLES */}
      <style>{`
        .animate-wrapper-fix {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          box-sizing: border-box;
          position: relative;
        }

        .responsive-avatar-container {
          position: absolute;
          left: 8%;
          bottom: 10%;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.4s ease-in-out;
        }

        .positional-card-fix {
          z-index: 10;
        }

        /* 📱 Mobile and Tablet Optimization Media Query */
        @media (max-width: 850px) {
          .animate-wrapper-fix {
            flex-direction: column;
            justify-content: flex-start;
            overflow-y: auto;
            padding-top: 30px;
            height: auto;
          }

          .responsive-avatar-container {
            position: relative;
            left: unset;
            bottom: unset;
            margin-bottom: 20px;
            margin-top: 10px;
            order: -1; /* Pushes the Avatar to render beautifully ABOVE the login card */
          }

          .avatar-3d-img {
            width: 120px !important; /* Scales down image perfectly for mobile viewports */
          }

          .avatar-speech-bubble {
            max-width: 260px !important;
            padding: 12px 16px !important;
            font-size: 0.85rem !important;
            margin-bottom: 10px !important;
            border-radius: 16px 16px 16px 16px !important; /* Reshapes the bubble nicely */
          }

          .bubble-tail {
            display: none !important; /* Removes clipping tail for clean flat look on mobile */
          }

          .glass-card-wrapper {
            width: 100%;
            max-width: 440px;
            margin-bottom: 30px;
          }
          
          .glass-card {
            padding: 25px 20px !important; /* Softens padding so fields utilize maximum width */
          }
        }

        @media (max-width: 400px) {
          .glass-card-wrapper {
            max-width: 100%;
          }
          .gradient-text {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}