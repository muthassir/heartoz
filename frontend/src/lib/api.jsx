// client/src/lib/api.js
import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL:         "https://heartoz.onrender.com/api",
  // baseURL:      "http://localhost:5000/api",
  withCredentials: true,
});

// Attach fresh Firebase token to every request
api.interceptors.request.use(async (config) => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    // getIdToken() auto-refreshes if expired
    const token = await firebaseUser.getIdToken();
    localStorage.setItem("az_token", token);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — clear and redirect to login
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
export const syncUser  = ()      => api.post("/auth/sync");  
export const getMe     = ()      => api.get("/auth/me");
export const logout    = ()      => api.post("/auth/logout");

// ── Invites ────────────────────────────────────────────────────────────────
export const createInvite = ()     => api.post("/invites");
export const joinInvite   = (code) => api.post("/invites/join", { code });

// ── Couple ─────────────────────────────────────────────────────────────────
export const getCouple   = (id)    => api.get(`/couples/${id}`);
export const leaveCouple = (id)    => api.delete(`/couples/${id}`);

// Dates
export const updateDate = (coupleId, letter, data) =>
  api.patch(`/couples/${coupleId}/dates/${letter}`, data);

// Buckets
export const addBucket    = (coupleId, data)     => api.post(`/couples/${coupleId}/buckets`, data);
export const updateBucket = (coupleId, id, data) => api.patch(`/couples/${coupleId}/buckets/${id}`, data);
export const deleteBucket = (coupleId, id)       => api.delete(`/couples/${coupleId}/buckets/${id}`);

// Memories
export const addMemory    = (coupleId, data)     => api.post(`/couples/${coupleId}/memories`, data);
export const updateMemory = (coupleId, id, data) => api.patch(`/couples/${coupleId}/memories/${id}`, data);
export const deleteMemory = (coupleId, id)       => api.delete(`/couples/${coupleId}/memories/${id}`);

// Scores
export const addScore = (coupleId, userId, points) =>
  api.patch(`/couples/${coupleId}/scores`, { userId, points });

export const toggleIdeaFav  = (coupleId, ideaId) => api.patch(`/couples/${coupleId}/ideas/fav`,  { ideaId });
export const toggleIdeaDone = (coupleId, ideaId) => api.patch(`/couples/${coupleId}/ideas/done`, { ideaId });