import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

const API = axios.create({
  baseURL: `${baseURL}/api/software`,
});

const token = localStorage.getItem("token");
if (token) API.defaults.headers.Authorization = `Bearer ${token}`;

export const getSoftware = () => API.get("/");
export const addSoftware = (data) => API.post("/", data);
export const updateSoftware = (id, data) => API.put(`/${id}`, data);
export const deleteSoftware = (id) => API.delete(`/${id}`);
