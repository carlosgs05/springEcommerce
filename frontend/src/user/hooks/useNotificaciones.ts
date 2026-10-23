import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Notificacion {
  idnotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  url: string | null;
  leido: boolean;
  fecha: string;
}

interface UsuarioMinimo {
  iduser?: number;
}

export function useNotificaciones(
  user: UsuarioMinimo | null | undefined,
  onNavigate: (url: string) => void
) {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  // Obtener notificaciones del backend
  useEffect(() => {
    const fetchNotifications = () => {
      if (user?.iduser) {
        api
          .get(`/api/notificaciones/pendientes/${user.iduser}`)
          .then((res) => {
            if (res.data.success) {
              setNotifications(res.data.data);
            }
          })
          .catch((err) => {
            console.error("Error al obtener notificaciones:", err);
          });
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user?.iduser]);

  // Actualizar la hora actual cada minuto (para el tiempo relativo)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calcular tiempo relativo para notificaciones
  const getTiempoRelativo = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    const diffMs = now.getTime() - fecha.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return "Hace unos segundos";
    if (diffMin === 1) return "Hace 1 minuto";
    if (diffMin < 60) return `Hace ${diffMin} minutos`;
    if (diffHrs === 1) return "Hace 1 hora";
    if (diffHrs < 24) return `Hace ${diffHrs} horas`;
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} días`;
  };

  // Manejar clic en notificación
  const handleNotificationClick = (id: number, url: string | null) => {
    api
      .put(`/api/notificaciones/marcar-leido/${id}`)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.idnotificacion === id ? { ...n, leido: true } : n))
        );

        if (url) {
          const cleanedUrl = url.replace(/^\/+|\/+$/g, "");
          const absoluteUrl = `/${cleanedUrl}`;
          onNavigate(absoluteUrl);
        }
      })
      .catch((err) => {
        console.error("Error al marcar como leída:", err);
      });
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.leido) {
        handleNotificationClick(n.idnotificacion, null);
      }
    });
  };

  const unreadCount = notifications.filter((n) => !n.leido).length;

  return {
    notifications,
    unreadCount,
    getTiempoRelativo,
    handleNotificationClick,
    markAllAsRead,
  };
}
