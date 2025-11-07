import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

const API = axios.create({
  baseURL: `${baseURL}/api/reports`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const uploadReport = (data) => API.post("/upload", data);
export const getReports = () => API.get("/");
