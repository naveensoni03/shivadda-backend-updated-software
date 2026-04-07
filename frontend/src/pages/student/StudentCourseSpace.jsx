import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlayCircle, FileText, Video, BookOpen, ChevronLeft, CheckCircle, Download, Calendar, Loader2, User, Mail, AtSign, Award } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";

export default function StudentCourseSpace() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("lessons");
    const [activeVideo, setActiveVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [course, setCourse] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [liveClasses, setLiveClasses] = useState([]);
    const [faculty, setFaculty] = useState(null);

    const [completedLessons, setCompletedLessons] = useState([]);
    const [progressPercent, setProgressPercent] = useState(0);

    useEffect(() => {
        const fetchCourseData = async () => {
            setIsLoading(true);
            try {
                const courseRes = await api.get(`/courses/list/${courseId}/`);
                setCourse(courseRes.data);

                // Fetching all associated data
                const [subsRes, lessRes, resRes, liveRes, progRes] = await Promise.all([
                    api.get(`/courses/subjects/?course=${courseId}`),
                    api.get(`/courses/lessons/?course=${courseId}`),
                    api.get(`/courses/resources/`),
                    api.get(`/courses/live-classes/`),
                    api.get(`/courses/list/${courseId}/my_progress/`).catch(() => ({ data: { completed_lessons: [], percentage: 0 } }))
                ]);

                const fetchedSubjects = Array.isArray(subsRes.data) ? subsRes.data : subsRes.data.results || [];
                const fetchedLessons = Array.isArray(lessRes.data) ? lessRes.data : lessRes.data.results || [];
                const fetchedResources = Array.isArray(resRes.data) ? resRes.data : resRes.data.results || [];
                const fetchedLive = Array.isArray(liveRes.data) ? liveRes.data : liveRes.data.results || [];

                setSubjects(fetchedSubjects);
                setLessons(fetchedLessons.sort((a, b) => a.order - b.order));
                setCompletedLessons(progRes.data.completed_lessons || []);
                setProgressPercent(progRes.data.percentage || 0);

                const lessonIds = fetchedLessons.map(l => l.id);
                setMaterials(fetchedResources.filter(res => lessonIds.includes(res.lesson)));
                setLiveClasses(fetchedLive);

                // 🔥 NAYA UPDATE: Real Backend Data for Faculty (Requirement #6)
                if (courseRes.data.faculty) {
                    setFaculty(courseRes.data.faculty);
                } else {
                    // Fallback sirf tabhi chalega agar API me faculty field blank/null aaye
                    setFaculty({
                        name: "Teacher Not Assigned",
                        username: "N/A",
                        email: "support@shivadda.com",
                        specialization: "General Faculty"
                    });
                }

                if (fetchedLessons.length > 0) {
                    setActiveVideo(fetchedLessons[0]);
                }
            } catch (error) {
                console.error("API Fetch Error:", error);
                toast.error("Failed to load course data.");
            } finally {
                setIsLoading(false);
            }
        };
        if (courseId) fetchCourseData();
    }, [courseId]);

    const handleToggleProgress = async () => {
        if (!activeVideo) return;
        try {
            const newCompleted = completedLessons.includes(activeVideo.id)
                ? completedLessons.filter(id => id !== activeVideo.id)
                : [...completedLessons, activeVideo.id];

            setCompletedLessons(newCompleted);
            const newPercent = lessons.length > 0 ? Math.round((newCompleted.length / lessons.length) * 100) : 0;
            setProgressPercent(newPercent);

            toast.success(newCompleted.includes(activeVideo.id) ? "Marked as Completed!" : "Lesson Unmarked.");
        } catch (error) { toast.error("Could not update progress."); }
    };

    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
        if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
        return url;
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return "#";
        if (filePath.startsWith("http")) return filePath;
        return `http://127.0.0.1:8000/media/${filePath}`;
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', color: '#4f46e5' }}>
                <Loader2 size={50} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <h3 style={{ marginTop: '20px' }}>Loading Course Space...</h3>
            </div>
        );
    }

    if (!course) return (<div style={{ textAlign: 'center', padding: '50px' }}><h2>Course not found! ❌</h2><button onClick={() => navigate(-1)}>Go Back</button></div>);

    const isActiveVideoCompleted = activeVideo ? completedLessons.includes(activeVideo.id) : false;

    return (
        <div className="course-space-layout">
            <Toaster position="top-right" />

            <header className="cs-header">
                <div className="header-left" onClick={() => navigate(-1)}>
                    <button className="back-btn"><ChevronLeft size={20} /> Back to Courses</button>
                    <div className="course-title-box">
                        <h1>{course.name}</h1>
                        <span className="course-badge">{course.code || "N/A"}</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="progress-container">
                        <div className="progress-info"><span>Overall Progress</span><strong>{progressPercent}%</strong></div>
                        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div></div>
                    </div>
                </div>
            </header>

            <div className="cs-main-container">
                <aside className="cs-sidebar">
                    <div className="cs-tabs">
                        <button className={`cs-tab ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}><PlayCircle size={18} /> Lessons</button>
                        <button className={`cs-tab ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}><BookOpen size={18} /> Materials</button>
                        <button className={`cs-tab ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}><Video size={18} /> Live Classes</button>
                        <button className={`cs-tab ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => setActiveTab('faculty')}><User size={18} /> Faculty</button>
                    </div>

                    <div className="cs-sidebar-content custom-scroll">
                        {activeTab === 'lessons' && (
                            <div className="syllabus-accordion">
                                {subjects.length > 0 ? subjects.map((subject, index) => {
                                    const subjectLessons = lessons.filter(l => l.subject === subject.id);
                                    if (subjectLessons.length === 0) return null;
                                    return (
                                        <div key={subject.id} className="subject-group">
                                            <h3 className="subject-title">{index + 1}. {subject.name}</h3>
                                            <div className="lesson-list">
                                                {subjectLessons.map((lesson) => {
                                                    const isDone = completedLessons.includes(lesson.id);
                                                    return (
                                                        <div key={lesson.id} className={`lesson-item ${activeVideo?.id === lesson.id ? 'active' : ''}`} onClick={() => setActiveVideo(lesson)}>
                                                            <div className="lesson-icon">{isDone ? <CheckCircle size={16} color="#10b981" /> : <PlayCircle size={16} />}</div>
                                                            <div className="lesson-details">
                                                                <h4 style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? '#94a3b8' : 'var(--text-main)' }}>{lesson.title}</h4>
                                                                {lesson.is_preview && !isDone && <span style={{ color: '#10b981', fontWeight: 'bold' }}>Demo Lesson</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                }) : <p style={{ textAlign: 'center', color: '#64748b' }}>No subjects found.</p>}
                            </div>
                        )}

                        {activeTab === 'materials' && (
                            <div className="materials-list">
                                {materials.length > 0 ? materials.map(file => (
                                    <div key={file.id} className="material-card">
                                        <div className="file-icon"><FileText size={24} color="#ef4444" /></div>
                                        <div className="file-info"><h4>{file.file_title}</h4><span>Document File</span></div>
                                        <a href={getFileUrl(file.file)} target="_blank" rel="noreferrer" className="download-btn"><Download size={18} /></a>
                                    </div>
                                )) : <p style={{ textAlign: 'center', color: '#64748b' }}>No study materials uploaded yet.</p>}
                            </div>
                        )}

                        {activeTab === 'live' && (
                            <div className="live-classes-list">
                                {liveClasses.length > 0 ? liveClasses.map(live => {
                                    const scheduledTime = new Date(live.scheduled_at);
                                    const diffInMinutes = (scheduledTime - new Date()) / (1000 * 60);
                                    const isLiveNow = diffInMinutes <= 5 && diffInMinutes >= -60;
                                    const isPast = diffInMinutes < -60;

                                    return (
                                        <div key={live.id} className={`live-card ${isLiveNow ? 'live-border' : ''}`}>
                                            <div className="live-icon">{isLiveNow ? <span className="live-dot"></span> : <Calendar size={20} color={isPast ? "#94a3b8" : "#f59e0b"} />}</div>
                                            <div className="live-info">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><h4>{live.title}</h4>{isLiveNow && <span className="live-badge-text">LIVE NOW</span>}</div>
                                                <span className="live-date">{scheduledTime.toLocaleDateString()} at {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {isPast ? (
                                                <button className="join-live-btn disabled-btn" disabled style={{ padding: '8px 15px', fontWeight: 'bold', borderRadius: '8px' }}>Finished</button>
                                            ) : (
                                                <a href={live.meeting_link} target="_blank" rel="noreferrer" className={`join-live-btn ${isLiveNow ? 'pulse-btn' : 'upcoming-btn'}`} style={{ textDecoration: 'none', padding: '8px 15px', fontWeight: 'bold', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                                                    {isLiveNow ? 'Join Now' : 'Upcoming'}
                                                </a>
                                            )}
                                        </div>
                                    );
                                }) : <div style={{ textAlign: 'center', padding: '40px' }}><Video size={40} color="#cbd5e1" style={{ margin: '0 auto' }} /><p style={{ color: '#64748b', marginTop: '10px' }}>No live classes scheduled.</p></div>}
                            </div>
                        )}

                        {activeTab === 'faculty' && faculty && (
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '2rem', fontWeight: '800', margin: '0 auto 15px' }}>
                                    {faculty.name.charAt(0)}
                                </div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>{faculty.name}</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#4f46e5', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <Award size={14} /> {faculty.specialization}
                                </p>

                                <div style={{ background: 'white', borderRadius: '12px', padding: '15px', border: '1px solid #f1f5f9', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem' }}>
                                        <AtSign size={16} color="#94a3b8" /> <strong>Username:</strong> {faculty.username}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem' }}>
                                        <Mail size={16} color="#94a3b8" /> <strong>Email:</strong> {faculty.email}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                <main className="cs-video-area">
                    <div className="video-player-wrapper">
                        {activeVideo?.video_url ? (
                            <iframe width="100%" height="100%" src={getEmbedUrl(activeVideo.video_url)} title={activeVideo.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        ) : (
                            <div className="dummy-player"><PlayCircle size={60} color="white" className="play-icon-large" /><h3>{activeVideo ? "Video link not provided" : "Select a lesson to start"}</h3></div>
                        )}
                    </div>

                    {activeVideo && (
                        <div className="video-details-box">
                            <h2>{activeVideo.title}</h2>
                            <p className="lesson-meta">Lesson Module • {activeVideo.is_preview ? 'Preview Available' : 'Enrolled Student Access'}</p>
                            <div className="lesson-description"><h3>Lesson Overview</h3><p>{activeVideo.content || "No detailed notes provided for this lesson."}</p></div>
                            <div className="lesson-actions">
                                <button className={`btn-mark-complete ${isActiveVideoCompleted ? 'completed-btn-state' : ''}`} onClick={handleToggleProgress}>
                                    <CheckCircle size={18} /> {isActiveVideoCompleted ? 'Completed (Click to Undo)' : 'Mark as Completed'}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        :root { --bg-light: #f8fafc; --text-main: #0f172a; --text-muted: #64748b; --primary: #4f46e5; --border-color: #e2e8f0; }
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        .course-space-layout { display: flex; flex-direction: column; height: 100vh; background: var(--bg-light); overflow: hidden; }
        .cs-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: white; border-bottom: 1px solid var(--border-color); z-index: 10; }
        .header-left { display: flex; align-items: center; gap: 20px; cursor: pointer; }
        .back-btn { background: #f1f5f9; border: none; padding: 8px 15px; border-radius: 8px; display: flex; align-items: center; gap: 5px; font-weight: 600; color: var(--text-main); cursor: pointer; transition: 0.2s; }
        .back-btn:hover { background: #e2e8f0; }
        .course-title-box h1 { margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
        .course-badge { font-size: 0.7rem; font-weight: 700; background: #e0e7ff; color: var(--primary); padding: 3px 8px; border-radius: 6px; }
        .progress-container { display: flex; flex-direction: column; gap: 5px; min-width: 200px; }
        .progress-info { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); }
        .progress-bar-bg { width: 100%; height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: #10b981; border-radius: 10px; transition: width 0.5s ease; }
        .cs-main-container { display: flex; flex: 1; overflow: hidden; }
        .cs-sidebar { width: 350px; background: white; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; }
        .cs-tabs { display: flex; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; }
        .cs-tab { flex: 1; padding: 15px 5px; background: transparent; border: none; border-bottom: 3px solid transparent; font-weight: 600; color: var(--text-muted); cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 6px; transition: 0.2s; font-size: 0.85rem;}
        .cs-tab.active { color: var(--primary); border-bottom-color: var(--primary); background: #f8fafc; }
        .cs-tab:hover:not(.active) { color: var(--text-main); }
        .cs-sidebar-content { flex: 1; overflow-y: auto; padding: 20px; }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .subject-group { margin-bottom: 20px; }
        .subject-title { font-size: 0.95rem; font-weight: 800; color: var(--text-main); margin: 0 0 10px 0; padding-bottom: 5px; border-bottom: 1px dashed var(--border-color); }
        .lesson-list { display: flex; flex-direction: column; gap: 8px; }
        .lesson-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
        .lesson-item:hover { background: #f1f5f9; }
        .lesson-item.active { background: #e0e7ff; border-color: #c7d2fe; }
        .lesson-icon { color: var(--text-muted); display: flex; }
        .lesson-item.active .lesson-icon { color: var(--primary); }
        .lesson-details h4 { margin: 0 0 2px 0; font-size: 0.85rem; font-weight: 600; color: var(--text-main); transition: 0.2s;}
        .lesson-details span { font-size: 0.75rem; color: var(--text-muted); }
        .materials-list, .live-classes-list { display: flex; flex-direction: column; gap: 15px; }
        .material-card, .live-card { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid var(--border-color); border-radius: 12px; background: #f8fafc; }
        .file-info h4, .live-info h4 { margin: 0 0 3px 0; font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
        .file-info span, .live-info span { font-size: 0.8rem; color: var(--text-muted); }
        .download-btn, .join-live-btn { margin-left: auto; background: white; border: 1px solid var(--border-color); padding: 8px; border-radius: 8px; cursor: pointer; color: var(--primary); transition: 0.2s; display: flex; justify-content: center; align-items: center;}
        .download-btn:hover { background: #f1f5f9; }
        .live-border { border: 2px solid #ef4444 !important; background: #fff1f2 !important; }
        .live-dot { width: 12px; height: 12px; background: #ef4444; border-radius: 50%; display: inline-block; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .live-badge-text { background: #ef4444; color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 900; }
        .pulse-btn { background: #ef4444 !important; color: white !important; border: none !important; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .upcoming-btn { background: #e2e8f0 !important; color: #64748b !important; cursor: not-allowed; border: none; }
        .disabled-btn { background: #f1f5f9 !important; color: #94a3b8 !important; cursor: not-allowed; border: none; }
        .cs-video-area { flex: 1; padding: 30px; overflow-y: auto; background: var(--bg-light); display: flex; flex-direction: column; gap: 20px; }
        .video-player-wrapper { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .dummy-player { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(45deg, #1e293b, #0f172a); color: white; text-align: center; padding: 20px;}
        .play-icon-large { margin-bottom: 15px; opacity: 0.8; cursor: pointer; transition: 0.2s; }
        .play-icon-large:hover { opacity: 1; transform: scale(1.1); }
        .video-details-box { background: white; padding: 30px; border-radius: 16px; border: 1px solid var(--border-color); }
        .video-details-box h2 { margin: 0 0 5px 0; font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
        .lesson-meta { font-size: 0.9rem; color: var(--text-muted); margin: 0 0 20px 0; font-weight: 600; }
        .lesson-description h3 { font-size: 1.1rem; color: var(--text-main); margin: 0 0 10px 0; }
        .lesson-description p { color: #334155; line-height: 1.6; font-size: 0.95rem; }
        .lesson-actions { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; }
        .btn-mark-complete { display: flex; align-items: center; gap: 8px; background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-mark-complete:hover { background: #059669; }
        .completed-btn-state { background: #f1f5f9 !important; color: #475569 !important; border: 1px solid #cbd5e1 !important; }
        .completed-btn-state:hover { background: #e2e8f0 !important; }
        @media (max-width: 900px) { .cs-main-container { flex-direction: column; } .cs-sidebar { width: 100%; height: 350px; border-right: none; border-bottom: 1px solid var(--border-color); flex-shrink: 0; } }
        ` }} />
        </div>
    );
}