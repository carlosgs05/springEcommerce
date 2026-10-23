import React, { type RefObject } from "react";
import { User, SignOut } from "@phosphor-icons/react";

interface UsuarioInfo {
  nombre?: string;
  correo?: string;
  rol: { idrol: number };
}

interface UserMenuProps {
  isAuthenticated: boolean;
  user: UsuarioInfo | null | undefined;
  dropdownOpen: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  onToggleDropdown: () => void;
  onNavigateLogin: () => void;
  onNavigatePerfil: () => void;
  onLogout: () => void;
  textBtnClassName: string;
  showEmail?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({
  isAuthenticated,
  user,
  dropdownOpen,
  dropdownRef,
  onToggleDropdown,
  onNavigateLogin,
  onNavigatePerfil,
  onLogout,
  textBtnClassName,
  showEmail = true,
}) => {
  if (!isAuthenticated) {
    return (
      <button onClick={onNavigateLogin} className={textBtnClassName} type="button">
        Iniciar Sesión
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Usuario"
        className="flex items-center space-x-2 p-1.5 rounded-control hover:bg-surface transition-all duration-300 cursor-pointer"
        onClick={onToggleDropdown}
        type="button"
      >
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-full p-0.5">
          <div className="bg-surface rounded-full p-1.5">
            <User className="w-4 h-4 text-primary" weight="fill" />
          </div>
        </div>
        <div className="text-left">
          <div className="font-medium text-sm text-text cursor-pointer">
            {user?.nombre || "Usuario"}
          </div>
          {showEmail && (
            <div className="text-xs text-text-muted cursor-pointer">
              {user?.correo || "usuario@techstore.com"}
            </div>
          )}
        </div>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 origin-top-right bg-surface border border-border rounded-card shadow-elevation-3 overflow-hidden z-50">
          {user?.rol.idrol === 2 && (
            <button
              onClick={onNavigatePerfil}
              className="flex items-center w-full px-4 py-3 text-sm text-text hover:bg-canvas transition-colors duration-200 cursor-pointer"
              type="button"
            >
              <User className="mr-3 text-primary" size={18} />
              <span>Mi Perfil</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-text hover:bg-danger/20 hover:text-danger transition-colors duration-200 cursor-pointer"
            type="button"
          >
            <SignOut className="mr-3" size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
