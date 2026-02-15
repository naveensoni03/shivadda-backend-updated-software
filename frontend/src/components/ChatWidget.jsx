import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom"; // ✅ Route check
import api from "../api/axios";

export default function ChatWidget() {
  // --- 1. ALL HOOKS MUST BE AT THE TOP (Don't put returns here) ---
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); 

  const [messages, setMessages] = useState([
    {
      text: "Hello 👋 I'm Shivadda AI. How can I assist you today?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  const sendSound = new Audio(
    "https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3"
  );
  const receiveSound = new Audio(
    "https://assets.mixkit.co/sfx/preview/mixkit-water-drop-1313.mp3"
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, loading]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // --- 2. LOGIC FUNCTIONS ---
  const speak = (text) => {
    if (!synth || !autoRead) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    synth.cancel();
    synth.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    sendSound.play();
    const userMsg = {
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("chat/", { message: input });
      receiveSound.play();
      const botMsg = {
        text: res.data.reply,
        sender: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
      speak(res.data.reply);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ Network issue. Please try again.",
          sender: "bot",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const toggleListening = () => {
    if (!recognitionRef.current)
      return alert("Voice input not supported in this browser.");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const refreshChat = () => {
    setMessages([
      {
        text: "Hello 👋 I'm Shivadda AI. How can I assist you today?",
        sender: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const totalMessages = messages.length;
  const userMessages = messages.filter((m) => m.sender === "user").length;
  const botMessages = messages.filter((m) => m.sender === "bot").length;
  const lastMessageTime = messages.length
    ? messages[messages.length - 1].time
    : "—";

  // --- 3. CONDITIONAL RETURN (Check HERE, after all hooks are done) ---
  // Agar user Login page par hai, to yahan se NULL return hoga.
  // Lekin upar wale saare hooks pehle chal chuke honge, isliye error nahi aayega.
  const hideOnRoutes = ["/login", "/register", "/signup", "/"];
  if (hideOnRoutes.includes(location.pathname)) {
    return null; 
  }

  // --- 4. MAIN RENDER ---
  return (
    <div className="shiv-chat-wrapper">
      {/* Chat Window */}
      <div className={`shiv-chat-box ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="shiv-chat-header">
          <div className="shiv-header-left">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
              alt="AI Avatar"
              className="shiv-avatar"
            />
            <div>
              <h3>Shivadda AI</h3>
              <span className="shiv-status">● Online</span>
            </div>
          </div>
          <div className="shiv-header-actions">
            <button
              className="shiv-icon-btn"
              onClick={() => setAutoRead(!autoRead)}
              title="Toggle Auto Read"
              style={{ opacity: autoRead ? 1 : 0.5 }}
            >
              🔊
            </button>
            <button
              className="shiv-icon-btn"
              onClick={refreshChat}
              title="Refresh Chat"
            >
              🔄
            </button>
            <button
              className="shiv-icon-btn"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              📊
            </button>
            <button
              className="shiv-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Analytics Panel */}
        <div className={`shiv-analytics-panel ${showAnalytics ? "open" : ""}`}>
          <h4>Chat Analytics</h4>
          <div className="shiv-analytics-grid">
            <div className="shiv-analytics-card">
              <span>Total Messages</span>
              <strong>{totalMessages}</strong>
            </div>
            <div className="shiv-analytics-card">
              <span>User Messages</span>
              <strong>{userMessages}</strong>
            </div>
            <div className="shiv-analytics-card">
              <span>Bot Messages</span>
              <strong>{botMessages}</strong>
            </div>
            <div className="shiv-analytics-card">
              <span>Last Activity</span>
              <strong>{lastMessageTime}</strong>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="shiv-chat-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`shiv-msg-row ${msg.sender}`}>
              {msg.sender === "bot" && (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                  className="shiv-msg-avatar"
                  alt="bot"
                />
              )}
              <div
                className={`shiv-bubble ${msg.sender} ${
                  msg.isError ? "error" : ""
                }`}
              >
                <div className="shiv-msg-text">{msg.text}</div>
                <div className="shiv-msg-time">{msg.time}</div>
              </div>
              {msg.sender === "user" && (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  className="shiv-msg-avatar user"
                  alt="user"
                />
              )}
            </div>
          ))}

          {loading && (
            <div className="shiv-msg-row bot">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                className="shiv-msg-avatar"
                alt="bot"
              />
              <div className="shiv-bubble bot typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="shiv-chat-footer">
          <button
            className={`shiv-voice-btn ${isListening ? "listening" : ""}`}
            onClick={toggleListening}
          >
            🎙️
          </button>
          <input
            type="text"
            placeholder="Type or speak your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSend} disabled={!input.trim() || loading}>
            ➤
          </button>
        </div>

        <div className="shiv-credit">⚡ Powered by Shivadda AI</div>
      </div>

      {/* Floating Button */}
      <button
        className={`shiv-chat-toggle ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        🤖
      </button>

      {/* Styles */}
      <style>{`
        .shiv-chat-wrapper {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: "Inter", system-ui, sans-serif;
        }

        .shiv-chat-toggle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #7c5cff, #b06cff);
          color: white;
          font-size: 26px;
          cursor: pointer;
          box-shadow: 0 12px 35px rgba(124, 92, 255, 0.6);
          transition: all 0.3s ease;
          animation: pulse 2.8s infinite;
        }
        .shiv-chat-toggle:hover {
          transform: scale(1.15) rotate(-10deg);
        }
        .shiv-chat-toggle.active {
          background: #0f172a;
          animation: none;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(124, 92, 255, 0.5); }
          70% { box-shadow: 0 0 0 18px rgba(124, 92, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(124, 92, 255, 0); }
        }

        .shiv-chat-box {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 600px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(245, 247, 255, 0.98));
          backdrop-filter: blur(18px);
          border-radius: 30px;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: translateY(40px) scale(0.85);
          opacity: 0;
          visibility: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .shiv-chat-box.open {
          transform: translateY(0) scale(1);
          opacity: 1;
          visibility: visible;
        }

        @media (max-width: 640px) {
          .shiv-chat-box {
            width: 100vw;
            height: 100vh;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }
          .shiv-chat-toggle {
            bottom: 20px;
            right: 20px;
            position: fixed;
          }
        }

        .shiv-chat-header {
          background: linear-gradient(135deg, #7c5cff, #b06cff);
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          backdrop-filter: blur(12px);
        }
        .shiv-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .shiv-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          padding: 4px;
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.8);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .shiv-chat-header h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
        }
        .shiv-status {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .shiv-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .shiv-icon-btn {
          background: rgba(255, 255, 255, 0.25);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.25s ease;
          font-size: 16px;
        }
        .shiv-icon-btn:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.15);
        }

        .shiv-close-btn {
          background: rgba(255, 255, 255, 0.25);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .shiv-close-btn:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: rotate(90deg) scale(1.15);
        }

        .shiv-analytics-panel {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.98));
          padding: 0 20px;
          max-height: 0;
          overflow: hidden;
          transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .shiv-analytics-panel.open {
          max-height: 240px;
          padding: 16px 20px 18px;
        }
        .shiv-analytics-panel h4 {
          margin: 0 0 12px;
          font-size: 0.9rem;
          color: #334155;
          font-weight: 600;
        }
        .shiv-analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .shiv-analytics-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          padding: 14px 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: cardPop 0.5s ease both;
        }
        .shiv-analytics-card:nth-child(1) { animation-delay: 0.05s; }
        .shiv-analytics-card:nth-child(2) { animation-delay: 0.1s; }
        .shiv-analytics-card:nth-child(3) { animation-delay: 0.15s; }
        .shiv-analytics-card:nth-child(4) { animation-delay: 0.2s; }

        @keyframes cardPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .shiv-analytics-card span {
          font-size: 0.7rem;
          color: #64748b;
        }
        .shiv-analytics-card strong {
          font-size: 1.35rem;
          color: #1e293b;
        }

        .shiv-chat-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(245, 247, 255, 1));
        }

        .shiv-chat-body::-webkit-scrollbar { width: 5px; }
        .shiv-chat-body::-webkit-scrollbar-thumb {
          background: rgba(124, 92, 255, 0.35);
          border-radius: 10px;
        }

        .shiv-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
        }
        .shiv-msg-row.user {
          justify-content: flex-end;
        }

        .shiv-msg-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: white;
          padding: 4px;
          box-shadow: 0 0 14px rgba(0, 0, 0, 0.12);
        }
        .shiv-msg-avatar.user {
          background: #7c5cff;
          padding: 3px;
        }

        .shiv-bubble {
          max-width: 68%;
          padding: 14px 18px;
          font-size: 0.95rem;
          line-height: 1.6;
          border-radius: 20px;
          animation: msgPop 0.35s ease;
          word-break: break-word;
          position: relative;
        }

        @keyframes msgPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .shiv-bubble.bot {
          background: rgba(255, 255, 255, 0.98);
          color: #1e293b;
          border-radius: 20px 20px 20px 8px;
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.08);
        }

        .shiv-bubble.user {
          background: linear-gradient(135deg, #7c5cff, #b06cff);
          color: white;
          border-radius: 20px 20px 8px 20px;
          box-shadow: 0 10px 28px rgba(124, 92, 255, 0.35);
        }

        .shiv-bubble.error {
          background: rgba(239, 68, 68, 0.15);
          color: #b91c1c;
        }

        .shiv-msg-text { white-space: pre-wrap; }
        .shiv-msg-time {
          font-size: 0.65rem;
          margin-top: 6px;
          text-align: right;
          opacity: 0.55;
        }

        .typing span {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #7c5cff;
          border-radius: 50%;
          margin: 0 3px;
          animation: blink 1.4s infinite both;
        }
        .typing span:nth-child(1) { animation-delay: -0.32s; }
        .typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          20% { opacity: 1; }
        }

        .shiv-chat-footer {
          padding: 16px 18px;
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        .shiv-chat-footer input {
          flex: 1;
          border-radius: 999px;
          border: none;
          outline: none;
          padding: 12px 16px;
          font-size: 0.92rem;
          background: rgba(255, 255, 255, 1);
          color: #1e293b;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
        }
        .shiv-chat-footer input::placeholder { color: #64748b; }

        .shiv-chat-footer button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #7c5cff, #b06cff);
          color: white;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 0 22px rgba(124, 92, 255, 0.7);
        }
        .shiv-chat-footer button:hover:not(:disabled) {
          transform: scale(1.15) rotate(-10deg);
        }
        .shiv-chat-footer button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .shiv-voice-btn {
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(0, 0, 0, 0.08);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .shiv-voice-btn:hover {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.12);
        }
        .shiv-voice-btn.listening {
          background: #ef4444;
          color: white;
          animation: pulseRed 1.2s infinite;
        }

        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          70% { box-shadow: 0 0 0 16px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .shiv-credit {
          text-align: center;
          font-size: 0.7rem;
          color: #475569;
          padding: 8px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
}