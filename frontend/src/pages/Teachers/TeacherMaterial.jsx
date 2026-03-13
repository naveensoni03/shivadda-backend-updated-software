import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UploadCloud, FileText, Video, Link as LinkIcon,
    Trash2, Edit, Search, PlusCircle, BookOpen, X
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// 🚀 API URL YAHAN SET KAR DIYA HAI
const API_BASE_URL = "http://127.0.0.1:8000/api/teachers/materials/";

export default function TeacherMaterial() {
    const [activeTab, setActiveTab] = useState("list");

    // Track which material is currently being edited (null means no edit modal is open)
    const [editingMaterial, setEditingMaterial] = useState(null);

    const [materials, setMaterials] = useState([
        { id: 1, title: "Thermodynamics Notes", class: "Class 12 Physics", type: "pdf", date: "09 Mar 2026", size: "2.4 MB" },
        { id: 2, title: "Organic Chemistry Lec 1", class: "Class 11 Chemistry", type: "video", date: "08 Mar 2026", size: "145 MB" },
        { id: 3, title: "Maths Formula Sheet", class: "Class 10 Maths", type: "link", date: "07 Mar 2026", size: "-" },
    ]);

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        toast.success("Material Uploaded Successfully!");
        setActiveTab("list");
    };

    const handleDelete = (id) => {
        toast.error("Material Deleted!");
        setMaterials(materials.filter(m => m.id !== id));
    };

    // 🔥 OPEN EDIT MODAL
    const openEditModal = (item) => {
        setEditingMaterial({ ...item });
    };

    // 🔥 SAVE EDITED DATA
    const handleEditSave = (e) => {
        e.preventDefault();
        setMaterials(materials.map(m => m.id === editingMaterial.id ? editingMaterial : m));
        toast.success("Material Updated Successfully!");
        setEditingMaterial(null); // Close Modal
    };

    const getIcon = (type) => {
        if (type === 'pdf') return <FileText size={24} color="#ef4444" />;
        if (type === 'video') return <Video size={24} color="#3b82f6" />;
        return <LinkIcon size={24} color="#10b981" />;
    };

    return (
        <div className="material-wrapper">
            <Toaster position="top-right" />

            <div className="dashboard-inner-area">
                <motion.div className="material-header" initial="hidden" animate="show" variants={fadeUp}>
                    <div className="header-titles">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "5px" }}>
                            <h1 className="gradient-text" style={{ margin: 0 }}>Study Material</h1>
                            <BookOpen size={32} color="#4f46e5" />
                        </div>
                        <p className="subtitle">Upload and manage PDFs, Videos, and Links for your students.</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                            onClick={() => setActiveTab('list')}
                        >
                            View All
                        </button>
                        <button
                            className={`tab-btn primary ${activeTab === 'upload' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upload')}
                        >
                            <PlusCircle size={18} /> Upload New
                        </button>
                    </div>
                </motion.div>

                {/* VIEW 1: MATERIAL LIST */}
                {activeTab === "list" && (
                    <motion.div className="material-list-section" initial="hidden" animate="show" variants={fadeUp}>
                        <div className="search-bar-container">
                            <Search size={20} className="search-icon" />
                            <input type="text" placeholder="Search materials by name or class..." className="search-input" />
                        </div>

                        <div className="materials-scroll-container">
                            <div className="materials-grid">
                                {materials.map((item) => (
                                    <div key={item.id} className="material-card">
                                        <div className="card-icon-box">
                                            {getIcon(item.type)}
                                        </div>
                                        <div className="card-info">
                                            <h3>{item.title}</h3>
                                            <span className="class-badge">{item.class}</span>
                                            <div className="meta-info">
                                                <span>{item.date}</span> • <span>{item.size}</span>
                                            </div>
                                        </div>
                                        <div className="card-actions">
                                            <button className="action-btn edit" onClick={() => openEditModal(item)}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* VIEW 2: UPLOAD FORM */}
                {activeTab === "upload" && (
                    <motion.div className="upload-section" initial="hidden" animate="show" variants={fadeUp}>
                        <div className="card-glass upload-card">
                            <h2>Upload New Material</h2>
                            <form onSubmit={handleUpload}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Material Title</label>
                                        <input type="text" placeholder="e.g. Thermodynamics Chapter 1" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Select Class / Subject</label>
                                        <select required>
                                            <option value="">-- Choose Class --</option>
                                            <option value="1">Class 12 Physics</option>
                                            <option value="2">Class 11 Chemistry</option>
                                            <option value="3">Class 10 Maths</option>
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Material Type</label>
                                        <div className="type-selector-wrapper">
                                            <div className="type-selector">
                                                <label className="type-radio"><input type="radio" name="type" defaultChecked /> 📄 Document (PDF)</label>
                                                <label className="type-radio"><input type="radio" name="type" /> 🎥 Recorded Video</label>
                                                <label className="type-radio"><input type="radio" name="type" /> 🔗 External Link</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Upload File</label>
                                        <div className="drag-drop-area">
                                            <UploadCloud size={48} color="#4f46e5" />
                                            <p>Drag & Drop your file here or <span>Browse</span></p>
                                            <small>Supports: PDF, DOCX, MP4, MKV (Max: 500MB)</small>
                                            <input type="file" className="hidden-file-input" />
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Description (Optional)</label>
                                        <textarea rows="3" placeholder="Add some instructions for the students..."></textarea>
                                    </div>
                                </div>

                                <div className="form-footer">
                                    <button type="button" className="cancel-btn" onClick={() => setActiveTab('list')}>Cancel</button>
                                    <button type="submit" className="submit-btn">Upload Material</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* 🔥 EDIT MODAL PORTION */}
            <AnimatePresence>
                {editingMaterial && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="edit-modal-glass card-glass"
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        >
                            <div className="modal-header">
                                <h2>Edit Material</h2>
                                <button type="button" className="close-modal-btn" onClick={() => setEditingMaterial(null)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleEditSave} className="edit-form">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={editingMaterial.title}
                                        onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Class / Subject</label>
                                    <input
                                        type="text"
                                        value={editingMaterial.class}
                                        onChange={(e) => setEditingMaterial({ ...editingMaterial, class: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-footer" style={{ marginTop: "20px" }}>
                                    <button type="button" className="cancel-btn" onClick={() => setEditingMaterial(null)}>Cancel</button>
                                    <button type="submit" className="submit-btn">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .material-wrapper * { box-sizing: border-box !important; }

                .material-wrapper {
                    background: transparent; 
                    width: 100%;
                    height: 100vh;           
                    overflow-y: auto;        
                    overflow-x: hidden;      
                    font-family: 'Inter', sans-serif;
                }
                
                .material-wrapper::-webkit-scrollbar { width: 8px; }
                .material-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .material-wrapper::-webkit-scrollbar-track { background: transparent; }

                .dashboard-inner-area {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px 30px 100px 30px; 
                }

                .material-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .gradient-text { font-size: 2.2rem; font-weight: 800; margin: 0 0 5px 0; background: linear-gradient(135deg, #0f172a 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .subtitle { color: #64748b; margin: 0; font-size: 1rem; }

                .header-actions { display: flex; background: white; padding: 6px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .tab-btn { padding: 10px 20px; border: none; background: transparent; color: #64748b; font-weight: 600; border-radius: 8px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
                .tab-btn:hover { color: #0f172a; }
                .tab-btn.active { background: #f1f5f9; color: #0f172a; }
                .tab-btn.primary.active { background: #4f46e5; color: white; }

                .search-bar-container { position: relative; margin-bottom: 25px; width: 100%; }
                .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                
                /* 🔥 MASTER TEXT FIX: Added !important to inputs so dark mode css can't touch them */
                .search-input, .form-group input, .form-group select, .form-group textarea, .edit-form input {
                    color: #1e293b !important;
                    background-color: #f8fafc !important;
                }

                .search-input { width: 100%; padding: 16px 16px 16px 45px; border: 1px solid #e2e8f0; border-radius: 16px; font-size: 1rem; transition: 0.3s; outline: none; }
                .search-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); background-color: #ffffff !important; }

                .materials-scroll-container { width: 100%; }
                .materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

                .material-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 15px; transition: 0.3s; }
                .material-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-color: #cbd5e1; }
                
                .card-icon-box { width: 50px; height: 50px; border-radius: 12px; background: #f8fafc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .card-info { flex: 1; min-width: 0; }
                .card-info h3 { margin: 0 0 5px 0; font-size: 1.05rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .class-badge { background: #eef2ff; color: #4f46e5; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; display: inline-block; margin-bottom: 5px; }
                .meta-info { font-size: 0.8rem; color: #94a3b8; }

                .card-actions { display: flex; gap: 8px; flex-shrink: 0; }
                .action-btn { border: none; background: transparent; padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .action-btn.edit:hover { background: #e0e7ff; color: #4f46e5; }
                .action-btn.delete:hover { background: #fee2e2; color: #dc2626; }

                .card-glass { background: white; padding: 30px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; width: 100%; max-width: 100%; }
                .card-glass h2 { margin-top: 0; margin-bottom: 25px; color: #1e293b; }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
                .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 0; } 
                .form-group.full-width { grid-column: 1 / -1; }
                
                .form-group label { font-weight: 600; color: #475569; font-size: 0.9rem; }
                .form-group input[type="text"], .form-group select, .form-group textarea {
                    width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; font-family: inherit; transition: 0.3s; outline: none;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #4f46e5; background-color: #ffffff !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }

                .type-selector-wrapper { width: 100%; max-width: 100%; }
                .type-selector { display: flex; gap: 20px; flex-wrap: wrap;}
                .type-radio { display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500; color: #1e293b; white-space: nowrap; }

                .drag-drop-area { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 40px 20px; text-align: center; background: #f8fafc; cursor: pointer; position: relative; transition: 0.3s; width: 100%; }
                .drag-drop-area:hover { border-color: #4f46e5; background: #eef2ff; }
                .drag-drop-area p { margin: 10px 0 5px 0; color: #475569; font-weight: 500; }
                .drag-drop-area p span { color: #4f46e5; font-weight: 700; text-decoration: underline; }
                .drag-drop-area small { color: #94a3b8; }
                .hidden-file-input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

                .form-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
                .cancel-btn { padding: 12px 25px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; border-radius: 12px; cursor: pointer; transition: 0.2s; }
                .cancel-btn:hover { background: #f8fafc; color: #1e293b; }
                .submit-btn { padding: 12px 30px; border: none; background: #4f46e5; color: white; font-weight: 700; border-radius: 12px; cursor: pointer; transition: 0.2s; }
                .submit-btn:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 10px 15px rgba(79,70,229,0.2); }

                /* 🔥 MODAL STYLING 🔥 */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
                .edit-modal-glass { max-width: 500px; width: 100%; padding: 30px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
                .modal-header h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
                .close-modal-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; padding: 0;}
                .close-modal-btn:hover { color: #ef4444; transform: rotate(90deg); }
                .edit-form { display: flex; flex-direction: column; gap: 15px; }

                @media (max-width: 768px) {
                    .dashboard-inner-area { padding: 85px 15px 100px 15px !important; max-width: 100vw !important; }
                    .header-titles { padding-top: 40px; } 
                    .material-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .header-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; }
                    .tab-btn { justify-content: center; }
                    .gradient-text { font-size: 1.8rem;}
                    .form-grid { display: flex; flex-direction: column; }
                    .card-glass { padding: 20px 15px !important; width: 100% !important; max-width: 100% !important; }
                    .form-footer { flex-direction: column; }
                    .cancel-btn, .submit-btn { width: 100%; }
                    .form-group input, .form-group select, .form-group textarea, .drag-drop-area { width: 100% !important; max-width: 100% !important; }
                    .type-selector-wrapper { overflow-x: auto; padding-bottom: 10px; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
                    .type-selector { flex-wrap: nowrap; width: max-content; }
                    .materials-scroll-container { width: 100%; overflow-x: auto; padding-bottom: 10px; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
                    .materials-scroll-container::-webkit-scrollbar { height: 6px; }
                    .materials-scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .materials-grid { display: flex; flex-direction: row; width: max-content; gap: 15px; }
                    .material-card { width: 300px; flex-shrink: 0; }
                }

                @media (max-width: 480px) {
                    .dashboard-inner-area { padding: 85px 10px 100px 10px !important; }
                    .card-glass { padding: 15px 10px !important; }
                    .form-group input, .form-group select, .form-group textarea { padding: 12px 10px !important; font-size: 0.9rem !important; }
                }
            `}</style>
        </div>
    );
}