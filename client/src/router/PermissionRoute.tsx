import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionRouteProps {
  requiredPermission: string;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ requiredPermission }) => {
  const { user } = useAuth();
  // Chưa đăng nhập -> về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Đã đăng nhập nhưng không có quyền yêu cầu -> chuyển hướng về home
  if (requiredPermission && !user.permissions.includes(requiredPermission)) {
    return <Navigate to="/home" replace />;
  }
  // Có quyền phù hợp
  return <Outlet />;
};

export default PermissionRoute;
