import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const HomeRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Si es admin, lo mandamos a /admin
  if (isAuthenticated && user?.rol.idrol === 1) {
    return <Navigate to="/admin" replace />;
  }

  // En cualquier otro caso (invitado o cliente), dejamos pasar (Outlet renderiza HomeUser vía el layout)
  return <Outlet />;
};

export default HomeRoute;