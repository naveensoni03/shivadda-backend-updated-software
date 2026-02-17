import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCw, ShieldCheck } from "lucide-react";

export default function AttendanceReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("attendance/eligibility/1/")
      .then(res => {
        setReport(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        toast.error("Database connection failed. Showing demo data.");
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
    <div className="dashboard-container report-mobile-fix">
      <SidebarModern />
      <Toaster position="top-right" />
      
      <div className="report-main-content">
        <header className="mobile-header-spacing">
          <h1 className="main-title">Attendance Analytics</h1>
          <p className="sub-title">Lecture-wise monthly reports and eligibility tracking.</p>
        </header>

        <div className="pro-card">
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

      {/* ✨ 100% BULLETPROOF CSS */}
      <style>{`
        /* Desktop Base */
        .report-mobile-fix {
            display: flex;
            background: #f8fafc;
            min-height: 100vh;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden; /* X-axis scroll lock */
            font-family: 'Inter', sans-serif;
        }

        .report-main-content {
            flex: 1;
            padding: 40px;
            margin-left: 280px;
            width: calc(100% - 280px); /* Strict width to prevent overflow */
            box-sizing: border-box;
            transition: all 0.3s ease;
        }

        .mobile-header-spacing {
            margin-bottom: 40px;
        }

        .main-title {
            font-size: 2.5rem;
            font-weight: 900;
            color: #1e293b;
            margin: 0;
            line-height: 1.2;
        }

        .sub-title {
            color: #64748b;
            margin-top: 5px;
        }

        .pro-card {
            background: white;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            border: 1px solid #f1f5f9;
            width: 100%;
            box-sizing: border-box;
        }

        .table-responsive-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch; /* Smooth mobile scroll */
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .modern-table { width: 100%; border-collapse: collapse; min-width: 550px; }
        .modern-table th { padding: 15px; background: #f8fafc; text-align: left; color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
        .modern-table td { padding: 18px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .animated-row { transition: 0.3s; }
        .animated-row:hover { background: #fcfdfe; }
        
        .student-name-cell { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        
        .progress-container { display: flex; align-items: center; gap: 15px; }
        .progress-track { flex: 1; background: #e2e8f0; height: 10px; border-radius: 10px; overflow: hidden; min-width: 100px; }
        .progress-fill { height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px; }
        .progress-text { font-weight: 800; color: #334155; min-width: 45px; text-align: right; }

        .eligibility-badge { padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
        .eligibility-badge.safe { background: #dcfce7; color: #166534; }
        .eligibility-badge.danger { background: #fee2e2; color: #991b1b; }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        /* =========================================================
           📱 MOBILE RESPONSIVE FIX (All Devices)
           ========================================================= */
        @media (max-width: 850px) {
            .report-mobile-fix {
                display: block !important;
                width: 100vw !important;
            }

            .report-main-content {
                margin-left: 0 !important;
                width: 100% !important;
                padding: 85px 15px 30px 15px !important; /* Top padding adjust for mobile navbar */
            }

            .mobile-header-spacing {
                margin-bottom: 25px !important;
            }

            .main-title { 
                font-size: 1.8rem !important; 
            }
            
            .sub-title { 
                font-size: 0.9rem !important; 
            }
            
            .pro-card { 
                padding: 15px !important; 
                border-radius: 15px !important;
            }

            .modern-table td, .modern-table th {
                padding: 12px 10px !important; /* Tighter spacing for mobile */
            }
        }

        /* For very small screens (iPhone SE, Galaxy Fold) */
        @media (max-width: 400px) {
            .main-title { font-size: 1.5rem !important; }
            .report-main-content { padding-left: 10px !important; padding-right: 10px !important; }
        }
      `}</style>
    </div>
  );
}