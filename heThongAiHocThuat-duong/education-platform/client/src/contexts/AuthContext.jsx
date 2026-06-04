import { createContext, useState, useEffect, useCallback } from 'react';
import { setAccessToken, clearAccessToken } from '../utils/tokenHelper';
import { getMe, logout as logoutApi } from '../api/authApi';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const isStudent = !user || user.role === 'student';
  const isAdmin   = user?.role === 'admin';

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await axiosInstance.post('/auth/refresh');
        setAccessToken(res.data.access_token);
        const meRes = await getMe();
        setUser(meRes.data);
      } catch {
        // Không có phiên hợp lệ
      } finally {
        setLoading(false);
      }
    };
    tryRefresh();
  }, []);

  const login = useCallback((accessToken, userData) => {
    setAccessToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch { /* ignore */ } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isStudent, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
