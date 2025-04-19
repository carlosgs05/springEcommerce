import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FaSignOutAlt, 
  FaBoxOpen, 
  FaTachometerAlt, 
  FaUser, 
  FaLock, 
  FaTools,
  FaThList,
  FaTags,
  FaStar,
  FaHome
} from 'react-icons/fa';
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
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">

        {/* Sección Principal */}
        <div>
          <div className="flex items-center px-3 py-3 text-gray-300 text-sm font-bold tracking-wider border-b border-gray-700 mb-2">
            <FaHome className="w-4 h-4 mr-3" />
            <span className="text-[14px]">PRINCIPAL</span>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left text-sm"
          >
            <FaTachometerAlt className="w-4 h-4 mr-3 min-w-[16px]" />
            Home
          </button>
        </div>

        {/* Sección Privacidad */}
        <div>
          <div className="flex items-center px-3 py-3 text-gray-300 text-sm font-bold tracking-wider border-b border-gray-700 mb-2">
            <FaLock className="w-4 h-4 mr-3" />
            <span className="text-[14px]">PRIVACIDAD</span>
          </div>
          <button
            onClick={() => navigate('/admin/perfil')}
            className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left text-sm"
          >
            <FaUser className="w-4 h-4 mr-3 min-w-[16px]" />
            Mi Perfil
          </button>
        </div>

        {/* Sección Mantenedor */}
        <div>
          <div className="flex items-center px-3 py-3 text-gray-300 text-sm font-bold tracking-wider border-b border-gray-700 mb-2">
            <FaTools className="w-4 h-4 mr-3" />
            <span className="text-[14px]">MANTENEDOR</span>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/admin/categorias')}
              className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left text-sm"
            >
              <FaThList className="w-4 h-4 mr-3 min-w-[16px]" />
              Categorías
            </button>
            <button
              onClick={() => navigate('/admin/marcas')}
              className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left text-sm"
            >
              <FaTags className="w-4 h-4 mr-3 min-w-[16px]" />
              Marcas
            </button>
            <button
              onClick={() => navigate('/admin/productos')}
              className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left text-sm"
            >
              <FaBoxOpen className="w-4 h-4 mr-3 min-w-[16px]" />
              Productos
            </button>
            <button
              onClick={() => navigate('/admin/reseñas')}
              className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left text-sm"
            >
              <FaStar className="w-4 h-4 mr-3 min-w-[16px]" />
              Reseñas
            </button>
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm"
        >
          <FaSignOutAlt className="w-4 h-4 min-w-[16px]" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;