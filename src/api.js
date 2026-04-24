import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:8080'
});

// ✦ THE INTERCEPTOR ✦
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or wherever you saved it in Auth.jsx
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;