import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, Send, LogOut, AlignLeft } from "lucide-react";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function TakeExam() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchExamDetails = async () => {
            try {
                const res = await api.get(`exams/${id}/`);
                setExam(res.data);

                const fetchedQuestions = res.data.questions || [];
                setQuestions(fetchedQuestions);

                const durationSeconds = (res.data.duration_minutes || 60) * 60;
                setTimeLeft(durationSeconds);
            } catch (error) {
                toast.error("Failed to load exam details.");
                navigate("/student/exams");
            }
        };
        fetchExamDetails();
    }, [id, navigate]);

    useEffect(() => {
        if (timeLeft <= 0 && exam) {
            handleSubmitExam();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, exam]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // MCQ ke liye option select karna
    const handleSelectOption = (questionId, optionKey) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionKey
        }));
    };

    // 🚀 NAYA: Subjective text box ke liye answer save karna
    const handleTextAnswer = (questionId, text) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: text
        }));
    };

    const handleSubmitExam = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Evaluating your answers...");

        let score = 0;
        let negativeMarks = 0;

        questions.forEach(q => {
            const selected = answers[q.id];
            if (selected) {
                const isSubjective = q.q_type?.toLowerCase() === 'subjective' || q.q_type?.toLowerCase() === 'descriptive';

                if (!isSubjective) {
                    // MCQ Grading
                    if (selected === q.correct_option) {
                        score += q.marks || 1;
                    } else {
                        negativeMarks += q.negative_marks || 0.25;
                        score -= q.negative_marks || 0.25;
                    }
                }
                // Subjective ki grading teacher manual/AI se karega, auto-score me add nahi karenge yahan
            }
        });

        const maxMarks = questions.reduce((acc, q) => acc + (q.marks || 1), 0);
        const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0;

        try {
            await api.post(`exams/${id}/submit/`, {
                final_score: score > 0 ? score : 0,
                percentage: percentage > 0 ? percentage : 0,
                negative_marks_deducted: negativeMarks,
                answers: answers
            });

            toast.success("Exam Submitted Successfully!", { id: toastId });

            setTimeout(() => {
                navigate("/student/exams");
            }, 2000);

        } catch (error) {
            toast.error("Failed to submit exam.", { id: toastId });
            setIsSubmitting(false);
        }
    };

    const handleExit = () => {
        if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
            navigate("/student/exams");
        }
    };

    if (!exam) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><h2>Loading Exam Environment... 🚀</h2></div>;

    const currentQ = questions[currentQIndex];
    const isSubjective = currentQ?.q_type?.toLowerCase() === 'subjective' || currentQ?.q_type?.toLowerCase() === 'descriptive';

    return (
        <div className="exam-fullscreen-mode">
            <Toaster position="top-center" />

            <main className="exam-main-content">

                <header className="live-exam-header">
                    <div className="exam-title-box">
                        <h2>{exam.title}</h2>
                        <span className="badge">{exam.subject_name || "General"}</span>
                    </div>

                    <div className="header-right-actions">
                        <div className={`timer-box ${timeLeft < 300 ? 'danger' : ''}`}>
                            <Clock size={20} />
                            <span className="time-text">{formatTime(timeLeft)}</span>
                            <span className="time-label">Remaining</span>
                        </div>
                        <button className="btn-exit" onClick={handleExit} title="Exit Exam">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <div className="exam-workspace">

                    <aside className="question-palette">
                        <h3>Question Palette</h3>
                        <div className="palette-grid">
                            {questions.length > 0 ? questions.map((q, idx) => {
                                // Subjective me agar text type kiya hai to attempted manenge
                                const hasAnswer = answers[q.id] && answers[q.id].trim() !== '';
                                const isAttempted = !!hasAnswer;
                                const isCurrent = currentQIndex === idx;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQIndex(idx)}
                                        className={`palette-btn ${isAttempted ? 'attempted' : ''} ${isCurrent ? 'current' : ''}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            }) : (
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No questions</p>
                            )}
                        </div>

                        <div className="palette-legend">
                            <div className="legend-item"><span className="dot attempted"></span> Attempted</div>
                            <div className="legend-item"><span className="dot"></span> Unattempted</div>
                        </div>
                    </aside>

                    <section className="active-question-area">
                        {questions.length > 0 ? (
                            <motion.div
                                key={currentQIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="question-card"
                            >
                                <div className="q-header">
                                    <h3>Question {currentQIndex + 1} of {questions.length}</h3>
                                    <span className="marks-badge">+{currentQ.marks || 1} Marks</span>
                                </div>

                                <p className="q-text">{currentQ.text}</p>
                                {currentQ.image && <img src={currentQ.image} alt="Question Graphic" className="q-image" />}

                                {/* 🚀 DYNAMIC RENDERING: MCQ vs SUBJECTIVE */}
                                {!isSubjective ? (
                                    <div className="options-list">
                                        {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey, index) => {
                                            const optLetter = String.fromCharCode(65 + index);
                                            const optValue = currentQ[optKey];

                                            if (!optValue) return null;

                                            const isSelected = answers[currentQ.id] === optLetter;

                                            return (
                                                <div
                                                    key={optLetter}
                                                    className={`option-box ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleSelectOption(currentQ.id, optLetter)}
                                                >
                                                    <div className="opt-letter">{optLetter}</div>
                                                    <div className="opt-text">{optValue}</div>
                                                    {isSelected && <CheckCircle size={20} className="check-icon" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="subjective-answer-area">
                                        <div className="sub-helper"><AlignLeft size={16} /> Type your detailed answer below:</div>
                                        <textarea
                                            className="subjective-textarea"
                                            placeholder="Start writing here..."
                                            value={answers[currentQ.id] || ""}
                                            onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                                        ></textarea>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="no-questions-warning">
                                <AlertCircle size={48} color="#ef4444" />
                                <h2>No Questions Found!</h2>
                                <p>This exam has been created, but no questions have been added to it yet.</p>
                                <p>Please ask the teacher to add questions to this test.</p>
                            </div>
                        )}

                        <div className="exam-footer">
                            <button
                                className="nav-btn prev"
                                disabled={currentQIndex === 0 || questions.length === 0}
                                onClick={() => setCurrentQIndex(prev => prev - 1)}
                            >
                                <ChevronLeft size={20} /> Previous
                            </button>

                            {questions.length > 0 && currentQIndex < questions.length - 1 ? (
                                <button
                                    className="nav-btn next"
                                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                                >
                                    Next <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    className="submit-btn"
                                    onClick={handleSubmitExam}
                                    disabled={isSubmitting || questions.length === 0}
                                >
                                    {isSubmitting ? "Submitting..." : <>Submit Exam <Send size={18} /></>}
                                </button>
                            )}
                        </div>
                    </section>

                </div>
            </main>

            <style jsx="true">{`
                .exam-fullscreen-mode { 
                    height: 100vh; 
                    width: 100vw; 
                    background: #f8fafc; 
                    font-family: 'Inter', sans-serif; 
                    overflow: hidden; 
                    position: fixed; 
                    top: 0; left: 0; right: 0; bottom: 0;
                    z-index: 99999; 
                }
                
                .exam-main-content { 
                    display: flex; flex-direction: column; height: 100%; width: 100%;
                }

                .live-exam-header { 
                    background: white; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; 
                    border-bottom: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                }
                .exam-title-box h2 { margin: 0; color: #0f172a; font-size: 1.5rem; font-weight: 800; }
                .badge { background: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 700; margin-top: 8px; display: inline-block;}
                
                .header-right-actions { display: flex; align-items: center; gap: 20px; }
                .timer-box { display: flex; align-items: center; gap: 12px; background: #f1f5f9; padding: 10px 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .timer-box.danger { background: #fef2f2; color: #ef4444; border-color: #fecaca; animation: pulse 1s infinite; }
                .time-text { font-size: 1.6rem; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: 1px;}
                .time-label { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: #64748b;}
                
                .btn-exit { background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;}
                .btn-exit:hover { background: #ef4444; color: white; transform: scale(1.05); }

                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }

                .exam-workspace { display: flex; flex: 1; overflow: hidden; }
                
                .question-palette { width: 320px; background: white; border-right: 1px solid #e2e8f0; padding: 30px; display: flex; flex-direction: column;}
                .question-palette h3 { margin: 0 0 25px 0; color: #1e293b; font-size: 1.2rem; }
                .palette-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; overflow-y: auto; padding-right: 10px; max-height: calc(100vh - 250px);}
                .palette-btn { aspect-ratio: 1; border-radius: 12px; border: 2px solid #e2e8f0; background: white; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; font-size: 1.1rem;}
                .palette-btn:hover { border-color: #cbd5e1; background: #f8fafc; }
                .palette-btn.attempted { background: #10b981; color: white; border-color: #10b981; }
                .palette-btn.current { border-color: #8b5cf6; box-shadow: 0 0 0 4px rgba(139,92,246,0.2); }
                .palette-btn.attempted.current { background: #059669; }
                
                .palette-legend { margin-top: auto; padding-top: 25px; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 12px;}
                .legend-item { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; color: #475569; font-weight: 600;}
                .dot { width: 14px; height: 14px; border-radius: 50%; background: #e2e8f0; }
                .dot.attempted { background: #10b981; }

                .active-question-area { flex: 1; padding: 40px; display: flex; flex-direction: column; overflow-y: auto; position: relative;}
                .question-card { background: white; padding: 50px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; flex: 1; display: flex; flex-direction: column; max-width: 900px; margin: 0 auto; width: 100%;}
                
                .q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;}
                .q-header h3 { margin: 0; color: #64748b; font-size: 1.2rem; font-weight: 700; }
                .marks-badge { background: #fef3c7; color: #d97706; font-weight: 800; padding: 6px 15px; border-radius: 8px; font-size: 1rem;}
                
                .q-text { font-size: 1.4rem; color: #0f172a; font-weight: 600; line-height: 1.6; margin: 0 0 40px 0;}
                .q-image { max-width: 100%; max-height: 300px; border-radius: 12px; margin-bottom: 30px;}
                
                /* MCQ STYLES */
                .options-list { display: flex; flex-direction: column; gap: 18px; margin-top: auto;}
                .option-box { display: flex; align-items: center; gap: 20px; padding: 18px 25px; border: 2px solid #e2e8f0; border-radius: 16px; cursor: pointer; transition: 0.2s; background: white;}
                .option-box:hover { border-color: #cbd5e1; background: #f8fafc; transform: translateX(5px); }
                .option-box.selected { border-color: #8b5cf6; background: #f5f3ff; }
                .opt-letter { width: 40px; height: 40px; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: 800; font-size: 1.1rem;}
                .option-box.selected .opt-letter { background: #8b5cf6; color: white; }
                .opt-text { font-size: 1.15rem; color: #334155; font-weight: 500; flex: 1;}
                .check-icon { color: #8b5cf6; }

                /* 🚀 NEW: SUBJECTIVE TEXTAREA STYLES */
                .subjective-answer-area { margin-top: auto; display: flex; flex-direction: column; gap: 10px;}
                .sub-helper { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.95rem; font-weight: 600;}
                .subjective-textarea { 
                    width: 100%; min-height: 250px; padding: 20px; border: 2px solid #e2e8f0; border-radius: 16px; 
                    font-size: 1.1rem; color: #1e293b; background: #f8fafc; resize: vertical; 
                    font-family: 'Inter', sans-serif; transition: 0.3s; line-height: 1.6;
                }
                .subjective-textarea:focus { border-color: #8b5cf6; outline: none; background: white; box-shadow: 0 0 0 4px rgba(139,92,246,0.1); }

                .no-questions-warning { text-align: center; padding: 60px 20px; background: white; border-radius: 20px; max-width: 600px; margin: 40px auto; border: 1px dashed #cbd5e1; }
                .no-questions-warning h2 { margin: 15px 0 10px 0; color: #1e293b; }
                .no-questions-warning p { color: #64748b; margin: 5px 0;}

                .exam-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; background: white; padding: 25px 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; max-width: 900px; margin-left: auto; margin-right: auto; width: 100%;}
                .nav-btn { display: flex; align-items: center; gap: 10px; padding: 14px 30px; border: 2px solid #e2e8f0; background: white; color: #475569; font-weight: 700; border-radius: 12px; cursor: pointer; transition: 0.2s; font-size: 1.1rem;}
                .nav-btn:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; }
                .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .nav-btn.next { background: #0f172a; color: white; border: none;}
                .nav-btn.next:hover { background: #1e293b; }
                
                .submit-btn { display: flex; align-items: center; gap: 12px; background: #10b981; color: white; border: none; padding: 14px 35px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 1.1rem;}
                .submit-btn:hover:not(:disabled) { background: #059669; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); transform: translateY(-2px);}
                .submit-btn:disabled { background: #94a3b8; cursor: not-allowed; }
                
                @media(max-width: 768px) {
                  .exam-workspace { flex-direction: column; overflow-y: auto;}
                  .question-palette { width: 100%; border-right: none; border-bottom: 2px solid #e2e8f0; padding: 20px;}
                  .palette-grid { max-height: 150px; }
                  .active-question-area { padding: 15px; }
                  .question-card { padding: 25px; }
                  .live-exam-header { flex-direction: column; gap: 15px; align-items: flex-start; padding: 20px;}
                  .header-right-actions { width: 100%; justify-content: space-between; }
                }
            `}</style>
        </div>
    );
}