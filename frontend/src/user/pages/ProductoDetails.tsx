import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaCartPlus, FaTrashAlt } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import swal from "sweetalert2/dist/sweetalert2.all.js";
import { useAuth } from "@/context/AuthContext";
import { api, assetUrl } from "@/lib/api";
import { getStockBadge } from "@/lib/stockBadge";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Especificacion {
  unidadmedida: string;
  valor: number;
  descripcion: string;
}

interface Comentario {
  idcomentario: number;
  descripcion: string;
  fechacomentario: string;
  calificacion: number;
  usuario: {
    nombre: string;
    apellido: string;
  };
}

interface Producto {
  idproducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  nombreCategoria: string;
  nombreMarca: string;
  especificaciones: Especificacion[];
  imagenesNombres: string[];
  comentariosAprobados?: Comentario[];
  calificacionPromedio: number;
  totalResenas: number;
}

const tabs = [
  { key: "description", label: "Descripción" },
  { key: "reviews", label: "Reseñas" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

interface ItemCarrito {
  idproducto: number;
  nombre: string;
  cantidad: number;
  precio: number;
  imagen: string;
}

// Utilidad para manejar carrito en localStorage
const getCarrito = (): ItemCarrito[] => {
  const stored = localStorage.getItem("carrito");
  try {
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setCarrito = (productos: ItemCarrito[]) => {
  localStorage.setItem("carrito", JSON.stringify(productos));
  window.dispatchEvent(new CustomEvent("carrito-updated"));
};

function Estrellas({
  calificacion,
  tamano = "h-5 w-5",
}: {
  calificacion: number;
  tamano?: string;
}) {
  return (
    <div className="flex text-primary" aria-hidden="true">
      {[...Array(5)].map((_, i) =>
        i < Math.round(calificacion) ? (
          <FaStar key={i} className={tamano} />
        ) : (
          <FaRegStar key={i} className={tamano} />
        )
      )}
    </div>
  );
}

const ProductoDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const producto = state as Producto;
  const { user, isAuthenticated } = useAuth();

  const reviews = producto?.comentariosAprobados || [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [loaded, setLoaded] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isOpinionModalOpen, setIsOpinionModalOpen] = useState(false);
  const [opinionText, setOpinionText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enCarrito, setEnCarrito] = useState(false);

  // Sincroniza estado local con localStorage
  useEffect(() => {
    if (!producto) return;
    const carrito = getCarrito();
    setEnCarrito(
      carrito.some((p) => p.idproducto === producto.idproducto)
    );
    const onCarrito = () => {
      const nuevoCarrito = getCarrito();
      setEnCarrito(
        nuevoCarrito.some((p) => p.idproducto === producto.idproducto)
      );
    };
    window.addEventListener("carrito-updated", onCarrito);
    return () => window.removeEventListener("carrito-updated", onCarrito);
    // eslint-disable-next-line
  }, [producto?.idproducto]);

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleSubmitOpinion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      swal.fire("Error", "Por favor selecciona una calificación", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/api/comentarios/crear", {
        descripcion: opinionText.trim(),
        calificacion: rating,
        iduser: user?.iduser,
        idproducto: producto.idproducto,
      });
      if (data.success) {
        swal.fire(
          "¡Éxito!",
          "Tu opinión ha sido enviada para revisión",
          "success"
        );
        setIsOpinionModalOpen(false);
        setOpinionText("");
        setRating(0);
      } else {
        swal.fire("Error", data.message, "error");
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          .response?.data?.message ||
        (err as Error).message;
      swal.fire("Error", msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!producto) {
    return (
      <div className="p-8 text-center">
        <p className="text-text">Producto no encontrado.</p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Volver
        </Button>
      </div>
    );
  }

  const hasStock = producto.stock > 0;
  const stockBadge = getStockBadge(producto.stock);
  const showOpinionButton = isAuthenticated && user?.rol.idrol === 2;

  // Acción añadir/quitar del carrito
  const handleCarrito = () => {
    let carrito = getCarrito();
    if (enCarrito) {
      carrito = carrito.filter(
        (p) => p.idproducto !== producto.idproducto
      );
      setCarrito(carrito);
      setEnCarrito(false);
      swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        timer: 1200,
        showConfirmButton: false,
        title: "Producto eliminado del carrito",
      });
    } else {
      const productoSimplificado = {
        idproducto: producto.idproducto,
        nombre: producto.nombre,
        cantidad: 1,
        precio: producto.precio,
        imagen: producto.imagenesNombres[0] || "",
      };

      carrito.push(productoSimplificado);
      setCarrito(carrito);
      setEnCarrito(true);
      swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        title: "Producto añadido al carrito",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-[1350px] mx-auto w-full">
        <button
          className="mb-4 text-primary hover:underline flex items-center cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-12 xl:gap-x-20">
          {/* Sección de imágenes */}
          <div className="space-y-6">
            <Card elevation={1} padding="none" className="aspect-square overflow-hidden">
              <img
                src={assetUrl(
                  `uploads/${encodeURIComponent(producto.imagenesNombres[selectedImage])}`
                )}
                alt={producto.nombre}
                className={`w-full h-full object-contain image-crossfade ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setLoaded(true)}
              />
            </Card>
            {/* Miniaturas */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {producto.imagenesNombres.map((img, i) => (
                <button
                  key={img}
                  onClick={() => {
                    setLoaded(false);
                    setSelectedImage(i);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-[box-shadow,opacity] duration-[var(--duration-fast)] ease-standard cursor-pointer ${
                    i === selectedImage
                      ? "ring-4 ring-primary"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={assetUrl(`uploads/${encodeURIComponent(img)}`)}
                    alt={`Vista ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Detalles del producto */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text">{producto.nombre}</h1>
            <div className="flex items-center space-x-2">
              <Estrellas calificacion={producto.calificacionPromedio} />
              <span className="text-sm text-text-muted">
                ({producto.totalResenas} reseñas)
              </span>
            </div>
            <div className="text-3xl font-bold text-text">
              S/ {producto.precio.toFixed(2)}
            </div>
            {/* Stock y metadatos */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
                <span className="text-sm text-text-muted">
                  {producto.stock} unidades
                </span>
              </div>

              {/* Especificaciones técnicas: siempre visibles, sin pestaña */}
              <Card elevation={1} padding="md">
                <h3 className="text-base font-semibold text-text mb-3">
                  Especificaciones técnicas
                </h3>
                {producto.especificaciones.length > 0 ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {producto.especificaciones.map((es, i) => (
                      <div key={i}>
                        <dt className="text-sm text-text-muted">{es.descripcion}</dt>
                        <dd className="mt-0.5 text-text font-medium">
                          {es.valor} {es.unidadmedida}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-text-muted">
                    Este producto no tiene especificaciones registradas.
                  </p>
                )}
              </Card>

              <button
                className="w-full flex justify-between items-center p-4 bg-surface border border-border rounded-xl hover:bg-canvas transition-colors cursor-pointer"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                <span className="font-medium text-text">Metadatos del producto</span>
                <svg
                  className={`w-5 h-5 text-text transform transition-transform ${
                    isDetailsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDetailsOpen && (
                <Card elevation={1} padding="md">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-text-muted">Marca</p>
                      <p className="font-medium text-text">{producto.nombreMarca}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-text-muted">Categoría</p>
                      <p className="font-medium text-text">{producto.nombreCategoria}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            {/* Botones de acción */}
            <div className="flex gap-4">
              <Button
                className="flex-1"
                variant={enCarrito ? "danger" : "primary"}
                disabled={!hasStock}
                onClick={handleCarrito}
                leftIcon={enCarrito ? <FaTrashAlt /> : <FaCartPlus />}
              >
                {enCarrito ? "Quitar del carrito" : "Añadir al carrito"}
              </Button>
              {showOpinionButton && (
                <Button variant="secondary" onClick={() => setIsOpinionModalOpen(true)}>
                  Escribir reseña
                </Button>
              )}
            </div>
            {/* Info de envío */}
            <Card elevation={1} padding="md" className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-primary mt-1 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-primary">Envío rápido y seguro</p>
                <p className="text-sm text-text-muted">
                  Recibe tu producto en 24-48 horas con envío express disponible
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Sección de pestañas: descripción y reseñas (specs ya van visibles arriba) */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex space-x-8 -mt-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text hover:border-border"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="py-8">
            {activeTab === "description" && (
              <p className="text-text-muted">{producto.descripcion}</p>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-8">
                <h3 className="text-lg font-semibold text-text">
                  ¿Qué opinan nuestros clientes?
                </h3>
                {reviews.length > 0 ? (
                  <div className="space-y-8">
                    {reviews.map((c) => (
                      <div
                        key={c.idcomentario}
                        className="pb-8 border-b border-border last:border-0"
                      >
                        <div className="flex items-center space-x-2 mb-3">
                          <Estrellas calificacion={c.calificacion} tamano="h-4 w-4" />
                          <h4 className="font-medium text-text">
                            {c.usuario.nombre} {c.usuario.apellido}
                          </h4>
                          <span className="text-sm text-text-muted">
                            {formatDate(c.fechacomentario)}
                          </span>
                        </div>
                        <p className="text-text-muted whitespace-pre-wrap">
                          {c.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-text-muted">
                      Este producto aún no tiene reseñas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Modal de opinión */}
      {isOpinionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card
            elevation={3}
            padding="none"
            className="max-w-2xl w-full max-h-[100vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-xl font-semibold text-text">Escribe tu reseña</h3>
              <button
                onClick={() => setIsOpinionModalOpen(false)}
                className="cursor-pointer text-text-muted hover:text-text transition hover:scale-110"
                aria-label="Cerrar"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitOpinion} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="mb-6 text-center">
                  <label className="block text-lg font-medium text-text mb-4">
                    ¿Cómo calificarías este producto?
                  </label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-3xl focus:outline-none cursor-pointer transition-transform hover:scale-110"
                        aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
                      >
                        {star <= (hoverRating || rating) ? (
                          <FaStar className="text-primary" />
                        ) : (
                          <FaRegStar className="text-primary opacity-70" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-text-muted">
                    {rating > 0
                      ? `Calificación: ${rating} estrella${rating > 1 ? "s" : ""}`
                      : "Selecciona una calificación"}
                  </p>
                </div>
                <div>
                  <label className="block text-lg font-medium text-text mb-3">
                    Comparte tu experiencia
                  </label>
                  <textarea
                    value={opinionText}
                    onChange={(e) => setOpinionText(e.target.value)}
                    rows={9}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    placeholder="¿Qué te gustó o no te gustó del producto? ¿Lo recomendarías?"
                    required
                  />
                  <p className="mt-2 text-sm text-text-muted">
                    Tu reseña será revisada antes de publicarse
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsOpinionModalOpen(false);
                    setRating(0);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Enviar reseña
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductoDetails;
