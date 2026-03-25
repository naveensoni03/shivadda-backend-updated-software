import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { User, KeyRound, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function ParentLogin() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!emailOrPhone) return toast.error("Please enter Email or Mobile Number");

        setLoading(true);
        try {
            await api.post("auth/send-otp/", { email_or_phone: emailOrPhone });
            toast.success("OTP Sent Successfully! Check your inbox.");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send OTP. User not found.");
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error("Please enter the OTP");

        setLoading(true);
        try {
            const response = await api.post("auth/login/", {
                email_or_phone: emailOrPhone,
                otp: otp
            });

            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);
            localStorage.setItem("user_role", "Parent");

            toast.success("Login Successful!");

            setTimeout(() => {
                navigate("/parent/dashboard");
            }, 1000);

        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid OTP. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="login-wrapper">
            <Toaster position="top-right" />

            {/* Soft Light Theme Animated Background Blobs */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="login-card light-glass-effect">
                <div className="logo-box floating">
                    <ShieldCheck size={32} strokeWidth={2.5} />
                </div>
                <h2>Parent Portal</h2>
                <p>Secure access to your child's academic journey</p>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="fade-in-form">
                        <div className="input-group">
                            <label>Registered Email or Mobile</label>
                            <div className="input-with-icon">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter your email or phone"
                                    value={emailOrPhone}
                                    onChange={(e) => setEmailOrPhone(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="spinner" size={18} /> Sending OTP...</>
                            ) : (
                                <>Get OTP <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="fade-in-form">
                        <div className="input-group">
                            <label>Enter 6-Digit Security OTP</label>
                            <div className="input-with-icon">
                                <KeyRound className="input-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    disabled={loading}
                                    maxLength={6}
                                    className="otp-input"
                                />
                            </div>
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="spinner" size={18} /> Verifying...</>
                            ) : (
                                <>Secure Login <ArrowRight size={18} /></>
                            )}
                        </button>
                        <p className="resend-text" onClick={() => setStep(1)}>
                            Didn't receive OTP? <span>Go back</span>
                        </p>
                    </form>
                )}
            </div>

            <style>{`
                /* Light Background & Layout */
                .login-wrapper { position: relative; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }
                
                /* Soft Animated Blobs for Light Theme */
                .blob { position: absolute; filter: blur(90px); z-index: 1; opacity: 0.6; animation: moveBlobs 12s infinite alternate ease-in-out; }
                .blob-1 { width: 500px; height: 500px; background: #c7d2fe; top: -150px; left: -100px; border-radius: 50%; }
                .blob-2 { width: 400px; height: 400px; background: #fbcfe8; bottom: -100px; right: -50px; border-radius: 50%; animation-delay: 2s; }
                .blob-3 { width: 300px; height: 300px; background: #e9d5ff; top: 20%; left: 60%; border-radius: 50%; animation-delay: 4s; }

                /* Light Glassmorphism Card */
                .login-card { position: relative; z-index: 2; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.6); padding: 45px 40px; border-radius: 24px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08), 0 0 20px rgba(255,255,255,0.5) inset; width: 100%; max-width: 420px; text-align: center; animation: slideUpFade 0.6s ease-out forwards; }
                
                /* Logo Animation */
                .logo-box { width: 65px; height: 65px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; border-radius: 18px; margin: 0 auto 20px auto; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3); }
                .floating { animation: float 3s ease-in-out infinite; }

                /* Typography (Darker for light theme) */
                .login-card h2 { margin: 0 0 8px 0; color: #0f172a; font-weight: 900; font-size: 1.8rem; letter-spacing: -0.5px; }
                .login-card p { color: #64748b; font-size: 0.95rem; font-weight: 500; margin-bottom: 35px; }
                
                /* Inputs for Light Theme */
                .input-group { text-align: left; margin-bottom: 25px; }
                .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
                
                .input-with-icon { position: relative; display: flex; align-items: center; }
                .input-icon { position: absolute; left: 16px; color: #94a3b8; transition: color 0.3s; }
                
                .input-with-icon input { width: 100%; padding: 14px 16px 14px 45px; background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 1rem; color: #1e293b; outline: none; transition: all 0.3s ease; box-sizing: border-box; }
                .input-with-icon input::placeholder { color: #94a3b8; }
                .input-with-icon input:focus { border-color: #6366f1; background: #ffffff; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
                .input-with-icon input:focus + .input-icon, .input-with-icon input:not(:placeholder-shown) ~ .input-icon { color: #6366f1; }
                
                .otp-input { letter-spacing: 8px; font-weight: 700; font-size: 1.2rem !important; }

                /* Vibrant Gradient Button */
                .login-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; border: none; border-radius: 12px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3); }
                .login-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.4); }
                .login-btn:active:not(:disabled) { transform: translateY(0); }
                .login-btn:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; opacity: 0.7; }

                /* Extra Text */
                .resend-text { margin-top: 25px; color: #64748b; font-size: 0.9rem; font-weight: 500; }
                .resend-text span { color: #4f46e5; font-weight: 700; cursor: pointer; transition: color 0.2s; }
                .resend-text span:hover { color: #4338ca; text-decoration: underline; }

                /* Keyframe Animations */
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
                @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes moveBlobs { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(40px, 50px) scale(1.05); } }
                .fade-in-form { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { 0% { opacity: 0; transform: translateX(-10px); } 100% { opacity: 1; transform: translateX(0); } }
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}