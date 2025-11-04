import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/attendance",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Send fingerprint assignment emails
export const assignFingerprint = (data) => API.post("/notify", data);
