import React, { useState, useRef, useEffect } from "react";
import {
  FaTachometerAlt,
  FaUser,
  FaTools,
  FaThList,
  FaTags,
  FaStar,
  FaHome,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdOutlineReviews, MdRateReview } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { FiLock } from "react-icons/fi";

interface SidebarAdminProps {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ isOpen, toggle }) => {
  const navigate = useNavigate();
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setReviewsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Manejar el blur con un pequeño retraso para permitir la navegación
  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        setReviewsOpen(false);
      }, 100);
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300 ease-in-out z-50
        flex flex-col border-r border-gray-700 shadow-2xl
      `}
    >
      {/* Branding */}
      <div className="flex items-center px-5 py-4 border-b border-gray-700">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-1 shadow">
          <img
            className="w-9 h-9 rounded-lg"
            src="https://img.icons8.com/fluent/344/year-of-tiger.png"
            alt="Logo Tigre"
          />
        </div>
        <div className="ml-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Control Dashboard</p>
        </div>
        <button
          className="ml-auto md:hidden text-xl leading-none cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-full p-1.5 transition-all"
          onClick={toggle}
          aria-label="Cerrar sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Sección Principal */}
        <div className="mb-4">
          <div className="px-3 py-2.5 text-gray-400 text-xs font-bold tracking-wider uppercase border-b border-gray-700 mb-2">
            <span className="flex items-center">
              <FaHome className="w-3.5 h-3.5 mr-2 text-cyan-400" />
              PRINCIPAL
            </span>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
          >
            <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
              <FaTachometerAlt className="w-3.5 h-3.5 text-gray-300 group-hover:text-white" />
            </div>
            <span className="ml-3">Dashboard</span>
          </button>
        </div>

        {/* Sección Privacidad */}
        <div className="mb-4">
          <div className="px-3 py-2.5 text-gray-400 text-xs font-bold tracking-wider uppercase border-b border-gray-700 mb-2">
            <span className="flex items-center">
              <FiLock className="w-3.5 h-3.5 mr-2 text-cyan-400" />
              PRIVACIDAD
            </span>
          </div>
          <button
            onClick={() => navigate("/admin/perfil")}
            className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
          >
            <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
              <FaUser className="w-3.5 h-3.5 text-gray-300 group-hover:text-white" />
            </div>
            <span className="ml-3">Mi Perfil</span>
          </button>
        </div>

        {/* Sección Mantenedor */}
        <div className="mb-4">
          <div className="px-3 py-2.5 text-gray-400 text-xs font-bold tracking-wider uppercase border-b border-gray-700 mb-2">
            <span className="flex items-center">
              <FaTools className="w-3.5 h-3.5 mr-2 text-cyan-400" />
              MANTENEDOR
            </span>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => navigate("/admin/categorias")}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
            >
              <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
                <FaThList className="w-3.5 h-3.5 text-gray-300 group-hover:text-white" />
              </div>
              <span className="ml-3">Categorías</span>
            </button>

            <button
              onClick={() => navigate("/admin/marcas")}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
            >
              <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
                <FaTags className="w-3.5 h-3.5 text-gray-300 group-hover:text-white" />
              </div>
              <span className="ml-3">Marcas</span>
            </button>

            <button
              onClick={() => navigate("/admin/productos")}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
            >
              <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
                <AiOutlineProduct className="w-3.5 h-3.5 text-gray-300 group-hover:text-white" />
              </div>
              <span className="ml-3">Productos</span>
            </button>

            <button
              onClick={() => navigate("/admin/metodos-envio")}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
            >
              <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-gray-300 group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="ml-3">Métodos de Envío</span>
            </button>

            <button
              onClick={() => navigate("/admin/metodos-pago")}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
            >
              <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 text-gray-300 group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <span className="ml-3">Métodos de Pago</span>
            </button>

            <button
              onClick={() => navigate("/admin/pedidos")}
              className="w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
            >
              <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
                <svg
                 className="w-3.5 h-3.5 text-gray-300 group-hover:text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L22 7v10l-10 5-10-5V7z" />
                  <path d="M22 7L12 12m0 0L2 7m10 5v10" />
                  <path d="M7 4.5l10 5" />
                </svg>
              </div>
              <span className="ml-3">Pedidos</span>
            </button>

            {/* Dropdown de Reseñas */}
            <div
              ref={dropdownRef}
              onBlur={handleBlur}
              tabIndex={-1}
              className="relative"
            >
              <button
                onClick={() => setReviewsOpen(!reviewsOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
              >
                <div className="flex items-center">
                  <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1.5 transition-colors">
                    <FaStar className="w-3.5 h-3.5 text-gray-300 group-hover:text-white" />
                  </div>
                  <span className="ml-3">Reseñas</span>
                </div>
                {reviewsOpen ? (
                  <FaChevronDown className="w-2.5 h-2.5 text-gray-400" />
                ) : (
                  <FaChevronRight className="w-2.5 h-2.5 text-gray-400" />
                )}
              </button>

              {reviewsOpen && (
                <div className="mt-1 space-y-1 border-l-2 border-gray-700 pl-3">
                  <button
                    onClick={() => {
                      navigate("/admin/reviews_productos");
                      setReviewsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
                  >
                    <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1 transition-colors">
                      <MdOutlineReviews className="w-3 h-3 text-gray-300 group-hover:text-white" />
                    </div>
                    <span className="ml-2">Productos Reviews</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/admin/testimonios");
                      setReviewsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-50 transition-all text-left text-sm cursor-pointer group"
                  >
                    <div className="bg-gray-700 group-hover:bg-cyan-500 rounded-lg p-1 transition-colors">
                      <MdRateReview className="w-3 h-3 text-gray-300 group-hover:text-white" />
                    </div>
                    <span className="ml-2">Testimonios</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
