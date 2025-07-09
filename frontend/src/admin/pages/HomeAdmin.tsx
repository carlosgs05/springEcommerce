import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiShoppingBag,
  FiPackage,
  FiStar,
  FiMessageSquare,
  FiTruck,
  FiCreditCard,
} from "react-icons/fi";

const HomeAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [stats, setStats] = useState({
    productos: { total: 0, suficiente: 0, bajo: 0 },
    pedidosPendientes: 0,
    reseñasPendientes: 0,
    testimoniosPendientes: 0,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          stockRes, 
          reviewsRes, 
          testimonialsRes, 
          pagosRes, 
          enviosRes,
          pedidosPendientesRes
        ] = await Promise.all([
          axios.get("http://localhost:8080/api/productos/estadisticas-stock"),
          axios.get("http://localhost:8080/api/comentarios/pendientes/count"),
          axios.get("http://localhost:8080/api/testimonios/pendientes/count"),
          axios.get("http://localhost:8080/api/metodopago/primeros"),
          axios.get("http://localhost:8080/api/metodoenvio/primeros"),
          axios.get("http://localhost:8080/api/pedidos/por-estado?estado=0")
        ]);

        setStats({
          productos: stockRes.data.data,
          pedidosPendientes: pedidosPendientesRes.data.count,
          reseñasPendientes: reviewsRes.data.count,
          testimoniosPendientes: testimonialsRes.data.count,
          loading: false,
          error: null,
        });

        setPaymentMethods(pagosRes.data.data);
        setShippingMethods(enviosRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: "Error al cargar datos estadísticos",
        }));
      }
    };
    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Productos",
      value: stats.productos.total,
      icon: <FiShoppingBag className="text-xl" />,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      url: "/admin/productos",
      details: [
        {
          label: "Suficiente",
          value: stats.productos.suficiente,
          color: "text-green-500",
        },
        { label: "Bajo", value: stats.productos.bajo, color: "text-amber-500" },
      ],
    },
    {
      title: "Pedidos Pendientes",
      value: stats.pedidosPendientes,
      icon: <FiPackage className="text-xl" />,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      url: "/admin/pedidos",
    },
    {
      title: "Reseñas Nuevas",
      value: stats.reseñasPendientes,
      icon: <FiStar className="text-xl" />,
      color: "bg-gradient-to-r from-amber-500 to-yellow-500",
      url: "/admin/reviews_productos",
    },
    {
      title: "Testimonios Nuevos",
      value: stats.testimoniosPendientes,
      icon: <FiMessageSquare className="text-xl" />,
      color: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
      url: "/admin/testimonios",
    },
  ];

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl shadow-sm">
              <FiShoppingBag className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">
                    {stat.title.split(" ").map((word, i) => (
                      <div key={i} className="block">
                        {word}
                      </div>
                    ))}
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                  {stat.details ? (
                    <div className="mt-2 grid grid-cols-3 gap-y-4 gap-x-16">
                      {stat.details.map((detail, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-sm text-gray-500">
                            {detail.label}
                          </span>
                          <span
                            className={`text-base font-medium ${detail.color}`}
                          >
                            {detail.value}
                          </span>
                        </div>
                      ))}
                      <div>
                        <button
                          onClick={() => navigate(stat.url)}
                          className="text-sm font-medium text-green-500 mt-4 block cursor-pointer hover:underline"
                        >
                          Gestionar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(stat.url)}
                      className="text-sm font-medium text-green-500 mt-4 block cursor-pointer hover:underline"
                    >
                      Gestionar
                    </button>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 max-h-[520px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiCreditCard className="text-blue-500" />
                  Métodos de Pago
                </h2>
                <p className="text-sm text-gray-500">
                  Opciones de pago disponibles
                </p>
              </div>
              <button className="text-xs font-medium bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 hover:text-blue-800 cursor-pointer px-3 py-1.5 rounded-xl transition">
                Gestionar métodos
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto">
              {paymentMethods.map((m) => (
                <div
                  key={m.idMetodoPago}
                  className={`p-4 rounded-xl border ${
                    m.activo
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h3 className="font-medium text-gray-800 text-sm">
                    {m.nombre}
                    {m.activo ? (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{m.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 max-h-[520px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiTruck className="text-blue-500" />
                  Métodos de Envío
                </h2>
                <p className="text-sm text-gray-500">
                  Opciones de entrega disponibles
                </p>
              </div>
              <button className="text-xs font-medium bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 hover:text-blue-800 cursor-pointer px-3 py-1.5 rounded-xl transition">
                Gestionar métodos
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto pr-1">
              {shippingMethods.map((m) => (
                <div
                  key={m.idMetodoEnvio}
                  className={`p-4 rounded-xl border ${
                    m.estado
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h3 className="font-medium text-gray-800 text-sm">
                    {m.nombre}
                    {m.estado ? (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{m.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Costo: S/ {parseFloat(m.costo).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tiempo estimado: {m.tiempoEstimado}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;
