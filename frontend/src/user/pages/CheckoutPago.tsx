import React, { useEffect, useState, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineFilePdf, AiOutlineCreditCard } from "react-icons/ai";
import { HiOutlineTrash, HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import Select, { components } from "react-select";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import { api, assetUrl } from "@/lib/api";

/** Llaves públicas de las pasarelas (null = esa pasarela aún no está configurada). */
interface LlavesPasarelas {
  culqiPublicKey: string | null;
  mercadopagoPublicKey: string | null;
}

const parseConfigAdicional = (configAdicional: string) => {
  try {
    return JSON.parse(configAdicional);
  } catch {
    return {};
  }
};

const isImage = (file: File | null) =>
  file ? file.type.startsWith("image/") : false;
const isPdf = (file: File | null) =>
  file ? file.type === "application/pdf" : false;

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#06b6d4" : "#e5e7eb",
    minHeight: 52,
    boxShadow: "none",
    paddingLeft: 8,
    background: "#f0f9ff",
    ":hover": { borderColor: "#22d3ee" },
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: 16,
    padding: 0,
    maxHeight: 400,
    zIndex: 50,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "#e0f2fe"
      : state.isSelected
      ? "#bae6fd"
      : "#fff",
    color: "#0891b2",
    padding: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 500,
    borderBottom: "1px solid #f1f5f9",
    fontSize: "1rem",
  }),
  singleValue: (base: any) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 500,
    color: "#0e7490",
    fontSize: "1rem",
  }),
  indicatorSeparator: () => ({ display: "none" }),
};

const Option = (props: any) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      {data.iconoImg && (
        <img
          src={assetUrl(`uploads/${encodeURIComponent(data.iconoImg)}`)}
          alt={data.nombre}
          className="w-8 h-8 object-contain rounded mr-2"
        />
      )}
      <div>
        <div className="font-semibold text-gray-700">{data.nombre}</div>
        <div className="text-xs text-gray-500">{data.descripcion}</div>
      </div>
    </components.Option>
  );
};

const SingleValue = (props: any) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      {data.iconoImg && (
        <img
          src={assetUrl(`uploads/${encodeURIComponent(data.iconoImg)}`)}
          alt={data.nombre}
          className="w-7 h-7 object-contain rounded mr-2"
        />
      )}
      <div>
        <span className="font-medium text-gray-700">{data.nombre}</span>
      </div>
    </components.SingleValue>
  );
};

