import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { List, X, ClipboardText, Storefront, Heart } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { useNotificaciones } from "@/user/hooks/useNotificaciones";
import { useCarrito } from "@/user/hooks/useCarrito";
import { useClickOutside } from "./useClickOutside";
import HeaderNav, { type Tab } from "./HeaderNav";
import UserMenu from "./UserMenu";
import CartMenu from "./CartMenu";
import NotificationsMenu from "./NotificationsMenu";
import HeaderMobileMenu from "./HeaderMobileMenu";

const TABS: Tab[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "nosotros", label: "Nosotros", href: "/nosotros" },
  { id: "tienda", label: "Tienda", href: "/tienda" },
  { id: "contacto", label: "Contacto", href: "/contacto" },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [carritoOpen, setCarritoOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const carritoRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    getTiempoRelativo,
    handleNotificationClick: handleNotificationClickBase,
    markAllAsRead,
  } = useNotificaciones(user, (url) => navigate(url, { replace: true }));

  const handleNotificationClick = (id: number, url: string | null) => {
    handleNotificationClickBase(id, url);
    setNotificationsOpen(false);
  };

  const {
    productosCarrito,
    quitarDelCarrito,
    vaciarCarrito,
    actualizarCantidad,
    guardarOEliminarCarritoAlSalir,
  } = useCarrito(user, isAuthenticated);

  useClickOutside(userDropdownRef, () => setUserDropdownOpen(false));
  useClickOutside(notificationsRef, () => setNotificationsOpen(false));
  useClickOutside(carritoRef, () => setCarritoOpen(false));

  const isActive = (path: string) =>
    path === "/tienda"
      ? location.pathname.startsWith("/tienda")
      : location.pathname === path;

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const toggleUserDropdown = () => setUserDropdownOpen((prev) => !prev);
  const toggleNotifications = () => setNotificationsOpen((prev) => !prev);

  const handleLogout = async () => {
    await guardarOEliminarCarritoAlSalir(user);
    logout();
    setUserDropdownOpen(false);
    closeMenu();
  };

  const iconBtn =
    "p-2.5 rounded-full bg-surface hover:bg-canvas transition-all duration-300 cursor-pointer flex items-center justify-center";
  const textBtn =
    "px-4 py-2.5 text-canvas bg-primary rounded-control hover:bg-primary-hover transition-all duration-300 cursor-pointer font-medium shadow-primary-glow";

  const filteredTabs = TABS.filter(
    (tab) => !tab.roles || (user && tab.roles.some((role) => hasRole(role)))
  );

  const handleVerCarrito = () => {
    setCarritoOpen(false);
    closeMenu();
    if (isAuthenticated) {
      navigate("/carrito");
    } else {
      navigate("/login", { state: { from: "carrito" } });
    }
  };

  const handleVerPedidos = () => {
    setCarritoOpen(false);
    closeMenu();
    navigate("/mis-pedidos");
  };

  const handleVerFavoritos = () => {
    setCarritoOpen(false);
    closeMenu();
    navigate("/favoritos");
  };

  const handleNavigateLogin = () => {
    navigate("/login");
    closeMenu();
  };

  const handleNavigatePerfil = () => {
    navigate("/perfil");
    setUserDropdownOpen(false);
    closeMenu();
  };

  return (
    <header className="w-full bg-surface shadow-elevation-2 sticky top-0 z-50 backdrop-blur-sm border-b border-border">
      <nav className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-full p-1">
            <div className="bg-canvas rounded-full p-1.5">
              <Storefront className="w-8 h-8 text-primary" weight="fill" aria-hidden="true" />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary tracking-wide">
              TechStore
            </h1>
            <p className="hidden sm:block text-xs text-text-muted mt-0.5">
              Tu tienda de electrónica favorita
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <HeaderNav
          tabs={filteredTabs}
          isActive={isActive}
          onNavigate={closeMenu}
          variant="desktop"
        />

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && (
            <NotificationsMenu
              notifications={notifications}
              unreadCount={unreadCount}
              open={notificationsOpen}
              dropdownRef={notificationsRef}
              onToggle={toggleNotifications}
              onMarkAllAsRead={markAllAsRead}
              onNotificationClick={handleNotificationClick}
              getTiempoRelativo={getTiempoRelativo}
              iconBtnClassName={iconBtn}
            />
          )}

          <CartMenu
            productosCarrito={productosCarrito}
            open={carritoOpen}
            dropdownRef={carritoRef}
            onToggle={() => setCarritoOpen((prev) => !prev)}
            onVaciar={vaciarCarrito}
            onActualizarCantidad={actualizarCantidad}
            onQuitar={quitarDelCarrito}
            onVerCarrito={handleVerCarrito}
            iconBtnClassName={iconBtn}
          />

          {isAuthenticated && user?.rol.idrol === 2 && (
            <button
              aria-label="Mis favoritos"
              className={`${iconBtn} text-text-muted hover:text-primary transition-all duration-300`}
              onClick={handleVerFavoritos}
              type="button"
            >
              <Heart size={23} />
            </button>
          )}

          {isAuthenticated && user?.rol.idrol === 2 && (
            <button
              aria-label="Pedidos realizados"
              className={`${iconBtn} text-text-muted hover:text-primary transition-all duration-300`}
              onClick={handleVerPedidos}
              type="button"
            >
              <ClipboardText size={23} />
            </button>
          )}

          <UserMenu
            isAuthenticated={isAuthenticated}
            user={user}
            dropdownOpen={userDropdownOpen}
            dropdownRef={userDropdownRef}
            onToggleDropdown={toggleUserDropdown}
            onNavigateLogin={handleNavigateLogin}
            onNavigatePerfil={handleNavigatePerfil}
            onLogout={handleLogout}
            textBtnClassName={textBtn}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-text-muted hover:text-primary cursor-pointer focus:outline-none"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          type="button"
        >
          {menuOpen ? (
            <X size={28} className="text-text-muted" />
          ) : (
            <List size={28} className="text-text-muted" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <HeaderMobileMenu
          tabs={filteredTabs}
          isActive={isActive}
          onNavigate={closeMenu}
          isAuthenticated={isAuthenticated}
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
          notificationsOpen={notificationsOpen}
          notificationsRef={notificationsRef}
          onToggleNotifications={toggleNotifications}
          onMarkAllAsRead={markAllAsRead}
          onNotificationClick={handleNotificationClick}
          getTiempoRelativo={getTiempoRelativo}
          cantidadCarrito={productosCarrito.length}
          onVerCarrito={handleVerCarrito}
          onVerPedidos={handleVerPedidos}
          onVerFavoritos={handleVerFavoritos}
          userDropdownOpen={userDropdownOpen}
          userDropdownRef={userDropdownRef}
          onToggleUserDropdown={toggleUserDropdown}
          onNavigateLogin={handleNavigateLogin}
          onNavigatePerfil={handleNavigatePerfil}
          onLogout={handleLogout}
          iconBtnClassName={iconBtn}
          textBtnClassName={textBtn}
        />
      )}
    </header>
  );
};

export default Header;
