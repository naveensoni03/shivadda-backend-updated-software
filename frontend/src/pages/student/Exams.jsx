import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { Clock, Award, AlertCircle, CheckCircle, Download, Loader2, Eye, X } from "lucide-react";

import StudentSidebar from "../../components/StudentSidebar";

export default function StudentExams() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

  const [upcomingExams, setUpcomingExams] = useState([]);
  const [pastResults, setPastResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptAnswers, setAttemptAnswers] = useState([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // navigate("/student/login"); 
    } else {
      fetchExams();
      fetchResults();
    }
  }, [navigate]);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("exams/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      const formattedExams = data.map((exam, index) => ({
        id: exam.id,
        subject: exam.title || `Exam ${index + 1}`,
        date: exam.exam_date || "To be announced",
        time: exam.start_time ? `${exam.start_time.substring(0, 5)}` : "Flexible",
        duration: exam.duration_minutes ? `${exam.duration_minutes} Mins` : "TBA",
        type: exam.exam_type || "Online Exam",
        syllabus: exam.subject_name || "Refer to course modules",
        total_marks: exam.max_marks || 100
      }));
      setUpcomingExams(formattedExams);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await api.get("exams/my-results/");
      setPastResults(res.data);
    } catch (error) {
      console.error("Failed to load results:", error);
    }
  };

  const handleViewExamSheet = async (attempt) => {
    setSelectedAttempt(attempt);
    setIsDetailsLoading(true);
    try {
      const res = await api.get(`exams/attempt/${attempt.id}/details/`);
      setAttemptAnswers(res.data.answers);
    } catch (error) {
      console.error("Failed to load exam details", error);
      toast.error("Could not fetch detailed exam sheet.");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleViewGuidelines = (examId) => navigate(`/student/exam/${examId}`);

  const containerStagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } }, exit: { opacity: 0, transition: { duration: 0.2 } } };
  const cardFadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

  return (
    <div className="student-layout">
      <div className="ambient-bg"></div>
      <Toaster position="top-right" />
      <StudentSidebar />

      <main className="student-main-content">
        <div className="content-wrapper">
          <motion.header className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <h1 className="page-title">Exams & Results 📝</h1>
              <p className="page-subtitle">Track your academic performance and upcoming tests.</p>
            </div>
          </motion.header>

          <motion.div className="stats-row" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <div className="stat-box glass-panel">
              <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}><Award size={24} /></div>
              <div><h3>Overall Grade</h3><p>A- (84%)</p></div>
            </div>
            <div className="stat-box glass-panel">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><AlertCircle size={24} /></div>
              <div><h3>Upcoming Exams</h3><p>{isLoading ? '...' : upcomingExams.length} Scheduled</p></div>
            </div>
            <div className="stat-box glass-panel">
              <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}><CheckCircle size={24} /></div>
              <div><h3>Exams Cleared</h3><p>{pastResults.length} Subjects</p></div>
            </div>
          </motion.div>

          <div className="custom-tabs">
            <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>📅 Upcoming Exams</button>
            <button className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>📊 Past Results</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={containerStagger} initial="hidden" animate="show" exit="exit">

              {activeTab === 'upcoming' && (
                isLoading ? (
                  <div className="loader-container"><Loader2 size={40} className="spinner" color="#4f46e5" /><p>Syncing exams from database...</p></div>
                ) : upcomingExams.length > 0 ? (
                  <div className="exam-grid">
                    {upcomingExams.map((exam) => (
                      <motion.div key={exam.id} className="exam-card glass-panel" variants={cardFadeUp} whileHover={{ y: -5 }}>
                        <div className="exam-card-header">
                          <span className="exam-type">{exam.type}</span>
                          <span className="exam-duration"><Clock size={14} /> {exam.duration}</span>
                        </div>
                        <h3 className="exam-subject">{exam.subject}</h3>
                        <div className="exam-details">
                          <p><strong>Date:</strong> {exam.date}</p>
                          <p><strong>Time:</strong> {exam.time}</p>
                          <p className="syllabus"><strong>Syllabus:</strong> {exam.syllabus}</p>
                        </div>
                        <button className="btn-primary full-width mt-15" onClick={() => handleViewGuidelines(exam.id)}>View Guidelines / Start Exam</button>
                      </motion.div>
                    ))}
                  </div>
                ) : <motion.div className="empty-state glass-panel" variants={cardFadeUp}><span style={{ fontSize: '3rem' }}>🌴</span><h3>No Upcoming Exams</h3></motion.div>
              )}

              {activeTab === 'results' && (
                <div className="results-list">
                  {pastResults.length > 0 ? pastResults.map((res) => (
                    <motion.div key={res.id} className="result-item glass-panel" variants={cardFadeUp} whileHover={{ x: 5, borderLeft: "5px solid var(--primary)" }}>
                      <div className="res-info">
                        <div className="res-icon">🏆</div>
                        <div>
                          <h3>{res.subject}</h3>
                          <p>Conducted on: {res.date}</p>
                        </div>
                      </div>
                      <div className="res-score-area">
                        <div className="score-block">
                          <span className="score">{res.score}</span>
                          <span className="total">/ {res.total}</span>
                        </div>
                        <div className={`grade-badge ${res.grade === 'Fail' ? 'bg-red' : ''}`}>{res.grade}</div>

                        <button
                          className="btn-icon"
                          title="View Detailed Answer Sheet"
                          onClick={() => handleViewExamSheet(res)}
                          style={{ background: '#f5f3ff', color: '#8b5cf6', marginLeft: '10px' }}
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </motion.div>
                  )) : <motion.div className="empty-state glass-panel" variants={cardFadeUp}><span style={{ fontSize: '3rem' }}>📭</span><h3>No Past Results</h3></motion.div>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 🚀 STUDENT EXAM SHEET MODAL */}
      <AnimatePresence>
        {selectedAttempt && (
          <div className="modal-backdrop" style={{ alignItems: 'flex-start', paddingTop: '50px' }}>
            <motion.div className="exam-sheet-modal" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
              <div className="modal-header">
                <div>
                  <h2 style={{ margin: 0, color: '#0f172a' }}>My Result: {selectedAttempt.subject}</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Score: {selectedAttempt.score}/{selectedAttempt.total} | Grade: {selectedAttempt.grade}</p>
                </div>
                <button className="btn-close" onClick={() => setSelectedAttempt(null)}><X size={24} /></button>
              </div>

              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}>
                {isDetailsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="spinner" size={30} color="#4f46e5" /> <p>Loading your answer sheet...</p></div>
                ) : attemptAnswers.length > 0 ? (
                  attemptAnswers.map((ans, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: `1px solid ${ans.is_correct ? '#10b981' : '#e2e8f0'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ color: '#0f172a' }}>Question {idx + 1}</strong>
                        <span style={{ color: ans.is_correct ? '#10b981' : '#64748b', fontWeight: 'bold' }}>{ans.is_correct ? '+ Marks Awarded' : 'Pending/Incorrect'}</span>
                      </div>

                      <p style={{ fontSize: '1.1rem', margin: '0 0 15px 0', color: '#1e293b', fontWeight: '500' }}>
                        {ans.question_text || "No Question Text Found"}
                      </p>

                      {/* 🔥 FIX: RESPONSIVE GRID & WORD WRAP */}
                      <div className="answer-review-grid">
                        <div className="answer-box student-ans">
                          <span className="ans-label">You Selected/Wrote:</span>
                          <strong className="ans-text">
                            {(ans.selected_option && ans.selected_option.length === 1) ? `Option ${ans.selected_option}` : (ans.selected_option || 'Skipped')}
                          </strong>
                        </div>
                        <div className="answer-box correct-ans">
                          <span className="ans-label correct">Correct Answer:</span>
                          <strong className="ans-text correct">
                            {(ans.correct_option && ans.correct_option.length === 1) ? `Option ${ans.correct_option}` : (ans.correct_option || 'Subjective / Manual Check')}
                          </strong>
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}><p>No detailed answers found for this attempt.</p></div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        :root { --bg-gradient: linear-gradient(135deg, #f0f2f5 0%, #e6efff 100%); --glass-bg: rgba(255, 255, 255, 0.85); --glass-border: 1px solid rgba(255, 255, 255, 0.95); --text-main: #0f172a; --text-muted: #64748b; --primary: #4f46e5; }
        * { box-sizing: border-box; }
        .student-layout { display: flex; height: 100vh; width: 100%; background: var(--bg-gradient); font-family: 'Inter', sans-serif; overflow: hidden; position: relative; }
        .ambient-bg { position: absolute; inset: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(99,102,241,0.05) 0%, rgba(248,250,252,0) 60%); z-index: 0; pointer-events: none; }
        .student-main-content { flex: 1; margin-left: 280px; height: 100vh; overflow-y: auto; overflow-x: hidden; z-index: 1; transition: margin-left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); scroll-behavior: smooth; width: calc(100% - 280px); }
        .content-wrapper { padding: 40px; max-width: 1200px; margin: 0 auto; min-height: 100%;}
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(10px); border: var(--glass-border); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05); border-radius: 20px; transition: all 0.3s ease; }
        .page-header { margin-bottom: 30px; }
        .page-title { margin: 0 0 5px 0; font-size: 2.2rem; font-weight: 900; color: var(--text-main); }
        .page-subtitle { margin: 0; color: var(--text-muted); font-size: 1.05rem; font-weight: 500; }
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 35px; }
        .stat-box { padding: 20px; display: flex; align-items: center; gap: 15px; }
        .stat-icon { width: 55px; height: 55px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
        .stat-box h3 { margin: 0; font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-box p { margin: 5px 0 0 0; font-size: 1.4rem; font-weight: 800; color: var(--text-main); }
        .custom-tabs { display: flex; gap: 15px; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
        .custom-tabs::-webkit-scrollbar { display: none; }
        .tab-btn { background: transparent; border: none; font-size: 1.05rem; font-weight: 700; color: var(--text-muted); padding: 10px 20px; cursor: pointer; position: relative; transition: 0.3s; }
        .tab-btn:hover { color: var(--primary); }
        .tab-btn.active { color: var(--primary); }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -12px; left: 0; width: 100%; height: 3px; background: var(--primary); border-radius: 5px 5px 0 0; }
        .exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .exam-card { padding: 25px; border: 1px solid #e2e8f0;}
        .exam-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .exam-type { background: #e0e7ff; color: #4f46e5; padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .exam-duration { display: flex; align-items: center; gap: 5px; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .exam-subject { margin: 0 0 15px 0; font-size: 1.2rem; color: var(--text-main); font-weight: 800; }
        .exam-details p { margin: 8px 0; font-size: 0.9rem; color: #334155; }
        .exam-details strong { color: var(--text-main); }
        .syllabus { background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 10px !important; }
        .mt-15 { margin-top: 15px; }
        .results-list { display: flex; flex-direction: column; gap: 15px; }
        .result-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border: 1px solid #e2e8f0;}
        .res-info { display: flex; align-items: center; gap: 15px; }
        .res-icon { font-size: 2rem; background: #fef3c7; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0;}
        .res-info h3 { margin: 0 0 5px 0; font-size: 1.1rem; color: var(--text-main); font-weight: 800; }
        .res-info p { margin: 0; font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
        .res-score-area { display: flex; align-items: center; gap: 20px; }
        .score-block { text-align: right; }
        .score { font-size: 1.5rem; font-weight: 900; color: var(--primary); }
        .total { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; margin-left: 3px; }
        .grade-badge { background: #10b981; color: white; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 1rem; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
        .bg-red { background: #ef4444 !important; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3) !important; }
        .btn-primary { background: linear-gradient(135deg, var(--primary), #7c3aed); color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); transform: translateY(-2px); }
        .full-width { width: 100%; }
        .btn-icon { border: none; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .btn-icon:hover { opacity: 0.8; transform: scale(1.05); }
        .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: var(--primary); font-weight: 600;}
        .spinner { animation: spin 1s linear infinite; margin-bottom: 15px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .empty-state { text-align: center; padding: 50px 20px; margin-top: 20px; }
        .empty-state h3 { color: var(--text-main); margin-bottom: 5px;}
        .empty-state p { color: var(--text-muted); }

        .modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; z-index: 9999; padding: 20px;}
        .exam-sheet-modal { background: white; border-radius: 20px; width: 100%; max-width: 900px; display: flex; flex-direction: column; box-shadow: 0 25px 50px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid #e2e8f0;}
        .btn-close { background: transparent; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; padding: 5px;}
        .btn-close:hover { color: #0f172a; }

        /* 🔥 FIX: ANSWER GRID CSS WITH WORD-WRAP */
        .answer-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
        .answer-box { padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; }
        .answer-box.student-ans { border-color: #cbd5e1; }
        .answer-box.correct-ans { background: #ecfdf5; border-color: #a7f3d0; }
        .ans-label { display: block; font-size: 0.85rem; color: #64748b; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;}
        .ans-label.correct { color: #059669; }
        .ans-text { display: block; color: #0f172a; font-size: 1.05rem; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; line-height: 1.6; }
        .ans-text.correct { color: #065f46; }

        @media (max-width: 1024px) {
            .student-main-content { margin-left: 0; width: 100%; }
            .content-wrapper { padding: 110px 30px 100px 30px; } 
        }
        @media (max-width: 768px) {
            .content-wrapper { padding: 95px 15px 80px 15px; }
            .result-item { flex-direction: column; align-items: flex-start; gap: 20px; }
            .res-score-area { width: 100%; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .exam-grid { grid-template-columns: 1fr; }
            .exam-sheet-modal { margin: 10px; max-height: 85vh; }
            .answer-review-grid { grid-template-columns: 1fr; gap: 15px; }
        }
      `}</style>
    </div>
  );
}