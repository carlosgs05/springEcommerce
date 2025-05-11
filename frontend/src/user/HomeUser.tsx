import { JSX, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaMobileAlt,
  FaLaptop,
  FaTv,
  FaHeadphones,
  FaTag,
  FaFire,
  FaBoxOpen,
  FaAngleRight,
  FaPrint,
  FaStar,
  FaTruck,
  FaCreditCard,
  FaHeadset,
  FaAward,
} from "react-icons/fa";
import Footer from "./Footer";
import Header from "./Header";

interface Especificacion {
  unidadmedida: string;
  valor: number;
  descripcion: string;
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
  fechacreacion: string;
}

interface Categoria {
  idcategoria: number;
  nombre: string;
}

interface Marca {
  idmarca: number;
  nombre: string;
  imagen: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Usuario {
  iduser: number;
  apellido: string;
  correo: string;
  nombre: string;
}

interface Testimonio {
  idtestimonio: number;
  descripcion: string;
  estado: number;
  fechatestimonio: string;
  usuario: Usuario;
}

const HomeUser = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const [activeBanner, setActiveBanner] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [activeTestimonio, setActiveTestimonio] = useState<number>(0);
  const navigate = useNavigate();

  const categoryIcons: Record<string, JSX.Element> = {
    Celulares: <FaMobileAlt />,
    Laptops: <FaLaptop />,
    Televisores: <FaTv />,
    Impresoras: <FaPrint />,
    Accesorios: <FaHeadphones />,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, marcasRes, testimoniosRes] = await Promise.all([
          axios.get("http://localhost:8080/api/productos/listarAll"),
          axios.get("http://localhost:8080/api/categorias/listar"),
          axios.get("http://localhost:8080/api/marcas/listar"),
          axios.get("http://localhost:8080/api/testimonios/estado/1"),
        ]);

