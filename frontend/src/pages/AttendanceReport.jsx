import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCw, ShieldCheck } from "lucide-react";

export default function AttendanceReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚀 FIX 1: URL exactly matched with your Django urls.py (eligibility/<batch_id>/)
    api.get("attendance/eligibility/1/")
      .then(res => {
        setReport(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        toast.error("Database connection failed. Showing demo data.");
        // Fallback mock data if backend fails, so UI doesn't break
        setReport([
          { student: "Amit Verma", percentage: 85, eligible: true },
          { student: "Sanjana Roy", percentage: 62, eligible: false },
          { student: "Rahul Das", percentage: 78, eligible: true },
          { student: "Karan Singh", percentage: 92, eligible: true }
        ]);
        setLoading(false);
      });
  }, []);

  return (
    // 🚀 FIX 2: Added 'report-mobile-fix' class to handle scrolling
    <div className="dashboard-container report-mobile-fix">
      <SidebarModern />
      <Toaster position="top-right" />
      
      <div className="report-main-content">
        <header style={{ marginBottom: '40px' }}>
          <h1 className="main-title" style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>Attendance Analytics</h1>
          <p className="sub-title" style={{ color: '#64748b', marginTop: '5px' }}>Lecture-wise monthly reports and eligibility tracking.</p>
        </header>

        <div className="pro-card">
          
          {/* 🚀 Mobile Scroll Wrapper for Table */}
          <div className="table-responsive-wrapper hide-scrollbar">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>ATTENDANCE PROGRESS</th>
                  <th>ELIGIBILITY</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr>
                        <td colSpan="3" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                            <RefreshCw className="animate-spin" size={24} style={{margin: '0 auto 10px'}} />
                            Fetching analytics...
                        </td>
                    </tr>
                ) : report.length === 0 ? (
                    <tr>
                        <td colSpan="3" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                            <ShieldCheck size={40} style={{margin: '0 auto 10px', opacity: 0.5}} />
                            No analytics data found for this batch.
                        </td>
                    </tr>
                ) : report.map((r, index) => (
                  <tr key={index} className="animated-row">
                    <td className="student-name-cell">{r.student}</td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ 
                            width: `${r.percentage}%`, 
                            background: r.percentage < 75 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #10b981, #34d399)'
                          }}></div>
                        </div>
                        <span className="progress-text">{r.percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`eligibility-badge ${r.eligible ? 'safe' : 'danger'}`}>
                        ● {r.eligible ? "Eligible" : "Shortage"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✨ CSS STYLES WITH 100% UNLOCKED MOBILE SCROLL */}
      <style>{`
        /* Desktop Base */
        .report-mobile-fix {
            display: flex;
            background: #f8fafc;
            min-height: 100vh;
            overflow-x: hidden;
            font-family: 'Inter', sans-serif;
        }

        .report-main-content {
            flex: 1;
            padding: 40px;
            margin-left: 280px;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }

        .pro-card {
            background: white;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            border: 1px solid #f1f5f9;
        }

        .table-responsive-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Modern Table Styles (Keeping your UI intact) */
        .modern-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .modern-table th { padding: 15px; background: #f8fafc; text-align: left; color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
        .modern-table td { padding: 18px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .animated-row { transition: 0.3s; }
        .animated-row:hover { background: #fcfdfe; }
        
        .student-name-cell { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        
        .progress-container { display: flex; align-items: center; gap: 15px; }
        .progress-track { flex: 1; background: #e2e8f0; height: 10px; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px; }
        .progress-text { font-weight: 800; color: #334155; min-width: 45px; text-align: right; }

        .eligibility-badge { padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; }
        .eligibility-badge.safe { background: #dcfce7; color: #166534; }
        .eligibility-badge.danger { background: #fee2e2; color: #991b1b; }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        /* =========================================================
           📱 100% BULLETPROOF MOBILE SCROLL FIX
           ========================================================= */
        @media (max-width: 850px) {
            
            /* Break the layout flex behavior to force natural page scroll */
            .report-mobile-fix {
                display: block !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
            }

            .report-main-content {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 90px !important; /* Spacing for mobile top header */
                padding-bottom: 40px !important; /* Space at bottom so nothing touches edge */
                width: 100% !important;
                display: block !important;
                height: auto !important; /* Unlock height completely */
                overflow: visible !important; /* Allow page to scroll natively */
            }

            .main-title { font-size: 1.8rem !important; margin-bottom: 8px !important; }
            .sub-title { font-size: 0.9rem !important; margin-bottom: 20px !important; }
            
            .pro-card { 
                padding: 15px !important; 
                display: block !important;
                height: auto !important;
                overflow: visible !important;
            }
            
            .table-responsive-wrapper {
                display: block !important;
            }
        }
      `}</style>
    </div>
  );
}