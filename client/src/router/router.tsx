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
import PermissionRoute from '@/router/PermissionRoute';
import RegisterPage from '@/pages/RegisterPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrdersPage from '@/pages/OrdersPage';
import ActiveRentalsPage from '@/pages/ActiveRentalsPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path='/cart' element={<CartPage />} />
      </Route>

      {/* Protected routes (requires login) */}
      <Route element={<PrivateRoute />}>
        {/* Admin routes - requires admin role */}
        <Route element={<PermissionRoute requiredPermission="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
          </Route>
        </Route>

        {/* Regular user protected routes */}
        <Route element={<AppShell />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/rentals/active" element={<ActiveRentalsPage />} />
        </Route>
      </Route>
      {/* Mặc định: điều hướng các path không khớp về /home (hoặc /login nếu chưa login) */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRouter;
