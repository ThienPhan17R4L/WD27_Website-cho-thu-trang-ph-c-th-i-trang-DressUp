import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLayout from '@/layouts/AdminLayout';
import AdminProductsPage from '@/pages/admin/ProductsPage';
import AdminCategoriesPage from '@/pages/admin/CategoriesPage';
import AdminOrdersPage from '@/pages/admin/OrdersPage';
import AdminUsersPage from '@/pages/admin/UsersPage';
import AdminInventoryPage from '@/pages/admin/InventoryPage';
import AdminReturnsPage from '@/pages/admin/ReturnsPage';
import AdminCouponsPage from '@/pages/admin/CouponsPage';
import AdminAuditLogsPage from '@/pages/admin/AuditLogsPage';
import ProductFormPage from '@/pages/admin/ProductFormPage';
import AdminProductDetailPage from '@/pages/admin/ProductDetailPage';
import StaffLayout from '@/layouts/StaffLayout';
import StaffDashboardPage from '@/pages/staff/StaffDashboardPage';
import StaffOrdersPage from '@/pages/staff/StaffOrdersPage';
import StaffInventoryPage from '@/pages/staff/StaffInventoryPage';
import StaffReturnsPage from '@/pages/staff/StaffReturnsPage';
import AppShell from '@/layouts/AppShell';
import PrivateRoute from '@/router/PrivateRoute';
import PermissionRoute from '@/router/PermissionRoute';
import RegisterPage from '@/pages/RegisterPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import ActiveRentalsPage from '@/pages/ActiveRentalsPage';
import ProfilePage from '@/pages/ProfilePage';
import CategoriesPage from '@/pages/CategoriesPage';
import MockPaymentPage from '@/pages/MockPaymentPage';
import PaymentReturnPage from '@/pages/PaymentReturnPage';
import AdminOrderDetailPage from '@/pages/admin/OrderDetailPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
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
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="products/:slug" element={<AdminProductDetailPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="returns" element={<AdminReturnsPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>
        </Route>

        {/* Staff routes - requires staff role */}
        <Route element={<PermissionRoute requiredPermission="staff" />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboardPage />} />
            <Route path="orders" element={<StaffOrdersPage />} />
            <Route path="inventory" element={<StaffInventoryPage />} />
            <Route path="returns" element={<StaffReturnsPage />} />
          </Route>
        </Route>

        {/* Regular user protected routes */}
        <Route element={<AppShell />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/mock/:orderId" element={<MockPaymentPage />} />
          <Route path="/payment/momo/return" element={<PaymentReturnPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/rentals/active" element={<ActiveRentalsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      {/* Mặc định: điều hướng các path không khớp về /home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRouter;
