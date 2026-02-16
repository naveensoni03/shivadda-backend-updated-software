
import axios from "axios";

const api = axios.create({
    // ✅ Yahan Live Render ka URL daal diya hai
    baseURL: "https://shivadda-backend-updated-software.onrender.com/api/",
    withCredentials: false
});

// ... baaki poora code waisa hi rahega ...
api.interceptors.request.use(
  (config) => {
    // ✅ Fix: Token name 'access_token' match kiya
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      // Loop se bachne ke liye check karein
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;