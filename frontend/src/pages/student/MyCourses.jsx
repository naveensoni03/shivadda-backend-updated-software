import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { PlayCircle, CheckCircle, Clock, Search, Loader2 } from "lucide-react";
import StudentSidebar from "../../components/StudentSidebar";

export default function MyCourses() {
  const navigate = useNavigate();
  const location = useLocation();

  // States for Real Data
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  // 🔥 NEW: States to store Live Dropdown Data from Database
  const [dbLevels, setDbLevels] = useState([]);
  const [dbClasses, setDbClasses] = useState([]);

  // Universal Selection States
  const [placeFilter, setPlaceFilter] = useState("ALL_PLACES");
  const [serviceFilter, setServiceFilter] = useState("ALL_SERVICES");
  const [classFilter, setClassFilter] = useState("ALL_CLASSES");

  // 🚀 FETCH DROPDOWN DATA ON LOAD
  useEffect(() => {
    const fetchDynamicFilters = async () => {
      try {
        const [lvlRes, clsRes] = await Promise.all([
          api.get('courses/academic-levels/'),
          api.get('courses/academic-classes/')
        ]);
        setDbLevels(Array.isArray(lvlRes.data) ? lvlRes.data : lvlRes.data.results || []);
        setDbClasses(Array.isArray(clsRes.data) ? clsRes.data : clsRes.data.results || []);
      } catch (err) {
        console.error("Error fetching dynamic filters:", err);
      }
    };
    fetchDynamicFilters();
  }, []);

  // 🚀 FETCH COURSES WHENEVER FILTERS CHANGE
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // navigate("/student/login"); // Production me uncomment karein
    }
    fetchCourses();
  }, [navigate, placeFilter, serviceFilter, classFilter]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (placeFilter !== "ALL_PLACES") queryParams.append("place", placeFilter);
      if (serviceFilter !== "ALL_SERVICES") queryParams.append("service", serviceFilter);
      if (classFilter !== "ALL_CLASSES") queryParams.append("class", classFilter);

      const url = `/courses/list/?${queryParams.toString()}`;
      const res = await api.get(url);

      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Local Search & Status Filter Logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "Active") return matchesSearch && course.is_active === true;
    if (filter === "Inactive") return matchesSearch && course.is_active === false;
    return matchesSearch;
  });

  // --- ANIMATIONS ---
  const containerStagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const cardScaleUp = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="student-layout">
      <div className="ambient-bg"></div>
      <StudentSidebar />

      <main className="student-main-content">
        <div className="content-wrapper">

          {/* Header */}
          <motion.header className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <h1 className="page-title">My Learning Journey 🚀</h1>
              <p className="page-subtitle">Pick up right where you left off.</p>
            </div>
          </motion.header>

          {/* Controls: Search & Universal Selection Filter */}
          <motion.div className="controls-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="search-box glass-panel">
              <Search size={20} color="#64748b" />
              <input
                type="text"
                placeholder="Search courses by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 🔥 NEW: LIVE Universal Selection Boxes from Database */}
            <div className="universal-filters glass-panel">
              {/* Place / Geography Filter */}
              <select className="hierarchy-select" value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)}>
                <option value="ALL_PLACES">🌍 All Places</option>
                <option value="ASIA">Asia</option>
                <option value="INDIA">India</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="DELHI">Delhi</option>
              </select>

              {/* Service / Pillar Filter (LIVE) */}
              <select className="hierarchy-select" value={serviceFilter} onChange={(e) => {
                setServiceFilter(e.target.value);
                setClassFilter("ALL_CLASSES"); // Reset class when pillar changes
              }}>
                <option value="ALL_SERVICES">📚 All Edu. Pillars</option>
                {dbLevels.map((lvl) => (
                  <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                ))}
              </select>

              {/* Class / Group Filter (LIVE & SMART FILTERED) */}
              <select className="hierarchy-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option value="ALL_CLASSES">🎓 All Classes</option>
                {dbClasses
                  .filter(cls => serviceFilter === "ALL_SERVICES" || cls.level_name === serviceFilter || cls.level === serviceFilter)
                  .map((cls) => (
                    <option key={cls.id} value={cls.name}>{cls.name} {serviceFilter === "ALL_SERVICES" ? `(${cls.level_name})` : ""}</option>
                  ))}
              </select>
            </div>

            {/* Old Status Filter */}
            <div className="filter-tabs glass-panel" style={{ marginTop: '10px' }}>
              {['All', 'Active', 'Inactive'].map(tab => (
                <button
                  key={tab}
                  className={`filter-tab ${filter === tab ? 'active' : ''}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="loader-container">
              <Loader2 size={40} className="spinner" color="#4f46e5" />
              <p>Loading your courses...</p>
            </div>
          ) : (
            <motion.div className="course-grid" variants={containerStagger} initial="hidden" animate="show">
              <AnimatePresence>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course, idx) => (
                    <CourseCard key={course.id} course={course} variants={cardScaleUp} index={idx} />
                  ))
                ) : (
                  <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="empty-icon">📚</div>
                    <h3>No courses found</h3>
                    <p>You haven't been assigned any courses yet, or adjust your search filters.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </main>

      {/* 🚀 BULLETPROOF RESPONSIVE CSS */}
      <style jsx="true">{`
        :root {
            --bg-gradient: linear-gradient(135deg, #f0f2f5 0%, #e6efff 100%);
            --glass-bg: rgba(255, 255, 255, 0.85);
            --glass-border: 1px solid rgba(255, 255, 255, 0.95);
            --text-main: #0f172a;
            --text-muted: #64748b;
            --primary: #4f46e5;
        }

        /* GLOBALS */
        * { box-sizing: border-box; }

        .student-layout { 
            display: flex; 
            height: 100vh; 
            width: 100%; 
            background: var(--bg-gradient); 
            font-family: 'Inter', sans-serif; 
            overflow: hidden; 
            position: relative; 
        }
        
        .ambient-bg { 
            position: absolute; inset: -50%; width: 200%; height: 200%; 
            background: radial-gradient(circle at center, rgba(99,102,241,0.05) 0%, rgba(248,250,252,0) 60%); 
            z-index: 0; pointer-events: none; 
        }

        /* ✅ MAIN CONTENT STRUCTURE */
        .student-main-content { 
            flex: 1; 
            margin-left: 280px; 
            height: 100vh; 
            overflow-y: auto; 
            overflow-x: hidden; 
            z-index: 1; 
            transition: margin-left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            scroll-behavior: smooth; 
            width: calc(100% - 280px);
        }
        
        .content-wrapper { 
            padding: 40px; 
            max-width: 1400px; 
            margin: 0 auto; 
            min-height: 100%;
        }

        /* UTILS */
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(10px); border: var(--glass-border); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05); }

        /* HEADER */
        .page-header { margin-bottom: 30px; }
        .page-title { margin: 0 0 5px 0; font-size: 2.2rem; font-weight: 900; color: var(--text-main); }
        .page-subtitle { margin: 0; color: var(--text-muted); font-size: 1.05rem; font-weight: 500; }

        /* CONTROLS */
        .controls-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; gap: 20px; flex-wrap: wrap; flex-direction: column;}
        .search-box { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 16px; width: 100%; max-width: 500px; }
        .search-box input { border: none; background: transparent; outline: none; font-size: 1rem; width: 100%; color: var(--text-main); font-weight: 500; }
        
        /* UNIVERSAL SELECTION CSS */
        .universal-filters {
            display: flex;
            gap: 15px;
            padding: 12px 20px;
            border-radius: 16px;
            flex-wrap: wrap;
            width: 100%;
        }
        .hierarchy-select {
            padding: 10px 15px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            color: var(--text-main);
            font-size: 0.95rem;
            font-weight: 600;
            outline: none;
            cursor: pointer;
            transition: all 0.2s ease;
            flex: 1;
            min-width: 200px;
        }
        .hierarchy-select:hover, .hierarchy-select:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            background: white;
        }

        .filter-tabs { display: flex; padding: 6px; border-radius: 16px; gap: 5px; flex-wrap: nowrap; overflow-x: auto;}
        .filter-tab { background: transparent; border: none; padding: 8px 20px; border-radius: 12px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.3s; white-space: nowrap; }
        .filter-tab.active { background: white; color: var(--primary); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

        /* COURSE GRID */
        .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
        
        .course-card { border-radius: 24px; padding: 20px; display: flex; flex-direction: column; gap: 20px; cursor: pointer; position: relative; overflow: hidden; border: 1px solid #e2e8f0; background: white; }
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .course-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; box-shadow: inset 0 0 20px rgba(255,255,255,0.5); flex-shrink: 0;}
        .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 5px; }
        .status-badge.active { background: #dcfce7; color: #15803d; }
        .status-badge.inactive { background: #fee2e2; color: #b91c1c; }
        
        .card-body h3 { margin: 0 0 10px 0; font-size: 1.2rem; font-weight: 800; color: var(--text-main); line-height: 1.3; }
        .card-body p { margin: 0; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }

        .progress-section { margin-top: auto; }
        .progress-info { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; }
        .progress-bar-bg { width: 100%; height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 10px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .card-footer { padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.05); }
        .action-btn { width: 100%; padding: 12px; border-radius: 12px; border: none; font-weight: 700; font-size: 0.95rem; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        .btn-primary { background: linear-gradient(135deg, var(--primary), #7c3aed); color: white; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); transform: translateY(-2px); }

        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; text-align: center; }
        .empty-icon { font-size: 4rem; margin-bottom: 15px; opacity: 0.5; }
        .empty-state h3 { margin: 0 0 10px 0; color: var(--text-main); font-size: 1.5rem; }
        .empty-state p { margin: 0; color: var(--text-muted); }

        .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; color: var(--primary); font-weight: 600;}
        .spinner { animation: spin 1s linear infinite; margin-bottom: 15px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* 📱 TABLET RESPONSIVENESS (1024px) */
        @media (max-width: 1024px) {
            .student-main-content { margin-left: 0; width: 100%; }
            .content-wrapper { padding: 110px 30px 100px 30px; }
        }

        /* 📱 MOBILE RESPONSIVENESS (768px) */
        @media (max-width: 768px) {
            .content-wrapper { padding: 95px 20px 80px 20px; }
            .universal-filters { flex-direction: column; gap: 10px; }
            .hierarchy-select { width: 100%; }
            .course-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// --- SUB COMPONENTS ---
const CourseCard = ({ course, variants, index }) => {
  const navigate = useNavigate();

  // Dynamic Colors based on index
  const colorThemes = [
    { bg: '#eff6ff', fill: '#3b82f6', icon: '📘' },
    { bg: '#f5f3ff', fill: '#8b5cf6', icon: '🧬' },
    { bg: '#f0fdf4', fill: '#22c55e', icon: '💻' },
    { bg: '#fff7ed', fill: '#f97316', icon: '📊' },
  ];
  const theme = colorThemes[index % colorThemes.length];

  const progress = 0; // Default progress to 0

  return (
    <motion.div
      className="course-card"
      variants={variants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
    >
      <div className="card-header">
        <div className="course-icon" style={{ background: theme.bg }}>
          {course.thumbnail ? <img src={course.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} /> : theme.icon}
        </div>
        <div className={`status-badge ${course.is_active ? 'active' : 'inactive'}`}>
          {course.is_active ? <CheckCircle size={14} /> : <Clock size={14} />}
          {course.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="card-body">
        <h3>{course.name}</h3>
        <p style={{ marginBottom: '10px' }}>
          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>
            CODE: {course.code || "N/A"}
          </span>
        </p>
        <p style={{ fontSize: '0.85rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {course.description || "No description provided for this course."}
        </p>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <span>{progress}% Complete</span>
          <span>{course.lessons_count || 0} Modules Total</span>
        </div>
        <div className="progress-bar-bg">
          <motion.div
            className="progress-bar-fill"
            style={{ background: theme.fill, width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      <div className="card-footer">
        <button
          className="action-btn btn-primary"
          onClick={() => navigate(`/student/course-space/${course.id}`)}
        >
          <PlayCircle size={18} /> Open Course Space
        </button>
      </div>
    </motion.div>
  );
};