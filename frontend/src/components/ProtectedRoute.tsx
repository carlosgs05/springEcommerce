import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  roles?: number[];
  redirectTo?: string;
  specialRedirectPath?: string; // Nueva prop para redirección especial
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles,
  redirectTo = '/',
  specialRedirectPath
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Si no está logueado
  if (!isAuthenticated) {
    // Redirige a specialRedirectPath si está definido y estamos en la ruta especial
    if (specialRedirectPath && location.pathname === '/perfil') {
      return <Navigate to={specialRedirectPath} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos y el usuario no tiene ninguno
  if (roles && user && !roles.includes(user.rol.idrol)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Acceso permitido
  return <Outlet />;
};

export default ProtectedRoute;