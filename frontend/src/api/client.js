import axios from 'axios';
import { addToOfflineQueue, getOfflineQueue, clearOfflineQueue } from '../utils/offlineQueue';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('swasthya_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// API Methods
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const casesApi = {
  report: async (caseData) => {
    if (!navigator.onLine) {
      addToOfflineQueue(caseData);
      return { data: { offline: true, message: 'Saved to local offline queue. Will sync automatically when connection restores.' } };
    }
    try {
      return await api.post('/cases/report', caseData);
    } catch (err) {
      if (!err.response) {
        addToOfflineQueue(caseData);
        return { data: { offline: true, message: 'Saved to offline queue due to network failure.' } };
      }
      throw err;
    }
  },
  syncBatch: (batch) => api.post('/cases/sync', batch),
  list: (params) => api.get('/cases', { params }),
};

export const waterApi = {
  logObservation: (obsData) => api.post('/water/observation', obsData),
  listObservations: (params) => api.get('/water/observations', { params }),
};

export const riskApi = {
  predict: (data) => api.post('/risk/predict', data),
  getMapData: (params) => api.get('/map/risk', { params }),
  getClusters: () => api.get('/clusters'),
  simulateSurge: (params) => api.post('/risk/simulate-surge', null, { params }),
  simulateReset: (params) => api.post('/risk/simulate-reset', null, { params }),
};

export const alertsApi = {
  list: (params) => api.get('/alerts', { params }),
  investigate: (data) => api.post('/alerts/investigate', data),
  confirm: (data) => api.post('/alerts/confirm', data),
  reject: (data) => api.post('/alerts/reject', data),
  getPublicWarnings: () => api.get('/alerts/warnings'),
};

export const guidelinesApi = {
  getAll: () => api.get('/guidelines'),
  getByDisease: (disease) => api.get(`/guidelines/${encodeURIComponent(disease)}`),
  save: (guideline) => api.post('/guidelines', guideline),
  delete: (disease) => api.delete(`/guidelines/${encodeURIComponent(disease)}`),
};

export const analyticsApi = {
  getMetrics: () => api.get('/analytics'),
};

export const adminApi = {
  getAllData: () => api.get('/admin/all-data'),
  getDbStats: () => api.get('/admin/db-stats'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role?new_role=${encodeURIComponent(role)}`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  deleteRecord: (colName, recordId) => api.delete(`/admin/records/${colName}/${recordId}`),
};
