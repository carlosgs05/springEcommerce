import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
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
  FiDollarSign,
  FiFile,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiMessageSquare,
} from "react-icons/fi";

interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
}

interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: Imagen[];
  especificaciones: Especificacion[];
}

interface Imagen {
  idImagen: string;
  nombre: string;
  url: string;
}

interface Especificacion {
  idEspecificacion: number;
  unidadMedida: string;
  valor: number;
  descripcion: string;
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

interface RegistroObservacion {
  estado: number;
  fecha: string;
  mensaje: string;
}

const DetallePedidoAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [showComprobante, setShowComprobante] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [cargandoPedido, setCargandoPedido] = useState<boolean>(true);
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [showApelacionModal, setShowApelacionModal] = useState(false);
  const [ultimoMensajeApelacion, setUltimoMensajeApelacion] = useState("");

  useEffect(() => {
    const fetchPedido = async () => {
      setCargandoPedido(true);
      if (id) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/pedidos/${id}`
          );
          setPedido(response.data.pedido);
          
          // Procesar el campo observacion para extraer el último mensaje de apelación
          if (response.data.pedido?.observacion) {
            try {
              const observaciones: RegistroObservacion[] = JSON.parse(response.data.pedido.observacion);
              const apelacion = (() => {
                for (let i = observaciones.length - 1; i >= 0; i--) {
                  if (observaciones[i].estado === -1) {
                    return observaciones[i];
                  }
                }
                return undefined;
              })();
              if (apelacion) {
                setUltimoMensajeApelacion(apelacion.mensaje);
              }
            } catch (error) {
              console.error("Error al parsear observaciones:", error);
            }
          }
        } catch (error) {
          console.error("Error al obtener pedido:", error);
        }
      }
      setCargandoPedido(false);
    };
    fetchPedido();
  }, [id]);

  if (cargandoPedido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Cargando pedido...
          </h2>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Pedido no encontrado
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-cyan-700 hover:text-cyan-900 font-medium py-2 px-4 rounded-lg transition flex items-center mx-auto cursor-pointer"
          >
            <FiArrowLeft className="mr-2" /> Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

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

  const cambiarEstadoPedido = async (nuevoEstado: number, mensaje: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:8080/api/pedidos/${pedido.idPedido}/estado`,
        {
          estado: nuevoEstado,
          mensaje: mensaje,
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: "¡Éxito!",
          text: `El estado del pedido ha sido actualizado a "${
            getEstadoInfo(nuevoEstado).texto
          }"`,
          icon: "success",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: "Aceptar",
        }).then(() => {
          navigate("/admin/pedidos");
        });
      } else {
        Swal.fire({
          title: "Error",
          text:
            response.data.message || "Hubo un problema al actualizar el estado",
          icon: "error",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al actualizar el estado",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Aceptar",
      });
      console.error("Error al actualizar estado del pedido:", error);
    }
  };

  const handleRechazarPedido = () => {
    if (!motivoRechazo.trim()) {
      Swal.fire({
        title: "Motivo requerido",
        text: "Por favor ingresa el motivo del rechazo",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "Entendido",
      });
      return;
    }

    cambiarEstadoPedido(-2, motivoRechazo);
    setShowRechazoModal(false);
    setMotivoRechazo("");
  };

