import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUsers, FaBoxOpen, FaTachometerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface SidebarAdminProps {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ isOpen, toggle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 w-64 bg-gray-900 text-gray-100
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out z-50
        flex flex-col
      `}
    >
      {/* Branding */}
      <div className="flex items-center px-6 py-5 border-b border-gray-800">
        <img
          className="w-10 h-10 mr-3"
          src="https://img.icons8.com/fluent/344/year-of-tiger.png"
          alt="Logo Tigre"
        />
        <h1 className="text-2xl font-extrabold">Admin Panel</h1>
        <button
          className="ml-auto md:hidden text-2xl leading-none"
          onClick={toggle}
          aria-label="Cerrar sidebar"
        >
          &times;
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <button
          onClick={() => navigate('/admin')}
          className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left"
        >
          <FaTachometerAlt className="w-5 h-5 mr-3" />
          Dashboard
        </button>
        <button
          onClick={() => navigate('/admin/users')}
          className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left"
        >
          <FaUsers className="w-5 h-5 mr-3" />
          Usuarios
        </button>
        <button
          onClick={() => navigate('/admin/products')}
          className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left"
        >
          <FaBoxOpen className="w-5 h-5 mr-3" />
          Productos
        </button>
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
        >
          <FaSignOutAlt />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;