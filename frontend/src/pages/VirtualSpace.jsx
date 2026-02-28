import React, { useState, useRef, useCallback, useEffect } from "react";
// 👉 Bilkul simple import, jaise UserManager me hai
import SidebarModern from "../components/SidebarModern";
import {
    Video, Mic, MicOff, VideoOff, UploadCloud, FileText, Share2,
    PhoneOff, Monitor, Download, ScreenShare, StopCircle, Search,
    Cloud, MapPin, User, Lock, Clock, CheckCircle, Mail,
    Users, Briefcase, Map, Shield, HardDrive, Server, PieChart, Square, Play, X
} from "lucide-react";
import Webcam from "react-webcam";
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER: Duration Calculator ---
const calculateDuration = (startDate, stopDate) => {
    if (!startDate) return "00:00:00.000";
    const now = stopDate || new Date();
    const diff = now - startDate;
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const ms = Math.floor(diff % 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};

export default function VirtualSpace() {
    // --- GLOBAL STATE ---
    const [activeTab, setActiveTab] = useState("live");
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- MODAL STATE FOR SERVICES ---
    const [selectedService, setSelectedService] = useState(null);

    // --- SESSION/TIMER STATE ---
    const [sessionStart, setSessionStart] = useState(null);
    const [sessionEnd, setSessionEnd] = useState(null);
    const [durationStr, setDurationStr] = useState("00:00:00.000");

    // --- LIVE STUDIO STATE ---
    const [isLive, setIsLive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [camActive, setCamActive] = useState(false);
    const [micActive, setMicActive] = useState(false);

    // --- STORAGE STATE ---
    const [totalStorageGB, setTotalStorageGB] = useState(100);
    const [storageDistribution, setStorageDistribution] = useState({ principal: 0, staff: 0, students: 0 });

    // --- EXAM STATE ---
    const [examTimer, setExamTimer] = useState(10800);
    const [userAnswers, setUserAnswers] = useState({});
    const [examSubmitted, setExamSubmitted] = useState(false);

    // --- REFS ---
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const screenVideoRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- MOCK DATA ---
    const [resources, setResources] = useState([
        { id: 1, name: "Physics_Chapter1_Notes.pdf", size: "2.4 MB", type: 'pdf', file: null },
        { id: 2, name: "Assignment_04_Gravitation.docx", size: "850 KB", type: 'doc', file: null },
        { id: 3, name: "Lab_Manual_Experiment_1.pdf", size: "1.2 MB", type: 'pdf', file: null },
    ]);

    const usersList = [
        { id: 1, name: "Amit Sharma", role: "Student", status: "Active" },
        { id: 2, name: "Priya Singh", role: "Teacher", status: "In Class" },
        { id: 3, name: "Rahul Verma", role: "Staff", status: "Offline" },
    ];

    const servicesList = [
        { id: 1, title: "Transport", icon: <Briefcase size={24} />, desc: "Bus Route Management", code: "SRV-01" },
        { id: 2, title: "Library", icon: <FileText size={24} />, desc: "Digital & Physical Books", code: "SRV-02" },
        { id: 3, title: "Hostel", icon: <MapPin size={24} />, desc: "Room Allocation", code: "SRV-03" },
        { id: 4, title: "Security", icon: <Shield size={24} />, desc: "Gate Pass System", code: "SRV-04" },
    ];

    const placesList = [
        { id: 1, name: "Main Campus - Agra", type: "Headquarters", vid: "Agra-HQ-01" },
        { id: 2, name: "City Center - Mathura", type: "Branch", vid: "MTR-BR-02" },
        { id: 3, name: "Virtual Lab 01", type: "Online", vid: "VLAB-001" },
    ];

    const locationOptions = {
        Global: ["Earth", "Mars"], Continent: ["Asia", "Europe"], Country: ["India", "USA"],
        State: ["UP", "MP"], District: ["Agra", "Mathura"], Tehsil: ["Agra", "Etmadpur"]
    };
    const [locationSelections, setLocationSelections] = useState({
        Global: "Earth", Continent: "Asia", Country: "India", State: "UP", District: "Agra"
    });

    const [recordedChunks, setRecordedChunks] = useState([]);
    const [stream, setStream] = useState(null);

    // --- EFFECTS ---
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            if (sessionStart && !sessionEnd && (camActive || isLive)) {
                setDurationStr(calculateDuration(sessionStart, null));
            } else if (sessionStart && sessionEnd) {
                setDurationStr(calculateDuration(sessionStart, sessionEnd));
            }
            if (activeTab === 'exam' && !examSubmitted && examTimer > 0) setExamTimer(t => t - 1);
        }, 100);
        return () => clearInterval(timer);
    }, [sessionStart, sessionEnd, camActive, isLive, activeTab, examTimer, examSubmitted]);

    useEffect(() => {
        const principal = (totalStorageGB * 0.10).toFixed(2);
        const staff = (totalStorageGB * 0.50).toFixed(2);
        const students = (totalStorageGB - principal - staff).toFixed(2);
        setStorageDistribution({ principal, staff, students });
    }, [totalStorageGB]);

    // --- HANDLERS ---
    const startScreenShare = async () => {
        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            setStream(displayStream);
            setIsLive(true);
            if (!sessionStart) { setSessionStart(new Date()); setSessionEnd(null); }
            if (screenVideoRef.current) screenVideoRef.current.srcObject = displayStream;
            displayStream.getVideoTracks()[0].onended = () => stopScreenShare();
            toast.success("You are presenting your screen! 🔴");
        } catch (err) { toast.error("Screen Share Cancelled"); }
    };

    const stopScreenShare = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsLive(false);
        if (!camActive) setSessionEnd(new Date());
        toast.success("Stopped Presenting");
    };

    const toggleLive = () => isLive ? stopScreenShare() : startScreenShare();

    const handleCameraToggle = () => {
        if (!camActive) {
            setCamActive(true);
            setMicActive(true);
            if (!sessionStart) { setSessionStart(new Date()); setSessionEnd(null); }
            else if (sessionEnd) { setSessionEnd(null); }
        } else {
            setCamActive(false);
            setMicActive(false);
            if (!isLive) setSessionEnd(new Date());
        }
    };

    const handleStartRecording = useCallback(() => {
        if (!camActive && !isLive) { toast.error("Please turn on Camera or Share Screen to record."); return; }
        setIsRecording(true);
        setRecordedChunks([]);
        let recorderStream;
        if (isLive && stream) recorderStream = stream;
        else if (webcamRef.current && webcamRef.current.stream) recorderStream = webcamRef.current.stream;

        if (recorderStream) {
            mediaRecorderRef.current = new MediaRecorder(recorderStream, { mimeType: "video/webm" });
            mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
                if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
            });
            mediaRecorderRef.current.start();
            toast.success(isLive ? "Recording Screen... 🎥" : "Recording Camera... 🎥");
        } else {
            toast.error("No video source to record!");
            setIsRecording(false);
        }
    }, [webcamRef, isLive, stream, camActive]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast("Processing Recording...", { icon: '⏳' });
            setTimeout(() => {
                if (recordedChunks.length) {
                    const blob = new Blob(recordedChunks, { type: "video/webm" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    a.href = url;
                    a.download = `recording-${isLive ? 'screen' : 'cam'}-${Date.now()}.webm`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast.success("Recording Saved & Downloaded! ✅");
                }
            }, 1000);
        }
    }, [mediaRecorderRef, recordedChunks, isLive]);

    const handleHangup = () => {
        if (isRecording) handleStopRecording();
        if (isLive) stopScreenShare();
        setCamActive(false);
        setMicActive(false);
        if (sessionStart && !sessionEnd) setSessionEnd(new Date());
        toast.error("Session Ended");
    };

    const handleUploadClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResources([...resources, { id: Date.now(), name: file.name, size: "1.2 MB", type: 'file', file: file }]);
            toast.success(`${file.name} Added! 📂`);
        }
    };
    const handleLocationChange = (level, value) => { setLocationSelections(prev => ({ ...prev, [level]: value })); };

    const switchTab = (tabId) => { setActiveTab(tabId); };

    return (
        <div className="virtual-space-container">

            {/* 👉 1. Direct Import of SidebarModern just like UserManager */}
            <div style={{ zIndex: 50 }}>
                <SidebarModern />
            </div>

            <div className="vs-main-content">
                <Toaster position="top-center" />
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

                {/* HEADER */}
                <header className="master-head">
                    <div className="top-row">
                        <div className="left-cluster">
                            {/* 👉 2. Menu button yahan se HATA DIYA gaya hai. Ab Sidebar apna button khud layega */}
                            <div className="search-pill">
                                <Search size={16} className="text-gray-500" />
                                <input type="text" placeholder="Search AI / Google..." />
                                <span className="ai-badge">AI 2.0</span>
                            </div>
                        </div>
                        <div className="brand-center">
                            <span className="brand-highlight">SHIV</span>ADDA<span className="brand-sub">EDU</span>
                        </div>
                        <div className="right-cluster">
                            <div className="time-display">
                                <div className="time-line"><span className="label">SYSTEM TIME</span><span className="val">{currentTime.toLocaleTimeString()}</span></div>
                                <div className="time-line"><span className="label">ACTIVE FOR</span><span className="val highlight">{durationStr}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="btm-row">
                        <div className="weather-chip"><Cloud size={14} /> <span>24°C Sunny</span></div>
                        <div className="divider-vert"></div>
                        <div className="location-chain">
                            <span className="chain-label">LOC:</span>
                            {Object.keys(locationOptions).slice(2, 5).map((level, index) => (
                                <div key={index} className="loc-dropdown-container">
                                    <select value={locationSelections[level]} onChange={(e) => handleLocationChange(level, e.target.value)} className="loc-select">
                                        {locationOptions[level].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            ))}
                            <span className="tag vid">LIVE ID: #99A</span>
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="nav-tabs-row">
                        {[
                            { id: 'live', label: 'LIVE STUDIO' }, { id: 'places', label: 'PLACES' },
                            { id: 'services', label: 'SERVICES' }, { id: 'users', label: 'DIRECTORY' },
                            { id: 'exam', label: 'EXAM PORTAL' }, { id: 'storage', label: 'VIRTUAL CLOUD' },
                            { id: 'profile', label: 'PROFILE' },
                            { id: 'mail', label: 'INBOX' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => switchTab(tab.id)}
                                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                {tab.label}
                                {activeTab === tab.id && <div className="tab-line-static"></div>}
                            </button>
                        ))}
                    </div>
                </header>

                {/* MAIN CONTENT GRID */}
                <div className="content-area">
                    {activeTab === 'live' && (
                        <div className="vs-grid-layout">
                            <div className="video-card shadow-lg">
                                <div className="video-frame">
                                    {isLive ? (
                                        <video ref={screenVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#222' }} />
                                    ) : (
                                        camActive ? (
                                            <Webcam
                                                audio={micActive}
                                                muted={true}
                                                ref={webcamRef}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                mirrored={true}
                                                onUserMediaError={(err) => {
                                                    console.error("Camera Error:", err);
                                                    toast.error("Camera Access Denied or Not Found!");
                                                    setCamActive(false);
                                                    setSessionEnd(new Date());
                                                }}
                                            />
                                        ) : (
                                            <div className="camera-off-placeholder">
                                                <VideoOff size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
                                                <span style={{ color: '#ffffff' }}>Camera is Off</span>
                                                <button onClick={handleCameraToggle} style={{ marginTop: '15px', padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    Turn On Camera
                                                </button>
                                            </div>
                                        )
                                    )}
                                    <div className="status-tags">
                                        {isLive && <span className="tag live">ON AIR (SCREEN)</span>}
                                        {isRecording && <span className="tag rec">REC</span>}
                                    </div>
                                    <div className="control-overlay">
                                        <div className="control-bar glass-effect">
                                            <button onClick={() => setMicActive(!micActive)} className={`ctrl-btn ${!micActive ? 'off' : ''}`}>{micActive ? <Mic size={20} /> : <MicOff size={20} />}</button>
                                            <button onClick={handleCameraToggle} className={`ctrl-btn ${!camActive ? 'off' : ''}`}>{camActive ? <Video size={20} /> : <VideoOff size={20} />}</button>
                                            <div className="divider"></div>
                                            <button onClick={toggleLive} className={`ctrl-btn ${isLive ? 'off' : ''}`}>{isLive ? <StopCircle size={20} /> : <ScreenShare size={20} />}</button>
                                            <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`ctrl-btn ${isRecording ? 'off' : ''}`}>{isRecording ? <Square size={20} /> : <Play size={20} />}</button>
                                            <button onClick={handleHangup} className="ctrl-btn btn-hangup"><PhoneOff size={20} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="sidebar-panels">
                                <div className="info-card broadcast-card shadow-sm">
                                    <div className="card-header"><Share2 size={16} color="#000000" /><h3 style={{ color: '#000000' }}>Broadcast</h3></div>
                                    <div className="card-body">
                                        <div onClick={() => window.open('https://meet.google.com')} className="list-item clickable"><div className="icon-box green"><Video size={16} color="#ffffff" /></div> <span className="text-dark-label" style={{ color: '#000000' }}>Google Meet</span></div>
                                        <div onClick={() => window.open('https://zoom.us')} className="list-item clickable"><div className="icon-box blue"><Monitor size={16} color="#ffffff" /></div> <span className="text-dark-label" style={{ color: '#000000' }}>Zoom</span></div>
                                    </div>
                                </div>
                                <div className="info-card resources-card shadow-sm">
                                    <div className="card-header"><FileText size={16} color="#000000" /><h3 style={{ color: '#000000' }}>Resources</h3></div>
                                    <div className="card-body scrollable-list">
                                        {resources.map((res) => (
                                            <div key={res.id} className="resource-item">
                                                <div className="res-icon"><FileText size={18} color="#000000" /></div>
                                                <div className="res-info"><span className="res-name" style={{ color: '#000000' }}>{res.name}</span><span className="res-meta" style={{ color: '#000000' }}>{res.size}</span></div>
                                                <button className="btn-download"><Download size={14} color="#000000" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card-footer">
                                        <button onClick={handleUploadClick} className="btn-upload" style={{ color: '#000000', borderColor: '#000000' }}><UploadCloud size={16} color="#000000" /> Upload Resource</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'places' && (
                        <div className="tab-view">
                            <div className="info-card shadow-lg" style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div className="card-header" style={{ padding: '20px 25px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <Map size={24} color="#333333" />
                                    <h2 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' }}>Registered Places</h2>
                                </div>
                                <div className="card-body scrollable-list" style={{ padding: '20px 25px' }}>
                                    {placesList.map((place) => (
                                        <div key={place.id} className="resource-item" style={{ padding: '15px 20px', background: '#fcfcfc', border: '1px solid #f1f5f9', borderRadius: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div className="icon-box" style={{ background: '#333333', width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0 }}><MapPin size={20} color="white" /></div>
                                            <div className="res-info">
                                                <h3 style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: '700', margin: '0 0 5px 0' }}>{place.name}</h3>
                                                <span className="res-meta" style={{ color: '#64748b', fontSize: '0.85rem' }}>{place.type} <span style={{ color: '#cbd5e1', margin: '0 4px' }}>•</span> {place.vid}</span>
                                            </div>
                                            <button onClick={() => { toast.success(`Opening Map for ${place.name}...`); window.open(`http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(place.name)}`, '_blank'); }} className="btn-upload" style={{ width: 'auto', padding: '8px 16px', background: 'white', color: '#3b82f6', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>View Map</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="tab-view">
                            <div className="vs-grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                                {servicesList.map(service => (
                                    <div key={service.id} className="info-card shadow-sm" style={{ padding: '20px', alignItems: 'center', textAlign: 'center' }}>
                                        <div className="icon-box blue" style={{ width: '50px', height: '50px', marginBottom: '10px' }}>{service.icon}</div>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{service.title}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{service.desc}</p>
                                        <button onClick={() => setSelectedService(service)} className="btn-upload" style={{ marginTop: '15px' }}>Manage</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="tab-view">
                            <div className="info-card shadow-sm" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div className="card-header"><Users size={24} className="text-blue" /> <h2 style={{ color: '#000000' }}>User Directory</h2></div>
                                <div className="card-body scrollable-list">
                                    {usersList.map(user => (
                                        <div key={user.id} className="resource-item">
                                            <div className="icon-box green"><User size={20} /></div>
                                            <div className="res-info"><h3 style={{ color: '#000000' }}>{user.name}</h3><span className="res-meta" style={{ color: '#000000' }}>{user.role}</span></div>
                                            <span className={`tag ${user.status === 'Active' ? 'rec' : 'live'}`} style={{ background: user.status === 'Active' ? '#10b981' : '#cbd5e1', color: user.status === 'Active' ? 'white' : '#475569' }}>{user.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'exam' && (
                        <div className="tab-view">
                            <div className="info-card shadow-sm" style={{ maxWidth: '800px', margin: '0 auto', height: 'auto' }}>
                                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                                    <h2 style={{ color: '#000000' }}>Physics Mid-Term Exam <span className="pro-badge">Set A</span></h2>
                                    <div className="tag rec" style={{ fontSize: '1rem', background: '#ef4444', color: 'white' }}><Clock size={16} /> {new Date(examTimer * 1000).toISOString().substr(11, 8)}</div>
                                </div>
                                <div className="card-body" style={{ padding: '20px' }}>
                                    {!examSubmitted ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                                                <div key={q} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <span style={{ fontWeight: '700', color: '#000000' }}>Q{q}</span>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        {['A', 'B', 'C', 'D'].map(opt => (
                                                            <label key={opt} style={{ width: '30px', height: '30px', borderRadius: '50%', border: userAnswers[q] === opt ? '2px solid #3b82f6' : '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: userAnswers[q] === opt ? '#3b82f6' : 'white', color: userAnswers[q] === opt ? 'white' : '#000000', fontWeight: '600' }}>
                                                                {opt} <input type="radio" name={`q${q}`} onChange={() => setUserAnswers({ ...userAnswers, [q]: opt })} hidden />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <CheckCircle size={64} style={{ margin: '0 auto', color: '#10b981' }} />
                                            <h2 style={{ color: '#000000' }}>Exam Submitted!</h2>
                                            <button className="btn-upload" onClick={() => setExamSubmitted(false)} style={{ color: '#000000', borderColor: '#000000' }}>Review Answers</button>
                                        </div>
                                    )}
                                </div>
                                {!examSubmitted && <div className="card-footer"><button className="btn-action btn-primary" style={{ width: '100%' }} onClick={() => setExamSubmitted(true)}>Submit Exam</button></div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'storage' && (
                        <div className="tab-view">
                            <div className="info-card shadow-sm" style={{ maxWidth: '900px', margin: '0 auto', overflow: 'visible' }}>
                                <div className="card-header"><HardDrive size={24} color="#000000" /> <h2 style={{ color: '#000000' }}>Virtual Space Management</h2></div>
                                <div className="card-body" style={{ padding: '20px' }}>
                                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                                        <label style={{ fontWeight: '700', color: '#000000', display: 'block', marginBottom: '10px' }}>Total School Allocation (GB)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <input type="range" min="10" max="1000" step="10" value={totalStorageGB} onChange={(e) => setTotalStorageGB(e.target.value)} style={{ flex: 1, cursor: 'pointer' }} />
                                            <span className="tag rec" style={{ background: '#0f172a', fontSize: '14px', color: 'white' }}>{totalStorageGB} GB</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', borderTop: '4px solid #ef4444', background: 'white' }}><Lock size={20} style={{ color: '#ef4444', margin: '0 auto 10px' }} /><h3 style={{ color: '#000000' }}>Principal</h3><div style={{ fontSize: '24px', fontWeight: '800', color: '#000000' }}>{storageDistribution.principal} <span style={{ fontSize: '12px', color: '#000000' }}>GB</span></div><div style={{ fontSize: '10px', color: '#000000' }}>Fixed 10% Quota</div></div>
                                        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', borderTop: '4px solid #3b82f6', background: 'white' }}><Briefcase size={20} style={{ color: '#3b82f6', margin: '0 auto 10px' }} /><h3 style={{ color: '#000000' }}>Staff</h3><div style={{ fontSize: '24px', fontWeight: '800', color: '#000000' }}>{storageDistribution.staff} <span style={{ fontSize: '12px', color: '#000000' }}>GB</span></div><div style={{ fontSize: '10px', color: '#000000' }}>Fixed 50% Quota</div></div>
                                        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', borderTop: '4px solid #10b981', background: 'white' }}><Users size={20} style={{ color: '#10b981', margin: '0 auto 10px' }} /><h3 style={{ color: '#000000' }}>Students</h3><div style={{ fontSize: '24px', fontWeight: '800', color: '#000000' }}>{storageDistribution.students} <span style={{ fontSize: '12px', color: '#000000' }}>GB</span></div><div style={{ fontSize: '10px', color: '#000000' }}>Remaining Balance</div></div>
                                    </div>
                                    <div className="list-container" style={{ marginTop: '20px' }}>
                                        <div className="list-item"><div className="icon-box blue"><Server size={20} color="#ffffff" /></div> <span className="text-dark-label" style={{ color: '#000000' }}>Total Cloud Space</span> <span className="tag" style={{ marginLeft: 'auto', background: '#10b981', color: 'white' }}>{totalStorageGB} GB</span></div>
                                        <div className="list-item"><div className="icon-box green"><PieChart size={20} color="#ffffff" /></div> <span className="text-dark-label" style={{ color: '#000000' }}>Used Space</span> <span className="tag" style={{ marginLeft: 'auto', background: '#e2e8f0', color: '#475569' }}>12.5 GB</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="tab-view" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div className="info-card shadow-sm" style={{ width: '350px', textAlign: 'center', padding: '30px' }}>
                                <div className="icon-box blue" style={{ width: '80px', height: '80px', margin: '0 auto 15px', borderRadius: '50%', fontSize: '30px' }}><User size={40} color="#ffffff" /></div>
                                <h2 style={{ color: '#1e293b' }}>Super Admin</h2>
                                <p style={{ color: '#64748b' }}>ID: #SA-9901</p>
                                <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                    <div><span style={{ fontSize: '12px', color: '#000000' }}>Session Start</span><br /><strong style={{ color: '#000000' }}>{sessionStart ? sessionStart.toLocaleTimeString() : "--:--"}</strong></div>
                                    <div><span style={{ fontSize: '12px', color: '#000000' }}>Access Level</span><br /><strong style={{ color: '#000000' }}>Level 5</strong></div>
                                </div>
                                <button className="btn-action btn-danger" style={{ width: '100%', justifyContent: 'center' }}>Logout</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'mail' && (
                        <div className="tab-view">
                            <div className="info-card shadow-lg" style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div className="card-header" style={{ padding: '20px 25px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <Mail size={24} color="#333333" />
                                    <h2 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' }}>Inbox</h2>
                                </div>
                                <div className="card-body" style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff' }}>
                                    <div className="icon-box" style={{ background: '#f1f5f9', width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={40} color="#94a3b8" />
                                    </div>
                                    <h3 style={{ color: '#1e293b', fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px' }}>No New Messages</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '350px', margin: '0 auto 25px' }}>Your inbox is currently empty. We'll notify you when new updates or alerts arrive.</p>
                                    <button style={{ padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                                        Refresh Inbox
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SERVICES MODAL --- */}
                <AnimatePresence>
                    {selectedService && (
                        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
                            <motion.div
                                className="modal-content info-card shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            >
                                <div className="card-header" style={{ justifyContent: 'space-between', background: '#f8fafc', padding: '15px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="icon-box blue" style={{ width: '30px', height: '30px' }}>
                                            {selectedService.icon}
                                        </div>
                                        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#0f172a' }}>Manage {selectedService.title}</h2>
                                    </div>
                                    <button onClick={() => setSelectedService(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="card-body" style={{ padding: '30px', textAlign: 'center' }}>
                                    <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>{selectedService.desc}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                                        Service Code: <strong style={{ color: '#3b82f6' }}>{selectedService.code}</strong>
                                    </p>
                                    <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                        <p style={{ color: '#475569', margin: 0 }}>Management controls for {selectedService.title} will be available here based on your administrative access level.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            toast.success(`Settings for ${selectedService.title} saved!`);
                                            setSelectedService(null);
                                        }}
                                        className="btn-action btn-primary"
                                        style={{ marginTop: '20px', width: '100%', padding: '12px' }}
                                    >
                                        Save Configuration
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>

            <style>{`
            :root { --bg-body: #f8fafc; --text-main: #1e293b; --text-muted: #64748b; --primary: #3b82f6; --danger: #ef4444; --border-light: #e2e8f0; }
            
            /* Desktop Layout */
            .virtual-space-container { display: flex; height: 100vh; background: var(--bg-body); font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; }
            
            /* 👉 3. CSS CHANGE: Margin-left set to 280px just like UserManager */
            .vs-main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; height: 100vh; position: relative; margin-left: 280px; }
            
            /* Header */
            .master-head { background: #ffffff; border-bottom: 1px solid var(--border-light); flex-shrink: 0; }
            
            /* --- FIXED HEADER LAYOUT TO STOP JITTER --- */
            .top-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 12px 24px; gap: 15px; }
            .left-cluster { display: flex; align-items: center; gap: 15px; justify-content: flex-start; min-width: 0; }
            
            .search-pill { display: flex; align-items: center; background: #f1f5f9; padding: 8px 16px; border-radius: 12px; width: 100%; max-width: 320px; border: 1px solid transparent; }
            .search-pill input { border: none; background: transparent; outline: none; margin-left: 10px; width: 100%; font-size: 14px; color: #1e293b; min-width: 0; }
            .search-pill input::placeholder { color: #94a3b8; }
            .text-gray-400 { color: #94a3b8; }
            .text-dark { color: #1e293b; }
            .text-dark-label { color: #1e293b; font-weight: 600; }
            .ai-badge { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; font-size: 10px; padding: 3px 8px; border-radius: 20px; font-weight: 800; flex-shrink: 0; }
            
            /* Center part */
            .brand-center { font-size: 20px; font-weight: 900; color: #0f172a; text-align: center; white-space: nowrap; }
            .brand-highlight { color: var(--primary); }
            .brand-sub { color: #94a3b8; font-weight: 400; }
            
            /* Right part */
            .right-cluster { display: flex; justify-content: flex-end; min-width: 0; }
            .time-display { text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b; background: #f8fafc; padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; width: 220px; flex-shrink: 0; }
            .time-line { display: flex; justify-content: space-between; gap: 15px; }
            .time-line .val { font-weight: 700; color: #0f172a; } .time-line .highlight { color: var(--primary); }
            /* --------------------------- */
            
            .btm-row { background: #1e293b; color: #cbd5e1; padding: 8px 24px; display: flex; align-items: center; gap: 20px; font-size: 12px; width: 100%; overflow-x: auto; }
            .weather-chip { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #e2e8f0; }
            .divider-vert { width: 1px; height: 16px; background: rgba(255,255,255,0.15); }
            .location-chain { display: flex; align-items: center; gap: 8px; }
            .chain-label { font-weight: 700; color: #94a3b8; font-size: 11px; }
            
            .loc-select { appearance: none; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: #f1f5f9; font-size: 11px; padding: 4px 10px; cursor: pointer; border-radius: 6px; }
            .loc-select option { color: #1e293b; background: white; }
            .loc-dropdown-container { position: relative; }
            .tag.vid { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; margin-left: auto; }
            
            .nav-tabs-row { display: flex; gap: 30px; padding: 0 24px; background: white; border-bottom: 1px solid var(--border-light); overflow-x: auto; scrollbar-width: none; }
            .tab-item { background: none; border: none; padding: 16px 0; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; position: relative; transition: 0.3s; white-space: nowrap; }
            .tab-item:hover { color: var(--text-main); }
            .tab-item.active { color: var(--primary); font-weight: 700; }
            .tab-line-static { position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: var(--primary); }

            /* Content & Grid */
            .content-area { flex: 1; padding: 20px; overflow-y: auto; background: var(--bg-body); }
            .vs-grid-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; height: 100%; min-height: 500px; }
            .tab-view { height: 100%; animation: fadeIn 0.2s ease-in; }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            /* Sidebar Panels */
            .sidebar-panels { display: flex; flex-direction: column; gap: 15px; height: 100%; overflow: hidden; } 
            .info-card { background: white; border-radius: 14px; border: 1px solid var(--border-light); overflow: hidden; display: flex; flex-direction: column; height: 100%; }
            .broadcast-card { flex-shrink: 0; height: auto; }
            .resources-card { flex: 1; min-height: 250px; } 
            
            .scrollable-list { overflow-y: auto; flex: 1; padding: 10px; min-height: 0; }
            .scrollable-list::-webkit-scrollbar { width: 6px; }
            .scrollable-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            
            .card-header { padding: 12px 15px; background: #f8fafc; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
            .card-header h3, .card-header h2 { margin: 0; font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
            .card-footer { padding: 15px; border-top: 1px solid var(--border-light); text-align: center; background: #f8fafc; flex-shrink: 0; }

            /* Video Card */
            .video-card { background: black; border-radius: 16px; overflow: hidden; position: relative; border: 1px solid #334155; height: 100%; display: flex; flex-direction: column; }
            .video-frame { width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; }
            .camera-off-placeholder { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; }
            .control-overlay { position: absolute; bottom: 20px; width: 100%; display: flex; justify-content: center; z-index: 10; }
            .control-bar { display: flex; gap: 10px; background: rgba(0,0,0,0.6); padding: 8px 20px; border-radius: 40px; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); }
            .ctrl-btn { color: white; background: rgba(255,255,255,0.1); border: none; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .ctrl-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.05); }
            .ctrl-btn.off { background: var(--danger); }
            .btn-hangup { background: var(--danger); }
            .divider { width: 1px; height: 25px; background: rgba(255,255,255,0.2); margin: 0 5px; align-self: center; }
            
            .status-tags { position: absolute; top: 15px; left: 15px; display: flex; gap: 8px; z-index: 10; }
            .tag { padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; color: white; }
            .tag.live { background: var(--danger); }
            .tag.rec { background: var(--primary); }
            
            /* List Items & Resources */
            .list-item { padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px; color: #1e293b; font-size: 0.85rem; font-weight: 600; border: 1px solid transparent; transition: 0.2s; cursor: pointer; }
            .list-item:hover { background: #f1f5f9; border-color: var(--border-light); }
            .resource-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: 0.2s; margin-bottom: 8px; }
            .resource-item:hover { border-color: var(--primary); background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .res-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
            .res-name { font-size: 0.8rem; font-weight: 600; }
            .res-meta { font-size: 0.7rem; color: #64748b; }
            
            .icon-box { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; }
            .green { background: #10b981; } .blue { background: #3b82f6; }
            
            .btn-download { background: white; border: 1px solid var(--border-light); width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); cursor: pointer; }
            .btn-upload { width: 100%; padding: 12px; background: white; border: 1px dashed var(--primary); color: var(--primary); border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.9rem; transition: 0.2s; }
            .btn-upload:hover { background: #eff6ff; }
            .btn-action { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 700; font-size: 0.85rem; }
            .btn-danger { background: var(--danger); color: white; } .btn-primary { background: var(--primary); color: white; }

            .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
            .modal-content { width: 90%; max-width: 500px; }

            /* ==============================================================
               📱 MOBILE RESPONSIVE FIXES
               ============================================================== */
            @media (max-width: 850px) {
                /* 👉 4. Mobile Layout Fixes: Margin 0 kar diya taaki full screen le aur content daba-daba na lage */
                .vs-main-content { margin-left: 0; padding-top: 70px; width: 100%; } 
                
                .top-row { display: flex; flex-direction: column; align-items: flex-start; gap: 15px; }
                .left-cluster { width: 100%; max-width: 100%; } 
                .search-pill { width: 100%; max-width: 100%; box-sizing: border-box; }
                .brand-center { width: 100%; text-align: left; }
                .right-cluster { width: 100%; justify-content: flex-start; }
                .time-display { text-align: left; width: 100%; }
                
                .btm-row { display: none; }
                .vs-grid-layout { display: flex; flex-direction: column; height: auto; }
                .video-card { aspect-ratio: 4/3; width: 100%; height: auto; }
                .sidebar-panels { height: auto; }
                .info-card { height: auto; }
            }
            `}</style>
        </div >
    );
}