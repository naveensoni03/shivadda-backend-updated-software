import React, { useState, useEffect, useRef } from "react";
import SidebarModern from "../components/SidebarModern";
import toast, { Toaster } from 'react-hot-toast';
import api from "../api/axios"; 
import { 
  Bell, Mail, MessageSquare, Send, Plus, 
  Search, Paperclip, Trash2, 
  Users, Megaphone, Calendar, X, Phone, Loader,
  Gift, Briefcase, Info, Database, HelpCircle 
} from "lucide-react"; 

export default function Communication() {
  const [activeTab, setActiveTab] = useState("chat"); 
  const [sending, setSending] = useState(false); 

  // --- REAL CHAT STATES ---
  const [selectedChatId, setSelectedChatId] = useState(1);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);
  const processedMsgIds = useRef(new Set());

  // --- NOTICE STATES ---
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", type: "General" });
  const [helpdeskTab, setHelpdeskTab] = useState("Complain"); 

  // ✅ REAL CONNECTED STATES
  const [notices, setNotices] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [mailboxStats, setMailboxStats] = useState({
      totalAllocated: 5000, downloaded: 0, uploaded: 0, used: 0, remaining: 5000, required: 0
  });

  const [contacts, setContacts] = useState([
    { id: 1, name: "Naveen Soni (Admin)", phone: "+919756001567", lastMsg: "Testing Twilio SMS...", time: "10:30 AM", unread: 0, online: true, initial: "N", color: "linear-gradient(135deg, #6366F1, #8B5CF6)" },
    { id: 2, name: "Priya Mam (Science)", phone: "+919898989898", lastMsg: "Need leave for tomorrow.", time: "09:15 AM", unread: 2, online: false, initial: "P", color: "linear-gradient(135deg, #EC4899, #F472B6)" },
  ]);

  const [conversations, setConversations] = useState({
    1: [ { id: 1, text: "System Ready. Use API to send reply.", sender: "them", time: "10:00 AM" } ],
    2: []
  });

  // ✅ FETCH DATA FROM BACKEND API
  const fetchCommunicationData = async () => {
      try {
          // Fetch Notices
          const noticeRes = await api.get('services/notices/');
          setNotices(Array.isArray(noticeRes.data) ? noticeRes.data : []);

          // Fetch Support Tickets
          const ticketRes = await api.get('services/tickets/');
          setSupportTickets(Array.isArray(ticketRes.data) ? ticketRes.data : []);

          // Fetch Mailbox Stats
          const mbRes = await api.get('services/mailbox-stats/');
          if (mbRes.data && mbRes.data.length > 0) {
              const mb = mbRes.data[0];
              const used = mb.downloaded_mb + mb.uploaded_mb;
              setMailboxStats({
                  totalAllocated: mb.total_allocated_mb,
                  downloaded: mb.downloaded_mb,
                  uploaded: mb.uploaded_mb,
                  used: used,
                  remaining: mb.total_allocated_mb - used
              });
          }
      } catch (error) {
          console.log("Waiting for backend connectivity...");
      }
  };

  useEffect(() => {
      fetchCommunicationData();
  }, []);

  const filteredTickets = supportTickets.filter(t => t.ticket_type === helpdeskTab);

  // SMS Polling Logic
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get('exams/messages/'); 
        const newMsgs = response.data.messages || [];

        if (newMsgs && newMsgs.length > 0) {
            const latestMsg = newMsgs[newMsgs.length - 1];
            const msgUniqueKey = latestMsg.text + (latestMsg.time || Date.now());

            if (!processedMsgIds.current.has(msgUniqueKey)) {
                processedMsgIds.current.add(msgUniqueKey);
                try { new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg").play().catch(() => {}); } catch(e) {}
                toast(`New Reply: ${latestMsg.text}`, { icon: '📩' });
                setConversations(prev => ({ ...prev, 1: [...(prev[1] || []), { ...latestMsg, id: Date.now() }] }));
            }
        }
      } catch (error) {}
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if(!messageInput.trim()) return;
    const currentContact = contacts.find(c => c.id === selectedChatId);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Date.now(), text: messageInput, sender: "me", time: timestamp };

    setConversations(prev => ({ ...prev, [selectedChatId]: [...(prev[selectedChatId] || []), newMsg] }));
    setSending(true);
    
    try {
        const response = await api.post('exams/send-sms/', { phone: currentContact.phone, message: messageInput });
        if (response.data.status === 'success') toast.success(`SMS Sent 📲`, { style: { background: '#10B981', color: 'white' } });
    } catch (error) { toast.error("SMS Failed (Check Server)"); } 
    finally { setSending(false); setMessageInput(""); }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversations, selectedChatId]);

  // ✅ REAL DELETE DB CONNECTED
  const handleDeleteNotice = async (id) => { 
      try {
          await api.delete(`services/notices/${id}/`);
          setNotices(notices.filter(n => n.id !== id)); 
          toast.success("Notice Removed"); 
      } catch (e) { toast.error("Delete failed"); }
  };

  const handleBroadcast = () => {
    toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        { loading: 'Sending Broadcast...', success: <b>Broadcast Sent Successfully! 📡</b>, error: <b>Could not send.</b> }
    );
  };

  // ✅ REAL ADD NOTICE DB CONNECTED
  const handleAddNotice = async () => {
    if(!newNotice.title) return toast.error("Enter Title");
    const loadId = toast.loading("Publishing...");
    
    try {
        const payload = {
            title: newNotice.title,
            content: newNotice.content,
            notice_type: newNotice.type
        };
        const res = await api.post('services/notices/', payload);
        setNotices([res.data, ...notices]);
        setShowNoticeModal(false);
        setNewNotice({ title: "", content: "", type: "General" });
        toast.success("Published Successfully!", { id: loadId });
    } catch (error) {
        toast.error("Failed to save to database", { id: loadId });
    }
  };

  const formatDate = (dateString) => {
      if(!dateString) return "Just Now";
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
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
                <div><h1>Communication Hub</h1><p>Super Admin: Mailbox & Support</p></div>
            </div>
            <div className="h-tabs">
                <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={()=>setActiveTab('chat')}><MessageSquare size={18}/> <span className="tab-label">SMS Chat</span></button>
                <button className={`tab-btn ${activeTab === 'notices' ? 'active' : ''}`} onClick={()=>setActiveTab('notices')}><Bell size={18}/> <span className="tab-label">Notices</span></button>
                <button className={`tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={()=>setActiveTab('broadcast')}><Users size={18}/> <span className="tab-label">Broadcast</span></button>
                <button className={`tab-btn ${activeTab === 'mailbox' ? 'active' : ''}`} onClick={()=>setActiveTab('mailbox')}><Database size={18}/> <span className="tab-label">Mailbox (MB)</span></button>
                <button className={`tab-btn ${activeTab === 'helpdesk' ? 'active' : ''}`} onClick={()=>setActiveTab('helpdesk')}><HelpCircle size={18}/> <span className="tab-label">Helpdesk</span></button>
            </div>
        </header>

        <div className="content-area">
            
            {/* 1. CHAT */}
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
                            <div className="cm-actions no-mobile"><span className="gateway-badge pulse-dot">● SMS Active</span></div>
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

            {/* 2. NOTICES */}
            {activeTab === 'notices' && (
                <div className="notice-view fade-in-up">
                    <div className="notice-header-row">
                        <h2 className="section-title">📌 Notice Board</h2>
                        <button className="create-btn" onClick={()=>setShowNoticeModal(true)}><Plus size={18}/> New Notice</button>
                    </div>
                    <div className="notice-grid">
                        {notices.map(n => (
                            <div key={n.id} className={`notice-card ${n.notice_type?.toLowerCase() || 'general'}`}>
                                {getNoticeIcon(n.notice_type || 'General')}
                                <div className="nc-content-wrapper">
                                    <div className="nc-top">
                                        <span className={`nc-badge ${n.notice_type?.toLowerCase() || 'general'}`}>{n.notice_type || 'General'}</span>
                                        <span className="nc-date"><Calendar size={14}/> {formatDate(n.date_posted)}</span>
                                    </div>
                                    <h2 className="nc-title">{n.title}</h2>
                                    <p className="nc-desc">{n.content}</p>
                                    <div className="nc-footer">
                                        <button className="icon-btn-sm hover-red" onClick={()=>handleDeleteNotice(n.id)}><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {notices.length === 0 && <div style={{padding: '20px', color: '#64748B'}}>No notices found in database. Create one!</div>}
                    </div>
                </div>
            )}

            {/* 3. BROADCAST */}
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

            {/* 4. MAILBOX STORAGE MANAGER */}
            {activeTab === 'mailbox' && (
                <div className="notice-view fade-in-up">
                    <div className="notice-header-row">
                        <h2 className="section-title">💾 Mailbox Storage Tracker</h2>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon"><Database size={20}/></div>
                            <div><span className="stat-label">Total Allocated</span><span className="stat-value">{mailboxStats.totalAllocated} MB</span></div>
                        </div>
                        <div className="stat-card orange">
                            <div className="stat-icon"><Mail size={20}/></div>
                            <div><span className="stat-label">Total Used</span><span className="stat-value">{mailboxStats.used} MB</span></div>
                        </div>
                        <div className="stat-card purple">
                            <div className="stat-icon"><MessageSquare size={20}/></div>
                            <div><span className="stat-label">Remaining Space</span><span className="stat-value">{mailboxStats.remaining} MB</span></div>
                        </div>
                    </div>
                    
                    <div className="broadcast-card" style={{marginTop: '25px', maxWidth: '100%'}}>
                        <div className="bc-form" style={{padding: '25px'}}>
                            <h3 style={{margin: '0 0 20px', color: '#1E293B'}}>Storage Breakdown</h3>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontWeight:'600'}}>
                                <span style={{color: '#10B981'}}>Downloaded: {mailboxStats.downloaded} MB</span>
                                <span style={{color: '#F43F5E'}}>Uploaded: {mailboxStats.uploaded} MB</span>
                            </div>
                            <div style={{width: '100%', height: '15px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', display: 'flex'}}>
                                <div style={{width: `${(mailboxStats.downloaded/mailboxStats.totalAllocated)*100}%`, background: '#10B981'}}></div>
                                <div style={{width: `${(mailboxStats.uploaded/mailboxStats.totalAllocated)*100}%`, background: '#F43F5E'}}></div>
                            </div>
                            <div style={{textAlign: 'center', marginTop: '20px'}}>
                                <button className="send-bc-btn" onClick={() => toast.success("Storage Cleanup Started!")}>Clean Unnecessary Files <Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. HELPDESK & ENQUIRIES */}
            {activeTab === 'helpdesk' && (
                <div className="notice-view fade-in-up">
                    <div className="notice-header-row">
                        <h2 className="section-title">🎧 Enquiries & Helpdesk</h2>
                        <div className="h-tabs">
                            <button className={`tab-btn ${helpdeskTab === 'Complain' ? 'active' : ''}`} onClick={() => setHelpdeskTab('Complain')}>Complains</button>
                            <button className={`tab-btn ${helpdeskTab === 'Enquiry' ? 'active' : ''}`} onClick={() => setHelpdeskTab('Enquiry')}>Enquiries</button>
                            <button className={`tab-btn ${helpdeskTab === 'Feedback' ? 'active' : ''}`} onClick={() => setHelpdeskTab('Feedback')}>Feedback</button>
                        </div>
                    </div>
                    
                    <div className="table-card" style={{background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                            <thead>
                                <tr>
                                    <th style={{padding: '15px', color: '#64748B', borderBottom: '2px solid #F1F5F9'}}>Ticket ID</th>
                                    <th style={{padding: '15px', color: '#64748B', borderBottom: '2px solid #F1F5F9'}}>Type</th>
                                    <th style={{padding: '15px', color: '#64748B', borderBottom: '2px solid #F1F5F9'}}>User</th>
                                    <th style={{padding: '15px', color: '#64748B', borderBottom: '2px solid #F1F5F9'}}>Subject</th>
                                    <th style={{padding: '15px', color: '#64748B', borderBottom: '2px solid #F1F5F9'}}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.length > 0 ? (
                                    filteredTickets.map(t => (
                                        <tr key={t.id} style={{borderBottom: '1px solid #F1F5F9'}}>
                                            <td style={{padding: '15px', fontWeight: 'bold', color: '#1E293B'}}>{t.ticket_id || t.id}</td>
                                            <td style={{padding: '15px'}}><span className={`nc-badge ${t.ticket_type === 'Complain' ? 'holiday' : 'event'}`}>{t.ticket_type}</span></td>
                                            <td style={{padding: '15px', color: '#475569'}}>{t.user_name || t.user} <br/><small style={{color: '#94A3B8'}}>{formatDate(t.created_at)}</small></td>
                                            <td style={{padding: '15px', color: '#1E293B'}}>{t.subject}</td>
                                            <td style={{padding: '15px'}}><span style={{color: t.status==='Pending'?'#F59E0B':'#10B981', fontWeight:'bold'}}>{t.status}</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#94A3B8'}}>
                                            No {helpdeskTab}s found in database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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

      {/* 🚀 CSS FOR 100% RESPONSIVENESS (UNCHANGED) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        :root { --primary: #6366F1; --bg: #F8FAFC; --dark: #1E293B; }
        
        html, body, #root { margin: 0; padding: 0; height: 100%; }
        .comm-app { display: flex; height: 100vh; background: var(--bg); font-family: 'Outfit', sans-serif; overflow: hidden; position: relative; }
        
        .comm-container { flex: 1; margin-left: 280px; padding: 25px; position: relative; z-index: 10; display: flex; flex-direction: column; height: 100vh; overflow-y: auto !important; box-sizing: border-box; max-width: calc(100% - 280px); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .bg-gradient-mesh { position: fixed; inset: 0; background: radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.05), transparent 40%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.05), transparent 40%); z-index: 0; pointer-events: none; }
        
        .glass-header { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); border: 1px solid white; padding: 15px 25px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 20px; flex-shrink: 0; }
        .h-left { display: flex; gap: 15px; align-items: center; }
        .page-icon { width: 45px; height: 45px; background: linear-gradient(135deg, var(--primary), #8B5CF6); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25); flex-shrink: 0;}
        .h-left h1 { margin: 0; font-size: 1.4rem; color: var(--dark); font-weight: 800; }
        .h-left p { margin: 0; color: #64748B; font-size: 0.85rem; }
        
        .h-tabs { background: #F1F5F9; padding: 4px; border-radius: 12px; display: flex; gap: 5px; flex-wrap: wrap; }
        .tab-btn { border: none; background: transparent; padding: 8px 16px; border-radius: 8px; font-weight: 600; color: #64748B; cursor: pointer; display: flex; gap: 8px; align-items: center; transition: 0.3s; white-space: nowrap;}
        .tab-btn.active { background: white; color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

        .content-area { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .stat-card { padding: 25px; border-radius: 20px; display: flex; gap: 15px; align-items: center; background: white; border: 1px solid #E2E8F0; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); transition: 0.3s;}
        .stat-card:hover { transform: translateY(-5px); }
        .stat-card.blue .stat-icon { color: #3b82f6; background: #eff6ff; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .stat-card.orange .stat-icon { color: #f97316; background: #fff7ed; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .stat-card.purple .stat-icon { color: #8b5cf6; background: #f5f3ff; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .stat-label { font-size: 0.8rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block;}
        .stat-value { font-size: 1.5rem; color: #1e293b; font-weight: 800; display: block; margin-top: 2px; }
        
        .chat-layout { display: flex; background: white; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid white; overflow: hidden; flex: 1; min-height: 500px; }
        .chat-list-panel { width: 340px; border-right: 1px solid #F1F5F9; display: flex; flex-direction: column; background: #F8FAFC; flex-shrink: 0;}
        .cl-search { padding: 20px; display: flex; align-items: center; gap: 10px; color: #94A3B8; background: white; border-bottom: 1px solid #F1F5F9; }
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
        .cl-row h4 { margin: 0; font-size: 0.95rem; color: var(--dark); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
        .cl-time { font-size: 0.7rem; color: #94A3B8; flex-shrink: 0;}
        .cl-row p { margin: 0; font-size: 0.8rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
        .cl-badge { background: #EF4444; color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 6px; font-weight: 700; flex-shrink: 0;}
        
        .chat-main { flex: 1; display: flex; flex-direction: column; background: #fff; position: relative; min-width: 0;}
        .cm-header { padding: 15px 30px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); z-index: 10; flex-wrap: wrap; gap: 10px;}
        .cm-profile { display: flex; gap: 15px; align-items: center; }
        .cm-profile h3 { margin: 0; font-size: 1.1rem; color: var(--dark); font-weight: 700; }
        .cm-phone { font-size: 0.75rem; color: #64748B; background: #F1F5F9; padding: 4px 10px; border-radius: 8px; display: flex; align-items: center; gap: 6px; margin-top: 4px; font-weight: 600; width: fit-content;}
        .cm-actions { display: flex; align-items: center; gap: 10px;}
        .gateway-badge { font-size: 0.75rem; color: #10B981; font-weight: 700; background: #ECFDF5; padding: 5px 12px; border-radius: 20px; border: 1px solid #D1FAE5; white-space: nowrap;}
        .pulse-dot { animation: pulse 2s infinite; }
        .icon-btn { background: transparent; border: none; cursor: pointer; color: #64748B; display: flex; align-items: center;}
        
        .cm-body { flex: 1; padding: 30px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; position: relative; }
        .chat-doodle { position: absolute; inset: 0; opacity: 0.03; background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px; pointer-events: none; }
        .msg-row { display: flex; width: 100%; }
        .msg-row.left { justify-content: flex-start; }
        .msg-row.right { justify-content: flex-end; }
        .msg-bubble { max-width: 75%; padding: 14px 20px; border-radius: 18px; font-size: 0.95rem; line-height: 1.6; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.04); z-index: 1; word-wrap: break-word;}
        .msg-row.left .msg-bubble { background: #FFFFFF; color: var(--dark); border-bottom-left-radius: 4px; border: 1px solid #F1F5F9; }
        .msg-row.right .msg-bubble { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; border-bottom-right-radius: 4px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25); }
        .msg-meta { font-size: 0.65rem; display: flex; justify-content: flex-end; align-items: center; gap: 4px; margin-top: 6px; opacity: 0.8; font-weight: 600; }
        
        .cm-footer { padding: 20px 30px; background: transparent; position: relative; z-index: 20; }
        .input-capsule { background: white; border: 1px solid #E2E8F0; padding: 8px; border-radius: 50px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); transition: 0.3s; width: 100%; box-sizing: border-box; }
        .input-capsule:focus-within { border-color: var(--primary); box-shadow: 0 15px 50px -5px rgba(99, 102, 241, 0.25); transform: translateY(-3px); }
        .input-capsule input { flex: 1; border: none; outline: none; font-size: 1rem; color: var(--dark); padding: 0 10px; background: transparent; min-width: 50px;}
        .attach-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: #F8FAFC; color: #64748B; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
        .attach-btn:hover { background: #E2E8F0; color: var(--dark); }
        .send-fab { width: 45px; height: 45px; border-radius: 50%; border: none; background: var(--primary); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); flex-shrink: 0;}
        .send-fab:hover { transform: scale(1.1); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5); }

        .notice-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;}
        .section-title { font-size: 1.5rem; font-weight: 800; color: #1E293B; margin: 0; }
        .create-btn { background: #1E293B; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(30, 41, 59, 0.25); transition: 0.3s; white-space: nowrap;}
        .create-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(30, 41, 59, 0.3); }
        
        .notice-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
        .notice-card { background: white; border-radius: 20px; padding: 25px; position: relative; overflow: hidden; border: 1px solid #F1F5F9; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); transition: all 0.4s ease; display: flex; flex-direction: column;}
        .notice-card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.12); border-color: white; }
        .notice-card.holiday { border-left: 6px solid #F87171; }
        .notice-card.event { border-left: 6px solid #60A5FA; }
        .notice-card.meeting { border-left: 6px solid #A78BFA; }
        .notice-card.general { border-left: 6px solid #94A3B8; }
        .watermark-icon { position: absolute; right: -20px; top: -20px; opacity: 0.05; transform: rotate(15deg); pointer-events: none; color: #1E293B; }
        .nc-content-wrapper { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column;}
        .nc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .nc-badge { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.5px; }
        .nc-badge.holiday { background: #FEF2F2; color: #DC2626; }
        .nc-badge.event { background: #EFF6FF; color: #2563EB; }
        .nc-badge.meeting { background: #F5F3FF; color: #7C3AED; }
        .nc-badge.general { background: #F1F5F9; color: #475569; }
        .nc-date { font-size: 0.8rem; color: #94A3B8; display: flex; align-items: center; gap: 6px; font-weight: 600; }
        .nc-title { font-size: 1.25rem; font-weight: 800; color: #1E293B; margin: 0 0 10px; line-height: 1.3; }
        .nc-desc { color: #64748B; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; flex: 1;}
        .nc-footer { border-top: 1px solid #F1F5F9; padding-top: 15px; display: flex; justify-content: flex-end; margin-top: auto;}
        .icon-btn-sm { width: 32px; height: 32px; border-radius: 8px; border: none; background: #F8FAFC; color: #94A3B8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .icon-btn-sm:hover { background: #FEE2E2; color: #DC2626; }

        .broadcast-view { display: flex; justify-content: center; padding-top: 20px; }
        .broadcast-card { width: 100%; max-width: 600px; background: white; border-radius: 24px; box-shadow: 0 20px 50px -10px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #E2E8F0; }
        .bc-header { background: linear-gradient(135deg, #1E293B, #0F172A); padding: 30px; color: white; display: flex; gap: 20px; align-items: center; flex-wrap: wrap;}
        .bc-icon { width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
        .bc-header h2 { margin: 0 0 5px; font-size: 1.4rem; }
        .bc-header p { margin: 0; opacity: 0.7; font-size: 0.9rem; }
        .bc-form { padding: 30px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-weight: 600; color: #475569; margin-bottom: 8px; font-size: 0.9rem; }
        .bc-input, .bc-textarea { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #E2E8F0; outline: none; font-family: inherit; font-size: 0.95rem; background: #F8FAFC; transition: 0.3s; box-sizing: border-box;}
        .bc-input:focus, .bc-textarea:focus { border-color: #4F46E5; background: white; }
        .bc-actions { display: flex; gap: 15px; margin-top: 10px; }
        .send-bc-btn { flex: 1; background: #10B981; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3); transition: 0.3s; }
        .send-bc-btn:hover { transform: translateY(-2px); }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;}
        .premium-modal { background: white; width: 100%; max-width: 500px; border-radius: 24px; box-shadow: 0 25px 80px rgba(0,0,0,0.3); overflow: hidden; animation: zoomIn 0.3s; border: 1px solid #E2E8F0; display: flex; flex-direction: column; max-height: 90vh;}
        .pm-header { background: linear-gradient(135deg, #1E293B, #0F172A); padding: 20px 25px; display: flex; align-items: center; gap: 15px; color: white; flex-shrink: 0;}
        .pm-header h3 { margin: 0; flex: 1; font-size: 1.1rem; }
        .pm-close { background: transparent; border: none; color: rgba(255,255,255,0.6); cursor: pointer; transition: 0.2s; }
        .pm-close:hover { color: white; transform: rotate(90deg); }
        .pm-body { padding: 30px; overflow-y: auto; }
        .pm-input-group { margin-bottom: 20px; }
        .pm-input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .pm-input-group input, .pm-input-group textarea { width: 100%; padding: 12px 15px; border-radius: 12px; border: 1px solid #E2E8F0; outline: none; background: #F8FAFC; transition: 0.3s; font-size: 0.95rem; color: #1E293B; box-sizing: border-box;}
        .pm-input-group input:focus, .pm-input-group textarea:focus { background: white; border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .category-chips { display: flex; gap: 10px; flex-wrap: wrap; }
        .cat-chip { background: white; border: 1px solid #E2E8F0; padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; color: #64748B; cursor: pointer; transition: 0.2s; font-weight: 600; }
        .cat-chip.active { background: #4F46E5; color: white; border-color: #4F46E5; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        .pm-publish-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; border: none; border-radius: 14px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); flex-shrink: 0; margin-top: 10px;}
        .pm-publish-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(124, 58, 237, 0.4); }
        
        .spin { animation: spin 1s linear infinite; }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .fade-in-up { animation: fadeInUp 0.5s ease-out; }
        
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        @media (max-width: 1024px) { .comm-container { margin-left: 0 !important; max-width: 100%; width: 100%; } }
        @media (max-width: 850px) {
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            .comm-app { display: block !important; height: auto !important; min-height: 100vh !important; }
            .comm-container { margin-left: 0 !important; padding: 15px !important; padding-top: 85px !important; padding-bottom: 120px !important; width: 100vw !important; max-width: 100vw !important; height: auto !important; min-height: 100vh !important; overflow: visible !important; display: block !important; }
            .glass-header { flex-direction: column; align-items: flex-start; gap: 15px; padding: 15px; }
            .h-tabs { width: 100%; overflow-x: auto; padding-bottom: 5px; }
            .tab-label { display: block; }
            .chat-layout { flex-direction: column; height: auto; min-height: 600px; border-radius: 15px; }
            .chat-list-panel { width: 100%; border-right: none; border-bottom: 1px solid #F1F5F9; max-height: 300px; flex-shrink: 0;}
            .chat-main { min-height: 500px; }
            .cm-header { padding: 10px 15px; }
            .cm-body { padding: 15px; height: 400px; overflow-y: auto; }
            .cm-footer { padding: 15px; position: relative; }
            .msg-bubble { max-width: 85%; }
            .no-mobile { display: none; }
            .broadcast-card { margin: 0 auto; }
            .premium-modal { width: 90vw !important; max-width: 400px; }
            .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}