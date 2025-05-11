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
        const [prodRes, catRes, marcasRes] = await Promise.all([
          axios.get("http://localhost:8080/api/productos/listarAll"),
          axios.get("http://localhost:8080/api/categorias/listar"),
          axios.get("http://localhost:8080/api/marcas/listar"),
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
          // Precarga de imágenes
          marcasData.forEach((m) => {
            new Image().src = `http://localhost:8080/uploads/${m.imagen}`;
          });
          setMarcas(marcasData);
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
      <section className="mx-auto max-w-8xl px-12 py-12">
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
      <section className="mx-auto max-w-8xl px-12 py-8 pb-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-800 text-xl sm:text-2xl font-bold flex items-center">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="mt-1 font-semibold text-blue-600">
                  S/ {p.precio.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MARCAS */}
      <section className="mx-auto max-w-8xl px-12 py-8">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
      <Footer />
    </div>
  );
};

export default HomeUser;
