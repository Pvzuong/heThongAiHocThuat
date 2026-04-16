import { createContext, useState, useEffect, useCallback } from 'react';
import { setAccessToken, clearAccessToken } from '../utils/tokenHelper';
import { getMe, logout as logoutApi } from '../api/authApi';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // đang kiểm tra phiên đăng nhập

  // Khi app khởi động: thử refresh để lấy lại token
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.access_token);
        const meRes = await getMe();
        setUser(meRes.data);
      } catch {
        // Không có phiên hợp lệ — người dùng chưa đăng nhập
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
    try {
      await logoutApi();
    } catch {
      // bỏ qua lỗi logout
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
