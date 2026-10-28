import React, { type RefObject } from "react";
import { ShoppingCart, ClipboardText, Heart } from "@phosphor-icons/react";
import HeaderNav, { type Tab } from "./HeaderNav";
import UserMenu from "./UserMenu";
import NotificationsMenu from "./NotificationsMenu";
import type { Notificacion } from "@/user/hooks/useNotificaciones";

interface UsuarioInfo {
  nombre?: string;
  correo?: string;
  rol: { idrol: number };
}

interface HeaderMobileMenuProps {
  tabs: Tab[];
  isActive: (path: string) => boolean;
  onNavigate: () => void;
  isAuthenticated: boolean;
  user: UsuarioInfo | null | undefined;
  notifications: Notificacion[];
  unreadCount: number;
  notificationsOpen: boolean;
  notificationsRef: RefObject<HTMLDivElement | null>;
  onToggleNotifications: () => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (id: number, url: string | null) => void;
  getTiempoRelativo: (fecha: string) => string;
  cantidadCarrito: number;
  onVerCarrito: () => void;
  onVerPedidos: () => void;
  onVerFavoritos: () => void;
  userDropdownOpen: boolean;
  userDropdownRef: RefObject<HTMLDivElement | null>;
  onToggleUserDropdown: () => void;
  onNavigateLogin: () => void;
  onNavigatePerfil: () => void;
  onLogout: () => void;
  iconBtnClassName: string;
  textBtnClassName: string;
}

const HeaderMobileMenu: React.FC<HeaderMobileMenuProps> = ({
  tabs,
  isActive,
  onNavigate,
  isAuthenticated,
  user,
  notifications,
  unreadCount,
  notificationsOpen,
  notificationsRef,
  onToggleNotifications,
  onMarkAllAsRead,
  onNotificationClick,
  getTiempoRelativo,
  cantidadCarrito,
  onVerCarrito,
  onVerPedidos,
  onVerFavoritos,
  userDropdownOpen,
  userDropdownRef,
  onToggleUserDropdown,
  onNavigateLogin,
  onNavigatePerfil,
  onLogout,
  iconBtnClassName,
  textBtnClassName,
}) => {
  return (
    <div className="md:hidden relative px-4 py-3 border-t border-border bg-surface">
      <HeaderNav
        tabs={tabs}
        isActive={isActive}
        onNavigate={onNavigate}
        variant="mobile"
      />

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex space-x-2">
          {isAuthenticated && (
            <NotificationsMenu
              notifications={notifications}
              unreadCount={unreadCount}
              open={notificationsOpen}
              dropdownRef={notificationsRef}
              onToggle={onToggleNotifications}
              onMarkAllAsRead={onMarkAllAsRead}
              onNotificationClick={onNotificationClick}
              getTiempoRelativo={getTiempoRelativo}
              iconBtnClassName={iconBtnClassName}
              panelPosition="full"
            />
          )}

          <button
            aria-label="Carrito"
            className={`${iconBtnClassName} text-text-muted hover:text-primary relative`}
            onClick={onVerCarrito}
          >
            <ShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-canvas">
              {cantidadCarrito}
            </span>
          </button>

          {isAuthenticated && user?.rol.idrol === 2 && (
            <button
              aria-label="Mis favoritos"
              className={`${iconBtnClassName} text-text-muted hover:text-primary transition-all duration-300`}
              onClick={onVerFavoritos}
              type="button"
            >
              <Heart size={21} />
            </button>
          )}

          {isAuthenticated && user?.rol.idrol === 2 && (
            <button
              aria-label="Pedidos realizados"
              className={`${iconBtnClassName} text-text-muted hover:text-primary transition-all duration-300`}
              onClick={onVerPedidos}
              type="button"
            >
              <ClipboardText size={21} />
            </button>
          )}
        </div>

        <UserMenu
          isAuthenticated={isAuthenticated}
          user={user}
          dropdownOpen={userDropdownOpen}
          dropdownRef={userDropdownRef}
          onToggleDropdown={onToggleUserDropdown}
          onNavigateLogin={onNavigateLogin}
          onNavigatePerfil={onNavigatePerfil}
          onLogout={onLogout}
          textBtnClassName={textBtnClassName}
          showEmail={false}
        />
      </div>
    </div>
  );
};

export default HeaderMobileMenu;
