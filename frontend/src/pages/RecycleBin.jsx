import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import {
    Trash2, RefreshCw, AlertTriangle,
    Database, Clock, ShieldCheck, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecycleBin() {
    const [trashItems, setTrashItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState(null);

    useEffect(() => {
        fetchTrashItems();
    }, []);

    const fetchTrashItems = async () => {
        try {
            const res = await api.get('/services/recycle-bin/');
            setTrashItems(res.data);
        } catch (err) {
            toast.error("Failed to load Recycle Bin data");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id, name) => {
        if (!window.confirm(`Are you sure you want to restore "${name}"?`)) return;

        setRestoringId(id);
        const loadToast = toast.loading(`Restoring ${name}...`);

        try {
            await api.post(`/services/recycle-bin/${id}/restore/`);
            toast.success(`${name} Restored Successfully! ♻️`, { id: loadToast });
            fetchTrashItems(); // Table refresh karo
        } catch (err) {
            toast.error("Failed to restore item.", { id: loadToast });
        } finally {
            setRestoringId(null);
        }
    };

    // Date Format Helper
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', marginLeft: '280px' }}>
                <Loader2 size={40} className="spin" color="#ef4444" />
            </div>
        );
    }

    return (
        <div className="recycle-wrapper">
            <SidebarModern />
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#0f172a', color: '#fff' } }} />

            <div className="service-main-content hide-scrollbar">
                {/* Background Blobs (Red theme for trash) */}
                <div className="bg-blob blob-1" />
                <div className="bg-blob blob-2" />

                {/* --- HEADER --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '35px', position: 'relative', zIndex: 2 }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin: '0 0 5px 0' }}>
                            Recycle Bin <span style={{ fontSize: '2rem', verticalAlign: 'middle' }}>🗑️</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: '500', margin: 0 }}>Restore accidentally deleted records easily.</p>
                    </div>

                    <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <AlertTriangle size={20} />
                        {trashItems.length} Items in Trash
                    </div>
                </div>

                {/* --- TRASH TABLE --- */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="table-card glass-card" style={{ position: 'relative', zIndex: 2 }}
                >
                    {trashItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                            <ShieldCheck size={60} style={{ marginBottom: '15px', opacity: 0.5, margin: '0 auto', color: '#10b981' }} />
                            <h3 style={{ color: '#1e293b', fontSize: '1.2rem', marginBottom: '5px' }}>Trash is Empty</h3>
                            <p>No deleted records found. Your database is clean!</p>
                        </div>
                    ) : (
                        <div className="table-responsive-wrapper hide-scrollbar">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '15%' }}><Database size={16} style={{ display: 'inline', verticalAlign: 'bottom', marginRight: '5px' }} /> Module</th>
                                        <th style={{ width: '35%' }}>Deleted Record</th>
                                        <th style={{ width: '20%' }}>Deleted By</th>
                                        <th style={{ width: '20%' }}><Clock size={16} style={{ display: 'inline', verticalAlign: 'bottom', marginRight: '5px' }} /> Time</th>
                                        <th style={{ width: '10%', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {trashItems.map((item, idx) => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, background: '#dcfce7' }} transition={{ delay: idx * 0.05 }}
                                                className="table-row-hover"
                                            >
                                                <td>
                                                    <span className="badge-module">{item.original_model_name}</span>
                                                </td>
                                                <td style={{ fontWeight: '800', color: '#1e293b' }}>{item.object_repr}</td>
                                                <td style={{ fontWeight: '600', color: '#64748b' }}>{item.deleted_by}</td>
                                                <td style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{formatDate(item.deleted_at)}</td>

                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleRestore(item.id, item.object_repr)}
                                                        className="action-btn-restore"
                                                        title="Restore Data"
                                                        disabled={restoringId === item.id}
                                                    >
                                                        {restoringId === item.id ? <Loader2 size={18} className="spin" /> : <><RefreshCw size={16} /> Restore</>}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* --- RESPONSIVE STYLES --- */}
            <style>{`
                html, body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #f8fafc; }
                *, *::before, *::after { box-sizing: border-box; }
                
                .recycle-wrapper { display: flex; width: 100%; height: 100vh; font-family: 'Inter', sans-serif; position: relative; overflow: hidden; }
                
                .service-main-content { 
                    margin-left: 280px; 
                    padding: 40px; 
                    padding-bottom: 120px !important; 
                    height: 100vh; 
                    overflow-y: auto; 
                    overflow-x: hidden; 
                    width: calc(100% - 280px); 
                    position: relative; 
                    z-index: 1; 
                }
                
                .bg-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
                .blob-1 { top: -20%; left: 20%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(239,68,68,0.08) 0%, rgba(0,0,0,0) 70%); }
                .blob-2 { bottom: -10%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, rgba(0,0,0,0) 70%); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .glass-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 15px 35px -10px rgba(0,0,0,0.05); overflow: hidden; width: 100%; }
                
                .table-responsive-wrapper { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }
                .modern-table { width: 100%; border-collapse: collapse; min-width: 700px; }
                .modern-table th { background: #f8fafc; padding: 18px 20px; text-align: left; color: #64748b; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; white-space: nowrap;}
                .modern-table td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                .table-row-hover { transition: 0.2s; }
                .table-row-hover:hover { background: #f8fafc; }
                
                .badge-module { background: #e0e7ff; color: #4f46e5; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;}
                
                .action-btn-restore { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; cursor: pointer; transition: 0.3s; font-size: 0.85rem; }
                .action-btn-restore:hover:not(:disabled) { background: #059669; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(16,185,129,0.3); }
                .action-btn-restore:disabled { opacity: 0.7; cursor: not-allowed; }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                @media (max-width: 1024px) { 
                    .service-main-content { 
                        margin-left: 0; 
                        width: 100%; 
                        padding: 20px;
                        padding-top: 85px !important;
                    } 
                }
            `}</style>
        </div>
    );
}