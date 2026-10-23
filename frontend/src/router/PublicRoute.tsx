import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PublicRouteProps {
  redirectAdminTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  redirectAdminTo = '/admin',
}) => {
  const { isAuthenticated, user } = useAuth();

  // Si el usuario está logueado y es admin (idrol=1), redirigir al dashboard admin
  if (isAuthenticated && user && user.rol.idrol === 1) {
    return <Navigate to={redirectAdminTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;