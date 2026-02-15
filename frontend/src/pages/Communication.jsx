import React, { useState, useEffect, useRef } from "react";
import SidebarModern from "../components/SidebarModern";
import toast, { Toaster } from 'react-hot-toast';
import api from "../api/axios"; 
import { 
  Bell, Mail, MessageSquare, Send, Plus, 
  Search, Paperclip, MoreVertical, Trash2, 
  CheckCircle, Users, Megaphone, Calendar, Star, X, Phone, Loader, MoreHorizontal, Mic, Image,
  Gift, Briefcase, Info 
} from "lucide-react";

export default function Communication() {
  const [activeTab, setActiveTab] = useState("chat"); 
  const [sending, setSending] = useState(false); 

  // --- REAL CHAT STATES ---
  const [selectedChatId, setSelectedChatId] = useState(1);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);
  
  // ✅ TRACKING RECEIVED MESSAGES (Duplicate rokne ke liye)
  const processedMsgIds = useRef(new Set());

  // ✅ New Notice States
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", type: "General" });

  // --- MOCK DATA ---
  const [contacts, setContacts] = useState([
    { 
        id: 1, 
        name: "Naveen Soni (Admin)", 
        phone: "+919756001567", // ✅ YOUR VERIFIED NUMBER
        lastMsg: "Testing Twilio SMS...", 
        time: "10:30 AM", 
        unread: 0, 
        online: true, 
        initial: "N",
        color: "linear-gradient(135deg, #6366F1, #8B5CF6)"
    },
    { id: 2, name: "Priya Mam (Science)", phone: "+919898989898", lastMsg: "Need leave for tomorrow.", time: "09:15 AM", unread: 2, online: false, initial: "P", color: "linear-gradient(135deg, #EC4899, #F472B6)" },
    { id: 3, name: "Rahul (Accounts)", phone: "+918877665544", lastMsg: "Fee structure updated.", time: "Yesterday", unread: 0, online: true, initial: "R", color: "linear-gradient(135deg, #10B981, #34D399)" },
  ]);

  const [conversations, setConversations] = useState({
    1: [ { id: 1, text: "System Ready. Use Curl to send reply.", sender: "them", time: "10:00 AM" } ],
    2: [], 3: []
  });

  const [notices, setNotices] = useState([
    { id: 1, title: "Winter Vacation Announced", date: "Feb 05, 2025", type: "Holiday", important: true, content: "School will remain closed from Feb 10 to Feb 15 due to severe cold wave." },
    { id: 2, title: "Staff Meeting: Exam Prep", date: "Feb 08, 2025", type: "Meeting", important: false, content: "Mandatory meeting for all staff members regarding upcoming board exams." },
  ]);

  // ✅ 1. FIXED POLLING LOGIC
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get('exams/get-messages/');
        const newMsgs = response.data;

        if (newMsgs && newMsgs.length > 0) {
            const latestMsg = newMsgs[newMsgs.length - 1];
            const msgUniqueKey = latestMsg.text + (latestMsg.time || Date.now());

            if (!processedMsgIds.current.has(msgUniqueKey)) {
                processedMsgIds.current.add(msgUniqueKey);
                try {
                    const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
                    audio.play().catch(() => {});
                } catch(e) {}

                toast(`New Reply: ${latestMsg.text}`, { icon: '📩', duration: 4000 });

                setConversations(prev => {
                    const currentMsgs = prev[1] || [];
                    return {
                        ...prev,
                        1: [...currentMsgs, { ...latestMsg, id: Date.now() }] 
                    };
                });
            }
        }
      } catch (error) {}
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const handleSendMessage = async () => {
    if(!messageInput.trim()) return;

    const currentContact = contacts.find(c => c.id === selectedChatId);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Date.now(), text: messageInput, sender: "me", time: timestamp };

    setConversations(prev => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
    }));

    setSending(true);
    
    try {
        const response = await api.post('exams/send-sms/', {
            phone: currentContact.phone, 
            message: messageInput        
        });

        if (response.data.status === 'success') {
            toast.success(`SMS Sent 📲`, { style: { background: '#10B981', color: 'white' } });
        } else {
            console.error(response.data);
        }

    } catch (error) {
        console.error("SMS Error (Check Server)");
    } finally {
        setSending(false);
        setMessageInput(""); 
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, selectedChatId]);

  // ✅ FIXED: Missing Handlers
  const handleDeleteNotice = (id) => {
    setNotices(notices.filter(n => n.id !== id));
    toast.success("Notice Removed");
  };

  const handleBroadcast = () => {
    // Fake broadcast promise
    toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        {
            loading: 'Sending Broadcast...',
            success: <b>Broadcast Sent Successfully! 📡</b>,
            error: <b>Could not send.</b>,
        }
    );
  };

  const handleAddNotice = () => {
    if(!newNotice.title) return toast.error("Enter Title");
    const noticeObj = { id: Date.now(), title: newNotice.title, content: newNotice.content, type: newNotice.type, date: "Just Now", important: false };
    setNotices([noticeObj, ...notices]);
    setShowNoticeModal(false);
    setNewNotice({ title: "", content: "", type: "General" });
    toast.success("Published!");
  };

  const getNoticeIcon = (type) => {
    switch(type) {
        case 'Holiday': return <Gift size={120} className="watermark-icon" />;
        case 'Meeting': return <Briefcase size={120} className="watermark-icon" />;
        default: return <Info size={120} className="watermark-icon" />;
    }
  };

  const activeUser = contacts.find(c => c.id === selectedChatId);

  return (
    <div className="comm-app">
      <SidebarModern />
      <Toaster position="bottom-right" />
      <div className="bg-gradient-mesh"></div>

      <div className="comm-container hide-scrollbar">
        <header className="glass-header slide-down">
            <div className="h-left">
                <div className="page-icon"><Megaphone size={24} color="white"/></div>
                <div><h1>Communication Hub</h1><p>Real-time SMS & Notices</p></div>
            </div>
            <div className="h-tabs">
                <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={()=>setActiveTab('chat')}><MessageSquare size={18}/> SMS Chat</button>
                <button className={`tab-btn ${activeTab === 'notices' ? 'active' : ''}`} onClick={()=>setActiveTab('notices')}><Bell size={18}/> Notices</button>
                <button className={`tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={()=>setActiveTab('broadcast')}><Users size={18}/> Broadcast</button>
            </div>
        </header>

        <div className="content-area">
            {activeTab === 'chat' && (
                <div className="chat-layout fade-in">
                    <div className="chat-list-panel">
                        <div className="cl-search"><Search size={18} color="#94A3B8"/><input type="text" placeholder="Search contacts..." /></div>
                        <div className="cl-items hide-scrollbar">
                            {contacts.map(chat => (
                                <div key={chat.id} className={`cl-card ${selectedChatId === chat.id ? 'active' : ''}`} onClick={()=>setSelectedChatId(chat.id)}>
                                    <div className="cl-avatar" style={{background: chat.color}}>{chat.initial}{chat.online && <span className="status-dot"></span>}</div>
                                    <div className="cl-info">
                                        <div className="cl-row"><h4>{chat.name}</h4><span className="cl-time">{chat.time}</span></div>
                                        <div className="cl-row"><p>{chat.lastMsg}</p>{chat.unread > 0 && <span className="cl-badge">{chat.unread}</span>}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chat-main">
                        <div className="cm-header">
                            <div className="cm-profile">
                                <div className="cl-avatar sm" style={{background: activeUser?.color}}>{activeUser?.initial}</div>
                                <div><h3>{activeUser?.name}</h3><span className="cm-phone"><Phone size={10}/> {activeUser?.phone}</span></div>
                            </div>
                            <div className="cm-actions"><span className="gateway-badge pulse-dot">● SMS Active</span><button className="icon-btn"><MoreHorizontal size={20}/></button></div>
                        </div>

                        <div className="cm-body hide-scrollbar">
                            <div className="chat-doodle"></div>
                            {conversations[selectedChatId]?.map(msg => (
                                <div key={msg.id} className={`msg-row ${msg.sender === 'me' ? 'right' : 'left'}`}>
                                    <div className="msg-bubble">{msg.text}<span className="msg-meta">{msg.time} {msg.sender === 'me' && '✓'}</span></div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="cm-footer">
                            <div className="input-capsule">
                                <button className="attach-btn hover-rotate"><Paperclip size={20}/></button>
                                <input type="text" placeholder="Write a message..." value={messageInput} onChange={(e)=>setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} disabled={sending} />
                                <button className={`send-fab ${sending ? 'loading' : ''}`} onClick={handleSendMessage} disabled={sending}>{sending ? <Loader className="spin" size={20}/> : <Send size={18} className="send-icon"/>}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ WAOO NOTICE BOARD UI */}
            {activeTab === 'notices' && (
                <div className="notice-view fade-in-up">
                    <div className="notice-header-row">
                        <h2 className="section-title">📌 Notice Board</h2>
                        <button className="create-btn" onClick={()=>setShowNoticeModal(true)}><Plus size={18}/> New Notice</button>
                    </div>
                    <div className="notice-grid">
                        {notices.map(n => (
                            <div key={n.id} className={`notice-card ${n.type.toLowerCase()}`}>
                                {getNoticeIcon(n.type)}
                                <div className="nc-content-wrapper">
                                    <div className="nc-top">
                                        <span className={`nc-badge ${n.type.toLowerCase()}`}>{n.type}</span>
                                        <span className="nc-date"><Calendar size={14}/> {n.date}</span>
                                    </div>
                                    <h2 className="nc-title">{n.title}</h2>
                                    <p className="nc-desc">{n.content}</p>
                                    <div className="nc-footer">
                                        <button className="icon-btn-sm hover-red" onClick={()=>handleDeleteNotice(n.id)}><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'broadcast' && (
                <div className="broadcast-view fade-in-up">
                    <div className="broadcast-card">
                        <div className="bc-header"><div className="bc-icon"><Mail size={32} color="white"/></div><div><h2>Send Mass Notification</h2><p>Real SMS to selected group.</p></div></div>
                        <div className="bc-form">
                            <div className="form-group"><label>Message Content</label><textarea placeholder="Type message..." className="bc-textarea" rows="5"></textarea></div>
                            <div className="bc-actions"><button className="send-bc-btn" onClick={handleBroadcast}>Send SMS Broadcast <Send size={16}/></button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {showNoticeModal && (
        <div className="modal-overlay">
            <div className="premium-modal">
                <div className="pm-header"><h3>Create Announcement</h3><button onClick={() => setShowNoticeModal(false)} className="pm-close"><X size={20}/></button></div>
                <div className="pm-body">
                    <div className="pm-input-group"><label>Title</label><input type="text" value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} /></div>
                    <div className="pm-input-group"><label>Category</label><div className="category-chips">{['General', 'Holiday', 'Event', 'Meeting'].map(cat => (<button key={cat} className={`cat-chip ${newNotice.type === cat ? 'active' : ''}`} onClick={() => setNewNotice({...newNotice, type: cat})}>{cat}</button>))}</div></div>
                    <div className="pm-input-group"><label>Details</label><textarea rows="5" value={newNotice.content} onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}></textarea></div>
                    <button className="pm-publish-btn" onClick={handleAddNotice}>🚀 Publish</button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        :root { --primary: #6366F1; --bg: #F8FAFC; --dark: #1E293B; }
        .comm-app { display: flex; height: 100vh; background: var(--bg); font-family: 'Outfit', sans-serif; overflow: hidden; }
        .comm-container { flex: 1; margin-left: 280px; padding: 25px; position: relative; z-index: 10; display: flex; flex-direction: column; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .bg-gradient-mesh { position: fixed; inset: 0; background: radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.05), transparent 40%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.05), transparent 40%); z-index: 0; pointer-events: none; }
        .glass-header { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); border: 1px solid white; padding: 15px 25px; borderRadius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 20px; flex-shrink: 0; }
        .h-left { display: flex; gap: 15px; align-items: center; }
        .page-icon { width: 45px; height: 45px; background: linear-gradient(135deg, var(--primary), #8B5CF6); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25); }
        .h-left h1 { margin: 0; font-size: 1.4rem; color: var(--dark); font-weight: 800; }
        .h-left p { margin: 0; color: #64748B; font-size: 0.85rem; }
        .h-tabs { background: #F1F5F9; padding: 4px; border-radius: 12px; display: flex; gap: 5px; }
        .tab-btn { border: none; background: transparent; padding: 8px 16px; border-radius: 8px; font-weight: 600; color: #64748B; cursor: pointer; display: flex; gap: 8px; align-items: center; transition: 0.3s; }
        .tab-btn.active { background: white; color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        
        /* CHAT CSS (Unchanged) */
        .chat-layout { display: flex; background: white; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid white; overflow: hidden; flex: 1; height: 100%; }
        .chat-sidebar { width: 340px; border-right: 1px solid #F1F5F9; display: flex; flex-direction: column; background: #F8FAFC; }
        .cl-search { padding: 20px; display: flex; alignItems: center; gap: 10px; color: #94A3B8; background: white; border-bottom: 1px solid #F1F5F9; }
        .cl-search input { border: none; outline: none; width: 100%; font-weight: 600; color: var(--dark); font-size: 0.95rem; }
        .cl-items { flex: 1; overflow-y: auto; padding: 10px; }
        .cl-card { display: flex; gap: 12px; padding: 12px; margin-bottom: 5px; border-radius: 14px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
        .cl-card:hover { background: white; border-color: #E2E8F0; }
        .cl-card.active { background: white; box-shadow: 0 10px 20px rgba(0,0,0,0.03); border-color: #E2E8F0; transform: scale(1.01); }
        .cl-avatar { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); position: relative; flex-shrink: 0; }
        .cl-avatar.sm { width: 40px; height: 40px; font-size: 1rem; border-radius: 12px; }
        .status-dot { width: 12px; height: 12px; background: #10B981; border: 2px solid white; border-radius: 50%; position: absolute; bottom: -3px; right: -3px; }
        .cl-info { flex: 1; min-width: 0; }
        .cl-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .cl-row h4 { margin: 0; font-size: 0.95rem; color: var(--dark); font-weight: 700; }
        .cl-time { font-size: 0.7rem; color: #94A3B8; }
        .cl-row p { margin: 0; font-size: 0.8rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
        .cl-badge { background: #EF4444; color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 6px; font-weight: 700; }
        .chat-main { flex: 1; display: flex; flex-direction: column; background: #fff; position: relative; }
        .cm-header { padding: 15px 30px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); z-index: 10; }
        .cm-profile { display: flex; gap: 15px; align-items: center; }
        .cm-profile h3 { margin: 0; font-size: 1.1rem; color: var(--dark); font-weight: 700; }
        .cm-phone { font-size: 0.75rem; color: #64748B; background: #F1F5F9; padding: 4px 10px; borderRadius: 8px; display: flex; alignItems: center; gap: 6px; margin-top: 4px; font-weight: 600; }
        .gateway-badge { font-size: 0.75rem; color: #10B981; font-weight: 700; background: #ECFDF5; padding: 5px 12px; border-radius: 20px; border: 1px solid #D1FAE5; }
        .pulse-dot { animation: pulse 2s infinite; }
        .cm-body { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; position: relative; }
        .chat-doodle { position: absolute; inset: 0; opacity: 0.03; background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px; pointer-events: none; }
        .msg-row { display: flex; width: 100%; }
        .msg-row.left { justify-content: flex-start; }
        .msg-row.right { justify-content: flex-end; }
        .msg-bubble { max-width: 65%; padding: 14px 20px; border-radius: 18px; font-size: 0.95rem; line-height: 1.6; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.04); z-index: 1; }
        .msg-row.left .msg-bubble { background: #FFFFFF; color: var(--dark); border-bottom-left-radius: 4px; border: 1px solid #F1F5F9; }
        .msg-row.right .msg-bubble { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; border-bottom-right-radius: 4px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25); }
        .msg-meta { font-size: 0.65rem; display: flex; justify-content: flex-end; align-items: center; gap: 4px; margin-top: 6px; opacity: 0.8; font-weight: 600; }
        .cm-footer { padding: 25px; background: transparent; position: relative; z-index: 20; }
        .input-capsule { background: white; border: 1px solid #E2E8F0; padding: 8px; border-radius: 50px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); transition: 0.3s; }
        .input-capsule:focus-within { border-color: var(--primary); box-shadow: 0 15px 50px -5px rgba(99, 102, 241, 0.25); transform: translateY(-3px); }
        .input-capsule input { flex: 1; border: none; outline: none; font-size: 1rem; color: var(--dark); padding: 0 10px; background: transparent; }
        .attach-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: #F8FAFC; color: #64748B; cursor: pointer; transition: 0.2s; display: flex; alignItems: center; justifyContent: center; }
        .attach-btn:hover { background: #E2E8F0; color: var(--dark); }
        .send-fab { width: 45px; height: 45px; border-radius: 50%; border: none; background: var(--primary); color: white; cursor: pointer; display: flex; alignItems: center; justifyContent: center; transition: 0.2s; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
        .send-fab:hover { transform: scale(1.1); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5); }

        /* ✅ NEW & IMPROVED NOTICE BOARD CSS */
        .notice-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .section-title { font-size: 1.5rem; font-weight: 800; color: #1E293B; margin: 0; }
        .create-btn { background: #1E293B; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(30, 41, 59, 0.25); transition: 0.3s; }
        .create-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(30, 41, 59, 0.3); }
        
        .notice-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .notice-card { 
            background: white; border-radius: 20px; padding: 25px; position: relative; overflow: hidden; 
            border: 1px solid #F1F5F9; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); transition: all 0.4s ease;
            display: flex; flex-direction: column;
        }
        .notice-card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.12); border-color: white; }
        
        /* Gradient Borders Left */
        .notice-card.holiday { border-left: 6px solid #F87171; }
        .notice-card.event { border-left: 6px solid #60A5FA; }
        .notice-card.meeting { border-left: 6px solid #A78BFA; }
        .notice-card.general { border-left: 6px solid #94A3B8; }

        /* Watermark Icon */
        .watermark-icon { position: absolute; right: -20px; top: -20px; opacity: 0.05; transform: rotate(15deg); pointer-events: none; color: #1E293B; }

        .nc-content-wrapper { position: relative; z-index: 2; }
        .nc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .nc-badge { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.5px; }
        .nc-badge.holiday { background: #FEF2F2; color: #DC2626; }
        .nc-badge.event { background: #EFF6FF; color: #2563EB; }
        .nc-badge.meeting { background: #F5F3FF; color: #7C3AED; }
        .nc-badge.general { background: #F1F5F9; color: #475569; }
        
        .nc-date { font-size: 0.8rem; color: #94A3B8; display: flex; align-items: center; gap: 6px; font-weight: 600; }
        .nc-title { font-size: 1.25rem; font-weight: 800; color: #1E293B; margin: 0 0 10px; line-height: 1.3; }
        .nc-desc { color: #64748B; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; }
        
        .nc-footer { border-top: 1px solid #F1F5F9; padding-top: 15px; display: flex; justify-content: flex-end; }
        .icon-btn-sm { width: 32px; height: 32px; border-radius: 8px; border: none; background: #F8FAFC; color: #94A3B8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .icon-btn-sm:hover { background: #FEE2E2; color: #DC2626; }

        /* Broadcast & Modal CSS (Unchanged) */
        .broadcast-view { display: flex; justify-content: center; padding-top: 20px; }
        .broadcast-card { width: 600px; background: white; borderRadius: 24px; box-shadow: 0 20px 50px -10px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #E2E8F0; }
        .bc-header { background: linear-gradient(135deg, #1E293B, #0F172A); padding: 30px; color: white; display: flex; gap: 20px; alignItems: center; }
        .bc-icon { width: 60px; height: 60px; background: rgba(255,255,255,0.1); borderRadius: 16px; display: flex; alignItems: center; justifyContent: center; }
        .bc-header h2 { margin: 0 0 5px; font-size: 1.4rem; }
        .bc-header p { margin: 0; opacity: 0.7; font-size: 0.9rem; }
        .bc-form { padding: 30px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 600; color: #475569; margin-bottom: 8px; font-size: 0.9rem; }
        .bc-input, .bc-textarea { width: 100%; padding: 12px; borderRadius: 10px; border: 1px solid #E2E8F0; outline: none; font-family: inherit; font-size: 0.95rem; background: #F8FAFC; transition: 0.3s; }
        .bc-input:focus, .bc-textarea:focus { border-color: #4F46E5; background: white; }
        .audience-options { display: flex; gap: 15px; }
        .radio-box { background: #F8FAFC; padding: 10px 15px; borderRadius: 8px; border: 1px solid #E2E8F0; font-size: 0.9rem; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .bc-actions { display: flex; gap: 15px; margin-top: 10px; }
        .send-bc-btn { flex: 1; background: #10B981; color: white; border: none; padding: 12px; borderRadius: 12px; font-weight: 700; cursor: pointer; display: flex; alignItems: center; justify-content: center; gap: 10px; box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3); transition: 0.3s; }
        .send-bc-btn:hover { transform: translateY(-2px); }
        .draft-btn { flex: 1; background: #F1F5F9; color: #475569; border: none; padding: 12px; borderRadius: 12px; font-weight: 700; cursor: pointer; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .premium-modal { background: white; width: 500px; border-radius: 24px; box-shadow: 0 25px 80px rgba(0,0,0,0.3); overflow: hidden; animation: zoomIn 0.3s; border: 1px solid #E2E8F0; }
        .pm-header { background: linear-gradient(135deg, #1E293B, #0F172A); padding: 20px 25px; display: flex; align-items: center; gap: 15px; color: white; }
        .pm-icon-bg { width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justifyContent: center; }
        .pm-header h3 { margin: 0; flex: 1; font-size: 1.1rem; }
        .pm-close { background: transparent; border: none; color: rgba(255,255,255,0.6); cursor: pointer; transition: 0.2s; }
        .pm-close:hover { color: white; transform: rotate(90deg); }
        .pm-body { padding: 30px; }
        .pm-input-group { margin-bottom: 20px; }
        .pm-input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .pm-input-group input, .pm-input-group textarea { width: 100%; padding: 12px 15px; border-radius: 12px; border: 1px solid #E2E8F0; outline: none; background: #F8FAFC; transition: 0.3s; font-size: 0.95rem; color: #1E293B; }
        .pm-input-group input:focus, .pm-input-group textarea:focus { background: white; border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .category-chips { display: flex; gap: 10px; flex-wrap: wrap; }
        .cat-chip { background: white; border: 1px solid #E2E8F0; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; color: #64748B; cursor: pointer; transition: 0.2s; font-weight: 600; }
        .cat-chip.active { background: #4F46E5; color: white; border-color: #4F46E5; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        .pm-publish-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; border: none; border-radius: 14px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }
        .pm-publish-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(124, 58, 237, 0.4); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .fade-in-up { animation: fadeInUp 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}