  const getFileType = (fileName: string) => {
    if (!fileName) return "desconocido";
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return "imagen";
    } else if (extension === "pdf") {
      return "pdf";
    } else {
      return "desconocido";
    }
  };

  const fileType = pedido.comprobantePago
    ? getFileType(pedido.comprobantePago)
    : "desconocido";
  const estadoInfo = getEstadoInfo(pedido.estado);

  const renderActionButtons = () => {
    switch (pedido.estado) {
      case 0:
      case -1:
        return (
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => cambiarEstadoPedido(1, "Pedido confirmado")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-8 rounded-2xl transition duration-300 flex items-center cursor-pointer"
            >
              <FiCheckCircle className="mr-2" /> Confirmar Pedido
            </button>
            <button
              onClick={() => setShowRechazoModal(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-8 rounded-2xl transition duration-300 flex items-center cursor-pointer"
            >
              <FiXCircle className="mr-2" /> Rechazar Pedido
            </button>
          </div>
        );
      case 1:
        return (
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {pedido.metodoEnvio.costo === 0 ? (
              <button
                onClick={() =>
                  cambiarEstadoPedido(3, "Pedido listo para recoger")
                }
                className="bg-violet-500 hover:bg-violet-600 text-white font-medium py-3 px-8 rounded-2xl transition duration-300 flex items-center cursor-pointer"
              >
                <FiPackage className="mr-2" /> Listo para recoger
              </button>
            ) : (
              <button
                onClick={() => cambiarEstadoPedido(2, "Pedido en camino")}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-8 rounded-2xl transition duration-300 flex items-center cursor-pointer"
              >
                <FiTruck className="mr-2" /> Enviar el pedido al usuario
              </button>
            )}
          </div>
        );
      case 2:
        return (
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() =>
                cambiarEstadoPedido(3, "Pedido listo para recoger")
              }
              className="bg-violet-500 hover:bg-violet-600 text-white font-medium py-3 px-8 rounded-2xl transition duration-300 flex items-center cursor-pointer"
            >
              <FiPackage className="mr-2" /> Listo para recoger
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen px-6 pb-6 pt-1">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-cyan-700 hover:text-cyan-900 font-medium py-2 px-4 rounded-lg transition cursor-pointer mb-6"
        >
          <FiArrowLeft className="mr-2" /> Volver a la lista de pedidos
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-xl shadow-sm">
              <FiPackage className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Detalle del Pedido #{pedido.idPedido}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Realizado el {formatFecha(pedido.fechaPedido)}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-4 py-2 text-sm rounded-full font-semibold ${estadoInfo.color} shadow-sm`}
            >
              {estadoInfo.icon}
              <span className="ml-2">{estadoInfo.texto}</span>
            </span>
          </div>
        </div>

        {/* Card de Apelación */}
        {pedido.estado === -1 && (
          <div className="bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500 rounded-xl p-5 mb-6">
            <div className="flex items-start">
              <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-3 rounded-xl mr-4">
                <FiMessageSquare className="text-amber-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-800">
                  El usuario ha apelado esta decisión
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  El cliente ha solicitado una revisión de su pedido rechazado.
                </p>
                <button
                  onClick={() => setShowApelacionModal(true)}
                  className="mt-3 text-amber-700 hover:text-amber-900 text-sm font-medium py-2 px-4 rounded-lg transition cursor-pointer flex items-center"
                >
                  <FiFile className="mr-2" /> Ver mensaje de apelación
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiUser className="mr-2 text-cyan-600" /> Información del
                Cliente
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600">Nombre</p>
                  <p className="text-sm font-medium">
                    {pedido.usuario?.nombreCompleto || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Correo electrónico</p>
                  <p className="text-sm font-medium">
                    {pedido.usuario?.email || "No disponible"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiMapPin className="mr-2 text-cyan-600" /> Dirección de Envío
              </h2>
              <p className="text-sm font-medium">
                {pedido.direccionEnvio || "No disponible"}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiCreditCard className="mr-2 text-cyan-600" /> Método de Pago
              </h2>
              <p className="text-sm font-medium">
                {pedido.metodoPago?.nombre || "No disponible"}
              </p>
              {pedido.comprobantePago && (
                <button
                  onClick={() => setShowComprobante(true)}
                  className="mt-4 text-cyan-700 hover:text-cyan-900 text-sm font-medium py-2 px-4 rounded-lg transition cursor-pointer flex items-center"
                >
                  <FiFile className="mr-2" /> Ver comprobante de pago
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiShoppingBag className="mr-2 text-cyan-600" /> Productos (
                {pedido.detalles?.length || 0})
              </h2>
              <div className="space-y-4">
                {pedido.detalles?.map((detalle, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        {detalle.producto?.imagenes?.length > 0 ? (
                          <img
                            src={`http://localhost:8080${detalle.producto.imagenes[0].url}`}
                            alt={detalle.producto.nombre}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        )}
                        <div className="ml-4">
                          <h3 className="text-sm font-bold text-gray-800">
                            {detalle.producto?.nombre ||
                              "Producto no disponible"}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {detalle.cantidad} ×{" "}
                            {formatCurrency(detalle.precioUnitario)}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {formatCurrency(detalle.subtotal)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedProduct(
                            expandedProduct === index ? null : index
                          )
                        }
                        className="text-cyan-700 hover:text-cyan-900 p-2 rounded-full cursor-pointer"
                      >
                        {expandedProduct === index ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </button>
                    </div>

                    {expandedProduct === index && (
                      <div className="mt-4 pl-20">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Descripción:
                        </h4>
                        <p className="text-xs text-gray-600 mb-4">
                          {detalle.producto?.descripcion || "No disponible"}
                        </p>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Especificaciones:
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {detalle.producto?.especificaciones?.map(
                            (espec, i) => (
                              <li
                                key={i}
                                className="flex justify-between border-b border-gray-100 pb-2"
                              >
                                <span className="text-xs text-gray-600">
                                  {espec.descripcion}:
                                </span>
                                <span className="text-xs font-medium">
                                  {espec.valor} {espec.unidadMedida}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiDollarSign className="mr-2 text-cyan-600" /> Resumen
                Financiero
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-xs text-gray-600">Subtotal de productos</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(pedido.montoPedido)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-600">Envío</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(pedido.montoEnvio)}
                  </p>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <p className="text-sm font-bold">Total</p>
                  <p className="text-sm font-bold text-cyan-700">
                    {formatCurrency(pedido.montoTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FiTruck className="mr-2 text-cyan-600" /> Método de Envío
              </h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    {pedido.metodoEnvio?.nombre || "No disponible"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Tiempo estimado:{" "}
                    {pedido.metodoEnvio?.tiempoEstimado || "No disponible"}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatCurrency(pedido.metodoEnvio?.costo || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {renderActionButtons()}
      </div>

      {/* Modal de Apelación */}
      {showApelacionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 cursor-pointer">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-3 rounded-xl mr-4">
                  <FiMessageSquare className="text-amber-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Mensaje de Apelación
                </h3>
              </div>

              <div className="mb-6">
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-amber-800 whitespace-pre-wrap">
                    {ultimoMensajeApelacion || "No se encontró mensaje de apelación"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowApelacionModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazo */}
      {showRechazoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 cursor-pointer">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-rose-100 to-rose-50 p-3 rounded-xl mr-4">
                  <FiAlertTriangle className="text-rose-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Rechazar Pedido
                </h3>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="motivo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Motivo del rechazo
                </label>
                <textarea
                  id="motivo"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Ingresa el motivo por el cual estás rechazando este pedido..."
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRechazoModal(false);
                    setMotivoRechazo("");
                  }}
                  className="px-6 py-2.5 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazarPedido}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-xl hover:from-rose-600 hover:to-rose-700 transition cursor-pointer"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comprobante */}
      {showComprobante && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 cursor-pointer">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Comprobante de Pago
                </h3>
                <button
                  onClick={() => setShowComprobante(false)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <FiXCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="flex justify-center items-center min-h-[300px]">
                {fileType === "imagen" ? (
                  <img
                    src={`http://localhost:8080/uploads/${pedido.comprobantePago}`}
                    alt="Comprobante de pago"
                    className="max-w-full max-h-[70vh]"
                  />
                ) : fileType === "pdf" ? (
                  <iframe
                    src={`http://localhost:8080/uploads/${pedido.comprobantePago}`}
                    title="Comprobante de pago"
                    className="w-full min-h-[500px]"
                  />
                ) : (
                  <div className="text-center p-10">
                    <FiFile className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-4 text-sm font-medium text-gray-900">
                      Comprobante no disponible
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      El tipo de archivo no es compatible.
                    </p>
                    <a
                      href={`http://localhost:8080/uploads/${pedido.comprobantePago}`}
                      download
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 cursor-pointer"
                    >
                      Descargar comprobante
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <a
                  href={`http://localhost:8080/uploads/${pedido.comprobantePago}`}
                  download
                  className="text-cyan-700 hover:text-cyan-900 text-sm font-medium py-2 px-4 rounded-lg transition cursor-pointer flex items-center"
                >
                  <FiFile className="mr-2" /> Descargar comprobante
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePedidoAdmin;