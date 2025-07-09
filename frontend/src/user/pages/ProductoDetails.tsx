import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaCartPlus, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import swal from "sweetalert2/dist/sweetalert2.all.js";
import Footer from "../Footer";
import Header from "../Header";
import { useAuth } from "../../context/AuthContext";
import { FiX } from "react-icons/fi";

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
}

const tabs = [
  { key: "description", label: "Descripción" },
  { key: "additional", label: "Información adicional" },
  { key: "reviews", label: "Reseñas" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// Utilidad para manejar carrito en localStorage
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

const ProductoDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const producto = state as Producto;
  const { user, isAuthenticated } = useAuth();

  const reviews = producto.comentariosAprobados || [];

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.calificacion, 0) /
      reviews.length
    : 0;

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
    const carrito = getCarrito();
    setEnCarrito(
      carrito.some((p: any) => p.idproducto === producto.idproducto)
    );
    // Escucha cambios globales del carrito (por si hay edición en otro tab)
    const onCarrito = () => {
      const nuevoCarrito = getCarrito();
      setEnCarrito(
        nuevoCarrito.some((p: any) => p.idproducto === producto.idproducto)
      );
    };
    window.addEventListener("carrito-updated", onCarrito);
    return () => window.removeEventListener("carrito-updated", onCarrito);
    // eslint-disable-next-line
  }, [producto.idproducto]);

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
      const { data } = await axios.post(
        `http://localhost:8080/api/comentarios/crear`,
        {
          descripcion: opinionText.trim(),
          calificacion: rating,
          iduser: user?.iduser,
          idproducto: producto.idproducto,
        }
      );
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
    } catch (err: any) {
      swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!producto) {
    return (
      <div className="p-8 text-center">
        <p>Producto no encontrado.</p>
        <button
          className="mt-4 px-4 py-2 bg-gray-200 rounded cursor-pointer"
          onClick={() => navigate("/")}
        >
          Volver
        </button>
      </div>
    );
  }

  const hasStock = producto.stock > 0;
  const showOpinionButton = isAuthenticated && user?.rol.idrol === 2;

  // Acción añadir/quitar del carrito
  const handleCarrito = () => {
    let carrito = getCarrito();
    if (enCarrito) {
      carrito = carrito.filter(
        (p: any) => p.idproducto !== producto.idproducto
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
      // Solo guardar campos esenciales + imagen principal
      const productoSimplificado = {
        idproducto: producto.idproducto,
        nombre: producto.nombre,
        cantidad: 1,
        precio: producto.precio,
        imagen: producto.imagenesNombres[0] || "", // Agregar imagen principal
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-[1350px] mx-auto">
        <button
          className="mb-4 text-blue-500 hover:underline flex items-center cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
            {/* Contenedor principal de imagen */}
            <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
              <img
                src={`http://localhost:8080/uploads/${encodeURIComponent(
                  producto.imagenesNombres[selectedImage]
                )}`}
                alt={producto.nombre}
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setLoaded(true)}
              />
            </div>
            {/* Miniaturas */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {producto.imagenesNombres.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all cursor-pointer ${
                    i === selectedImage
                      ? "ring-4 ring-indigo-500"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={`http://localhost:8080/uploads/${encodeURIComponent(
                      img
                    )}`}
                    alt={`Vista ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Detalles del producto */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {producto.nombre}
            </h1>
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) =>
                  i < Math.round(averageRating) ? (
                    <FaStar key={i} className="w-5 h-5" />
                  ) : (
                    <FaRegStar key={i} className="w-5 h-5" />
                  )
                )}
              </div>
              <span className="text-sm text-gray-500">
                ({reviews.length} reseñas)
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              S/ {producto.precio.toFixed(2)}
            </div>
            {/* Stock y metadatos */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hasStock
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {hasStock ? "En stock" : "Agotado"}
                </span>
                <span className="text-sm text-gray-500">
                  {producto.stock} unidades
                </span>
              </div>
              <button
                className={`w-full flex justify-between items-center p-4 bg-white rounded-xl hover:bg-gray-50 transition cursor-pointer ${
                  isDetailsOpen ? "bg-gray-50" : ""
                }`}
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                <span className="font-medium">Metadatos del producto</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
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
                <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Marca</p>
                    <p className="font-medium">{producto.nombreMarca}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="font-medium">{producto.nombreCategoria}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Botones de acción */}
            <div className="flex gap-4">
              <button
                className={`flex-1 flex items-center justify-center py-4 px-6 rounded-xl transition cursor-pointer ${
                  hasStock
                    ? enCarrito
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!hasStock}
                onClick={handleCarrito}
              >
                {enCarrito ? (
                  <>
                    <FaTrashAlt className="mr-2" /> Quitar del carrito
                  </>
                ) : (
                  <>
                    <FaCartPlus className="mr-2" /> Añadir al carrito
                  </>
                )}
              </button>
              {showOpinionButton && (
                <button
                  onClick={() => setIsOpinionModalOpen(true)}
                  className="py-4 px-6 rounded-xl bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                >
                  Escribir reseña
                </button>
              )}
            </div>
            {/* Info de envío */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3 p-4 bg-indigo-50 rounded-xl">
                <svg
                  className="w-5 h-5 text-indigo-600 mt-1"
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
                  <p className="font-medium text-indigo-600">
                    Envío rápido y seguro
                  </p>
                  <p className="text-sm text-gray-600">
                    Recibe tu producto en 24-48 horas con envío express
                    disponible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de pestañas */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex space-x-8 -mt-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Contenido de las pestañas */}
          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-600">{producto.descripcion}</p>
              </div>
            )}
            {activeTab === "additional" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Especificaciones técnicas
                </h3>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {producto.especificaciones.map((es, i) => (
                      <div key={i} className="py-2">
                        <dt className="text-sm font-medium text-gray-500">
                          {es.descripcion}
                        </dt>
                        <dd className="mt-1 text-gray-900">
                          {es.valor} {es.unidadmedida}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ¿Qué opinan nuestros clientes?
                  </h3>
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-8">
                    {reviews.map((c) => (
                      <div
                        key={c.idcomentario}
                        className="pb-8 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) =>
                              i < c.calificacion ? (
                                <FaStar key={i} className="w-5 h-5" />
                              ) : (
                                <FaRegStar key={i} className="w-5 h-5" />
                              )
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900">
                            {c.usuario.nombre} {c.usuario.apellido}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(c.fechacomentario)}
                          </span>
                        </div>
                        <div className="prose max-w-none">
                          <p className="text-gray-600 whitespace-pre-wrap">
                            {c.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Este producto aún no tiene reseñas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {/* Modal de opinión mejorado */}
      {isOpinionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[100vh] overflow-hidden flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h3 className="text-xl font-semibold">Escribe tu reseña</h3>
              <button
                onClick={() => setIsOpinionModalOpen(false)}
                className="cursor-pointer transition hover:scale-110"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <form
              onSubmit={handleSubmitOpinion}
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="space-y-6">
                <div className="mb-6 text-center">
                  <label className="block text-lg font-medium text-gray-800 mb-4">
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
                      >
                        {star <= (hoverRating || rating) ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-yellow-400 opacity-70" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {rating > 0
                      ? `Calificación: ${rating} estrella${
                          rating > 1 ? "s" : ""
                        }`
                      : "Selecciona una calificación"}
                  </p>
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-800 mb-3">
                    Comparte tu experiencia
                  </label>
                  <textarea
                    value={opinionText}
                    onChange={(e) => setOpinionText(e.target.value)}
                    rows={9}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="¿Qué te gustó o no te gustó del producto? ¿Lo recomendarías?"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Tu reseña será revisada antes de publicarse
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpinionModalOpen(false);
                    setRating(0);
                  }}
                  className="px-6 py-3 rounded-xl transition cursor-pointer bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-xl transition cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md ${
                    isSubmitting ? "opacity-70" : ""
                  }`}
                >
                  {isSubmitting ? "Enviando..." : "Enviar reseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoDetails;
