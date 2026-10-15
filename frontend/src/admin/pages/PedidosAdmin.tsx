import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiShoppingBag,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiMail,
  FiLoader,
  FiDollarSign,
} from "react-icons/fi";

// Definición de interfaces
interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
}

interface Producto {
  idProducto: number;
  nombre: string;
}

interface DetallePedido {
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
  pedidos: Pedido[];
  message?: string;
}

// Opciones para el selector de estados
const estadoOptions = [
  { value: -2, label: "Rechazado" },
  { value: -1, label: "Apelado" },
  { value: 0, label: "Pendiente de verificación" },
  { value: 1, label: "Confirmado" },
  { value: 2, label: "En camino" },
  { value: 3, label: "Listo para recojo" },
  { value: 4, label: "Recibido" },
];

// Estilo personalizado para react-select (Samsung One UI)
const customStyles = {
  control: (provided: any) => ({
    ...provided,
    borderRadius: "12px",
    borderColor: "#d1d5db",
    padding: "4px 8px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    minHeight: "50px",
    fontSize: "16px",
    fontWeight: 500,
    "&:hover": {
      borderColor: "#60a5fa",
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#3b82f6" : "white",
    color: state.isSelected ? "white" : "#1f2937",
    padding: "12px 16px",
    fontSize: "16px",
    "&:hover": {
      backgroundColor: state.isSelected ? "#3b82f6" : "#f3f4f6",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: 20,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#1f2937",
    fontWeight: 500,
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9ca3af",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#6b7280",
    "&:hover": {
      color: "#4b5563",
    },
  }),
};

const PedidosAdmin = () => {
  const [selectedEstado, setSelectedEstado] = useState(0);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOrders, setHasOrders] = useState(true);
  const navigate = useNavigate();

  // Función para cargar pedidos según el estado
  const cargarPedidos = async (estado: number) => {
    try {
      setLoading(true);
      setError(null);
      setHasOrders(true);

      const response = await axios.get<ApiResponse>(
        `http://localhost:8080/api/pedidos/por-estado?estado=${estado}`
      );

      if (response.data.success) {
        if (response.data.pedidos.length > 0) {
          setPedidos(response.data.pedidos);
          setHasOrders(true);
        } else {
          setPedidos([]);
          setHasOrders(false);
        }
      } else {
        setError(response.data.message || "Error al cargar pedidos");
        setHasOrders(false);
      }
    } catch (err) {
      setError("Error al cargar pedidos");
      setHasOrders(false);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos cuando cambia el estado seleccionado
  useEffect(() => {
    cargarPedidos(selectedEstado);
  }, [selectedEstado]);

  // Función para obtener información del estado
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
          icon: <FiClock className="text-amber-600" />,
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
          icon: <FiPackage className="text-violet-600" />,
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

  // Formatear fecha
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

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  // Calcular clientes únicos
  const uniqueClientes = new Set(pedidos.map((p) => p.usuario.idUsuario)).size;

  // Redirigir a detalle de pedido pasando solo el idPedido
  const verDetallePedido = (idPedido: number) => {
    navigate(`/admin/pedidos/${idPedido}`);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-xl shadow-sm">
              <FiPackage className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Administración de Pedidos
              </h1>
            </div>
          </div>

          <div className="w-full md:w-80">
            <Select
              options={estadoOptions}
              value={estadoOptions.find((opt) => opt.value === selectedEstado)}
              onChange={(selectedOption) =>
                selectedOption && setSelectedEstado(selectedOption.value)
              }
              styles={customStyles}
              placeholder="Seleccionar estado..."
              isSearchable={false}
              menuPlacement="auto"
            />
          </div>
        </div>

        {/* Estadísticas rápidas - Solo se muestran si hay pedidos */}
        {hasOrders && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-md p-4 border border-cyan-100">
              <div className="text-gray-500 text-sm font-medium mb-1">
                Total Pedidos
              </div>
              <div className="text-2xl font-bold text-cyan-700">
                {pedidos.length}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4 border border-emerald-100">
              <div className="text-gray-500 text-sm font-medium mb-1">
                Estado Actual
              </div>
              <div className="text-lg font-bold text-emerald-600">
                {estadoOptions.find((opt) => opt.value === selectedEstado)
                  ?.label || "Desconocido"}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4 border border-blue-100">
              <div className="text-gray-500 text-sm font-medium mb-1">
                Clientes Únicos
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {uniqueClientes}
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-xl border border-cyan-100">
            <div className="relative">
              <FiLoader className="animate-spin text-4xl text-cyan-600 mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mt-4">
              Cargando pedidos
            </h3>
            <p className="text-gray-500 mt-1">
              Estamos obteniendo la información de los pedidos...
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
                  ¡Vaya! Ha ocurrido un problema
                </h3>
                <p className="mt-2 text-gray-700">{error}</p>
              </div>
            </div>
          </div>
        ) : !hasOrders ? (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-3xl shadow-xl p-10 text-center border border-cyan-200">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-6 text-white shadow-lg">
              <FiPackage className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No hay pedidos en este estado
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Actualmente no existen pedidos con el estado seleccionado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pedidos.map((pedido) => {
              const estadoInfo = getEstadoInfo(pedido.estado);
              const productosNombres = pedido.detalles
                .map((d) => `${d.cantidad}x ${d.producto.nombre}`)
                .join(", ");

              return (
                <div
                  key={pedido.idPedido}
                  className={`bg-white rounded-3xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${estadoInfo.border} ${estadoInfo.bg}`}
                >
                  {/* Cabecera con información esencial */}
                  <div className="px-5 sm:px-7 py-5 flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm rounded-full font-semibold ${estadoInfo.color} mr-4 shadow-sm`}
                        >
                          {estadoInfo.icon}
                          <span className="ml-2">{estadoInfo.texto}</span>
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
                          {formatFecha(pedido.fechaPedido)}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Pedido #
                        <span className="text-cyan-700">{pedido.idPedido}</span>
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-xl font-bold text-cyan-700">
                          {formatCurrency(pedido.montoTotal)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información principal en 2 columnas */}
                  <div className="px-5 sm:px-7 pb-5 border-t border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Columna 1: Información del cliente */}
                      <div>
                        <div className="flex items-center mb-3 text-gray-600">
                          <FiUser className="mr-2 text-cyan-600" />
                          <span className="text-sm font-medium">Cliente</span>
                        </div>
                        <div className="flex items-center mb-4">
                          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {pedido.usuario.nombreCompleto.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-gray-800 font-semibold">
                              {pedido.usuario.nombreCompleto}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center">
                              <FiMail className="mr-1" />
                              {pedido.usuario.email}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center mb-2 text-gray-600">
                            <FiMapPin className="mr-2 text-cyan-600" />
                            <span className="text-sm font-medium">
                              Dirección
                            </span>
                          </div>
                          <div className="text-sm text-gray-800">
                            {pedido.direccionEnvio}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center mb-2 text-gray-600">
                            <FiShoppingBag className="mr-2 text-cyan-600" />
                            <span className="text-sm font-medium">
                              Productos
                            </span>
                          </div>
                          <div className="text-sm text-gray-800">
                            {productosNombres}
                          </div>
                        </div>
                      </div>

                      {/* Columna 2: Detalles de envío y pago */}
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <div className="flex items-center mb-2 text-gray-600">
                              <FiTruck className="mr-2 text-cyan-600" />
                              <span className="text-sm font-medium">Envío</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="font-medium text-gray-800 mb-1">
                                {pedido.metodoEnvio.nombre}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">
                                  {pedido.metodoEnvio.tiempoEstimado}
                                </span>
                                <span className="font-bold text-cyan-700">
                                  {formatCurrency(pedido.metodoEnvio.costo)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center mb-2 text-gray-600">
                              <FiCreditCard className="mr-2 text-cyan-600" />
                              <span className="text-sm font-medium">Pago</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="font-medium text-gray-800 mb-1">
                                {pedido.metodoPago.nombre}
                              </div>
                              <div className="text-xs text-gray-600">
                                Pagado al momento del pedido
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detalles financieros */}
                        <div className="mt-5">
                          <div className="flex items-center mb-2 text-gray-600">
                            <FiDollarSign className="mr-2 text-cyan-600" />
                            <span className="text-sm font-medium">
                              Detalles financieros
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                Subtotal:
                              </span>
                              <span className="text-sm font-medium">
                                {formatCurrency(pedido.montoPedido)}
                              </span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                Envío:
                              </span>
                              <span className="text-sm font-medium">
                                {formatCurrency(pedido.montoEnvio)}
                              </span>
                            </div>
                            <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                              <span className="font-medium text-gray-800">
                                Total:
                              </span>
                              <span className="font-bold text-cyan-700">
                                {formatCurrency(pedido.montoTotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón para ver detalles */}
                    <div className="mt-6">
                      <div className="flex justify-center">
                        <button
                          onClick={() => verDetallePedido(pedido.idPedido)}
                          className="text-cyan-700 hover:text-cyan-900 font-medium py-2.5 px-5 rounded-xl transition cursor-pointer flex items-center hover:bg-cyan-50"
                        >
                          Ver detalles completos
                          <svg
                            className="ml-2 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosAdmin;
