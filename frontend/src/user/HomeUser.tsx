// src/pages/HomeUser.tsx
import { JSX, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaMobileAlt,
  FaLaptop,
  FaTv,
  FaHeadphones,
  FaTag,
  FaClock,
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
}

const HomeUser = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const [activeBanner, setActiveBanner] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(60 * 60 * 6);
  const navigate = useNavigate();

  const categoryIcons: Record<string, JSX.Element> = {
    Smartphones: <FaMobileAlt />,
    Laptops: <FaLaptop />,
    Televisores: <FaTv />,
    Accesorios: <FaHeadphones />,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, marRes] = await Promise.all([
          axios.get("http://localhost:8080/api/productos/listarAll"),
          axios.get("http://localhost:8080/api/categorias/listar"),
          axios.get("http://localhost:8080/api/marcas/listar"),
        ]);
        if (prodRes.data.success) {
          const data: Producto[] = prodRes.data.data;
          setProductos(data);
          const urls = data
            .filter((p) => p.imagenesNombres.length > 0)
            .slice(0, 3)
            .map(
              (p) =>
                `http://localhost:8080/uploads/${encodeURIComponent(
                  p.imagenesNombres[0]
                )}`
            );
          setBanners(urls);
        }
        if (catRes.data.success) setCategorias(catRes.data.data);
        if (marRes.data.success) setMarcas(marRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const nuevosLanzamientos = [...productos]
    .sort(
      (a, b) =>
        new Date(b.fechacreacion).getTime() -
        new Date(a.fechacreacion).getTime()
    )
    .slice(0, 6);

  const ofertasRelampago = [...productos]
    .filter((p) => p.precio < 500)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* Carrusel principal */}
      <section className="relative w-full h-[420px] sm:h-[480px] overflow-hidden">
        {banners.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Banner ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === activeBanner ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBanner(idx)}
              className={`w-3 h-3 rounded-full ${
                idx === activeBanner ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Ofertas Relámpago */}
      <section className="py-10 px-4 sm:px-6 lg:px-12 bg-white text-center">
        <h2 className="text-2xl font-bold text-yellow-700 mb-1 flex justify-center items-center gap-2">
          <FaClock /> Ofertas Relámpago
        </h2>
        <p className="text-lg font-medium text-gray-600 mb-6">
          Termina en{" "}
          <span className="font-mono text-red-600 text-2xl">
            {formatTime(countdown)}
          </span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {ofertasRelampago.map((producto) => (
            <div
              key={producto.idproducto}
              className="bg-gray-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition aspect-square w-full h-full max-w-[260px] mx-auto flex flex-col justify-between"
            >
              <div>
                <h3 className="text-md font-bold text-gray-800 truncate">
                  {producto.nombre}
                </h3>
                {producto.imagenesNombres.length > 0 && (
                  <img
                    src={`http://localhost:8080/uploads/${encodeURIComponent(
                      producto.imagenesNombres[0]
                    )}`}
                    alt={producto.nombre}
                    className="w-full h-36 object-cover rounded mt-2 mb-2"
                  />
                )}
                <p className="text-sm text-gray-500 truncate">
                  {producto.descripcion}
                </p>
              </div>
              <div className="text-blue-600 font-bold text-md mt-2">
                S/ {producto.precio}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nuevos Lanzamientos */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Nuevos Lanzamientos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-9">
          {nuevosLanzamientos.map((producto) => (
            <div
              key={producto.idproducto}
              className="w-[360px] h-[360px] bg-white rounded-2xl shadow hover:shadow-md mx-auto p-4 flex flex-col justify-between"
            >
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight">
                  {producto.nombre}
                </h3>

                {producto.imagenesNombres.length > 0 && (
                  <img
                    src={`http://localhost:8080/uploads/${encodeURIComponent(
                      producto.imagenesNombres[0]
                    )}`}
                    alt={producto.nombre}
                    className="w-full h-40 object-cover mt-2 rounded"
                  />
                )}

                <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-snug">
                  {producto.descripcion}
                </p>
              </div>

              <div className="mt-3">
                <p className="text-indigo-600 font-semibold text-lg">
                  S/ {producto.precio}
                </p>
                <button
                  className="w-full bg-blue-600 text-white py-2 mt-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                  onClick={() =>
                    navigate(`/tienda/producto/${producto.idproducto}`, {
                      state: producto,
                    })
                  }
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías Populares */}
      <section className="py-10 px-4 sm:px-6 lg:px-12 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Categorías Populares
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categorias.map((cat) => (
            <div
              key={cat.idcategoria}
              onClick={() => navigate(`/tienda?categoria=${cat.idcategoria}`)}
              className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <div className="text-3xl text-indigo-500">
                {categoryIcons[cat.nombre] || <FaTag />}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{cat.nombre}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marcas - estilo Samsung One UI */}
      <section className="py-10 px-4 sm:px-6 lg:px-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Marcas</h2>
        <div className="flex flex-wrap gap-4 justify-start">
          {marcas.map((marca) => (
            <div
              key={marca.idmarca}
              className="bg-white border border-indigo-200 text-indigo-600 font-semibold px-6 py-3 rounded-full shadow hover:bg-indigo-100 hover:text-indigo-800 transition cursor-pointer"
            >
              {marca.nombre}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeUser;
