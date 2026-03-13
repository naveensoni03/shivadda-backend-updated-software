import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Inbox, Send, Star, FileText, Trash2, Tag,
    Paperclip, Reply, Forward, MoreVertical, Archive, X, Mail, CheckCheck, Image as ImageIcon, PlusCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// 🔥 REAL API IMPORT (Adjust path if needed)
import api from "../../api/axios";

export default function TeacherMailbox() {
    const [mails, setMails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeFolder, setActiveFolder] = useState('inbox');
    const [selectedMail, setSelectedMail] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isComposing, setIsComposing] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Compose Form State
    const [composeTo, setComposeTo] = useState("");
    const [composeSubject, setComposeSubject] = useState("");
    const [composeBody, setComposeBody] = useState("");

    const fileInputRef = useRef(null);
    const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

    const fetchMails = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/teachers/mailbox/");
            setMails(response.data);
        } catch (error) {
            console.error("Error fetching mails:", error);
            // toast.error("Failed to load mailbox");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMails();
    }, []);

    useEffect(() => {
        setShowMoreMenu(false);
    }, [selectedMail]);

    // FILTER LOGIC
    const filteredMails = mails.filter(mail => {
        const matchesSearch = (mail.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (mail.sender || "").toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (activeFolder === 'starred') return mail.isStarred && mail.folder !== 'trash';
        if (['urgent', 'assignments', 'parents'].includes(activeFolder)) return mail.label === activeFolder && mail.folder !== 'trash';

        return mail.folder === activeFolder;
    });

    // API ACTIONS
    const updateMailBackend = async (mailId, updateData) => {
        try {
            const response = await api.patch(`/teachers/mailbox/${mailId}/`, updateData);
            setMails(mails.map(m => m.id === mailId ? response.data : m));
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleMailClick = (mail) => {
        setSelectedMail(mail);
        if (!mail.isRead) {
            updateMailBackend(mail.id, { isRead: true });
        }
    };

    const toggleStar = (e, mail) => {
        e.stopPropagation();
        updateMailBackend(mail.id, { isStarred: !mail.isStarred });
        toast.success(mail.isStarred ? "Removed from Starred" : "Marked as Starred");
    };

    const moveMail = (folderName) => {
        if (!selectedMail) return;
        updateMailBackend(selectedMail.id, { folder: folderName });
        setSelectedMail(null);
        toast.success(`Mail moved to ${folderName}`);
    };

    const handleMarkUnread = () => {
        if (!selectedMail) return;
        updateMailBackend(selectedMail.id, { isRead: false });
        setSelectedMail(null);
        setShowMoreMenu(false);
        toast.success("Marked as unread");
    };

    const handleDelete = async () => {
        if (!selectedMail) return;
        if (selectedMail.folder === 'trash') {
            try {
                await api.delete(`/teachers/mailbox/${selectedMail.id}/`);
                setMails(mails.filter(m => m.id !== selectedMail.id));
                setSelectedMail(null);
                toast.success("Permanently deleted");
            } catch (error) {
                toast.error("Failed to delete permanently");
            }
        } else {
            moveMail('trash');
        }
    };

    const handleSendMail = async (e) => {
        e.preventDefault();
        if (!composeTo || !composeSubject) return toast.error("Please fill 'To' and 'Subject'");
        try {
            const payload = { to: composeTo, subject: composeSubject, body: composeBody, folder: 'sent' };
            const response = await api.post("/teachers/mailbox/", payload);
            setMails([response.data, ...mails]);
            toast.success("Mail sent successfully!");
            setIsComposing(false);
            setComposeTo(""); setComposeSubject(""); setComposeBody("");
        } catch (error) {
            toast.error("Failed to send mail");
        }
    };

    const closeCompose = async () => {
        if (composeSubject || composeBody || composeTo) {
            try {
                const payload = { to: composeTo || "No Recipient", subject: composeSubject || "(No Subject)", body: composeBody || "Empty draft...", folder: 'drafts' };
                const response = await api.post("/teachers/mailbox/", payload);
                setMails([response.data, ...mails]);
                toast.success("Saved to Drafts");
            } catch (e) {
                console.error("Draft save failed");
            }
        }
        setIsComposing(false);
        setComposeTo(""); setComposeSubject(""); setComposeBody("");
    };

    const handleReply = () => {
        if (!selectedMail) return;
        setComposeTo(selectedMail.email);
        setComposeSubject(`Re: ${selectedMail.subject}`);
        setComposeBody(`\n\n--- Replying to ${selectedMail.sender} ---\n${selectedMail.snippet}`);
        setIsComposing(true);
    };

    return (
        <div className="premium-mailbox-wrapper">
            <Toaster position="top-right" />

            {/* HEADER (Same design as Assignments) */}
            <motion.div className="header-section" initial="hidden" animate="show" variants={fadeUp}>
                <div className="header-left">
                    <div className="title-row">
                        <div className="icon-box"><Mail size={28} color="#ffffff" /></div>
                        <h1 className="main-title">Mailbox</h1>
                    </div>
                    <p className="sub-title">Communicate with students and parents securely.</p>
                </div>

                <div className="header-right">
                    {/* Mail Folders as Premium Tabs */}
                    <div className="segmented-control scroll-tabs">
                        <button className={`segment-btn ${activeFolder === 'inbox' ? 'active' : ''}`} onClick={() => { setActiveFolder('inbox'); setSelectedMail(null); }}>
                            <Inbox size={18} /> Inbox
                        </button>
                        <button className={`segment-btn ${activeFolder === 'starred' ? 'active' : ''}`} onClick={() => { setActiveFolder('starred'); setSelectedMail(null); }}>
                            <Star size={18} /> Starred
                        </button>
                        <button className={`segment-btn ${activeFolder === 'sent' ? 'active' : ''}`} onClick={() => { setActiveFolder('sent'); setSelectedMail(null); }}>
                            <Send size={18} /> Sent
                        </button>
                        <button className={`segment-btn ${activeFolder === 'drafts' ? 'active' : ''}`} onClick={() => { setActiveFolder('drafts'); setSelectedMail(null); }}>
                            <FileText size={18} /> Drafts
                        </button>
                        <button className={`segment-btn ${activeFolder === 'trash' ? 'active' : ''}`} onClick={() => { setActiveFolder('trash'); setSelectedMail(null); }}>
                            <Trash2 size={18} /> Trash
                        </button>
                    </div>
                    <button className="btn-solid-large" onClick={() => { closeCompose(); setIsComposing(true); }}>
                        <PlusCircle size={18} /> Compose
                    </button>
                </div>
            </motion.div>

            {/* MAIN MAIL AREA */}
            <div className="mail-split-container">

                {/* LEFT: Mail List */}
                <div className="mail-list-panel">
                    <div className="search-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text" placeholder="Search mails..."
                            className="premium-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="mail-items">
                        {isLoading ? (
                            <div className="empty-state-small">Loading...</div>
                        ) : filteredMails.length > 0 ? filteredMails.map((mail) => (
                            <div key={mail.id} className={`mail-card ${!mail.isRead ? 'unread' : ''} ${selectedMail?.id === mail.id ? 'selected' : ''}`} onClick={() => handleMailClick(mail)}>
                                <div className="mail-avatar">{mail.avatar || "U"}</div>
                                <div className="mail-card-content">
                                    <div className="mail-card-top">
                                        <h4>{mail.sender}</h4>
                                        <span>{mail.time}</span>
                                    </div>
                                    <h5>{mail.subject}</h5>
                                    <p>{mail.snippet}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state-small">No mails found.</div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Reading Pane */}
                <div className="mail-reading-pane">
                    {selectedMail ? (
                        <div className="reading-content">
                            <div className="reading-action-bar">
                                <div className="r-left">
                                    <button className="icon-btn" title="Archive" onClick={() => moveMail('archive')}><Archive size={18} /></button>
                                    <button className="icon-btn" title="Delete" onClick={handleDelete}><Trash2 size={18} /></button>
                                </div>
                                <div className="r-right">
                                    <button className="icon-btn" title="Reply" onClick={handleReply}><Reply size={18} /></button>
                                    <button className="icon-btn" title="Forward" onClick={() => { }}><Forward size={18} /></button>
                                </div>
                            </div>

                            <div className="reading-header">
                                <h2>{selectedMail.subject}</h2>
                                <div className="sender-box">
                                    <div className="sender-avatar-large">{selectedMail.avatar || "U"}</div>
                                    <div className="sender-info">
                                        <h3>{selectedMail.sender} <span>&lt;{selectedMail.email}&gt;</span></h3>
                                        <p>to me • {selectedMail.date}</p>
                                    </div>
                                    <button className={`star-btn ${selectedMail.isStarred ? 'starred' : ''}`} onClick={(e) => toggleStar(e, selectedMail)}>
                                        <Star size={22} fill={selectedMail.isStarred ? "#f59e0b" : "none"} />
                                    </button>
                                </div>
                            </div>

                            <div className="reading-body">
                                {(selectedMail.body || "No content").split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>

                            <div className="reading-reply-box" onClick={handleReply}>
                                <div className="reply-avatar">T</div>
                                <div className="reply-placeholder">Reply to {selectedMail.sender}...</div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-reading-pane">
                            <Mail size={50} color="#cbd5e1" />
                            <h3>Select a message to read</h3>
                            <p>End-to-end secure communication</p>
                        </div>
                    )}
                </div>
            </div>

            {/* COMPOSE MODAL */}
            <AnimatePresence>
                {isComposing && (
                    <motion.div className="compose-modal" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                        <div className="c-header">
                            <h4>New Message</h4>
                            <button type="button" onClick={closeCompose}><X size={18} /></button>
                        </div>
                        <form className="c-body" onSubmit={handleSendMail}>
                            <div className="c-input"><label>To:</label><input type="text" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} autoFocus /></div>
                            <div className="c-input"><label>Subject:</label><input type="text" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} /></div>
                            <textarea className="c-textarea" placeholder="Write your email..." value={composeBody} onChange={(e) => setComposeBody(e.target.value)}></textarea>
                            <div className="c-footer">
                                <button type="submit" className="btn-solid-large">Send <Send size={16} /></button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                /* Wrapper fits perfectly in your TeacherLayout's Outlet */
                .premium-mailbox-wrapper { width: 100%; display: flex; flex-direction: column; gap: 20px; font-family: 'Inter', sans-serif; color: #0f172a; height: calc(100vh - 100px); }
                .premium-mailbox-wrapper * { box-sizing: border-box; }

                /* Header (Assignments Style) */
                .header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
                .header-left { display: flex; flex-direction: column; gap: 5px; }
                .title-row { display: flex; align-items: center; gap: 15px; }
                .icon-box { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 10px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);}
                .main-title { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; }
                .sub-title { color: #64748b; font-size: 1.05rem; margin: 0; }

                .header-right { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
                .segmented-control { background: #ffffff; padding: 6px; border-radius: 14px; display: flex; gap: 5px; border: 1px solid #e2e8f0; }
                .segment-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: none; background: transparent; color: #64748b; font-weight: 600; font-size: 0.95rem; border-radius: 10px; cursor: pointer; transition: 0.3s; white-space: nowrap; }
                .segment-btn:hover { color: #0f172a; background: #f8fafc; }
                .segment-btn.active { background: #eff6ff; color: #3b82f6; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .btn-solid-large { padding: 12px 25px; border: none; background: #3b82f6; color: white; font-weight: 700; border-radius: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(59,130,246,0.3);}
                .btn-solid-large:hover { transform: translateY(-2px); background: #2563eb; }

                /* Main Split Container */
                .mail-split-container { display: flex; flex: 1; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.02); min-height: 0; }

                /* Left List */
                .mail-list-panel { width: 350px; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; background: #ffffff; }
                .search-wrapper { padding: 20px; border-bottom: 1px solid #f1f5f9; position: relative; }
                .search-icon { position: absolute; left: 35px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .premium-search-input { width: 100%; padding: 12px 15px 12px 45px; border-radius: 12px; border: 2px solid #e2e8f0; font-size: 0.95rem; outline: none; background: #f8fafc; transition: 0.3s; }
                .premium-search-input:focus { border-color: #3b82f6; background: #fff; }

                .mail-items { flex: 1; overflow-y: auto; }
                .mail-card { display: flex; gap: 15px; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; border-left: 3px solid transparent; }
                .mail-card:hover { background: #f8fafc; }
                .mail-card.selected { background: #eff6ff; border-left-color: #3b82f6; }
                .mail-card.unread h4, .mail-card.unread h5 { font-weight: 700; color: #0f172a; }
                
                .mail-avatar { width: 45px; height: 45px; border-radius: 12px; background: #f1f5f9; color: #475569; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; flex-shrink: 0;}
                .mail-card.unread .mail-avatar { background: #3b82f6; color: white; }
                
                .mail-card-content { flex: 1; overflow: hidden; }
                .mail-card-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .mail-card-top h4 { margin: 0; font-size: 0.95rem; color: #334155; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .mail-card-top span { font-size: 0.75rem; color: #94a3b8; }
                .mail-card-content h5 { margin: 0 0 4px 0; font-size: 0.85rem; color: #475569; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .mail-card-content p { margin: 0; font-size: 0.8rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                .empty-state-small { padding: 40px; text-align: center; color: #94a3b8; }

                /* Right Reading Pane */
                .mail-reading-pane { flex: 1; display: flex; flex-direction: column; background: #ffffff; overflow-y: auto;}
                .reading-action-bar { padding: 15px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; position: sticky; top: 0; background: white;}
                .r-left, .r-right { display: flex; gap: 8px; }
                .icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; color: #64748b; cursor: pointer; transition: 0.2s;}
                .icon-btn:hover { background: #e2e8f0; color: #0f172a;}

                .reading-header { padding: 30px 40px; border-bottom: 1px solid #f1f5f9; }
                .reading-header h2 { font-size: 1.6rem; font-weight: 800; margin: 0 0 20px 0; color: #1e293b; line-height: 1.3;}
                .sender-box { display: flex; align-items: center; gap: 15px; position: relative;}
                .sender-avatar-large { width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: bold;}
                .sender-info h3 { margin: 0 0 2px 0; font-size: 1.05rem; color: #0f172a; }
                .sender-info span { color: #94a3b8; font-weight: normal; font-size: 0.9rem;}
                .sender-info p { margin: 0; color: #64748b; font-size: 0.85rem;}
                .star-btn { position: absolute; right: 0; background: transparent; border: none; cursor: pointer; color: #cbd5e1; }
                .star-btn.starred { color: #f59e0b; }

                .reading-body { padding: 30px 40px; font-size: 1rem; color: #334155; line-height: 1.8; }
                .reading-body p { margin-bottom: 15px; }

                .reading-reply-box { margin: 10px 40px 40px 40px; display: flex; align-items: center; gap: 15px; cursor: pointer; }
                .reply-avatar { width: 45px; height: 45px; border-radius: 12px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #64748b;}
                .reply-placeholder { flex: 1; padding: 15px 20px; border: 2px solid #e2e8f0; border-radius: 12px; color: #94a3b8; background: #f8fafc; transition: 0.2s;}
                .reading-reply-box:hover .reply-placeholder { border-color: #cbd5e1; background: white; }

                .empty-reading-pane { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; background: #f8fafc;}
                .empty-reading-pane h3 { color: #475569; margin: 15px 0 5px 0; }

                /* Compose Modal */
                .compose-modal { position: fixed; bottom: 0; right: 40px; width: 500px; background: white; border-radius: 16px 16px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; z-index: 100; overflow: hidden;}
                .c-header { background: #1e293b; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;}
                .c-header h4 { margin: 0; }
                .c-header button { background: transparent; border: none; color: white; cursor: pointer; }
                .c-input { display: flex; padding: 12px 20px; border-bottom: 1px solid #f1f5f9; align-items: center;}
                .c-input label { width: 70px; color: #64748b; font-weight: 600; font-size: 0.95rem;}
                .c-input input { flex: 1; border: none; outline: none; font-size: 0.95rem; }
                .c-textarea { width: 100%; height: 250px; padding: 20px; border: none; outline: none; resize: none; font-family: inherit; font-size: 0.95rem;}
                .c-footer { padding: 15px 20px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: right;}

                /* Responsive */
                @media (max-width: 900px) {
                    .mail-split-container { flex-direction: column; }
                    .mail-list-panel { width: 100%; border-right: none; border-bottom: 1px solid #e2e8f0; max-height: 400px; }
                    .compose-modal { width: 100%; right: 0; height: 100vh; border-radius: 0; }
                }
            `}</style>
        </div>
    );
}