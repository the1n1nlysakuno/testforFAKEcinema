import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />;
  }
  // Phân quyền chỉ ở giao diện cho mục đích học tập.
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}
