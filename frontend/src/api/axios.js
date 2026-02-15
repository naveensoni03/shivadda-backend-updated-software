import axios from "axios";

const api = axios.create({
  // ✅ LOCALHOST (Abhi testing ke liye ye use karein)
  baseURL: "http://127.0.0.1:8000/api/",
  
  // ❌ RENDER (Jab final live karna ho tab isse uncomment karein)
  // baseURL: "https://naveen-education.onrender.com/api/",
  
  withCredentials: false, 
});

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