import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBell } from "react-icons/fa";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineTrash,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { TbMoodEmpty, TbShoppingBagCheck } from "react-icons/tb";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

interface Tab {
  id: string;
  label: string;
  href: string;
  roles?: number[];
}

interface ProductoCarrito {
  idproducto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string;
}

interface Notificacion {
  idnotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  url: string | null;
  leido: boolean;
  fecha: string;
}

const TABS: Tab[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "nosotros", label: "Nosotros", href: "/nosotros" },
  { id: "tienda", label: "Tienda", href: "/tienda" },
  { id: "contacto", label: "Contacto", href: "/contacto" },
];

const getCarrito = (): ProductoCarrito[] => {
  const stored = localStorage.getItem("carrito");
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    return parsed.map((producto: any) => ({
      ...producto,
      cantidad: Number(producto.cantidad) || 1,
      stock: Number(producto.stock) || 0,
    }));
  } catch {
    return [];
  }
};

const setCarrito = (productos: ProductoCarrito[]) => {
  localStorage.setItem("carrito", JSON.stringify(productos));
  window.dispatchEvent(new CustomEvent("carrito-updated"));
};

const eliminarCarritoLocal = () => {
  localStorage.removeItem("carrito");
  window.dispatchEvent(new CustomEvent("carrito-updated"));
};

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [productosCarrito, setProductosCarrito] = useState<ProductoCarrito[]>(
    []
  );
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const carritoRef = useRef<HTMLDivElement>(null);

  // Obtener notificaciones del backend
  useEffect(() => {
    const fetchNotifications = () => {
      if (user?.iduser) {
        axios
          .get(
            `http://localhost:8080/api/notificaciones/pendientes/${user.iduser}`
          )
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

  // Actualizar la hora actual cada minuto
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

  // Manejar clic en notificación - CORREGIDO
  const handleNotificationClick = (id: number, url: string | null) => {
    axios
      .put(`http://localhost:8080/api/notificaciones/marcar-leido/${id}`)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.idnotificacion === id ? { ...n, leido: true } : n))
        );
        setNotificationsOpen(false);

        if (url) {
          // 1. Eliminar barras diagonales duplicadas o inconsistentes
          const cleanedUrl = url.replace(/^\/+|\/+$/g, ""); // Ej: "mis-pedidos/2" → "mis-pedidos/2"

          // 2. Convertir a ruta absoluta
          const absoluteUrl = `/${cleanedUrl}`; // "/mis-pedidos/2"

          // 3. Navegar usando navigate() con replace: true para evitar problemas de historia
          navigate(absoluteUrl, { replace: true });
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

  useEffect(() => {
    setProductosCarrito(getCarrito());
    const handler = () => setProductosCarrito(getCarrito());
    window.addEventListener("carrito-updated", handler);
    return () => window.removeEventListener("carrito-updated", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      )
        setUserDropdownOpen(false);

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      )
        setNotificationsOpen(false);

      if (
        carritoRef.current &&
        !carritoRef.current.contains(event.target as Node)
      )
        setCarritoOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) =>
    path === "/tienda"
      ? location.pathname.startsWith("/tienda")
      : location.pathname === path;

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const toggleUserDropdown = () => setUserDropdownOpen((prev) => !prev);
  const toggleNotifications = () => setNotificationsOpen((prev) => !prev);

  // ========== NUEVO FLUJO DE CARRITO ==========
  useEffect(() => {
    const fusionarCarritos = async () => {
      if (isAuthenticated && user && user.iduser && user.rol.idrol === 2) {
        let carritoBD: ProductoCarrito[] = [];
        try {
          const resp = await axios.get(
            `http://localhost:8080/api/carrito/${user.iduser}`
          );
          if (
            resp.data.success &&
            resp.data.data &&
            resp.data.data.listaProductos
          ) {
            carritoBD = JSON.parse(resp.data.data.listaProductos);
          }
        } catch (e) {
          carritoBD = [];
        }

        const carritoLocal = getCarrito();
        let carritoFinal: ProductoCarrito[] = [];

        if (carritoLocal.length > 0 && carritoBD.length > 0) {
          const localMap = new Map(carritoLocal.map((p) => [p.idproducto, p]));
          carritoBD.forEach((p) => {
            if (!localMap.has(p.idproducto)) {
              localMap.set(p.idproducto, p);
            }
          });
          carritoFinal = Array.from(localMap.values());
        } else if (carritoBD.length > 0) {
          carritoFinal = carritoBD;
        } else if (carritoLocal.length > 0) {
          carritoFinal = carritoLocal;
        }

        setCarrito(carritoFinal);
        setProductosCarrito(carritoFinal);

        if (carritoBD.length > 0 || carritoFinal.length > 0) {
          try {
            await axios.delete(
              `http://localhost:8080/api/carrito/eliminar/${user.iduser}`
            );
          } catch (e) {}
        }
      }
    };

    if (isAuthenticated) {
      fusionarCarritos();
    }
  }, [isAuthenticated, user?.iduser]);

  const handleLogout = async () => {
    if (isAuthenticated && user && user.rol.idrol === 2) {
      const carritoLocal = getCarrito();
      if (carritoLocal.length > 0) {
        try {
          await axios.post("http://localhost:8080/api/carrito/guardar", {
            iduser: user.iduser,
            listaProductos: JSON.stringify(carritoLocal),
          });
        } catch (e) {}
      } else {
        try {
          await axios.delete(
            `http://localhost:8080/api/carrito/${user.iduser}`
          );
        } catch (e) {}
      }
    }
    eliminarCarritoLocal();
    setProductosCarrito([]);
    logout();
    setUserDropdownOpen(false);
    closeMenu();
  };

  // ========== FIN NUEVO FLUJO DE CARRITO ==========

  const getLinkClasses = (path: string) => {
    const base = "px-3 py-2 transition-all duration-200 cursor-pointer";
    const active = isActive(path)
      ? "text-cyan-400 font-medium"
      : "text-gray-300";
    const hover = "hover:text-cyan-400";
    return `${base} ${active} ${hover}`;
  };

  const getMobileLinkClasses = (path: string) => {
    const base = "block px-4 py-3 transition-all duration-200 cursor-pointer";
    const active = isActive(path)
      ? "text-cyan-400 bg-gray-800 rounded-lg"
      : "text-gray-300";
    const hover = "hover:text-cyan-400 hover:bg-gray-800 hover:rounded-lg";
    return `${base} ${active} ${hover}`;
  };

  const iconBtn =
    "p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 cursor-pointer flex items-center justify-center";
  const textBtn =
    "px-4 py-2.5 text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:opacity-90 transition-all duration-300 cursor-pointer font-medium";

  const filteredTabs = TABS.filter(
    (tab) => !tab.roles || (user && tab.roles.some((role) => hasRole(role)))
  );

  const quitarDelCarrito = (idproducto: number) => {
    const nuevo = productosCarrito.filter((p) => p.idproducto !== idproducto);
    setCarrito(nuevo);
    setProductosCarrito(nuevo);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setProductosCarrito([]);
  };

  const actualizarCantidad = (idproducto: number, nuevaCantidad: number) => {
    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) return;
    const nuevo = productosCarrito.map((p) =>
      p.idproducto === idproducto ? { ...p, cantidad: nuevaCantidad } : p
    );
    setCarrito(nuevo);
    setProductosCarrito(nuevo);
  };

  const handleVerCarrito = () => {
    setCarritoOpen(false);
    if (isAuthenticated) {
      navigate("/carrito");
    } else {
      navigate("/login", { state: { from: "carrito" } });
    }
  };

  // Ir a pedidos
  const handleVerPedidos = () => {
    setCarritoOpen(false);
    navigate("/mis-pedidos");
  };

  return (
    <header className="w-full bg-gradient-to-tr from-gray-900 to-stone-800 shadow-2xl sticky top-0 z-50 backdrop-blur-sm border-b border-gray-700">
      <nav className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative">
        {/* Logo */}
        <a
          href="/"
          onClick={closeMenu}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-1">
            <div className="bg-gray-900 rounded-full p-1.5">
              <img
                src="https://img.icons8.com/fluent/344/year-of-tiger.png"
                alt="Logo TechShop"
                className="w-8 h-8"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wide">
              TechShop
            </h1>
            <p className="hidden sm:block text-xs text-gray-400 mt-0.5">
              Tu tienda de electrónica favorita
            </p>
          </div>
        </a>
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-1 bg-gray-800/80 rounded-xl px-2 py-1.5">
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
        <div className="hidden md:flex items-center space-x-3">
          {/* Notificaciones */}
          {isAuthenticated && (
            <div className="relative" ref={notificationsRef}>
              <button
                aria-label="Notificaciones"
                className={`${iconBtn} text-gray-300 hover:text-cyan-400 relative`}
                onClick={toggleNotifications}
                type="button"
              >
                <FaBell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 origin-top-right bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center">
                    <div className="font-medium text-sm">Notificaciones</div>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
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
                            handleNotificationClick(
                              notification.idnotificacion,
                              notification.url
                            )
                          }
                          className={`px-4 py-3 text-sm border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                            notification.leido
                              ? "text-gray-400"
                              : "text-gray-100 bg-gray-800"
                          }`}
                        >
                          <div className="font-medium">
                            {notification.titulo}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {notification.mensaje}
                          </div>
                          <div className="text-xs mt-1">
                            {getTiempoRelativo(notification.fecha)}
                          </div>
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
          )}

          {/* Carrito con dropdown moderno */}
          <div className="relative" ref={carritoRef}>
            <button
              aria-label="Carrito"
              className={`${iconBtn} text-gray-300 hover:text-cyan-400 relative`}
              onClick={() => setCarritoOpen((prev) => !prev)}
              type="button"
            >
              <FaShoppingCart size={18} />
              {productosCarrito.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {productosCarrito.length}
                </span>
              )}
            </button>
            {carritoOpen && (
              <div className="absolute right-0 top-full mt-3 w-96 max-w-xs sm:max-w-sm bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 animate-fade-in transition-all duration-300 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  <div className="flex items-center gap-2 text-lg font-semibold cursor-pointer">
                    <TbShoppingBagCheck className="text-2xl" />
                    Carrito
                  </div>
                  <button
                    onClick={vaciarCarrito}
                    className="flex items-center gap-1 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-xl px-3 py-1.5 text-white transition-all duration-200 cursor-pointer"
                    title="Vaciar carrito"
                    type="button"
                  >
                    <HiOutlineTrash className="text-base" />
                    Vaciar
                  </button>
                </div>
                {/* Productos */}
                <div className="flex-1 max-h-72 overflow-y-auto divide-y divide-gray-700">
                  {productosCarrito.length > 0 ? (
                    productosCarrito.map((p) => (
                      <div
                        key={p.idproducto}
                        className="flex items-center gap-3 px-5 py-4 bg-gray-800 hover:bg-gray-750 transition-all duration-200"
                      >
                        {/* Imagen */}
                        <div className="flex-shrink-0 bg-gray-700 rounded-xl p-2">
                          <img
                            src={`http://localhost:8080/uploads/${encodeURIComponent(
                              p.imagen
                            )}`}
                            alt={p.nombre}
                            className="w-12 h-12 object-contain rounded-md"
                          />
                        </div>

                        {/* Información */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-100 truncate cursor-pointer">
                            {p.nombre}
                          </div>
                          <div className="text-cyan-400 text-sm mt-1 cursor-pointer">
                            S/ {p.precio.toFixed(2)}
                          </div>
                        </div>

                        {/* Controles de cantidad + papelera */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                actualizarCantidad(
                                  p.idproducto,
                                  (Number(p.cantidad) || 1) - 1
                                )
                              }
                              disabled={p.cantidad <= 1}
                              className={`p-1 rounded-md cursor-pointer ${
                                p.cantidad <= 1
                                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-700 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                              }`}
                              type="button"
                            >
                              <HiOutlineMinus className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-200 w-6 text-center cursor-pointer">
                              {Number(p.cantidad) || 1}
                            </span>
                            <button
                              onClick={() =>
                                actualizarCantidad(
                                  p.idproducto,
                                  (Number(p.cantidad) || 1) + 1
                                )
                              }
                              className={`p-1 rounded-md cursor-pointer bg-gray-700 text-cyan-400 hover:bg-cyan-500 hover:text-white`}
                              type="button"
                            >
                              <HiOutlinePlus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer p-1.5"
                            onClick={() => quitarDelCarrito(p.idproducto)}
                            title="Quitar"
                            type="button"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-10 px-4 text-cyan-400 opacity-80 animate-in fade-in-0">
                      <TbMoodEmpty className="text-6xl mb-2 cursor-pointer" />
                      <span className="text-base font-medium cursor-pointer">
                        Tu carrito está vacío
                      </span>
                    </div>
                  )}
                </div>
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-850 border-t border-gray-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 font-medium cursor-pointer">
                      Subtotal:
                    </span>
                    <span className="text-xl font-bold text-cyan-400 tracking-wide cursor-pointer">
                      S/{" "}
                      {productosCarrito
                        .reduce((a, p) => a + p.precio * (p.cantidad || 1), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleVerCarrito}
                      className="w-full py-3 text-center text-cyan-400 hover:text-cyan-300 font-medium transition-all duration-300 cursor-pointer"
                      type="button"
                    >
                      Ver carrito completo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón de Pedidos */}
          {isAuthenticated && user?.rol.idrol === 2 && (
            <button
              aria-label="Pedidos realizados"
              className={`${iconBtn} text-gray-300 hover:text-cyan-400 transition-all duration-300`}
              onClick={handleVerPedidos}
              type="button"
            >
              <HiOutlineClipboardList size={23} />
            </button>
          )}

          {/* Usuario */}
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                aria-label="Usuario"
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                onClick={toggleUserDropdown}
                type="button"
              >
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-0.5">
                  <div className="bg-gray-800 rounded-full p-1.5">
                    <FaUser className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm text-gray-200 cursor-pointer">
                    {user?.nombre || "Usuario"}
                  </div>
                  <div className="text-xs text-gray-400 cursor-pointer">
                    {user?.correo || "usuario@techshop.com"}
                  </div>
                </div>
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 origin-top-right bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  {user?.rol.idrol === 2 && (
                    <button
                      onClick={() => {
                        navigate("/perfil");
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                      type="button"
                    >
                      <FaUser className="mr-3 text-cyan-400" />
                      <span>Mi Perfil</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-200 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                    type="button"
                  >
                    <FaSignOutAlt className="mr-3" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className={textBtn}
              type="button"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-300 hover:text-cyan-400 cursor-pointer focus:outline-none"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          type="button"
        >
          {menuOpen ? (
            <HiOutlineX size={28} className="text-gray-300" />
          ) : (
            <HiOutlineMenu size={28} className="text-gray-300" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 py-3 border-t border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900">
          <ul className="flex flex-col space-y-1 mb-3">
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

          <div className="flex items-center justify-between border-t border-gray-700 pt-3">
            <div className="flex space-x-2">
              {isAuthenticated && (
                <div className="relative" ref={notificationsRef}>
                  <button
                    aria-label="Notificaciones"
                    className={`${iconBtn} text-gray-300 hover:text-cyan-400 relative`}
                    onClick={toggleNotifications}
                  >
                    <FaBell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 origin-top-right bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center">
                        <div className="font-medium text-sm">
                          Notificaciones
                        </div>
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
                              key={notification.idnotificacion}
                              onClick={() =>
                                handleNotificationClick(
                                  notification.idnotificacion,
                                  notification.url
                                )
                              }
                              className={`px-4 py-3 text-sm border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                                notification.leido
                                  ? "text-gray-400"
                                  : "text-gray-100 bg-gray-800"
                              }`}
                            >
                              <div className="font-medium">
                                {notification.titulo}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {notification.mensaje}
                              </div>
                              <div className="text-xs mt-1">
                                {getTiempoRelativo(notification.fecha)}
                              </div>
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
              )}

              <button
                aria-label="Carrito"
                className={`${iconBtn} text-gray-300 hover:text-cyan-400 relative`}
                onClick={() => {
                  navigate("/carrito");
                  closeMenu();
                }}
              >
                <FaShoppingCart size={16} />
                <span className="absolute top-0 right-0 w-5 h-5 bg-cyan-500 rounded-full text-xs flex items-center justify-center text-white">
                  {productosCarrito.length}
                </span>
              </button>

              {/* Botón de Pedidos en Mobile */}
              {isAuthenticated && user?.rol.idrol === 2 && (
                <button
                  aria-label="Pedidos realizados"
                  className={`${iconBtn} text-gray-300 hover:text-cyan-400 transition-all duration-300`}
                  onClick={() => {
                    navigate("/mis-pedidos");
                    closeMenu();
                  }}
                  type="button"
                >
                  <HiOutlineClipboardList size={21} />
                </button>
              )}
            </div>

            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  aria-label="Usuario"
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                  onClick={toggleUserDropdown}
                >
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-0.5">
                    <div className="bg-gray-800 rounded-full p-1.5">
                      <FaUser className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-gray-200 cursor-pointer">
                      {user?.nombre || "Usuario"}
                    </div>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 origin-top-right bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    {user?.rol.idrol === 2 && (
                      <button
                        onClick={() => {
                          navigate("/perfil");
                          setUserDropdownOpen(false);
                          closeMenu();
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                      >
                        <FaUser className="mr-3 text-cyan-400" />
                        <span>Mi Perfil</span>
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-200 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                    >
                      <FaSignOutAlt className="mr-3" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
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
