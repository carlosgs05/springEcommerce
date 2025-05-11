import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header";
import Footer from "../Footer";
import { useNavigate, useLocation } from "react-router-dom";

const Tienda = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(
    null
  );
  const [selectedMarca, setSelectedMarca] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [openSections, setOpenSections] = useState({
    categoria: true,
    smarca: true,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // 1) Cargo categorías y marcas
  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, marRes] = await Promise.all([
          axios.get("http://localhost:8080/api/categorias/listar"),
          axios.get("http://localhost:8080/api/marcas/listar"),
        ]);
        setCategorias(catRes.data.data);
        setMarcas(marRes.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  // 2) Cada vez que cambia la URL (query) leo filtros y recargo productos
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("categoria");
    const mar = params.get("marca");
    const catId = cat ? Number(cat) : null;
    const marId = mar ? Number(mar) : null;

    setSelectedCategoria(catId);
    setSelectedMarca(marId);

    const fetchProductos = async () => {
      try {
        const query: any = {};
        if (catId !== null) query.categoria = catId;
        if (marId !== null) query.marca = marId;
        const endpoint =
          Object.keys(query).length > 0
            ? "http://localhost:8080/api/productos/filtrar"
            : "http://localhost:8080/api/productos/listarAll";
        const resp = await axios.get(endpoint, { params: query });
        setProductos(resp.data.data);
        // al recargar productos, volvemos arriba
        window.scrollTo(0, 0);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProductos();
  }, [location.search]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // 3) Handlers que actualizan URL y hacen scroll al top
  const handleCategoriaChange = (idcategoria: number) => {
    const params = new URLSearchParams(location.search);
    if (selectedCategoria === idcategoria) {
      params.delete("categoria");
    } else {
      params.set("categoria", idcategoria.toString());
    }
    navigate(
      { pathname: "/tienda", search: params.toString() },
      { replace: true }
    );
    window.scrollTo(0, 0);
  };

  const handleMarcaChange = (idmarca: number) => {
    const params = new URLSearchParams(location.search);
    if (selectedMarca === idmarca) {
      params.delete("marca");
    } else {
      params.set("marca", idmarca.toString());
    }
    navigate(
      { pathname: "/tienda", search: params.toString() },
      { replace: true }
    );
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-14">
          <div className="relative z-10 flex items-baseline justify-between pt-6 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-extrabold text-gray-900">Tienda</h1>
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"
                />
              </svg>
            </button>
          </div>

          <section className="pt-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
              {/* Filtros móviles */}
              {showMobileFilters && (
                <div className="lg:hidden">
                  <div className="fixed inset-0 bg-black/25 z-40" />
                  <div className="relative z-50 bg-white p-4 h-full overflow-y-auto border-r border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        Filtros
                      </h2>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="text-gray-400 hover:text-gray-500 cursor-pointer"
                      >
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    {/* Categorías */}
                    <div className="border-b border-gray-200 py-6">
                      <button
                        className="flex w-full justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                        onClick={() => toggleSection("categoria")}
                      >
                        <span className="font-medium text-gray-900">
                          Categorías
                        </span>
                        <span>{openSections.categoria ? "-" : "+"}</span>
                      </button>
                      {openSections.categoria && (
                        <div className="pt-6 space-y-4">
                          {categorias.map((c) => (
                            <label
                              key={c.idcategoria}
                              className="flex items-center"
                            >
                              <input
                                type="radio"
                                checked={selectedCategoria === c.idcategoria}
                                onChange={() =>
                                  handleCategoriaChange(c.idcategoria)
                                }
                                className="h-4 w-4 text-blue-600 cursor-pointer"
                              />
                              <span className="ml-3 text-sm text-gray-600">
                                {c.nombre}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Marcas */}
                    <div className="border-b border-gray-200 py-6">
                      <button
                        className="flex w-full justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                        onClick={() => toggleSection("smarca")}
                      >
                        <span className="font-medium text-gray-900">
                          Marcas
                        </span>
                        <span>{openSections.smarca ? "-" : "+"}</span>
                      </button>
                      {openSections.smarca && (
                        <div className="pt-6 space-y-4">
                          {marcas.map((m) => (
                            <label
                              key={m.idmarca}
                              className="flex items-center"
                            >
                              <input
                                type="radio"
                                checked={selectedMarca === m.idmarca}
                                onChange={() => handleMarcaChange(m.idmarca)}
                                className="h-4 w-4 text-blue-600 cursor-pointer"
                              />
                              <span className="ml-3 text-sm text-gray-600">
                                {m.nombre}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => navigate("/tienda")}
                      className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Filtros escritorio */}
              <form className="hidden lg:block space-y-10 divide-y divide-gray-200">
                <div className="pt-4">
                  <div className="border-b border-gray-200 py-6">
                    <button
                      className="flex w-full justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                      onClick={() => toggleSection("categoria")}
                    >
                      <span className="font-medium text-gray-900">
                        Categorías
                      </span>
                      <span>{openSections.categoria ? "-" : "+"}</span>
                    </button>
                    {openSections.categoria && (
                      <div className="pt-6 space-y-4">
                        {categorias.map((c) => (
                          <label
                            key={c.idcategoria}
                            className="flex items-center"
                          >
                            <input
                              type="radio"
                              checked={selectedCategoria === c.idcategoria}
                              onChange={() =>
                                handleCategoriaChange(c.idcategoria)
                              }
                              className="h-4 w-4 text-blue-600 cursor-pointer"
                            />
                            <span className="ml-3 text-sm text-gray-600">
                              {c.nombre}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-b border-gray-200 py-6">
                    <button
                      className="flex w-full justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                      onClick={() => toggleSection("smarca")}
                    >
                      <span className="font-medium text-gray-900">Marcas</span>
                      <span>{openSections.smarca ? "-" : "+"}</span>
                    </button>
                    {openSections.smarca && (
                      <div className="pt-6 space-y-4">
                        {marcas.map((m) => (
                          <label key={m.idmarca} className="flex items-center">
                            <input
                              type="radio"
                              checked={selectedMarca === m.idmarca}
                              onChange={() => handleMarcaChange(m.idmarca)}
                              className="h-4 w-4 text-blue-600 cursor-pointer"
                            />
                            <span className="ml-3 text-sm text-gray-600">
                              {m.nombre}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/tienda");
                    }}
                    className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </form>

              {/* Productos */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {productos.length > 0 ? (
                    productos.map((producto) => (
                      <div
                        key={producto.idproducto}
                        className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square overflow-hidden"
                      >
                        <div className="h-1/2 relative overflow-hidden">
                          <img
                            src={`http://localhost:8080/uploads/${producto.imagenesNombres[0]}`}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-30" />
                        </div>
                        <div className="h-1/2 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/tienda/producto/${producto.idproducto}`,
                                    { state: producto }
                                  )
                                }
                                className="hover:text-blue-600 focus:outline-none text-left w-full cursor-pointer"
                              >
                                {producto.nombre}
                              </button>
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                              {producto.descripcion}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-1 mx-2">
                            <p className="mt-1 font-bold text-blue-600 text-lg">
                              S/ {producto.precio.toFixed(2)}
                            </p>
                            <button
                              onClick={() =>
                                navigate(`/tienda/producto/${producto.idproducto}`, {
                                  state: producto,
                                })
                              }
                              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium cursor-pointer"
                            >
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 col-span-full">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No se encontraron productos
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Intenta con otros filtros de búsqueda
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tienda;
