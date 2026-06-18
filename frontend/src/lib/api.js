import axios from "axios";

// Empty = same origin (e.g. Vercel monorepo at /api)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rihm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
