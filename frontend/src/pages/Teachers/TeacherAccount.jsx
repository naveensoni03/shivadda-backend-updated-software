import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
    Landmark, CreditCard, User, ShieldCheck,
    Building2, MapPin, Lock, Loader2, CheckCircle2,
    ArrowRight, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// 🔴 FIX 1: PremiumInput ko main component ke BAHAR define kiya gaya hai
// Taki har keystroke par ye wapas se re-create na ho aur cursor focus na tute.
const PremiumInput = ({ icon: Icon, label, required, ...props }) => (
    <div className="input-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginLeft: "4px" }}>
            {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <input
                className="premium-input"
                required={required}
                {...props}
            />
        </div>
    </div>
);

export default function TeacherAccount() {
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [bankData, setBankData] = useState({
        account_holder_name: "", bank_name: "", account_number: "", ifsc_code: "", branch_name: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("access") || localStorage.getItem("access_token");
            const url = API + "/api/payments/teacher-bank-details/";
            await axios.post(url, bankData, {
                headers: { "Authorization": "Bearer " + token }
            });
            toast.success("Payout profile securely verified! 🚀");
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Verification Failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "30px 15px 60px 15px", minHeight: "100vh", backgroundColor: "#f8fafc", position: 'relative', overflowX: 'hidden', overflowY: 'auto' }}>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '10px', fontSize: '0.9rem' } }} />

            {/* Background Blur Blobs for Aesthetic */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ maxWidth: "650px", margin: "0 auto", background: "white", borderRadius: "20px", boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.05)", border: "1px solid #f1f5f9", position: 'relative', zIndex: 10, overflow: 'hidden' }}
            >
                {/* 🛡️ Header Section */}
                <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", padding: "25px 35px", color: "white", position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '0', top: '0', opacity: '0.04', transform: 'scale(1.2) translate(10%, -20%)' }}>
                        <Landmark size={200} />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ShieldCheck size={14} color="#4ade80" /> SECURE PAYOUT PORTAL
                        </div>
                        <h1 style={{ margin: "0 0 6px 0", fontSize: "1.6rem", fontWeight: "900", letterSpacing: "-0.5px" }}>Banking & Earnings</h1>
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", maxWidth: "90%", lineHeight: "1.4" }}>
                            Update your bank details to receive your salary and bonuses directly into your account.
                        </p>
                    </div>
                </div>

                {/* 🔒 Security Banner */}
                <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '12px 35px', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Lock size={16} />
                    <span>Protected with military-grade 256-bit AES encryption.</span>
                </div>

                {/* 📝 Form Section */}
                <div style={{ padding: "25px 35px" }}>
                    {/* 🔴 FIX 2: autoComplete="off" on form to prevent generic autofill */}
                    <form autoComplete="off" onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                        <div style={{ gridColumn: "span 2" }}>
                            <PremiumInput
                                label="Account Holder Name"
                                name="account_holder_name" // Added name
                                icon={User}
                                placeholder="e.g. John Doe"
                                required
                                autoComplete="off"
                                value={bankData.account_holder_name}
                                onChange={e => setBankData({ ...bankData, account_holder_name: e.target.value })}
                            />
                        </div>

                        <PremiumInput
                            label="Bank Name"
                            name="bank_name" // Added name
                            icon={Building2}
                            placeholder="e.g. HDFC Bank"
                            required
                            autoComplete="off"
                            value={bankData.bank_name}
                            onChange={e => setBankData({ ...bankData, bank_name: e.target.value })}
                        />

                        <PremiumInput
                            label="IFSC Code"
                            name="ifsc_code" // Added name
                            icon={Landmark}
                            placeholder="e.g. HDFC0001234"
                            required
                            autoComplete="off" // Prevents admin@gmail from appearing
                            value={bankData.ifsc_code}
                            onChange={e => setBankData({ ...bankData, ifsc_code: e.target.value.toUpperCase() })}
                            style={{ textTransform: 'uppercase' }}
                        />

                        <div style={{ gridColumn: "span 2" }}>
                            <PremiumInput
                                label="Account Number"
                                name="account_number" // Added name
                                icon={CreditCard}
                                type="password"
                                placeholder="Enter your 9-18 digit account number"
                                required
                                autoComplete="new-password" // Strongly tells browser this is NOT a saved password login
                                value={bankData.account_number}
                                onChange={e => setBankData({ ...bankData, account_number: e.target.value })}
                            />
                        </div>

                        <div style={{ gridColumn: "span 2" }}>
                            <PremiumInput
                                label="Branch Location"
                                name="branch_name" // Added name
                                icon={MapPin}
                                placeholder="e.g. Connaught Place, New Delhi"
                                autoComplete="off"
                                value={bankData.branch_name}
                                onChange={e => setBankData({ ...bankData, branch_name: e.target.value })}
                            />
                        </div>

                        {/* Info Note */}
                        <div style={{ gridColumn: "span 2", display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                            <Info size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
                                Double-check your Account Number and IFSC code before submitting to avoid payout delays.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`submit-btn ${isSaved ? 'saved' : ''}`}
                            style={{ gridColumn: "span 2", marginTop: '8px' }}
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Loader2 className="animate-spin" size={18} /> Processing...
                                    </motion.div>
                                ) : isSaved ? (
                                    <motion.div key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <CheckCircle2 size={18} /> Account Linked
                                    </motion.div>
                                ) : (
                                    <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        Authorize & Save Details <ArrowRight size={18} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* CSS Styles injection for Compact Premium Inputs */}
            <style>{`
                .premium-input {
                    width: 100%;
                    padding: 12px 14px 12px 40px;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    background-color: #f8fafc;
                    font-size: 0.9rem;
                    color: #1e293b;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                    font-family: inherit;
                }

                .premium-input::placeholder {
                    color: #94a3b8;
                    font-weight: 500;
                }

                .premium-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    background-color: #ffffff;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .premium-input:-webkit-autofill {
                    -webkit-box-shadow: 0 0 0 1000px #f8fafc inset !important;
                    -webkit-text-fill-color: #1e293b !important;
                    transition: background-color 5000s ease-in-out 0s;
                }

                .submit-btn {
                    padding: 14px;
                    border-radius: 14px;
                    border: none;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    font-weight: 800;
                    font-size: 0.95rem;
                    cursor: pointer;
                    box-shadow: 0 10px 20px -8px rgba(99, 102, 241, 0.5);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    position: relative;
                }

                .submit-btn:disabled {
                    opacity: 0.8;
                    cursor: not-allowed;
                }

                .submit-btn.saved {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 10px 20px -8px rgba(16, 185, 129, 0.5);
                }

                @media (max-width: 600px) {
                    form {
                        grid-template-columns: 1fr !important;
                    }
                    .premium-input {
                        grid-column: span 1 !important;
                    }
                }
            `}</style>
        </div>
    );
}