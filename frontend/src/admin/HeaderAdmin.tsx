import React from 'react';
import { FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface HeaderAdminProps {
  toggleSidebar: () => void;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-gray-800 bg-opacity-90 backdrop-blur-sm text-white px-6 py-4 shadow-lg">
      {/* botón hamburguesa en móvil */}
      <button
        className="md:hidden text-xl"
        onClick={toggleSidebar}
        aria-label="Mostrar sidebar"
      >
        <FaBars />
      </button>

      <h2 className="text-xl font-semibold"></h2>

      {/* Perfil / Logout */}
      <div className="flex items-center space-x-4">
        <FaUser className="w-6 h-6" />
        <span className="font-medium">{user?.nombre}</span>
        <button onClick={logout} className="p-2 rounded-full hover:bg-gray-700 transition" aria-label="Cerrar sesión">
          <FaSignOutAlt className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default HeaderAdmin;