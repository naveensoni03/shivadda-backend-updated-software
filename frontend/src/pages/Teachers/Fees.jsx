import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, IndianRupee, BellRing,
  CheckCircle2, AlertCircle, FileText, Send, Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import api from "../../api/axios";

export default function TeacherFees() {
  const [feeRecords, setFeeRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isReminding, setIsReminding] = useState(false);

  // ==========================================
  // 1. 🔥 FETCH REAL FEES FROM BACKEND
  // ==========================================
  const fetchFees = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/fees/transactions/");

      const formattedData = response.data.map(item => ({
        id: item.roll || item.id,
        name: item.student,
        batch: item.class_name || item.class || "General",
        totalFee: item.total,
        paid: item.paid,
        pending: item.due,
        status: item.status,
      }));

      setFeeRecords(formattedData);
    } catch (error) {
      console.error("Error fetching fees:", error);
      toast.error("Failed to load fee records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // ==========================================
  // 2. CALCULATIONS FOR DASHBOARD CARDS
  // ==========================================
  const totalStudents = feeRecords.length;
  const totalExpected = feeRecords.reduce((sum, record) => sum + (record.totalFee || 0), 0);
  const totalCollected = feeRecords.reduce((sum, record) => sum + (record.paid || 0), 0);
  const totalPending = feeRecords.reduce((sum, record) => sum + (record.pending || 0), 0);
  const defaultersCount = feeRecords.filter(r => r.pending > 0).length;

  // ==========================================
  // 3. FILTER LOGIC
  // ==========================================
  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = (record.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // 4. 🔥 REAL ACTIONS
  // ==========================================

  const handleSendReminder = async (studentId, studentName, pendingAmount) => {
    try {
      const message = `Dear Parent, this is a gentle reminder that a fee amount of Rs.${pendingAmount} is pending for ${studentName}. Kindly clear the dues at your earliest convenience. Regards, ShivAdda.`;

      await api.post("/teachers/send-message/", {
        student_id: studentId,
        recipient_type: "parent",
        message: message
      });

      toast.success(`Reminder successfully sent to ${studentName}'s parents!`);
    } catch (error) {
      toast.error(`Failed to send reminder to ${studentName}.`);
      console.error(error);
    }
  };

  const handleRemindAll = async () => {
    const defaulters = feeRecords.filter(r => r.pending > 0);

    if (defaulters.length === 0) {
      toast.error("No pending dues to remind!");
      return;
    }

    setIsReminding(true);
    const loadingToast = toast.loading(`Sending ${defaulters.length} reminders...`);

    try {
      for (let student of defaulters) {
        const message = `Dear Parent, this is a gentle reminder that a fee amount of Rs.${student.pending} is pending for ${student.name}. Kindly clear the dues. Regards, ShivAdda.`;

        await api.post("/teachers/send-message/", {
          student_id: student.id,
          recipient_type: "parent",
          message: message
        });
      }
      toast.success(`Bulk reminder sent to ${defaulters.length} parents!`, { id: loadingToast });
    } catch (error) {
      toast.error("Some reminders failed to send.", { id: loadingToast });
    } finally {
      setIsReminding(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/fees/download/', { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fee_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("CSV Downloaded!");
    } catch (error) {
      toast.error("Failed to download CSV.");
    }
  };

  return (
    <div className="fees-wrapper">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="fees-header">
        <div>
          <h1 className="page-title">Class Fee Status</h1>
          <p className="page-subtitle">Track your students' fee payments and send real-time reminders.</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={handleExportCSV}>
            <FileText size={18} /> Export List
          </button>
          <button className="remind-all-btn" onClick={handleRemindAll} disabled={isReminding}>
            {isReminding ? <Loader2 size={18} className="spin-icon" /> : <BellRing size={18} />}
            {isReminding ? "Sending..." : "Remind Defaulters"}
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-cards-container">
        <motion.div className="summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-icon blue"><IndianRupee size={24} /></div>
          <div className="card-info">
            <p>Total Expected</p>
            <h3>₹{totalExpected.toLocaleString('en-IN')}</h3>
          </div>
        </motion.div>

        <motion.div className="summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card-icon green"><CheckCircle2 size={24} /></div>
          <div className="card-info">
            <p>Total Collected</p>
            <h3>₹{totalCollected.toLocaleString('en-IN')}</h3>
          </div>
        </motion.div>

        <motion.div className="summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card-icon red"><AlertCircle size={24} /></div>
          <div className="card-info">
            <p>Pending Amount</p>
            <h3 className="text-red">₹{totalPending.toLocaleString('en-IN')}</h3>
          </div>
        </motion.div>

        <motion.div className="summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="card-icon orange"><BellRing size={24} /></div>
          <div className="card-info">
            <p>Defaulter Students</p>
            <h3>{defaultersCount} / {totalStudents}</h3>
          </div>
        </motion.div>
      </div>

      {/* LIST SECTION */}
      <div className="table-section-wrapper">
        <div className="table-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search student by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <Filter size={18} className="filter-icon" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student Info</th>
                <th>Batch</th>
                <th>Total Fee</th>
                <th>Paid Amount</th>
                <th>Pending Dues</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <Loader2 size={40} className="spin-icon" color="#3b82f6" style={{ margin: "0 auto" }} />
                    <p>Loading fee records from database...</p>
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={index}>
                    <td>
                      <div className="student-info-cell">
                        <div className="avatar">{(record.name || "U").charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="student-name">{record.name}</p>
                          <p className="student-id">{record.id}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="batch-badge">{record.batch}</span></td>
                    <td className="amount-cell">₹{Number(record.totalFee).toLocaleString('en-IN')}</td>
                    <td className="amount-cell text-green">₹{Number(record.paid).toLocaleString('en-IN')}</td>
                    <td className={`amount-cell ${record.pending > 0 ? 'text-red font-bold' : ''}`}>
                      ₹{Number(record.pending).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`status-badge ${(record.status || "pending").toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn-send"
                        disabled={record.pending <= 0}
                        onClick={() => handleSendReminder(record.id, record.name, record.pending)}
                        title="Send SMS/Email Reminder"
                      >
                        <Send size={16} />
                        {record.pending > 0 ? "Remind" : "Clear"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <AlertCircle size={40} color="#cbd5e1" style={{ margin: "0 auto" }} />
                    <p>No student fee records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
            .fees-wrapper { 
                padding: 20px; 
                font-family: 'Inter', system-ui, sans-serif; 
                background-color: #f8fafc; 
                min-height: calc(100vh - 70px); 
            }
            .fees-wrapper * { box-sizing: border-box; margin: 0; padding: 0; }
            .spin-icon { animation: spin 1s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }

            /* Header */
            .fees-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; }
            .page-title { font-size: 1.8rem; color: #0f172a; font-weight: 700; margin-bottom: 5px; }
            .page-subtitle { color: #64748b; font-size: 0.95rem; }
            .header-actions { display: flex; gap: 12px; }
            
            .export-btn, .remind-all-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; border: none; }
            .export-btn { background: #ffffff; color: #475569; border: 1px solid #e2e8f0; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
            .export-btn:hover { background: #f1f5f9; color: #0f172a; }
            .remind-all-btn { background: #ef4444; color: white; box-shadow: 0 4px 10px rgba(239,68,68,0.2); }
            .remind-all-btn:hover:not(:disabled) { background: #dc2626; transform: translateY(-2px); }
            .remind-all-btn:disabled { opacity: 0.7; cursor: not-allowed; }

            /* Summary Cards */
            .summary-cards-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .summary-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
            .card-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .card-icon.blue { background: #eff6ff; color: #3b82f6; }
            .card-icon.green { background: #ecfdf5; color: #10b981; }
            .card-icon.red { background: #fef2f2; color: #ef4444; }
            .card-icon.orange { background: #fff7ed; color: #f59e0b; }
            
            .card-info p { color: #64748b; font-size: 0.85rem; font-weight: 500; margin-bottom: 5px; }
            .card-info h3 { color: #0f172a; font-size: 1.4rem; font-weight: 700; }
            .text-red { color: #ef4444 !important; }
            .text-green { color: #10b981 !important; }
            .font-bold { font-weight: 700; }

            /* Table Section */
            .table-section-wrapper { 
                background: white; border-radius: 16px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; 
                overflow: hidden; 
            }
            .table-controls { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; gap: 15px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
            .search-box { position: relative; flex: 1; max-width: 400px; }
            .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
            .search-box input { width: 100%; padding: 10px 15px 10px 40px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; outline: none; transition: 0.2s; }
            .search-box input:focus { border-color: #3b82f6; background: white; }

            .filter-box { position: relative; }
            .filter-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none;}
            .filter-box select { padding: 10px 15px 10px 40px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; outline: none; cursor: pointer; color: #334155; appearance: none; min-width: 150px; }
            .filter-box select:focus { border-color: #3b82f6; }

            /* 🔥 DESKTOP FIX: Table Container with HIDDEN SCROLLBAR 🔥 */
            .table-container { 
                width: 100%; 
                overflow-x: auto; 
                overflow-y: auto; 
                max-height: calc(100vh - 360px); 
                min-height: 250px; 
                /* Hide scrollbar for IE, Edge and Firefox */
                -ms-overflow-style: none;  
                scrollbar-width: none;  
            }
            /* Hide scrollbar for Chrome, Safari and Opera */
            .table-container::-webkit-scrollbar {
                display: none;
            }

            .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
            
            /* Sticky Header */
            .custom-table th { 
                position: sticky; 
                top: 0; 
                z-index: 10; 
                background: #f8fafc; 
                padding: 15px 20px; color: #475569; font-weight: 600; font-size: 0.85rem; 
                text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; 
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            
            .custom-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
            .custom-table tr:hover td { background: #f8fafc; }
            
            .student-info-cell { display: flex; align-items: center; gap: 12px; }
            .avatar { width: 38px; height: 38px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; flex-shrink: 0;}
            .student-name { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
            .student-id { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
            
            .batch-badge { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;}
            
            /* 🔥 YAHAN FIX KIYA HAI: TEXT COLOR HAMESHA VISIBLE RAHEGA 🔥 */
            .amount-cell { 
                font-family: monospace; 
                font-size: 0.95rem; 
                color: #1e293b; /* Dark Navy Blue colour taaki text humesha dikhe */
                font-weight: 500;
            }

            .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block;}
            .status-badge.paid { background: #ecfdf5; color: #10b981; }
            .status-badge.partial { background: #fff7ed; color: #f59e0b; }
            .status-badge.pending, .status-badge.unpaid, .status-badge.overdue { background: #fef2f2; color: #ef4444; }

            .action-btn-send { display: flex; align-items: center; gap: 6px; background: white; border: 1px solid #e2e8f0; color: #3b82f6; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s; white-space: nowrap;}
            .action-btn-send:hover:not(:disabled) { background: #eff6ff; border-color: #bfdbfe; }
            .action-btn-send:disabled { color: #cbd5e1; border-color: #f1f5f9; cursor: not-allowed; background: transparent;}

            .empty-state { text-align: center; padding: 50px 20px !important; color: #94a3b8; }
            .empty-state p { margin-top: 10px; font-size: 1rem; }

            /* 🔥 MOBILE FIX: Pura Page Scroll Hoga 🔥 */
            @media (max-width: 768px) {
                .fees-wrapper {
                    height: calc(100vh - 60px); /* Fill screen height */
                    overflow-y: auto; /* Enable page scroll */
                    padding-bottom: 80px; /* Neeche ka content kate nahi */
                    /* Hide scrollbar for mobile */
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .fees-wrapper::-webkit-scrollbar {
                    display: none;
                }

                .fees-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                .header-actions { width: 100%; display: flex; flex-direction: column;}
                .export-btn, .remind-all-btn { width: 100%; justify-content: center;}
                .search-box { max-width: 100%; }
                .filter-box select { width: 100%; }
                .table-controls { flex-direction: column; align-items: stretch; }
                
                /* Remove table internal scroll height to prevent cut-off */
                .table-container { 
                    max-height: none; 
                    overflow-y: visible; 
                }
            }
            `}</style>
    </div>
  );
}