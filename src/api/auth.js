import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URI;

const API = axios.create({
  baseURL: `${baseURL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/profile");

export const getUsers = () => API.get("/users");
export const getUserById = (id) => API.get(`/users/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

export const getServerPing = async () => {
  try {
    const res = await API.get("/ping");
    return res.data;
  } catch (err) {
    console.error("Ping failed:", err);
    return null;
  }
};
