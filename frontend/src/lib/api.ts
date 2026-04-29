import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  signup: (name: string, email: string, password: string) =>
    api.post('/auth/signup', { name, email, password }),
  me: () => api.get('/auth/me'),
};

// ─── Documents ───
export const documentsAPI = {
  upload: (files: File[], onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },
  list: () => api.get('/documents'),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// ─── Chat ───
export const chatAPI = {
  query: (question: string, conversationId?: string) =>
    api.post('/chat/query', { question, conversation_id: conversationId }),
  conversations: () => api.get('/chat/conversations'),
  messages: (id: string) => api.get(`/chat/conversations/${id}`),
};

// ─── Search ───
export const searchAPI = {
  search: (query: string, filters?: { type?: string; category?: string }) =>
    api.post('/search', { query, ...filters }),
  suggestions: (query: string) => api.get(`/search/suggestions?q=${query}`),
};

// ─── Analytics ───
export const analyticsAPI = {
  overview: () => api.get('/analytics/overview'),
  queries: () => api.get('/analytics/queries'),
  compliance: () => api.get('/analytics/compliance'),
};

// ─── Admin ───
export const adminAPI = {
  users: () => api.get('/admin/users'),
  logs: () => api.get('/admin/logs'),
  indexing: () => api.get('/admin/indexing'),
};

export default api;
