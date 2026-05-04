import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Landmark, Save, CreditCard, User, ShieldCheck, Info, ArrowRight, Building2, MapPin, Lock, CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
            toast.success("Payout profile verified! ??");
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Verification Failed ?");
        } finally { setLoading(false); }
    };

    const s = { p: "14px 16px", br: "16px", b: "1.5px solid #e2e8f0", w: "100%", mb: "20px", fs: "15px" };

    return (
        <div style={{ padding: "40px 20px", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", background: "white", borderRadius: "32px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.03)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "40px", color: "white" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <Landmark size={32} /><h1 style={{ margin: 0, fontSize: "28px", fontWeight: "900" }}>Banking & Payouts</h1>
                    </div>
                </div>
                <div style={{ padding: "40px" }}>
                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={{ fontSize: "12px", fontWeight: "800", color: "#64748b" }}>NAME</label>
                            <input required value={bankData.account_holder_name} onChange={e => setBankData({...bankData, account_holder_name: e.target.value})} style={{ ...s, border: "1.5px solid #e2e8f0", padding: "14px", borderRadius: "12px", width: "100%", boxSizing: "border-box" }} />
                        </div>
                        <input placeholder="Bank Name" required value={bankData.bank_name} onChange={e => setBankData({...bankData, bank_name: e.target.value})} style={{ ...s, padding: "14px", borderRadius: "12px", width: "100%", boxSizing: "border-box" }} />
                        <input placeholder="IFSC" required value={bankData.ifsc_code} onChange={e => setBankData({...bankData, ifsc_code: e.target.value})} style={{ ...s, padding: "14px", borderRadius: "12px", width: "100%", boxSizing: "border-box" }} />
                        <div style={{ gridColumn: "span 2" }}>
                            <input type="password" placeholder="Account Number" required value={bankData.account_number} onChange={e => setBankData({...bankData, account_number: e.target.value})} style={{ ...s, padding: "14px", borderRadius: "12px", width: "100%", boxSizing: "border-box" }} />
                        </div>
                        <button type="submit" disabled={loading} style={{ gridColumn: "span 2", padding: "18px", borderRadius: "20px", border: "none", background: isSaved ? "#10b981" : "#4f46e5", color: "white", fontWeight: "800", cursor: "pointer" }}>
                            {loading ? "Verifying..." : (isSaved ? "Saved ?" : "Authorize & Link Account")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