const CheckoutPago: React.FC = () => {
  const { user } = useAuth();
  const { state } = useLocation() as any;
  const navigate = useNavigate();
  const [metodosPago, setMetodosPago] = useState<any[]>([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] =
    useState<any>(null);
  const [config, setConfig] = useState<any>({});
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("Procesando pedido...");

  // Llaves públicas de pasarela (null mientras carga o si falla - nunca tumba la pantalla)
  const [llavesPasarelas, setLlavesPasarelas] = useState<LlavesPasarelas | null>(null);
  const [cargandoLlaves, setCargandoLlaves] = useState(true);

  useEffect(() => {
    if (!state?.productos) {
      navigate("/carrito");
      return;
    }
    api
      .get("/api/metodopago/listar-activos")
      .then((res) => setMetodosPago(res.data.data || []))
      .catch(() => setMetodosPago([]));

    api
      .get("/api/config/pasarelas")
      .then((res) => {
        if (res.data?.success) setLlavesPasarelas(res.data.data);
        else setLlavesPasarelas({ culqiPublicKey: null, mercadopagoPublicKey: null });
      })
      .catch(() => {
        // Si la petición falla o tarda, se asume que ninguna pasarela está
        // disponible todavía: nunca tumba la pantalla, solo muestra el aviso.
        setLlavesPasarelas({ culqiPublicKey: null, mercadopagoPublicKey: null });
      })
      .finally(() => setCargandoLlaves(false));
  }, [state, navigate]);

  useEffect(() => {
    if (metodoPagoSeleccionado) {
      setConfig(parseConfigAdicional(metodoPagoSeleccionado.configAdicional));
    } else {
      setConfig({});
    }
    setComprobante(null);
  }, [metodoPagoSeleccionado]);

  const subtotal = state?.subtotal ?? 0;
  const costoEnvio = state?.costoEnvio ?? 0;
  const total = state?.total ?? 0;
  const productos = state?.productos ?? [];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!isImage(file) && !isPdf(file)) {
      alert("Solo se aceptan imágenes (JPG, PNG) o archivos PDF.");
      return;
    }
    setComprobante(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    if (!isImage(file) && !isPdf(file)) {
      alert("Solo se aceptan imágenes (JPG, PNG) o archivos PDF.");
      return;
    }
    setComprobante(file);
  };

  const eliminarComprobante = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setComprobante(null);
    const input = document.getElementById(
      "comprobante-input"
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  const generarPedidoJSON = () => {
    const metodoEnvioStorage = localStorage.getItem("metodo-envio");
    const metodoEnvio = metodoEnvioStorage
      ? JSON.parse(metodoEnvioStorage)
      : null;

    const direccionStorage = localStorage.getItem("direccion-envio") || "";

    const puntoRecojoStorage = localStorage.getItem("punto-recojo");
    const puntoRecojo = puntoRecojoStorage
      ? JSON.parse(puntoRecojoStorage)
      : null;

    let direccionFinal = direccionStorage;
    if (puntoRecojo && puntoRecojo.direccion) {
      direccionFinal = puntoRecojo.direccion;
    }

    const fechaPedido = new Date().toISOString();

    return {
      idUsuario: user?.iduser || 0,
      fechaPedido: fechaPedido,
      idMetodoEnvio: metodoEnvio?.idMetodoEnvio || 0,
      idMetodoPago: metodoPagoSeleccionado?.idMetodoPago || 0,
      estado: 0,
      montoPedido: subtotal,
      montoEnvio: costoEnvio,
      montoTotal: total,
      direccionEnvio: direccionFinal,
      observacion: JSON.stringify([
        {
          estado: 0,
          fecha: fechaPedido,
          mensaje: "Pedido registrado pendiente de verificacion",
        },
      ]),
      productos: productos.map((prod: any) => ({
        idproducto: prod.idproducto,
        cantidad: prod.cantidad,
        precio: prod.precio,
      })),
    };
  };

  const esMetodoPasarela = metodoPagoSeleccionado?.tipo === "PASARELA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!metodoPagoSeleccionado || esMetodoPasarela || !comprobante) {
      return;
    }

    const pedidoJSON = generarPedidoJSON();

    setProgressVisible(true);
    setProgress(1);
    setProgressMsg("Enviando comprobante...");

    const formData = new FormData();
    formData.append("pedido", JSON.stringify(pedidoJSON));
    formData.append("comprobante", comprobante);

    try {
      await api.post(
        "/api/pedidos/registrar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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

          // Limpiar carrito y método de pago del localStorage
          localStorage.removeItem("carrito");
          localStorage.removeItem("metodo-envio");
          localStorage.removeItem("punto-recojo");
          localStorage.removeItem("direccion-envio");

          Swal.fire({
            title: "¡Pedido registrado!",
            text: "Tu pedido ha sido registrado exitosamente",
            icon: "success",
            confirmButtonText: "Ver mis pedidos",
            customClass: {
              container: "font-sans rounded-2xl",
              popup: "rounded-2xl",
              confirmButton:
                "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all",
            },
          }).then(() => {
            navigate("/mis-pedidos");
          });
        }
      };
      animateProgress();
    } catch (error: any) {
      setProgressVisible(false);
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "Ocurrió un error al registrar el pedido",
        icon: "error",
        confirmButtonText: "Entendido",
        customClass: {
          container: "font-sans rounded-2xl",
          popup: "rounded-2xl",
          confirmButton:
            "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all",
        },
      });
    }
  };

  return (
    <>
      {/* Modal de progreso */}
      {progressVisible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1050]">
          <div className="w-[410px] sm:w-[500px] bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center border-4 border-cyan-100">
            <div className="text-base font-semibold mb-3 text-cyan-700">
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
              <span className="absolute right-7 text-cyan-900 font-bold text-sm">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen flex flex-col items-center py-4 px-2">
        <div className="w-full max-w-[1370px] mx-4 my-10">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/carrito")}
              className="flex items-center text-cyan-600 hover:text-cyan-700 font-medium transition text-base cursor-pointer"
              type="button"
            >
              <HiOutlineArrowNarrowLeft className="mr-2 text-xl" />
              Regresar al carrito
            </button>
          </div>
          <div className="flex items-center mb-8">
            <AiOutlineCreditCard className="text-3xl text-cyan-500 mr-3" />
            <h1 className="text-3xl font-semibold text-cyan-700">
              Confirmar y pagar
            </h1>
          </div>
          <div className="bg-white shadow-xl rounded-3xl flex flex-col lg:flex-row w-full min-h-[700px]">
            <div className="w-full lg:w-1/2 px-10 py-14 border-r border-gray-100 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-cyan-600 mb-3">
                  Resumen de compra
                </h2>
                <hr className="mb-6 border-cyan-100" />
                <div>
                  <h3 className="text-base font-semibold text-gray-700 mb-2">
                    Productos en tu carrito
                  </h3>
                  <div className="divide-y divide-gray-100 mb-4">
                    {productos.map((prod: any) => (
                      <div
                        key={prod.idproducto}
                        className="flex items-center py-3"
                      >
                        <img
                          src={assetUrl(`uploads/${encodeURIComponent(prod.imagen || "")}`)}
                          alt={prod.nombre}
                          className="w-14 h-14 rounded-lg bg-gray-100 object-contain border mr-4"
                        />
                        <div className="flex-1">
                          <div className="text-gray-700 truncate font-medium">
                            {prod.nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            Cantidad:{" "}
                            <span className="font-semibold">
                              {prod.cantidad}
                            </span>
                          </div>
                        </div>
                        <div className="font-semibold text-cyan-700 min-w-[90px] text-right">
                          S/ {(prod.precio * prod.cantidad).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between my-3 text-gray-700 font-medium">
                    <span>Subtotal</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between my-3 text-gray-700 font-medium">
                    <span>Envío</span>
                    <span>S/ {costoEnvio.toFixed(2)}</span>
                  </div>
                  <hr className="my-6 border-cyan-200" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-semibold text-cyan-600">
                      Total a pagar
                    </span>
                    <span className="text-3xl font-bold text-cyan-700 tracking-tight">
                      S/ {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 px-10 py-14 flex flex-col justify-between">
              <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                <div>
                  <div className="text-base font-semibold text-cyan-600 mb-2">
                    Datos del comprador
                  </div>
                  <div className="bg-gray-100 rounded-lg px-5 py-4 text-gray-700 font-normal">
                    {user?.correo || "demo@email.com"}
                  </div>
                </div>
                <div>
                  <div className="text-base font-semibold text-cyan-600 mb-2">
                    Método de pago
                  </div>
                  <Select
                    options={metodosPago}
                    value={metodoPagoSeleccionado}
                    onChange={setMetodoPagoSeleccionado}
                    isClearable
                    placeholder="Selecciona un método de pago..."
                    getOptionLabel={(m: any) => m.nombre}
                    getOptionValue={(m: any) => m.idMetodoPago}
                    components={{ Option, SingleValue }}
                    styles={customStyles}
                    noOptionsMessage={() =>
                      "No hay métodos de pago disponibles"
                    }
                    menuPlacement="auto"
                    menuShouldScrollIntoView={false}
                  />
                </div>
                {metodoPagoSeleccionado && !esMetodoPasarela && (
                  <div>
                    <div className="text-base font-semibold text-cyan-600 mb-2">
                      Información para el pago
                    </div>
                    <div className="bg-cyan-50 rounded-xl p-5 border border-cyan-100 shadow-sm mb-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(config).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-xs text-cyan-500 font-semibold">
                              {key}
                            </span>
                            <span className="text-base text-gray-700 select-all">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pago con pasarela (Culqi/Mercado Pago): punto de integración del widget.
                    Mientras no haya llave pública real cargada, se muestra el aviso de que
                    todavía no está disponible. Nunca se muestra el bloque de "comprobante". */}
                {metodoPagoSeleccionado && esMetodoPasarela && (
                  <div>
                    <div className="text-base font-semibold text-cyan-600 mb-2">
                      Pago con tarjeta
                    </div>
                    {cargandoLlaves ? (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center text-gray-500">
                        Verificando disponibilidad de la pasarela...
                      </div>
                    ) : (
                      (() => {
                        const proveedor = metodoPagoSeleccionado.proveedor as
                          | "CULQI"
                          | "MERCADOPAGO"
                          | undefined;
                        const llavePublica =
                          proveedor === "CULQI"
                            ? llavesPasarelas?.culqiPublicKey
                            : proveedor === "MERCADOPAGO"
                            ? llavesPasarelas?.mercadopagoPublicKey
                            : null;
                        const nombreProveedor =
                          proveedor === "CULQI"
                            ? "Culqi"
                            : proveedor === "MERCADOPAGO"
                            ? "Mercado Pago"
                            : "la pasarela";

                        if (!llavePublica) {
                          return (
                            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 text-center">
                              <p className="text-amber-700 font-medium">
                                Pago con tarjeta ({nombreProveedor}) — próximamente
                                disponible
                              </p>
                              <p className="text-sm text-amber-600 mt-1">
                                Por ahora usa Yape, Plin o transferencia bancaria para
                                completar tu compra.
                              </p>
                            </div>
                          );
                        }

                        // TODO (pendiente de llaves reales + decisión del dueño sobre cargar
                        // un script externo): este contenedor es donde se montaría el widget
                        // oficial de Culqi.js o el Brick de Mercado Pago, inicializado con
                        // `llavePublica`. El widget genera un token en el navegador (nunca el
                        // número de tarjeta) y ese token se envía a
                        // POST /api/pagos/culqi/cargo o /api/pagos/mercadopago/pago con `api`.
                        // function montarWidgetPasarela(proveedor, llavePublica) { ... }
                        return (
                          <div
                            id="contenedor-widget-pasarela"
                            className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300 text-center text-gray-500"
                          >
                            Widget de {nombreProveedor} pendiente de integrar
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}

                {metodoPagoSeleccionado && !esMetodoPasarela && (
                  <div>
                    <div className="text-base font-semibold text-cyan-600 mb-2">
                      Comprobante de pago
                    </div>
                    <div className="font-medium text-gray-700 mb-2">
                      Sube el comprobante (imagen o PDF)
                    </div>
                    <label
                      className={`relative flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed rounded-xl h-44 cursor-pointer transition w-full overflow-hidden ${
                        dragActive
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-gray-200 hover:border-cyan-400"
                      }`}
                      htmlFor="comprobante-input"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleDrop}
                    >
                      {!comprobante ? (
                        <>
                          <span className="text-5xl text-cyan-300 mb-2">
                            📎
                          </span>
                          <span className="text-gray-500 font-medium">
                            Arrastra o haz click aquí para seleccionar
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            Solo PDF, JPG, PNG. Máx 10MB
                          </span>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-white/80 rounded-full shadow p-2 hover:bg-red-100 transition z-10 cursor-pointer"
                            onClick={eliminarComprobante}
                            tabIndex={-1}
                          >
                            <HiOutlineTrash className="text-red-500 w-6 h-6" />
                          </button>
                          {isImage(comprobante) ? (
                            <img
                              src={URL.createObjectURL(comprobante)}
                              alt="Vista previa"
                              className="w-full h-full object-contain rounded-xl"
                            />
                          ) : isPdf(comprobante) ? (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                              <AiOutlineFilePdf className="text-red-500 text-8xl mb-2" />
                              <span className="text-gray-700 text-sm break-all px-2 text-center">
                                {comprobante.name}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}
                      <input
                        id="comprobante-input"
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        onClick={(e) => {
                          (e.target as HTMLInputElement).value = "";
                        }}
                      />
                    </label>
                  </div>
                )}
                <button
                  className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={!metodoPagoSeleccionado || esMetodoPasarela || !comprobante}
                >
                  {esMetodoPasarela
                    ? "Pago con tarjeta no disponible todavía"
                    : "Enviar comprobante y finalizar compra"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CheckoutPago;
