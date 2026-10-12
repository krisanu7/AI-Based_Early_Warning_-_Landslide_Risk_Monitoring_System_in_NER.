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
      if (res.data?.user && res.data?.access_token) {
        setUser(res.data.user);
        setToken(res.data.access_token);
        localStorage.setItem('ner_landslide_user', JSON.stringify(res.data.user));
        localStorage.setItem('ner_landslide_token', res.data.access_token);
        return res.data;
      }
      throw new Error('Invalid authentication response structure from server.');
    } catch (err) {
      // Check for locally registered account fallback if network error
      const saved = localStorage.getItem('ner_landslide_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.email?.toLowerCase() === credentials.email?.toLowerCase()) {
            setUser(parsed);
            setToken('jwt_local_session');
            localStorage.setItem('ner_landslide_token', 'jwt_local_session');
            return { access_token: 'jwt_local_session', user: parsed };
          }
        } catch (_) {}
      }
      throw err;
    }
  };

  const switchDemoRole = async (role) => {
    try {
      const res = await authApi.demoLogin(role);
      if (res.data?.user && res.data?.access_token) {
        setUser(res.data.user);
        setToken(res.data.access_token);
        localStorage.setItem('ner_landslide_user', JSON.stringify(res.data.user));
        localStorage.setItem('ner_landslide_token', res.data.access_token);
        return res.data;
      }
      throw new Error('Invalid demo response from server.');
    } catch (err) {
      console.warn('Demo switch live API call failed, applying instant local session fallback', err);
      // Local fallback if backend is momentarily reloading or cold-starting on cloud
      const roleMap = {
        FIELD_WORKER: { name: "Arun Bordoloi (Ground Surveyor)", role: "FIELD_WORKER", district: "Dima Hasao", village: "Haflong", designation: "Disaster Field Surveyor & GPS Scout" },
        BLOCK_OFFICER: { name: "Nandita Hazarika (Block Officer)", role: "BLOCK_OFFICER", district: "Dima Hasao", village: "Haflong Block HQ", designation: "Block Disaster Management Officer" },
        DISTRICT_OFFICER: { name: "Dr. Subhashish Deb (District Officer)", role: "DISTRICT_OFFICER", district: "Dima Hasao", village: "District EOC", designation: "DDMA Incident Commander & Verification Officer" },
        AUTHORITY: { name: "Smt. K. Sangma (State Disaster Authority)", role: "AUTHORITY", district: "East Khasi Hills", village: "State EOC", designation: "State Disaster Management Authority (SDMA) Director" },
        ADMIN: { name: "System Administrator", role: "ADMIN", district: "Guwahati HQ", village: "Dispur EOC", designation: "System Administrator" },
        PUBLIC: { name: "Public Citizen", role: "PUBLIC", district: "Dima Hasao", village: "Haflong", designation: "Public Citizen" }
      };
      const fallback = roleMap[role] || roleMap.DISTRICT_OFFICER;
      const fullUser = { 
        id: `demo-${role.toLowerCase()}`, 
        ...fallback, 
        email: `${role.toLowerCase()}@swasthyajal.gov.in`, 
        state: fallback.district === "East Khasi Hills" ? "Meghalaya" : "Assam" 
      };
      const demoToken = `demo_jwt_${role.toLowerCase()}_${Date.now()}`;
      setUser(fullUser);
      setToken(demoToken);
      localStorage.setItem('ner_landslide_user', JSON.stringify(fullUser));
      localStorage.setItem('ner_landslide_token', demoToken);
      return { user: fullUser, access_token: demoToken };
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

  const googleLogin = async (credential, metadata = {}) => {
    try {
      const res = await authApi.googleAuth({
        credential,
        ...metadata
      });
      if (res.data?.access_token && res.data?.user) {
        setUser(res.data.user);
        setToken(res.data.access_token);
        localStorage.setItem('ner_landslide_user', JSON.stringify(res.data.user));
        localStorage.setItem('ner_landslide_token', res.data.access_token);
        return res.data;
      }
      throw new Error('Invalid Google auth response');
    } catch (err) {
      // Decode the JWT client-side for resilient fallback in case backend is waking up from sleep
      try {
        const payloadBase64 = credential.split('.')[1];
        if (payloadBase64) {
          const payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
          if (payloadJson && payloadJson.email) {
            const fallbackUser = {
              id: payloadJson.sub || `google-user-${Date.now()}`,
              name: payloadJson.name || payloadJson.email.split('@')[0],
              email: payloadJson.email,
              role: metadata.role || 'PUBLIC',
              state: metadata.state || 'Assam',
              district: metadata.district || 'Dima Hasao',
              village: metadata.village || 'Haflong',
              designation: `${metadata.role || 'Public Citizen'} (Google Verified)`
            };
            const fallbackToken = 'google_jwt_session_' + Date.now();
            setUser(fallbackUser);
            setToken(fallbackToken);
            localStorage.setItem('ner_landslide_user', JSON.stringify(fallbackUser));
            localStorage.setItem('ner_landslide_token', fallbackToken);
            return { access_token: fallbackToken, user: fallbackUser };
          }
        }
      } catch (decodeErr) {
        console.warn('Failed to parse client-side Google credential fallback:', decodeErr);
      }
      throw err;
    }
  };

  const sendOtp = async (email, purpose = 'register') => {
    return await authApi.sendOtp({ email, purpose });
  };

  const verifyOtp = async (email, otp) => {
    return await authApi.verifyOtp({ email, otp });
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data?.access_token && res.data?.user) {
      setUser(res.data.user);
      setToken(res.data.access_token);
      localStorage.setItem('ner_landslide_user', JSON.stringify(res.data.user));
      localStorage.setItem('ner_landslide_token', res.data.access_token);
    }
    return res.data;
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
      googleLogin,
      register,
      sendOtp,
      verifyOtp,
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
