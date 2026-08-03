import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  // FIX: wrap JSON.parse in try/catch to prevent crash on corrupted localStorage
  let user: any = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    // Corrupted localStorage - clear it and redirect to signin
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/auth/signin" replace />;
  }

  if (!token || !user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
