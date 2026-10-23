import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiArrowLeft,
  FiShoppingBag,
  FiCreditCard,
  FiMapPin,
  FiFileText,
  FiAlertCircle,
  FiInbox,
} from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: { idImagen: string; nombre: string }[];
  especificaciones: {
    idEspecificacion: number;
    unidadMedida: string;
    valor: number;
    descripcion: string;
  }[];
}

interface DetallePedido {
  idDetalle: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: Producto;
}

interface MetodoEnvio {
  idMetodoEnvio: number;
  nombre: string;
  costo: number;
  tiempoEstimado: string;
}

interface MetodoPago {
  idMetodoPago: number;
  nombre: string;
}

interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
}

interface Pedido {
  idPedido: number;
  fechaPedido: string;
  estado: number;
  montoPedido: number;
  montoEnvio: number;
  montoTotal: number;
  comprobantePago: string;
  direccionEnvio: string;
  observacion: string;
  usuario: Usuario;
  metodoEnvio: MetodoEnvio;
  metodoPago: MetodoPago;
  detalles: DetallePedido[];
}

interface ApiResponse {
  success: boolean;
  count: number;
  userId: number;
  year: number;
  month: number;
  pedidos: Pedido[];
  message?: string;
}

const MisPedidos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const cargarPedidos = async () => {
    try {
      if (!user?.iduser) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(
        `http://localhost:8080/api/pedidos/usuario/${user.iduser}/filtro?year=${year}&month=${month}`
      );

      if (response.data.success && response.data.pedidos.length > 0) {
        setPedidos(response.data.pedidos);
      } else {
        setError(
          response.data.message || "No se encontraron pedidos para este período"
        );
      }
    } catch (err) {
      setError("Error al cargar pedidos");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [user, year, month]);

  const isNextMonthDisabled = () => {
    const now = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return (
      nextMonth.getFullYear() > now.getFullYear() ||
      (nextMonth.getFullYear() === now.getFullYear() &&
        nextMonth.getMonth() > now.getMonth())
    );
  };

  const cambiarMes = (incremento: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      const newMonth = newDate.getMonth() + incremento;
      newDate.setMonth(newMonth);

      const now = new Date();
      if (
        newDate.getFullYear() > now.getFullYear() ||
        (newDate.getFullYear() === now.getFullYear() &&
          newDate.getMonth() > now.getMonth())
      ) {
        return prev;
      }

      return newDate;
    });
  };

  const getEstadoInfo = (estado: number) => {
    switch (estado) {
      case -2:
        return {
          texto: "Rechazado",
          icon: <FiXCircle className="text-rose-600" />,
          color: "bg-rose-100 text-rose-800",
          border: "border-l-4 border-rose-600",
          bg: "bg-gradient-to-r from-rose-50 to-white",
        };
      case -1:
        return {
          texto: "Apelado",
          icon: <FiAlertCircle className="text-amber-600" />,
          color: "bg-amber-100 text-amber-800",
          border: "border-l-4 border-amber-600",
          bg: "bg-gradient-to-r from-amber-50 to-white",
        };
      case 0:
        return {
          texto: "Pendiente de verificación",
          icon: <FiClock className="text-blue-400" />,
          color: "bg-blue-100 text-blue-800",
          border: "border-l-4 border-blue-400",
          bg: "bg-gradient-to-r from-blue-50 to-white",
        };
      case 1:
        return {
          texto: "Confirmado",
          icon: <FiCheckCircle className="text-emerald-600" />,
          color: "bg-emerald-100 text-emerald-800",
          border: "border-l-4 border-emerald-600",
          bg: "bg-gradient-to-r from-emerald-50 to-white",
        };
      case 2:
        return {
          texto: "En camino",
          icon: <FiTruck className="text-cyan-600" />,
          color: "bg-cyan-100 text-cyan-800",
          border: "border-l-4 border-cyan-600",
          bg: "bg-gradient-to-r from-cyan-50 to-white",
        };
      case 3:
        return {
          texto: "Listo para recojo",
          icon: <FiInbox className="text-violet-600" />,
          color: "bg-violet-100 text-violet-800",
          border: "border-l-4 border-violet-600",
          bg: "bg-gradient-to-r from-violet-50 to-white",
        };
      case 4:
        return {
          texto: "Recibido",
          icon: <FiCheckCircle className="text-indigo-600" />,
          color: "bg-indigo-100 text-indigo-800",
          border: "border-l-4 border-indigo-600",
          bg: "bg-gradient-to-r from-indigo-50 to-white",
        };
      default:
        return {
          texto: "Estado desconocido",
          icon: null,
          color: "bg-gray-100 text-gray-800",
          border: "border-l-4 border-gray-500",
          bg: "bg-gradient-to-r from-gray-50 to-white",
        };
    }
  };

  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const handleVerDetalles = (idPedido: number) => {
    navigate(`/mis-pedidos/${idPedido}`);
  };

  return (
    <>
      <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-cyan-700 hover:text-cyan-800 font-medium transition text-base cursor-pointer group"
            >
              <FiArrowLeft className="mr-2 text-xl group-hover:-translate-x-1 transition-transform" />
              Volver
            </button>
          </div>

          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-2xl shadow-lg mr-4">
              <FiPackage className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                Mis Pedidos
              </h1>
            </div>
          </div>

          {/* Selector de Mes */}
          <div className="flex items-center justify-between mb-8 bg-white rounded-2xl shadow-md p-4 border border-cyan-100">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-3 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 hover:from-cyan-200 hover:to-blue-200 cursor-pointer transition-all shadow-sm hover:shadow-md"
              aria-label="Mes anterior"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>

            <div className="text-xl font-bold text-cyan-800 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-3 rounded-xl border border-cyan-200 shadow-inner">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>

            <button
              onClick={() => cambiarMes(1)}
              disabled={isNextMonthDisabled()}
              className={`p-3 rounded-full ${
                isNextMonthDisabled()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 hover:from-cyan-200 hover:to-blue-200 cursor-pointer transition-all shadow-sm hover:shadow-md"
              }`}
              aria-label="Mes siguiente"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-xl border border-cyan-100">
              <div className="relative">
                <FaSpinner className="animate-spin text-5xl text-cyan-600 mb-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full animate-ping opacity-20"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mt-4">
                Cargando tus pedidos
              </h3>
              <p className="text-gray-500 mt-1">
                Estamos preparando toda la información...
              </p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 border-l-4 border-rose-500 p-6 mb-6 rounded-2xl shadow-md">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-3 bg-rose-100 rounded-full">
                  <FiXCircle className="h-6 w-6 text-rose-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-rose-800">
                    ¡Vaya! No encontramos pedidos
                  </h3>
                  <button
                    onClick={() => navigate("/tienda")}
                    className="mt-4 inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer hover:from-amber-600 hover:to-orange-600 transform hover:-translate-y-0.5"
                  >
                    <FiShoppingBag className="mr-2" />
                    Explorar productos
                  </button>
                </div>
              </div>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-3xl shadow-xl p-10 text-center border border-cyan-200">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-6 text-white shadow-lg">
                <FiPackage className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No hay pedidos en {months[currentDate.getMonth()]}{" "}
                {currentDate.getFullYear()}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Parece que no realizaste pedidos este mes. ¡Descubre nuestras
                ofertas especiales!
              </p>
              <button
                onClick={() => navigate("/tienda")}
                className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <FiShoppingBag className="mr-3 text-lg" />
                Ir a la tienda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {pedidos.map((pedido) => {
                const estadoInfo = getEstadoInfo(pedido.estado);
                const cantidadProductos = pedido.detalles.length;

                return (
                  <div
                    key={pedido.idPedido}
                    className={`bg-white rounded-3xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${estadoInfo.border} ${estadoInfo.bg}`}
                  >
                    <div className="px-7 py-6 flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span
                            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${estadoInfo.color} mr-4 shadow-sm`}
                          >
                            {estadoInfo.icon}
                            <span className="ml-2">{estadoInfo.texto}</span>
                          </span>
                          <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-lg">
                            {formatFecha(pedido.fechaPedido)}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          Pedido #
                          <span className="text-cyan-700">
                            {pedido.idPedido}
                          </span>
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 px-4 py-1.5 rounded-xl text-sm font-bold flex items-center shadow-inner">
                          <FiShoppingBag className="mr-2" />
                          {cantidadProductos}{" "}
                          {cantidadProductos === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                    </div>

                    <div className="px-7 py-6 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center mb-3 text-gray-600">
                            <FiMapPin className="mr-2 text-cyan-600" />
                            <span className="text-sm font-medium">
                              Dirección
                            </span>
                          </div>
                          <div className="text-gray-800 font-semibold text-sm leading-relaxed">
                            {pedido.direccionEnvio}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center mb-3 text-gray-600">
                            <FiTruck className="mr-2 text-cyan-600" />
                            <span className="text-sm font-medium">Envío</span>
                          </div>
                          <div className="text-gray-800 font-bold mb-1">
                            {pedido.metodoEnvio.nombre}
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-600">
                              {pedido.metodoEnvio.tiempoEstimado}
                            </span>
                            <span className="text-cyan-700 font-bold">
                              {formatCurrency(pedido.metodoEnvio.costo)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="flex items-center mb-3 text-gray-600">
                            <FiCreditCard className="mr-2 text-cyan-600" />
                            <span className="text-sm font-medium">Pago</span>
                          </div>
                          <div className="text-gray-800 font-bold">
                            {pedido.metodoPago.nombre}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            Pagado al momento del pedido
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 rounded-2xl text-white shadow-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm mb-1 text-cyan-100 font-medium">
                                Subtotal
                              </div>
                              <div className="text-sm mb-1 text-cyan-100 font-medium">
                                Envío
                              </div>
                              <div className="text-lg font-bold mb-1 mt-3">
                                Total
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm mb-1">
                                {formatCurrency(pedido.montoPedido)}
                              </div>
                              <div className="text-sm mb-1">
                                {formatCurrency(pedido.montoEnvio)}
                              </div>
                              <div className="text-2xl font-extrabold mt-3">
                                {formatCurrency(pedido.montoTotal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={() => handleVerDetalles(pedido.idPedido)}
                          className=" text-cyan-700 inline-flex items-center px-7 py-3.5 cursor-pointer transition-all transform hover:-translate-y-0.5"
                        >
                          <FiFileText className="mr-3 text-lg" />
                          Ver detalles completos
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default MisPedidos;
