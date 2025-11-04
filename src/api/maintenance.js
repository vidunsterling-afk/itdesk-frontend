import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

const API = axios.create({
  baseURL: `${baseURL}/api/maintenance`,
});

const token = localStorage.getItem("token");
if (token) API.defaults.headers.Authorization = `Bearer ${token}`;

export const createReminder = (data) => API.post("/", data);
export const getReminders = () => API.get("/");
export const markReturned = (id) => API.put(`/return/${id}`);
export const deleteReminder = (id) => API.delete(`/${id}`);
export const getReport = () => API.get("/report");
export const getReportExport = () =>
  API.get("/report/export", { responseType: "blob" });
