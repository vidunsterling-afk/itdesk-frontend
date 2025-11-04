import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/bills",
});

// Optional: add token if you want auth later
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const getBills = () => API.get("/");
export const createBill = (data) => API.post("/", data);
export const payBill = (id) => API.patch(`/pay/${id}`);
export const deleteBill = (id) => API.delete(`/${id}`);
export const sendEmailReminders = () => API.get("/send-email-reminders");
export const getReports = () => API.get("/reports");
export const getPendingBillCount = () => API.get("/pending-count");