        if (prodRes.data.success) {
          const data: Producto[] = prodRes.data.data;
          setProductos(data);
          setBanners(
            data
              .filter((p) => p.imagenesNombres.length > 0)
              .slice(0, 3)
              .map(
                (p) => `http://localhost:8080/uploads/${p.imagenesNombres[0]}`
              )
          );
        }
        if (catRes.data.success) {
          setCategorias(catRes.data.data);
        }
        if (marcasRes.data.success) {
          const marcasData: Marca[] = marcasRes.data.data;
          marcasData.forEach((m) => {
            new Image().src = `http://localhost:8080/uploads/${m.imagen}`;
          });
          setMarcas(marcasData);
        }
        if (testimoniosRes.data.success) {
          setTestimonios(testimoniosRes.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const id = setInterval(() => {
      setActiveBanner((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners]);

  useEffect(() => {
    if (testimonios.length > 0) {
      const interval = setInterval(() => {
        setActiveTestimonio((prev) => (prev + 1) % testimonios.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [testimonios]);

  useEffect(() => {
    const target = new Date("2025-05-17T00:00:00");
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target.getTime() - now);
      const secs = Math.floor(diff / 1000);
      setTimeLeft({
        days: Math.floor(secs / 86400),
        hours: Math.floor((secs % 86400) / 3600),
        minutes: Math.floor((secs % 3600) / 60),
        seconds: secs % 60,
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const ofertasRelampago = [...productos]
    .filter((p) => p.precio < 500)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const featuredCategories = categorias.slice(0, 4);

  const benefits = [
    {
      id: 1,
      icon: <FaTruck className="text-4xl" />,
      title: "Envío Rápido",
      description:
        "Entrega garantizada en 24-48 horas a las principales ciudades del país.",
    },
    {
      id: 2,
      icon: <FaCreditCard className="text-4xl" />,
      title: "Pagos Seguros",
      description:
        "Múltiples métodos de pago con la más alta seguridad y encriptación.",
    },
    {
      id: 3,
      icon: <FaHeadset className="text-4xl" />,
      title: "Soporte 24/7",
      description:
        "Atención al cliente disponible todos los días a cualquier hora.",
    },
    {
      id: 4,
      icon: <FaAward className="text-4xl" />,
      title: "Garantía Extendida",
      description:
        "Todos nuestros productos incluyen garantía superior a la del mercado.",
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen w-full">
      <Header />

      {/* HERO */}
      <section className="relative h-96 w-full overflow-hidden">
        {banners.map((src, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 ${
              idx === activeBanner ? "opacity-100" : "opacity-0"
            } transition-opacity duration-1000`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center">
              <div className="max-w-8xl mx-auto px-12 text-white w-full">
                <h2 className="text-4xl font-bold mb-2">
                  Tecnología de Vanguardia
                </h2>
                <p className="mb-4">Descubre lo último en electrónica</p>
                <button
                  onClick={() => navigate("/tienda")}
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg cursor-pointer"
                >
                  Explorar Productos
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-8xl px-12 -mt-12 z-10 relative grid grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredCategories.map((cat) => (
          <div
            key={cat.idcategoria}
            onClick={() => navigate(`/tienda?categoria=${cat.idcategoria}`)}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center"
          >
            <div className="text-3xl text-blue-600 mb-2">
              {categoryIcons[cat.nombre] || <FaTag />}
            </div>
            <span className="text-gray-800">{cat.nombre}</span>
          </div>
        ))}
      </section>

      {/* OFERTAS RELÁMPAGO */}
      <section className="mx-auto max-w-8xl px-12 pt-12 pb-5 bg-gray-50">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>

          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <FaFire className="text-white text-4xl" />
              <div>
                <h2 className="text-white text-2xl font-bold">
                  Ofertas Relámpago
                </h2>
                <p className="text-white/90 text-sm">
                  ¡Solo hasta el <strong>17 mayo 2025</strong>!
                </p>
              </div>
            </div>
            <div className="flex gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-3">
              {["days", "hours", "minutes", "seconds"].map((u, i) => {
                const v = (timeLeft as any)[u].toString().padStart(2, "0");
                const l =
                  u === "days"
                    ? "Días"
                    : u === "hours"
                    ? "Horas"
                    : u === "minutes"
                    ? "Min"
                    : "Seg";
                return (
                  <div key={i} className="text-center text-white">
                    <div className="text-xl sm:text-2xl font-bold">{v}</div>
                    <div className="text-xs">{l}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {ofertasRelampago.map((p) => (
              <div
                key={p.idproducto}
                onClick={() =>
                  navigate(`/tienda/producto/${p.idproducto}`, { state: p })
                }
                className="bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="h-36 bg-gray-50 overflow-hidden">
                  <img
                    src={`http://localhost:8080/uploads/${
                      p.imagenesNombres[0] || ""
                    }`}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-gray-800 font-semibold truncate">
                    {p.nombre}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {p.descripcion}
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-400 line-through">
                      S/ {(p.precio * 1.2).toFixed(2)}
                    </span>
                    <span className="font-bold text-red-500">
                      S/ {p.precio.toFixed(2)}
                    </span>
                    <FaAngleRight className="text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTROS PRODUCTOS */}
      <section className="mx-auto max-w-8xl px-12 py-8 pb-16 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-800 text-xl sm:text-2xl font-bold flex items-center pb-4">
            <FaBoxOpen className="mr-2 text-blue-600" />
            Nuestros Productos
          </h2>
          <div
            onClick={() => navigate("/tienda")}
            className="text-blue-600 cursor-pointer flex items-center"
          >
            Ver catálogo completo <FaAngleRight className="ml-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.slice(0, 8).map((p) => (
            <div
              key={p.idproducto}
              onClick={() =>
                navigate(`/tienda/producto/${p.idproducto}`, { state: p })
              }
              className="bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer aspect-square flex flex-col"
            >
              <div className="h-1/2 bg-gray-50 overflow-hidden">
                <img
                  src={`http://localhost:8080/uploads/${
                    p.imagenesNombres[0] || ""
                  }`}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-2 flex-1 flex flex-col justify-between my-2">
                <h3 className="text-gray-800 text-lg font-medium truncate">
                  {p.nombre}
                </h3>
                <div className="mt-1 text-gray-500 text-base line-clamp-2">
                  {p.descripcion}
                </div>
                <div className="flex justify-between items-center mt-1 mx-2">
                  <p className="mt-1 font-bold text-blue-600 text-lg">
                    S/ {p.precio.toFixed(2)}
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/tienda/producto/${p.idproducto}`, {
                        state: p,
                      })
                    }
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium cursor-pointer"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="mx-auto max-w-8xl px-4 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-gray-900 to-stone-800 font-samsung-one">
        <h2 className="text-4xl font-bold text-white mb-12 text-center flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-indigo-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z" />
            <path
              d="M18.5 6.5C18.5 8.981 20.519 11 23 11s4.5-2.019 4.5-4.5S25.481 2 23 2s-4.5 2.019-4.5 4.5zM30 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z"
              opacity="0.4"
            />
          </svg>
          Experiencias de nuestros clientes
        </h2>

        <div className="relative group">
          {/* Navegación */}
          <button
            onClick={() =>
              setActiveTestimonio(
                (prev) => (prev - 1 + testimonios.length) % testimonios.length
              )
            }
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-700 hover:bg-indigo-600 transition-transform hover:scale-110 z-10"
          >
            <FaAngleRight className="rotate-180 text-xl text-white" />
          </button>

          <button
            onClick={() =>
              setActiveTestimonio((prev) => (prev + 1) % testimonios.length)
            }
            className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-700 hover:bg-indigo-600 transition-transform hover:scale-110 z-10"
          >
            <FaAngleRight className="text-xl text-white" />
          </button>

          <div className="relative bg-gradient-to-br from-gray-800 to-stone-700 rounded-3xl p-8 md:p-12 shadow-lg hover:shadow-2xl transition-shadow overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/20 rounded-tr-full pointer-events-none" />

            {testimonios.map((testimonio, index) => (
              <div
                key={testimonio.idtestimonio}
                className={`grid md:grid-cols-[auto_1fr] gap-8 items-center transition-opacity duration-500 ${
                  index === activeTestimonio
                    ? "opacity-100"
                    : "opacity-0 absolute"
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-indigo-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {testimonio.usuario.nombre[0]}
                    {testimonio.usuario.apellido[0]}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">
                      {testimonio.usuario.nombre} {testimonio.usuario.apellido}
                    </h3>
                    <div className="flex justify-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="w-5 h-5 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <svg
                    className="absolute -top-6 -left-6 w-12 h-12 text-indigo-600/40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M10 8H8a4 4 0 014-4v0a4 4 0 014 4v8a4 4 0 01-4 4H6" />
                    <path d="M16 8h2a4 4 0 00-4-4v0a4 4 0 00-4 4v8a4 4 0 004 4h6" />
                  </svg>
                  <p className="text-gray-300 text-lg text-center leading-relaxed italic mb-6 pl-12">
                    "{testimonio.descripcion}"
                  </p>
                </div>
              </div>
            ))}

            <div className="flex justify-center gap-2 mt-8">
              {testimonios.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonio(idx)}
                  className={`w-8 h-2 rounded-full transition-all duration-300 ${
                    idx === activeTestimonio
                      ? "bg-amber-500"
                      : "bg-gray-500 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARCAS */}
      <section className="mx-auto max-w-8xl px-12 py-12 bg-gray-50">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-gray-800 text-xl sm:text-2xl font-bold flex items-center">
            <FaTag className="text-blue-600 text-2xl mr-2" />
            Marcas Destacadas
          </h2>
          <div
            onClick={() => navigate("/tienda")}
            className="text-blue-600 cursor-pointer flex items-center"
          >
            Ver todas <FaAngleRight className="ml-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20">
          {marcas.map((marca) => (
            <div
              key={marca.idmarca}
              onClick={() => navigate(`/tienda?marca=${marca.idmarca}`)}
              className="group bg-gray-100 rounded-lg shadow-sm hover:shadow-md cursor-pointer overflow-hidden aspect-video"
            >
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={`http://localhost:8080/uploads/${marca.imagen}`}
                  alt={marca.nombre}
                  className="w-full h-full object-contain transition-opacity duration-300"
                  loading="lazy"
                  onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-brand.png";
                    e.currentTarget.classList.replace(
                      "object-contain",
                      "object-cover"
                    );
                  }}
                  style={{ opacity: 0 }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-16 bg-white">
        <div className="max-w-8xl mx-auto px-4 lg:px-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Beneficios de comprar con nosotros
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-16">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center"
              >
                <div className="text-cyan-400 mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeUser;
