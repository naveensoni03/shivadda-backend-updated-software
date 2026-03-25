import axios from "axios";

const api = axios.create({
  baseURL: "https://shivadda-backend-updated-software.onrender.com/api/",
  // baseURL: "http://127.0.0.1:8000/api/",
  withCredentials: false
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    // 🚀 MEGA FIX: Agar URL mein 'send-otp' ya 'login' hai, toh Token MAT bhejo!
    if (token && !config.url.includes('send-otp') && !config.url.includes('login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🚀 SMART FIX FOR ALL REQUESTS (File upload vs JSON)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🚨 ==========================================
    // 🔥 LICENSE EXPIRED LOGIC (402 Payment Required)
    // ==============================================
    if (error.response?.status === 402 && error.response?.data?.code === "LICENSE_EXPIRED") {
      document.body.innerHTML = `
            <div style="display:flex; height:100vh; width:100%; background-color:#0f172a; color:white; justify-content:center; align-items:center; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align:center; padding: 20px; box-sizing: border-box; position: fixed; top:0; left:0; z-index:999999;">
                <div style="background:#1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); max-width: 600px;">
                    <div style="font-size: 4rem; margin-bottom: 10px;">⏳</div>
                    <h1 style="color:#ef4444; font-size:2.2rem; margin:0 0 15px 0; font-weight:800;">System Locked</h1>
                    <p style="font-size:1.1rem; color:#cbd5e1; line-height: 1.6; margin:0 0 25px 0;">
                        Your software license has reached its 6-month validity limit and has expired. All operations have been temporarily halted.
                    </p>
                    <div style="background:#0f172a; padding:20px; border-radius:12px; text-align: left; border-left: 4px solid #3b82f6;">
                        <h3 style="margin:0 0 10px 0; color:#38bdf8; font-size:1.1rem;">Contact Your Developer</h3>
                        <p style="margin:0 0 8px 0; color:#e2e8f0; font-weight: 500;">Name: Vishal Sharma (Shiv Adda Tech)</p>
                        <p style="margin:0 0 8px 0; color:#94a3b8;">Email: (Add your email here)</p>
                        <p style="margin:0; color:#94a3b8;">Phone: (Add your phone number here)</p>
                    </div>
                </div>
            </div>
        `;
      return Promise.reject(error);
    }

    // 🔄 ==========================================
    // PURANA 401 (UNAUTHORIZED) LOGIC
    // ==========================================
    if (error.response?.status === 401) {
      localStorage.clear();
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login")) {
        if (currentPath.startsWith("/student")) {
          window.location.href = "/student/login";
        } else {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;