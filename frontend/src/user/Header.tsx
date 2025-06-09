import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { FcAcceptDatabase } from "react-icons/fc";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { DropdownMenu, DropdownItem } from "./Dropdown";

interface Tab {
  id: string;
  label: string;
  href: string;
  roles?: number[];
}

const TABS: Tab[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "nosotros", label: "Nosotros", href: "/nosotros" },
  { id: "tienda", label: "Tienda", href: "/tienda" },
  { id: "contacto", label: "Contacto", href: "/contacto" },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  // Considerar '/tienda' y cualquiera de sus subrutas como activas
  const isActive = (path: string) =>
    path === "/tienda"
      ? location.pathname.startsWith("/tienda")
      : location.pathname === path;

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const toggleUserDropdown = () => setUserDropdownOpen((prev) => !prev);
  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    closeMenu();
  };

  const getLinkClasses = (path: string) => {
    const base =
      "px-3 py-2 border-b-2 transition-all duration-200 cursor-pointer";
    const active = isActive(path)
      ? "text-cyan-400 border-cyan-400"
      : "text-white border-transparent";
    const hover = "hover:text-cyan-400 hover:border-cyan-400";
    return `${base} ${active} ${hover}`;
  };

  const getMobileLinkClasses = (path: string) => {
    const base = "block px-3 py-2 transition-all duration-200 cursor-pointer";
    const active = isActive(path) ? "text-cyan-400 bg-gray-800" : "text-white";
    const hover = "hover:text-cyan-400 hover:bg-gray-800";
    return `${base} ${active} ${hover}`;
  };

  const iconBtn =
    "p-2 text-white transition-colors duration-200 hover:text-cyan-400 cursor-pointer";
  const textBtn =
    "px-3 py-2 text-white hover:text-cyan-400 transition-colors duration-200 cursor-pointer";

  const filteredTabs = TABS.filter(
    (tab) => !tab.roles || (user && tab.roles.some((role) => hasRole(role)))
  );

  return (
    <header className="w-full bg-gradient-to-tr from-gray-900 to-stone-800 shadow-2xl sticky top-0 z-50">
      <nav className="max-w-8xl mx-auto px-11 py-5 lg:py-6 flex items-center justify-between relative">
        {/* Logo */}
        <a
          href="/"
          onClick={closeMenu}
          className="flex items-center space-x-3 cursor-pointer"
        >
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

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-6">
          {filteredTabs.map((tab) => (
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button aria-label="Buscar" className={iconBtn}>
            <FaSearch size={20} />
          </button>
          <button aria-label="Carrito" className={iconBtn}>
            <FaShoppingCart size={20} />
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                aria-label="Usuario"
                className={iconBtn}
                onClick={toggleUserDropdown}
              >
                <FaUser size={20} />
              </button>

              {userDropdownOpen && (
                <DropdownMenu onClose={() => setUserDropdownOpen(false)}>
                  {user?.rol.idrol === 2 && (
                    <DropdownItem
                      onClick={() => {
                        navigate("/perfil");
                        setUserDropdownOpen(false);
                      }}
                      icon={<FaUser className="mr-2" />}
                    >
                      Mi Perfil
                    </DropdownItem>
                  )}
                  {user?.rol.idrol === 2 && (
                  <DropdownItem
                    onClick={() => {
                      navigate("/historialCompras");
                      setUserDropdownOpen(false);
                      closeMenu();
                    }}
                    icon={<FcAcceptDatabase className="mr-2" />}
                  >
                    Historial de Compras
                  </DropdownItem>
                  
                )}
                  <DropdownItem
                    onClick={handleLogout}
                    icon={<FaSignOutAlt className="mr-2" />}
                  >
                    Cerrar Sesión
                  </DropdownItem>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className={textBtn}>
              Iniciar Sesión
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-white hover:text-cyan-400 cursor-pointer focus:outline-none"
          aria-label="Abrir menú"
        >
          {menuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-5 border-t border-gray-700">
          <ul className="flex flex-col space-y-3">
            {filteredTabs.map((tab) => (
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
            <button aria-label="Buscar" className={iconBtn}>
              <FaSearch size={20} />
            </button>
            <button aria-label="Carrito" className={iconBtn}>
              <FaShoppingCart size={20} />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  aria-label="Usuario"
                  className={iconBtn}
                  onClick={toggleUserDropdown}
                >
                  <FaUser size={20} />
                </button>

                {userDropdownOpen && (
                  <DropdownMenu onClose={() => setUserDropdownOpen(false)}>
                    {user?.rol.idrol === 2 && (
                      <DropdownItem
                        onClick={() => {
                          navigate("/perfil");
                          setUserDropdownOpen(false);
                          closeMenu();
                        }}
                        icon={<FaUser className="mr-2" />}
                      >
                        Mi Perfil
                      </DropdownItem>
                    )}
                    <DropdownItem
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                      icon={<FaSignOutAlt className="mr-2" />}
                    >
                      Cerrar Sesión
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  closeMenu();
                }}
                className={textBtn}
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;