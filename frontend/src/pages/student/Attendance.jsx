import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, XCircle, Clock, FileText, ChevronDown } from "lucide-react";

// --- HELPER COMPONENTS ---
const GlassCard = ({ children, className, style }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      background: "white",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
      padding: "25px",
      ...style
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: bgColor, padding: '20px', borderRadius: '16px', border: `1px solid ${color}40` }}>
    <div style={{ padding: '12px', background: 'white', borderRadius: '12px', color: color, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{title}</p>
      <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{value}</h3>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function StudentAttendance() {
  // Dummy Data (Backend se API ke through aayega)
  const [selectedMonth, setSelectedMonth] = useState("March 2026");

  const attendanceStats = {
    totalClasses: 45,
    present: 38,
    absent: 5,
    late: 2,
    percentage: 84.4
  };

  const recentLogs = [
    { id: 1, date: "03 March 2026", subject: "Physics - Thermodynamics", status: "Present", time: "10:00 AM" },
    { id: 2, date: "02 March 2026", subject: "Maths - Calculus", status: "Absent", time: "11:30 AM" },
    { id: 3, date: "01 March 2026", subject: "Chemistry - Kinetics", status: "Present", time: "09:00 AM" },
    { id: 4, date: "28 Feb 2026", subject: "English - Grammar", status: "Late", time: "10:15 AM" },
    { id: 5, date: "27 Feb 2026", subject: "Physics - Mechanics", status: "Present", time: "10:00 AM" },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Present': return { bg: '#dcfce7', color: '#059669', icon: <CheckCircle size={18} /> };
      case 'Absent': return { bg: '#fee2e2', color: '#e11d48', icon: <XCircle size={18} /> };
      case 'Late': return { bg: '#fef3c7', color: '#d97706', icon: <Clock size={18} /> };
      default: return { bg: '#f1f5f9', color: '#64748b', icon: <FileText size={18} /> };
    }
  };

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>
            My Attendance 📅
          </h1>
          <p style={{ color: '#64748b', marginTop: '5px', fontWeight: '500', fontSize: '1.05rem' }}>Track your daily presence and class logs.</p>
        </div>

        {/* Month Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
          <Calendar size={18} color="#6366f1" />
          <span style={{ fontWeight: '600', color: '#334155' }}>{selectedMonth}</span>
          <ChevronDown size={16} color="#94a3b8" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>

        {/* LEFT: SUMMARY & CHART */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GlassCard style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto', borderRadius: '50%', background: `conic-gradient(#10b981 ${attendanceStats.percentage}%, #f1f5f9 0)` }}>
              <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{attendanceStats.percentage}%</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Overall</span>
              </div>
            </div>
            <h3 style={{ marginTop: '25px', fontSize: '1.2rem', color: '#1e293b' }}>Great Job! Keep it up. 🌟</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0 0 0' }}>You need 75% minimum to appear in finals.</p>
          </GlassCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            <StatCard title="Total Present" value={attendanceStats.present} icon={<CheckCircle size={24} />} color="#10b981" bgColor="#ecfdf5" />
            <StatCard title="Total Absent" value={attendanceStats.absent} icon={<XCircle size={24} />} color="#ef4444" bgColor="#fef2f2" />
            <StatCard title="Late Arrivals" value={attendanceStats.late} icon={<Clock size={24} />} color="#f59e0b" bgColor="#fffbeb" />
          </div>
        </div>

        {/* RIGHT: ATTENDANCE LOGS TABLE */}
        <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Recent Class Logs</h2>
            <button style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Apply Leave</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <th style={{ padding: '15px 25px', textAlign: 'left', fontWeight: '700' }}>Date & Time</th>
                  <th style={{ padding: '15px 25px', textAlign: 'left', fontWeight: '700' }}>Subject / Class</th>
                  <th style={{ padding: '15px 25px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, index) => {
                  const statusStyle = getStatusStyle(log.status);
                  return (
                    <tr key={log.id} style={{ borderBottom: index !== recentLogs.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '18px 25px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{log.date}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>{log.time}</div>
                      </td>
                      <td style={{ padding: '18px 25px', fontWeight: '600', color: '#475569' }}>
                        {log.subject}
                      </td>
                      <td style={{ padding: '18px 25px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: statusStyle.bg, color: statusStyle.color, padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                          {statusStyle.icon} {log.status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* View All Button */}
          <div style={{ padding: '15px', textAlign: 'center', borderTop: '1px solid #f1f5f9', cursor: 'pointer', color: '#6366f1', fontWeight: '700', fontSize: '0.9rem', background: '#fafafa' }}>
            View Complete History
          </div>
        </GlassCard>

      </div>
    </div>
  );
}