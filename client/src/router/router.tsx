import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLayout from '@/layouts/AdminLayout';
import AdminProductsPage from '@/pages/admin/ProductsPage';
import AdminCategoriesPage from '@/pages/admin/CategoriesPage';
import AdminOrdersPage from '@/pages/admin/OrdersPage';
import AppShell from '@/layouts/AppShell';
import PrivateRoute from '@/router/PrivateRoute';
import RegisterPage from '@/pages/RegisterPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path='/cart' element={<CartPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Route>
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
