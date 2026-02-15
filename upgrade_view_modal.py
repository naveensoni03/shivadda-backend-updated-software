import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "src", "pages", "Exams.jsx")

if not os.path.exists(TARGET_FILE):
    TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Exams.jsx")

print(f"ðŸ”§ Applying Premium 'Waoo' UI to View Modal in: {TARGET_FILE}")

code_content = r"""import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import { Clock, CheckCircle, FileText, UserCheck, Brain, Plus, Trash, Save, FileOutput, Eye, Edit2, X, Sparkles, Zap, ChevronLeft, ChevronRight, RefreshCw, Layers, Award, BarChart2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

// --- CONFIG ---
const API_URL = "http://127.0.0.1:8000/api/questions/";

export default function Exams() {
  const [activeTab, setActiveTab] = useState('setter');
  const [loaded, setLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // --- REAL DATA STATE ---
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ text: "", q_type: "Descriptive", difficulty: "Medium", marks: 5 });
  const [editingId, setEditingId] = useState(null);
  const [viewQ, setViewQ] = useState(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => { 
      setLoaded(true); 
      fetchQuestions();
  }, []);

  // --- API ACTIONS ---
  const fetchQuestions = async () => {
      setLoadingData(true);
      try {
          const res = await axios.get(API_URL);
          setQuestions(res.data);
      } catch (error) {
          console.error("Error fetching questions:", error);
          toast.error("Failed to load questions from Database");
      } finally {
          setLoadingData(false);
      }
  };

  const handleSaveQuestion = async () => {
      if(!newQ.text) return toast.error("Write a question first!");

      try {
          if (editingId) {
              const res = await axios.put(`${API_URL}${editingId}/`, newQ);
              setQuestions(questions.map(q => q.id === editingId ? res.data : q));
              toast.success("Question Updated!");
              setEditingId(null);
          } else {
              const res = await axios.post(API_URL, newQ);
              setQuestions([res.data, ...questions]);
              toast.success("Saved to Database!");
          }
          setNewQ({ text: "", q_type: "Descriptive", difficulty: "Medium", marks: 5 });
      } catch (error) {
          console.error("Save error:", error);
          toast.error("Error saving question.");
      }
  };

  const deleteQuestion = async (id) => {
      if(window.confirm("Are you sure? This will delete from Database permanently.")) {
          try {
              await axios.delete(`${API_URL}${id}/`);
              setQuestions(questions.filter(q => q.id !== id));
              toast.success("Deleted from Database");
          } catch (error) {
              console.error("Delete error:", error);
              toast.error("Failed to delete.");
          }
      }
  };

  const handleEditClick = (q) => {
      setNewQ({ text: q.text, q_type: q.q_type, marks: q.marks, difficulty: q.difficulty });
      setEditingId(q.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast("Editing Mode On");
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setNewQ({ text: "", q_type: "Descriptive", difficulty: "Medium", marks: 5 });
  };

  const generatePaper = () => {
      toast.loading("Generating PDF Paper Set...");
      setTimeout(() => toast.success("Paper Set A-102 Generated! ðŸ’¾"), 2000);
  };

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = questions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(questions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  // --- DUMMY EVALUATION DATA ---
  const [evaluations, setEvaluations] = useState({
      teacher1: { score: 85, comments: "Good concepts", status: "Done" },
      teacher2: { score: 82, comments: "Needs more diagrams", status: "Done" },
      teacher3: { score: null, comments: "", status: "Pending" }
  });
  const [aiScore, setAiScore] = useState(null);

  const handleAiCheck = () => {
      toast.loading("AI Scanning Answer Sheet...");
      setTimeout(() => {
          toast.dismiss();
          setAiScore(84);
          toast.success("AI Evaluation Complete!");
      }, 2000);
  };

  return (
    <div className="exams-container">
        <SidebarModern />
        <div className="main-content">
            <Toaster position="top-center" />
            
            <header className={`page-header ${loaded ? 'slide-in-top' : ''}`}>
                <div>
                    <h1 className="page-title">
                        Exam Controller <Sparkles size={24} className="sparkle-icon" />
                    </h1>
                    <p className="page-subtitle">Connected to Live Database âš¡ï¸</p>
                </div>
                <div className="tab-switch">
                    <button onClick={() => setActiveTab('setter')} className={`tab-btn ${activeTab === 'setter' ? 'active' : ''}`}>
                        <Plus size={18}/> Paper Setter
                    </button>
                    <button onClick={() => setActiveTab('evaluation')} className={`tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}>
                        <CheckCircle size={18}/> Evaluation
                    </button>
                </div>
            </header>

            {/* TAB 1: PAPER SETTER */}
            {activeTab === 'setter' && (
                <div className="content-wrapper">
                    
                    {/* FORM CARD */}
                    <div className={`card shadow-md stagger-1 ${editingId ? 'editing-mode pulse-border' : ''}`}>
                        <div className="card-header">
                            <h3>{editingId ? "Edit Question" : "Create New Question"}</h3>
                            {editingId && <span className="badge hard pop-in">Editing Mode</span>}
                        </div>
                        <div className="card-body form-grid">
                            <div className="input-group full-width">
                                <input 
                                    type="text" 
                                    placeholder="Enter Question Text..." 
                                    className="input-field"
                                    value={newQ.text}
                                    onChange={(e) => setNewQ({...newQ, text: e.target.value})}
                                />
                                <span className="focus-border"></span>
                            </div>
                            
                            <select className="input-field hover-glow" value={newQ.q_type} onChange={(e) => setNewQ({...newQ, q_type: e.target.value})}>
                                <option value="Descriptive">Descriptive</option>
                                <option value="MCQ">MCQ</option>
                                <option value="True/False">True/False</option>
                            </select>
                            <select className="input-field hover-glow" value={newQ.difficulty} onChange={(e) => setNewQ({...newQ, difficulty: e.target.value})}>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                            <input 
                                type="number" 
                                placeholder="Marks" 
                                className="input-field hover-glow"
                                value={newQ.marks}
                                onChange={(e) => setNewQ({...newQ, marks: parseInt(e.target.value)})}
                            />
                            
                            <div className="btn-group">
                                <button onClick={handleSaveQuestion} className={`btn-primary ripple-effect ${editingId ? 'btn-warning' : ''}`}>
                                    {editingId ? "Update DB" : "Save to DB"}
                                </button>
                                {editingId && (
                                    <button onClick={handleCancelEdit} className="btn-secondary ripple-effect">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TABLE CARD */}
                    <div className="card shadow-md stagger-2" style={{marginTop: '20px'}}>
                        <div className="card-header" style={{justifyContent: 'space-between'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <h3>Database Records ({questions.length})</h3>
                                <button onClick={fetchQuestions} className="icon-btn btn-view" title="Refresh Data"><RefreshCw size={16}/></button>
                            </div>
                            <button onClick={generatePaper} className="btn-success ripple-effect"><FileOutput size={18}/> Generate Paper PDF</button>
                        </div>
                        <div className="card-body">
                            {loadingData ? (
                                <div style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>Loading Data from Server...</div>
                            ) : (
                                <>
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>Q. No</th>
                                            <th>Question</th>
                                            <th>Type</th>
                                            <th>Diff</th>
                                            <th>Marks</th>
                                            <th style={{textAlign:'center'}}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentQuestions.length > 0 ? currentQuestions.map((q, i) => (
                                            <tr key={q.id} className={`table-row fade-in-row ${editingId === q.id ? 'highlight-row' : ''}`} style={{animationDelay: `${i * 0.05}s`}}>
                                                <td style={{color: '#64748b'}}>{indexOfFirstItem + i + 1}</td>
                                                <td className="truncate-text" style={{fontWeight: 600, color: '#1e293b'}}>{q.text}</td>
                                                <td><span className="badge pop-in">{q.q_type}</span></td>
                                                <td><span className={`badge pop-in ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span></td>
                                                <td style={{fontWeight: 'bold', color: '#1e293b'}}>{q.marks}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button onClick={() => setViewQ(q)} className="icon-btn btn-view hover-3d" title="View"><Eye size={20}/></button>
                                                        <button onClick={() => handleEditClick(q)} className="icon-btn btn-edit hover-3d" title="Edit"><Edit2 size={20}/></button>
                                                        <button onClick={() => deleteQuestion(q.id)} className="icon-btn btn-delete hover-3d" title="Delete"><Trash size={20}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No Questions in Database yet. Add one above!</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                
                                {/* PAGINATION UI */}
                                {questions.length > itemsPerPage && (
                                    <div className="pagination-container">
                                        <button onClick={prevPage} disabled={currentPage === 1} className="page-btn nav-btn">
                                            <ChevronLeft size={20}/>
                                        </button>
                                        
                                        <div className="page-numbers">
                                            {Array.from({ length: totalPages }, (_, i) => (
                                                <button 
                                                    key={i + 1} 
                                                    onClick={() => paginate(i + 1)} 
                                                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <button onClick={nextPage} disabled={currentPage === totalPages} className="page-btn nav-btn">
                                            <ChevronRight size={20}/>
                                        </button>
                                    </div>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'evaluation' && (
                <div className="content-wrapper">
                    <div className="card shadow-md stagger-1">
                         <div className="exam-meta-header">
                            <div>
                                <h2 style={{margin:0, fontSize: '1.2rem', color: '#1e293b'}}>Mid-Term Physics (Descriptive)</h2>
                                <div className="tags">
                                    <span className="meta-tag">Max Marks: 100</span>
                                    <span className="meta-tag">Time: 3 Hrs</span>
                                </div>
                            </div>
                            <div style={{textAlign: "right"}}>
                                <div style={{fontWeight: "bold", color: "#64748b"}}>Examinee Body: CBSE</div>
                                <div style={{fontSize: "0.9rem", color: "#94a3b8"}}>Paper Set: A-102</div>
                            </div>
                        </div>

                        <div className="answer-sheet-preview">
                            <h4 style={{margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "10px", color: "#475569"}}><FileText size={18}/> Student Answer: Q1 - Explain Newton's Law</h4>
                            <p className="handwriting-font typing-effect">
                                "Newton's first law states that an object remains in a state of rest or of uniform motion in a straight line unless compelled to change that state by an applied force."
                            </p>
                        </div>

                        <h3 style={{margin: "20px 0 15px", color: "#1e293b"}}>Evaluation Status (3-Tier)</h3>
                        <div className="evaluation-grid">
                            <div className="eval-card done pop-in delay-1 hover-lift">
                                <div className="eval-header"><UserCheck size={18}/> Evaluator 1</div>
                                <div className="eval-score">{evaluations.teacher1.score}/100</div>
                                <p className="eval-comment">"{evaluations.teacher1.comments}"</p>
                            </div>
                            <div className="eval-card done pop-in delay-2 hover-lift">
                                <div className="eval-header"><UserCheck size={18}/> Evaluator 2</div>
                                <div className="eval-score">{evaluations.teacher2.score}/100</div>
                                <p className="eval-comment">"{evaluations.teacher2.comments}"</p>
                            </div>
                            <div className="eval-card pending pop-in delay-3 hover-lift">
                                <div className="eval-header"><Clock size={18}/> Evaluator 3</div>
                                <div className="eval-score">--/100</div>
                                <p className="eval-comment">Waiting for review...</p>
                            </div>
                        </div>

                        <div className="ai-check-box stagger-3">
                            <div>
                                <h3 style={{margin:0, color: "#166534", display: "flex", alignItems: "center", gap: "10px"}}><Brain size={24}/> AI Auto-Check</h3>
                                <p style={{margin:0, color: "#15803d", fontSize: '0.9rem'}}>AI verifies descriptive answers against keywords.</p>
                            </div>
                            {aiScore ? (
                                <div style={{textAlign: "right"}} className="pop-in-bounce">
                                    <span style={{fontSize: "2rem", fontWeight: "900", color: "#16a34a"}}>{aiScore}/100</span>
                                    <div style={{fontSize: "0.8rem", color: "#166534"}}>AI Confidence: 98%</div>
                                </div>
                            ) : (
                                <button onClick={handleAiCheck} className="btn-ai ripple-effect">Run AI Analysis <Zap size={16}/></button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* WAOO WAOO MODAL UI */}
            {viewQ && (
                <div className="modal-overlay glass-overlay fade-in">
                    <div className="modal-content premium-modal scale-up-bounce">
                        <div className="modal-decorative-bg"></div>
                        
                        <div className="modal-header-premium">
                            <div className="header-text">
                                <span className="subtitle">Question Details</span>
                                <h3>Overview</h3>
                            </div>
                            <button onClick={() => setViewQ(null)} className="close-btn-premium"><X size={24}/></button>
                        </div>
                        
                        <div className="modal-body-premium">
                            <div className="question-hero">
                                <div className="q-icon"><FileText size={32}/></div>
                                <p className="q-text">"{viewQ.text}"</p>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card blue">
                                    <div className="stat-icon"><Layers size={20}/></div>
                                    <div>
                                        <span className="stat-label">Type</span>
                                        <span className="stat-value">{viewQ.q_type}</span>
                                    </div>
                                </div>
                                <div className="stat-card purple">
                                    <div className="stat-icon"><BarChart2 size={20}/></div>
                                    <div>
                                        <span className="stat-label">Difficulty</span>
                                        <span className="stat-value">{viewQ.difficulty}</span>
                                    </div>
                                </div>
                                <div className="stat-card orange">
                                    <div className="stat-icon"><Award size={20}/></div>
                                    <div>
                                        <span className="stat-label">Marks</span>
                                        <span className="stat-value">{viewQ.marks}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-premium">
                            <button onClick={() => { setViewQ(null); handleEditClick(viewQ); }} className="btn-edit-premium">
                                <Edit2 size={16}/> Edit Question
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <style>{`
            :root {
                --primary: #3b82f6;
                --warning: #f59e0b;
                --bg-body: #f8fafc;
                --text-main: #1e293b;
            }
            .exams-container { display: flex; background: var(--bg-body); min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-main); }
            .main-content { flex: 1; padding: 30px; marginLeft: 280px; }
            
            /* --- PREMIUM WAOO MODAL STYLES --- */
            .glass-overlay { 
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(15, 23, 42, 0.6); 
                backdrop-filter: blur(8px); 
                display: flex; justify-content: center; align-items: center; z-index: 1000; 
            }
            
            .premium-modal { 
                background: rgba(255, 255, 255, 0.95); 
                width: 600px; 
                border-radius: 24px; 
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
                overflow: hidden; 
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.5);
            }

            .modal-decorative-bg {
                position: absolute; top: -50px; right: -50px;
                width: 200px; height: 200px;
                background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
                filter: blur(60px);
                opacity: 0.5;
                z-index: 0;
                border-radius: 50%;
            }

            .modal-header-premium {
                padding: 30px 30px 10px;
                display: flex; justify-content: space-between; align-items: flex-start;
                position: relative; z-index: 1;
            }
            .subtitle { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .modal-header-premium h3 { font-size: 1.8rem; font-weight: 800; margin: 5px 0 0; background: linear-gradient(to right, #1e293b, #475569); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            
            .close-btn-premium {
                background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center; color: #64748b;
                cursor: pointer; transition: 0.3s;
            }
            .close-btn-premium:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

            .modal-body-premium { padding: 30px; position: relative; z-index: 1; }

            .question-hero {
                background: white; padding: 25px; border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
                margin-bottom: 25px;
                position: relative;
            }
            .q-icon { position: absolute; top: -15px; left: 20px; background: #3b82f6; color: white; padding: 8px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); }
            .q-text { font-size: 1.15rem; font-weight: 600; color: #334155; line-height: 1.6; margin-top: 10px; }

            .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
            .stat-card { 
                padding: 15px; border-radius: 14px; display: flex; flex-direction: column; gap: 10px; 
                transition: 0.3s; cursor: default;
            }
            .stat-card:hover { transform: translateY(-5px); }
            
            .stat-card.blue { background: #eff6ff; border: 1px solid #dbeafe; }
            .stat-card.blue .stat-icon { color: #3b82f6; background: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
            
            .stat-card.purple { background: #f5f3ff; border: 1px solid #ede9fe; }
            .stat-card.purple .stat-icon { color: #8b5cf6; background: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
            
            .stat-card.orange { background: #fff7ed; border: 1px solid #ffedd5; }
            .stat-card.orange .stat-icon { color: #f97316; background: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }

            .stat-label { font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .stat-value { font-size: 1rem; color: #1e293b; font-weight: 800; display: block; margin-top: 2px; }

            .modal-footer-premium {
                padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0;
                display: flex; justify-content: flex-end;
            }
            .btn-edit-premium {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white; border: none; padding: 12px 24px; border-radius: 12px;
                font-weight: 700; display: flex; align-items: center; gap: 8px;
                cursor: pointer; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
                transition: 0.2s;
            }
            .btn-edit-premium:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.5); }

            /* --- BASE STYLES PRESERVED --- */
            .slide-in-top { animation: slideInTop 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
            .pop-in-bounce { animation: popInBounce 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
            .scale-up-bounce { animation: scaleUpBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            @keyframes slideInTop { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes popInBounce { 0% { transform: scale(0); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
            @keyframes scaleUpBounce { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
            .stagger-1 { animation: staggerUp 0.6s ease-out 0.1s forwards; opacity: 0; }
            .stagger-2 { animation: staggerUp 0.6s ease-out 0.2s forwards; opacity: 0; }
            .stagger-3 { animation: staggerUp 0.6s ease-out 0.3s forwards; opacity: 0; }
            @keyframes staggerUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            
            .input-group { position: relative; }
            .focus-border { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: var(--primary); transition: 0.3s; }
            .input-field:focus ~ .focus-border { width: 100%; }
            .input-field:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
            
            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .page-title { font-size: 2rem; font-weight: 800; margin: 0; color: var(--text-main); display: flex; align-items: center; gap: 10px; }
            .page-subtitle { color: #64748b; margin: 5px 0 0; }
            
            .tab-switch { background: white; padding: 5px; border-radius: 12px; display: flex; gap: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .tab-btn { border: none; background: transparent; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #64748b; transition: 0.2s; }
            .tab-btn.active { background: #eff6ff; color: var(--primary); }
            
            .card { background: white; border-radius: 16px; padding: 25px; border: 1px solid #e2e8f0; }
            .card.editing-mode { border: 2px solid var(--warning); animation: pulseGlow 2s infinite; }
            .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .card-header { display: flex; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
            .card-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
            
            .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 0.5fr auto; gap: 15px; align-items: center; }
            .full-width { grid-column: span 1; }
            .input-field { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: white; color: #1e293b; font-size: 0.9rem; transition: all 0.2s; width: 100%; }
            
            .btn-group { display: flex; gap: 10px; }
            .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap; }
            .btn-warning { background: var(--warning); }
            .btn-secondary { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }
            .btn-success { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; gap: 8px; }

            .modern-table { width: 100%; border-collapse: collapse; }
            .modern-table th { text-align: left; padding: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; background: #f8fafc; }
            .modern-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
            .table-row { opacity: 0; animation: staggerUp 0.4s ease-out forwards; }
            .table-row:hover { background: #f8fafc; }
            .highlight-row { background: #fffbeb !important; }
            .truncate-text { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

            .action-buttons { display: flex; gap: 10px; justify-content: center; }
            .icon-btn { border: none; width: 42px; height: 42px; border-radius: 8px; display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .btn-view { background: #3b82f6; color: white; }
            .btn-edit { background: #f59e0b; color: white; }
            .btn-delete { background: #ef4444; color: white; }

            .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: #f1f5f9; color: #475569; }
            .badge.easy { background: #dcfce7; color: #166534; }
            .badge.medium { background: #fef9c3; color: #854d0e; }
            .badge.hard { background: #fee2e2; color: #991b1b; }

            .pagination-container { display: flex; justify-content: center; align-items: center; margin-top: 25px; gap: 15px; }
            .page-btn { width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
            .page-btn:hover:not(:disabled) { background: #eff6ff; color: var(--primary); transform: translateY(-2px); border-color: var(--primary); }
            .page-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); }
            .page-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #f1f5f9; }
            .nav-btn { width: auto; padding: 0 10px; }
            
            /* Eval CSS preserved but not pasted to save space */
            .exam-meta-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
            .meta-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: #475569; margin-right: 10px; }
            .answer-sheet-preview { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; }
            .handwriting-font { font-family: 'Courier New', Courier, monospace; font-size: 1.05rem; color: #334155; line-height: 1.6; }
            .evaluation-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .eval-card { padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; transition: transform 0.3s; }
            .eval-card:hover { transform: translateY(-5px); }
            .eval-card.done { background: white; border-left: 4px solid #10b981; }
            .eval-card.pending { background: #fffbeb; border-left: 4px solid #f59e0b; opacity: 0.8; }
            .eval-header { display: flex; gap: 8px; color: #64748b; font-weight: 700; font-size: 0.9rem; margin-bottom: 5px; }
            .eval-score { font-size: 2rem; font-weight: 800; color: var(--text-main); }
            .ai-check-box { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; padding: 20px; border-radius: 12px; border: 1px solid #bbf7d0; }
            .btn-ai { background: #16a34a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: 'Waoo' UI applied to View Modal! (Backend connection preserved)")
