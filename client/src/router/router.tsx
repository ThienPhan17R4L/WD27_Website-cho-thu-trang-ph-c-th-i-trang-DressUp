import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import AppShell from '@/layouts/AppShell';
import PrivateRoute from '@/router/PrivateRoute';
import PermissionRoute from '@/router/PermissionRoute';
import RegisterPage from '@/pages/RegisterPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />
      {/* Protected routes (requires login) */}
      <Route element={<PrivateRoute />}>
        {/* AppShell layout wrapper for authenticated pages */}
        <Route element={<AppShell />}>
          {/* Ví dụ route chỉ dành cho admin (nếu có trang AdminPage) */}
          {/* 
          <Route element={<PermissionRoute requiredPermission="ADMIN" />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route> 
          */}
        </Route>
      </Route>
      {/* Mặc định: điều hướng các path không khớp về /home (hoặc /login nếu chưa login) */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRouter;
