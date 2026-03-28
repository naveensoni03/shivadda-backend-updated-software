import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Calendar as CalendarIcon, Clock,
  PlusCircle, Search, Edit, Trash2, CheckCircle, Plus, X, AlertTriangle,
  ChevronRight, LayoutGrid, CheckSquare, ArrowLeft, User, ImagePlus, Save, AlignLeft, Eye
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";

export default function TeacherExams() {
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [selectedResultExam, setSelectedResultExam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);

  // 🚀 STATE: Detailed Student Result dekhne ke liye
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const [testMeta, setTestMeta] = useState({
    title: "", subject: "", date: "", startTime: "", endTime: "", duration: "", marks: "", negativeMarks: "0"
  });

  const [questions, setQuestions] = useState([
    { id: Date.now(), type: "mcq", text: "", image: null, options: ["", "", "", ""], correctOption: 0 }
  ]);

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get("exams/");
      const formatted = response.data.map(ex => ({
        id: ex.id,
        title: ex.title,
        subject: ex.subject ? `Subject ID: ${ex.subject}` : "Assigned Subject",
        date: ex.exam_date || "",
        startTime: ex.start_time ? ex.start_time.substring(0, 5) : "",
        endTime: ex.end_time ? ex.end_time.substring(0, 5) : "",
        duration: ex.duration_minutes || "",
        marks: ex.max_marks || 0,
        status: ex.status || "upcoming"
      }));
      setExams(formatted);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const addQuestion = () => setQuestions([...questions, { id: Date.now(), type: "mcq", text: "", image: null, options: ["", "", "", ""], correctOption: 0 }]);
  const removeQuestion = (id) => questions.length > 1 ? setQuestions(questions.filter(q => q.id !== id)) : toast.error("At least one question required");

  const handleQuestionChange = (id, field, value, optIdx = null) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        if (field === 'text') return { ...q, text: value };
        if (field === 'type') return { ...q, type: value };
        if (field === 'image') return { ...q, image: value };
        if (field === 'correctOption') return { ...q, correctOption: value };
        if (field === 'options') {
          const newOpts = [...q.options];
          newOpts[optIdx] = value;
          return { ...q, options: newOpts };
        }
      }
      return q;
    }));
  };

  const handleSaveTest = async (e, statusToSave = "upcoming") => {
    e.preventDefault();
    if (statusToSave !== "draft") {
      if (!testMeta.title || !testMeta.date || !testMeta.startTime) {
        return toast.error("Please fill test title, date and time to publish!");
      }
    }
    const toastId = toast.loading("Saving Test securely...");
    setIsLoading(true);

    try {
      const payload = {
        title: testMeta.title,
        status: statusToSave,
        exam_date: testMeta.date || null,
        start_time: testMeta.startTime || null,
        end_time: testMeta.endTime || null,
        duration_minutes: testMeta.duration || 60,
        subject_string: testMeta.subject || "General"
      };

      let newExamId = editId;

      if (editId) {
        await api.put(`exams/${editId}/`, payload);
        toast.success(statusToSave === 'draft' ? "Draft Updated!" : "Test Updated Successfully!", { id: toastId });
      } else {
        const res = await api.post("exams/", payload);
        newExamId = res.data.id;
        for (let q of questions) {
          if (q.text.trim() !== "") {
            await api.post("questions/", {
              exam: newExamId,
              text: q.text,
              q_type: q.type,
              option_a: q.options[0],
              option_b: q.options[1],
              option_c: q.options[2],
              option_d: q.options[3],
              correct_option_index: q.correctOption
            });
          }
        }
        toast.success(statusToSave === 'draft' ? "Saved to Drafts!" : "Test Published Successfully!", { id: toastId });
      }
      fetchExams();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save test. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setActiveTab("list");
    setEditId(null);
    setTestMeta({ title: "", subject: "", date: "", startTime: "", endTime: "", duration: "", marks: "", negativeMarks: "0" });
    setQuestions([{ id: Date.now(), type: "mcq", text: "", image: null, options: ["", "", "", ""], correctOption: 0 }]);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`exams/${deleteId}/`);
      setExams(exams.filter(e => e.id !== deleteId));
      toast.success("Test Removed Successfully");
    } catch (error) {
      toast.error("Failed to delete test.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (exam) => {
    setEditId(exam.id);
    setTestMeta({
      title: exam.title, subject: exam.subject, date: exam.date,
      startTime: exam.startTime || "", endTime: exam.endTime || "",
      duration: exam.duration, marks: exam.marks, negativeMarks: exam.negativeMarks || "0"
    });
    setActiveTab("create");
  };

  const handleViewResults = async (exam) => {
    setSelectedResultExam(exam);
    setActiveTab("results");
    try {
      const res = await api.get(`exams/${exam.id}/results/`);
      setExamResults(res.data);
    } catch (error) {
      console.error("Failed to load results for teacher", error);
      toast.error("Failed to load student results");
    }
  };

  const handleViewStudentDetails = async (studentAttempt) => {
    setSelectedStudentDetails(studentAttempt);
    setIsDetailsLoading(true);

    try {
      const res = await api.get(`exams/attempt/${studentAttempt.id}/details/`);
      setStudentAnswers(res.data.answers);
    } catch (error) {
      console.error("Failed to load student exam details", error);
      toast.error("Could not fetch detailed exam sheet.");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const filteredExams = exams.filter(ex =>
    ex.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="premium-exam-wrapper">
      <Toaster position="top-right" />

      <div className="inner-container">
        <motion.div className="header-section" initial="hidden" animate="show" variants={fadeUp}>
          <div className="header-left">
            <div className="title-row">
              <div className="icon-box"><FileText size={28} color="#ffffff" /></div>
              <h1 className="main-title">Examinations</h1>
            </div>
            <p className="sub-title">Design assessments, track performance, and grade students seamlessly.</p>
          </div>

          {activeTab !== "results" && (
            <div className="segmented-control">
              <button className={`segment-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                <LayoutGrid size={18} /> View Tests
              </button>
              <button className={`segment-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
                <PlusCircle size={18} /> {editId ? "Editing Test" : "Create New"}
              </button>
            </div>
          )}
        </motion.div>

        {activeTab === "list" && (
          <motion.div initial="hidden" animate="show" variants={fadeIn}>
            <div className="search-wrapper">
              <Search size={22} className="search-icon" />
              <input
                type="text" placeholder="Search by test title or subject..."
                className="premium-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="premium-grid">
              {filteredExams.map((exam) => (
                <div key={exam.id} className="premium-card">
                  <div className="card-top-row">
                    <div className={`status-pill ${exam.status}`}>
                      <span className="pulsing-dot"></span>
                      {exam.status.toUpperCase()}
                    </div>
                    <div className="action-icons">
                      <button className="icon-btn edit" onClick={() => handleEdit(exam)} title="Edit"><Edit size={16} /></button>
                      <button className="icon-btn delete" onClick={() => setDeleteId(exam.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="card-middle">
                    <h3 className="exam-card-title">{exam.title || "Untitled Draft"}</h3>
                    <span className="exam-badge">{exam.subject || "No Subject"}</span>
                  </div>

                  <div className="card-metrics">
                    <div className="metric-item"><CalendarIcon size={14} /> <span>{exam.date || "TBD"}</span></div>
                    <div className="metric-item"><Clock size={14} /> <span>{exam.startTime ? `${exam.startTime} - ${exam.endTime}` : "Time TBD"}</span></div>
                    <div className="metric-item"><CheckSquare size={14} /> <span>{exam.marks || 0} Marks</span></div>
                  </div>

                  <div className="card-footer">
                    <button
                      className={`btn-full ${exam.status === 'completed' ? 'btn-outline' : 'btn-solid'}`}
                      onClick={() => handleViewResults(exam)}
                    >
                      View Results <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredExams.length === 0 && (
                <div className="empty-state">
                  <FileText size={48} color="#cbd5e1" />
                  <h3>No Tests Found</h3>
                  <p>Try a different search or create a new test to see it here and on student dashboard.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "create" && (
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="builder-wrapper">
            <form>
              <div className="builder-block">
                <div className="block-header">
                  <h3><span className="step-num">1</span> Test Configuration</h3>
                </div>
                <div className="premium-form-grid">
                  <div className="form-group full-span">
                    <label>Test Title</label>
                    <input type="text" placeholder="e.g. Current Electricity Checkpoint" value={testMeta.title} onChange={e => setTestMeta({ ...testMeta, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Target Subject</label>
                    <select value={testMeta.subject} onChange={e => setTestMeta({ ...testMeta, subject: e.target.value })} required>
                      <option value="" disabled>-- Select Subject --</option>
                      <option value="Class 12 Physics">Class 12 Physics</option>
                      <option value="Class 11 Chemistry">Class 11 Chemistry</option>
                      <option value="Class 10 Maths">Class 10 Maths</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Date</label><input type="date" value={testMeta.date} onChange={e => setTestMeta({ ...testMeta, date: e.target.value })} required /></div>
                  <div className="form-group"><label>Start Time</label><input type="time" value={testMeta.startTime} onChange={e => setTestMeta({ ...testMeta, startTime: e.target.value })} required /></div>
                  <div className="form-group"><label>End Time</label><input type="time" value={testMeta.endTime} onChange={e => setTestMeta({ ...testMeta, endTime: e.target.value })} required /></div>

                  <div className="form-group"><label>Duration (Minutes)</label><input type="number" placeholder="45" value={testMeta.duration} onChange={e => setTestMeta({ ...testMeta, duration: e.target.value })} required /></div>
                  <div className="form-group"><label>Total Marks</label><input type="number" placeholder="50" value={testMeta.marks} onChange={e => setTestMeta({ ...testMeta, marks: e.target.value })} required /></div>
                  <div className="form-group"><label>Negative Marking</label><input type="number" step="0.25" placeholder="e.g. 0.25" value={testMeta.negativeMarks} onChange={e => setTestMeta({ ...testMeta, negativeMarks: e.target.value })} /></div>
                </div>
              </div>

              <div className="builder-block no-padding-bottom">
                <div className="block-header split">
                  <h3><span className="step-num">2</span> Question Builder</h3>
                  <button type="button" className="btn-add" onClick={addQuestion}><Plus size={16} /> Add Next Question</button>
                </div>

                <div className="questions-list">
                  {questions.map((q, idx) => (
                    <motion.div key={q.id} className="q-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <div className="q-top">
                        <div className="q-top-left">
                          <h4>Q{idx + 1}.</h4>
                          <select className="q-type-select" value={q.type} onChange={e => handleQuestionChange(q.id, 'type', e.target.value)}>
                            <option value="mcq">Multiple Choice (MCQ)</option>
                            <option value="subjective">Subjective / Theory</option>
                          </select>
                        </div>
                        <button type="button" className="btn-remove" onClick={() => removeQuestion(q.id)}><Trash2 size={16} /></button>
                      </div>

                      <div className="q-body-wrap">
                        <textarea
                          className="q-textarea" placeholder="Write your question statement here..."
                          value={q.text} onChange={e => handleQuestionChange(q.id, 'text', e.target.value)} rows="2"
                        />
                        <div className="img-upload-wrap">
                          <input type="file" id={`file-${q.id}`} accept="image/*" className="hidden-file" onChange={(e) => handleQuestionChange(q.id, 'image', e.target.files[0])} />
                          <label htmlFor={`file-${q.id}`} className="img-upload-label">
                            <ImagePlus size={18} /> {q.image ? q.image.name : "Attach Image / Equation"}
                          </label>
                        </div>
                      </div>

                      {q.type === "mcq" ? (
                        <div className="opt-grid">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`opt-box ${q.correctOption === oIdx ? 'is-correct' : ''}`}>
                              <div className="radio-wrap">
                                <input type="radio" checked={q.correctOption === oIdx} onChange={() => handleQuestionChange(q.id, 'correctOption', oIdx)} name={`q-${q.id}`} />
                              </div>
                              <input type="text" placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} value={opt} onChange={e => handleQuestionChange(q.id, 'options', e.target.value, oIdx)} />
                              {q.correctOption === oIdx && <CheckCircle size={18} className="correct-icon" />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="subjective-placeholder">
                          <AlignLeft size={24} color="#94a3b8" />
                          <p>Students will get a text box and file upload option to submit their answer.</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="sticky-bottom-bar">
                <button type="button" className="btn-outline-large" onClick={resetForm} disabled={isLoading}>Cancel</button>
                <div className="action-group">
                  <button type="button" className="btn-outline-large dark" onClick={(e) => handleSaveTest(e, "draft")} disabled={isLoading}><Save size={18} /> Save as Draft</button>
                  <button type="submit" className="btn-solid-large" onClick={(e) => handleSaveTest(e, "upcoming")} disabled={isLoading}>{editId && testMeta.status !== 'draft' ? "Update Published Test" : "Save & Publish Test"}</button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* VIEW 3: PREMIUM EXAM RESULTS */}
        {activeTab === "results" && selectedResultExam && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="results-wrapper">
            <div className="results-top-bar">
              <button className="back-btn" onClick={() => setActiveTab("list")}><ArrowLeft size={20} /> Back to Tests</button>
              <div className="results-meta">
                <h2>{selectedResultExam.title}</h2>
                <span className="exam-badge">{selectedResultExam.subject}</span>
              </div>
            </div>

            <div className="results-summary">
              <div className="summary-box"><h4>Total Submissions</h4><h2>{examResults.length}</h2></div>
              <div className="summary-box">
                <h4>Average Score</h4>
                <h2>
                  {examResults.length > 0
                    ? Math.round(examResults.reduce((a, b) => a + b.percentage, 0) / examResults.length)
                    : 0}%
                </h2>
              </div>
              <div className="summary-box">
                <h4>Highest Percentage</h4>
                <h2 className="text-green">
                  {examResults.length > 0 ? Math.max(...examResults.map(r => r.percentage)) : 0}%
                </h2>
              </div>
            </div>

            <div className="student-results-list">
              <h3>Student Performance</h3>
              {examResults.length > 0 ? examResults.map((student) => (
                <div key={student.id} className="student-result-card">
                  <div className="student-info">
                    <div className="student-avatar"><User size={20} color="#8b5cf6" /></div>
                    <div><h4>{student.name}</h4><p>Submission ID: #{student.id}</p></div>
                  </div>
                  <div className="score-info">
                    <div className="score-text"><strong>{student.score}</strong> / {student.max}</div>
                    <div className="progress-bg">
                      <div className={`progress-fill ${student.percentage < 50 ? 'fail' : 'pass'}`} style={{ width: `${student.percentage}%` }}></div>
                    </div>
                  </div>
                  <div className={`result-badge ${student.percentage < 50 ? 'fail' : 'pass'}`}>
                    {student.percentage < 50 ? 'Needs Improvement' : 'Excellent'}
                  </div>
                  <button
                    className="btn-icon"
                    title="View Student Exam Sheet"
                    onClick={() => handleViewStudentDetails(student)}
                    style={{ marginLeft: '15px', background: '#e0e7ff', color: '#4f46e5' }}
                  >
                    <Eye size={20} />
                  </button>
                </div>
              )) : (
                <div className="empty-state">
                  <p>No students have submitted this exam yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {deleteId && (
          <div className="modal-backdrop">
            <motion.div className="danger-modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="danger-icon-circle"><AlertTriangle size={36} color="#ef4444" /></div>
              <h2>Delete this Test?</h2>
              <p>This action cannot be undone. All student submissions related to this test will also be affected.</p>
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn-danger" onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 TEACHER DETAILED EXAM SHEET VIEW MODAL (FIXED COLORS) */}
      <AnimatePresence>
        {selectedStudentDetails && (
          <div className="modal-backdrop" style={{ alignItems: 'flex-start', paddingTop: '50px' }}>
            <motion.div className="exam-sheet-modal" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
              <div className="modal-header">
                <div>
                  <h2 style={{ margin: 0, color: '#0f172a' }}>Exam Sheet: {selectedStudentDetails.name}</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Submission ID: #{selectedStudentDetails.id} | Score: {selectedStudentDetails.score}/{selectedStudentDetails.max}</p>
                </div>
                <button className="btn-close" onClick={() => setSelectedStudentDetails(null)}><X size={24} /></button>
              </div>

              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}>
                {isDetailsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}><Clock className="spinner" size={30} /> <p>Loading exam sheet...</p></div>
                ) : studentAnswers.length > 0 ? (
                  studentAnswers.map((ans, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: `1px solid ${ans.is_correct ? '#10b981' : '#e2e8f0'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ color: '#0f172a' }}>Question {idx + 1}</strong>
                        <span style={{ color: ans.is_correct ? '#10b981' : '#64748b', fontWeight: 'bold' }}>{ans.is_correct ? 'Correct' : 'Pending/Incorrect'}</span>
                      </div>

                      {/* 🔥 TEXT COLOR FIXED: Ab question saaf dikhega */}
                      <p style={{ fontSize: '1.1rem', margin: '0 0 15px 0', color: '#1e293b', fontWeight: '500' }}>
                        {ans.question_text || "No Question Text Found"}
                      </p>

                      {/* 🔥 FIX: RESPONSIVE GRID & WORD WRAP */}
                      <div className="answer-review-grid">
                        <div className="answer-box student-ans">
                          <span className="ans-label">Student Selected/Wrote:</span>
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

      <style>{`
        .premium-exam-wrapper * { box-sizing: border-box !important; }
        .premium-exam-wrapper { background-color: transparent; width: 100%; height: 100vh; overflow-y: auto; overflow-x: hidden; font-family: 'Inter', sans-serif; color: #0f172a; }
        .inner-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 30px; padding-bottom: 120px; }
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 20px; }
        .header-left { display: flex; flex-direction: column; gap: 5px; }
        .title-row { display: flex; align-items: center; gap: 15px; }
        .icon-box { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 10px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);}
        .main-title { font-size: 2.2rem; font-weight: 800; color: #0f172a !important; margin: 0; line-height: 1; }
        .sub-title { color: #64748b; font-size: 1.05rem; margin: 0; }
        .segmented-control { background: #f1f5f9; padding: 6px; border-radius: 14px; display: flex; gap: 5px; border: 1px solid #e2e8f0; flex-wrap: wrap;}
        .segment-btn { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border: none; background: transparent; color: #64748b; font-weight: 600; font-size: 0.95rem; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; }
        .segment-btn:hover { color: #0f172a; }
        .segment-btn.active { background: white; color: #8b5cf6; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .search-wrapper { position: relative; margin-bottom: 30px; width: 100%; max-width: 600px; }
        .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .premium-search-input { width: 100%; padding: 18px 20px 18px 55px; border-radius: 16px; border: 2px solid #e2e8f0 !important; font-size: 1.05rem; outline: none; background-color: #ffffff !important; color: #0f172a !important; transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .premium-search-input:focus { border-color: #8b5cf6 !important; box-shadow: 0 0 0 4px rgba(139,92,246,0.1); }
        .premium-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 25px; }
        .premium-card { background: #ffffff !important; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.03); display: flex; flex-direction: column; }
        .premium-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-color: #cbd5e1; }
        .card-top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .status-pill { display: inline-flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 800; padding: 6px 14px; border-radius: 50px; letter-spacing: 0.5px; width: max-content !important; height: max-content !important; }
        .pulsing-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-pill.upcoming { background: #eff6ff; color: #4f46e5; border: 1px solid #c7d2fe; }
        .status-pill.upcoming .pulsing-dot { background: #4f46e5; }
        .status-pill.active { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .status-pill.active .pulsing-dot { background: #059669; box-shadow: 0 0 8px #059669; animation: pulse 2s infinite; }
        .status-pill.completed { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
        .status-pill.completed .pulsing-dot { background: #94a3b8; }
        .status-pill.draft { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
        .status-pill.draft .pulsing-dot { background: #d97706; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .action-icons { display: flex; gap: 10px; }
        .icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s;}
        .icon-btn.edit:hover { background: #f5f3ff; color: #8b5cf6; border-color: #ddd6fe; }
        .icon-btn.delete:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
        .card-middle { margin-bottom: 25px; }
        .exam-card-title { font-size: 1.4rem; font-weight: 800; color: #0f172a !important; margin: 0 0 10px 0; line-height: 1.3; }
        .exam-badge { display: inline-block; background: #f1f5f9; color: #334155; padding: 4px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid #e2e8f0; }
        .card-metrics { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 25px; }
        .metric-item { display: flex; align-items: center; gap: 6px; background: #f8fafc; border: 1px solid #f1f5f9; padding: 8px 12px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; color: #475569; }
        .card-footer { margin-top: auto; }
        .btn-full { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; border: none;}
        .btn-solid { background: #8b5cf6; color: white; box-shadow: 0 4px 15px rgba(139,92,246,0.2); }
        .btn-solid:hover { background: #7c3aed; box-shadow: 0 8px 25px rgba(139,92,246,0.3); transform: translateY(-2px); }
        .btn-outline { background: transparent; border: 2px solid #e2e8f0; color: #475569; }
        .btn-outline:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; background: white; border-radius: 24px; border: 2px dashed #e2e8f0; text-align: center; }
        .empty-state h3 { color: #1e293b; font-size: 1.5rem; margin: 15px 0 5px 0; }
        .empty-state p { color: #64748b; }
        
        .builder-wrapper { display: flex; flex-direction: column; gap: 30px; }
        .builder-block { background: white; border-radius: 24px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .no-padding-bottom { padding-bottom: 10px; }
        .block-header { margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .block-header.split { display: flex; justify-content: space-between; align-items: center; border-bottom: none; }
        .block-header h3 { font-size: 1.4rem; color: #0f172a !important; margin: 0; display: flex; align-items: center; gap: 10px; }
        .step-num { background: #8b5cf6; color: white; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1rem; font-weight: 800; }
        .premium-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 0; }
        .form-group.full-span { grid-column: 1 / -1; }
        .form-group label { font-weight: 600; color: #475569; font-size: 0.9rem; }
        .form-group input, .form-group select { width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0 !important; border-radius: 12px; font-size: 1rem; outline: none; background-color: #f8fafc !important; color: #0f172a !important; transition: 0.3s; }
        .form-group input:focus, .form-group select:focus { border-color: #8b5cf6 !important; background-color: white !important; box-shadow: 0 0 0 4px rgba(139,92,246,0.1); }
        .btn-add { display: flex; align-items: center; gap: 8px; background: #f5f3ff; color: #8b5cf6; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;}
        .btn-add:hover { background: #ede9fe; color: #7c3aed; transform: translateY(-2px); }
        .questions-list { display: flex; flex-direction: column; gap: 25px; margin-bottom: 20px;}
        .q-card { background: #ffffff; border: 2px solid #f1f5f9; border-radius: 20px; padding: 25px; transition: 0.3s; position: relative; border-left: 6px solid #8b5cf6; }
        .q-card:hover { border-color: #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .q-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .q-top-left { display: flex; align-items: center; gap: 15px;}
        .q-top h4 { margin: 0; font-size: 1.2rem; color: #1e293b; font-weight: 800; }
        .q-type-select { padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.9rem; color: #475569; outline: none; cursor: pointer;}
        .btn-remove { background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 8px; border-radius: 8px; display: flex; align-items: center; transition: 0.2s; }
        .btn-remove:hover { background: #fef2f2; }
        .q-body-wrap { margin-bottom: 20px;}
        .q-textarea { width: 100%; padding: 16px; border: 2px solid #e2e8f0 !important; border-radius: 14px; font-size: 1.05rem; outline: none; background: #f8fafc !important; color: #0f172a !important; margin-bottom: 10px; resize: vertical; transition: 0.3s; font-family: inherit;}
        .q-textarea:focus { border-color: #8b5cf6 !important; background: white !important; box-shadow: 0 0 0 4px rgba(139,92,246,0.1); }
        .hidden-file { display: none; }
        .img-upload-label { display: inline-flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.9rem; font-weight: 600; cursor: pointer; background: #f1f5f9; padding: 8px 15px; border-radius: 8px; border: 1px dashed #cbd5e1; transition: 0.2s;}
        .img-upload-label:hover { background: #e2e8f0; color: #0f172a;}
        .opt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .opt-box { display: flex; align-items: center; gap: 12px; padding: 10px 15px; border: 2px solid #e2e8f0; border-radius: 14px; background: white; transition: 0.3s; position: relative; overflow: hidden;}
        .opt-box.is-correct { border-color: #10b981; background: #f0fdf4; }
        .opt-box.is-correct::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #10b981; }
        .radio-wrap { display: flex; align-items: center; justify-content: center; }
        .radio-wrap input[type="radio"] { width: 22px; height: 22px; accent-color: #10b981; cursor: pointer; margin:0;}
        .opt-box input[type="text"] { flex: 1; border: none; background: transparent !important; outline: none; font-size: 1rem; color: #0f172a !important; padding: 8px 0; }
        .correct-icon { color: #10b981; margin-left: auto; }
        .subjective-placeholder { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; color: #64748b;}
        .sticky-bottom-bar { position: sticky; bottom: 20px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); padding: 20px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; box-shadow: 0 15px 35px rgba(0,0,0,0.05); z-index: 10; margin-top: 30px;}
        .action-group { display: flex; gap: 15px; }
        .btn-outline-large { padding: 14px 30px; border: 2px solid #e2e8f0; background: white; color: #475569; font-weight: 700; border-radius: 14px; cursor: pointer; transition: 0.2s; font-size: 1rem;}
        .btn-outline-large:hover { background: #f1f5f9; color: #0f172a; }
        .btn-outline-large.dark { border-color: #cbd5e1; color: #334155; display: flex; align-items: center; gap: 8px; }
        .btn-outline-large.dark:hover { background: #f8fafc; border-color: #94a3b8;}
        .btn-solid-large { padding: 14px 40px; border: none; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; font-weight: 700; border-radius: 14px; cursor: pointer; transition: 0.2s; font-size: 1rem; box-shadow: 0 8px 20px rgba(139,92,246,0.3);}
        .btn-solid-large:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(139,92,246,0.4); }

        .results-wrapper { display: flex; flex-direction: column; gap: 30px; }
        .results-top-bar { display: flex; align-items: center; gap: 20px; background: white; padding: 20px 25px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .back-btn { display: flex; align-items: center; gap: 8px; background: #f1f5f9; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s; }
        .back-btn:hover { background: #e2e8f0; color: #0f172a; }
        .results-meta h2 { margin: 0 0 5px 0; font-size: 1.5rem; color: #1e293b; font-weight: 800; }
        .results-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .summary-box { background: white; border: 1px solid #e2e8f0; padding: 25px; border-radius: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .summary-box h4 { margin: 0 0 10px 0; color: #64748b; font-size: 0.95rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;}
        .summary-box h2 { margin: 0; font-size: 2.5rem; color: #0f172a; font-weight: 800; }
        .text-green { color: #10b981 !important; }
        .student-results-list { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .student-results-list h3 { margin: 0 0 25px 0; font-size: 1.4rem; color: #1e293b; font-weight: 800; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;}
        .student-result-card { display: grid; grid-template-columns: 2fr 3fr 1fr auto; align-items: center; padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px; margin-bottom: 15px; transition: 0.2s; background: #fdfdfd;}
        .student-result-card:hover { border-color: #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); background: white;}
        .student-info { display: flex; align-items: center; gap: 15px; }
        .student-avatar { width: 45px; height: 45px; background: #f5f3ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .student-info h4 { margin: 0 0 5px 0; color: #1e293b; font-size: 1.1rem; font-weight: 700;}
        .student-info p { margin: 0; color: #64748b; font-size: 0.85rem; font-weight: 500;}
        .score-info { padding: 0 20px; }
        .score-text { margin-bottom: 8px; font-size: 0.95rem; color: #475569; font-weight: 600; text-align: right;}
        .score-text strong { color: #0f172a; font-size: 1.1rem; }
        .progress-bg { width: 100%; height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 10px; }
        .progress-fill.pass { background: #10b981; }
        .progress-fill.fail { background: #ef4444; }
        .result-badge { padding: 8px 15px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; text-align: center; margin-left: auto;}
        .result-badge.pass { background: #ecfdf5; color: #059669; }
        .result-badge.fail { background: #fef2f2; color: #dc2626; }

        .modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; z-index: 9999; padding: 20px;}
        .danger-modal { background: white; padding: 40px; border-radius: 30px; text-align: center; max-width: 420px; width: 100%; box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
        .danger-icon-circle { width: 80px; height: 80px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; }
        .danger-modal h2 { margin: 0 0 10px 0; color: #0f172a; font-size: 1.8rem; font-weight: 800;}
        .danger-modal p { color: #64748b; font-size: 1rem; line-height: 1.5; margin-bottom: 30px; }
        .modal-btns { display: flex; gap: 15px; }
        .btn-cancel { flex: 1; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; border: 2px solid #e2e8f0; background: white; color: #475569; font-size: 1rem; transition: 0.2s;}
        .btn-cancel:hover { background: #f8fafc; color: #0f172a;}
        .btn-danger { flex: 1; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; border: none; background: #ef4444; color: white; font-size: 1rem; transition: 0.2s; box-shadow: 0 8px 20px rgba(239,68,68,0.25);}
        .btn-danger:hover { background: #dc2626; transform: translateY(-2px); box-shadow: 0 12px 25px rgba(239,68,68,0.35);}
        
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
            .premium-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
        }
        @media (max-width: 768px) {
            .inner-container { padding: 85px 15px 100px 15px !important; }
            .header-section { flex-direction: column; align-items: flex-start; gap: 20px; }
            .segmented-control { width: 100%; display: flex; }
            .segment-btn { flex: 1; justify-content: center; }
            .premium-grid { grid-template-columns: 1fr; width: 100%; }
            .premium-card { width: 100%; }
            .builder-block { padding: 20px 15px; }
            .premium-form-grid { grid-template-columns: 1fr; }
            .block-header.split { flex-direction: column; align-items: flex-start; gap: 15px; }
            .btn-add { width: 100%; justify-content: center; }
            .q-top { flex-direction: column; align-items: flex-start; gap: 15px;}
            .q-card { padding: 20px 15px; }
            .opt-grid { grid-template-columns: 1fr; }
            .sticky-bottom-bar { flex-direction: column; padding: 15px; gap: 10px;}
            .action-group { width: 100%; flex-direction: column; gap: 10px;}
            .btn-outline-large, .btn-solid-large { width: 100%; }
            .modal-btns { flex-direction: column; }
            .student-result-card { grid-template-columns: 1fr; gap: 20px; text-align: center; }
            .student-info { flex-direction: column; }
            .score-text { text-align: center; }
            .result-badge { margin: 0 auto; width: 100%; }
            .results-top-bar { flex-direction: column; align-items: flex-start; }
            .exam-sheet-modal { margin: 15px; }
            .answer-review-grid { grid-template-columns: 1fr; gap: 15px; }
        }
      `}</style>
    </div>
  );
}