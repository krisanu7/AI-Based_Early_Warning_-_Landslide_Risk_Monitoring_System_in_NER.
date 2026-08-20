import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, casesApi } from '../api/client';
import { getOfflineQueue, clearOfflineQueue } from '../utils/offlineQueue';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  { label: 'ASHA Worker', email: 'asha@swasthyajal.gov.in', password: 'password123', role: 'ASHA', name: 'Priyanka Kalita (ASHA)', loc: 'Majuli, Assam' },
  { label: 'ANM Staff', email: 'anm@swasthyajal.gov.in', password: 'password123', role: 'ANM', name: 'Rini Riba (ANM)', loc: 'Majuli, Assam' },
  { label: 'PHC Medical Officer', email: 'doctor@swasthyajal.gov.in', password: 'password123', role: 'MEDICAL_STAFF', name: 'Dr. Bhaskar Sarma', loc: 'Garamur PHC' },
  { label: 'District/State Authority', email: 'authority@swasthyajal.gov.in', password: 'password123', role: 'AUTHORITY', name: 'Dr. A. K. Baruah (Surveillance Officer)', loc: 'Assam Health Directorate' },
  { label: 'System Admin', email: 'admin@swasthyajal.gov.in', password: 'password123', role: 'ADMIN', name: 'State IT Director', loc: 'Dispur HQ' },
  { label: 'Public Citizen', email: 'public@swasthyajal.gov.in', password: 'password123', role: 'PUBLIC', name: 'Citizen / Community', loc: 'Northeast Region' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('swasthya_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlinePendingCount, setOfflinePendingCount] = useState(getOfflineQueue().length);
  const [syncMessage, setSyncMessage] = useState(null);

  // Sync offline queue when back online
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setSyncMessage(`Internet restored! Synchronizing ${queue.length} offline case reports...`);
        try {
          await casesApi.syncBatch(queue);
          clearOfflineQueue();
          setOfflinePendingCount(0);
          setSyncMessage(`Successfully synced ${queue.length} offline records to health grid.`);
          setTimeout(() => setSyncMessage(null), 5000);
        } catch (e) {
          console.error('Offline auto-sync failed', e);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage('Offline mode active. Case reports will be securely stored locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setOfflinePendingCount(getOfflineQueue().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('swasthya_token', access_token);
      localStorage.setItem('swasthya_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (roleKey) => {
    const target = DEMO_ACCOUNTS.find(a => a.role === roleKey || a.email.includes(roleKey.toLowerCase()));
    if (target) {
      return await login(target.email, target.password);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      const { access_token, user: newUser } = res.data;
      localStorage.setItem('swasthya_token', access_token);
      localStorage.setItem('swasthya_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('swasthya_token');
    localStorage.removeItem('swasthya_user');
    setUser(null);
  };

  const refreshOfflineCount = () => {
    setOfflinePendingCount(getOfflineQueue().length);
  };

  const manualSync = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return 0;
    setLoading(true);
    try {
      const res = await casesApi.syncBatch(queue);
      clearOfflineQueue();
      setOfflinePendingCount(0);
      setSyncMessage(`Manually synced ${queue.length} reports successfully.`);
      setTimeout(() => setSyncMessage(null), 4000);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isOnline,
      offlinePendingCount,
      syncMessage,
      login,
      loginDemo,
      register,
      logout,
      manualSync,
      refreshOfflineCount,
      isAsha: user?.role === 'ASHA',
      isAnm: user?.role === 'ANM',
      isDoctor: user?.role === 'MEDICAL_STAFF',
      isAuthority: user?.role === 'AUTHORITY',
      isAdmin: user?.role === 'ADMIN',
      isPublic: !user || user?.role === 'PUBLIC'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
