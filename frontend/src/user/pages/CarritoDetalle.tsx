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
import { useAuth } from "@/context/AuthContext";
import { api, assetUrl } from "@/lib/api";
import { getStockBadge } from "@/lib/stockBadge";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCarrito } from "@/user/hooks/useCarrito";
import swal from "sweetalert2/dist/sweetalert2.all.js";

const METODO_ENVIO_KEY = "metodo-envio";
const PUNTO_RECOJO_KEY = "punto-recojo";
const DIRECCION_ENVIO_KEY = "direccion-envio";

const CarritoDetalle: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    productosCarrito,
    quitarDelCarrito: quitarDelCarritoBase,
    vaciarCarrito,
    actualizarCantidad,
  } = useCarrito(user, isAuthenticated);

  const [removiendo, setRemoviendo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [metodosEnvio, setMetodosEnvio] = useState<any[]>([]);
  const [metodoEnvioSeleccionado, setMetodoEnvioSeleccionado] =
    useState<any>(null);
  const [puntoRecojoSeleccionado, setPuntoRecojoSeleccionado] =
    useState<any>(null);
  const [direccionEnvio, setDireccionEnvio] = useState<string>("");
  const [showMetodoModal, setShowMetodoModal] = useState(false);
  const [showPuntoModal, setShowPuntoModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "carrito" }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const cargarMetodosEnvio = async () => {
      try {
        const response = await api.get("/api/metodoenvio/listar-activos");
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
  }, []);

  // Quitar un ítem con animación de salida (slide + fade) antes de eliminarlo de verdad
  const quitarDelCarrito = (idproducto: number) => {
    setRemoviendo(idproducto);
    setTimeout(() => {
      quitarDelCarritoBase(idproducto);
      setRemoviendo(null);
    }, 220);
  };

  const handleVaciarCarrito = async () => {
    setLoading(true);
    try {
      vaciarCarrito();
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
    setDireccionEnvio("");
    localStorage.removeItem(DIRECCION_ENVIO_KEY);
  };

  const handleDireccionEnvioChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const direccion = e.target.value;
    setDireccionEnvio(direccion);
    localStorage.setItem(DIRECCION_ENVIO_KEY, direccion);
    setPuntoRecojoSeleccionado(null);
    localStorage.removeItem(PUNTO_RECOJO_KEY);
  };

  const subtotal = productosCarrito.reduce(
    (acc, p) => acc + p.precio * (p.cantidad || 1),
    0
  );
  const costoEnvio = metodoEnvioSeleccionado ? metodoEnvioSeleccionado.costo : 0;
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
      const resp = await api.post(
        "/api/pedidos/validar-stock",
        productosFiltrados
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
      swal.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  const puedeComprar =
    total > 0 &&
    metodoEnvioSeleccionado &&
    (puntoRecojoSeleccionado || direccionEnvio);

  return (
    <>
      <main className="bg-canvas min-h-screen pb-28 lg:pb-0">
        <div className="max-w-[1410px] mx-auto px-4 py-10 sm:px-6">
          <div className="flex items-center mb-8">
            <HiOutlineShoppingCart className="text-3xl text-primary mr-3" />
            <h1 className="text-3xl font-extrabold text-text">
              Tu Carrito de Compras
            </h1>
          </div>

          {productosCarrito.length === 0 ? (
            <Card elevation={1} padding="lg" className="flex flex-col items-center text-center py-16">
              <TbMoodEmpty className="text-7xl mb-4 text-text-muted" />
              <h2 className="text-2xl font-semibold text-text mb-3">
                ¡Tu carrito está vacío!
              </h2>
              <p className="text-text-muted mb-6 max-w-md">
                Parece que aún no has agregado productos a tu carrito. Explora
                nuestra tienda y descubre increíbles productos.
              </p>
              <Button onClick={() => navigate("/tienda")}>Explorar productos</Button>
            </Card>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Lista de productos */}
              <div className="lg:w-7/12">
                <Card elevation={1} padding="none" className="h-[80vh] overflow-y-auto">
                  <div className="p-5 border-b border-border">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-text">
                        Productos ({productosCarrito.length})
                      </h2>
                      <button
                        onClick={handleVaciarCarrito}
                        disabled={loading}
                        className="flex items-center text-danger hover:text-danger/80 text-sm font-medium cursor-pointer"
                        type="button"
                      >
                        <HiOutlineTrash className="mr-1" />
                        Vaciar carrito
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {productosCarrito.map((p) => {
                      const stockBadge = getStockBadge(p.stock);
                      const saliendo = removiendo === p.idproducto;
                      return (
                        <div
                          key={p.idproducto}
                          className="p-5 flex transition-[transform,opacity] duration-[var(--duration-base)] ease-standard"
                          style={
                            saliendo
                              ? { transform: "translateX(24px)", opacity: 0 }
                              : { transform: "translateX(0)", opacity: 1 }
                          }
                        >
                          <div className="flex-shrink-0 w-24 h-24 bg-canvas rounded-control overflow-hidden flex items-center justify-center">
                            <img
                              src={assetUrl(`uploads/${encodeURIComponent(p.imagen)}`)}
                              alt={p.nombre}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-text">
                                  {p.nombre}
                                </h3>
                                <p className="text-primary font-semibold mt-1">
                                  S/ {p.precio.toFixed(2)}
                                </p>
                                {p.stock <= 5 && (
                                  <Badge variant={stockBadge.variant} size="sm" className="mt-1">
                                    {stockBadge.label}
                                  </Badge>
                                )}
                              </div>
                              <button
                                onClick={() => quitarDelCarrito(p.idproducto)}
                                className="text-text-muted hover:text-danger cursor-pointer"
                                title="Quitar"
                                type="button"
                              >
                                <HiOutlineTrash className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="mt-3 bg-canvas p-3 rounded-control">
                              <div className="text-sm text-text-muted flex justify-between">
                                <span>Precio unitario:</span>
                                <span>S/ {p.precio.toFixed(2)}</span>
                              </div>
                              <div className="text-sm text-text-muted flex justify-between mt-1">
                                <span>Cantidad:</span>
                                <span>{p.cantidad}</span>
                              </div>
                              <div className="text-base font-medium text-text flex justify-between mt-2 pt-2 border-t border-border">
                                <span>Subtotal:</span>
                                <span className="text-primary">
                                  S/ {(p.precio * p.cantidad).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center">
                              <span className="mr-3 text-text-muted">Cantidad:</span>
                              <div className="flex items-center border border-border rounded-control">
                                <button
                                  className="px-3 py-1 text-text-muted hover:bg-canvas cursor-pointer"
                                  onClick={() =>
                                    actualizarCantidad(p.idproducto, p.cantidad - 1)
                                  }
                                  disabled={p.cantidad <= 1}
                                  type="button"
                                >
                                  <HiOutlineMinus className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-text">{p.cantidad}</span>
                                <button
                                  className="px-3 py-1 text-text-muted hover:bg-canvas cursor-pointer"
                                  onClick={() =>
                                    actualizarCantidad(p.idproducto, p.cantidad + 1)
                                  }
                                  disabled={p.cantidad >= p.stock}
                                  type="button"
                                >
                                  <HiOutlinePlus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Resumen de compra */}
              <div className="lg:w-5/12">
                <Card elevation={1} padding="none" className="h-[80vh] overflow-y-auto">
                  <div className="p-5 bg-surface border-b border-border">
                    <h2 className="text-xl font-semibold text-text">
                      Resumen de tu pedido
                    </h2>
                  </div>

                  <div className="p-5">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Subtotal:</span>
                        <span className="font-medium text-text">
                          S/ {subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-text-muted">Envío:</span>
                          <div className="flex items-center">
                            <span className="font-medium text-text mr-2">
                              {metodoEnvioSeleccionado
                                ? `S/ ${metodoEnvioSeleccionado.costo.toFixed(2)}`
                                : "--"}
                            </span>
                            <button
                              onClick={() => setShowMetodoModal(true)}
                              className="text-primary hover:text-primary-hover font-medium cursor-pointer text-sm"
                              type="button"
                            >
                              {metodoEnvioSeleccionado ? "Cambiar" : "Seleccionar"}
                            </button>
                          </div>
                        </div>

                        {metodoEnvioSeleccionado && (
                          <div className="bg-canvas p-3 rounded-control mt-2">
                            <div className="flex items-start">
                              <HiOutlineLocationMarker className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-text">
                                  {metodoEnvioSeleccionado.nombre}
                                </div>
                                <div className="text-sm text-text-muted mt-1">
                                  {metodoEnvioSeleccionado.descripcion}
                                </div>
                                {puntoRecojoSeleccionado ? (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium text-text">
                                      Punto de recojo:
                                    </div>
                                    <div className="text-sm text-text-muted">
                                      {puntoRecojoSeleccionado.nombre}
                                    </div>
                                    <div className="text-xs text-text-muted">
                                      {puntoRecojoSeleccionado.direccion}
                                    </div>
                                    <button
                                      onClick={() => setShowPuntoModal(true)}
                                      className="text-primary hover:text-primary-hover text-xs mt-1 cursor-pointer"
                                      type="button"
                                    >
                                      Cambiar punto
                                    </button>
                                  </div>
                                ) : direccionEnvio ? (
                                  <div className="mt-2">
                                    <div className="text-sm font-medium text-text">
                                      Dirección de envío:
                                    </div>
                                    <div className="text-sm text-text-muted">
                                      {direccionEnvio}
                                    </div>
                                    <button
                                      onClick={() => setShowPuntoModal(true)}
                                      className="text-primary hover:text-primary-hover text-xs mt-1 cursor-pointer"
                                      type="button"
                                    >
                                      Cambiar dirección
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowPuntoModal(true)}
                                    className="text-primary hover:text-primary-hover text-sm mt-2 cursor-pointer"
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

                      <div className="flex justify-between pt-4 border-t border-border">
                        <span className="text-lg font-semibold text-text">Total:</span>
                        <span className="text-xl font-bold text-primary">
                          S/ {total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Desktop: botón normal. Mobile: se oculta, hay uno sticky abajo */}
                    <div className="mt-6 hidden lg:block">
                      <Button fullWidth disabled={!puedeComprar} onClick={handleCheckout}>
                        Proceder al checkout
                      </Button>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => navigate("/tienda")}
                        className="text-primary hover:text-primary-hover font-medium cursor-pointer"
                        type="button"
                      >
                        ← Continuar comprando
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CTA sticky en mobile */}
      {productosCarrito.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 z-40 shadow-elevation-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-sm">Total</span>
            <span className="text-lg font-bold text-primary">S/ {total.toFixed(2)}</span>
          </div>
          <Button fullWidth disabled={!puedeComprar} onClick={handleCheckout}>
            Proceder al checkout
          </Button>
        </div>
      )}

      {/* Modal de selección de método de envío */}
      {showMetodoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card elevation={3} padding="none" className="w-full max-w-md">
            <div className="p-5 border-b border-border">
              <h3 className="text-xl font-bold text-text">
                Selecciona método de envío
              </h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="space-y-4">
                {metodosEnvio.map((metodo) => (
                  <div
                    key={metodo.idMetodoEnvio}
                    className={`border rounded-control p-4 transition-all cursor-pointer ${
                      metodoEnvioSeleccionado?.idMetodoEnvio === metodo.idMetodoEnvio
                        ? "border-primary border-2 bg-canvas"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => seleccionarMetodoEnvio(metodo)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            metodoEnvioSeleccionado?.idMetodoEnvio === metodo.idMetodoEnvio
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {metodoEnvioSeleccionado?.idMetodoEnvio === metodo.idMetodoEnvio && (
                            <div className="w-2 h-2 bg-canvas rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-text">{metodo.nombre}</h4>
                          <span className="font-medium text-primary">
                            S/ {metodo.costo.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted mt-1">{metodo.descripcion}</p>
                        <div className="text-sm text-text-muted mt-2">
                          <span className="font-medium">Tiempo estimado:</span>{" "}
                          {metodo.tiempoEstimado}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end">
              <Button variant="danger" onClick={() => setShowMetodoModal(false)}>
                Cerrar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de selección de punto de recojo o dirección */}
      {showPuntoModal && metodoEnvioSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card elevation={3} padding="none" className="w-full max-w-md">
            <div className="p-5 border-b border-border">
              <h3 className="text-xl font-bold text-text">
                {metodoEnvioSeleccionado.puntosRecojo
                  ? "Selecciona punto de recojo"
                  : "Ingresa tu dirección de envío"}
              </h3>
              <p className="text-sm text-text-muted mt-1">
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
                        className={`border rounded-control p-4 transition-all cursor-pointer ${
                          puntoRecojoSeleccionado?.nombre === punto.nombre
                            ? "border-primary border-2 bg-canvas"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => seleccionarPuntoRecojo(punto)}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                puntoRecojoSeleccionado?.nombre === punto.nombre
                                  ? "border-primary bg-primary"
                                  : "border-border"
                              }`}
                            >
                              {puntoRecojoSeleccionado?.nombre === punto.nombre && (
                                <div className="w-2 h-2 bg-canvas rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-text">{punto.nombre}</h4>
                            <p className="text-sm text-text-muted mt-1">{punto.direccion}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Dirección completa
                    </label>
                    <input
                      type="text"
                      value={direccionEnvio}
                      onChange={handleDireccionEnvioChange}
                      className="w-full px-4 py-2 border border-border rounded-control bg-surface text-text focus:ring-primary focus:border-primary"
                      placeholder="Ej: Av. Lima 123, Lima, Perú"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-border flex justify-between">
              <Button variant="secondary" onClick={() => setShowPuntoModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowPuntoModal(false)}>Guardar</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default CarritoDetalle;
