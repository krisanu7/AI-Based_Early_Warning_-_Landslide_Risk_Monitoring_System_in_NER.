import axios from 'axios';
import { addToOfflineQueue, getOfflineQueue, clearOfflineQueue } from '../utils/offlineQueue';

const getApiBaseUrl = () => {
  // If explicitly configured in environment, use it (ignore if localhost in production build)
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When accessed from localhost or local LAN IP (e.g. 10.x.x.x, 192.168.x.x, etc.)
    // connect to the local backend running on port 8000
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.') ||
      host.endsWith('.local') ||
      /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(host)
    ) {
      return `http://${host}:8000/api`;
    }
    // Dev tunnels (e.g. localtunnel, ngrok, cloudflare tunnel to local dev server)
    if (host.includes('loca.lt') || host.includes('ngrok') || host.includes('trycloudflare.com')) {
      return '/api';
    }
    // On Vercel or any cloud-hosted domain, connect directly to production backend on Render
    return 'https://safeslope-backend-fdnm.onrender.com/api';
  }

  return 'https://safeslope-backend-fdnm.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ner_landslide_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Guard against unexpected HTML responses (e.g. SPA index.html or 502 gateway error pages)
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && (response.data.includes('<!doctype') || response.data.includes('<html'))) {
      return Promise.reject(new Error('Backend returned an HTML response instead of JSON. The cloud server may be initializing.'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  demoLogin: (role) => api.post(`/auth/demo-login/${role}`),
  register: (data) => api.post('/auth/register', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  googleAuth: (data) => api.post('/auth/google', data),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard'),
};

export const mapApi = {
  getRiskNodes: (params) => api.get('/map/risk', { params }),
  getCascadingImpact: (locationId) => api.get(`/map/cascading/${locationId}`),
  getClusters: () => api.get('/map/clusters'),
};

export const fieldReportsApi = {
  list: (params) => api.get('/field-reports', { params }),
  create: async (data) => {
    if (!navigator.onLine) {
      await addToOfflineQueue({
        client_id: `offline-rpt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'field_report',
        data,
        timestamp: new Date().toISOString(),
      });
      return { data: { offline: true, message: 'Report saved to local offline storage (IndexedDB).' } };
    }
    try {
      return await api.post('/field-reports', data);
    } catch (err) {
      if (!err.response) {
        await addToOfflineQueue({
          client_id: `offline-rpt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'field_report',
          data,
          timestamp: new Date().toISOString(),
        });
        return { data: { offline: true, message: 'Network unavailable. Report queued in local offline storage.' } };
      }
      throw err;
    }
  },
  verify: (reportId, payload) => api.patch(`/field-reports/${reportId}/verify`, payload),
};

export const alertsApi = {
  list: (params) => api.get('/alerts', { params }),
  getPublicWarnings: () => api.get('/alerts/public'),
  broadcast: (alertId, payload) => api.patch(`/alerts/${alertId}/broadcast`, payload),
};

export const infrastructureApi = {
  list: (params) => api.get('/infrastructure', { params }),
  updateStatus: (infraId, payload) => api.patch(`/infrastructure/${infraId}/status`, payload),
};

export const evacuationApi = {
  listShelters: (params) => api.get('/evacuation-centers', { params }),
  findNearest: (lat, lon) => api.get('/evacuation-centers/nearest', { params: { lat, lon } }),
  getLogisticsPlan: (params) => api.get('/response/logistics-plan', { params }),
};

export const analyticsApi = {
  getHistory: () => api.get('/analytics/history'),
};

export const predictionsApi = {
  predict: (data) => api.post('/predictions', data),
  getMetrics: () => api.get('/predictions/metrics'),
  getRecords: () => api.get('/predictions/records'),
  clearRecords: () => api.delete('/predictions/records'),
};



export const syncApi = {
  syncBatch: (items) => api.post('/sync', { items }),
  syncPendingQueue: async () => {
    const queue = await getOfflineQueue();
    if (queue.length === 0) return { synced_count: 0, duplicate_count: 0 };
    const res = await api.post('/sync', { items: queue });
    if (res.data.synced_count > 0 || res.data.duplicate_count > 0) {
      await clearOfflineQueue();
    }
    return res.data;
  },
};

export const visualInspectorApi = {
  analyze: (payload) => api.post('/vision/analyze', payload),
  getHistory: (limit = 20) => api.get('/vision/history', { params: { limit } }),
};

export const systemApi = {
  getHealth: () => api.get('/system/health'),
  getAuditLogs: (limit = 50) => api.get('/audit-logs', { params: { limit } }),
};

export default api;
