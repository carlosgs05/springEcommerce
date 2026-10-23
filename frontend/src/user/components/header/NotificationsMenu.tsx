import React, { type RefObject } from "react";
import { Bell } from "@phosphor-icons/react";
import type { Notificacion } from "@/user/hooks/useNotificaciones";

interface NotificationsMenuProps {
  notifications: Notificacion[];
  unreadCount: number;
  open: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (id: number, url: string | null) => void;
  getTiempoRelativo: (fecha: string) => string;
  iconBtnClassName: string;
  /** Posicionamiento del panel: "anchored" (pegado al botón, por defecto) o "full" (ocupa el ancho del contenedor relativo, para que no se corte en paneles angostos como el menú mobile). */
  panelPosition?: "anchored" | "full";
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications,
  unreadCount,
  open,
  dropdownRef,
  onToggle,
  onMarkAllAsRead,
  onNotificationClick,
  getTiempoRelativo,
  iconBtnClassName,
  panelPosition = "anchored",
}) => {
  // "full": el panel se ancla al contenedor posicionado más cercano (el panel del menú
  // mobile en HeaderMobileMenu, que ya es "relative") en vez de a este wrapper, así queda
  // acotado por el padding de ese contenedor y nunca se corta por los lados.
  const panelPositionClasses =
    panelPosition === "full"
      ? "absolute left-0 right-0 top-full mt-2"
      : "absolute right-0 top-full mt-2 w-80 origin-top-right";

  return (
    <div className={panelPosition === "full" ? undefined : "relative"} ref={dropdownRef}>
      <button
        aria-label="Notificaciones"
        className={`${iconBtnClassName} text-text-muted hover:text-primary relative`}
        onClick={onToggle}
        type="button"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full text-xs flex items-center justify-center text-text">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className={`${panelPositionClasses} bg-surface border border-border rounded-card shadow-elevation-3 overflow-hidden z-50`}>
          <div className="py-3 px-4 bg-canvas border-b border-border flex justify-between items-center">
            <div className="font-medium text-sm text-text">Notificaciones</div>
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-primary hover:text-primary-hover cursor-pointer"
              type="button"
            >
              Marcar todas como leídas
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.idnotificacion}
                  onClick={() =>
                    onNotificationClick(
                      notification.idnotificacion,
                      notification.url
                    )
                  }
                  className={`px-4 py-3 text-sm border-b border-border hover:bg-canvas transition-colors duration-200 cursor-pointer ${
                    notification.leido
                      ? "text-text-muted"
                      : "text-text bg-surface"
                  }`}
                >
                  <div className="font-medium">{notification.titulo}</div>
                  <div className="text-xs text-text-muted mt-1">
                    {notification.mensaje}
                  </div>
                  <div className="text-xs mt-1">
                    {getTiempoRelativo(notification.fecha)}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-text-muted">
                No hay notificaciones
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
