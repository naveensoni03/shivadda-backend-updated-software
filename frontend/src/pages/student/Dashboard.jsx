import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Search, Bell, CloudSun, Clock, Calendar as CalendarIcon,
  BookOpen, Target, CheckCircle, TrendingUp, PlayCircle, FileText, ChevronRight, Loader2,
  MessageCircle, ClipboardList, Lock, CreditCard, Zap
} from "lucide-react";
import StudentSidebar from "../../components/StudentSidebar";

const loadRazorpayScript = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Student");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashData, setDashData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Service Cards state
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(false);
  const [permissions, setPermissions] = useState({ course_access: false, assignment_exam_access: false });
  const [payingId, setPayingId] = useState(null);
  const [sidebarKey, setSidebarKey] = useState(0); // force sidebar refresh after payment

  useEffect(() => {
    // Auth Check & Data Load
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/student/login"); return; }
    const storedName = localStorage.getItem("user_name");
    if (storedName) setUserName(storedName);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchDashboardData();
    fetchServices();

    return () => clearInterval(timer);
  }, [navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/students/dashboard-summary/");
      setDashData({
        ...res.data,
        whatsapp_groups: res.data.whatsapp_groups || [
          { id: 1, name: "Physics Class 12 - Morning Batch", link: "https://chat.whatsapp.com/dummy123" }
        ]
      });
    } catch (err) {
      console.error("Dashboard API Error:", err);
      toast.error("Could not fetch latest data from server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    setServicesError(false);
    try {
      // Use Promise.allSettled — if one fails, the other still completes
      const [svcResult, permResult] = await Promise.allSettled([
        api.get("payments/services/"),
        api.get("payments/my-permissions/"),
      ]);

      if (svcResult.status === 'fulfilled') {
        // Show ALL active services from catalog — no strict type filter
        // Admin decides what to show; we display everything returned by the API
        const allServices = Array.isArray(svcResult.value.data)
          ? svcResult.value.data
          : [];
        setServices(allServices);
        if (allServices.length === 0) {
          console.info("No active services configured by admin yet.");
        }
      } else {
        console.error("Services API failed:", svcResult.reason);
        setServicesError(true);
      }

      if (permResult.status === 'fulfilled') {
        setPermissions(permResult.value.data);
      } else {
        // Permissions failed — use defaults (all locked). Don't redirect.
        console.warn("Permissions API failed (using defaults):", permResult.reason?.message);
      }
    } catch (err) {
      console.error("fetchServices unexpected error:", err);
      setServicesError(true);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServicePayment = async (service) => {
    setPayingId(service.id);
    const loadToast = toast.loading(`Processing ${service.name}...`);
    try {
      const orderRes = await api.post("payments/create-order/", { service_id: service.id });
      const { order_id, amount, currency, key, demo_mode } = orderRes.data;

      toast.dismiss(loadToast);

      // Demo mode — skip Razorpay, directly verify
      if (demo_mode) {
        const vt = toast.loading("Demo: Granting access...");
        try {
          await api.post("payments/verify/", {
            razorpay_order_id: order_id,
            razorpay_payment_id: `demo_pay_${Date.now()}`,
            razorpay_signature: `demo_sig_${Date.now()}`,
          });
          toast.success(`${service.name} unlocked! 🎉`, { id: vt });
          await fetchServices();
          setSidebarKey(k => k + 1);
        } catch (e) {
          toast.error("Demo grant failed.", { id: vt });
        } finally { setPayingId(null); }
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error("Razorpay SDK load nahi hua.");
        setPayingId(null);
        return;
      }

      const options = {
        key,
        amount: amount.toString(),
        currency,
        name: "SHIV ADDA SCHOOL",
        description: service.name,
        order_id,
        handler: async (response) => {
          const vt = toast.loading("Verifying payment...");
          try {
            await api.post("payments/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(`${service.name} unlocked! 🎉`, { id: vt });
            await fetchServices(); // refresh permissions
            setSidebarKey(k => k + 1);
          } catch (e) {
            toast.error("Verification failed. Contact admin.", { id: vt });
          } finally {
            setPayingId(null);
          }
        },
        prefill: {
          name: localStorage.getItem("user_name") || "Student",
          email: localStorage.getItem("user_email") || "",
        },
        method: { upi: true, card: true, emi: true, netbanking: false, wallet: false, paylater: false },
        theme: { color: "#4f46e5" },
        modal: { ondismiss: () => { setPayingId(null); toast("Payment cancelled."); } }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      const msg = err.response?.data?.error || "Order create karne mein error.";
      toast.error(msg, { id: loadToast });
      setPayingId(null);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Animation variants
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="dashboard-layout">
      <Toaster position="top-right" />
      {/* Animated Background */}
      <motion.div className="ambient-bg" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />

      <StudentSidebar />

      <main className="dashboard-main custom-scroll">

        {/* 🌟 TOP BAR */}
        <header className="dash-header">
          <div className="header-left">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search courses, exams, or topics (AI Search)..." />
            </div>
          </div>

          <div className="header-right">
            {/* Weather & Clock Widgets */}
            <div className="widget-pill weather-pill">
              <CloudSun size={18} color="#f59e0b" />
              <span>28°C Haze | India</span>
            </div>
            <div className="widget-pill time-pill">
              <Clock size={18} color="#4f46e5" />
              <span style={{ fontWeight: '700' }}>{formattedTime}</span>
            </div>

            <button className="icon-btn notif-btn">
              <Bell size={20} />
              <span className="notif-badge">3</span>
            </button>
            <div className="header-avatar" onClick={() => navigate("/student/profile")}>
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--primary)' }}>
            <Loader2 size={50} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <h3 style={{ marginTop: '20px' }}>Loading your dashboard...</h3>
          </div>
        ) : (
          <motion.div className="dash-content" variants={staggerContainer} initial="hidden" animate="show">

            {/* 🌟 WELCOME BANNER */}
            <motion.div className="welcome-banner glass-panel" variants={fadeUp}>
              <div>
                <p className="date-text"><CalendarIcon size={14} /> {formattedDate}</p>
                <h1>Welcome back, <span className="highlight-text">{userName}</span>! 👋</h1>
                <p className="subtitle">
                  You have {dashData?.schedule?.filter(s => s.is_live).length || 0} live classes and {dashData?.tasks?.length || 0} pending tasks today.
                </p>
              </div>
              <div className="banner-graphic">
                <div className="floating-circle c1"></div>
                <div className="floating-circle c2"></div>
              </div>
            </motion.div>

            {/* ============================================
                💳 SUBSCRIPTION PLANS — Hostinger Style
                ============================================ */}
            <motion.div variants={fadeUp} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>
                    🎯 Subscription Plans
                  </h2>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
                    Apna access unlock karo aur full learning experience pao
                  </p>
                </div>
                {servicesError && (
                  <button onClick={fetchServices}
                    style={{ background: "#eef2ff", color: "#4f46e5", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    🔄 Retry
                  </button>
                )}
              </div>

              {/* Loading skeleton */}
              {servicesLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ background: "white", borderRadius: 20, padding: 24, border: "1.5px solid #e2e8f0", animation: "pulse-bg 1.5s ease-in-out infinite" }}>
                      <div style={{ height: 16, background: "#f1f5f9", borderRadius: 8, marginBottom: 10, width: "60%" }} />
                      <div style={{ height: 12, background: "#f1f5f9", borderRadius: 6, marginBottom: 18, width: "80%" }} />
                      <div style={{ height: 40, background: "#f1f5f9", borderRadius: 8, marginBottom: 16 }} />
                      <div style={{ height: 44, background: "#f1f5f9", borderRadius: 12 }} />
                    </div>
                  ))}
                </div>
              ) : servicesError ? (
                /* Error state */
                <div style={{ textAlign: "center", padding: "36px 20px", background: "white", borderRadius: 20, border: "1.5px dashed #fca5a5" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>⚠️</div>
                  <h3 style={{ margin: "0 0 8px", color: "#ef4444", fontWeight: 800 }}>Plans load nahi ho sake</h3>
                  <p style={{ margin: "0 0 16px", color: "#94a3b8", fontSize: "0.88rem" }}>Network ya server issue. Retry karo.</p>
                  <button onClick={fetchServices}
                    style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
                    🔄 Retry
                  </button>
                </div>
              ) : services.length === 0 ? (
                /* Empty state — no services configured by admin yet */
                <div style={{ textAlign: "center", padding: "36px 20px", background: "white", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📋</div>
                  <h3 style={{ margin: "0 0 8px", color: "#64748b", fontWeight: 800 }}>Koi plan available nahi hai</h3>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.88rem" }}>Admin abhi plans configure kar raha hai. Thodi der mein check karo.</p>
                </div>
              ) : (
                /* Service cards grid */
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(services.length, 3)}, 1fr)`, gap: 20, alignItems: "start" }}>
                  {services.map(svc => {
                    // Check access: use has_access from API, or match by service_type for known types
                    const isPaid = svc.has_access
                      || (svc.service_type === "course_access" && permissions.course_access)
                      || (svc.service_type === "assignment_exam_access" && permissions.assignment_exam_access);

                    const disc = svc.discount_percent ||
                      (svc.original_price && parseFloat(svc.original_price) > parseFloat(svc.price)
                        ? Math.round((1 - parseFloat(svc.price) / parseFloat(svc.original_price)) * 100) : null);

                    const cardColor = svc.color || "#4f46e5";

                    return (
                      <motion.div key={svc.id}
                        whileHover={{ y: svc.is_popular ? -6 : -4, boxShadow: svc.is_popular ? `0 24px 60px ${cardColor}33` : "0 16px 40px rgba(0,0,0,0.1)" }}
                        style={{
                          background: "white", borderRadius: 20,
                          border: svc.is_popular ? `2.5px solid ${cardColor}` : "1.5px solid #e2e8f0",
                          boxShadow: svc.is_popular ? `0 8px 30px ${cardColor}22` : "0 4px 16px rgba(0,0,0,0.05)",
                          position: "relative", overflow: "hidden",
                          transform: svc.is_popular ? "scale(1.03)" : "scale(1)",
                        }}>

                        {/* Top color bar */}
                        <div style={{ height: 5, background: cardColor }} />

                        {/* Most Popular banner */}
                        {svc.is_popular && (
                          <div style={{ background: cardColor, color: "white", textAlign: "center", padding: "7px", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "1.5px" }}>
                            ★ MOST POPULAR
                          </div>
                        )}

                        <div style={{ padding: "24px 22px 26px" }}>
                          {/* Header row */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div>
                              <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{svc.name}</h3>
                              <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: 1.4 }}>{svc.description}</p>
                            </div>
                            {disc && !isPaid && (
                              <span style={{ background: "#fef3c7", color: "#d97706", borderRadius: 20, padding: "4px 10px", fontSize: "0.7rem", fontWeight: 800, whiteSpace: "nowrap", marginLeft: 8 }}>
                                {disc}% off
                              </span>
                            )}
                            {svc.badge_text && !disc && !isPaid && (
                              <span style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: 20, padding: "4px 10px", fontSize: "0.7rem", fontWeight: 800, marginLeft: 8 }}>
                                {svc.badge_text}
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div style={{ marginBottom: 20 }}>
                            {svc.original_price && (
                              <p style={{ margin: "0 0 2px", fontSize: "0.88rem", color: "#94a3b8", textDecoration: "line-through" }}>
                                ₹{parseFloat(svc.original_price).toLocaleString("en-IN")}
                              </p>
                            )}
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                              <span style={{ fontSize: "2.1rem", fontWeight: 900, color: "#0f172a" }}>
                                ₹{parseFloat(svc.total_price || svc.price).toLocaleString("en-IN")}
                              </span>
                              <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                                / {svc.validity_days} days
                              </span>
                            </div>
                            {svc.original_price && (
                              <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#16a34a", fontWeight: 700 }}>
                                Save ₹{(parseFloat(svc.original_price) - parseFloat(svc.price)).toLocaleString("en-IN")} 🎉
                              </p>
                            )}
                          </div>

                          {/* CTA Button */}
                          {isPaid ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: "#f0fdf4", borderRadius: 12, color: "#16a34a", fontWeight: 800, fontSize: "0.9rem", marginBottom: 20, border: "1.5px solid #bbf7d0" }}>
                              <CheckCircle size={18} /> Access Active ✓
                            </div>
                          ) : (
                            <motion.button whileTap={{ scale: 0.97 }}
                              disabled={payingId === svc.id}
                              onClick={() => handleServicePayment(svc)}
                              style={{
                                width: "100%", padding: "14px", marginBottom: 20,
                                background: payingId === svc.id ? "#a5b4fc" : svc.is_popular ? cardColor : "white",
                                color: payingId === svc.id ? "white" : svc.is_popular ? "white" : cardColor,
                                border: `2px solid ${cardColor}`,
                                borderRadius: 12, fontWeight: 800, fontSize: "0.95rem",
                                cursor: payingId === svc.id ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                boxShadow: svc.is_popular ? `0 4px 16px ${cardColor}44` : "none",
                                transition: "all 0.2s"
                              }}>
                              {payingId === svc.id
                                ? <><Loader2 size={17} className="svc-spin" /> Processing...</>
                                : <>Choose Plan <ChevronRight size={17} /></>
                              }
                            </motion.button>
                          )}

                          {/* Divider + Features */}
                          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                            {svc.features?.length > 0 ? (
                              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                                {svc.features.map((f, i) => (
                                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: "0.85rem", color: "#374151" }}>
                                    <CheckCircle size={15} color={cardColor} style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", fontStyle: "italic" }}>
                                Features admin update karenge.
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* 🌟 KPI STATS CARDS (Connected to API) */}
            <div className="stats-grid">
              <motion.div className="stat-card glass-panel" variants={fadeUp} whileHover={{ y: -5 }}>
                <div className="stat-icon-box bg-blue"><BookOpen size={24} color="#3b82f6" /></div>
                <div className="stat-info">
                  <h3>{dashData?.stats?.enrolled_courses || 0}</h3>
                  <p>Enrolled Courses</p>
                </div>
              </motion.div>
              <motion.div className="stat-card glass-panel" variants={fadeUp} whileHover={{ y: -5 }}>
                <div className="stat-icon-box bg-green"><CheckCircle size={24} color="#10b981" /></div>
                <div className="stat-info">
                  <h3>{dashData?.stats?.attendance_percentage || 0}%</h3>
                  <p>Overall Attendance</p>
                </div>
              </motion.div>
              <motion.div className="stat-card glass-panel" variants={fadeUp} whileHover={{ y: -5 }}>
                <div className="stat-icon-box bg-orange"><Target size={24} color="#f59e0b" /></div>
                <div className="stat-info">
                  <h3>{dashData?.stats?.average_cgpa || 0}%</h3>
                  <p>Average CGPA / Marks</p>
                </div>
              </motion.div>
              <motion.div className="stat-card glass-panel" variants={fadeUp} whileHover={{ y: -5 }}>
                <div className="stat-icon-box bg-purple"><TrendingUp size={24} color="#8b5cf6" /></div>
                <div className="stat-info">
                  <h3>+{dashData?.stats?.performance_growth || 0}%</h3>
                  <p>Performance Growth</p>
                </div>
              </motion.div>
            </div>

            <div className="dash-grid-2">
              {/* 🌟 TODAY'S SCHEDULE (Connected to API) */}
              <motion.div className="schedule-section glass-panel" variants={fadeUp}>
                <div className="section-header">
                  <h2>Today's Schedule</h2>
                  <button
                    className="view-all-btn"
                    onClick={() => navigate("/student/timetable")}
                  >
                    View Timetable
                  </button>
                </div>
                <div className="schedule-list">
                  {dashData?.schedule?.map((item) => (
                    <div key={item.id} className={`schedule-item ${item.is_live ? 'active' : ''}`}>
                      <div className="time-col">
                        <span className="time">{item.time}</span>
                        <span className="duration">{item.duration}</span>
                      </div>
                      <div className="details-col">
                        <h4>{item.subject}</h4>
                        <p>{item.topic}</p>
                        <div className="action-row">
                          {item.is_live ? (
                            <>
                              <span className="badge live-badge">🔴 Live Now</span>
                              <button className="join-btn"><PlayCircle size={14} /> Join Class</button>
                            </>
                          ) : (
                            <span className="badge upcoming-badge">Upcoming</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!dashData?.schedule || dashData.schedule.length === 0) && (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>No classes scheduled for today.</p>
                  )}
                </div>
              </motion.div>

              {/* 🌟 RIGHT COLUMN (Tasks, WhatsApp & Graphs) */}
              <div className="right-col-widgets">

                {/* Pending Tasks */}
                <motion.div className="widget-card glass-panel" variants={fadeUp}>
                  <div className="section-header">
                    <h2>Pending Tasks</h2>
                  </div>
                  <div className="task-list">
                    {dashData?.tasks?.map((task) => (
                      <div key={task.id} className="task-item">
                        <div className="task-icon">
                          {task.type === 'exam' ? <Target size={18} color="#3b82f6" /> : <FileText size={18} color="#ef4444" />}
                        </div>
                        <div className="task-details">
                          <h5>{task.title}</h5>
                          <span className={`due-date ${task.urgent ? 'text-red' : ''}`}>{task.due}</span>
                        </div>
                        <ChevronRight size={18} color="#cbd5e1" className="arrow" />
                      </div>
                    ))}
                    {(!dashData?.tasks || dashData.tasks.length === 0) && (
                      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>All caught up! 🎉</p>
                    )}
                  </div>
                </motion.div>

                {/* 🔥 NEW FEATURE: WHATSAPP GROUPS (Req 5) */}
                <motion.div className="widget-card glass-panel" variants={fadeUp} style={{ background: 'linear-gradient(135deg, #ecfdf5, #ffffff)', border: '1px solid #10b981' }}>
                  <div className="section-header" style={{ borderBottomColor: '#a7f3d0' }}>
                    <h2 style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageCircle size={20} color="#10b981" fill="#10b981" /> My WhatsApp Groups
                    </h2>
                  </div>
                  <div className="task-list">
                    {dashData?.whatsapp_groups?.length > 0 ? (
                      dashData.whatsapp_groups.map((group) => (
                        <div key={group.id} className="task-item" style={{ border: '1px solid #a7f3d0', background: 'white' }}>
                          <div className="task-details">
                            <h5 style={{ color: '#1f2937', fontWeight: '700' }}>{group.name}</h5>
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Official Batch Group</span>
                          </div>
                          <button
                            onClick={() => window.open(group.link, "_blank")}
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', transition: '0.2s', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <MessageCircle size={16} /> Join
                          </button>
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: 'center', color: '#047857', fontSize: '0.85rem' }}>No WhatsApp groups assigned yet.</p>
                    )}
                  </div>
                </motion.div>

                {/* 🌟 PERFORMANCE MINI GRAPH (Connected to API) */}
                <motion.div className="widget-card glass-panel" variants={fadeUp}>
                  <div className="section-header">
                    <h2>Recent Performance</h2>
                  </div>
                  <div className="mini-chart">
                    {dashData?.performance_chart?.map((chart, index) => (
                      <div key={index} className="chart-bar-wrap">
                        <div
                          className="bar"
                          style={{
                            height: `${chart.value}%`,
                            background: chart.value >= 90 ? '#10b981' : chart.value >= 80 ? '#4f46e5' : '#e2e8f0'
                          }}
                        ></div>
                        <span>{chart.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

            </div>
          </motion.div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
            --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f3e8ff 100%);
            --glass-bg: rgba(255, 255, 255, 0.85);
            --glass-border: 1px solid rgba(255, 255, 255, 0.9);
            --text-main: #0f172a;
            --text-muted: #64748b;
            --primary: #4f46e5;
        }

        * { box-sizing: border-box; }
        .dashboard-layout { display: flex; height: 100vh; width: 100vw; background: var(--bg-gradient); font-family: 'Inter', sans-serif; overflow: hidden; position: relative; }
        .ambient-bg { position: absolute; inset: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, rgba(248,250,252,0) 50%); z-index: 0; pointer-events: none; }

        /* Scroll Area */
        .dashboard-main { flex: 1; margin-left: 280px; height: 100vh; overflow-y: auto; overflow-x: hidden; z-index: 1; display: flex; flex-direction: column; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        /* 🌟 TOP HEADER */
        .dash-header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: rgba(248,250,252,0.8); backdrop-filter: blur(15px); z-index: 50; border-bottom: 1px solid rgba(226,232,240,0.8); }
        .header-left { flex: 1; }
        .search-box { display: flex; align-items: center; background: white; padding: 10px 15px; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
        .search-box input { border: none; outline: none; background: transparent; margin-left: 10px; width: 100%; font-size: 0.9rem; color: var(--text-main); }
        
        .header-right { display: flex; align-items: center; gap: 15px; }
        .widget-pill { display: flex; align-items: center; gap: 8px; background: white; padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: var(--text-main); box-shadow: 0 4px 10px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; }
        .weather-pill { color: #334155; }
        
        .icon-btn { background: white; border: 1px solid #e2e8f0; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: var(--text-muted); cursor: pointer; position: relative; transition: 0.2s; }
        .icon-btn:hover { color: var(--primary); border-color: var(--primary); }
        .notif-badge { position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 0.65rem; font-weight: bold; width: 18px; height: 18px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white;}
        .header-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #4f46e5, #8b5cf6); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 10px rgba(79,70,229,0.3); border: 2px solid white; transition: 0.2s; }
        .header-avatar:hover { transform: scale(1.05); }

        /* 🌟 CONTENT AREA */
        .dash-content { padding: 30px 40px; display: flex; flex-direction: column; gap: 30px; max-width: 1400px; margin: 0 auto; width: 100%; }
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(20px); border: var(--glass-border); border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }

        /* Welcome Banner */
        .welcome-banner { padding: 40px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.4)); position: relative; overflow: hidden; }
        .date-text { display: flex; align-items: center; gap: 8px; color: var(--primary); font-weight: 700; font-size: 0.9rem; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
        .welcome-banner h1 { margin: 0 0 10px 0; font-size: 2.2rem; color: var(--text-main); font-weight: 800; }
        .highlight-text { color: transparent; background: linear-gradient(135deg, #4f46e5, #d946ef); -webkit-background-clip: text; }
        .welcome-banner .subtitle { margin: 0; color: var(--text-muted); font-size: 1.05rem; max-width: 600px; line-height: 1.5; }
        .banner-graphic { position: absolute; right: -50px; top: -50px; width: 300px; height: 300px; opacity: 0.5; pointer-events: none; }
        .floating-circle { position: absolute; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #a855f7); filter: blur(40px); }
        .c1 { width: 200px; height: 200px; top: 0; right: 0; animation: float 6s ease-in-out infinite; }
        .c2 { width: 150px; height: 150px; bottom: 20px; left: 20px; background: linear-gradient(135deg, #f472b6, #ec4899); animation: float 8s ease-in-out infinite reverse; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(20px); } 100% { transform: translateY(0px); } }

        /* KPI Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .stat-card { padding: 25px; display: flex; align-items: center; gap: 20px; transition: 0.3s; cursor: default; }
        .stat-icon-box { width: 60px; height: 60px; border-radius: 16px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
        .bg-blue { background: #eff6ff; } .bg-green { background: #ecfdf5; } .bg-orange { background: #fffbeb; } .bg-purple { background: #f5f3ff; }
        .stat-info h3 { margin: 0 0 5px 0; font-size: 1.8rem; font-weight: 900; color: var(--text-main); }
        .stat-info p { margin: 0; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }

        /* Lower Grid Split */
        .dash-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;}
        .section-header h2 { margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
        .view-all-btn { background: none; border: none; color: var(--primary); font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
        .view-all-btn:hover { color: #3730a3; text-decoration: underline; }

        /* Schedule / Timeline */
        .schedule-section { padding: 30px; }
        .schedule-list { display: flex; flex-direction: column; gap: 20px; }
        .schedule-item { display: flex; gap: 20px; padding: 20px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; transition: 0.2s; position: relative; overflow: hidden; }
        .schedule-item.active { border-color: #c7d2fe; background: #fafafa; box-shadow: 0 10px 25px -5px rgba(79,70,229,0.1); }
        .schedule-item.active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: var(--primary); }
        .time-col { min-width: 90px; text-align: right; display: flex; flex-direction: column; justify-content: center; border-right: 2px dashed #e2e8f0; padding-right: 20px; }
        .time-col .time { font-weight: 800; color: var(--text-main); font-size: 1.1rem; }
        .time-col .duration { color: var(--text-muted); font-size: 0.8rem; font-weight: 600; margin-top: 5px; }
        .details-col { flex: 1; }
        .details-col h4 { margin: 0 0 5px 0; font-size: 1.1rem; color: var(--text-main); font-weight: 800; }
        .details-col p { margin: 0 0 15px 0; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
        .action-row { display: flex; justify-content: space-between; align-items: center; }
        .badge { padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .live-badge { background: #fee2e2; color: #ef4444; animation: pulse 2s infinite; }
        .upcoming-badge { background: #f1f5f9; color: #64748b; }
        .join-btn { background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 10px rgba(79,70,229,0.3);}
        .join-btn:hover { transform: translateY(-2px); background: #4338ca; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .spinner { animation: spin 1s linear infinite; }
        .svc-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse-bg { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        /* Right Column Widgets */
        .right-col-widgets { display: flex; flex-direction: column; gap: 30px; }
        .widget-card { padding: 25px; }
        .task-list { display: flex; flex-direction: column; gap: 15px; }
        .task-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px; border: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; }
        .task-item:hover { border-color: #cbd5e1; transform: translateX(5px); }
        .task-icon { width: 40px; height: 40px; background: #f8fafc; border-radius: 10px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
        .task-details { flex: 1; }
        .task-details h5 { margin: 0 0 5px 0; font-size: 0.95rem; color: var(--text-main); }
        .due-date { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .text-red { color: #ef4444; }

        /* Mini Chart CSS Only */
        .mini-chart { display: flex; justify-content: space-between; align-items: flex-end; height: 150px; padding-top: 20px; gap: 10px; }
        .chart-bar-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; gap: 10px; }
        .bar { width: 100%; max-width: 40px; background: #e2e8f0; border-radius: 8px 8px 0 0; transition: height 1s ease-out; }
        .chart-bar-wrap:hover .bar { filter: brightness(0.9); }
        .chart-bar-wrap span { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }

        /* Responsive */
        @media (max-width: 1200px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .dash-grid-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 1024px) {
            .dashboard-main { margin-left: 0; width: 100%; }
        }
        @media (max-width: 768px) {
            .dash-header { flex-direction: column; gap: 15px; padding: 15px 20px; }
            .header-left, .header-right { width: 100%; justify-content: space-between; }
            .search-box { max-width: 100%; }
            .weather-pill { display: none; } /* Hide on small screens to save space */
            .dash-content { padding: 20px; }
            .welcome-banner { padding: 25px; }
            .stats-grid { grid-template-columns: 1fr; }
            .schedule-item { flex-direction: column; gap: 10px; }
            .time-col { text-align: left; border-right: none; border-bottom: 2px dashed #e2e8f0; padding-bottom: 10px; padding-right: 0; flex-direction: row; align-items: center; gap: 15px;}
            .time-col .duration { margin-top: 0; }
        }
      `}} />
    </div>
  );
}