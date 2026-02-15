import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { 
  ShieldCheck, Activity, Clock, User, 
  Search, Filter, Monitor, Download, RefreshCw, 
  PlusCircle, Edit3, Trash2, LogIn, AlertCircle, Calendar, Eye, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccessLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ✅ States for Logic
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("logs/");
      setLogs(res.data.results || res.data);
      toast.success("Logs Synced Successfully! 🔄");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync logs.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1. Export CSV Logic
  const handleExport = () => {
    if (logs.length === 0) {
        toast.error("No logs available to export.");
        return;
    }
    
    toast.promise(
        new Promise((resolve) => {
            setTimeout(() => {
                const headers = ["ID,Action,Target,Actor,IP,Timestamp,Details"];
                const rows = logs.map(log => 
                    `${log.id},${log.action_type},"${log.target_repr} (${log.target_model})",${log.actor_name || 'System'},${log.ip_address},${new Date(log.timestamp).toISOString()},"${log.details || ''}"`
                );
                
                const csvContent = [headers, ...rows].join("\n");
                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                resolve();
            }, 1000);
        }),
        {
            loading: 'Generating CSV Report... 📂',
            success: 'Report Downloaded Successfully!',
            error: 'Export failed.',
        }
    );
  };

  // ✅ 2. Filter Type Logic (Cycles: ALL -> CREATE -> UPDATE -> DELETE)
  const toggleFilter = () => {
    const types = ["ALL", "CREATE", "UPDATE", "DELETE", "LOGIN"];
    const nextIndex = (types.indexOf(filterType) + 1) % types.length;
    setFilterType(types[nextIndex]);
    toast(`Filter applied: ${types[nextIndex]}`, { icon: '🔍' });
  };

  // ✅ 3. Date Range Logic (Cycles: ALL -> TODAY -> WEEK)
  const toggleDateRange = () => {
    const ranges = ["ALL", "TODAY", "WEEK"];
    const nextIndex = (ranges.indexOf(dateRange) + 1) % ranges.length;
    setDateRange(ranges[nextIndex]);
    toast(`Date Range: ${ranges[nextIndex]}`, { icon: '📅' });
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
  };

  // 🧠 Smart Filtering Logic
  const filteredLogs = logs.filter(log => {
    // 1. Search Text
    const matchesSearch = 
        log.target_repr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.includes(searchTerm);

    // 2. Type Filter
    const matchesType = filterType === "ALL" || log.action_type === filterType;

    // 3. Date Filter
    let matchesDate = true;
    const logDate = new Date(log.timestamp);
    const today = new Date();
    
    if (dateRange === "TODAY") {
        matchesDate = logDate.toDateString() === today.toDateString();
    } else if (dateRange === "WEEK") {
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        matchesDate = logDate >= lastWeek;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  // 🎨 Action Badge Styles with Glow
  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATE': return { bg: 'rgba(220, 252, 231, 0.9)', text: '#15803d', icon: <PlusCircle size={14}/>, border: '#86efac', shadow: '0 0 15px rgba(34, 197, 94, 0.25)' };
      case 'UPDATE': return { bg: 'rgba(219, 234, 254, 0.9)', text: '#1d4ed8', icon: <Edit3 size={14}/>, border: '#93c5fd', shadow: '0 0 15px rgba(59, 130, 246, 0.25)' };
      case 'DELETE': return { bg: 'rgba(254, 226, 226, 0.9)', text: '#b91c1c', icon: <Trash2 size={14}/>, border: '#fca5a5', shadow: '0 0 15px rgba(239, 68, 68, 0.25)' };
      case 'LOGIN':  return { bg: 'rgba(243, 232, 255, 0.9)', text: '#7e22ce', icon: <LogIn size={14}/>, border: '#d8b4fe', shadow: '0 0 15px rgba(168, 85, 247, 0.25)' };
      default:       return { bg: '#f3f4f6', text: '#374151', icon: <Activity size={14}/>, border: '#e5e7eb', shadow: 'none' };
    }
  };

  // 🎭 Super Smooth Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 120, damping: 12 } 
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, scale: 1, y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } }
  };

  return (
    <div style={{display: "flex", background: "#f8fafc", height: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden"}}>
      <SidebarModern />
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* 🔮 CSS Trick to Hide Scrollbars but Keep Scrolling */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div style={{flex: 1, marginLeft: "280px", padding: "30px 40px", display: "flex", flexDirection: "column", height: "100vh"}}>
        
        {/* 🔥 Header Section */}
        <motion.div 
          initial={{opacity:0, y:-30}} 
          animate={{opacity:1, y:0}} 
          transition={{type: "spring", stiffness: 100, damping: 20}} 
          style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px', flexShrink: 0}}
        >
          <div>
            <h1 style={{fontSize: '2.4rem', fontWeight: '800', background: 'linear-gradient(to right, #1e293b, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px', display:'flex', alignItems:'center', gap:'16px', letterSpacing:'-0.5px'}}>
              <motion.div 
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 120 }}
                style={{background:'linear-gradient(135deg, #6366f1, #8b5cf6)', padding:'10px', borderRadius:'14px', boxShadow:'0 8px 20px -6px rgba(99, 102, 241, 0.6)', display:'flex'}}
              >
                <Activity size={28} color="white"/>
              </motion.div>
              Audit & Access Logs
            </h1>
            <p style={{color: '#64748b', fontSize: '1rem', fontWeight: '500', marginLeft:'4px'}}>Real-time monitoring of system security & user actions.</p>
          </div>
          
          <div style={{display:'flex', gap:'12px'}}>
            <motion.button whileHover={{scale:1.05, y:-2}} whileTap={{scale:0.95}} onClick={fetchLogs} style={secondaryBtn}><RefreshCw size={18} className={loading ? "animate-spin" : ""}/> Sync Data</motion.button>
            <motion.button whileHover={{scale:1.05, y:-2, boxShadow:'0 10px 25px -5px rgba(79, 70, 229, 0.4)'}} whileTap={{scale:0.95}} onClick={handleExport} style={primaryBtn}><Download size={18}/> Export Report</motion.button>
          </div>
        </motion.div>

        {/* 📊 Animated Stats Cards */}
        <motion.div 
          initial="hidden" animate="visible" 
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'25px', marginBottom:'25px', flexShrink: 0}}
        >
            <motion.div variants={itemVariants}><StatCard title="Total Events" value={logs.length} icon={<ShieldCheck size={26}/>} color="#0ea5e9" bg="linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)" desc="Actions logged this month" trend="+12%" trendColor="#0284c7" /></motion.div>
            <motion.div variants={itemVariants}><StatCard title="Active Sessions" value="24" icon={<Monitor size={26}/>} color="#8b5cf6" bg="linear-gradient(135deg, #f3e8ff 0%, #d8b4fe 100%)" desc="Users currently online" trend="+5%" trendColor="#7c3aed" /></motion.div>
            <motion.div variants={itemVariants}><StatCard title="System Health" value="98%" icon={<AlertCircle size={26}/>} color="#10b981" bg="linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)" desc="Server uptime status" trend="Stable" trendColor="#059669" /></motion.div>
        </motion.div>

        {/* 📋 Logs Table Container */}
        <motion.div 
            initial={{opacity:0, y:40}} 
            animate={{opacity:1, y:0}} 
            transition={{delay:0.3, type: "spring", stiffness: 60}}
            style={{
                background:'white', borderRadius:'24px', boxShadow:'0 10px 40px -10px rgba(0,0,0,0.08)', 
                border:'1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'
            }}
        >
            {/* Toolbar */}
            <div style={{padding:'15px 25px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)'}}>
                <div style={{position:'relative', width:'350px'}}>
                    <Search size={18} style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}}/>
                    <input 
                        placeholder="Search logs by User, IP, or Module..." 
                        style={searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <motion.button 
                        whileHover={{y:-2, backgroundColor:'#f8fafc'}} whileTap={{scale:0.95}} 
                        onClick={toggleFilter} 
                        style={{...filterBtn, background: filterType !== 'ALL' ? '#e0f2fe' : 'white', color: filterType !== 'ALL' ? '#0284c7' : '#64748b'}}
                    >
                        <Filter size={14}/> {filterType === 'ALL' ? 'Filter Type' : filterType}
                    </motion.button>
                    
                    <motion.button 
                        whileHover={{y:-2, backgroundColor:'#f8fafc'}} whileTap={{scale:0.95}} 
                        onClick={toggleDateRange} 
                        style={{...filterBtn, background: dateRange !== 'ALL' ? '#f0fdf4' : 'white', color: dateRange !== 'ALL' ? '#16a34a' : '#64748b'}}
                    >
                        <Calendar size={14}/> {dateRange === 'ALL' ? 'Date Range' : dateRange}
                    </motion.button>
                </div>
            </div>

            {/* Table Header (Sticky) */}
            <div style={{overflow: 'hidden', borderBottom:'2px solid #f1f5f9'}}>
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead style={{display:'table', width:'100%', tableLayout:'fixed'}}>
                        <tr style={{background:'#f8fafc', textAlign:'left'}}>
                            <th style={{...thStyle, width:'15%'}}>EVENT TYPE</th>
                            <th style={{...thStyle, width:'20%'}}>TARGET ENTITY</th>
                            <th style={{...thStyle, width:'20%'}}>INITIATED BY</th>
                            <th style={{...thStyle, width:'15%'}}>SOURCE IP</th>
                            <th style={{...thStyle, width:'15%'}}>TIMESTAMP</th>
                            <th style={{...thStyle, width:'15%', textAlign: 'center'}}>ACTION</th>
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Scrollable Body - Hidden Scrollbar */}
            <div className="hide-scrollbar" style={{overflowY: 'auto', flex: 1}}> 
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <motion.tbody 
                        variants={containerVariants} 
                        initial="hidden" 
                        animate="visible" 
                        style={{display:'table', width:'100%', tableLayout:'fixed'}}
                    >
                        {loading ? (
                            <tr><td colSpan="6" style={{padding:'60px', textAlign:'center', color:'#94a3b8'}}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{display:'inline-block'}}>
                                    <RefreshCw size={32} />
                                </motion.div>
                                <div style={{marginTop:'12px', fontWeight:'500', fontSize:'0.9rem'}}>Fetching latest logs...</div>
                            </td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan="6" style={{padding:'60px', textAlign:'center', color:'#94a3b8'}}>
                                <ShieldCheck size={48} style={{marginBottom:'12px', opacity:0.4}}/>
                                <div style={{fontSize:'1rem', fontWeight:'500'}}>No logs found for this filter.</div>
                            </td></tr>
                        ) : filteredLogs.map((log, i) => {
                            const style = getActionStyle(log.action_type);
                            return (
                                <motion.tr 
                                    variants={itemVariants}
                                    key={log.id} 
                                    style={{borderBottom:'1px solid #f1f5f9', cursor:'default'}}
                                    whileHover={{ backgroundColor: '#f8fafc', scale: 1.002, x: 4, transition: { duration: 0.1 } }}
                                >
                                    <td style={{...tdStyle, width:'15%'}}>
                                        <motion.span whileHover={{scale:1.05}} style={{
                                            background: style.bg, color: style.text, border: `1px solid ${style.border}`,
                                            padding:'6px 12px', borderRadius:'10px', fontSize:'0.7rem', fontWeight:'800',
                                            display:'inline-flex', alignItems:'center', gap:'6px', letterSpacing:'0.5px',
                                            boxShadow: style.shadow
                                        }}>
                                            {style.icon} {log.action_type}
                                        </motion.span>
                                    </td>
                                    <td style={{...tdStyle, width:'20%'}}>
                                        <div style={{fontWeight:'700', color:'#1e293b', fontSize:'0.9rem'}}>{log.target_repr || 'System Process'}</div>
                                        <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:'4px', display:'flex', alignItems:'center', gap:'6px'}}>
                                            <div style={{width:'5px', height:'5px', borderRadius:'50%', background:'#94a3b8'}}></div>
                                            {log.target_model} <span style={{opacity:0.4}}>|</span> ID: {log.target_object_id}
                                        </div>
                                    </td>
                                    <td style={{...tdStyle, width:'20%'}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                            <div style={{
                                                width:'32px', height:'32px', borderRadius:'10px', 
                                                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', 
                                                display:'flex', alignItems:'center', justifyContent:'center', 
                                                fontSize:'0.85rem', fontWeight:'800', color:'#4b5563',
                                                boxShadow:'0 2px 5px rgba(0,0,0,0.05)'
                                            }}>
                                                {log.actor_name ? log.actor_name.charAt(0).toUpperCase() : 'S'}
                                            </div>
                                            <div>
                                                <div style={{color:'#334155', fontWeight:'700', fontSize:'0.85rem'}}>{log.actor_name || 'System Admin'}</div>
                                                <div style={{fontSize:'0.7rem', color:'#94a3b8', fontWeight:'600'}}>Super Administrator</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{...tdStyle, width:'15%'}}>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px', background:'#f1f5f9', padding:'5px 10px', borderRadius:'8px', width:'fit-content', border:'1px solid #e2e8f0'}}>
                                            <Monitor size={12} color="#64748b"/> 
                                            <span style={{fontFamily:'monospace', color:'#475569', fontWeight:'700', fontSize:'0.8rem'}}>{log.ip_address || '127.0.0.1'}</span>
                                        </div>
                                    </td>
                                    <td style={{...tdStyle, width:'15%'}}>
                                        <div style={{color:'#64748b', fontSize:'0.8rem', fontWeight:'600', display:'flex', alignItems:'center', gap:'6px'}}>
                                            <Clock size={14} color="#94a3b8"/>
                                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    </td>
                                    <td style={{...tdStyle, width:'15%', textAlign: 'center'}}>
                                        <motion.button 
                                            whileHover={{ scale: 1.15, backgroundColor: '#eef2ff', color: '#4f46e5', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleViewLog(log)}
                                            style={viewBtn}
                                        >
                                            <Eye size={18} /> <span style={{fontSize:'0.8rem', fontWeight:'600', marginLeft:'5px'}}>View</span>
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </motion.tbody>
                </table>
            </div>
        </motion.div>

      </div>

      {/* ✨ Glassmorphism Detail Modal (Springy Animation) */}
      <AnimatePresence>
        {selectedLog && (
            <div style={{position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(15, 23, 42, 0.6)', backdropFilter:'blur(12px)'}}>
                <motion.div 
                    variants={modalVariants}
                    initial="hidden" animate="visible" exit="exit"
                    style={{width:'550px', background:'white', borderRadius:'24px', padding:'35px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.4)', position:'relative'}}
                >
                    <motion.button 
                        whileHover={{rotate:90, scale:1.1, backgroundColor:'#e2e8f0'}} 
                        whileTap={{scale:0.9}} 
                        onClick={() => setSelectedLog(null)} 
                        style={{position:'absolute', right:'25px', top:'25px', background:'#f1f5f9', border:'none', borderRadius:'50%', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b'}}
                    >
                        <X size={20}/>
                    </motion.button>
                    
                    <div style={{marginBottom:'30px', display:'flex', alignItems:'center', gap:'18px'}}>
                        <motion.div 
                          initial={{rotate:-20, scale:0.5}} animate={{rotate:0, scale:1}} transition={{type:'spring'}}
                          style={{width:'56px', height:'56px', borderRadius:'18px', background:'#f0f9ff', color:'#0ea5e9', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 8px 16px -4px rgba(14, 165, 233, 0.2)'}}
                        >
                            <ShieldCheck size={30}/>
                        </motion.div>
                        <div>
                            <div style={{fontSize:'0.8rem', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px'}}>Audit ID #{selectedLog.id}</div>
                            <h2 style={{fontSize:'1.6rem', fontWeight:'800', color:'#1e293b', margin:0}}>Event Details</h2>
                        </div>
                    </div>

                    <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} style={{background:'#f8fafc', borderRadius:'20px', padding:'25px', border:'1px solid #e2e8f0', marginBottom:'25px'}}>
                        <DetailRow label="Action Type" value={selectedLog.action_type} highlight />
                        <DetailRow label="Target Entity" value={`${selectedLog.target_repr} (${selectedLog.target_model})`} />
                        <DetailRow label="Performed By" value={selectedLog.actor_name || 'System Admin'} />
                        <DetailRow label="Source IP" value={selectedLog.ip_address} />
                        <DetailRow label="Timestamp" value={new Date(selectedLog.timestamp).toLocaleString()} />
                    </motion.div>

                    <div style={{fontSize:'0.9rem', fontWeight:'700', color:'#475569', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px'}}><Activity size={16}/> System Changes Log:</div>
                    <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.2}} style={{background:'#1e293b', color:'#e2e8f0', padding:'20px', borderRadius:'16px', fontFamily:'monospace', fontSize:'0.9rem', lineHeight:'1.6', border:'1px solid #334155', boxShadow:'inset 0 2px 10px rgba(0,0,0,0.2)'}}>
                        {selectedLog.details || "No detailed system changes recorded for this event."}
                    </motion.div>

                    <motion.button 
                        whileHover={{scale:1.02, boxShadow:'0 15px 25px -5px rgba(99, 102, 241, 0.5)'}} 
                        whileTap={{scale:0.98}}
                        onClick={() => setSelectedLog(null)}
                        style={{width:'100%', marginTop:'30px', padding:'14px', background:'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color:'white', border:'none', borderRadius:'16px', fontWeight:'700', fontSize:'1rem', cursor:'pointer', boxShadow:'0 8px 20px -5px rgba(99, 102, 241, 0.4)'}}
                    >
                        Close Details
                    </motion.button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ✨ Helper Components & Styles
const DetailRow = ({ label, value, highlight }) => (
    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'14px', borderBottom:'1px dashed #e2e8f0', paddingBottom:'10px'}}>
        <span style={{color:'#64748b', fontSize:'0.95rem', fontWeight:'500'}}>{label}</span>
        <span style={{color: highlight ? '#4f46e5' : '#1e293b', fontWeight: highlight ? '800' : '600', fontSize:'0.95rem'}}>{value}</span>
    </div>
);

const StatCard = ({ title, value, icon, color, bg, desc, trend, trendColor }) => (
    <motion.div 
        whileHover={{ y: -8, boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)' }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{background:'white', padding:'22px', borderRadius:'20px', boxShadow:'0 4px 20px -2px rgba(0,0,0,0.03)', border:'1px solid #f1f5f9', position:'relative', overflow:'hidden'}}
    >
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18px'}}>
            <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                style={{width:'50px', height:'50px', borderRadius:'14px', background: bg, color: color, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 16px -4px ${color}40`}}
            >
                {icon}
            </motion.div>
            {value !== '--' && (
                <div style={{background: `${trendColor}15`, color: trendColor, fontSize:'0.7rem', fontWeight:'800', padding:'5px 10px', borderRadius:'20px', display:'flex', alignItems:'center', gap:'4px'}}>
                    {trend}
                </div>
            )}
        </div>
        <div style={{fontSize:'2rem', fontWeight:'900', color:'#1e293b', lineHeight:'1', marginBottom:'6px'}}>{value}</div>
        <div style={{fontSize:'0.9rem', color:'#64748b', fontWeight:'700'}}>{title}</div>
        <div style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:'4px', fontWeight:'500'}}>{desc}</div>
        
        {/* Decorative Circle */}
        <div style={{position:'absolute', right:'-20px', bottom:'-20px', width:'90px', height:'90px', borderRadius:'50%', background: bg, opacity:0.4, filter:'blur(25px)'}}></div>
    </motion.div>
);

// ✨ Premium Styles
const primaryBtn = { display:'flex', alignItems:'center', gap:'10px', background:'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color:'white', border:'none', padding:'10px 20px', borderRadius:'12px', cursor:'pointer', fontWeight:'700', fontSize:'0.85rem', boxShadow:'0 8px 20px -5px rgba(15, 23, 42, 0.3)' };
const secondaryBtn = { display:'flex', alignItems:'center', gap:'10px', background:'white', color:'#475569', border:'1px solid #e2e8f0', padding:'10px 20px', borderRadius:'12px', cursor:'pointer', fontWeight:'700', fontSize:'0.85rem', boxShadow:'0 4px 10px -2px rgba(0,0,0,0.02)' };
const searchInput = { width:'100%', padding:'12px 14px 12px 45px', borderRadius:'12px', border:'1px solid #e2e8f0', fontSize:'0.9rem', outline:'none', background:'#f8fafc', color:'#1e293b', fontWeight:'600', transition:'all 0.3s' };
const filterBtn = { display:'flex', alignItems:'center', gap:'8px', background:'white', border:'1px solid #e2e8f0', padding:'10px 16px', borderRadius:'12px', cursor:'pointer', fontWeight:'700', color:'#64748b', fontSize:'0.8rem', boxShadow:'0 2px 5px rgba(0,0,0,0.02)' };
const thStyle = { padding:'18px 24px', fontSize:'0.7rem', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px', borderBottom:'none' };
const tdStyle = { padding:'18px 24px', verticalAlign:'middle' };
const viewBtn = { background:'white', border:'1px solid #e2e8f0', padding:'6px 12px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b', gap:'5px', boxShadow:'0 2px 5px rgba(0,0,0,0.02)' };