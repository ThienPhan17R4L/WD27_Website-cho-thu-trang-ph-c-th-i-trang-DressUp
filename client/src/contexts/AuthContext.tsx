import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '@/api/auth';
import { AuthContextProps, User } from '@/types/auth';
import { isTokenExpired } from '@/utils/jwt';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Kiểm tra localStorage để load trạng thái đăng nhập (nếu user đã login trước đó)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      const parsedToken = JSON.parse(savedToken);

      // Check if token is already expired
      if (isTokenExpired(parsedToken)) {
        console.log('Token expired on mount, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        return;
      }

      setUser(JSON.parse(savedUser));
      setToken(parsedToken);
    }
  }, []);

  // Auto logout when token expires - check every minute
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      if (isTokenExpired(token)) {
        console.log('Token expired, auto logging out...');
        logout();
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every minute (60000ms)
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [token]);

  // Hàm login gọi API và cập nhật context
  const login = async (email: string, password: string): Promise<User> => {
    // Gửi request login qua authApi
    const data = await authApi.login({ email, password });
    // Giả định API trả về object chứa token và user
    const { accessToken, user: userData } = data;
    // Lưu token và user vào localStorage để duy trì trạng thái đăng nhập
    localStorage.setItem('token', JSON.stringify(accessToken));
    localStorage.setItem('user', JSON.stringify(userData));
    // Cập nhật state user
    setUser(userData);
    setToken(accessToken);
    // Return user data for role-based redirect
    return userData;
  };

  // Hàm logout xóa dữ liệu và reset trạng thái
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextProps = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook tiện ích để dùng AuthContext
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
