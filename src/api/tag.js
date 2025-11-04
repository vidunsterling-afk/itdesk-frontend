import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/tags",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createTag = (data) => API.post("/", data);
export const getTags = () => API.get("/");
export const deleteTag = (id) => API.delete(`/${id}`);
