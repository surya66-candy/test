import axios from 'axios';
import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired — redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================
// Auth API
// ========================
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  registerClub: (data) => api.post('/auth/register-club', data),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
  getProfile: () => api.get('/auth/profile'),
};

// ========================
// Clubs API
// ========================
export const clubsApi = {
  list: (params) => api.get('/clubs', { params }),
  get: (clubId) => api.get(`/clubs/${clubId}`),
  getBySlug: (slug) => api.get(`/clubs/slug/${slug}`),
  create: (data) => api.post('/clubs', data),
  update: (clubId, data) => api.put(`/clubs/${clubId}`, data),
  delete: (clubId) => api.delete(`/clubs/${clubId}`),
  getHistory: (clubId) => api.get(`/clubs/${clubId}/history`),
  addHistory: (clubId, data) => api.post(`/clubs/${clubId}/history`, data),
  updateHistory: (clubId, historyId, data) => api.put(`/clubs/${clubId}/history/${historyId}`, data),
  deleteHistory: (clubId, historyId) => api.delete(`/clubs/${clubId}/history/${historyId}`),
};

// ========================
// Members API
// ========================
export const membersApi = {
  list: (clubId, params) => api.get(`/clubs/${clubId}/members`, { params }),
  get: (memberId) => api.get(`/members/${memberId}`),
  add: (clubId, data) => api.post(`/clubs/${clubId}/members`, data),
  update: (memberId, data) => api.put(`/members/${memberId}`, data),
  remove: (memberId) => api.delete(`/members/${memberId}`),
  export: (clubId) => api.get(`/clubs/${clubId}/members/export`, { responseType: 'blob' }),
};

// ========================
// Forum API
// ========================
export const forumApi = {
  listThreads: (params) => api.get('/forums/threads', { params }),
  getThread: (threadId) => api.get(`/forums/threads/${threadId}`),
  createThread: (data) => api.post('/forums/threads', data),
  updateThread: (threadId, data) => api.put(`/forums/threads/${threadId}`, data),
  deleteThread: (threadId) => api.delete(`/forums/threads/${threadId}`),
  pinThread: (threadId) => api.patch(`/forums/threads/${threadId}/pin`),
  lockThread: (threadId) => api.patch(`/forums/threads/${threadId}/lock`),
  getReplies: (threadId) => api.get(`/forums/threads/${threadId}/replies`),
  addReply: (threadId, data) => api.post(`/forums/threads/${threadId}/replies`, data),
  updateReply: (replyId, data) => api.put(`/forums/replies/${replyId}`, data),
  deleteReply: (replyId) => api.delete(`/forums/replies/${replyId}`),
  vote: (replyId, type) => api.post(`/forums/replies/${replyId}/vote`, { vote_type: type }),
};

// ========================
// Notifications API
// ========================
export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default api;
