import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

interface Tab {
  id: string;
  label: string;
  href: string;
}

const TABS: Tab[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'products', label: 'Products', href: '/productos' },
  { id: 'testimonials', label: 'Testimonials', href: '/testimonials' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Función para verificar si el enlace está activo
  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setMenuOpen(open => !open);
  const closeMenu = () => setMenuOpen(false);

  // Clases para los enlaces de escritorio
  const getLinkClasses = (path: string) => {
    const baseClasses = "px-3 py-2 transition-all duration-200 cursor-pointer border-b-2";
    const activeClasses = "text-cyan-400 border-cyan-400";
    const inactiveClasses = "text-white border-transparent";
    const hoverClasses = "hover:text-cyan-400 hover:border-cyan-400";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses} ${hoverClasses}`;
  };

  // Clases para el menú móvil
  const getMobileLinkClasses = (path: string) => {
    const baseClasses = "block px-3 py-2 transition-all duration-200";
    const activeClasses = "text-cyan-400 bg-gray-800";
    const inactiveClasses = "text-white";
    const hoverClasses = "hover:text-cyan-400 hover:bg-gray-800";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses} ${hoverClasses}`;
  };

  const iconBtnClasses = "p-2 text-white transition-colors duration-200 hover:text-cyan-400";

  return (
    <header className="w-full bg-gradient-to-tr from-gray-900 to-stone-800 shadow-2xl">
      <nav className="max-w-7xl mx-auto px-6 py-5 lg:py-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" onClick={closeMenu} className="flex items-center space-x-3">
          <img
            src="https://img.icons8.com/fluent/344/year-of-tiger.png"
            alt="Logo TechShop"
            className="w-10 h-10"
          />
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wide">
              TechShop
            </h1>
            <p className="hidden sm:block text-sm text-gray-300">
              Tu tienda de electrónica favorita
            </p>
          </div>
        </a>

        {/* Desktop Tabs */}
        <ul className="hidden md:flex items-center space-x-6">
          {TABS.map(tab => (
            <li key={tab.id}>
              <a
                href={tab.href}
                onClick={closeMenu}
                className={getLinkClasses(tab.href)}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center space-x-4">
          <button aria-label="Buscar" className={iconBtnClasses}>
            <FaSearch size={20} />
          </button>
          <button aria-label="Carrito" className={iconBtnClasses}>
            <FaShoppingCart size={20} />
          </button>
          <button 
            aria-label="Usuario" 
            className={iconBtnClasses}
            onClick={() => navigate('/login')}
          >
            <FaUser size={20} />
          </button>
        </div>

        {/* Botón hamburguesa (móvil) */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-white hover:text-cyan-400 focus:outline-none"
          aria-label="Abrir o cerrar menú"
        >
          {menuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
        </button>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-5 border-t border-gray-700">
          <ul className="flex flex-col space-y-3">
            {TABS.map(tab => (
              <li key={tab.id}>
                <a
                  href={tab.href}
                  onClick={closeMenu}
                  className={getMobileLinkClasses(tab.href)}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center space-x-4 mt-4 border-t border-gray-700 pt-4">
            <button aria-label="Buscar" className={iconBtnClasses}>
              <FaSearch size={20} />
            </button>
            <button aria-label="Carrito" className={iconBtnClasses}>
              <FaShoppingCart size={20} />
            </button>
            <button 
              aria-label="Usuario" 
              className={iconBtnClasses}
              onClick={() => {
                closeMenu();
                navigate('/login');
              }}
            >
              <FaUser size={20} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;