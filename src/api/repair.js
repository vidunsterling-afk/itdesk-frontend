import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

const API = axios.create({
  baseURL: `${baseURL}/api/repair`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Repair API functions
export const fetchRepairs = (status) =>
  API.get(status ? `?status=${status}` : "/");
export const fetchRepairById = (id) => API.get(`/${id}`);
export const createRepair = (data) => API.post("/", data);
export const markReturned = (id, data) =>
  API.put(`/${id}/return`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteRepair = (id) => API.delete(`/${id}`);
