import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaSignOutAlt, FaBars, FaBell } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

interface HeaderAdminProps {
  toggleSidebar: () => void;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nuevo pedido recibido", read: false },
    { id: 2, title: "Revisión pendiente de producto", read: false },
    { id: 3, title: "Actualización del sistema disponible", read: true },
  ]);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        notificationsDropdownRef.current &&
        !notificationsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Estado para el dropdown de notificaciones
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 shadow-xl backdrop-blur-sm border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-full p-3 transition-all duration-300 transform hover:scale-105"
          onClick={toggleSidebar}
          aria-label="Mostrar sidebar"
        >
          <FaBars className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-6">
        {/* Dropdown de notificaciones */}
        <div className="relative" ref={notificationsDropdownRef}>
          <button
            className="relative p-2 rounded-full hover:bg-gray-700 transition-all duration-300 cursor-pointer"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Notificaciones"
          >
            <FaBell className="w-5 h-5 text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 origin-top-right bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center">
                <div className="font-medium text-sm">Notificaciones</div>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  Marcar todas como leídas
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 text-sm border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                        notification.read
                          ? "text-gray-400"
                          : "text-gray-100 bg-gray-800"
                      }`}
                    >
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-xs mt-1">Hace 2 horas</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400">
                    No hay notificaciones
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown de usuario */}
        <div className="relative group" ref={userDropdownRef}>
          <button
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-700 transition-all duration-300 cursor-pointer"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            aria-label="Menú de usuario"
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-0.5">
                <div className="bg-gray-800 rounded-full p-1.5">
                  <FaUser className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </div>
            <div className="text-left hidden lg:block">
              <div className="font-medium text-sm">
                {user?.nombre || "Administrador"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.correo || "admin@example.com"}
              </div>
            </div>
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 origin-top-right bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <button className="flex items-center w-full px-4 py-3 text-sm hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                <FaUser className="mr-3 text-gray-400" />
                <span>Mi perfil</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-3 text-sm hover:bg-red-500 hover:bg-opacity-20 text-red-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
