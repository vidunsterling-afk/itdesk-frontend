import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add JWT automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Assign asset(s) to employee
export const assignAssets = async (employeeId, assetIds, type = "assigned", sendEmail = true) => {
  return API.put(`/employees/assign/${employeeId}`, { assetIds, type, sendEmail });
};
