import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
// ✅ NEW ICONS ADDED (Camera, Play, Pause, AlertCircle)
import { Clock, CheckCircle, FileText, UserCheck, Brain, Plus, Trash, Save, FileOutput, Eye, Edit2, X, Sparkles, Zap, ChevronLeft, ChevronRight, RefreshCw, Layers, Award, BarChart2, Target, CheckSquare, ShoppingCart, List, Camera, Play, Pause, AlertCircle } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import api from "../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Exams() {
    const [activeTab, setActiveTab] = useState('setter');
    const [loaded, setLoaded] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // --- PAPER SETTER STATE ---
    const [questions, setQuestions] = useState([]);

    const [newQ, setNewQ] = useState({
        text: "", q_type: "Descriptive", difficulty: "Medium", section: "A", level: "Level 1",
        marks: 5, negative_marks: 0, unattempted_marks: 0,
        option_a: "", option_b: "", option_c: "", option_d: "", option_e: "", option_f: "", option_g: "", option_h: "", correct_option: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [viewQ, setViewQ] = useState(null);

    const [examMeta, setExamMeta] = useState({
        examName: "", className: "", subClass: "", subject: "", subSubject: "",
        unit: "", chapter: "", examineeBody: "", timeAllowed: "", maxMarks: "",
        paperId: "", paperSetNumber: "", placeOfExam: "", examPassword: "",
        validity: "", permission: "Management", teacherName: "",
        modeOfExam: "Online", toolsAllowed: "None",
        examType: "Actual Exam", paperType: "Both"
    });

    const [editMeta, setEditMeta] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const API_ENDPOINT = "exams/questions/";

    // --- EVALUATION STATE (🔥 FEATURE 2: 3-TEACHER EVALUATION UPDATE) ---
    const [currentSubmission, setCurrentSubmission] = useState(null);
    const [evaluations, setEvaluations] = useState({
        // ✅ Default mock scores given to T1 and T2 to show Average calculation dynamically
        teacher1: { score: 78, comments: "Good concepts.", status: "Done" },
        teacher2: { score: 84, comments: "Detailed answers.", status: "Done" },
        teacher3: { score: null, comments: "Pending Review", status: "Pending" }
    });
    const [aiScore, setAiScore] = useState(null);
    const [finalAverage, setFinalAverage] = useState("Pending");

    // --- OMR & RESULT STATE (🔥 FEATURE 3: OMR SCANNER STATE) ---
    const [studentAnswers, setStudentAnswers] = useState({});
    const [examResult, setExamResult] = useState(null);
    const [detailedResults, setDetailedResults] = useState([]);
    const [isScanningOMR, setIsScanningOMR] = useState(false);

    // --- LIVE QUIZ STATE (🔥 FEATURE 1: KBC STYLE QUIZ) ---
    const [quizGroups, setQuizGroups] = useState([
        { id: 'G1', score: 0, bonus: 0 }, { id: 'G2', score: 0, bonus: 0 },
        { id: 'G3', score: 0, bonus: 0 }, { id: 'G4', score: 0, bonus: 0 }, { id: 'G5', score: 0, bonus: 0 }
    ]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [quizTimer, setQuizTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [quizLight, setQuizLight] = useState('red');

    useEffect(() => {
        setLoaded(true);
        if (activeTab === 'setter' || activeTab === 'omr') {
            fetchQuestions();
        } else if (activeTab === 'evaluation') {
            fetchEvaluationData();
        }
    }, [activeTab]);

    // 🔥 FEATURE 1: LIVE QUIZ TIMER LOGIC
    useEffect(() => {
        let interval = null;
        if (isTimerRunning && quizTimer > 0) {
            setQuizLight('green');
            interval = setInterval(() => setQuizTimer(t => t - 1), 1000);
        } else if (quizTimer === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            setQuizLight('yellow');
            toast.error("Time's Up!", { icon: '⏰' });
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, quizTimer]);

    // 🔥 FEATURE 2: 3-TEACHER AVERAGE CALCULATOR LOGIC
    useEffect(() => {
        let total = 0;
        let count = 0;
        if (evaluations.teacher1.status === 'Done') { total += Number(evaluations.teacher1.score); count++; }
        if (evaluations.teacher2.status === 'Done') { total += Number(evaluations.teacher2.score); count++; }
        if (evaluations.teacher3.status === 'Done') { total += Number(evaluations.teacher3.score); count++; }

        if (count === 3) {
            setFinalAverage((total / 3).toFixed(2));
        } else {
            setFinalAverage("Pending");
        }
    }, [evaluations]);


    // --- ACTIONS ---
    const fetchQuestions = async () => {
        setLoadingData(true);
        try {
            const res = await api.get(API_ENDPOINT);
            setQuestions(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.warn("Backend not connected. Using local dummy data.");
            setQuestions([
                {
                    id: 1, text: "Explain Newton's Laws of Motion.", q_type: "Descriptive", difficulty: "Medium", level: "Level 2", section: "A", marks: 10, negative_marks: 0, unattempted_marks: 0,
                    exam_meta: { className: "10th", subClass: "A", subject: "Science", subSubject: "Physics", unit: "01", chapter: "04", paperId: "PHY-101", examPassword: "123", validity: "2 Hrs", permission: "Management", modeOfExam: "Online", toolsAllowed: "AI ChatGPT", examType: "Mock Test", paperType: "Both" }
                },
                {
                    id: 2, text: "Select the correct properties of a noble gas:", q_type: "MCQ", difficulty: "Hard", level: "Level 3", section: "A", marks: 4, negative_marks: 1, unattempted_marks: 0, option_a: "Reactive", option_b: "Odorless", option_c: "Colorless", option_d: "Flammable", option_e: "Stable", option_f: "Toxic", correct_option: "E",
                    exam_meta: { className: "10th", subClass: "B", subject: "Science", subSubject: "Chemistry", unit: "02", chapter: "05", paperId: "CHE-201", examPassword: "abc", validity: "3 Hrs", permission: "Seekers", modeOfExam: "Offline", toolsAllowed: "None", examType: "Actual Exam", paperType: "Objective" }
                }
            ]);
        } finally {
            setLoadingData(false);
        }
    };

    const handleSaveQuestion = async () => {
        if (!newQ.text) return toast.error("Write a question first!");
        const loadId = toast.loading("Saving...");

        try {
            let questionPayload;
            if (editingId) {
                questionPayload = { ...newQ, exam_meta: { ...editMeta } };
                await api.put(`${API_ENDPOINT}${editingId}/`, questionPayload);
                setQuestions(questions.map(q => q.id === editingId ? { ...questionPayload, id: editingId } : q));
                toast.success("Question Updated Successfully!", { id: loadId });
                setEditingId(null);
                setShowEditModal(false);
            } else {
                questionPayload = { ...newQ, exam_meta: { ...examMeta } };
                const res = await api.post(API_ENDPOINT, questionPayload);
                const savedQ = res.data && res.data.id ? res.data : { ...questionPayload, id: Date.now() };
                setQuestions([savedQ, ...questions]);
                toast.success("Saved to Database!", { id: loadId });
            }
            setNewQ({ text: "", q_type: "Descriptive", difficulty: "Medium", section: "A", level: "Level 1", marks: 5, negative_marks: 0, unattempted_marks: 0, option_a: "", option_b: "", option_c: "", option_d: "", option_e: "", option_f: "", option_g: "", option_h: "", correct_option: "" });
            setEditMeta({});
        } catch (error) {
            const fakeId = Date.now();
            if (editingId) {
                const questionPayload = { ...newQ, exam_meta: { ...editMeta } };
                setQuestions(questions.map(q => q.id === editingId ? { ...questionPayload, id: editingId } : q));
                setEditingId(null);
                setShowEditModal(false);
            } else {
                const questionPayload = { ...newQ, exam_meta: { ...examMeta } };
                setQuestions([{ ...questionPayload, id: fakeId }, ...questions]);
            }
            toast.success("Saved Locally (DB Offline)", { id: loadId });
            setNewQ({ text: "", q_type: "Descriptive", difficulty: "Medium", section: "A", level: "Level 1", marks: 5, negative_marks: 0, unattempted_marks: 0, option_a: "", option_b: "", option_c: "", option_d: "", option_e: "", option_f: "", option_g: "", option_h: "", correct_option: "" });
            setEditMeta({});
        }
    };

    const initiateDelete = (q) => {
        setQuestionToDelete(q);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!questionToDelete) return;
        try {
            await api.delete(`${API_ENDPOINT}${questionToDelete.id}/`);
            setQuestions(questions.filter(q => q.id !== questionToDelete.id));
            toast.success("Deleted from Database");
        } catch (error) {
            setQuestions(questions.filter(q => q.id !== questionToDelete.id));
            toast.success("Deleted Locally");
        }
        setShowDeleteModal(false);
        setQuestionToDelete(null);
    };

    const handleEditClick = (q) => {
        setNewQ({
            text: q.text, q_type: q.q_type, marks: q.marks, difficulty: q.difficulty || "Medium", section: q.section || "A", level: q.level || "Level 1",
            negative_marks: q.negative_marks || 0, unattempted_marks: q.unattempted_marks || 0,
            option_a: q.option_a || "", option_b: q.option_b || "", option_c: q.option_c || "", option_d: q.option_d || "",
            option_e: q.option_e || "", option_f: q.option_f || "", option_g: q.option_g || "", option_h: q.option_h || "",
            correct_option: q.correct_option || ""
        });
        setEditMeta(q.exam_meta || {});
        setEditingId(q.id);
        setShowEditModal(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewQ({ text: "", q_type: "Descriptive", difficulty: "Medium", section: "A", level: "Level 1", marks: 5, negative_marks: 0, unattempted_marks: 0, option_a: "", option_b: "", option_c: "", option_d: "", option_e: "", option_f: "", option_g: "", option_h: "", correct_option: "" });
        setEditMeta({});
        setShowEditModal(false);
    };

    const generatePaper = () => {
        if (!examMeta.examName) return toast.error("Please enter Exam Name first!");
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(examMeta.examName, 105, 15, null, null, "center");

            doc.setFontSize(10);
            const classStr = examMeta.subClass ? `${examMeta.className} (${examMeta.subClass})` : examMeta.className || "N/A";
            const subStr = examMeta.subSubject ? `${examMeta.subject} - ${examMeta.subSubject}` : examMeta.subject || "N/A";

            doc.text(`Class/Sec: ${classStr} | Subject: ${subStr} | Set By: ${examMeta.teacherName || "N/A"}`, 105, 23, null, null, "center");
            doc.text(`Place: ${examMeta.placeOfExam || "N/A"} | Paper ID: ${examMeta.paperId || "N/A"} | Set: ${examMeta.paperSetNumber || "N/A"}`, 105, 29, null, null, "center");
            doc.text(`Type: ${examMeta.examType} | Mode: ${examMeta.modeOfExam} | Max: ${examMeta.maxMarks}`, 105, 35, null, null, "center");

            const tableRows = questions.map((q, i) => [
                i + 1,
                q.section || "A",
                q.level || "Level 1",
                q.q_type === 'MCQ' ? `${q.text}\nA) ${q.option_a} B) ${q.option_b} C) ${q.option_c} D) ${q.option_d}\nE) ${q.option_e} F) ${q.option_f} G) ${q.option_g} H) ${q.option_h}`.replace(/ [A-H]\) $/g, '') : q.text,
                q.q_type,
                q.difficulty || "Medium",
                `+${q.marks} / -${q.negative_marks || 0}`
            ]);

            if (typeof doc.autoTable === 'function') {
                doc.autoTable({ head: [["Q.No", "Sec", "Level", "Question", "Type", "Diff", "Marking"]], body: tableRows, startY: 40 });
            } else {
                doc.text("Table generation failed. Raw data below:", 10, 45);
            }
            doc.save(`${examMeta.examName}_${examMeta.className}_${examMeta.subject}_Paper.pdf`);
            toast.success("Paper Set Generated! 💾");
        } catch (error) { toast.error("Failed to generate PDF. Check console."); }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuestions = questions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(questions.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

    const fetchEvaluationData = async () => {
        try {
            setCurrentSubmission({ answer_text: "Newton's first law states that an object remains in a state of rest or of uniform motion in a straight line unless compelled to change that state by an applied force." });
        } catch (error) { }
    };

    const handleAiCheck = async () => {
        toast.loading("AI Scanning Answer Sheet...");
        const answerToEvaluate = currentSubmission?.answer_text || "Newton's first law states that an object remains in a state of rest or of uniform motion in a straight line unless compelled to change that state by an applied force.";
        try {
            const res = await api.post('exams/ai-evaluate/', { answer: answerToEvaluate });
            toast.dismiss();
            if (res.data && res.data.score) {
                setAiScore(res.data.score);
                toast.success("AI Evaluation Complete!");
                fetchEvaluationData();
            }
        } catch (error) {
            toast.dismiss();
            toast.success("AI Mock Mode: 88/100 Assessed");
            setAiScore(88);
        }
    };

    // 🔥 FEATURE 2 ACTION: Submit Teacher 3 Score
    const submitTeacher3Score = () => {
        setEvaluations({ ...evaluations, teacher3: { score: 85, comments: "Well written and explained properly.", status: "Done" } });
        toast.success("Teacher 3 (T3) Score Submitted!");
    }

    // 🔥 FEATURE 3 ACTION: OMR SCANNER SIMULATION
    const simulateOMRScan = (e) => {
        if (!e.target.files[0]) return;
        setIsScanningOMR(true);
        toast.loading("AI Scanning Physical OMR Sheet...", { id: "omr" });

        setTimeout(() => {
            const mockScannedAnswers = {};
            questions.filter(q => q.q_type === 'MCQ').forEach(q => {
                const activeOpts = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].filter(opt => q[`option_${opt.toLowerCase()}`]);
                const fallbackOpts = activeOpts.length > 0 ? activeOpts : ['A', 'B', 'C', 'D'];
                mockScannedAnswers[q.id] = fallbackOpts[Math.floor(Math.random() * fallbackOpts.length)];
            });
            setStudentAnswers(mockScannedAnswers);
            setIsScanningOMR(false);
            toast.success("OMR Scan Successful! Answers Auto-filled.", { id: "omr" });
        }, 2500);
    };

    const handleOMRSelect = (qId, option) => {
        setStudentAnswers({ ...studentAnswers, [qId]: option });
    };

    const submitOMR = async () => {
        const loadId = toast.loading("Calculating & Saving Results to Database...");
        let totalMaxMarks = 0;
        let obtainedMarks = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let unattemptedCount = 0;

        let totalCorrectMarksAwarded = 0;
        let totalIncorrectMarksDeducted = 0;
        let totalUnattemptedMarksDeducted = 0;

        let detailedLog = [];

        const mcqQuestions = questions.filter(q => q.q_type === 'MCQ' || q.q_type === 'True/False');

        mcqQuestions.forEach((q, idx) => {
            totalMaxMarks += (q.marks || 0);
            const studentAns = studentAnswers[q.id];

            let logEntry = {
                qNo: idx + 1,
                mm: q.marks || 0,
                section: q.section || "A",
                correctOption: q.correct_option || "-",
                attempted: studentAns ? studentAns : "Not Attempted",
                status: "",
                marksAwarded: 0
            };

            if (!studentAns) {
                unattemptedCount++;
                totalUnattemptedMarksDeducted += (q.unattempted_marks || 0);
                obtainedMarks -= (q.unattempted_marks || 0);
                logEntry.status = "Unattempted";
                logEntry.marksAwarded = -(q.unattempted_marks || 0);
            } else if (studentAns === q.correct_option) {
                correctCount++;
                totalCorrectMarksAwarded += (q.marks || 0);
                obtainedMarks += (q.marks || 0);
                logEntry.status = "Correct";
                logEntry.marksAwarded = (q.marks || 0);
            } else {
                incorrectCount++;
                totalIncorrectMarksDeducted += (q.negative_marks || 0);
                obtainedMarks -= (q.negative_marks || 0);
                logEntry.status = "Incorrect";
                logEntry.marksAwarded = -(q.negative_marks || 0);
            }
            detailedLog.push(logEntry);
        });

        const percentage = totalMaxMarks > 0 ? (obtainedMarks / totalMaxMarks) * 100 : 0;
        let grade = "F";
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B+";
        else if (percentage >= 60) grade = "B";
        else if (percentage >= 50) grade = "C";
        else if (percentage >= 40) grade = "D";

        try {
            await api.post("exams/submit/1/", {
                answers: studentAnswers,
                final_score: obtainedMarks,
                percentage: percentage,
                negative_marks_deducted: totalIncorrectMarksDeducted // 🔥 NEW: Backend OMR tracker ke liye
            });
            toast.success("Result Saved to Database Successfully!", { id: loadId });
        } catch (error) {
            console.warn("Backend not ready or offline. Saving Locally.");
            toast.success("Result Generated (Local Mode)", { id: loadId });
        }

        setTimeout(() => {
            setExamResult({
                totalQuestions: mcqQuestions.length,
                totalMaxMarks, obtainedMarks, correctCount, incorrectCount, unattemptedCount,
                totalCorrectMarksAwarded, totalIncorrectMarksDeducted, totalUnattemptedMarksDeducted,
                percentage: percentage.toFixed(2), grade
            });
            setDetailedResults(detailedLog);
        }, 500);
    };

    // 🔥 FEATURE 1 ACTIONS: LIVE QUIZ LOGIC
    const startQuizRound = (time) => {
        if (!activeGroup) return toast.error("Select a group first!");
        setQuizTimer(time);
        setIsTimerRunning(true);
        setQuizLight('green');
    };

    const stopQuizRound = () => {
        setIsTimerRunning(false);
        setQuizLight('red');
    };

    const awardQuizMarks = (type) => {
        if (!activeGroup) return;
        const updatedGroups = quizGroups.map(g => {
            if (g.id === activeGroup) {
                return { ...g, score: type === 'main' ? g.score + 10 : g.score, bonus: type === 'bonus' ? g.bonus + 5 : g.bonus };
            }
            return g;
        });
        setQuizGroups(updatedGroups);
        toast.success(`Marks Awarded to ${activeGroup}`);
        setQuizLight('red');
        setIsTimerRunning(false);
        setQuizTimer(0);
    };

    return (
        <div className="exams-page-wrapper">
            <SidebarModern />
            <div className="exams-main-content">
                <Toaster position="top-center" />

                <header className={`page-header ${loaded ? 'slide-in-top' : ''}`}>
                    <div className="header-titles">
                        <h1 className="page-title">Exam Controller <Sparkles size={24} className="sparkle-icon" color="#3b82f6" /></h1>
                        <p className="page-subtitle">Connected to Live Database ⚡</p>
                    </div>
                    <div className="tab-switch">
                        <button onClick={() => setActiveTab('setter')} className={`tab-btn ${activeTab === 'setter' ? 'active' : ''}`}>
                            <Plus size={18} /> Paper Setter
                        </button>
                        <button onClick={() => setActiveTab('omr')} className={`tab-btn ${activeTab === 'omr' ? 'active' : ''}`}>
                            <Target size={18} /> Live OMR Exam
                        </button>
                        <button onClick={() => setActiveTab('evaluation')} className={`tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}>
                            <CheckCircle size={18} /> Evaluation
                        </button>
                        {/* ✅ NEW TAB FOR LIVE QUIZ */}
                        <button onClick={() => setActiveTab('quiz')} className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}>
                            <AlertCircle size={18} /> Live Quiz (KBC)
                        </button>
                    </div>
                </header>

                {activeTab === 'setter' && (
                    <div className="content-wrapper">

                        {/* ✅ GLOBAL EXAM META DATA */}
                        <div className="card shadow-md stagger-1 mb-20">
                            <div className="card-header">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Layers size={18} color="#3b82f6" /> Exam Configuration</h3>
                            </div>
                            <div className="card-body form-grid">
                                <div className="input-group"><input type="text" placeholder="Name of Exam (e.g. Final)" className="input-field" value={examMeta.examName} onChange={e => setExamMeta({ ...examMeta, examName: e.target.value })} /></div>

                                <div className="input-group">
                                    <select className="input-field" value={examMeta.examType} onChange={e => setExamMeta({ ...examMeta, examType: e.target.value })}>
                                        <option value="Mock Test">Mock Test</option><option value="Actual Exam">Actual Exam</option><option value="Practice">Practice</option><option value="Both">Both</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <select className="input-field" value={examMeta.paperType} onChange={e => setExamMeta({ ...examMeta, paperType: e.target.value })}>
                                        <option value="Objective">Objective</option><option value="Descriptive">Descriptive</option><option value="Both">Both</option><option value="None">None</option>
                                    </select>
                                </div>

                                <div className="input-group"><input type="text" placeholder="Class (e.g. 10th)" className="input-field" value={examMeta.className} onChange={e => setExamMeta({ ...examMeta, className: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Sub-Class/Section (e.g. A, B)" className="input-field" value={examMeta.subClass} onChange={e => setExamMeta({ ...examMeta, subClass: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Subject (e.g. Science)" className="input-field" value={examMeta.subject} onChange={e => setExamMeta({ ...examMeta, subject: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Sub-Subject (e.g. Physics)" className="input-field" value={examMeta.subSubject} onChange={e => setExamMeta({ ...examMeta, subSubject: e.target.value })} /></div>

                                <div className="input-group"><input type="text" placeholder="Unit (e.g. 01)" className="input-field" value={examMeta.unit} onChange={e => setExamMeta({ ...examMeta, unit: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Chapter (e.g. 05)" className="input-field" value={examMeta.chapter} onChange={e => setExamMeta({ ...examMeta, chapter: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Paper ID" className="input-field" value={examMeta.paperId} onChange={e => setExamMeta({ ...examMeta, paperId: e.target.value })} /></div>
                                <div className="input-group"><input type="password" placeholder="Exam Password" className="input-field" value={examMeta.examPassword} onChange={e => setExamMeta({ ...examMeta, examPassword: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Validity" className="input-field" value={examMeta.validity} onChange={e => setExamMeta({ ...examMeta, validity: e.target.value })} /></div>

                                <div className="input-group">
                                    <select className="input-field" value={examMeta.permission} onChange={e => setExamMeta({ ...examMeta, permission: e.target.value })}>
                                        <option value="Management">Management</option><option value="Provider">Provider</option><option value="Seekers">Seekers</option><option value="Guest">Guest</option><option value="Permanent">Permanent</option><option value="Adhoc">Adhoc</option><option value="Daily Wagers">Daily Wagers</option><option value="Others">Others</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <select className="input-field" value={examMeta.modeOfExam} onChange={e => setExamMeta({ ...examMeta, modeOfExam: e.target.value })}>
                                        <option value="Online">Online</option><option value="Offline">Offline</option><option value="Both">Both</option><option value="None">None</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <select className="input-field" value={examMeta.toolsAllowed} onChange={e => setExamMeta({ ...examMeta, toolsAllowed: e.target.value })}>
                                        <option value="None">None (No Tools)</option><option value="AI ChatGPT">AI ChatGPT Allowed</option><option value="Live Class">Live Class</option><option value="Recorded Video">Recorded Video</option><option value="Digitalised Board">Digitalised Board</option>
                                    </select>
                                </div>

                                <div className="input-group"><input type="text" placeholder="Examinee Body (e.g. CBSE)" className="input-field" value={examMeta.examineeBody} onChange={e => setExamMeta({ ...examMeta, examineeBody: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Place of Exam" className="input-field" value={examMeta.placeOfExam} onChange={e => setExamMeta({ ...examMeta, placeOfExam: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Paper Set Number (e.g. A, B)" className="input-field" value={examMeta.paperSetNumber} onChange={e => setExamMeta({ ...examMeta, paperSetNumber: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Time Allowed (e.g. 3 Hrs)" className="input-field" value={examMeta.timeAllowed} onChange={e => setExamMeta({ ...examMeta, timeAllowed: e.target.value })} /></div>
                                <div className="input-group"><input type="number" placeholder="Total Max Marks" className="input-field" value={examMeta.maxMarks} onChange={e => setExamMeta({ ...examMeta, maxMarks: e.target.value })} /></div>
                                <div className="input-group"><input type="text" placeholder="Paper Setter / Teacher Name" className="input-field" value={examMeta.teacherName} onChange={e => setExamMeta({ ...examMeta, teacherName: e.target.value })} /></div>
                            </div>
                        </div>

                        {/* QUESTION FORM */}
                        <div className="card shadow-md stagger-1">
                            <div className="card-header">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} color="#f59e0b" /> Add New Question</h3>
                            </div>
                            <div className="card-body form-grid">
                                <div className="input-group full-width-grid">
                                    <input type="text" placeholder="Enter Question Text..." className="input-field" value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} />
                                    <span className="focus-border"></span>
                                </div>

                                <select className="input-field hover-glow" value={newQ.q_type} onChange={(e) => setNewQ({ ...newQ, q_type: e.target.value })}>
                                    <option value="Descriptive">Descriptive</option>
                                    <option value="MCQ">MCQ</option>
                                    <option value="True/False">True/False</option>
                                    <option value="Both">Both</option>
                                    <option value="None">None</option>
                                </select>

                                <select className="input-field hover-glow" value={newQ.difficulty} onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })}>
                                    <option value="Easy">Easy Level</option>
                                    <option value="Medium">Medium Level</option>
                                    <option value="Hard">Hard Level</option>
                                </select>

                                <input type="text" placeholder="Section (e.g. A, B)" className="input-field hover-glow" value={newQ.section} onChange={(e) => setNewQ({ ...newQ, section: e.target.value })} />

                                <select className="input-field hover-glow" value={newQ.level} onChange={(e) => setNewQ({ ...newQ, level: e.target.value })}>
                                    <option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Level 3">Level 3</option><option value="Level 4">Level 4</option>
                                </select>

                                <input type="number" placeholder="+ Marks (Correct)" className="input-field hover-glow" value={newQ.marks} onChange={(e) => setNewQ({ ...newQ, marks: parseFloat(e.target.value) || 0 })} />
                                <input type="number" placeholder="- Marks (Incorrect)" className="input-field hover-glow" value={newQ.negative_marks} onChange={(e) => setNewQ({ ...newQ, negative_marks: parseFloat(e.target.value) || 0 })} />
                                <input type="number" placeholder="0 Marks (Not Attempt)" className="input-field hover-glow" value={newQ.unattempted_marks} onChange={(e) => setNewQ({ ...newQ, unattempted_marks: parseFloat(e.target.value) || 0 })} />

                                {newQ.q_type === 'MCQ' && (
                                    <div className="mcq-options-row full-width-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                        <input type="text" placeholder="Option A" className="input-field" value={newQ.option_a} onChange={(e) => setNewQ({ ...newQ, option_a: e.target.value })} />
                                        <input type="text" placeholder="Option B" className="input-field" value={newQ.option_b} onChange={(e) => setNewQ({ ...newQ, option_b: e.target.value })} />
                                        <input type="text" placeholder="Option C" className="input-field" value={newQ.option_c} onChange={(e) => setNewQ({ ...newQ, option_c: e.target.value })} />
                                        <input type="text" placeholder="Option D" className="input-field" value={newQ.option_d} onChange={(e) => setNewQ({ ...newQ, option_d: e.target.value })} />
                                        <input type="text" placeholder="Option E" className="input-field" value={newQ.option_e} onChange={(e) => setNewQ({ ...newQ, option_e: e.target.value })} />
                                        <input type="text" placeholder="Option F" className="input-field" value={newQ.option_f} onChange={(e) => setNewQ({ ...newQ, option_f: e.target.value })} />
                                        <input type="text" placeholder="Option G" className="input-field" value={newQ.option_g} onChange={(e) => setNewQ({ ...newQ, option_g: e.target.value })} />
                                        <input type="text" placeholder="Option H" className="input-field" value={newQ.option_h} onChange={(e) => setNewQ({ ...newQ, option_h: e.target.value })} />

                                        <select className="input-field option-correct-select" style={{ gridColumn: 'span 4' }} value={newQ.correct_option} onChange={(e) => setNewQ({ ...newQ, correct_option: e.target.value })}>
                                            <option value="">Select Correct Ans?</option>
                                            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                            <option value="E">E</option><option value="F">F</option><option value="G">G</option><option value="H">H</option>
                                        </select>
                                    </div>
                                )}

                                <div className="btn-group full-width-grid" style={{ marginTop: '10px' }}>
                                    <button onClick={handleSaveQuestion} className="btn-primary ripple-effect save-db-btn">Save to DB</button>
                                </div>
                            </div>
                        </div>

                        {/* TABLE CARD */}
                        <div className="card shadow-md stagger-2" style={{ marginTop: '20px' }}>
                            <div className="card-header table-card-header">
                                <h3>Database Records ({questions.length})</h3>
                                <div className="table-header-actions">
                                    <button onClick={fetchQuestions} className="icon-btn btn-view" title="Refresh Data"><RefreshCw size={16} /></button>
                                    <button onClick={generatePaper} className="btn-success ripple-effect"><FileOutput size={18} /> Generate Paper PDF</button>
                                </div>
                            </div>

                            <div className="card-body table-wrapper">
                                {loadingData ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading Data from Server...</div>
                                ) : (
                                    <>
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>Q. No</th>
                                                    <th>Section</th>
                                                    <th>Level</th>
                                                    <th>Question</th>
                                                    <th>Class (Sec)</th>
                                                    <th>Subject (Sub)</th>
                                                    <th>Unit</th>
                                                    <th>Chapter</th>
                                                    <th>Type</th>
                                                    <th>Diff</th>
                                                    <th>Marks</th>
                                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentQuestions.length > 0 ? currentQuestions.map((q, i) => (
                                                    <tr key={q.id} className="table-row fade-in-row" style={{ animationDelay: `${i * 0.05}s` }}>
                                                        <td style={{ color: '#64748b' }}>{indexOfFirstItem + i + 1}</td>
                                                        <td style={{ fontWeight: 600, color: '#3b82f6' }}>{q.section || "A"}</td>
                                                        <td style={{ fontWeight: 600, color: '#f59e0b' }}>{q.level || "Level 1"}</td>
                                                        <td className="truncate-text" style={{ fontWeight: 600, color: '#1e293b' }} title={q.text}>{q.text}</td>

                                                        <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                                                            {q.exam_meta?.className || "-"}
                                                            {q.exam_meta?.subClass ? ` (${q.exam_meta.subClass})` : ""}
                                                        </td>

                                                        <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                                                            {q.exam_meta?.subject || "-"}
                                                            {q.exam_meta?.subSubject ? ` - ${q.exam_meta.subSubject}` : ""}
                                                        </td>

                                                        <td style={{ color: '#475569', fontSize: '0.85rem' }}>{q.exam_meta?.unit || "-"}</td>
                                                        <td style={{ color: '#475569', fontSize: '0.85rem' }}>{q.exam_meta?.chapter || "-"}</td>

                                                        <td><span className="badge pop-in">{q.q_type}</span></td>
                                                        <td><span className={`badge pop-in ${(q.difficulty || 'Medium').toLowerCase()}`}>{q.difficulty || "Medium"}</span></td>
                                                        <td style={{ fontWeight: 'bold', color: '#1e293b' }}>{q.marks}</td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button onClick={() => setViewQ(q)} className="icon-btn btn-view hover-3d" title="View"><Eye size={20} /></button>
                                                                <button onClick={() => handleEditClick(q)} className="icon-btn btn-edit hover-3d" title="Edit"><Edit2 size={20} /></button>
                                                                <button onClick={() => initiateDelete(q)} className="icon-btn btn-delete hover-3d" title="Delete"><Trash size={20} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>No Questions in Database yet. Add one above!</td></tr>
                                                )}
                                            </tbody>
                                        </table>

                                        {questions.length > itemsPerPage && (
                                            <div className="pagination-container">
                                                <button onClick={prevPage} disabled={currentPage === 1} className="page-btn nav-btn"><ChevronLeft size={20} /></button>
                                                <div className="page-numbers">
                                                    {Array.from({ length: totalPages }, (_, i) => (
                                                        <button key={i + 1} onClick={() => paginate(i + 1)} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
                                                    ))}
                                                </div>
                                                <button onClick={nextPage} disabled={currentPage === totalPages} className="page-btn nav-btn"><ChevronRight size={20} /></button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: LIVE OMR EXAM WITH FEATURE 3: AI OMR SCANNER */}
                {activeTab === 'omr' && (
                    <div className="content-wrapper stagger-1">
                        {!examResult ? (
                            <>
                                {/* 🔥 NEW: OMR SCANNER INTEGRATION */}
                                <div className="card shadow-md mb-20" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={20} /> OMR Sheet Auto-Scanner</h3>
                                            <p style={{ margin: '5px 0 0', color: '#15803d', fontSize: '0.9rem' }}>Upload a physical OMR sheet photo. AI will detect and fill bubbles automatically.</p>
                                        </div>
                                        <div>
                                            <input type="file" id="omr-upload" accept="image/*" style={{ display: 'none' }} onChange={simulateOMRScan} />
                                            <label htmlFor="omr-upload" className="btn-success ripple-effect" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: '#10b981', color: 'white', fontWeight: 'bold' }}>
                                                {isScanningOMR ? <><RefreshCw className="spin" size={18} /> Scanning...</> : <><Camera size={18} /> Upload & Scan OMR</>}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="exam-meta-header card shadow-md omr-header-card" style={{ marginTop: '20px' }}>
                                    <div>
                                        <h2 style={{ margin: 0, color: '#1e293b' }}>{examMeta.examName || "Practice Test"} - Live OMR Exam</h2>
                                        <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                                            Class: {examMeta.className} {examMeta.subClass ? `(${examMeta.subClass})` : ''} |
                                            Sub: {examMeta.subject} {examMeta.subSubject ? `- ${examMeta.subSubject}` : ''} |
                                            Paper ID: {examMeta.paperId || 'N/A'}
                                        </p>
                                        <div style={{ marginTop: '5px' }}>
                                            <span className="badge medium" style={{ marginRight: '5px' }}>{examMeta.examType}</span>
                                            <span className="badge medium" style={{ marginRight: '5px' }}>{examMeta.modeOfExam} Mode</span>
                                            <span className="badge medium">Tools: {examMeta.toolsAllowed}</span>
                                        </div>
                                    </div>
                                    <div className="omr-header-right">
                                        <div className="badge medium" style={{ fontSize: '1rem', padding: '8px 15px' }}>Time: {examMeta.timeAllowed}</div>
                                    </div>
                                </div>

                                <div className="card shadow-md" style={{ padding: '30px', marginTop: '20px' }}>
                                    {questions.filter(q => q.q_type === 'MCQ' || q.q_type === 'True/False').length > 0 ? (
                                        questions.filter(q => q.q_type === 'MCQ' || q.q_type === 'True/False').map((q, index) => {
                                            const activeOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].filter(opt => q[`option_${opt.toLowerCase()}`] && q[`option_${opt.toLowerCase()}`].trim() !== "");
                                            const finalOptions = activeOptions.length > 0 ? activeOptions : ['A', 'B', 'C', 'D'];

                                            return (
                                                <div key={q.id} className="omr-question-row">
                                                    <div className="omr-q-text">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span className="q-no">{index + 1}.</span> {q.text}
                                                        </div>
                                                        <div className="q-marking-info">Sec: {q.section || 'A'} | {q.level || 'Level 1'} | (+{q.marks} / -{q.negative_marks || 0})</div>
                                                    </div>

                                                    <div className="omr-options-grid">
                                                        {q.q_type === 'MCQ' ? (
                                                            finalOptions.map(opt => (
                                                                <div key={opt} className="omr-option-wrapper">
                                                                    <div
                                                                        className={`omr-bubble ${studentAnswers[q.id] === opt ? 'selected' : ''}`}
                                                                        onClick={() => handleOMRSelect(q.id, opt)}
                                                                    >
                                                                        {opt}
                                                                    </div>
                                                                    <span className="omr-opt-text">{q[`option_${opt.toLowerCase()}`] || `Option ${opt}`}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            ['A', 'B'].map((opt, idx) => (
                                                                <div key={opt} className="omr-option-wrapper">
                                                                    <div
                                                                        className={`omr-bubble ${studentAnswers[q.id] === opt ? 'selected' : ''}`}
                                                                        onClick={() => handleOMRSelect(q.id, opt)}
                                                                    >
                                                                        {opt}
                                                                    </div>
                                                                    <span className="omr-opt-text">{idx === 0 ? 'True' : 'False'}</span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No Objective Questions (MCQ/True-False) found in this paper set.</div>
                                    )}

                                    {questions.filter(q => q.q_type === 'MCQ' || q.q_type === 'True/False').length > 0 && (
                                        <div className="submit-exam-wrapper">
                                            <button onClick={submitOMR} className="btn-primary submit-exam-btn">
                                                <CheckSquare size={24} style={{ marginRight: '10px' }} /> Submit Exam & Calculate Result
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="card shadow-md scale-up-bounce" style={{ padding: '40px', textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 20px' }}>
                                    <Award size={40} />
                                </div>
                                <h2 style={{ fontSize: '2.5rem', color: '#1e293b', margin: '0 0 5px' }}>Exam Completed!</h2>
                                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px' }}>Auto-Calculated Result with Detailed Formula Analysis.</p>

                                <div className="result-stats-grid">
                                    <div className="r-stat-card">
                                        <div className="r-label">Max Marks</div>
                                        <div className="r-value">{examResult.totalMaxMarks}</div>
                                    </div>
                                    <div className="r-stat-card" style={{ borderBottom: '4px solid #10b981' }}>
                                        <div className="r-label">Correct (+{examResult.correctCount})</div>
                                        <div className="r-value" style={{ color: '#10b981' }}>{examResult.totalCorrectMarksAwarded}</div>
                                    </div>
                                    <div className="r-stat-card" style={{ borderBottom: '4px solid #ef4444' }}>
                                        <div className="r-label">Incorrect (-{examResult.incorrectCount})</div>
                                        <div className="r-value" style={{ color: '#ef4444' }}>{examResult.totalIncorrectMarksDeducted}</div>
                                    </div>
                                    <div className="r-stat-card" style={{ borderBottom: '4px solid #f59e0b' }}>
                                        <div className="r-label">Not Attempted</div>
                                        <div className="r-value" style={{ color: '#f59e0b' }}>{examResult.totalUnattemptedMarksDeducted}</div>
                                    </div>
                                </div>

                                <div className="final-score-box">
                                    <div>
                                        <div style={{ fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Obtained Marks</div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '8px 0' }}>
                                            (Correct: {examResult.totalCorrectMarksAwarded}) - (Incorrect: {examResult.totalIncorrectMarksDeducted}) - (Not Attempt: {examResult.totalUnattemptedMarksDeducted})
                                        </div>
                                        <div style={{ fontSize: '4.5rem', fontWeight: '900', color: '#3b82f6', lineHeight: 1 }}>{examResult.obtainedMarks} <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>/ {examResult.totalMaxMarks}</span></div>
                                        <div style={{ fontSize: '1.2rem', color: '#475569', marginTop: '10px', fontWeight: 'bold' }}>Percentage: {examResult.percentage}%</div>
                                    </div>
                                    <div className="grade-circle">
                                        <span style={{ fontSize: '1rem', opacity: 0.8 }}>GRADE</span>
                                        <strong style={{ fontSize: '4rem', lineHeight: 1 }}>{examResult.grade}</strong>
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', textAlign: 'left' }}>
                                    <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>Detailed OMR Sheet Summary</h3>
                                    <div className="table-wrapper">
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>Ans No.</th>
                                                    <th>MM</th>
                                                    <th>Section</th>
                                                    <th>Correct Option</th>
                                                    <th>Your Attempt</th>
                                                    <th>Status</th>
                                                    <th>Marks Awarded</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailedResults.map((res, i) => (
                                                    <tr key={i} style={{ background: res.status === 'Correct' ? '#f0fdf4' : res.status === 'Incorrect' ? '#fef2f2' : '#fffbeb' }}>
                                                        <td style={{ fontWeight: 'bold' }}>{res.qNo}</td>
                                                        <td>{res.mm}</td>
                                                        <td>{res.section}</td>
                                                        <td style={{ fontWeight: 'bold', color: '#10b981' }}>{res.correctOption}</td>
                                                        <td style={{ fontWeight: 'bold' }}>{res.attempted}</td>
                                                        <td>
                                                            <span className={`badge ${res.status === 'Correct' ? 'easy' : res.status === 'Incorrect' ? 'hard' : 'medium'}`}>
                                                                {res.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontWeight: 'bold', color: res.marksAwarded > 0 ? '#10b981' : res.marksAwarded < 0 ? '#ef4444' : '#f59e0b' }}>
                                                            {res.marksAwarded > 0 ? `+${res.marksAwarded}` : res.marksAwarded}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
                                    <button onClick={() => { setExamResult(null); setStudentAnswers({}); }} className="btn-secondary"><RefreshCw size={18} /> Retake Exam</button>
                                    <button className="btn-success" onClick={() => toast("Awardlist Generated Successfully!")}><List size={18} /> Generate Awardlists</button>
                                    <button className="btn-primary" style={{ background: '#8b5cf6' }} onClick={() => toast("Request Sent to Payment Gateway!")}><ShoppingCart size={18} /> Get Evaluated Sheet (PAY RS)</button>
                                    <button className="btn-primary" style={{ background: '#f59e0b' }} onClick={() => toast("Request Sent to Payment Gateway!")}><ShoppingCart size={18} /> Corrected Answer Sheet (PAY RS)</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: EVALUATION WITH FEATURE 2: 3-TEACHER CHECKING AVERAGE */}
                {activeTab === 'evaluation' && (
                    <div className="content-wrapper">
                        <div className="card shadow-md stagger-1">
                            <div className="exam-meta-header omr-header-card">
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>
                                        {examMeta.examName || "Mid-Term Physics"} - {examMeta.className || "Class 10"} {examMeta.subClass ? `(${examMeta.subClass})` : ''}
                                    </h2>
                                    <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Subject: {examMeta.subject || "Physics"} {examMeta.subSubject ? `- ${examMeta.subSubject}` : ''} | Set By: {examMeta.teacherName || "Mr. Sharma"}</p>
                                    <div className="tags" style={{ marginTop: '10px' }}>
                                        <span className="meta-tag">Max Marks: {examMeta.maxMarks || "100"}</span>
                                        <span className="meta-tag">Time: {examMeta.timeAllowed || "3 Hrs"}</span>
                                        <span className="meta-tag">Paper ID: {examMeta.paperId || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="omr-header-right">
                                    <div style={{ fontWeight: "bold", color: "#64748b" }}>Examinee Body: {examMeta.examineeBody || "CBSE"}</div>
                                    <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Paper Set: {examMeta.paperSetNumber || "A-102"}</div>
                                </div>
                            </div>

                            <div className="answer-sheet-preview">
                                <h4 style={{ margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}><FileText size={18} /> Student Answer: Q1 - Explain Newton's Law</h4>
                                <p className="handwriting-font typing-effect">
                                    "{currentSubmission?.answer_text || "Newton's first law states that an object remains in a state of rest or of uniform motion in a straight line unless compelled to change that state by an applied force."}"
                                </p>
                            </div>

                            {/* 🔥 NEW: 3-TEACHER FINAL AVERAGE DISPLAY */}
                            <h3 style={{ margin: "20px 0 15px", color: "#1e293b", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Evaluation Status (3-Tier)
                                <span className="badge" style={{ background: '#3b82f6', color: 'white', fontSize: '1rem' }}>Final Avg: {finalAverage}/100</span>
                            </h3>

                            <div className="evaluation-grid">
                                <div className={`eval-card ${evaluations.teacher1.status === 'Done' ? 'done' : 'pending'} pop-in delay-1 hover-lift`}>
                                    <div className="eval-header"><UserCheck size={18} /> Evaluator 1 (T1)</div>
                                    <div className="eval-score">{evaluations.teacher1.score !== null ? evaluations.teacher1.score : '--'}/100</div>
                                    <p className="eval-comment">"{evaluations.teacher1.comments || "Waiting..."}"</p>
                                </div>
                                <div className={`eval-card ${evaluations.teacher2.status === 'Done' ? 'done' : 'pending'} pop-in delay-2 hover-lift`}>
                                    <div className="eval-header"><UserCheck size={18} /> Evaluator 2 (T2)</div>
                                    <div className="eval-score">{evaluations.teacher2.score !== null ? evaluations.teacher2.score : '--'}/100</div>
                                    <p className="eval-comment">"{evaluations.teacher2.comments || "Waiting..."}"</p>
                                </div>
                                <div className={`eval-card ${evaluations.teacher3.status === 'Done' ? 'done' : 'pending'} pop-in delay-3 hover-lift`}>
                                    <div className="eval-header"><Clock size={18} /> Evaluator 3 (T3)</div>
                                    {evaluations.teacher3.status === 'Done' ? (
                                        <>
                                            <div className="eval-score">{evaluations.teacher3.score}/100</div>
                                            <p className="eval-comment">"{evaluations.teacher3.comments}"</p>
                                        </>
                                    ) : (
                                        <div style={{ marginTop: '10px' }}>
                                            <button className="btn-primary" onClick={submitTeacher3Score} style={{ width: '100%', padding: '10px' }}>Submit T3 Score (85)</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ai-check-box stagger-3">
                                <div>
                                    <h3 style={{ margin: 0, color: "#166534", display: "flex", alignItems: "center", gap: "10px" }}><Brain size={24} /> AI Auto-Check</h3>
                                    <p style={{ margin: 0, color: "#15803d", fontSize: '0.9rem' }}>AI verifies descriptive answers against keywords.</p>
                                </div>
                                {aiScore ? (
                                    <div style={{ textAlign: "right" }} className="pop-in-bounce">
                                        <span style={{ fontSize: "2rem", fontWeight: "900", color: "#16a34a" }}>{aiScore}/100</span>
                                        <div style={{ fontSize: "0.8rem", color: "#166534" }}>AI Confidence: 98%</div>
                                    </div>
                                ) : (
                                    <button onClick={handleAiCheck} className="btn-ai ripple-effect ai-analysis-btn">Run AI Analysis <Zap size={16} /></button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================================
                    TAB 4: FEATURE 1: LIVE QUIZ (WHITE THEME & RESPONSIVE)
                    ========================================================= */}
                {activeTab === 'quiz' && (
                    <div className="content-wrapper stagger-1">
                        <div className="card shadow-md" style={{ background: '#ffffff', color: '#1e293b', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                            <div className="quiz-header-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                                        <Zap color="#f59e0b" fill="#f59e0b" /> Mega Live Quiz
                                    </h2>
                                    <p style={{ color: '#64748b', margin: '5px 0 0' }}>Select a group and start the timer.</p>
                                </div>

                                {/* 🔥 UPDATED FLICKERING LIGHTS UI (LIGHT MODE) */}
                                <div className="quiz-lights-container light-mode-lights">
                                    <div className={`q-light red ${quizLight === 'red' ? 'active' : ''}`}>READY</div>
                                    <div className={`q-light yellow ${quizLight === 'yellow' ? 'active' : ''}`}>TIMEOUT</div>
                                    <div className={`q-light green ${quizLight === 'green' ? 'active flickering' : ''}`}>ANSWERING</div>
                                </div>
                            </div>

                            {/* 🔥 TIMER DISPLAY (LIGHT MODE) */}
                            <div className="quiz-timer-display" style={{ textAlign: 'center', margin: '40px 0' }}>
                                <div className="timer-text" style={{ fontSize: '6rem', fontWeight: '900', color: quizTimer <= 5 ? '#ef4444' : '#3b82f6', fontFamily: 'monospace', lineHeight: 1 }}>
                                    00:{quizTimer < 10 ? `0${quizTimer}` : quizTimer}
                                </div>
                                <div className="timer-action-btns" style={{ marginTop: '20px', display: 'flex', gap: '15px', justify: 'center', flexWrap: 'wrap' }}>
                                    <button className="btn-primary" style={{ background: '#10b981', padding: '12px 30px', fontSize: '1.1rem' }} onClick={() => startQuizRound(40)} disabled={isTimerRunning}><Play size={18} style={{ marginRight: '8px' }} /> Start 40s (Main)</button>
                                    <button className="btn-primary" style={{ background: '#f59e0b', padding: '12px 30px', fontSize: '1.1rem' }} onClick={() => startQuizRound(20)} disabled={isTimerRunning}><Play size={18} style={{ marginRight: '8px' }} /> Pass 20s</button>
                                    <button className="btn-danger" style={{ padding: '12px 30px', fontSize: '1.1rem' }} onClick={stopQuizRound} disabled={!isTimerRunning}><Pause size={18} style={{ marginRight: '8px' }} /> Stop</button>
                                </div>
                            </div>

                            {/* 🔥 5 GROUPS SCOREBOARD (LIGHT MODE) */}
                            <div className="quiz-groups-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', marginTop: '40px' }}>
                                {quizGroups.map((g) => (
                                    <div key={g.id}
                                        className={`quiz-group-card ${activeGroup === g.id ? 'active-group-light' : ''}`}
                                        onClick={() => setActiveGroup(g.id)}
                                        style={{
                                            background: activeGroup === g.id ? '#eff6ff' : '#ffffff',
                                            border: `2px solid ${activeGroup === g.id ? '#3b82f6' : '#e2e8f0'}`,
                                            padding: '20px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', transition: '0.3s'
                                        }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '1.5rem' }}>{g.id}</h3>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: activeGroup === g.id ? '#1d4ed8' : '#1e293b' }}>{g.score + g.bonus}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Main: {g.score} | Bonus: {g.bonus}</div>
                                    </div>
                                ))}
                            </div>

                            {/* 🔥 AWARD MARKS SECTION (LIGHT MODE) */}
                            {activeGroup && !isTimerRunning && (
                                <div className="award-marks-section" style={{ textAlign: 'center', marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ color: '#475569', margin: '0 0 15px 0' }}>Award Marks to {activeGroup}</h4>
                                    <div className="award-btns" style={{ display: 'flex', gap: '10px', justify: 'center', flexWrap: 'wrap' }}>
                                        <button className="btn-success" style={{ padding: '10px 20px' }} onClick={() => awardQuizMarks('main')}>+10 (Correct Ans)</button>
                                        <button className="btn-primary" style={{ background: '#f59e0b', padding: '10px 20px' }} onClick={() => awardQuizMarks('bonus')}>+5 (Bonus Pass)</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}


                {/* --- MODALS SECTION --- */}
                {viewQ && (
                    <div className="modal-overlay glass-overlay fade-in">
                        <div className="modal-content premium-modal scale-up-bounce" style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                            <div className="modal-decorative-bg"></div>

                            <div className="modal-header-premium" style={{ flexShrink: 0 }}>
                                <div className="header-text">
                                    <span className="subtitle">Sec: {viewQ.section || 'A'} | {viewQ.level || 'Level 1'}</span>
                                    <h3>Overview</h3>
                                </div>
                                <button onClick={() => setViewQ(null)} className="close-btn-premium"><X size={24} /></button>
                            </div>

                            <div className="modal-body-premium" style={{ overflowY: 'auto', flex: 1 }}>
                                <div className="question-hero">
                                    <div className="q-icon"><FileText size={32} /></div>
                                    <p className="q-text">"{viewQ.text}"</p>
                                    {viewQ.q_type === 'MCQ' && (
                                        <div style={{ marginTop: '15px', color: '#475569', fontSize: '0.95rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                            <div style={{ fontWeight: viewQ.correct_option === 'A' ? 'bold' : 'normal', color: viewQ.correct_option === 'A' ? '#10b981' : '' }}>A) {viewQ.option_a}</div>
                                            <div style={{ fontWeight: viewQ.correct_option === 'B' ? 'bold' : 'normal', color: viewQ.correct_option === 'B' ? '#10b981' : '' }}>B) {viewQ.option_b}</div>
                                            {viewQ.option_c && <div style={{ fontWeight: viewQ.correct_option === 'C' ? 'bold' : 'normal', color: viewQ.correct_option === 'C' ? '#10b981' : '' }}>C) {viewQ.option_c}</div>}
                                            {viewQ.option_d && <div style={{ fontWeight: viewQ.correct_option === 'D' ? 'bold' : 'normal', color: viewQ.correct_option === 'D' ? '#10b981' : '' }}>D) {viewQ.option_d}</div>}
                                            {viewQ.option_e && <div style={{ fontWeight: viewQ.correct_option === 'E' ? 'bold' : 'normal', color: viewQ.correct_option === 'E' ? '#10b981' : '' }}>E) {viewQ.option_e}</div>}
                                            {viewQ.option_f && <div style={{ fontWeight: viewQ.correct_option === 'F' ? 'bold' : 'normal', color: viewQ.correct_option === 'F' ? '#10b981' : '' }}>F) {viewQ.option_f}</div>}
                                            {viewQ.option_g && <div style={{ fontWeight: viewQ.correct_option === 'G' ? 'bold' : 'normal', color: viewQ.correct_option === 'G' ? '#10b981' : '' }}>G) {viewQ.option_g}</div>}
                                            {viewQ.option_h && <div style={{ fontWeight: viewQ.correct_option === 'H' ? 'bold' : 'normal', color: viewQ.correct_option === 'H' ? '#10b981' : '' }}>H) {viewQ.option_h}</div>}
                                        </div>
                                    )}

                                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <span className="badge medium">Unit: {viewQ.exam_meta?.unit || "N/A"}</span>
                                        <span className="badge medium">Chapter: {viewQ.exam_meta?.chapter || "N/A"}</span>
                                        <span className="badge medium">Paper ID: {viewQ.exam_meta?.paperId || "N/A"}</span>
                                    </div>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-card blue">
                                        <div className="stat-icon"><Layers size={20} /></div>
                                        <div>
                                            <span className="stat-label">Type</span>
                                            <span className="stat-value">{viewQ.q_type}</span>
                                        </div>
                                    </div>
                                    <div className="stat-card purple">
                                        <div className="stat-icon"><BarChart2 size={20} /></div>
                                        <div>
                                            <span className="stat-label">Difficulty</span>
                                            <span className="stat-value">{viewQ.difficulty || "Medium"}</span>
                                        </div>
                                    </div>
                                    <div className="stat-card orange">
                                        <div className="stat-icon"><Award size={20} /></div>
                                        <div>
                                            <span className="stat-label">Marks System</span>
                                            <span className="stat-value">+{viewQ.marks} / -{viewQ.negative_marks || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer-premium" style={{ flexShrink: 0 }}>
                                <button onClick={() => { setViewQ(null); handleEditClick(viewQ); }} className="btn-edit-premium">
                                    <Edit2 size={16} /> Edit Question
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && (
                    <div className="modal-overlay glass-overlay fade-in" onClick={handleCancelEdit}>
                        <div className="modal-content premium-modal scale-up-bounce" onClick={e => e.stopPropagation()} style={{ padding: '30px', overflowY: 'auto', maxHeight: '90vh', width: '700px', maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header-premium" style={{ padding: '0 0 20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', flexShrink: 0 }}>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>Edit Question & Attributes</h3>
                                <button onClick={handleCancelEdit} className="close-btn-premium" style={{ width: '35px', height: '35px' }}><X size={18} /></button>
                            </div>
                            <div className="card-body form-grid-modal" style={{ padding: 0, flex: 1 }}>

                                <div className="input-group full-width-grid" style={{ marginBottom: '15px' }}>
                                    <input type="text" placeholder="Enter Question Text..." className="input-field" value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} />
                                </div>

                                <div className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', width: '100%', marginBottom: '15px' }}>
                                    <select className="input-field hover-glow" value={newQ.q_type} onChange={(e) => setNewQ({ ...newQ, q_type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px' }}>
                                        <option value="Descriptive">Descriptive</option>
                                        <option value="MCQ">MCQ</option>
                                        <option value="True/False">True/False</option>
                                        <option value="Both">Both</option>
                                        <option value="None">None</option>
                                    </select>
                                    <select className="input-field hover-glow" value={newQ.difficulty} onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px' }}>
                                        <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                                    </select>
                                    <input type="text" placeholder="Section (A, B)" className="input-field hover-glow" value={newQ.section} onChange={(e) => setNewQ({ ...newQ, section: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />
                                    <select className="input-field hover-glow" value={newQ.level} onChange={(e) => setNewQ({ ...newQ, level: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px' }}>
                                        <option value="Level 1">Level 1</option><option value="Level 2">Level 2</option><option value="Level 3">Level 3</option><option value="Level 4">Level 4</option>
                                    </select>
                                </div>

                                <div className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', width: '100%', marginBottom: '25px' }}>
                                    <input type="number" placeholder="+ Marks" className="input-field hover-glow" value={newQ.marks} onChange={(e) => setNewQ({ ...newQ, marks: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />
                                    <input type="number" placeholder="- Negative Marks" className="input-field hover-glow" value={newQ.negative_marks} onChange={(e) => setNewQ({ ...newQ, negative_marks: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />
                                    <input type="number" placeholder="Unattempted Marks" className="input-field hover-glow" value={newQ.unattempted_marks} onChange={(e) => setNewQ({ ...newQ, unattempted_marks: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />
                                </div>

                                {newQ.q_type === 'MCQ' && (
                                    <div className="mcq-options-row full-width-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '25px' }}>
                                        <input type="text" placeholder="Option A" className="input-field" value={newQ.option_a} onChange={(e) => setNewQ({ ...newQ, option_a: e.target.value })} style={{ padding: '12px', borderRadius: '10px' }} />
                                        <input type="text" placeholder="Option B" className="input-field" value={newQ.option_b} onChange={(e) => setNewQ({ ...newQ, option_b: e.target.value })} style={{ padding: '12px', borderRadius: '10px' }} />
                                        <input type="text" placeholder="Option C" className="input-field" value={newQ.option_c} onChange={(e) => setNewQ({ ...newQ, option_c: e.target.value })} style={{ padding: '12px', borderRadius: '10px' }} />
                                        <input type="text" placeholder="Option D" className="input-field" value={newQ.option_d} onChange={(e) => setNewQ({ ...newQ, option_d: e.target.value })} style={{ padding: '12px', borderRadius: '10px' }} />
                                        <input type="text" placeholder="Option E" className="input-field" value={newQ.option_e} onChange={(e) => setNewQ({ ...newQ, option_e: e.target.value })} style={{ padding: '12px', borderRadius: '10px' }} />
                                        <input type="text" placeholder="Option F" className="input-field" value={newQ.option_f} onChange={(e) => setNewQ({ ...newQ, option_f: e.target.value })} style={{ padding: '12px', borderRadius: '10px' }} />
                                        <input type="text" placeholder="Option G" className="input-field" value={newQ.option_g} onChange={(e) => setNewQ({ ...newQ, option_g: e.target.value })} style={{ padding: '12px', borderRadius: '10px' }} />
                                        <input type="text" placeholder="Option H" className="input-field" value={newQ.option_h} onChange={(e) => setNewQ({ ...newQ, option_h: e.target.value })} style={{ padding: '12px', borderRadius: '10px' }} />

                                        <select className="input-field option-correct-select" style={{ gridColumn: 'span 4', padding: '12px', borderRadius: '10px' }} value={newQ.correct_option} onChange={(e) => setNewQ({ ...newQ, correct_option: e.target.value })}>
                                            <option value="">Ans?</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option><option value="F">F</option><option value="G">G</option><option value="H">H</option>
                                        </select>
                                    </div>
                                )}

                                <hr style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />
                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' }}>Update Exam Metadata for this Question</div>

                                <div className="grid-3-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', width: '100%', marginBottom: '15px' }}>
                                    <input type="text" placeholder="Unit (e.g. 01)" className="input-field hover-glow" value={editMeta.unit || ""} onChange={(e) => setEditMeta({ ...editMeta, unit: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />
                                    <input type="text" placeholder="Chapter (e.g. 05)" className="input-field hover-glow" value={editMeta.chapter || ""} onChange={(e) => setEditMeta({ ...editMeta, chapter: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />
                                    <input type="text" placeholder="Paper ID" className="input-field hover-glow" value={editMeta.paperId || ""} onChange={(e) => setEditMeta({ ...editMeta, paperId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />
                                    <input type="text" placeholder="Validity" className="input-field hover-glow" value={editMeta.validity || ""} onChange={(e) => setEditMeta({ ...editMeta, validity: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />

                                    <select className="input-field hover-glow" value={editMeta.permission || "Management"} onChange={(e) => setEditMeta({ ...editMeta, permission: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }}>
                                        <option value="Management">Management</option><option value="Provider">Provider</option><option value="Seekers">Seekers</option><option value="Guest">Guest</option><option value="Permanent">Permanent</option><option value="Adhoc">Adhoc</option><option value="Daily Wagers">Daily Wagers</option><option value="Others">Others</option>
                                    </select>

                                    <input type="password" placeholder="Exam Password" className="input-field hover-glow" value={editMeta.examPassword || ""} onChange={(e) => setEditMeta({ ...editMeta, examPassword: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', boxSizing: 'border-box' }} />
                                </div>

                            </div>
                            <div className="modal-footer-premium footer-actions-modal" style={{ padding: '0', background: 'transparent', border: 'none', display: 'flex', gap: '10px', flexShrink: 0, marginTop: '20px' }}>
                                <button onClick={handleCancelEdit} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '10px' }}>Cancel</button>
                                <button onClick={handleSaveQuestion} className="btn-primary ripple-effect" style={{ flex: 1, padding: '14px', borderRadius: '10px' }}>Update Record</button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="modal-overlay glass-overlay fade-in" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content premium-modal scale-up-bounce" onClick={e => e.stopPropagation()} style={{ padding: '35px', width: '400px', maxWidth: '90vw', textAlign: 'center' }}>
                            <div style={{ width: '70px', height: '70px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 20px', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.2)' }}>
                                <Trash size={32} />
                            </div>
                            <h2 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '1.4rem', fontWeight: '800' }}>Delete Question?</h2>
                            <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.95rem' }}>
                                Are you sure you want to delete this question? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justify: 'center' }}>
                                <button onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '10px' }}>Cancel</button>
                                <button onClick={confirmDelete} className="btn-primary" style={{ background: '#ef4444', flex: 1, padding: '12px', borderRadius: '10px', border: 'none' }}>Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* 🚀 CSS STYLES (NEW FEATURE STYLES ADDED) */}
            <style>{`
            :root {
                --primary: #3b82f6;
                --warning: #f59e0b;
                --bg-body: #f8fafc;
                --text-main: #1e293b;
            }
            
            html, body, #root { margin: 0; padding: 0; height: 100%; }

            .exams-page-wrapper {
                display: flex; width: 100%; height: 100vh;
                overflow: hidden; background: var(--bg-body);
                font-family: 'Plus Jakarta Sans', sans-serif;
                color: var(--text-main);
            }

            .exams-main-content {
                flex: 1; margin-left: 280px; padding: 30px; padding-bottom: 120px;
                height: 100vh; overflow-y: auto; box-sizing: border-box;
                width: calc(100% - 280px); /* Strict width control */
            }

            .glass-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
                display: flex; justify-content: center; align-items: center; z-index: 1000;
            }

            .premium-modal {
                background: rgba(255, 255, 255, 0.95); width: 600px;
                border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                position: relative; border: 1px solid rgba(255, 255, 255, 0.5); box-sizing: border-box;
            }

            .modal-decorative-bg {
                position: absolute; top: -50px; right: -50px; width: 200px; height: 200px;
                background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
                filter: blur(60px); opacity: 0.5; z-index: 0; border-radius: 50%;
            }

            .modal-header-premium {
                padding: 30px 30px 10px; display: flex; justify-content: space-between; align-items: flex-start;
                position: relative; z-index: 1;
            }
            .subtitle { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .modal-header-premium h3 { font-size: 1.8rem; font-weight: 800; margin: 5px 0 0; background: linear-gradient(to right, #1e293b, #475569); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

            .close-btn-premium {
                background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center; color: #64748b;
                cursor: pointer; transition: 0.3s; flex-shrink: 0;
            }
            .close-btn-premium:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

            .modal-body-premium { padding: 30px; position: relative; z-index: 1; }

            .question-hero {
                background: white; padding: 25px; border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;
                margin-bottom: 25px; position: relative;
            }
            .q-icon { position: absolute; top: -15px; left: 20px; background: #3b82f6; color: white; padding: 8px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); }
            .q-text { font-size: 1.15rem; font-weight: 600; color: #334155; line-height: 1.6; margin-top: 10px; }

            .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
            .stat-card { padding: 15px; border-radius: 14px; display: flex; flex-direction: column; gap: 10px; transition: 0.3s; cursor: default; }
            .stat-card:hover { transform: translateY(-5px); }

            .stat-card.blue { background: #eff6ff; border: 1px solid #dbeafe; }
            .stat-card.blue .stat-icon { color: #3b82f6; background: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }

            .stat-card.purple { background: #f5f3ff; border: 1px solid #ede9fe; }
            .stat-card.purple .stat-icon { color: #8b5cf6; background: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }

            .stat-card.orange { background: #fff7ed; border: 1px solid #ffedd5; }
            .stat-card.orange .stat-icon { color: #f97316; background: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }

            .stat-label { font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .stat-value { font-size: 1rem; color: #1e293b; font-weight: 800; display: block; margin-top: 2px; }

            .modal-footer-premium { padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }
            .btn-edit-premium {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white; border: none; padding: 12px 24px; border-radius: 12px;
                font-weight: 700; display: flex; align-items: center; gap: 8px;
                cursor: pointer; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); transition: 0.2s;
            }
            .btn-edit-premium:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.5); }

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
            .header-titles { display: flex; flex-direction: column; }
            .page-title { font-size: 2rem; font-weight: 800; margin: 0; color: var(--text-main); display: flex; align-items: center; gap: 10px; }
            .page-subtitle { color: #64748b; margin: 5px 0 0; }

            .tab-switch { background: white; padding: 5px; border-radius: 12px; display: flex; gap: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .tab-btn { border: none; background: transparent; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #64748b; transition: 0.2s; white-space: nowrap; }
            .tab-btn.active { background: #eff6ff; color: var(--primary); }

            .card { background: white; border-radius: 16px; padding: 25px; border: 1px solid #e2e8f0; box-sizing: border-box; width: 100%; max-width: 100%; overflow: hidden; }
            .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .card-header { display: flex; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
            .card-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
            .mb-20 { margin-bottom: 20px; }

            .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; align-items: center; width: 100%; }
            .full-width { grid-column: span 1; }
            .full-width-grid { grid-column: 1 / -1; width: 100%; }

            .input-field { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: white; color: #1e293b; font-size: 0.9rem; transition: all 0.2s; width: 100%; font-weight: 600; box-sizing: border-box; }

            .btn-group { display: flex; gap: 10px; }
            .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;}
            .btn-primary:hover { background: #2563eb; }
            .btn-secondary { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center;}
            .btn-secondary:hover { background: #e2e8f0; }
            .btn-success { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; gap: 8px; align-items: center; transition: 0.2s; white-space: nowrap; }
            .btn-success:hover { background: #059669; }
            .btn-danger { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; gap: 8px; align-items: center; transition: 0.2s; white-space: nowrap; }
            
            .save-db-btn { width: auto; }

            .table-wrapper { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; display: block; }
            .modern-table { width: 100%; border-collapse: collapse; min-width: 700px; }
            .modern-table th { text-align: left; padding: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; background: #f8fafc; font-weight: 800; white-space: nowrap; }
            .modern-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: nowrap; }
            .table-row { opacity: 0; animation: staggerUp 0.4s ease-out forwards; transition: 0.2s; }
            .table-row:hover { background: #f8fafc; }

            .truncate-text { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

            .table-card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
            .table-header-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-wrap: wrap; }

            .action-buttons { display: flex; gap: 10px; justify-content: center; }
            .icon-btn { border: none; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .icon-btn:hover { transform: translateY(-2px); }
            .btn-view { background: #3b82f6; color: white; }
            .btn-edit { background: #f59e0b; color: white; }
            .btn-delete { background: #ef4444; color: white; }

            .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: #f1f5f9; color: #475569; display: inline-block; }
            .badge.easy { background: #dcfce7; color: #166534; }
            .badge.medium { background: #fef9c3; color: #854d0e; }
            .badge.hard { background: #fee2e2; color: #991b1b; }

            .pagination-container { display: flex; justify-content: center; align-items: center; margin-top: 25px; gap: 15px; }
            .page-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
            .page-btn:hover:not(:disabled) { background: #eff6ff; color: var(--primary); border-color: var(--primary); }
            .page-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); }
            .page-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #f1f5f9; }
            .nav-btn { width: auto; padding: 0 10px; }

            .exam-meta-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; align-items: center; flex-wrap: wrap; gap: 15px;}
            .omr-header-card { padding: 20px; border-bottom: none; }
            .omr-header-right { text-align: right; }
            .meta-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: #475569; margin-right: 10px; display: inline-block; margin-bottom: 5px; }
            
            .answer-sheet-preview { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; }
            .handwriting-font { font-family: 'Courier New', Courier, monospace; font-size: 1.05rem; color: #334155; line-height: 1.6; font-style: italic; }

            .evaluation-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .eval-card { padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; transition: transform 0.3s; background: white; }
            .eval-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .eval-card.done { border-left: 4px solid #10b981; }
            .eval-card.pending { background: #fffbeb; border-left: 4px solid #f59e0b; }
            .eval-header { display: flex; gap: 8px; color: #64748b; font-weight: 700; font-size: 0.9rem; margin-bottom: 10px; }
            .eval-score { font-size: 2rem; font-weight: 800; color: #1e293b; margin-bottom: 5px; }

            .ai-check-box { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; padding: 20px; border-radius: 12px; border: 1px solid #bbf7d0; flex-wrap: wrap; gap: 15px;}
            .btn-ai { background: #16a34a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; gap: 8px; align-items: center; transition: 0.2s; white-space: nowrap; }
            .btn-ai:hover { background: #15803d; }

            /* OMR SPECIFIC STYLES */
            .omr-question-row { display: flex; flex-direction: column; gap: 15px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; }
            .omr-q-text { font-size: 1.15rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;}
            .q-no { background: #3b82f6; color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1rem; flex-shrink: 0;}
            .q-marking-info { font-size: 0.85rem; color: #94a3b8; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; }
            
            .omr-options-grid { display: flex; gap: 30px; flex-wrap: wrap; margin-left: 40px; }
            .omr-option-wrapper { display: flex; align-items: center; gap: 10px; cursor: pointer; }
            .omr-bubble { width: 35px; height: 35px; border-radius: 50%; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #64748b; font-size: 1.1rem; transition: 0.2s; background: white; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); flex-shrink: 0;}
            .omr-bubble:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
            .omr-bubble.selected { background: #10b981; border-color: #10b981; color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4); transform: scale(1.1); }
            .omr-opt-text { font-size: 1rem; color: #475569; font-weight: 500; }

            .submit-exam-wrapper { text-align: center; margin-top: 40px; border-top: 2px dashed #e2e8f0; padding-top: 30px; display: flex; justify-content: center; width: 100%; box-sizing: border-box;}
            .submit-exam-btn { padding: 15px 40px; font-size: 1.2rem; background: #10b981; width: auto; }
            .submit-exam-btn:hover { background: #059669; }

            .result-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
            .r-stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
            .r-label { font-size: 0.9rem; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
            .r-value { font-size: 2rem; font-weight: 900; color: #1e293b; }

            .final-score-box { background: linear-gradient(135deg, #eff6ff, #e0e7ff); border: 1px solid #bfdbfe; padding: 40px; border-radius: 24px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 10px 30px rgba(59,130,246,0.1); flex-wrap: wrap; gap: 20px;}
            .grade-circle { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(139,92,246,0.4); border: 4px solid white; flex-shrink: 0;}

            /* 🔥 LIGHT THEME: LIVE QUIZ & FLICKERING LIGHTS CSS */
            .quiz-lights-container.light-mode-lights { display: flex; gap: 10px; background: #f1f5f9; padding: 10px 15px; border-radius: 50px; border: 2px solid #cbd5e1; }
            .light-mode-lights .q-light { padding: 8px 15px; border-radius: 20px; font-weight: 800; font-size: 0.8rem; color: #94a3b8; transition: 0.3s; }
            .light-mode-lights .q-light.red.active { background: #ef4444; color: white; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
            .light-mode-lights .q-light.yellow.active { background: #f59e0b; color: white; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
            .light-mode-lights .q-light.green.active { background: #10b981; color: white; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
            .flickering { animation: flickerLight 0.5s infinite alternate; }
            @keyframes flickerLight { from { opacity: 1; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5); } to { opacity: 0.8; box-shadow: none; } }
            
            .active-group-light { transform: scale(1.05); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15); }

            /* MOBILE RESPONSIVENESS FIXES */
            @media (max-width: 1024px) {
                .exams-main-content { margin-left: 0 !important; max-width: 100%; width: 100%; }
                .form-grid { grid-template-columns: 1fr 1fr; }
            }

            @media (max-width: 850px) {
                html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
                .exams-page-wrapper { display: block !important; height: auto !important; min-height: 100vh !important; }
                
                .exams-main-content { 
                    margin-left: 0 !important; 
                    padding: 15px !important; 
                    padding-top: 85px !important; 
                    padding-bottom: 150px !important; 
                    width: 100% !important; 
                    max-width: 100% !important; 
                    height: auto !important; 
                    min-height: 100vh !important; 
                    overflow-x: hidden !important; 
                    display: block !important; 
                    box-sizing: border-box !important;
                }
                
                .page-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
                .tab-switch { width: 100%; display: flex; justify-content: flex-start; overflow-x: auto; padding-bottom: 5px; -webkit-overflow-scrolling: touch;}
                .tab-btn { flex: 1; justify-content: center; min-width: 130px;}
                
                .form-grid { display: flex !important; flex-direction: column !important; gap: 15px; width: 100%; box-sizing: border-box;}
                .grid-3-col, .grid-2-col { display: flex !important; flex-direction: column !important; gap: 15px; width: 100%;}
                .mcq-options-row { display: grid !important; grid-template-columns: 1fr 1fr !important; }
                .mcq-options-row .input-field, .option-correct-select { width: 100%; flex: none; }
                
                .save-db-btn { width: 100%; }

                .table-card-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
                .table-header-actions { margin-left: 0; width: 100%; justify-content: flex-start; }
                .table-header-actions .btn-success, .table-header-actions .btn-view { flex: 1; justify-content: center; }
                
                .exam-meta-header { flex-direction: column; align-items: flex-start !important; gap: 10px; }
                .omr-header-right, .meta-right { text-align: left !important; width: 100%;}
                
                .evaluation-grid { grid-template-columns: 1fr; gap: 15px; }
                .ai-check-box { flex-direction: column; align-items: flex-start; gap: 15px; }
                .btn-ai, .ai-analysis-btn { width: 100%; justify-content: center; }
                
                .modal-content { max-width: 95vw !important; padding: 20px !important;}
                .stats-grid { grid-template-columns: 1fr; }
                .footer-actions-modal { flex-direction: column; }
                .footer-actions-modal button { width: 100%; }

                .omr-options-grid { margin-left: 0; gap: 15px; flex-direction: column; }
                .omr-q-text { align-items: flex-start; flex-direction: column; gap: 5px;}
                .q-marking-info { align-self: flex-start; margin-left: 40px; margin-top: 0;}
                
                .submit-exam-wrapper { flex-direction: column; }
                .submit-exam-btn { width: 100%; padding: 15px 20px; font-size: 1.1rem; }

                .result-stats-grid { grid-template-columns: 1fr 1fr; gap: 15px;}
                .final-score-box { flex-direction: column; gap: 30px; text-align: center; }
                
                /* Quiz Mobile Specific Fixes */
                .quiz-header-wrapper { flex-direction: column; align-items: flex-start !important; }
                .quiz-lights-container { width: 100%; justify-content: center; flex-wrap: wrap; border-radius: 16px; }
                .timer-text { font-size: 4rem !important; }
                .timer-action-btns { flex-direction: column; width: 100%; }
                .timer-action-btns button { width: 100%; justify-content: center; }
                .award-btns { flex-direction: column; width: 100%; }
                .award-btns button { width: 100%; justify-content: center; }
                .quiz-groups-grid { grid-template-columns: repeat(2, 1fr); }
            }

            @media (max-width: 480px) {
                .quiz-groups-grid { grid-template-columns: 1fr; }
            }
            `}</style>
        </div>
    );
}