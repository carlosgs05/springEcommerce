import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const GuestRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Si ya está logueado, lo mandamos según rol:
  //  - admin (1) → /admin
  //  - cliente (2) → /
  if (isAuthenticated && user) {
    const destino = user.rol.idrol === 1 ? '/admin' : '/';
    return <Navigate to={destino} replace />;
  }

  // Si no está logueado, deja pasar
  return <Outlet />;
};

export default GuestRoute;