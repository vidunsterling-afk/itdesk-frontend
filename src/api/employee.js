import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

const API = axios.create({
  baseURL: `${baseURL}/api/employees`,
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Employee API
export const getEmployees = () => API.get("/");
export const addEmployee = (data) => API.post("/", data);
export const updateEmployee = (id, data) => API.put(`/${id}`, data);
export const deleteEmployee = (id) => API.delete(`/${id}`);
export const getEmployeeById = (id) => API.get(`/${id}`);
export const unassignAssets = (employeeId, assetIds, type) =>
  API.put(`/unassign/${employeeId}`, { assetIds, type });
export const exportEmployeesExcel = () =>
  API.get("/export-excel", { responseType: "blob" });
