import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import { toast, Toaster } from "react-hot-toast";

export default function Enrollments() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);

    // ✅ Super Admin Role Mock
    const isSuperAdmin = true;

    // UI States
    const [studentId, setStudentId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [className, setClassName] = useState("");

    // ✅ New Super Admin States
    const [status, setStatus] = useState("Active");
    const [feeStatus, setFeeStatus] = useState("Pending");
    const [selectedRows, setSelectedRows] = useState([]);

    // Edit Mode State
    const [editModeId, setEditModeId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourseFilter, setSelectedCourseFilter] = useState("All");

    // View Panel States
    const [showDetailPanel, setShowDetailPanel] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    // Delete Prompt States
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [enrollmentToDeleteId, setEnrollmentToDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const loadData = async () => {
        try {
            const [s, c, e] = await Promise.all([
                api.get("students/list/"),
                api.get("courses/courses/"),
                api.get("enrollments/")
            ]);
            setStudents(Array.isArray(s.data) ? s.data : s.data.results || []);
            setCourses(Array.isArray(c.data) ? c.data : c.data.results || []);
            setEnrollments(Array.isArray(e.data) ? e.data : e.data.results || []);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Database connection failed!");
        }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCourseFilter]);

    const classOptionsMapping = {
        "Foundation Level": ["PG (Play Group)", "Nursery", "LKG", "UKG"],
        "Preparatory Level": ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
        "Middle Level": ["Class 6", "Class 7", "Class 8"],
        "Secondary Level": ["Class 9", "Class 10"],
        "Higher Secondary": ["Class 11 (Arts)", "Class 11 (Commerce)", "Class 11 (Science)", "Class 12 (Arts)", "Class 12 (Commerce)", "Class 12 (Science)"]
    };

    const handleLevelChange = (e) => {
        setSelectedLevel(e.target.value);
        setClassName("");
    };

    const handleEnroll = async () => {
        if (!studentId || !courseId || !className) return toast.error("Select Student, Class and Course");

        const exists = enrollments.find(e => e.student === parseInt(studentId) && e.course === parseInt(courseId) && e.id !== editModeId);
        if (exists) return toast.error("Student already enrolled in this course!");

        setLoading(true);
        const payload = { student: studentId, course: courseId, class_name: className, status, fee_status: feeStatus };

        try {
            if (editModeId) {
                await api.put(`enrollments/${editModeId}/`, payload);
                toast.success("Enrollment Updated Successfully! ✨");
            } else {
                await api.post("enrollments/", payload);
                toast.success("Enrollment Successful! 🎉");
            }
            loadData();
            cancelEdit();
        } catch (err) {
            let errorMsg = editModeId ? "Update Failed" : "Enrollment Failed";
            if (err.response && err.response.data) {
                const data = err.response.data;
                const firstKey = Object.keys(data)[0];
                errorMsg = Array.isArray(data[firstKey]) ? `${firstKey}: ${data[firstKey][0]}` : `${firstKey}: ${data[firstKey]}`;
            }
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditModeId(null);
        setStudentId("");
        setCourseId("");
        setSelectedLevel("");
        setClassName("");
        setStatus("Active");
        setFeeStatus("Pending");
    };

    const handleEditClick = (enrollment) => {
        setEditModeId(enrollment.id);
        setStudentId(enrollment.student);
        setCourseId(enrollment.course);

        let foundLevel = "";
        if (enrollment.class_name) {
            for (const [level, classes] of Object.entries(classOptionsMapping)) {
                if (classes.includes(enrollment.class_name)) {
                    foundLevel = level;
                    break;
                }
            }
        }
        setSelectedLevel(foundLevel);
        setClassName(enrollment.class_name || "");
        setStatus(enrollment.status || "Active");
        setFeeStatus(enrollment.fee_status || "Pending");

        toast("Edit mode active. Update details on the left.", { icon: "✏️" });
    };

    const handleUnrollClick = (id) => {
        setEnrollmentToDeleteId(id);
        setShowDeletePrompt(true);
    };

    const confirmDelete = async () => {
        if (!enrollmentToDeleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`enrollments/${enrollmentToDeleteId}/`);
            toast.success("Enrollment Cancelled Successfully");
            loadData();
            setShowDetailPanel(false);
            setShowDeletePrompt(false);
            setSelectedRows(prev => prev.filter(id => id !== enrollmentToDeleteId));
        } catch (err) {
            toast.error("Failed to cancel enrollment");
        } finally {
            setDeleteLoading(false);
            setEnrollmentToDeleteId(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} enrollments?`)) return;

        const loadingToast = toast.loading("Deleting selected records...");
        try {
            await Promise.all(selectedRows.map(id => api.delete(`enrollments/${id}/`)));
            toast.success("Bulk delete successful", { id: loadingToast });
            setSelectedRows([]);
            loadData();
        } catch (err) {
            toast.error("Some records failed to delete", { id: loadingToast });
        }
    };

    const exportToCSV = () => {
        const headers = ["ID", "Student Name", "Class", "Course", "Status", "Fee Status", "Enroll Date"];
        const rows = filteredEnrollments.map(e => [
            e.id,
            e.student_name || `Student ${e.student}`,
            e.class_name || 'N/A',
            e.course_name,
            e.status || 'Active',
            e.fee_status || 'Pending',
            e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "enrollments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Exported to CSV");
    };

    const handleDownloadReceipt = (enrollment) => {
        if (!enrollment) return;
        toast.loading("Generating Receipt...");

        setTimeout(() => {
            toast.dismiss();
            const receiptContent = `
RECEIPT - SHIVADDA PLATFORM
---------------------------
Transaction ID: TXN-${enrollment.id}${Date.now().toString().slice(-4)}
Date: ${new Date().toDateString()}

Student Details:
Name: ${enrollment.student_name || 'N/A'}
Student ID: ${enrollment.student}

Course Details:
Class/Level: ${enrollment.class_name || 'N/A'} 
Course: ${enrollment.course_name}
Enrollment Date: ${new Date(enrollment.enrolled_at || Date.now()).toDateString()}

Status: ${enrollment.fee_status || 'Paid'} 
---------------------------
Thank you for learning with us!
          `;

            const element = document.createElement("a");
            const file = new Blob([receiptContent], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = `Receipt_${(enrollment.student_name || 'Student').replace(/\s+/g, '_')}_${enrollment.id}.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            toast.success("Receipt Downloaded! 📄");
        }, 1500);
    };

    const handleView = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowDetailPanel(true);
    };

    const filteredEnrollments = enrollments.filter(e => {
        const searchLower = searchTerm.toLowerCase().trim();
        const sName = e.student_name ? e.student_name.toLowerCase() : "";
        const sId = e.student ? e.student.toString() : "";
        const matchesSearch = sName.includes(searchLower) || sId.includes(searchLower);
        const matchesFilter = selectedCourseFilter === "All" || e.course_name === selectedCourseFilter;
        return matchesSearch && matchesFilter;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEnrollments = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / itemsPerPage));

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(currentEnrollments.map(en => en.id));
        } else {
            setSelectedRows([]);
        }
    };

    const toggleRowSelect = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const getStatusColor = (stat) => {
        switch (stat?.toLowerCase()) {
            case 'active': return { bg: '#dcfce7', color: '#16a34a' };
            case 'completed': return { bg: '#e0e7ff', color: '#4f46e5' };
            case 'suspended': return { bg: '#fee2e2', color: '#dc2626' };
            case 'cancelled': return { bg: '#f1f5f9', color: '#64748b' };
            default: return { bg: '#dcfce7', color: '#16a34a' };
        }
    };

    return (
        <div className="enrollment-page-wrapper">

            <SidebarModern />
            <Toaster position="top-right" />

            <div className="enrollment-main-content" style={{ filter: showDeletePrompt ? 'blur(4px)' : 'none' }}>

                <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>Enrollment Hub</h1>
                        <p style={{ color: '#64748b', marginTop: '5px' }}>Manage student admissions & records.</p>
                    </div>

                    {/* ✅ FIX 2: Search Box aur Button ab ek line me (flex-wrap: nowrap) aur exactly side-by-side rahenge */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span style={{ cursor: 'pointer' }}>🔍</span>
                        </div>
                        {isSuperAdmin && (
                            <button onClick={exportToCSV} className="btn-secondary" style={{ padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #cbd5e1', background: 'white', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>
                                📥 Export CSV
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-container">

                    <div className="card-glass form-card">
                        <h3 className="section-title">{editModeId ? "Edit Admission ✏️" : "New Admission"}</h3>

                        <div className="input-group">
                            <label>SELECT STUDENT</label>
                            <select className="modern-input" value={studentId} onChange={e => setStudentId(e.target.value)}>
                                <option value="" style={{ color: '#000' }}>-- Choose Student --</option>
                                {students.map(s => <option key={s.id} value={s.id} style={{ color: '#000' }}>{s.first_name || s.name || s.username} (ID: {s.id})</option>)}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>SELECT LEVEL</label>
                            <select className="modern-input" value={selectedLevel} onChange={handleLevelChange}>
                                <option value="" style={{ color: '#000' }}>-- Choose Level --</option>
                                {Object.keys(classOptionsMapping).map(level => (
                                    <option key={level} value={level} style={{ color: '#000' }}>{level}</option>
                                ))}
                            </select>
                        </div>

                        {selectedLevel === "Foundation Level" && (
                            <div className="input-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                <label style={{ color: '#3b82f6' }}>SELECT FOUNDATION CLASS</label>
                                <select className="modern-input" style={{ borderLeft: '4px solid #3b82f6' }} value={className} onChange={e => setClassName(e.target.value)}>
                                    <option value="" style={{ color: '#000' }}>-- Choose Class --</option>
                                    {classOptionsMapping["Foundation Level"].map(cls => (
                                        <option key={cls} value={cls} style={{ color: '#000' }}>{cls}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedLevel === "Preparatory Level" && (
                            <div className="input-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                <label style={{ color: '#10b981' }}>SELECT PREPARATORY CLASS</label>
                                <select className="modern-input" style={{ borderLeft: '4px solid #10b981' }} value={className} onChange={e => setClassName(e.target.value)}>
                                    <option value="" style={{ color: '#000' }}>-- Choose Class --</option>
                                    {classOptionsMapping["Preparatory Level"].map(cls => (
                                        <option key={cls} value={cls} style={{ color: '#000' }}>{cls}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedLevel === "Middle Level" && (
                            <div className="input-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                <label style={{ color: '#f59e0b' }}>SELECT MIDDLE CLASS</label>
                                <select className="modern-input" style={{ borderLeft: '4px solid #f59e0b' }} value={className} onChange={e => setClassName(e.target.value)}>
                                    <option value="" style={{ color: '#000' }}>-- Choose Class --</option>
                                    {classOptionsMapping["Middle Level"].map(cls => (
                                        <option key={cls} value={cls} style={{ color: '#000' }}>{cls}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedLevel === "Secondary Level" && (
                            <div className="input-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                <label style={{ color: '#ec4899' }}>SELECT SECONDARY CLASS</label>
                                <select className="modern-input" style={{ borderLeft: '4px solid #ec4899' }} value={className} onChange={e => setClassName(e.target.value)}>
                                    <option value="" style={{ color: '#000' }}>-- Choose Class --</option>
                                    {classOptionsMapping["Secondary Level"].map(cls => (
                                        <option key={cls} value={cls} style={{ color: '#000' }}>{cls}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedLevel === "Higher Secondary" && (
                            <div className="input-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                <label style={{ color: '#8b5cf6' }}>SELECT HIGHER SECONDARY CLASS</label>
                                <select className="modern-input" style={{ borderLeft: '4px solid #8b5cf6' }} value={className} onChange={e => setClassName(e.target.value)}>
                                    <option value="" style={{ color: '#000' }}>-- Choose Class --</option>
                                    {classOptionsMapping["Higher Secondary"].map(cls => (
                                        <option key={cls} value={cls} style={{ color: '#000' }}>{cls}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="input-group">
                            <label>TARGET COURSE</label>
                            <select className="modern-input" value={courseId} onChange={e => setCourseId(e.target.value)}>
                                <option value="" style={{ color: '#000' }}>-- Choose Course --</option>
                                {courses.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>{c.name || `Course ${c.id}`}</option>)}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>ADMISSION STATUS</label>
                            <select className="modern-input" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="Active" style={{ color: '#000' }}>Active</option>
                                <option value="Completed" style={{ color: '#000' }}>Completed</option>
                                <option value="Suspended" style={{ color: '#000' }}>Suspended</option>
                                <option value="Cancelled" style={{ color: '#000' }}>Cancelled</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>FEE STATUS</label>
                            <select className="modern-input" value={feeStatus} onChange={e => setFeeStatus(e.target.value)}>
                                <option value="Pending" style={{ color: '#000' }}>Pending</option>
                                <option value="Paid" style={{ color: '#000' }}>Paid</option>
                                <option value="Installment" style={{ color: '#000' }}>Installment</option>
                            </select>
                        </div>

                        <button onClick={handleEnroll} disabled={loading} className="btn-primary" style={{ marginTop: '10px' }}>
                            {loading ? "Processing..." : editModeId ? "Update Enrollment ➜" : "Confirm Enrollment ➜"}
                        </button>
                        {editModeId && (
                            <button onClick={cancelEdit} disabled={loading} className="btn-secondary" style={{ marginTop: '10px', width: '100%', padding: '12px', borderRadius: '14px', cursor: 'pointer', border: '1px solid #cbd5e1', background: 'transparent', fontWeight: '700', color: '#64748b' }}>
                                Cancel Edit ✖
                            </button>
                        )}
                    </div>

                    <div className="card-glass table-card">
                        <div className="table-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <h3 style={{ margin: 0 }}>Active Enrollments</h3>
                                {isSuperAdmin && selectedRows.length > 0 && (
                                    <button onClick={handleBulkDelete} className="btn-icon delete" style={{ width: 'auto', padding: '0 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                                        🗑️ Delete Selected ({selectedRows.length})
                                    </button>
                                )}
                            </div>

                            <select
                                value={selectedCourseFilter}
                                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="All" style={{ color: '#000' }}>All Courses</option>
                                {courses.map(c => <option key={c.id} value={c.name} style={{ color: '#000' }}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="table-wrapper">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        {isSuperAdmin && (
                                            <th style={{ width: '30px', paddingRight: '0' }}>
                                                <input
                                                    type="checkbox"
                                                    onChange={toggleSelectAll}
                                                    checked={selectedRows.length === currentEnrollments.length && currentEnrollments.length > 0}
                                                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                />
                                            </th>
                                        )}
                                        <th style={{ width: '60px' }}>S.NO</th>
                                        <th>STUDENT INFO</th>
                                        <th>CLASS</th>
                                        <th>COURSE</th>
                                        <th>STATUS & FEE</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEnrollments.map((e, index) => {
                                        const currentStatusColor = getStatusColor(e.status);
                                        return (
                                            <tr key={e.id} style={{ background: editModeId === e.id ? '#fef9c3' : (selectedRows.includes(e.id) ? '#f1f5f9' : 'transparent') }}>

                                                {isSuperAdmin && (
                                                    <td style={{ paddingRight: '0' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.includes(e.id)}
                                                            onChange={() => toggleRowSelect(e.id)}
                                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                        />
                                                    </td>
                                                )}

                                                <td style={{ fontWeight: '800', color: '#94a3b8', paddingLeft: '15px' }}>
                                                    #{indexOfFirstItem + index + 1}
                                                </td>
                                                <td>
                                                    <div className="student-cell">
                                                        <div className="avatar-circle">{e.student_name ? e.student_name[0].toUpperCase() : 'S'}</div>
                                                        <div>
                                                            <div className="s-name">{e.student_name || `Student ${e.student}`}</div>
                                                            <div className="s-id">ID: {e.student}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td style={{ fontWeight: '700', color: '#475569' }}>{e.class_name || 'N/A'}</td>

                                                <td><span className="badge-course">{e.course_name}</span></td>

                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                                                        <span className="badge-active" style={{ background: currentStatusColor.bg, color: currentStatusColor.color }}>
                                                            ● {(e.status || 'ACTIVE').toUpperCase()}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: e.fee_status === 'Paid' ? '#16a34a' : (e.fee_status === 'Pending' ? '#dc2626' : '#f59e0b') }}>
                                                            ₹ {e.fee_status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button onClick={() => handleView(e)} className="btn-icon view" title="View Details">👁️</button>
                                                        <button onClick={() => handleEditClick(e)} className="btn-icon edit" title="Edit Enrollment">✏️</button>
                                                        <button onClick={() => handleUnrollClick(e.id)} className="btn-icon delete" title="Remove">🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {filteredEnrollments.length === 0 && <div className="empty-state">No records found.</div>}
                        </div>

                        <div className="pagination-container">
                            <button
                                className="btn-page"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                ◀ Prev
                            </button>
                            <span className="page-info">Page <b>{currentPage}</b> of {totalPages}</span>
                            <button
                                className="btn-page"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next ▶
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`detail-panel-overlay ${showDetailPanel ? 'open' : ''}`} onClick={() => setShowDetailPanel(false)}>
                <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                    {selectedEnrollment && (
                        <>
                            <div className="panel-header">
                                <h2>Student Profile</h2>
                                <button onClick={() => setShowDetailPanel(false)} className="close-btn">✕</button>
                            </div>
                            <div className="panel-body">
                                <div className="profile-section">
                                    <div className="large-avatar">
                                        {selectedEnrollment.student_name ? selectedEnrollment.student_name[0].toUpperCase() : 'S'}
                                    </div>
                                    <h3>{selectedEnrollment.student_name || "Unknown Student"}</h3>
                                    <span className="id-badge">Student ID: {selectedEnrollment.student}</span>
                                </div>
                                <div className="info-grid">
                                    <div className="info-item"><label>Class / Level</label><div className="info-val" style={{ color: '#0f172a' }}>{selectedEnrollment.class_name || 'N/A'}</div></div>
                                    <div className="info-item"><label>Enrolled Course</label><div className="info-val highlight">{selectedEnrollment.course_name}</div></div>
                                    <div className="info-item"><label>Enrollment Date</label><div className="info-val">{selectedEnrollment.enrolled_at ? new Date(selectedEnrollment.enrolled_at).toDateString() : new Date().toDateString()}</div></div>
                                    <div className="info-item">
                                        <label>Current Status</label>
                                        <div className="info-val" style={{ color: getStatusColor(selectedEnrollment.status).color }}>
                                            ● {selectedEnrollment.status || 'Active'}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Fee Status</label>
                                        <div className="info-val">{selectedEnrollment.fee_status || 'Pending'}</div>
                                    </div>
                                </div>
                                <div className="panel-footer">
                                    <button onClick={() => handleDownloadReceipt(selectedEnrollment)} className="btn-full-width secondary">Download Receipt 📄</button>
                                    <button onClick={() => handleUnrollClick(selectedEnrollment.id)} className="btn-full-width danger">Cancel Enrollment</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showDeletePrompt && (
                <div className="prompt-overlay">
                    <div className="prompt-card bounce-in">
                        <div className="prompt-icon">⚠️</div>
                        <h2>Are you sure?</h2>
                        <p>Do you really want to cancel this student's enrollment? This process cannot be undone.</p>
                        <div className="prompt-actions">
                            <button className="btn-prompt cancel" onClick={() => setShowDeletePrompt(false)} disabled={deleteLoading}>No, Keep it</button>
                            <button className="btn-prompt confirm" onClick={confirmDelete} disabled={deleteLoading}>
                                {deleteLoading ? "Deleting..." : "Yes, Cancel Enrollment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
    /* ✅ REWRITTEN CORE LAYOUT TO FIX SCROLLING & CUT-OFF BUGS */
    .enrollment-page-wrapper { display: flex; background: #f8fafc; min-height: 100vh; width: 100%; box-sizing: border-box; }
    .gradient-text { background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card-glass { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; box-sizing: border-box; }
    
    /* ✅ FIX 1: TOP PADDING REDUCED TO MOVE HEADING UP */
    .enrollment-main-content { 
        flex: 1; 
        padding: 20px 40px 40px 40px; /* Top padding was 40px, now 20px */
        margin-left: 280px; 
        transition: 0.3s; 
        box-sizing: border-box; 
        width: calc(100% - 280px); 
        height: 100vh; 
        display: flex; 
        flex-direction: column; 
    }
    
    .flex-container { 
        display: flex; 
        gap: 30px; 
        align-items: flex-start; 
        flex: 1; 
        min-height: 0; 
    }
    .page-header { margin-bottom: 25px; flex-shrink: 0; }
    
    .search-box { position: relative; width: 100%; max-width: 300px; }
    .search-box input { padding: 12px 20px 12px 45px; border-radius: 30px; border: 1px solid #e2e8f0; width: 100%; outline: none; transition: 0.3s; box-sizing: border-box; }
    .search-box input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .search-box span { position: absolute; left: 15px; top: 12px; opacity: 0.5; }
    
    /* ✅ Desktop Form Card: Perfectly Scrolling */
    .form-card { 
        flex: 0 0 350px; 
        height: 100%; 
        overflow-y: auto; 
        padding-bottom: 30px; 
    }
    .form-card::-webkit-scrollbar { width: 5px; }
    .form-card::-webkit-scrollbar-track { background: transparent; }
    .form-card::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

    /* ✅ Desktop Table Card */
    .table-card { 
        flex: 1; 
        min-width: 0; 
        height: 100%; 
        display: flex; 
        flex-direction: column; 
    }
    .table-wrapper { 
        width: 100%; 
        flex: 1; 
        overflow-y: auto; 
        overflow-x: auto; 
        -webkit-overflow-scrolling: touch; 
        padding-bottom: 10px; 
    }
    
    /* Custom Scrollbar for Table */
    .table-wrapper::-webkit-scrollbar { width: 5px; height: 5px; }
    .table-wrapper::-webkit-scrollbar-track { background: transparent; }
    .table-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

    .modern-table { width: 100%; border-collapse: collapse; min-width: 700px; }
    
    /* General Styling */
    .section-title { margin-bottom: 20px; border-left: 4px solid #3b82f6; padding-left: 15px; color: #1e293b; font-weight: 800; }
    .input-group { margin-bottom: 20px; }
    .input-group label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase; }
    .modern-input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; font-size: 0.95rem; background: #f8fafc; color: #1e293b !important; box-sizing: border-box;}
    .modern-input:focus { border-color: #3b82f6; background: white; }
    .btn-primary { width: 100%; padding: 14px; background: #0f172a; color: white; border: none; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.3s; box-sizing: border-box; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(15, 23, 42, 0.2); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; flex-shrink: 0; }
    .filter-select { padding: 8px 15px; border-radius: 10px; border: 1px solid #e2e8f0; cursor: pointer; outline: none; color: #1e293b; background: white; }
    
    .modern-table th { text-align: left; color: #94a3b8; font-size: 0.75rem; padding: 15px; border-bottom: 2px solid #f1f5f9; letter-spacing: 0.5px; white-space: nowrap; }
    .modern-table td { padding: 15px; border-bottom: 1px solid #f8fafc; vertical-align: middle; white-space: nowrap; transition: 0.3s;}
    .modern-table tr:hover { background: #fcfdfe; }
    .student-cell { display: flex; align-items: center; gap: 12px; }
    .avatar-circle { width: 35px; height: 35px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;}
    .s-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; white-space: nowrap; }
    .s-id { font-size: 0.75rem; color: #94a3b8; }
    .badge-course { background: #eff6ff; color: #3b82f6; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; white-space: nowrap; }
    .badge-active { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; white-space: nowrap; display: inline-block; }
    .action-buttons { display: flex; gap: 8px; }
    .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-size: 1rem; }
    .btn-icon.view { background: #f1f5f9; color: #3b82f6; }
    .btn-icon.view:hover { background: #3b82f6; color: white; }
    .btn-icon.edit { background: #fffbeb; color: #f59e0b; }
    .btn-icon.edit:hover { background: #f59e0b; color: white; }
    .btn-icon.delete { background: #fff1f2; color: #ef4444; }
    .btn-icon.delete:hover { background: #ef4444; color: white; }
    .empty-state { text-align: center; padding: 40px; color: #94a3b8; }
    
    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; flex-shrink: 0; }
    .btn-page { padding: 8px 16px; border: 1px solid #e2e8f0; background: white; color: #3b82f6; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; font-size: 0.85rem; }
    .btn-page:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
    .btn-page:disabled { opacity: 0.5; cursor: not-allowed; color: #94a3b8; background: #f1f5f9; border-color: transparent; }
    .page-info { font-size: 0.9rem; color: #64748b; }
    .page-info b { color: #0f172a; }
    
    /* Modal & Prompt Styles */
    .detail-panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 2000; opacity: 0; pointer-events: none; transition: 0.3s; }
    .detail-panel-overlay.open { opacity: 1; pointer-events: auto; }
    .detail-panel { position: absolute; top: 0; right: 0; width: 400px; height: 100%; background: white; box-shadow: -10px 0 30px rgba(0,0,0,0.1); transform: translateX(100%); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; z-index: 2001; }
    .detail-panel-overlay.open .detail-panel { transform: translateX(0); }
    @media (max-width: 480px) { .detail-panel { width: 100%; } }
    .panel-header { padding: 25px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .panel-header h2 { margin: 0; font-size: 1.2rem; color: #0f172a; font-weight: 800; }
    .close-btn { background: #f1f5f9; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: #64748b; font-weight: 700; }
    .close-btn:hover { background: #e2e8f0; color: #0f172a; }
    .panel-body { padding: 30px; overflow-y: auto; flex: 1; }
    .profile-section { text-align: center; margin-bottom: 30px; }
    .large-avatar { width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; margin: 0 auto 15px; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
    .profile-section h3 { margin: 0 0 5px; color: #0f172a; font-size: 1.4rem; }
    .id-badge { background: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .info-grid { display: grid; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 30px; }
    .info-item label { display: block; font-size: 0.75rem; color: #94a3b8; font-weight: 700; margin-bottom: 5px; text-transform: uppercase; }
    .info-val { font-size: 1rem; color: #334155; font-weight: 600; }
    .info-val.highlight { color: #3b82f6; }
    .info-val.active-text { color: #16a34a; }
    .panel-footer { display: flex; flex-direction: column; gap: 10px; margin-top: auto; }
    .btn-full-width { width: 100%; padding: 12px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; box-sizing: border-box; }
    .btn-full-width.secondary { background: #e2e8f0; color: #475569; }
    .btn-full-width.secondary:hover { background: #cbd5e1; }
    .btn-full-width.danger { background: #fee2e2; color: #dc2626; }
    .btn-full-width.danger:hover { background: #fca5a5; color: white; }
    .prompt-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(5px); z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
    .prompt-card { background: white; padding: 30px; border-radius: 24px; width: 400px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 100%; }
    .prompt-icon { font-size: 3rem; margin-bottom: 15px; }
    .prompt-card h2 { margin: 0 0 10px; color: #0f172a; font-weight: 800; }
    .prompt-card p { color: #64748b; margin-bottom: 25px; line-height: 1.5; }
    .prompt-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-prompt { flex: 1; padding: 12px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; min-width: 120px; }
    .btn-prompt.cancel { background: #e2e8f0; color: #475569; }
    .btn-prompt.cancel:hover { background: #cbd5e1; }
    .btn-prompt.confirm { background: #dc2626; color: white; }
    .btn-prompt.confirm:hover { background: #b91c1c; }
    .btn-prompt:disabled { opacity: 0.7; cursor: not-allowed; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounceIn { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
    .bounce-in { animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    
    /* ✅ RESPONSIVE QUERIES */
    @media (max-width: 1024px) {
        .enrollment-main-content { 
            margin-left: 0 !important; 
            width: 100%; 
            max-width: 100vw; 
            padding: 80px 20px 40px 20px !important; /* Mobile me sidebar toggle ke liye jagah chahiye */
            height: auto; 
            display: block; 
        }
        .flex-container { flex-direction: column; gap: 25px; display: flex; }
        .form-card { height: auto; width: 100%; max-width: 100%; }
        .table-card { height: auto; width: 100%; }
        .page-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
        .search-box { width: 100%; max-width: 100%; }
    }
    
    @media (max-width: 850px) {
        html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: auto !important; overflow-x: hidden !important; }
        .enrollment-page-wrapper { display: flex; flex-direction: column; height: auto !important; min-height: 100vh !important; overflow: visible !important; }
        .enrollment-main-content { 
            margin-left: 0 !important; 
            padding: 90px 15px 100px 15px !important; 
            width: 100%; 
            max-width: 100vw; 
            height: auto !important; 
            min-height: 100vh !important; 
            display: block !important; 
            overflow: visible !important; 
        }
        .table-card { padding: 15px !important; border-radius: 12px; }
        .table-header { flex-direction: column; align-items: flex-start; gap: 10px; }
        .filter-select { width: 100%; }
        .action-buttons { flex-wrap: wrap; }
    }
`}</style>
        </div>
    );
}