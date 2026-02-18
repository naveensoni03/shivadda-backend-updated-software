import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { 
  Brain, TrendingUp, AlertTriangle, Zap, Target, 
  Users, DollarSign, Activity, ChevronRight, Loader, Sparkles,
  Cpu, Server, BarChart3, Globe, ShieldCheck
} from "lucide-react";

export default function AIBrain() {
  const [analyzing, setAnalyzing] = useState(true);
  const [systemPulse, setSystemPulse] = useState(false);

  // --- MOCK INTELLIGENCE DATA ---
  const aiStats = {
    revenue: "₹8.5L",
    growth: "+18%",
    risk: "Low",
    prediction: "Positive"
  };

  const batchPerformance = [
    { name: "JEE Mains '26", score: 92, trend: 'up' },
    { name: "NEET Medical", score: 78, trend: 'stable' },
    { name: "Foundation 10th", score: 45, trend: 'down' },
  ];

  const insights = [
    { id: 1, type: 'opportunity', title: "Revenue Spike Detected", desc: "Launch 'Crash Course' now to capture ₹2L extra market." },
    { id: 2, type: 'alert', title: "Dropout Risk: 5 Students", desc: "Foundation batch attendance dropped by 15% this week." },
    { id: 3, type: 'opt', title: "Resource Idle", desc: "Chemistry Lab is empty on Fridays. Reschedule Class 11." },
  ];

  useEffect(() => {
    setTimeout(() => setAnalyzing(false), 3000); // 3s Intro
    const interval = setInterval(() => setSystemPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="neural-app">
      <SidebarModern />
      <div className="cyber-grid-bg"></div>
      
      {/* AMBIENT LIGHTS */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="neural-container hide-scrollbar">
        
        {/* HEADER */}
        <header className="neural-header">
            <div className="nh-left">
                <div className={`core-indicator ${systemPulse ? 'pulse' : ''}`}>
                    <Cpu size={24} color={systemPulse ? "#fff" : "#a855f7"} />
                </div>
                <div>
                    <h1 className="glitch-text" data-text="SHIVADDA CORE">SHIVADDA CORE</h1>
                    <p>Artificial Intelligence & Predictive Analytics</p>
                </div>
            </div>
            <div className="nh-right">
                <div className="sys-status">
                    <span className="blink-dot"></span> SYSTEM OPTIMAL
                </div>
                <div className="server-time">T-MINUS 00:00:00</div>
            </div>
        </header>

        {analyzing ? (
            <div className="boot-sequence">
                <div className="scanner"></div>
                <Brain size={80} className="loading-brain" color="#d8b4fe"/>
                <h2>ESTABLISHING NEURAL LINK...</h2>
                <div className="loading-bar"><div className="fill"></div></div>
                <div className="terminal-text">
                    <p>&gt; Reading Database...</p>
                    <p>&gt; Analyzing Student Behavior...</p>
                    <p>&gt; Predicting Financial Trajectory...</p>
                </div>
            </div>
        ) : (
            <div className="neural-dashboard fade-in-up">
                
                {/* --- ROW 1: KPI HUD --- */}
                <div className="hud-grid">
                    <div className="hud-card glass-card slide-up delay-1">
                        <div className="hc-icon bg-purple"><DollarSign size={20}/></div>
                        <div>
                            <span>Projected Revenue</span>
                            <h3>{aiStats.revenue} <span className="stat-up">{aiStats.growth}</span></h3>
                        </div>
                    </div>
                    <div className="hud-card glass-card slide-up delay-2">
                        <div className="hc-icon bg-blue"><ShieldCheck size={20}/></div>
                        <div>
                            <span>Churn Risk</span>
                            <h3>{aiStats.risk} <span className="stat-safe">Stable</span></h3>
                        </div>
                    </div>
                    <div className="hud-card glass-card slide-up delay-3">
                        <div className="hc-icon bg-cyan"><Activity size={20}/></div>
                        <div>
                            <span>AI Confidence</span>
                            <h3>98.4% <span className="stat-up">High</span></h3>
                        </div>
                    </div>
                    <div className="hud-card glass-card slide-up delay-4">
                        <div className="hc-icon bg-pink"><Server size={20}/></div>
                        <div>
                            <span>Data Points</span>
                            <h3>5,240 <span className="stat-neutral">Live</span></h3>
                        </div>
                    </div>
                </div>

                {/* --- ROW 2: MAIN VISUALIZATION --- */}
                <div className="main-viz-grid">
                    
                    {/* LEFT: THE BRAIN (Interactive) */}
                    <div className="viz-card brain-box glass-card scale-in">
                        <div className="card-label">CORE PROCESSING UNIT</div>
                        <div className="brain-visual">
                            <div className="central-core">
                                <Brain size={64} color="white"/>
                            </div>
                            <div className="orbit orbit-1"></div>
                            <div className="orbit orbit-2"></div>
                            <div className="orbit orbit-3"></div>
                            <div className="floating-stat fs-1 float-slow">Fee: 90%</div>
                            <div className="floating-stat fs-2 float-medium">Att: 85%</div>
                            <div className="floating-stat fs-3 float-fast">Exam: 72%</div>
                        </div>
                        <div className="brain-footer">
                            Analyzing patterns across 12 Batches...
                        </div>
                    </div>

                    {/* RIGHT: STRATEGIC INSIGHTS */}
                    <div className="viz-card insights-box glass-card slide-in-right">
                        <div className="card-label">STRATEGIC RECOMMENDATIONS</div>
                        <div className="insights-list">
                            {insights.map((ins, i) => (
                                <div key={ins.id} className={`insight-row ${ins.type} stagger-item`} style={{animationDelay: `${i * 0.15}s`}}>
                                    <div className="ir-left">
                                        {ins.type === 'opportunity' && <TrendingUp size={18} color="#4ade80"/>}
                                        {ins.type === 'alert' && <AlertTriangle size={18} color="#f87171"/>}
                                        {ins.type === 'opt' && <Zap size={18} color="#fbbf24"/>}
                                    </div>
                                    <div className="ir-content">
                                        <h4>{ins.title}</h4>
                                        <p>{ins.desc}</p>
                                    </div>
                                    <button className="ir-action"><ChevronRight size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- ROW 3: BATCH MATRIX & GRAPH --- */}
                <div className="bottom-grid">
                    <div className="glass-card batch-matrix slide-in-left">
                        <div className="card-label">BATCH HEALTH MONITOR</div>
                        {batchPerformance.map((b, i) => (
                            <div key={i} className="bm-row stagger-item" style={{animationDelay: `${i * 0.15}s`}}>
                                <div className="bm-name">{b.name}</div>
                                <div className="bm-bar-track">
                                    <div className="bm-bar-fill" style={{width: `${b.score}%`, backgroundColor: b.score > 80 ? '#4ade80' : b.score > 50 ? '#fbbf24' : '#f87171'}}></div>
                                </div>
                                <div className="bm-score">{b.score}%</div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card prediction-graph slide-in-right">
                        <div className="card-label">REVENUE TRAJECTORY (AI PREDICTION)</div>
                        <div className="graph-bars">
                            {[40, 55, 35, 60, 75, 90, 100].map((h, i) => (
                                <div key={i} className={`g-bar ${i > 4 ? 'predicted' : ''} grow-bar`} style={{height: `${h}%`, animationDelay: `${i * 0.1}s`}}>
                                    <span className="tooltip">₹{h}k</span>
                                </div>
                            ))}
                        </div>
                        <div className="graph-x">
                            <span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span className="pred">NOV</span><span className="pred">DEC</span>
                        </div>
                    </div>
                </div>

            </div>
        )}
      </div>

      {/* 🚀 CSS FOR 100% RESPONSIVENESS AND PROPER SCROLLING */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        
        :root {
            --neon-purple: #d8b4fe;
            --neon-cyan: #22d3ee;
            --neon-red: #f87171;
            --glass-bg: rgba(15, 23, 42, 0.6);
            --glass-border: rgba(255, 255, 255, 0.08);
        }

        /* ✅ SCROLL FIX: Strict Body Lock, App Container Lock */
        html, body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #020617; }

        .neural-app {
            display: flex; height: 100vh; width: 100%; background: #020617; 
            font-family: 'Rajdhani', sans-serif;
            color: white; overflow: hidden; position: relative;
        }

        .cyber-grid-bg {
            position: fixed; inset: 0; 
            background-image: 
                linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            z-index: 0; pointer-events: none;
        }

        .orb {
            position: fixed; border-radius: 50%; filter: blur(100px); opacity: 0.4; z-index: 0; pointer-events: none;
        }
        .orb-1 { width: 300px; height: 300px; background: purple; top: -50px; left: 20%; animation: float 10s infinite; }
        .orb-2 { width: 400px; height: 400px; background: blue; bottom: -100px; right: 10%; animation: float 12s infinite reverse; }

        /* ✅ SCROLL FIX: The ONLY element that scrolls vertically */
        .neural-container {
            flex: 1; margin-left: 280px; padding: 30px; 
            padding-bottom: 100px; /* Space at bottom for desktop */
            position: relative; z-index: 10; 
            height: 100vh; overflow-y: auto; overflow-x: hidden; 
            box-sizing: border-box; scroll-behavior: smooth;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }

        /* HEADER */
        .neural-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;
            border-bottom: 1px solid var(--glass-border); padding-bottom: 20px;
        }
        .nh-left { display: flex; gap: 20px; align-items: center; }
        .core-indicator {
            width: 50px; height: 50px; border: 1px solid var(--neon-purple); border-radius: 12px;
            display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3); flex-shrink: 0;
        }
        .core-indicator.pulse { background: var(--neon-purple); box-shadow: 0 0 30px var(--neon-purple); }
        
        .glitch-text { font-size: 2rem; font-weight: 700; letter-spacing: 2px; text-shadow: 2px 2px 0px #4c1d95; margin: 0; }
        .nh-left p { color: #94a3b8; margin: 0; letter-spacing: 1px; font-size: 0.9rem; }

        .nh-right { text-align: right; }
        .sys-status { color: #4ade80; font-weight: 700; display: flex; align-items: center; gap: 8px; justify-content: flex-end; letter-spacing: 1px; }
        .blink-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: blink 1s infinite; }
        .server-time { font-family: monospace; color: #64748b; font-size: 0.9rem; margin-top: 5px; }

        /* CARDS */
        .glass-card {
            background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border);
            border-radius: 16px; padding: 20px; position: relative; transition: 0.3s; box-sizing: border-box;
        }
        .glass-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5); }
        .card-label {
            font-size: 0.7rem; color: #94a3b8; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; text-transform: uppercase;
        }

        /* HUD GRID */
        .hud-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 25px; width: 100%; }
        .hud-card { display: flex; align-items: center; gap: 15px; }
        .hc-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
        .bg-purple { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; }
        .bg-blue { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
        .bg-cyan { background: rgba(34, 211, 238, 0.2); color: #67e8f9; }
        .bg-pink { background: rgba(244, 114, 182, 0.2); color: #f9a8d4; }
        .hud-card h3 { margin: 0; font-size: 1.5rem; font-weight: 700; white-space: nowrap;}
        .hud-card span { font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 4px; white-space: nowrap;}
        .stat-up { color: #4ade80; font-size: 0.8rem; margin-left: 5px; }
        .stat-safe { color: #60a5fa; font-size: 0.8rem; margin-left: 5px; }
        .stat-neutral { color: #d1d5db; font-size: 0.8rem; margin-left: 5px; }

        /* ✅ MAIN VIZ GRID - Fixed width containment */
        .main-viz-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px; margin-bottom: 25px; width: 100%; box-sizing: border-box; }
        
        .brain-box { display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; min-height: 350px;}
        .brain-visual { position: relative; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; margin: 20px 0;}
        .central-core { z-index: 2; animation: float 3s infinite ease-in-out; filter: drop-shadow(0 0 20px #a855f7); }
        .orbit { position: absolute; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; }
        .orbit-1 { width: 100%; height: 100%; border-color: rgba(168, 85, 247, 0.3); animation: spin 10s linear infinite; }
        .orbit-2 { width: 70%; height: 70%; border-color: rgba(34, 211, 238, 0.3); animation: spin 7s linear infinite reverse; }
        .orbit-3 { width: 130%; height: 130%; border: 1px dashed rgba(255,255,255,0.05); animation: spin 20s linear infinite; }
        
        .floating-stat { position: absolute; font-size: 0.7rem; background: rgba(0,0,0,0.5); padding: 4px 8px; border: 1px solid var(--glass-border); border-radius: 4px; white-space: nowrap;}
        .fs-1 { top: 10%; left: -10px; }
        .fs-2 { bottom: 20%; right: -20px; }
        .fs-3 { bottom: -10%; left: 30%; }
        
        .brain-footer { margin-top: auto; font-size: 0.8rem; color: var(--neon-cyan); animation: blink 2s infinite; text-align: center;}

        /* INSIGHTS */
        .insights-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; height: 100%; max-height: 300px; padding-right: 5px;}
        .insight-row { display: flex; align-items: flex-start; gap: 15px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.02); border-left: 3px solid transparent; transition: 0.2s; }
        .insight-row:hover { background: rgba(255,255,255,0.05); }
        .insight-row.opportunity { border-color: #4ade80; }
        .insight-row.alert { border-color: #f87171; }
        .insight-row.opt { border-color: #fbbf24; }
        .ir-left { margin-top: 2px; }
        .ir-content { flex: 1; min-width: 0; } /* min-width:0 is crucial for flex child text wrapping */
        
        /* ✅ TEXT WRAPPING FIX */
        .ir-content h4 { margin: 0; font-size: 1.05rem; color: #f1f5f9; white-space: normal; line-height: 1.3;}
        .ir-content p { margin: 4px 0 0; font-size: 0.85rem; color: #94a3b8; white-space: normal; line-height: 1.4;}
        
        .ir-action { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; flex-shrink: 0; margin-top: 5px;}
        .ir-action:hover { background: white; color: black; }

        /* ✅ BOTTOM GRID - Fixed width containment */
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; width: 100%; margin-bottom: 40px; box-sizing: border-box; }
        .bm-row { display: flex; align-items: center; gap: 15px; margin-bottom: 12px; }
        .bm-name { width: 120px; font-size: 0.9rem; color: #cbd5e1; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
        .bm-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; min-width: 50px;}
        .bm-bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
        .bm-score { font-weight: 700; width: 40px; text-align: right; flex-shrink: 0;}

        /* GRAPH */
        .graph-bars { display: flex; align-items: flex-end; justify-content: space-between; height: 120px; padding: 0 10px; gap: 8px; margin-top: 20px;}
        .g-bar { flex: 1; background: rgba(255,255,255,0.1); border-radius: 4px 4px 0 0; position: relative; transition: 0.3s; cursor: pointer; }
        .g-bar:hover { background: var(--neon-purple); box-shadow: 0 0 15px var(--neon-purple); }
        .g-bar.predicted { background: transparent; border: 1px dashed var(--neon-cyan); }
        
        .tooltip { visibility: hidden; background: #fff; color: #000; text-align: center; padding: 4px 8px; border-radius: 6px; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); font-size: 0.8rem; font-weight: 700; margin-bottom: 5px; opacity: 0; transition: 0.2s; }
        .g-bar:hover .tooltip { visibility: visible; opacity: 1; }

        .graph-x { display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.75rem; color: #64748b; padding: 0 10px; }
        .pred { color: var(--neon-cyan); }

        /* BOOT SEQUENCE */
        .boot-sequence { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;}
        .loading-brain { animation: pulse 1s infinite; filter: drop-shadow(0 0 20px #d8b4fe); margin-bottom: 20px; }
        .loading-bar { width: 100%; max-width: 300px; height: 4px; background: rgba(255,255,255,0.1); margin: 20px 0; border-radius: 2px; overflow: hidden;}
        .fill { width: 0%; height: 100%; background: var(--neon-purple); animation: load 3s forwards; }
        .terminal-text { font-family: monospace; color: var(--neon-cyan); font-size: 0.9rem; text-align: left; max-width: 300px; margin: 0 auto;}
        .terminal-text p { overflow: hidden; white-space: nowrap; animation: typing 2s steps(40, end); margin: 5px 0;}

        /* --- ANIMATIONS --- */
        .slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }

        .slide-in-left { animation: slideInLeft 0.7s ease-out forwards; opacity: 0; }
        .slide-in-right { animation: slideInRight 0.7s ease-out forwards; opacity: 0; }
        .scale-in { animation: scaleIn 0.7s ease-out forwards; opacity: 0; }
        .stagger-item { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        .grow-bar { animation: growBar 0.8s ease-out forwards; transform-origin: bottom; }

        .float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .float-medium { animation: floatMedium 4s ease-in-out infinite; }
        .float-fast { animation: floatFast 3s ease-in-out infinite; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes load { 0% { width: 0; } 100% { width: 100%; } }
        .fade-in-up { animation: fadeInUp 0.8s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }

        @keyframes floatSlow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes floatMedium { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes floatFast { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }

        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
            .neural-container { margin-left: 0 !important; max-width: 100%; width: 100%; }
            .hud-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 850px) {
            /* On mobile, ONLY the container scrolls vertically. Body remains locked. */
            .neural-container {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 85px !important; /* Sidebar header clearance */
                padding-bottom: 150px !important; /* Chatbot & bottom nav clearance */
                width: 100% !important; 
                max-width: 100% !important;
                height: 100vh !important; /* Keeps scroll active */
            }

            /* Responsive Header */
            .neural-header { flex-direction: column; align-items: flex-start; gap: 15px; }
            .nh-right { text-align: left; }
            .sys-status { justify-content: flex-start; }

            /* ✅ FIXED: Grid Layouts to Stack for Mobile */
            .hud-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 15px; }
            
            .main-viz-grid { 
                grid-template-columns: 1fr !important; /* Forces vertical stack */
                height: auto !important; 
                gap: 20px !important;
            }
            
            .insights-list {
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
            }

            .bottom-grid { 
                grid-template-columns: 1fr !important; /* Forces vertical stack */
                gap: 20px !important;
            }

            /* Brain Scaling for Mobile */
            .brain-visual { transform: scale(0.85); margin: 0 auto; }
            
            /* Typography Tweaks */
            .glitch-text { font-size: 1.5rem; }
            .hud-card h3 { font-size: 1.2rem; }
        }

        @media (max-width: 400px) {
            .hud-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}