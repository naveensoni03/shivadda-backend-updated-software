import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, GraduationCap, X, CheckCircle, Loader2 } from "lucide-react";
import "./dashboard.css";

const InputField = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false, maxLength }) => (
    <div className="input-group">
        <label style={{ display: 'block', marginBottom: '5px', color: '#000', fontWeight: '800', fontSize: '0.85rem' }}>{label}</label>
        <input type={type} value={value || ""} onChange={onChange} placeholder={placeholder} readOnly={readOnly} maxLength={maxLength} className="modern-input" style={readOnly ? { background: '#f1f5f9', cursor: 'not-allowed', color: '#6366f1' } : {}} />
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div className="input-group">
        <label style={{ display: 'block', marginBottom: '5px', color: '#000', fontWeight: '800', fontSize: '0.85rem' }}>{label}</label>
        <select value={value || ""} onChange={onChange} className="modern-input">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default function Students() {
    const [students, setStudents] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedRows, setSelectedRows] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);

    const [formStep, setFormStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const todayDate = new Date().toISOString().split('T')[0];

    const initialFormState = {
        id: null, first_name: "", last_name: "", dob: todayDate, gender: "Male",
        place_of_birth: "Not Specified", height: "", weight: "", marital_status: "No", spouse_name: "",
        blood_group: "O+", religion: "Not Specified", category: "General", nationality: "Indian", aadhar_number: "",
        continent: "Asia", country: "India", latitude: "", longitude: "", virtual_id: "",
        student_class: "10th", section: "A", roll_number: "TBD", admission_number: "", admission_date: todayDate,
        batch_session: "2024-2025", previous_school: "", tc_number: "", fee_status: "Pending",
        father_name: "", father_occupation: "", mother_name: "", mother_occupation: "", primary_mobile: "",
        secondary_mobile: "", email: "", parent_email: "", current_address: "", permanent_address: "", place_id: "", subplace_id: "",
        service_id: "", subservice_id: "", user_group: "Service Seekers", user_subgroup: "Students",
        highest_qualification: "", experience: "", hobbies: "", beliefs: "", registration_status: "Registered",
        validity_start: todayDate, validity_end: "2026-03-31", status: "Active", scholarship_percent: "",
        transport_mode: "Select", photo: null, aadhar_scan: null, tc_scan: null, marksheet_scan: null,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [promoteData, setPromoteData] = useState({ fromClass: "10th", toClass: "11th" });
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("All");

    const fetchData = async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        try {
            const timeStamp = new Date().getTime();
            const res = await api.get(`/students/list/?limit=10000&t=${timeStamp}`);
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];
            const sortedData = [...data].sort((a, b) => b.id - a.id);
            setStudents(sortedData);
        } catch (error) {
            console.error("Error fetching students:", error);
            if (!isSilent) toast.error("Could not load student list.");
            setStudents([]);
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        let result = Array.isArray(students) ? students : [];
        if (classFilter !== "All") result = result.filter(s => s.student_class === classFilter);
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(s =>
                (s.first_name && s.first_name.toLowerCase().includes(lower)) ||
                (s.last_name && s.last_name.toLowerCase().includes(lower)) ||
                (s.admission_number && s.admission_number.toLowerCase().includes(lower))
            );
        }
        setFilteredList(result);
    }, [searchTerm, classFilter, students]);

    const handleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedRows(currentItems.map(s => s.id));
        else setSelectedRows([]);
    };

    const handleBulkAction = async (newStatus) => {
        const load = toast.loading(`Applying ${newStatus}...`);
        try {
            // 🚀 FIX 1: Bulk update me 'detail' URL lagaya
            await Promise.all(selectedRows.map(id => api.patch(`/students/detail/${id}/`, { status: newStatus })));
            toast.success(`Profiles marked as ${newStatus}! ✅`, { id: load });
            setSelectedRows([]);
            await fetchData(true);
        } catch (err) { toast.error("Bulk Action failed", { id: load }); }
    };

    const handlePromoteSubmit = async () => {
        const load = toast.loading("Promoting students...");
        try {
            await api.post("/students/promote/", promoteData);
            toast.success("Students Promoted Successfully! 🎓", { id: load });
            setShowPromoteModal(false);
            await fetchData(true);
        } catch (err) { toast.error("Promotion failed", { id: load }); }
    };

    const handleAddStudent = async () => {
        if (!formData.first_name || !formData.admission_number || !formData.email) {
            return toast.error("First Name, Admission No, and Student Email are mandatory!");
        }

        const load = toast.loading(isEditing ? "Updating Profile..." : "Creating Account...");

        try {
            const submissionData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'parent_email') return;

                if (key !== 'id' && formData[key] !== null && formData[key] !== undefined) {
                    if (['photo', 'aadhar_scan', 'tc_scan', 'marksheet_scan'].includes(key)) {
                        if (formData[key] instanceof File) submissionData.append(key, formData[key]);
                    } else {
                        submissionData.append(key, formData[key]);
                    }
                }
            });

            if (isEditing) {
                // 🚀 FIX 2: Yahan par update karte time URL 'detail' hona chahiye, 'list' nahi!
                await api.patch(`/students/detail/${formData.id}/`, submissionData);
                toast.success("Student Updated! ✨", { id: load });
            } else {
                const generatedPassword = Math.random().toString(36).slice(-8);
                submissionData.append('is_new_student', 'true');
                submissionData.append('password', generatedPassword);

                // Naya banate time 'list' theek hai
                await api.post("/students/list/", submissionData);
                toast.success(
                    <div><b>Admission Done ✅</b><br />Login ID: {formData.email}<br />Password: <b>{generatedPassword}</b></div>,
                    { id: load, duration: 8000 }
                );
            }

            setShowAddModal(false);
            setFormStep(1);
            setCurrentPage(1);

            setTimeout(() => { fetchData(true); }, 500);

        } catch (err) {
            console.error("Error Details:", err.response?.data);
            let errorMsg = "Operation Failed. Pura form check karo.";
            if (err.response && err.response.data) {
                if (err.response.data.error) {
                    errorMsg = err.response.data.error;
                } else if (typeof err.response.data === 'string') {
                    errorMsg = err.response.data;
                } else if (typeof err.response.data === 'object') {
                    const firstKey = Object.keys(err.response.data)[0];
                    const firstError = err.response.data[firstKey];
                    errorMsg = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
                }
            }
            toast.error(errorMsg, { id: load, duration: 5000 });
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormStep(1);
        const generatedVID = "SHIV-" + Math.floor(10000 + Math.random() * 90000);
        setFormData({ ...initialFormState, virtual_id: generatedVID, admission_number: `ADM-${Math.floor(1000 + Math.random() * 9000)}` });
        setShowAddModal(true);
    };

    const handleEditProfile = () => {
        if (!selectedStudent) return;
        setIsEditing(true);
        setFormStep(1);
        const editableData = { ...selectedStudent };
        ['photo', 'aadhar_scan', 'tc_scan', 'marksheet_scan'].forEach(key => { if (typeof editableData[key] === 'string') editableData[key] = null; });
        setFormData(editableData);
        setShowDetailModal(false);
        setShowAddModal(true);
    };

    const nextStep = () => setFormStep(prev => prev + 1);
    const prevStep = () => setFormStep(prev => prev - 1);

    const currentItems = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 10, opacity: 0 }, show: { y: 0, opacity: 1 } };
    const modalVariants = { hidden: { opacity: 0, scale: 0.9, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.5 } }, exit: { opacity: 0, scale: 0.95, y: 20 } };

    return (
        <div className="dashboard-container">
            <SidebarModern />
            <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

            <div className="main-content">
                <header className="page-header">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#6366f1', marginBottom: '5px' }}>⛅ 28°C Haze | INDIA</div>
                        <h1 className="title-gradient">Student Management</h1>
                        <p className="subtitle">Manage admissions, promotions & records</p>
                    </motion.div>

                    <div className="header-actions">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="btn-row">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-glass" onClick={() => setShowPromoteModal(true)}>🎓 Promote</motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary-glow" onClick={openAddModal}>+ New Admission</motion.button>
                        </div>
                    </div>
                </header>

                <div className="filters-row">
                    {['All', '9th', '10th', '11th', '12th'].map(cls => (
                        <button key={cls} className={`filter-chip ${classFilter === cls ? 'active' : ''}`} onClick={() => setClassFilter(cls)} >
                            {cls === 'All' ? 'All Classes' : `Class ${cls}`}
                        </button>
                    ))}
                </div>

                {selectedRows.length > 0 && (
                    <div className="bulk-action-bar">
                        <span style={{ fontWeight: '700' }}>✅ {selectedRows.length} Students Selected</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={{ background: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', fontWeight: '700', cursor: 'pointer' }} onClick={() => setSelectedRows([])}>Clear</button>
                            <button style={{ background: '#10b981', border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleBulkAction('Active')}>Activate</button>
                            <button style={{ background: '#f59e0b', border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleBulkAction('Hibernation')}>Hibernate</button>
                        </div>
                    </div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="table-card glass-panel" >
                    <div className="table-responsive-wrapper">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}><input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === currentItems.length && currentItems.length > 0} /></th>
                                    <th style={{ width: '60px' }}>S.NO</th>
                                    <th>ADM NO</th>
                                    <th>STUDENT NAME</th>
                                    <th>CLASS</th>
                                    <th>SECTION</th>
                                    <th>STATUS</th>
                                    <th className="text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                                {isLoading ? (
                                    <tr><td colSpan="8" className="empty-state"><Loader2 className="spin" size={24} style={{ margin: '0 auto' }} /> Loading Data...</td></tr>
                                ) : currentItems.length > 0 ? currentItems.map((s, index) => (
                                    <motion.tr key={s.id} variants={itemVariants} whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}>
                                        <td><input type="checkbox" checked={selectedRows.includes(s.id)} onChange={() => handleSelectRow(s.id)} /></td>
                                        <td className="font-bold text-slate-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="font-bold text-slate-600">#{s.admission_number}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div className={`avatar-circle ${s.gender === 'Female' ? 'pink' : 'blue'}`}>
                                                    {s.first_name ? s.first_name[0] : 'S'}{(s.last_name && s.last_name[0]) || ''}
                                                </div>
                                                <div>
                                                    <div className="name-text">{s.first_name} {s.last_name}</div>
                                                    <div className="sub-text">{s.primary_mobile || s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="class-badge">{s.student_class}</span></td>
                                        <td>{s.section}</td>
                                        <td>
                                            <span className={`status-pill ${s.fee_status?.toLowerCase() || 'pending'}`}>
                                                {s.fee_status === 'Paid' ? '● Paid' : '● Pending'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button className="icon-btn" onClick={() => { setSelectedStudent(s); setShowDetailModal(true); }}>👁️</button>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr><td colSpan="8" className="empty-state">No students found matching your criteria.</td></tr>
                                )}
                            </motion.tbody>
                        </table>
                    </div>
                </motion.div>

                {!isLoading && filteredList.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', alignItems: 'center' }}>
                        <button className="btn-secondary" style={{ padding: '10px 20px', opacity: currentPage === 1 ? 0.5 : 1 }} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>◀ Prev</button>
                        <span style={{ fontWeight: '800', color: '#000' }}>Page {currentPage} of {totalPages}</span>
                        <button className="btn-secondary" style={{ padding: '10px 20px', opacity: currentPage === totalPages ? 0.5 : 1 }} disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next ▶</button>
                    </div>
                )}

                <AnimatePresence>
                    {showAddModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
                            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="modal-content large-modal glass-modal">
                                <div className="modal-header">
                                    <div><h2>{isEditing ? "Edit Profile" : "New Admission"}</h2><p className="step-indicator">Complete all 4 steps to register</p></div>
                                    <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
                                </div>
                                <div className="stepper-container hide-scrollbar">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div key={step} className={`step-item ${formStep >= step ? 'active' : ''}`}>
                                            <div className="circle">{formStep > step ? <CheckCircle size={18} /> : step}</div>
                                            <span className="label">{step === 1 ? "Identity" : step === 2 ? "Academic" : step === 3 ? "Parents" : "Docs"}</span>
                                            {step < 4 && <div className="line"></div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="modal-body hide-scrollbar">
                                    <AnimatePresence mode="wait">
                                        <motion.div key={formStep} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }} className="form-grid">
                                            {formStep === 1 && <>
                                                <InputField label="First Name (*)" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} placeholder="e.g. Aarav" />
                                                <InputField label="Last Name" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />

                                                <InputField label="Student Email (Login ID) (*)" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="student@email.com" />
                                                <InputField label="Student Mobile Number" value={formData.secondary_mobile} onChange={e => setFormData({ ...formData, secondary_mobile: e.target.value })} placeholder="10-digit number" maxLength="15" />

                                                <InputField label="Virtual ID" value={formData.virtual_id} readOnly={true} />
                                                <InputField label="Aadhar Number" value={formData.aadhar_number} onChange={e => setFormData({ ...formData, aadhar_number: e.target.value })} placeholder="12-digit number" />
                                                <InputField label="DOB (*)" type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                                                <SelectField label="Gender" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} options={["Male", "Female", "Other"]} />
                                                <SelectField label="Blood Group" value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })} options={["Select", "A+", "B+", "O+", "AB+", "A-", "B-"]} />
                                                <SelectField label="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} options={["General", "OBC", "SC/ST"]} />
                                                <InputField label="Place of Birth" value={formData.place_of_birth} onChange={e => setFormData({ ...formData, place_of_birth: e.target.value })} />
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <InputField label="Height" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} placeholder="e.g. 165cm" />
                                                    <InputField label="Weight" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g. 60kg" />
                                                </div>
                                                <SelectField label="Marital Status" value={formData.marital_status} onChange={e => setFormData({ ...formData, marital_status: e.target.value })} options={["No", "Yes", "Other"]} />
                                                {formData.marital_status === 'Yes' && <InputField label="Spouse Name" value={formData.spouse_name} onChange={e => setFormData({ ...formData, spouse_name: e.target.value })} />}
                                            </>}
                                            {formStep === 2 && <>
                                                <InputField label="Admission No (*)" value={formData.admission_number} onChange={e => setFormData({ ...formData, admission_number: e.target.value })} />
                                                <InputField label="Class" value={formData.student_class} onChange={e => setFormData({ ...formData, student_class: e.target.value })} placeholder="e.g. 10th" />
                                                <InputField label="Section" value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} />
                                                <InputField label="Roll Number" value={formData.roll_number} onChange={e => setFormData({ ...formData, roll_number: e.target.value })} />
                                                <InputField label="Date of Joining" type="date" value={formData.admission_date} onChange={e => setFormData({ ...formData, admission_date: e.target.value })} />
                                                <InputField label="Prev. School" value={formData.previous_school} onChange={e => setFormData({ ...formData, previous_school: e.target.value })} />
                                                <InputField label="Place ID" value={formData.place_id} onChange={e => setFormData({ ...formData, place_id: e.target.value })} />
                                                <InputField label="Service ID" value={formData.service_id} onChange={e => setFormData({ ...formData, service_id: e.target.value })} />
                                                <SelectField label="Registration Status" value={formData.registration_status} onChange={e => setFormData({ ...formData, registration_status: e.target.value })} options={["Registered", "Non-Registered", "Hibernation"]} />
                                                <SelectField label="User Group" value={formData.user_group} onChange={e => setFormData({ ...formData, user_group: e.target.value })} options={["Owner", "Management", "Service Provider", "Service Seekers", "Parents", "Guests", "Others"]} />
                                                <SelectField label="Account Status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} options={["Active", "Deactivated", "Hibernation", "Hidden"]} />
                                            </>}
                                            {formStep === 3 && <>
                                                <InputField label="Father's Name" value={formData.father_name} onChange={e => setFormData({ ...formData, father_name: e.target.value })} />
                                                <InputField label="Mother's Name" value={formData.mother_name} onChange={e => setFormData({ ...formData, mother_name: e.target.value })} />
                                                <InputField label="Parent's Mobile (Linking Number) (*)" value={formData.primary_mobile} onChange={e => setFormData({ ...formData, primary_mobile: e.target.value })} placeholder="Parent's Mobile Number" maxLength="15" />
                                                <InputField label="Parent's Email ID" type="email" value={formData.parent_email} onChange={e => setFormData({ ...formData, parent_email: e.target.value })} placeholder="parent@email.com" />
                                                <InputField label="Highest Qualification" value={formData.highest_qualification} onChange={e => setFormData({ ...formData, highest_qualification: e.target.value })} />
                                                <InputField label="Hobbies" value={formData.hobbies} onChange={e => setFormData({ ...formData, hobbies: e.target.value })} />
                                                <InputField label="Beliefs & Faiths" value={formData.beliefs} onChange={e => setFormData({ ...formData, beliefs: e.target.value })} />
                                                <InputField label="Experience" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                                                <div className="input-group full-width">
                                                    <label style={{ display: 'block', marginBottom: '5px', color: '#000', fontWeight: '800', fontSize: '0.85rem' }}>Current Address</label>
                                                    <textarea className="modern-input" rows="2" value={formData.current_address} onChange={e => setFormData({ ...formData, current_address: e.target.value })}></textarea>
                                                </div>
                                            </>}
                                            {formStep === 4 && <>
                                                <SelectField label="Transport Mode" value={formData.transport_mode} onChange={e => setFormData({ ...formData, transport_mode: e.target.value })} options={["Select", "School Bus", "Private", "Self"]} />
                                                <InputField label="Validity Start Date" type="date" value={formData.validity_start} onChange={e => setFormData({ ...formData, validity_start: e.target.value })} />
                                                <InputField label="Validity End Date" type="date" value={formData.validity_end} onChange={e => setFormData({ ...formData, validity_end: e.target.value })} />
                                                <InputField label="Student Photo" type="file" onChange={e => setFormData({ ...formData, photo: e.target.files[0] })} />
                                                <InputField label="Aadhar Scan" type="file" onChange={e => setFormData({ ...formData, aadhar_scan: e.target.files[0] })} />
                                                <InputField label="Marksheet Scan" type="file" onChange={e => setFormData({ ...formData, marksheet_scan: e.target.files[0] })} />
                                            </>}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                <div className="modal-footer">
                                    {formStep > 1 && <button className="btn-ghost" onClick={prevStep}>Back</button>}
                                    {formStep < 4 ? <button className="btn-primary-gradient" onClick={nextStep}>Next Step ➜</button> : <button className="btn-success-gradient" onClick={handleAddStudent}>{isEditing ? "Save Changes" : "Confirm Admission ✅"}</button>}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showPromoteModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content small-modal glass-modal">
                                <h2>🎓 Promote Class</h2>
                                <p className="subtitle">Move students to the next academic session.</p>
                                <div className="form-grid single-col" style={{ marginTop: '20px' }}>
                                    <InputField label="From Class" value={promoteData.fromClass} onChange={e => setPromoteData({ ...promoteData, fromClass: e.target.value })} />
                                    <InputField label="To Class" value={promoteData.toClass} onChange={e => setPromoteData({ ...promoteData, toClass: e.target.value })} />
                                </div>
                                <div className="modal-footer">
                                    <button className="btn-ghost" onClick={() => setShowPromoteModal(false)}>Cancel</button>
                                    <button className="btn-primary-gradient" onClick={handlePromoteSubmit}>Promote All</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showDetailModal && selectedStudent && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content profile-card glass-modal" onClick={e => e.stopPropagation()}>
                                <div className="profile-header-bg"></div>
                                <div className="profile-content">
                                    <div className="profile-avatar-lg">
                                        {selectedStudent.first_name ? selectedStudent.first_name[0] : 'S'}{(selectedStudent.last_name && selectedStudent.last_name[0]) || ''}
                                    </div>
                                    <h2>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                                    <span className="profile-badge">{selectedStudent.student_class} - {selectedStudent.section}</span>
                                    <div className="info-grid">
                                        <div className="info-item"><span>Adm No</span><p>{selectedStudent.admission_number}</p></div>
                                        <div className="info-item"><span>Roll No</span><p>{selectedStudent.roll_number || "--"}</p></div>
                                        <div className="info-item"><span>Mobile</span><p>{selectedStudent.primary_mobile}</p></div>
                                        <div className="info-item"><span>Login ID (Email)</span><p style={{ color: '#4f46e5', fontWeight: '800', wordBreak: 'break-all' }}>{selectedStudent.email || "Not Provided"}</p></div>
                                        <div className="info-item"><span>Status</span><p className={selectedStudent.fee_status?.toLowerCase() || 'pending'}>{selectedStudent.fee_status}</p></div>
                                    </div>
                                    <button className="btn-primary-gradient full-btn" onClick={handleEditProfile}>Edit Full Profile</button>
                                    {selectedStudent.email && (
                                        <button className="btn-ghost full-btn" style={{ marginTop: '10px', color: '#ef4444', borderColor: '#fecaca', background: '#fef2f2' }} onClick={() => toast.success(`Password reset requested for ${selectedStudent.first_name}`)}>
                                            Generate New Password
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <style>{`
        :root {
            --primary: #6366f1; --primary-dark: #4338ca; --secondary: #ec4899; --bg-body: #f1f5f9;
            --text-main: #020617; --text-muted: #475569;
        }

        html, body, #root { height: 100vh; width: 100vw; margin: 0; padding: 0; overflow-x: hidden; }
        
        .dashboard-container { display: flex; height: 100vh; width: 100vw; background: var(--bg-body); overflow: hidden; }

        .main-content { 
            flex: 1; padding: 30px 40px; margin-left: 280px; box-sizing: border-box; 
            height: 100dvh; overflow-y: auto !important; overflow-x: hidden;
            scroll-behavior: smooth; padding-bottom: 100px; width: 100%; max-width: 100vw;
        } 
        
        .main-content::-webkit-scrollbar { width: 8px; }
        .main-content::-webkit-scrollbar-track { background: #f8fafc; }
        .main-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .main-content::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .title-gradient { font-size: 2rem; font-weight: 800; background: linear-gradient(to right, #020617, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
        .subtitle { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; font-weight: 500; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .header-actions { display: flex; gap: 15px; align-items: center; }
        .btn-row { display: flex; gap: 10px; }
        .search-box { position: relative; display: flex; align-items: center; background: white; padding: 0 15px; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; transition: 0.3s; }
        .search-box:focus-within { border-color: var(--primary); box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2); }
        .search-box input { border: none; padding: 12px 10px; outline: none; font-size: 0.9rem; width: 200px; color: var(--text-main); }
        
        .btn-primary-glow { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 12px 24px; border-radius: 50px; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 8px 20px -5px rgba(99, 102, 241, 0.5); transition: 0.3s; white-space: nowrap; }
        .btn-primary-glow:hover { transform: translateY(-2px); box-shadow: 0 12px 25px -5px rgba(99, 102, 241, 0.6); }
        .btn-glass { background: white; color: var(--text-main); border: 1px solid #e2e8f0; padding: 12px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.03); transition: 0.2s; white-space: nowrap; }
        .btn-glass:hover { background: #f8fafc; transform: translateY(-1px); }
        .btn-primary-gradient { background: linear-gradient(to right, #4f46e5, #6366f1); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; flex: 1; }
        .btn-success-gradient { background: linear-gradient(to right, #10b981, #059669); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; flex: 1; }
        .btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-ghost:hover { background: #f1f5f9; color: var(--text-main); }
        .btn-secondary { background: white; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: 0.2s; color: var(--text-main); font-weight: 600; }
        .btn-secondary:hover:not(:disabled) { background: #f1f5f9; }

        .filters-row { display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap; }
        .filter-chip { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
        .filter-chip.active { background: #eff6ff; color: var(--primary); border-color: #bfdbfe; }
        .filter-chip:hover:not(.active) { background: white; border-color: #94a3b8; }
        .bulk-action-bar { background: #000; color: white; padding: 15px 25px; border-radius: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }

        .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 24px; box-shadow: 0 20px 40px -5px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.5); }
        
        .table-card { width: 100%; max-width: 100%; overflow: hidden; }
        .table-responsive-wrapper { width: 100%; overflow-x: auto !important; -webkit-overflow-scrolling: touch; display: block; }

        .modern-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .modern-table th { text-align: left; padding: 20px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #475569; font-weight: 800; border-bottom: 1px solid #e2e8f0; }
        .modern-table td { padding: 18px 20px; color: var(--text-main); font-weight: 500; font-size: 0.95rem; border-bottom: 1px solid #f8fafc; }
        .text-right { text-align: right; }
        .user-cell { display: flex; align-items: center; gap: 12px; }
        .avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; color: white; flex-shrink: 0; }
        .avatar-circle.blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
        .avatar-circle.pink { background: linear-gradient(135deg, #f472b6, #db2777); }
        .name-text { font-weight: 700; color: #0f172a; white-space: nowrap; }
        .sub-text { font-size: 0.8rem; color: #64748b; }
        .status-pill { padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
        .status-pill.paid { background: #dcfce7; color: #15803d; border: 1px solid #bcf0da; }
        .status-pill.pending { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
        .class-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #475569; border: 1px solid #e2e8f0; white-space: nowrap; }
        .icon-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; opacity: 0.6; transition: 0.2s; }
        .icon-btn:hover { opacity: 1; transform: scale(1.1); }
        .empty-state { text-align: center; padding: 40px; color: #94a3b8; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(5px); z-index: 999; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .modal-content { background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); position: relative; display: flex; flex-direction: column; max-width: 100%; }
        .large-modal { width: 900px; max-height: 90vh; }
        .small-modal { width: 400px; padding: 30px; }
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 30px 30px 10px 30px; }
        .modal-content h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
        .step-indicator { margin: 5px 0 0; color: #64748b; font-size: 0.9rem; }
        .close-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; cursor: pointer; color: #64748b; transition: 0.2s; }
        .close-btn:hover { background: #e2e8f0; color: #ef4444; transform: rotate(90deg); }

        .stepper-container { display: flex; justify-content: space-between; padding: 20px 50px; position: relative; margin-bottom: 20px; }
        .step-item { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; flex: 1; }
        .step-item .circle { width: 35px; height: 35px; background: #f1f5f9; color: #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: 0.3s; border: 2px solid #e2e8f0; }
        .step-item.active .circle { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
        .step-item .label { margin-top: 8px; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .step-item.active .label { color: var(--primary); }
        .step-item .line { position: absolute; top: 18px; left: 50%; width: 100%; height: 2px; background: #e2e8f0; z-index: -1; }
        .step-item.active .line { background: var(--primary); }
        .step-item:last-child .line { display: none; }

        .modal-body { flex: 1; padding: 0 40px; overflow-y: auto; overflow-x: hidden; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 30px; padding-bottom: 20px; }
        .form-grid.single-col { grid-template-columns: 1fr; }
        .full-width { grid-column: span 2; }
        
        .modern-input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #cbd5e1; background-color: #ffffff !important; color: #020617 !important; font-size: 0.95rem; font-weight: 500; transition: 0.2s; outline: none; box-sizing: border-box; }
        select.modern-input { background-color: #ffffff !important; color: #020617 !important; }
        .modern-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        
        .modal-footer { padding: 20px 40px; border-top: 1px solid #f1f5f9; display: flex; gap: 15px; background: white; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; flex-shrink: 0; }

        .profile-card { width: 400px; overflow: hidden; padding: 0; }
        .profile-header-bg { height: 100px; background: linear-gradient(135deg, #6366f1, #a855f7); }
        .profile-content { padding: 0 30px 30px; margin-top: -50px; text-align: center; }
        .profile-avatar-lg { width: 100px; height: 100px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: #4f46e5; border: 4px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .profile-badge { background: #eff6ff; color: #1e40af; padding: 5px 15px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }
        .info-grid { margin-top: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
        .info-item span { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 4px; }
        .info-item p { margin: 0; font-weight: 700; color: #0f172a; font-size: 0.95rem; }
        .full-btn { width: 100%; margin-top: 20px; }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 1024px) {
            .main-content { margin-left: 0; padding: 15px; padding-top: 90px; }
            .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
            .header-actions { flex-wrap: wrap; width: 100%; }
        }
        
        @media (max-width: 768px) {
            .main-content { max-width: 100vw; overflow-x: hidden; }
            .table-responsive-wrapper { max-width: calc(100vw - 30px); }
            .form-grid { grid-template-columns: 1fr; }
            .full-width { grid-column: span 1; }
            .large-modal { width: 95vw; height: 95vh; }
            .small-modal, .profile-card { width: 95vw; }
            .stepper-container { padding: 15px 0; overflow-x: auto; justify-content: flex-start; gap: 20px; }
            .step-item { flex: 0 0 auto; }
            .step-item .line { display: none; }
            .modal-header, .modal-body, .modal-footer { padding-left: 20px; padding-right: 20px; }
            .bulk-action-bar { flex-direction: column; gap: 15px; align-items: flex-start; }
            .search-box { width: 100%; }
            .search-box input { width: 100%; }
            .btn-row { width: 100%; display: flex; }
            .btn-row button { flex: 1; justify-content: center; }
        }
      `}</style>
        </div>
    );
}