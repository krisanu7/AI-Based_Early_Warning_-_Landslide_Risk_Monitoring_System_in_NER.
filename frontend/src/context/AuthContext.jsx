import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, syncApi } from '../api/client';
import { getOfflineCount } from '../utils/offlineQueue';

const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  id: 'demo-district',
  name: 'Dr. Subhashish Deb (District Disaster Officer)',
  email: 'district@swasthyajal.gov.in',
  role: 'DISTRICT_OFFICER',
  state: 'Assam',
  district: 'Dima Hasao',
  village: 'District Emergency Operations Centre',
  designation: 'DDMA Incident Commander & Verification Officer'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ner_landslide_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('ner_landslide_token') || null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState(null);

  const refreshOfflineCount = async () => {
    try {
      const count = await getOfflineCount();
      setOfflinePendingCount(count);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshOfflineCount();

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      try {
        const result = await syncApi.syncPendingQueue();
        if (result.synced_count > 0) {
          setSyncStatus(`Successfully synchronized ${result.synced_count} field reports.`);
        } else {
          setSyncStatus(null);
        }
      } catch (err) {
        console.error('Auto sync failed', err);
      } finally {
        refreshOfflineCount();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authApi.login(credentials);
      setUser(res.data.user);
      setToken(res.data.access_token);
      localStorage.setItem('ner_landslide_user', JSON.stringify(res.data.user));
      localStorage.setItem('ner_landslide_token', res.data.access_token);
      return res.data;
    } catch (err) {
      // Check for locally registered account fallback if network error
      const saved = localStorage.getItem('ner_landslide_user');
      if (saved && !err.response) {
        const parsed = JSON.parse(saved);
        if (parsed.email?.toLowerCase() === credentials.email?.toLowerCase()) {
          setUser(parsed);
          setToken('jwt_local_session');
          return { access_token: 'jwt_local_session', user: parsed };
        }
      }
      throw err;
    }
  };

  const switchDemoRole = async (role) => {
    try {
      const res = await authApi.demoLogin(role);
      setUser(res.data.user);
      setToken(res.data.access_token);
      localStorage.setItem('ner_landslide_user', JSON.stringify(res.data.user));
      localStorage.setItem('ner_landslide_token', res.data.access_token);
    } catch (err) {
      console.error('Demo switch failed, applying local fallback', err);
      // Local fallback if backend is momentarily reloading
      const roleMap = {
        FIELD_WORKER: { name: "Arun Bordoloi (Ground Surveyor)", role: "FIELD_WORKER", district: "Dima Hasao", village: "Haflong" },
        BLOCK_OFFICER: { name: "Nandita Hazarika (Block Officer)", role: "BLOCK_OFFICER", district: "Dima Hasao", village: "Haflong Block HQ" },
        DISTRICT_OFFICER: { name: "Dr. Subhashish Deb (District Officer)", role: "DISTRICT_OFFICER", district: "Dima Hasao", village: "District EOC" },
        AUTHORITY: { name: "Smt. K. Sangma (State Disaster Authority)", role: "AUTHORITY", district: "East Khasi Hills", village: "State EOC" },
        ADMIN: { name: "System Administrator", role: "ADMIN", district: "Guwahati HQ", village: "Dispur EOC" },
        PUBLIC: { name: "Public Citizen", role: "PUBLIC", district: "Dima Hasao", village: "Haflong" }
      };
      const fallback = roleMap[role] || roleMap.DISTRICT_OFFICER;
      const fullUser = { ...fallback, email: `${role.toLowerCase()}@swasthyajal.gov.in`, state: "Assam" };
      setUser(fullUser);
      localStorage.setItem('ner_landslide_user', JSON.stringify(fullUser));
    }
  };

  const manualSync = async () => {
    setSyncStatus('syncing');
    try {
      const result = await syncApi.syncPendingQueue();
      await refreshOfflineCount();
      setSyncStatus(`Synchronized ${result.synced_count || 0} reports.`);
      setTimeout(() => setSyncStatus(null), 4000);
      return result;
    } catch (e) {
      console.error(e);
      setSyncStatus('Sync failed. Please check network connection.');
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res.data?.access_token && res.data?.user) {
        setUser(res.data.user);
        setToken(res.data.access_token);
        localStorage.setItem('ner_landslide_user', JSON.stringify(res.data.user));
        localStorage.setItem('ner_landslide_token', res.data.access_token);
      }
      return res.data;
    } catch (err) {
      if (err.response && err.response.data?.detail) {
        throw err;
      }
      // If network error (offline or server sleeping), provide local registration fallback
      const newUser = {
        id: `usr_${Date.now()}`,
        name: userData.name,
        email: userData.email.toLowerCase(),
        role: userData.role || 'FIELD_WORKER',
        state: userData.state || 'Assam',
        district: userData.district || 'Dima Hasao',
        village: userData.village || 'Haflong',
        designation: userData.designation || 'Disaster Officer',
        phone: userData.phone || ''
      };
      const fallbackToken = `jwt_${Date.now()}_local`;
      setUser(newUser);
      setToken(fallbackToken);
      localStorage.setItem('ner_landslide_user', JSON.stringify(newUser));
      localStorage.setItem('ner_landslide_token', fallbackToken);
      return { access_token: fallbackToken, user: newUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ner_landslide_user');
    localStorage.removeItem('ner_landslide_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      switchDemoRole,
      isOnline,
      offlinePendingCount,
      refreshOfflineCount,
      manualSync,
      syncStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
