import { useParams, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiCheckCircle,
  FiPackage,
  FiInbox,
  FiCreditCard,
  FiXCircle,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

interface Producto {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: { idImagen: string; nombre: string; url: string }[];
  especificaciones: {
    idEspecificacion: number;
    unidadMedida: string;
    valor: number;
    descripcion: string;
  }[];
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

interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
}

interface Observacion {
  estado: number;
  fecha: string;
  mensaje: string;
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
  pedido: Pedido;
}

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: "1px solid #E5E7EB",
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0891B2",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0891B2",
    marginBottom: 10,
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  rowItem: {
    fontSize: 9,
    color: "#374151",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    padding: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottom: "1px solid #E5E7EB",
  },
  col1: {
    width: "10%",
    fontSize: 9,
  },
  col2: {
    width: "50%",
    fontSize: 9,
  },
  col3: {
    width: "15%",
    fontSize: 9,
    textAlign: "right",
  },
  col4: {
    width: "15%",
    fontSize: 9,
    textAlign: "right",
  },
  col5: {
    width: "10%",
    fontSize: 9,
    textAlign: "right",
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1px solid #E5E7EB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0891B2",
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: "1px solid #E5E7EB",
    fontSize: 7,
    color: "#6B7280",
    textAlign: "center",
  },
  paymentSection: {
    marginTop: 25, // Mayor separación antes del método de pago
    marginBottom: 20,
  },
});

