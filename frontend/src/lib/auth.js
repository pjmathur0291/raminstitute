import api from "./api";

const TOKEN_KEY = "rihm_token";
const USER_KEY = "rihm_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function isAuthed() { return !!getToken(); }

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function fetchMe() {
  try {
    const { data } = await api.get("/auth/me");
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  } catch {
    logout();
    return null;
  }
}
