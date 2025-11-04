import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

const API = axios.create({
  baseURL: `${baseURL}/api/assets`,
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Asset API functions
export const getAssets = () => API.get("/"); // Get all assets
export const getAssetById = (id) => API.get(`/${id}`); // Get single asset
export const addAsset = (data) => API.post("/", data); // Add new asset
export const updateAsset = (id, data) => API.put(`/${id}`, data); // Update asset
export const deleteAsset = (id) => API.delete(`/${id}`); // Delete asset
// Download assets report as Excel
export const downloadAssetsExcel = () =>
  API.get("/export/excel", { responseType: "blob" });
