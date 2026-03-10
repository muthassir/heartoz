// client/src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://heartoz.onrender.com/api",
    // baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("az_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear token and reload to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("az_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ───────────────────────────────────────────────────────────────────
export const getMe       = ()       => api.get("/auth/me");
export const logout      = ()       => api.post("/auth/logout");

// ── Invites ────────────────────────────────────────────────────────────────
export const createInvite = ()      => api.post("/invites");
export const joinInvite   = (code)  => api.post("/invites/join", { code });

// ── Couple ─────────────────────────────────────────────────────────────────
export const getCouple    = (id)    => api.get(`/couples/${id}`);
export const leaveCouple  = (id)    => api.delete(`/couples/${id}`);

// Dates
export const updateDate = (coupleId, letter, data) =>
  api.patch(`/couples/${coupleId}/dates/${letter}`, data);

// Buckets
export const addBucket    = (coupleId, data) => api.post(`/couples/${coupleId}/buckets`, data);
export const updateBucket = (coupleId, id, data) => api.patch(`/couples/${coupleId}/buckets/${id}`, data);
export const deleteBucket = (coupleId, id) => api.delete(`/couples/${coupleId}/buckets/${id}`);

// Memories
export const addMemory    = (coupleId, data) => api.post(`/couples/${coupleId}/memories`, data);
export const updateMemory = (coupleId, id, data) => api.patch(`/couples/${coupleId}/memories/${id}`, data);
export const deleteMemory = (coupleId, id) => api.delete(`/couples/${coupleId}/memories/${id}`);

// Scores
export const addScore = (coupleId, userId, points) =>
  api.patch(`/couples/${coupleId}/scores`, { userId, points });