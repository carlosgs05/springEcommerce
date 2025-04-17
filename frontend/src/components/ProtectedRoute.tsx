import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  roles?: number[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles,
  redirectTo = '/',
}) => {
  const { isAuthenticated, user } = useAuth();

  // Si no está logueado, al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos y el usuario no tiene ninguno, redirigir
  if (roles && user && !roles.includes(user.rol.idrol)) {
    return <Navigate to={redirectTo} replace />;
  }

  // OK
  return <Outlet />;
};

export default ProtectedRoute;