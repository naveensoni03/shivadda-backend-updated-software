import React, { useState, useEffect } from "react";
import SidebarParent from "../../components/SidebarParent";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MailOpen, Star, AlertCircle, Clock, Search, MessageSquare, X, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ParentCommunication() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Inbox");
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Dummy Messages Data
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "Principal's Office",
            role: "Management",
            subject: "Important: Revised Timetable for Final Exams",
            snippet: "Dear Parents, please find attached the revised timetable for the upcoming...",
            fullMessage: "Dear Parents, \n\nPlease be informed that the timetable for the Final Exams starting from April 1st, 2026, has been slightly revised due to the upcoming state elections. \n\nKindly check the 'Exam Results & Marks' section for the updated schedule. Ensure your child reaches school by 7:30 AM on exam days.\n\nRegards,\nPrincipal's Office",
            date: "24 Mar 2026",
            isUnread: true,
            isImportant: true,
            type: "Notice"
        },
        {
            id: 2,
            sender: "Mrs. Sharma",
            role: "Class Teacher (10th-A)",
            subject: "Ashok's Performance in Science Practical",
            snippet: "I wanted to update you regarding Ashok's excellent project submission...",
            fullMessage: "Hello,\n\nI am writing this to appreciate Ashok's recent Science project on Renewable Energy. His presentation was outstanding and he scored the highest in the class.\n\nKeep encouraging him!\n\nBest Regards,\nMrs. Sharma",
            date: "22 Mar 2026",
            isUnread: false,
            isImportant: false,
            type: "Direct"
        },
        {
            id: 3,
            sender: "Accounts Department",
            role: "Admin",
            subject: "Fee Payment Acknowledgment",
            snippet: "We have received your fee payment of Rs. 4500 for the month of...",
            fullMessage: "Dear Parent,\n\nWe successfully received your online payment of Rs. 4,500 towards the tuition fee for the month of April 2026.\n\nYou can download the official receipt from the 'Fees & Account Ledger' section in your portal.\n\nThank you.",
            date: "20 Mar 2026",
            isUnread: false,
            isImportant: false,
            type: "Update"
        }
    ]);

    useEffect(() => {
        setTimeout(() => setLoading(false), 600);
    }, []);

    // Filter messages based on tab
    const filteredMessages = messages.filter(msg => {
        if (activeTab === "Inbox") return true;
        if (activeTab === "Unread") return msg.isUnread;
        if (activeTab === "Important") return msg.isImportant;
        return true;
    });

    const openMessage = (msg) => {
        setSelectedMessage(msg);
        // Mark as read
        if (msg.isUnread) {
            setMessages(messages.map(m => m.id === msg.id ? { ...m, isUnread: false } : m));
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

    return (
        <div style={{ display: "flex", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
            <SidebarParent />
            <Toaster position="top-center" />

            <div className="main-content hide-scrollbar">
                <div className="dashboard-top-nav">
                    <div className="search-placeholder">
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}><Search size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Search messages...</span>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-hero">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
                        Communication <span className="text-gradient">Hub</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
                        Stay connected with teachers and school administration.
                    </p>
                </motion.div>

                {/* Mailbox Layout */}
                <div className="mailbox-container premium-shadow">

                    {/* Sidebar / Tabs */}
                    <div className="mail-sidebar">
                        <button className="compose-btn" onClick={() => toast("New Message feature will connect to backend soon!", { icon: '✍️' })}>
                            <MessageSquare size={18} /> Compose
                        </button>

                        <div className="mail-nav">
                            <button className={`nav-item ${activeTab === 'Inbox' ? 'active' : ''}`} onClick={() => setActiveTab('Inbox')}>
                                <Mail size={18} /> All Messages
                            </button>
                            <button className={`nav-item ${activeTab === 'Unread' ? 'active' : ''}`} onClick={() => setActiveTab('Unread')}>
                                <MailOpen size={18} /> Unread
                                {messages.filter(m => m.isUnread).length > 0 && (
                                    <span className="badge">{messages.filter(m => m.isUnread).length}</span>
                                )}
                            </button>
                            <button className={`nav-item ${activeTab === 'Important' ? 'active' : ''}`} onClick={() => setActiveTab('Important')}>
                                <AlertCircle size={18} /> Important
                            </button>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="mail-list-section">
                        <div className="mail-header">
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>{activeTab}</h3>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '50px' }}><div className="loader spin"></div></div>
                        ) : (
                            <motion.div variants={containerVariants} initial="hidden" animate="show" className="message-list">
                                {filteredMessages.length === 0 ? (
                                    <div className="empty-state">No messages found in {activeTab}.</div>
                                ) : (
                                    filteredMessages.map((msg) => (
                                        <motion.div
                                            variants={itemVariants}
                                            key={msg.id}
                                            className={`message-card ${msg.isUnread ? 'unread' : ''}`}
                                            onClick={() => openMessage(msg)}
                                        >
                                            <div className="msg-avatar">{msg.sender.charAt(0)}</div>
                                            <div className="msg-content">
                                                <div className="msg-top">
                                                    <h4 className="msg-sender">{msg.sender} <span className="msg-role">({msg.role})</span></h4>
                                                    <span className="msg-date">{msg.date}</span>
                                                </div>
                                                <h5 className="msg-subject">
                                                    {msg.isImportant && <AlertCircle size={14} color="#ef4444" style={{ marginRight: '5px', verticalAlign: 'middle' }} />}
                                                    {msg.subject}
                                                </h5>
                                                <p className="msg-snippet">{msg.snippet}</p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Read Message Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="read-mail-modal"
                        >
                            <div className="modal-header">
                                <div>
                                    <h2 className="read-subject">{selectedMessage.subject}</h2>
                                    <div className="read-meta">
                                        <div className="msg-avatar small">{selectedMessage.sender.charAt(0)}</div>
                                        <div>
                                            <p className="read-sender"><strong>{selectedMessage.sender}</strong> to You</p>
                                            <p className="read-date">{selectedMessage.date}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setSelectedMessage(null)}><X size={20} /></button>
                            </div>

                            <div className="modal-body">
                                <p className="read-full-text">{selectedMessage.fullMessage}</p>
                            </div>

                            <div className="modal-footer">
                                <button className="reply-btn" onClick={() => { toast.success("Reply window opened!"); setSelectedMessage(null); }}>
                                    <Send size={16} /> Reply to {selectedMessage.sender}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .main-content { flex: 1; margin-left: 280px; padding: 30px 50px; height: 100vh; overflow-y: auto; overflow-x: hidden; width: calc(100% - 280px); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .dashboard-top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .search-placeholder { background: white; padding: 10px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; color: #94a3b8; }
                .text-gradient { background: linear-gradient(to right, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                
                .premium-shadow { background: white; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }
                
                .mailbox-container { display: flex; min-height: 600px; background: white; }
                
                /* Sidebar */
                .mail-sidebar { width: 250px; border-right: 1px solid #f1f5f9; padding: 25px; background: #fafaf9; }
                .compose-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 1rem; border: none; cursor: pointer; transition: 0.2s; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); }
                .compose-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4); }
                
                .mail-nav { display: flex; flex-direction: column; gap: 5px; }
                .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; border-radius: 10px; border: none; background: transparent; color: #64748b; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: 0.2s; text-align: left; }
                .nav-item:hover { background: #f1f5f9; color: #0f172a; }
                .nav-item.active { background: #e0e7ff; color: #4f46e5; font-weight: 700; }
                .badge { margin-left: auto; background: #ef4444; color: white; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }

                /* List Section */
                .mail-list-section { flex: 1; display: flex; flex-direction: column; }
                .mail-header { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                
                .message-list { overflow-y: auto; flex: 1; }
                .message-card { display: flex; gap: 20px; padding: 20px 30px; border-bottom: 1px solid #f8fafc; cursor: pointer; transition: 0.2s; }
                .message-card:hover { background: #f8fafc; }
                .message-card.unread { background: #fdfefe; border-left: 4px solid #4f46e5; }
                .message-card.unread .msg-sender, .message-card.unread .msg-subject { font-weight: 800; color: #0f172a; }
                
                .msg-avatar { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; flex-shrink: 0; }
                .msg-avatar.small { width: 40px; height: 40px; font-size: 1rem; }
                
                .msg-content { flex: 1; min-width: 0; }
                .msg-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                .msg-sender { margin: 0; font-size: 1rem; color: #334155; font-weight: 600; }
                .msg-role { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
                .msg-date { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
                .msg-subject { margin: 0 0 5px 0; font-size: 0.95rem; color: #475569; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .msg-snippet { margin: 0; font-size: 0.85rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .empty-state { padding: 40px; text-align: center; color: #94a3b8; font-weight: 600; }

                /* Modal Styling */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 999; display: flex; justify-content: center; align-items: center; padding: 20px; }
                .read-mail-modal { background: white; width: 100%; max-width: 700px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); display: flex; flex-direction: column; max-height: 90vh; }
                .modal-header { padding: 25px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; background: #f8fafc; }
                .read-subject { margin: 0 0 15px 0; font-size: 1.4rem; color: #0f172a; font-weight: 800; line-height: 1.4; }
                .read-meta { display: flex; align-items: center; gap: 15px; }
                .read-sender { margin: 0; font-size: 0.95rem; color: #334155; }
                .read-date { margin: 2px 0 0 0; font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
                
                .close-btn { background: #e2e8f0; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #475569; display: flex; align-items: center; justify-content: center; transition: 0.2s; flex-shrink: 0; }
                .close-btn:hover { background: #fee2e2; color: #ef4444; }
                
                .modal-body { padding: 30px; overflow-y: auto; flex: 1; }
                .read-full-text { margin: 0; font-size: 1rem; color: #334155; line-height: 1.8; white-space: pre-wrap; }
                
                .modal-footer { padding: 20px 30px; border-top: 1px solid #f1f5f9; background: #f8fafc; display: flex; justify-content: flex-end; }
                .reply-btn { display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #cbd5e1; color: #0f172a; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .reply-btn:hover { background: #f1f5f9; border-color: #94a3b8; }

                .loader { border: 3px solid #f3f3f3; border-top: 3px solid #4f46e5; border-radius: 50%; width: 30px; height: 30px; margin: 0 auto; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .main-content { margin-left: 0; padding: 25px; padding-top: 80px; width: 100%; }
                    .mailbox-container { flex-direction: column; }
                    .mail-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #f1f5f9; }
                }
            `}</style>
        </div>
    );
}