import axios from "axios";

const api = axios.create({
  // ✅ Live Render URL (with /api/ at the end)
  baseURL: "https://shivadda-backend-updated-software.onrender.com/api/",
  withCredentials: false
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
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
    if (error.response?.status === 401) {
      // Token expire hone par local storage saaf karo
      localStorage.clear();

      const currentPath = window.location.pathname;

      // 🚀 SMART REDIRECT LOGIC
      // Agar user pehle se kisi login page par nahi hai, tabhi redirect karo (infinite loop se bachne ke liye)
      if (!currentPath.includes("/login")) {

        // Agar URL mein "/student" hai, toh usko student ke login page par bhejo
        if (currentPath.startsWith("/student")) {
          window.location.href = "/student/login";
        } else {
          // Warna default Admin/Main login par bhejo
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;