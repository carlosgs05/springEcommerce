import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineTrash,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineShoppingCart,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { TbMoodEmpty } from "react-icons/tb";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import axios from "axios";
import swal from "sweetalert2/dist/sweetalert2.all.js";

// Helpers para localStorage
const getCarrito = () => {
  const stored = localStorage.getItem("carrito");
  try {
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setCarrito = (productos: any[]) => {
  localStorage.setItem("carrito", JSON.stringify(productos));
  window.dispatchEvent(new CustomEvent("carrito-updated"));
};

const eliminarCarritoLocal = () => {
  localStorage.removeItem("carrito");
  window.dispatchEvent(new CustomEvent("carrito-updated"));
};

const METODO_ENVIO_KEY = "metodo-envio";
const PUNTO_RECOJO_KEY = "punto-recojo";
const DIRECCION_ENVIO_KEY = "direccion-envio";

const CarritoDetalle: React.FC = () => {
  const [productosCarrito, setProductosCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [metodosEnvio, setMetodosEnvio] = useState<any[]>([]);
  const [metodoEnvioSeleccionado, setMetodoEnvioSeleccionado] =
    useState<any>(null);
  const [puntoRecojoSeleccionado, setPuntoRecojoSeleccionado] =
    useState<any>(null);
  const [direccionEnvio, setDireccionEnvio] = useState<string>("");
  const [showMetodoModal, setShowMetodoModal] = useState(false);
  const [showPuntoModal, setShowPuntoModal] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "carrito" }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setProductosCarrito(getCarrito());

    const cargarMetodosEnvio = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/metodoenvio/listar-activos"
        );
        setMetodosEnvio(response.data.data);
      } catch (error) {
        console.error("Error cargando métodos de envío:", error);
      }
    };

    cargarMetodosEnvio();

    const savedMetodo = localStorage.getItem(METODO_ENVIO_KEY);
    if (savedMetodo) setMetodoEnvioSeleccionado(JSON.parse(savedMetodo));

    const savedPunto = localStorage.getItem(PUNTO_RECOJO_KEY);
    if (savedPunto) setPuntoRecojoSeleccionado(JSON.parse(savedPunto));

    const savedDireccion = localStorage.getItem(DIRECCION_ENVIO_KEY);
    if (savedDireccion) setDireccionEnvio(savedDireccion);

    const handler = () => setProductosCarrito(getCarrito());
    window.addEventListener("carrito-updated", handler);
    return () => window.removeEventListener("carrito-updated", handler);
  }, []);

  const syncCarrito = async (nuevo: any[]) => {
    setCarrito(nuevo);
    setProductosCarrito(nuevo);
    if (user?.iduser) {
      try {
        await axios.post("http://localhost:8080/api/carrito/guardar", {
          idUsuario: user.iduser,
          productos: nuevo,
        });
      } catch {}
    }
  };

  const actualizarCantidad = (idproducto: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    const nuevo = productosCarrito.map((p) =>
      p.idproducto === idproducto ? { ...p, cantidad: nuevaCantidad } : p
    );
    syncCarrito(nuevo);
  };

  const quitarDelCarrito = (idproducto: number) => {
    const nuevo = productosCarrito.filter((p) => p.idproducto !== idproducto);
    syncCarrito(nuevo);
  };

  const vaciarCarrito = async () => {
    setLoading(true);
    try {
      if (user?.iduser) {
        await axios.delete(
          `http://localhost:8080/api/carrito/eliminar/${user.iduser}`
        );
      }
      eliminarCarritoLocal();
      setProductosCarrito([]);
      localStorage.removeItem(METODO_ENVIO_KEY);
      localStorage.removeItem(PUNTO_RECOJO_KEY);
      localStorage.removeItem(DIRECCION_ENVIO_KEY);
      setMetodoEnvioSeleccionado(null);
      setPuntoRecojoSeleccionado(null);
      setDireccionEnvio("");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarMetodoEnvio = (metodo: any) => {
    setMetodoEnvioSeleccionado(metodo);
    localStorage.setItem(METODO_ENVIO_KEY, JSON.stringify(metodo));

    // Limpiar datos de envío previos
    setPuntoRecojoSeleccionado(null);
    localStorage.removeItem(PUNTO_RECOJO_KEY);
    setDireccionEnvio("");
    localStorage.removeItem(DIRECCION_ENVIO_KEY);

    const puntos = JSON.parse(metodo.puntosRecojo || "[]");
    if (puntos.length === 1) {
      seleccionarPuntoRecojo(puntos[0]);
    }
  };

  const seleccionarPuntoRecojo = (punto: any) => {
    setPuntoRecojoSeleccionado(punto);
    localStorage.setItem(PUNTO_RECOJO_KEY, JSON.stringify(punto));
    // Limpiar dirección si se selecciona punto de recojo
    setDireccionEnvio("");
    localStorage.removeItem(DIRECCION_ENVIO_KEY);
  };

  const handleDireccionEnvioChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const direccion = e.target.value;
    setDireccionEnvio(direccion);
    localStorage.setItem(DIRECCION_ENVIO_KEY, direccion);
    // Limpiar punto de recojo si se ingresa dirección
    setPuntoRecojoSeleccionado(null);
    localStorage.removeItem(PUNTO_RECOJO_KEY);
  };

  const subtotal = productosCarrito.reduce(
    (acc, p) => acc + p.precio * (p.cantidad || 1),
    0
  );
  const costoEnvio = metodoEnvioSeleccionado
    ? metodoEnvioSeleccionado.costo
    : 0;
  const total = subtotal + costoEnvio;

  const handleCheckout = async () => {
    try {
      const productosFiltrados = productosCarrito.map(
        ({ idproducto, nombre, cantidad, precio, imagen }) => ({
          idproducto,
          nombre,
          cantidad,
          precio,
          imagen,
        })
      );
      const resp = await axios.post(
        "http://localhost:8080/api/pedidos/validar-stock",
        JSON.stringify(productosFiltrados),
        { headers: { "Content-Type": "application/json" } }
      );
      const sinStock = resp.data.data.filter((prod: any) => !prod.suficiente);
      if (sinStock.length > 0) {
        swal.fire({
          icon: "error",
          title: "Stock insuficiente",
          html:
            "<div class='text-left'>" +
            sinStock
              .map(
                (p: any) =>
                  `<div>
                    <b>${p.nombre}</b><br/>
                    Cantidad solicitada: <b>${p.cantidadSolicitada}</b><br/>
                    Stock disponible: <b>${p.stockDisponible}</b>
                  </div>`
              )
              .join("<hr/>") +
            "</div>",
          confirmButtonText: "Aceptar",
        });
      } else {
        navigate("/checkout", {
          state: {
            productos: productosCarrito,
            subtotal,
            costoEnvio,
            total,
            metodoEnvioSeleccionado,
            puntoRecojoSeleccionado,
            direccionEnvio,
            user,
          },
        });
      }
    } catch (e: any) {
      let msg = "Ocurrió un error al validar el stock. Intenta de nuevo.";
      if (e?.response?.data?.message) msg = e.response.data.message;
      swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    }
  };

  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-[1410px] mx-auto px-4 py-12 sm:px-6">
          <div className="flex items-center mb-8">
            <HiOutlineShoppingCart className="text-3xl text-cyan-500 mr-3" />
            <h1 className="text-3xl font-semibold text-cyan-700">
              Tu Carrito de Compras
            </h1>
          </div>

          {productosCarrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md">
              <TbMoodEmpty className="text-7xl mb-4 text-cyan-400" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                ¡Tu carrito está vacío!
              </h2>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Parece que aún no has agregado productos a tu carrito. Explora
                nuestra tienda y descubre increíbles productos.
              </p>
              <button
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium px-6 py-3 rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate("/tienda")}
                type="button"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Lista de productos */}
              <div className="lg:w-7/12">
                <div className="bg-white rounded-xl shadow-md h-[80vh] overflow-y-auto">
                  <div className="p-5 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Productos ({productosCarrito.length})
                      </h2>
                      <button
                        onClick={vaciarCarrito}
                        disabled={loading}
                        className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                        type="button"
                      >
                        <HiOutlineTrash className="mr-1" />
                        Vaciar carrito
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {productosCarrito.map((p) => (
                      <div key={p.idproducto} className="p-5 flex">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={`http://localhost:8080/uploads/${encodeURIComponent(
                              p.imagen
                            )}`}
                            alt={p.nombre}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Información del producto */}
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-800">
                                {p.nombre}
                              </h3>
                              <p className="text-cyan-500 font-semibold mt-1">
                                S/ {p.precio.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => quitarDelCarrito(p.idproducto)}
                              className="text-gray-400 hover:text-red-500 cursor-pointer"
                              title="Quitar"
                              type="button"
                            >
                              <HiOutlineTrash className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Detalle de precio */}
                          <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 flex justify-between">
                              <span>Precio unitario:</span>
                              <span>S/ {p.precio.toFixed(2)}</span>
                            </div>
                            <div className="text-sm text-gray-600 flex justify-between mt-1">
                              <span>Cantidad:</span>
                              <span>{p.cantidad}</span>
                            </div>
                            <div className="text-base font-medium text-gray-800 flex justify-between mt-2 pt-2 border-t border-gray-200">
                              <span>Subtotal:</span>
                              <span className="text-cyan-600">
                                S/ {(p.precio * p.cantidad).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Selector de cantidad */}
                          <div className="mt-3 flex items-center">
                            <span className="mr-3 text-gray-600">
                              Cantidad:
                            </span>
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                                onClick={() =>
                                  actualizarCantidad(
                                    p.idproducto,
                                    p.cantidad - 1
                                  )
                                }
                                type="button"
                              >
                                <HiOutlineMinus className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-1 text-gray-800">
                                {p.cantidad}
                              </span>
                              <button
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                                onClick={() =>
                                  actualizarCantidad(
                                    p.idproducto,
                                    p.cantidad + 1
                                  )
                                }
                                type="button"
                              >
                                <HiOutlinePlus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumen de compra */}
              <div className="lg:w-5/12">
                <div className="bg-white rounded-xl shadow-md h-[80vh] overflow-y-auto">
                  <div className="p-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                    <h2 className="text-xl font-semibold">
                      Resumen de tu pedido
                    </h2>
                  </div>

                  <div className="p-5">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          S/ {subtotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Sección de envío */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Envío:</span>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">
                              {metodoEnvioSeleccionado
                                ? `S/ ${metodoEnvioSeleccionado.costo.toFixed(
                                    2
                                  )}`
                                : "--"}
                            </span>
                            <button
                              onClick={() => setShowMetodoModal(true)}
                              className="text-cyan-500 hover:text-cyan-700 font-medium cursor-pointer text-sm"
                              type="button"
                            >
                              {metodoEnvioSeleccionado
                                ? "Cambiar"
                                : "Seleccionar"}
                            </button>
                          </div>
                        </div>

                        {metodoEnvioSeleccionado && (
                          <div className="bg-gray-50 p-3 rounded-lg mt-2">
                            <div className="flex items-start">
                              <HiOutlineLocationMarker className="text-cyan-500 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-gray-800">
                                  {metodoEnvioSeleccionado.nombre}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {metodoEnvioSeleccionado.descripcion}
                                </div>
                                {puntoRecojoSeleccionado ? (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium text-gray-700">
                                      Punto de recojo:
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {puntoRecojoSeleccionado.nombre}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {puntoRecojoSeleccionado.direccion}
                                    </div>
                                    <button
                                      onClick={() => setShowPuntoModal(true)}
                                      className="text-cyan-500 hover:text-cyan-700 text-xs mt-1 cursor-pointer"
                                      type="button"
                                    >
                                      Cambiar punto
                                    </button>
                                  </div>
                                ) : direccionEnvio ? (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium text-gray-700">
                                      Dirección de envío:
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {direccionEnvio}
                                    </div>
                                    <button
                                      onClick={() => setShowPuntoModal(true)}
                                      className="text-cyan-500 hover:text-cyan-700 text-xs mt-1 cursor-pointer"
                                      type="button"
                                    >
                                      Cambiar dirección
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowPuntoModal(true)}
                                    className="text-cyan-500 hover:text-cyan-700 text-sm mt-2 cursor-pointer"
                                    type="button"
                                  >
                                    {metodoEnvioSeleccionado.puntosRecojo
                                      ? "Seleccionar punto de recojo"
                                      : "Ingresar dirección de envío"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between pt-4 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-800">
                          Total:
                        </span>
                        <span className="text-xl font-bold text-cyan-600">
                          S/ {total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          total === 0 ||
                          !metodoEnvioSeleccionado ||
                          (!puntoRecojoSeleccionado && !direccionEnvio)
                        }
                        onClick={handleCheckout}
                        type="button"
                      >
                        Proceder al checkout
                      </button>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => navigate("/tienda")}
                        className="text-cyan-500 hover:text-cyan-700 font-medium cursor-pointer"
                        type="button"
                      >
                        ← Continuar comprando
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Modal de selección de método de envío */}
      {showMetodoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                Selecciona método de envío
              </h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="space-y-4">
                {metodosEnvio.map((metodo) => (
                  <div
                    key={metodo.idMetodoEnvio}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      metodoEnvioSeleccionado?.idMetodoEnvio ===
                      metodo.idMetodoEnvio
                        ? "border-cyan-500 border-2 bg-cyan-50"
                        : "border-gray-200 hover:border-cyan-300"
                    }`}
                    onClick={() => seleccionarMetodoEnvio(metodo)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            metodoEnvioSeleccionado?.idMetodoEnvio ===
                            metodo.idMetodoEnvio
                              ? "border-cyan-500 bg-cyan-500"
                              : "border-gray-300"
                          }`}
                        >
                          {metodoEnvioSeleccionado?.idMetodoEnvio ===
                            metodo.idMetodoEnvio && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-gray-800">
                            {metodo.nombre}
                          </h4>
                          <span className="font-medium text-cyan-600">
                            S/ {metodo.costo.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {metodo.descripcion}
                        </p>
                        <div className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Tiempo estimado:</span>{" "}
                          {metodo.tiempoEstimado}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowMetodoModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-800 transition-all cursor-pointer"
                type="button"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de punto de recojo o dirección */}
      {showPuntoModal && metodoEnvioSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {metodoEnvioSeleccionado.puntosRecojo
                  ? "Selecciona punto de recojo"
                  : "Ingresa tu dirección de envío"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {metodoEnvioSeleccionado.nombre}
              </p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {metodoEnvioSeleccionado.puntosRecojo ? (
                <div className="space-y-3">
                  {JSON.parse(metodoEnvioSeleccionado.puntosRecojo || "[]").map(
                    (punto: any, index: number) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 transition-all cursor-pointer ${
                          puntoRecojoSeleccionado?.nombre === punto.nombre
                            ? "border-cyan-500 border-2 bg-cyan-50"
                            : "border-gray-200 hover:border-cyan-300"
                        }`}
                        onClick={() => seleccionarPuntoRecojo(punto)}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                puntoRecojoSeleccionado?.nombre === punto.nombre
                                  ? "border-cyan-500 bg-cyan-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {puntoRecojoSeleccionado?.nombre ===
                                punto.nombre && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {punto.nombre}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {punto.direccion}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección completa
                    </label>
                    <input
                      type="text"
                      value={direccionEnvio}
                      onChange={handleDireccionEnvioChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Ej: Av. Lima 123, Lima, Perú"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referencia (opcional)
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Ej: Casa verde portón negro"
                      rows={2}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowPuntoModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-800 transition-all cursor-pointer"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowPuntoModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-600 transition-all cursor-pointer"
                type="button"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarritoDetalle;
