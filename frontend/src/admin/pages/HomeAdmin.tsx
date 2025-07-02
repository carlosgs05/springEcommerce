import React, { useState } from "react";

const HomeAdmin: React.FC = () => {
  // Datos de ejemplo para las estadísticas
  const stats = [
    {
      title: "Productos Activos",
      value: 158,
      icon: "📱",
      color: "bg-blue-500 text-white",
      trend: "+12%",
    },
    {
      title: "Ventas Hoy",
      value: "₡1,240,500",
      icon: "💰",
      color: "bg-green-500 text-white",
      trend: "+8%",
    },
    {
      title: "Pedidos Pendientes",
      value: 24,
      icon: "📦",
      color: "bg-yellow-500 text-white",
      trend: "-3%",
    },
    {
      title: "Reseñas Nuevas",
      value: 12,
      icon: "⭐",
      color: "bg-purple-500 text-white",
      trend: "+5%",
    },
  ];

  // Datos de ejemplo para productos más vendidos
  const topProducts = [
    {
      id: 1,
      name: "Samsung Galaxy S23",
      category: "Smartphones",
      sales: 128,
      revenue: "₡64,800,000",
    },
    {
      id: 2,
      name: "Apple iPhone 15 Pro",
      category: "Smartphones",
      sales: 98,
      revenue: "₡73,500,000",
    },
    {
      id: 3,
      name: "Xiaomi Redmi Note 12",
      category: "Smartphones",
      sales: 76,
      revenue: "₡22,800,000",
    },
    {
      id: 4,
      name: "Samsung Galaxy Watch 6",
      category: "Wearables",
      sales: 52,
      revenue: "₡20,800,000",
    },
  ];

  // Datos de ejemplo para reseñas pendientes
  const pendingReviews = [
    {
      id: 1,
      product: "Samsung Galaxy S23",
      user: "Carlos Vargas",
      rating: 4,
      date: "2023-10-15",
      excerpt:
        "Excelente teléfono, pero la batería podría durar más. La cámara es impresionante, especialmente en modo nocturno.",
      status: "pending",
    },
    {
      id: 2,
      product: "Apple iPhone 15 Pro",
      user: "María Rodríguez",
      rating: 5,
      date: "2023-10-14",
      excerpt:
        "¡Increíble cámara! La mejor compra que he hecho este año. El rendimiento es excepcional y la pantalla es increíble.",
      status: "pending",
    },
    {
      id: 3,
      product: "Xiaomi Redmi Note 12",
      user: "Luis González",
      rating: 3,
      date: "2023-10-13",
      excerpt:
        "Bueno por el precio, aunque el rendimiento no es el mejor para juegos pesados. La batería dura bastante.",
      status: "pending",
    },
    {
      id: 4,
      product: "Samsung Galaxy Watch 6",
      user: "Ana Pérez",
      rating: 4,
      date: "2023-10-12",
      excerpt:
        "Muy útil para monitorear mi salud durante mis entrenamientos. La autonomía podría ser mejor, pero cumple su función.",
      status: "pending",
    },
  ];

  // Datos de ejemplo para métodos de envío
  const shippingMethods = [
    {
      id: 1,
      name: "Envío Express",
      provider: "Correos de Costa Rica",
      cost: "₡3,500",
      deliveryTime: "24-48 horas",
      status: "active",
      coverage: "Todo el país",
    },
    {
      id: 2,
      name: "Envío Estándar",
      provider: "Correos de Costa Rica",
      cost: "₡1,800",
      deliveryTime: "3-5 días",
      status: "active",
      coverage: "Todo el país",
    },
    {
      id: 3,
      name: "Recogida en Tienda",
      provider: "Auto-servicio",
      cost: "Gratis",
      deliveryTime: "Inmediato",
      status: "active",
      coverage: "San José",
    },
    {
      id: 4,
      name: "Envío Internacional",
      provider: "DHL",
      cost: "₡12,000",
      deliveryTime: "5-7 días",
      status: "inactive",
      coverage: "América",
    },
  ];

  // Estado para gestionar reseñas
  const [reviews, setReviews] = useState(pendingReviews);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);

  // Función para aprobar una reseña
  const approveReview = (id: number) => {
    setReviews(
      reviews.map((review) =>
        review.id === id ? { ...review, status: "approved" } : review
      )
    );
  };

  // Función para rechazar una reseña
  const rejectReview = (id: number) => {
    setReviews(
      reviews.map((review) =>
        review.id === id ? { ...review, status: "rejected" } : review
      )
    );
  };

  // Función para alternar la vista expandida de una reseña
  const toggleReview = (id: number) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bienvenido, Administrador
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          Este es tu panel de control. Desde aquí podrás gestionar productos,
          reseñas, envíos y todas las funcionalidades de la plataforma.
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-5 border border-gray-100 transition-all hover:shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                  {stat.title}
                </p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
                <span className="text-xs font-medium text-green-500 mt-1 block">
                  {stat.trend}
                </span>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos y contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Gráfico de ventas */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Ventas Mensuales
            </h2>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer px-3 py-1 bg-blue-50 rounded-md transition">
              Ver reporte completo
            </button>
          </div>

          {/* Placeholder de gráfico */}
          <div className="relative">
            <div className="flex items-end h-52 space-x-1">
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg"
                  style={{ height: "40%" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">Lun</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg"
                  style={{ height: "60%" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">Mar</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg"
                  style={{ height: "75%" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">Mié</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg"
                  style={{ height: "90%" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">Jue</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg"
                  style={{ height: "65%" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">Vie</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg"
                  style={{ height: "45%" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">Sáb</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg"
                  style={{ height: "30%" }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">Dom</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
          </div>

          <div className="flex justify-between mt-4">
            <div>
              <p className="text-gray-500 text-xs">Ventas totales</p>
              <p className="text-lg font-bold">₡24,580,000</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs">
                Comparado con el mes pasado
              </p>
              <p className="text-lg font-bold text-green-500">+15.2%</p>
            </div>
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Productos Más Vendidos
            </h2>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer px-3 py-1 bg-blue-50 rounded-md transition">
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800 text-sm">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{product.sales} ventas</p>
                  <p className="text-xs text-gray-500">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gestión de reseñas y métodos de envío */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Gestión de Reseñas */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Reseñas Pendientes
            </h2>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer px-3 py-1 bg-blue-50 rounded-md transition">
              Ver todas las reseñas
            </button>
          </div>

          <div className="space-y-3">
            {reviews
              .filter((r) => r.status === "pending")
              .map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white transition hover:shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm">
                        {review.product}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Por: {review.user}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-sm">
                        {"★".repeat(review.rating)}
                      </span>
                      <span className="text-gray-300 text-sm">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-gray-600 text-sm">
                      {expandedReview === review.id
                        ? review.excerpt
                        : `${review.excerpt.substring(0, 80)}...`}
                    </p>
                    <button
                      onClick={() => toggleReview(review.id)}
                      className="text-blue-500 text-xs mt-1 hover:text-blue-700 cursor-pointer"
                    >
                      {expandedReview === review.id ? "Ver menos" : "Ver más"}
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">{review.date}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => approveReview(review.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-xs cursor-pointer"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => rejectReview(review.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-xs cursor-pointer"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Gestión de Métodos de Envío */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Métodos de Envío
            </h2>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer px-3 py-1 bg-blue-50 rounded-md transition">
              Gestionar métodos
            </button>
          </div>

          <div className="space-y-3">
            {shippingMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border ${
                  method.status === "active"
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                } transition hover:shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm flex items-center">
                      {method.name}
                      {method.status === "active" ? (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">{method.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{method.cost}</p>
                    <p className="text-xs text-gray-500">
                      {method.deliveryTime}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-3 items-center">
                  <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-lg w-8 h-8" />
                    <div className="ml-2">
                      <span className="text-xs text-gray-500">Cobertura</span>
                      <p className="text-xs font-medium">{method.coverage}</p>
                    </div>
                  </div>

                  <button className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition text-xs cursor-pointer">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;