// Componente para el PDF de la boleta
const BoletaPDF = ({ pedido }: { pedido: Pedido }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TechShop "The Inseparable Ones"</Text>
          <Text style={styles.subtitle}>RUC: 20605467891</Text>
          <Text style={styles.subtitle}>Av. Tecnológica 123, Trujillo</Text>
        </View>
        <View>
          <Text style={styles.subtitle}>BOLETA ELECTRÓNICA</Text>
          <Text style={styles.subtitle}>
            N° {pedido.idPedido.toString().padStart(8, "0")}
          </Text>
          <Text style={styles.subtitle}>
            Fecha: {formatFechaSolo(pedido.fechaPedido)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
        <View style={styles.row}>
          <Text style={styles.rowItem}>Nombre:</Text>
          <Text style={styles.rowItem}>{pedido.usuario.nombreCompleto}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowItem}>Correo:</Text>
          <Text style={styles.rowItem}>{pedido.usuario.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETALLE DE COMPRA</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Cant.</Text>
          <Text style={styles.col2}>Descripción</Text>
          <Text style={styles.col3}>P. Unit.</Text>
          <Text style={styles.col4}>Subtotal</Text>
        </View>

        {pedido.detalles.map((detalle, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.col1}>{detalle.cantidad}</Text>
            <Text style={styles.col2}>{detalle.producto.nombre}</Text>
            <Text style={styles.col3}>
              {formatCurrency(detalle.precioUnitario)}
            </Text>
            <Text style={styles.col4}>{formatCurrency(detalle.subtotal)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.rowItem}>
            {formatCurrency(pedido.montoPedido)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Envío:</Text>
          <Text style={styles.rowItem}>
            {formatCurrency(pedido.montoEnvio)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(pedido.montoTotal)}
          </Text>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>MÉTODO DE PAGO</Text>
        <Text style={styles.rowItem}>{pedido.metodoPago.nombre}</Text>
      </View>

      {pedido.metodoEnvio.costo > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DE ENVÍO</Text>
          <Text style={styles.rowItem}>{pedido.metodoEnvio.nombre}</Text>
          <Text style={styles.rowItem}>Dirección: {pedido.direccionEnvio}</Text>
          <Text style={styles.rowItem}>
            Tiempo estimado: {pedido.metodoEnvio.tiempoEstimado}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text>¡Gracias por su compra!</Text>
        <Text>
          Para reclamos o devoluciones contactarse a: atencion@tiendatech.com
        </Text>
        <Text>
          Esta boleta electrónica es generada automáticamente y no requiere
          firma.
        </Text>
      </View>
    </Page>
  </Document>
);

const getEstadoInfo = (estado: number) => {
  switch (estado) {
    case -2:
      return {
        texto: "Rechazado",
        icon: <FiXCircle className="text-rose-600 text-sm" />,
        color: "bg-rose-100 text-rose-800",
        border: "border-l-4 border-rose-600",
        bg: "bg-gradient-to-r from-rose-50 to-white",
      };
    case -1:
      return {
        texto: "Apelado",
        icon: <FiAlertCircle className="text-amber-600 text-sm" />,
        color: "bg-amber-100 text-amber-800",
        border: "border-l-4 border-amber-600",
        bg: "bg-gradient-to-r from-amber-50 to-white",
      };
    case 0:
      return {
        texto: "Pendiente de verificación",
        icon: <FiPackage className="text-blue-500 text-sm" />,
        color: "bg-blue-100 text-blue-800",
        border: "border-l-4 border-blue-500",
        bg: "bg-gradient-to-r from-blue-50 to-white",
      };
    case 1:
      return {
        texto: "Confirmado",
        icon: <FiCheckCircle className="text-emerald-500 text-sm" />,
        color: "bg-emerald-100 text-emerald-800",
        border: "border-l-4 border-emerald-500",
        bg: "bg-gradient-to-r from-emerald-50 to-white",
      };
    case 2:
      return {
        texto: "En camino",
        icon: <FiCheckCircle className="text-cyan-500 text-sm" />,
        color: "bg-cyan-100 text-cyan-800",
        border: "border-l-4 border-cyan-500",
        bg: "bg-gradient-to-r from-cyan-50 to-white",
      };
    case 3:
      return {
        texto: "Listo para recojo",
        icon: <FiInbox className="text-violet-500 text-sm" />,
        color: "bg-violet-100 text-violet-800",
        border: "border-l-4 border-violet-500",
        bg: "bg-gradient-to-r from-violet-50 to-white",
      };
    case 4:
      return {
        texto: "Entregado",
        icon: <FiCheckCircle className="text-indigo-500 text-sm" />,
        color: "bg-indigo-100 text-indigo-800",
        border: "border-l-4 border-indigo-500",
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
  const day = fecha.getDate().toString().padStart(2, "0");
  const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const hours = fecha.getHours().toString().padStart(2, "0");
  const minutes = fecha.getMinutes().toString().padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
};

const formatFechaSolo = (fechaString: string) => {
  const fecha = new Date(fechaString);
  const day = fecha.getDate().toString().padStart(2, "0");
  const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const year = fecha.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
};

const DetallePedido = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [estadoActual, setEstadoActual] = useState<number>(0);
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [showApelarModal, setShowApelarModal] = useState(false);
  const [apelacionMensaje, setApelacionMensaje] = useState("");
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("Confirmando pedido...");
  const [showBoletaModal, setShowBoletaModal] = useState(false);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `http://localhost:8080/api/pedidos/${id}`
        );
        if (response.data.success) {
          setPedido(response.data.pedido);
          const obs: Observacion[] = JSON.parse(
            response.data.pedido.observacion
          );
          setObservaciones(obs);
          if (obs.length > 0) {
            setEstadoActual(obs[obs.length - 1].estado);
          }
        }
      } catch (error) {
        navigate("/mis-pedidos");
      }
    };

    fetchPedido();
  }, [id, navigate]);

  if (!pedido) return <div className="min-h-screen bg-gray-50"></div>;

  const estadoInfo = getEstadoInfo(pedido.estado);
  const tieneEnvio = pedido.metodoEnvio.costo > 0;
  const estadosMostrar = tieneEnvio ? [0, 1, 2, 3, 4] : [0, 1, 3, 4];

  const handleConfirmarRecibido = async () => {
    try {
      setProgressVisible(true);
      setProgress(1);
      setProgressMsg("Actualizando estado del pedido...");

      const response = await axios.patch(
        `http://localhost:8080/api/pedidos/${pedido.idPedido}/estado`,
        {
          estado: 4,
          mensaje: "Pedido recibido",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percent < 95 ? percent : 95);
            }
          },
        }
      );

      // Simular progreso final
      let current = progress;
      const animateProgress = () => {
        if (current < 100) {
          current += 2;
          setProgress(current);
          setTimeout(animateProgress, 20);
        } else {
          setProgressVisible(false);

          if (response.status === 200) {
            Swal.fire({
              title: "¡Pedido confirmado!",
              text: "El pedido ha sido marcado como recibido.",
              icon: "success",
              confirmButtonColor: "#0891b2",
              confirmButtonText: "Aceptar",
            }).then(() => {
              window.location.reload();
            });
          }
        }
      };
      animateProgress();
    } catch (error) {
      setProgressVisible(false);
      Swal.fire({
        title: "Error",
        text: "No se pudo confirmar la recepción del pedido.",
        icon: "error",
        confirmButtonColor: "#0891b2",
      });
    }
  };

  const handleApelar = async () => {
    if (apelacionMensaje.trim().length < 20) {
      Swal.fire({
        title: "Mensaje muy corto",
        text: "Por favor, explica detalladamente tu apelación (al menos 20 caracteres).",
        icon: "warning",
        confirmButtonColor: "#0891b2",
      });
      return;
    }

    setProgressVisible(true);
    setProgress(1);
    setProgressMsg("Enviando apelación...");

    try {
      const response = await axios.patch(
        `http://localhost:8080/api/pedidos/${pedido.idPedido}/estado`,
        {
          estado: -1,
          mensaje: apelacionMensaje,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percent < 95 ? percent : 95);
            }
          },
        }
      );

      // Simular progreso final
      let current = progress;
      const animateProgress = () => {
        if (current < 100) {
          current += 2;
          setProgress(current);
          setTimeout(animateProgress, 20);
        } else {
          setProgressVisible(false);
          setApelacionMensaje(""); // Limpiar mensaje

          if (response.status === 200) {
            Swal.fire({
              title: "Apelación enviada",
              text: "Tu apelación ha sido enviada para revisión.",
              icon: "success",
              confirmButtonColor: "#0891b2",
            }).then(() => {
              navigate("/mis-pedidos"); // Navegar a la lista de pedidos
            });
          }
        }
      };
      animateProgress();
    } catch (error) {
      setProgressVisible(false);
      Swal.fire({
        title: "Error",
        text: "No se pudo enviar la apelación. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonColor: "#0891b2",
      });
    }
  };

  // Obtener mensaje de rechazo
  const mensajeRechazo =
    observaciones.find((obs) => obs.estado === -2)?.mensaje ||
    "No se encontraron detalles específicos del rechazo";

  return (
    <>
      {/* Modal de progreso */}
      {progressVisible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1050]">
          <div className="w-[410px] sm:w-[500px] bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center border-4 border-cyan-100">
            <div className="text-sm font-semibold mb-3 text-cyan-700">
              {progressMsg}
            </div>
            <div className="w-full bg-cyan-100 h-5 rounded-xl overflow-hidden shadow-inner flex items-center">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-5 rounded-xl transition-all duration-150"
                style={{
                  width: `${progress}%`,
                  minWidth: "1.5rem",
                }}
              />
              <span className="absolute right-7 text-cyan-900 font-bold text-xs">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de boleta */}
      {showBoletaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1050] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                Boleta Electrónica - Pedido #{pedido.idPedido}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBoletaModal(false)}
                  className="text-white hover:text-gray-200 cursor-pointer"
                >
                  <FiXCircle className="text-lg" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
                <BoletaPDF pedido={pedido} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}

      <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center mb-5">
            <button
              onClick={() => navigate("/mis-pedidos")}
              className="flex items-center text-cyan-700 hover:text-cyan-800 font-medium transition text-sm cursor-pointer group"
            >
              <FiChevronLeft className="mr-2 text-lg group-hover:-translate-x-1 transition-transform" />
              Volver a mis pedidos
            </button>
          </div>

          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 rounded-2xl shadow-lg mr-3">
              <FiPackage className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                Detalle del Pedido #{pedido.idPedido}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Realizado el {formatFechaSolo(pedido.fechaPedido)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
            <div className="px-6 py-5 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
              <h2 className="text-lg font-semibold text-cyan-700">
                Seguimiento del Pedido
              </h2>
            </div>
            <div className="px-6 pb-6">
              <div className="relative flex justify-between items-start pt-8">
                {/* Línea base */}
                <div className="absolute top-[50px] left-0 right-0 h-1 bg-gray-200 z-0"></div>
                {/* Línea activa */}
                <div
                  className="absolute top-[50px] left-0 h-1 bg-cyan-600 z-10 transition-all duration-500"
                  style={{
                    width: `${
                      ((estadosMostrar.indexOf(estadoActual) + 1) /
                        estadosMostrar.length) *
                      100
                    }%`,
                  }}
                ></div>
                {estadosMostrar.map((estadoId, index) => {
                  const isActive =
                    estadoId <= estadoActual ||
                    (estadoActual === -2 && estadoId === 0) ||
                    (estadoActual === -1 && estadoId === 0);

                  const isCurrent = estadoId === estadoActual;
                  const estadoItem = getEstadoInfo(estadoId);
                  const observacion = observaciones.find(
                    (obs) => obs.estado === estadoId
                  );

                  const textoMostrar =
                    estadoActual === -2 && estadoId === 0
                      ? "Rechazado"
                      : estadoItem.texto;

                  return (
                    <div
                      key={estadoId}
                      className="relative flex flex-col items-center text-center w-full"
                    >
                      {/* Círculo */}
                      <div className="relative w-full flex justify-center z-11">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{
                            backgroundColor:
                              estadoActual === -2 && estadoId === 0
                                ? "#e11d48"
                                : estadoActual === -1 && estadoId === 0
                                ? "#d97706"
                                : isActive
                                ? "#0891b2"
                                : "#e5e7eb",
                            color: isActive ? "#ffffff" : "#6b7280",
                          }}
                        >
                          {index + 1}
                        </div>
                      </div>

                      {/* Texto y fecha */}
                      <div className="mt-2 flex flex-col items-center">
                        <p
                          className={`text-xs font-medium ${
                            isActive ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {textoMostrar}
                        </p>
                        {observacion && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatFecha(observacion.fecha)}
                          </p>
                        )}
                        {isCurrent && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                            Actual
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Detalles del pedido */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
                  <h2 className="text-lg font-semibold text-cyan-700">
                    Detalles del Pedido
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-5">
                    {/* Productos */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Productos ({pedido.detalles.length})
                      </h3>
                      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-2">
                        {pedido.detalles.map((detalle, index) => (
                          <div key={index} className="py-3 flex">
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              {detalle.producto.imagenes.length > 0 && (
                                <img
                                  src={`http://localhost:8080${detalle.producto.imagenes[0].url}`}
                                  alt={detalle.producto.nombre}
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <h4 className="text-base font-medium text-gray-800">
                                {detalle.producto.nombre}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {detalle.producto.descripcion}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Cantidad: {detalle.cantidad}
                                </span>
                                <span className="font-medium text-cyan-700 text-sm">
                                  {formatCurrency(detalle.subtotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen del pedido */}
              <div className="mt-6 bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
                  <h2 className="text-lg font-semibold text-cyan-700">
                    Resumen del Pedido
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Subtotal</span>
                      <span className="font-medium text-sm">
                        {formatCurrency(pedido.montoPedido)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Envío</span>
                      <span className="font-medium text-sm">
                        {pedido.montoEnvio > 0
                          ? formatCurrency(pedido.montoEnvio)
                          : "Gratis"}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-2">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-lg font-bold text-cyan-700">
                          {formatCurrency(pedido.montoTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {pedido.estado >= 1 && (
                    <button
                      onClick={() => setShowBoletaModal(true)}
                      className="w-full mt-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center text-base"
                    >
                      <FiFileText className="mr-2" />
                      Ver boleta
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div>
              {/* Información de envío */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
                  <h2 className="text-lg font-semibold text-cyan-700">
                    Información de Envío
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">
                        Método de envío
                      </h4>
                      <p className="text-gray-800 font-medium text-sm">
                        {pedido.metodoEnvio.nombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {pedido.metodoEnvio.tiempoEstimado}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">
                        Dirección de envío
                      </h4>
                      <p className="text-gray-800 font-medium text-sm">
                        {pedido.direccionEnvio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="mt-6 bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
                  <h2 className="text-lg font-semibold text-cyan-700">
                    Método de Pago
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="bg-cyan-100 rounded-lg p-2 mr-3">
                      <FiCreditCard className="text-cyan-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium text-sm">
                        {pedido.metodoPago.nombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Comprobante: {pedido.comprobantePago}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado actual */}
              <div className="mt-6 bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
                  <h2 className="text-lg font-semibold text-cyan-700">
                    Estado Actual
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${estadoInfo.color} mr-3`}
                    >
                      {estadoInfo.icon}
                    </div>
                    <div>
                      <p className="text-base font-medium">
                        {estadoInfo.texto}
                      </p>
                      {observaciones.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Última actualización:{" "}
                          {formatFecha(
                            observaciones[observaciones.length - 1].fecha
                          )}
                        </p>
                      )}

                      {/* Botón para estado rechazado */}
                      {pedido.estado === -2 && (
                        <button
                          onClick={() => setShowRechazoModal(true)}
                          className="mt-2 text-cyan-700 inline-flex items-center px-5 py-2 text-sm cursor-pointer transition-all transform hover:-translate-y-0.5"
                        >
                          Ver detalles del rechazo
                        </button>
                      )}

                      {/* Botón para estado listo para recojo */}
                      {pedido.estado === 3 && (
                        <button
                          onClick={handleConfirmarRecibido}
                          className="mt-3 text-cyan-700 inline-flex items-center text-sm cursor-pointer transition-all transform hover:-translate-y-0.5"
                        >
                          Confirmar pedido recibido
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de detalles de rechazo */}
      {showRechazoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md">
            <div className="px-7 py-6 bg-gradient-to-r from-rose-50 to-rose-100 border-b border-rose-200 rounded-t-3xl">
              <h2 className="text-xl font-semibold text-rose-700">
                Detalles del Rechazo
              </h2>
            </div>
            <div className="p-7">
              <p className="text-gray-700 mb-5">{mensajeRechazo}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRechazoModal(false)}
                  className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowRechazoModal(false);
                    setShowApelarModal(true);
                  }}
                  className="cursor-pointer px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-amber-600 hover:to-orange-600"
                >
                  Apelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de apelación */}
      {showApelarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md">
            <div className="px-7 py-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 rounded-t-3xl">
              <h2 className="text-xl font-semibold text-amber-700">
                Apelar Rechazo
              </h2>
            </div>
            <div className="p-7">
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-lg mb-4"
                placeholder="Explica por qué estás apelando el rechazo..."
                value={apelacionMensaje}
                onChange={(e) => setApelacionMensaje(e.target.value)}
                minLength={20}
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApelarModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApelar}
                  disabled={apelacionMensaje.trim().length < 20}
                  className={`px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-amber-600 hover:to-orange-600 cursor-pointer ${
                    apelacionMensaje.trim().length < 20
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Enviar Apelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetallePedido;
