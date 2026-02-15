import os

# --- PATH SETUP ---
BASE_DIR = os.getcwd()
TARGET_FILE = os.path.join(BASE_DIR, "frontend", "src", "pages", "Exams.jsx")

print(f"ðŸ”§ Adding Smooth Animations to Exam Controller: {TARGET_FILE}")

# --- CODE WITH ANIMATIONS ---
code_content = r"""import React, { useState } from "react";
import SidebarModern from "../components/SidebarModern";
import { Clock, CheckCircle, FileText, UserCheck, Brain, Plus, Trash, Save, FileOutput, Eye, Edit2, X, AlertCircle } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function Exams() {
  const [activeTab, setActiveTab] = useState('setter');

  // --- PAPER SETTER STATE ---
  const [questions, setQuestions] = useState([
      { id: 1, text: "Explain Newton's Second Law of Motion.", type: "Descriptive", marks: 10, difficulty: "Medium" },
      { id: 2, text: "What is the unit of Force?", type: "MCQ", marks: 2, difficulty: "Easy" }
  ]);
  
  const [newQ, setNewQ] = useState({ text: "", type: "Descriptive", marks: 5, difficulty: "Medium" });
  const [editingId, setEditingId] = useState(null);
  const [viewQ, setViewQ] = useState(null);

  // HANDLERS
  const handleSaveQuestion = () => {
      if(!newQ.text) return toast.error("Write a question first!");

      if (editingId) {
          setQuestions(questions.map(q => q.id === editingId ? { ...newQ, id: editingId } : q));
          toast.success("Question Updated Successfully!");
          setEditingId(null);
      } else {
          setQuestions([...questions, { ...newQ, id: Date.now() }]);
          toast.success("Question Added to Bank");
      }
      setNewQ({ text: "", type: "Descriptive", marks: 5, difficulty: "Medium" });
  };

  const handleEditClick = (q) => {
      setNewQ({ text: q.text, type: q.type, marks: q.marks, difficulty: q.difficulty });
      setEditingId(q.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast("Editing Question...");
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setNewQ({ text: "", type: "Descriptive", marks: 5, difficulty: "Medium" });
  };

  const deleteQuestion = (id) => {
      if(window.confirm("Are you sure you want to delete this?")) {
          setQuestions(questions.filter(q => q.id !== id));
          toast.success("Question Removed");
      }
  };

  const generatePaper = () => {
      toast.loading("Generating PDF Paper Set...");
      setTimeout(() => toast.success("Paper Set A-102 Generated! ðŸ’¾"), 2000);
  };

  // --- EVALUATION STATE ---
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
            
            <header className="page-header slide-in-top">
                <div>
                    <h1 className="page-title">Exam Controller</h1>
                    <p className="page-subtitle">Manage Question Banks & 3-Tier Evaluation</p>
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
                    <div className={`card shadow-md slide-in-up delay-1 ${editingId ? 'editing-mode pulse-border' : ''}`}>
                        <div className="card-header">
                            <h3>{editingId ? "Edit Question" : "Create New Question"}</h3>
                            {editingId && <span className="badge hard pop-in">Editing Mode</span>}
                        </div>
                        <div className="card-body form-grid">
                            <input 
                                type="text" 
                                placeholder="Enter Question Text..." 
                                className="input-field full-width"
                                value={newQ.text}
                                onChange={(e) => setNewQ({...newQ, text: e.target.value})}
                            />
                            <select className="input-field" value={newQ.type} onChange={(e) => setNewQ({...newQ, type: e.target.value})}>
                                <option>Descriptive</option>
                                <option>MCQ</option>
                                <option>True/False</option>
                            </select>
                            <select className="input-field" value={newQ.difficulty} onChange={(e) => setNewQ({...newQ, difficulty: e.target.value})}>
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                            <input 
                                type="number" 
                                placeholder="Marks" 
                                className="input-field"
                                value={newQ.marks}
                                onChange={(e) => setNewQ({...newQ, marks: parseInt(e.target.value)})}
                            />
                            
                            <div className="btn-group">
                                <button onClick={handleSaveQuestion} className={`btn-primary hover-bounce ${editingId ? 'btn-warning' : ''}`}>
                                    {editingId ? "Update Question" : "Add Question"}
                                </button>
                                {editingId && (
                                    <button onClick={handleCancelEdit} className="btn-secondary hover-bounce">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* TABLE CARD */}
                    <div className="card shadow-md slide-in-up delay-2" style={{marginTop: '20px'}}>
                        <div className="card-header" style={{justifyContent: 'space-between'}}>
                            <h3>Current Question Bank ({questions.length})</h3>
                            <button onClick={generatePaper} className="btn-success hover-bounce"><FileOutput size={18}/> Generate Paper PDF</button>
                        </div>
                        <div className="card-body">
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
                                    {questions.map((q, i) => (
                                        <tr key={q.id} className={`table-row fade-in-row ${editingId === q.id ? 'highlight-row' : ''}`}>
                                            <td style={{color: '#64748b'}}>{i + 1}</td>
                                            <td className="truncate-text" style={{fontWeight: 600, color: '#1e293b'}}>{q.text}</td>
                                            <td><span className="badge pop-in">{q.type}</span></td>
                                            <td><span className={`badge pop-in ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span></td>
                                            <td style={{fontWeight: 'bold', color: '#1e293b'}}>{q.marks}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button onClick={() => setViewQ(q)} className="icon-btn btn-view hover-rotate" title="View"><Eye size={20}/></button>
                                                    <button onClick={() => handleEditClick(q)} className="icon-btn btn-edit hover-rotate" title="Edit"><Edit2 size={20}/></button>
                                                    <button onClick={() => deleteQuestion(q.id)} className="icon-btn btn-delete hover-rotate" title="Delete"><Trash size={20}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: EVALUATION */}
            {activeTab === 'evaluation' && (
                <div className="content-wrapper">
                    <div className="card shadow-md slide-in-up">
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
                            <p className="handwriting-font">
                                "Newton's first law states that an object remains in a state of rest or of uniform motion in a straight line unless compelled to change that state by an applied force."
                            </p>
                        </div>

                        <h3 style={{margin: "20px 0 15px", color: "#1e293b"}}>Evaluation Status (3-Tier)</h3>
                        <div className="evaluation-grid">
                            <div className="eval-card done pop-in delay-1">
                                <div className="eval-header"><UserCheck size={18}/> Evaluator 1</div>
                                <div className="eval-score">{evaluations.teacher1.score}/100</div>
                                <p className="eval-comment">"{evaluations.teacher1.comments}"</p>
                            </div>
                            <div className="eval-card done pop-in delay-2">
                                <div className="eval-header"><UserCheck size={18}/> Evaluator 2</div>
                                <div className="eval-score">{evaluations.teacher2.score}/100</div>
                                <p className="eval-comment">"{evaluations.teacher2.comments}"</p>
                            </div>
                            <div className="eval-card pending pop-in delay-3">
                                <div className="eval-header"><Clock size={18}/> Evaluator 3</div>
                                <div className="eval-score">--/100</div>
                                <p className="eval-comment">Waiting for review...</p>
                            </div>
                        </div>

                        <div className="ai-check-box slide-in-up delay-3">
                            <div>
                                <h3 style={{margin:0, color: "#166534", display: "flex", alignItems: "center", gap: "10px"}}><Brain size={24}/> AI Auto-Check</h3>
                                <p style={{margin:0, color: "#15803d", fontSize: '0.9rem'}}>AI verifies descriptive answers against keywords.</p>
                            </div>
                            {aiScore ? (
                                <div style={{textAlign: "right"}} className="pop-in">
                                    <span style={{fontSize: "2rem", fontWeight: "900", color: "#16a34a"}}>{aiScore}/100</span>
                                    <div style={{fontSize: "0.8rem", color: "#166534"}}>AI Confidence: 98%</div>
                                </div>
                            ) : (
                                <button onClick={handleAiCheck} className="btn-ai hover-bounce">Run AI Analysis</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {viewQ && (
                <div className="modal-overlay fade-in">
                    <div className="modal-content scale-up">
                        <div className="modal-header">
                            <h3>Question Details</h3>
                            <button onClick={() => setViewQ(null)} className="close-btn"><X size={20}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="label">Question:</span>
                                <p className="value big-text">{viewQ.text}</p>
                            </div>
                            <div className="grid-details">
                                <div className="detail-row">
                                    <span className="label">Type:</span>
                                    <span className="badge">{viewQ.type}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Difficulty:</span>
                                    <span className={`badge ${viewQ.difficulty.toLowerCase()}`}>{viewQ.difficulty}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Marks:</span>
                                    <span className="value bold">{viewQ.marks}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => { setViewQ(null); handleEditClick(viewQ); }} className="btn-primary hover-bounce">Edit This</button>
                            <button onClick={() => setViewQ(null)} className="btn-secondary hover-bounce">Close</button>
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
            
            /* --- ANIMATIONS --- */
            @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInTop { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
            
            .slide-in-up { animation: slideInUp 0.5s ease-out forwards; opacity: 0; }
            .slide-in-top { animation: slideInTop 0.5s ease-out; }
            .fade-in { animation: fadeIn 0.3s ease-out; }
            .scale-up { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .pop-in { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            
            .delay-1 { animation-delay: 0.1s; }
            .delay-2 { animation-delay: 0.2s; }
            .delay-3 { animation-delay: 0.3s; }

            /* Hover Effects */
            .card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
            .card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1); }
            
            .hover-bounce { transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .hover-bounce:hover { transform: translateY(-2px) scale(1.02); }
            .hover-bounce:active { transform: scale(0.95); }

            .hover-rotate { transition: all 0.2s ease; }
            .hover-rotate:hover { transform: scale(1.15) rotate(5deg); }

            /* --- EXISTING STYLES (PRESERVED) --- */
            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .page-title { font-size: 2rem; font-weight: 800; margin: 0; color: var(--text-main); }
            .page-subtitle { color: #64748b; margin: 5px 0 0; }
            
            .tab-switch { background: white; padding: 5px; border-radius: 12px; display: flex; gap: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .tab-btn { border: none; background: transparent; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #64748b; transition: 0.2s; }
            .tab-btn.active { background: #eff6ff; color: var(--primary); }
            
            .card { background: white; border-radius: 16px; padding: 25px; border: 1px solid #e2e8f0; }
            .card.editing-mode { border: 2px solid var(--warning); }
            .pulse-border { animation: pulseWarning 2s infinite; }
            @keyframes pulseWarning { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }

            .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .card-header { display: flex; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
            .card-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
            
            .form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 0.5fr auto; gap: 15px; align-items: center; }
            .full-width { grid-column: span 1; }
            .input-field { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: white; color: #1e293b; font-size: 0.9rem; transition: all 0.2s; }
            .input-field:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
            
            .btn-group { display: flex; gap: 10px; }
            .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap; }
            .btn-warning { background: var(--warning); }
            .btn-secondary { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }
            .btn-success { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; gap: 8px; }

            .modern-table { width: 100%; border-collapse: collapse; }
            .modern-table th { text-align: left; padding: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; background: #f8fafc; }
            .modern-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
            .table-row { transition: background 0.2s; }
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

            /* EVALUATION */
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

            .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
            .modal-content { background: white; width: 500px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .modal-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
            .modal-header h3 { margin: 0; font-size: 1.2rem; color: #1e293b; }
            .close-btn { background: transparent; border: none; cursor: pointer; color: #64748b; }
            .modal-body { padding: 25px; }
            .detail-row { margin-bottom: 15px; }
            .label { display: block; font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 5px; }
            .value { color: #1e293b; font-size: 1rem; line-height: 1.5; }
            .big-text { font-size: 1.1rem; font-weight: 600; }
            .bold { font-weight: 800; font-size: 1.2rem; }
            .grid-details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 20px; background: #f8fafc; padding: 15px; border-radius: 10px; }
            .modal-footer { padding: 15px 25px; background: #f8fafc; text-align: right; display: flex; justify-content: flex-end; gap: 10px; }
        `}</style>
    </div>
  );
}"""

with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(code_content)

print("✅ SUCCESS: Added Smooth Animations & Hover Effects to Exam Controller!")
