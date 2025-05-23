import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("supabase.auth.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;