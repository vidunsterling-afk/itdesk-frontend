import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

const API = axios.create({
  baseURL: `${baseURL}/api/months`,
});

// 🔹 Month operations
export const getMonths = () => API.get("/");
export const createMonth = (data) => API.post("/", data);
export const updateMonth = (id, data) => API.put(`/${id}`, data);
export const deleteMonth = (id) => API.delete(`/${id}`);
export const addAddon = (id, data) => API.post(`/${id}/addon`, data);
