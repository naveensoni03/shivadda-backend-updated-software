import axios from "axios";

const api = axios.create({
  // ✅ FIXED: Localhost हटाकर आपका Render का Live Server URL डाल दिया है
  // baseURL: "https://shivadda-backend-updated-software.onrender.com/api/",
  baseURL: "http://127.0.0.1:8000/api/",
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