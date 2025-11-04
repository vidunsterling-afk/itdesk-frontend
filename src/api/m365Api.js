import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

// Base API instance
const API = axios.create({
  baseURL: `${baseURL}/api/m365`, // replace with your production URL if needed
});

// Attach token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- API calls ---

// 1️⃣ Get all M365 usage data
export const getM365Usage = () => API.get("/usage");

// 2️⃣ Manually refresh/sync data
export const refreshM365Usage = () => API.get("/refresh");

// 3️⃣ Get last sync date
export const getLastSync = () => API.get("/lastSync");

// 4️⃣ High usage alerts
export const getHighUsageAlerts = () => API.get("/alerts/high-usage");

// 5️⃣ Inactive accounts (default 60 days)
export const getInactiveUsers = (days = 60) =>
  API.get(`/alerts/inactive?days=${days}`);

// 6️⃣ Growth trends per user
export const getGrowthTrends = (userPrincipalName) =>
  API.get(`/analytics/trends/${encodeURIComponent(userPrincipalName)}`);

// 7️⃣ Top OneDrive storage users
export const getTopStorageUsers = () => API.get("/analytics/top-storage");
