import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/maintenance",
});

const token = localStorage.getItem("token");
if (token) API.defaults.headers.Authorization = `Bearer ${token}`;

export const createReminder = (data) => API.post("/", data);
export const getReminders = () => API.get("/");
export const markReturned = (id) => API.put(`/return/${id}`);
export const deleteReminder = (id) => API.delete(`/${id}`);
export const getReport = () => API.get("/report");
export const getReportExport = () => API.get("/report/export", { responseType: "blob" });
