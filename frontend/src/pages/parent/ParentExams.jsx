import React, { useState, useEffect } from "react";
import SidebarParent from "../../components/SidebarParent";
import { motion } from "framer-motion";
import { Award, BookOpen, Download, Star, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";

export default function ParentExams() {
    const [loading, setLoading] = useState(true);
    const [childrenData, setChildrenData] = useState([]);
    const [selectedExam, setSelectedExam] = useState("");
    const [availableExams, setAvailableExams] = useState([]);

    useEffect(() => {
        fetchExamData();
    }, []);

    // 🚀 BACKEND SE REAL EXAM RESULTS MANGWANE WALA FUNCTION
    const fetchExamData = async () => {
        try {
            const response = await api.get("auth/parents/profile/exams/");
            const data = response.data;

            // Sabhi baccho ke saare exam terms nikalo dropdown ke liye
            const examSet = new Set();
            data.forEach(child => {
                Object.keys(child.examResults).forEach(ex => examSet.add(ex));
            });

            const examList = Array.from(examSet);
            setAvailableExams(examList);
            if (examList.length > 0) setSelectedExam(examList[0]);

            setChildrenData(data);
            setLoading(false);
        } catch (error) {
            console.error("Exams Fetch Error:", error);
            if (loading) toast.error("Failed to load exam results from server.");
            setLoading(false);
        }
    };

    const handleDownloadReport = (studentName, examName) => {
        const loadId = toast.loading(`Generating Official Report Card for ${studentName}...`);
        setTimeout(() => {
            toast.success(`Report Card (${examName}) Downloaded! 📥`, { id: loadId });
        }, 2000);
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

    return (
        <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            <SidebarParent />
            <Toaster position="top-center" />

            <div className="main-content hide-scrollbar">
                <div className="dashboard-top-nav">
                    <div className="search-placeholder">
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Exam Results & Marks</span>
                    </div>
                </div>

                <div className="header-section">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-hero">
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
                            Academic <span className="text-gradient">Results</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
                            View detailed marksheets and download official report cards.
                        </p>
                    </motion.div>

                    {/* Dynamic Exam Selector */}
                    {availableExams.length > 0 && (
                        <div className="exam-selector">
                            <label>Select Examination:</label>
                            <select
                                value={selectedExam}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                className="premium-select"
                            >
                                {availableExams.map((ex, i) => (
                                    <option key={i} value={ex}>{ex}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 size={40} className="spin" color="#4f46e5" /></div>
                ) : childrenData.length === 0 || availableExams.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ color: '#0f172a' }}>No Exam Results Found</h3>
                        <p style={{ color: '#64748b' }}>No evaluated exams are available for your children currently.</p>
                    </div>
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                        {childrenData.map((child, index) => {
                            const currentResult = child.examResults[selectedExam];

                            // Agar is bacche ne ye select kiya hua exam nahi diya, toh skip kardo
                            if (!currentResult) return null;

                            return (
                                <div key={index} style={{ marginBottom: '50px' }}>
                                    {/* Stats Cards */}
                                    <div className="stats-grid">
                                        <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
                                            <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}><TrendingUp size={24} /></div>
                                            <div><p>Overall Percentage</p><h3 style={{ color: '#4f46e5' }}>{currentResult.percentage}</h3></div>
                                        </div>
                                        <div className="stat-card" style={{ borderLeft: '4px solid #ec4899' }}>
                                            <div className="stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}><Award size={24} /></div>
                                            <div><p>CGPA / Rank</p><h3 style={{ color: '#ec4899' }}>{currentResult.overall_cgpa} <span style={{ fontSize: '1rem', color: '#64748b' }}>({currentResult.rank})</span></h3></div>
                                        </div>
                                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
                                            <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><CheckCircle size={24} /></div>
                                            <div><p style={{ color: '#d1fae5' }}>Final Status</p><h3 style={{ color: 'white', fontSize: '1.4rem' }}>{currentResult.result_status}</h3></div>
                                        </div>
                                    </div>

                                    {/* Detailed Marksheet Table */}
                                    <div className="table-card premium-shadow" style={{ marginTop: '30px' }}>
                                        <div className="table-header">
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>{selectedExam} - Grade Sheet</h3>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Student: {child.studentInfo.name} | Class: {child.studentInfo.class}</p>
                                            </div>
                                            <button className="download-btn" onClick={() => handleDownloadReport(child.studentInfo.name, selectedExam)}>
                                                <Download size={18} /> Download PDF
                                            </button>
                                        </div>

                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>Subject Name</th>
                                                    <th>Max Marks</th>
                                                    <th>Passing Marks</th>
                                                    <th>Marks Obtained</th>
                                                    <th>Grade</th>
                                                    <th>Teacher's Remark</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentResult.subjects.map((sub, i) => (
                                                    <motion.tr variants={itemVariants} key={i}>
                                                        <td style={{ fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <BookOpen size={16} color="#94a3b8" /> {sub.name}
                                                        </td>
                                                        <td style={{ color: '#64748b', fontWeight: '600' }}>{sub.total}</td>
                                                        <td style={{ color: '#64748b', fontWeight: '600' }}>{sub.passing}</td>
                                                        <td style={{ fontWeight: '900', color: '#4f46e5', fontSize: '1.1rem' }}>{sub.obtained}</td>
                                                        <td>
                                                            <span className="grade-pill">{sub.grade}</span>
                                                        </td>
                                                        <td style={{ color: '#475569', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Star size={14} color="#f59e0b" /> {sub.remark}
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="table-footer">
                                            <p><strong>Note:</strong> This is a digitally generated report card. For original hard copy, please contact the school administration.</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            <style>{`
                .main-content { flex: 1; margin-left: 280px; padding: 30px 50px 100px; height: 100vh; overflow-y: auto; overflow-x: hidden; width: calc(100% - 280px); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .dashboard-top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .search-placeholder { background: white; padding: 10px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
                
                .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
                .text-gradient { background: linear-gradient(to right, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                
                .exam-selector { display: flex; flex-direction: column; gap: 8px; }
                .exam-selector label { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                .premium-select { padding: 12px 20px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; font-size: 1rem; font-weight: 700; color: #0f172a; outline: none; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: 0.2s; min-width: 250px; }
                .premium-select:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }

                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
                .stat-card { background: white; padding: 25px; border-radius: 20px; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
                .stat-icon { width: 55px; height: 55px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
                .stat-card p { margin: 0 0 5px 0; font-size: 0.9rem; color: #64748b; font-weight: 600; }
                .stat-card h3 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 900; }

                .premium-shadow { background: white; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }
                .table-header { padding: 25px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fff; }
                
                .download-btn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; padding: 12px 20px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); }
                .download-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4); }

                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { text-align: left; padding: 15px 30px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 800; background: #f8fafc; }
                .modern-table td { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; }
                
                .grade-pill { background: #f1f5f9; color: #0f172a; padding: 6px 15px; border-radius: 8px; font-weight: 900; font-size: 0.9rem; border: 1px solid #e2e8f0; }
                
                .table-footer { padding: 20px 30px; background: #f8fafc; color: #64748b; font-size: 0.85rem; font-weight: 500; border-top: 1px solid #e2e8f0; }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .main-content { margin-left: 0; padding: 25px; padding-top: 80px; width: 100%; }
                    .header-section { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .modern-table { display: block; overflow-x: auto; }
                }
            `}</style>
        </div>
    );
}