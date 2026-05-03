import axios from "axios";

const API = axios.create({
  // Dev: uses Vite proxy (/api → localhost:5000)
  // Production: set VITE_API_URL=https://your-backend.onrender.com/api in Vercel
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
