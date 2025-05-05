import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Header";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";

const Tienda = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();

  const [openSections, setOpenSections] = useState({
    categoria: true,
    smarca: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoriaChange = (idcategoria: number) => {
    setSelectedCategoria(prev => prev === idcategoria ? null : idcategoria);
  };

  const handleMarcaChange = (idmarca: number) => {
    setSelectedMarca(prev => prev === idmarca ? null : idmarca);
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const params: any = {};
        if (selectedCategoria !== null) params.categoria = selectedCategoria;
        if (selectedMarca !== null) params.marca = selectedMarca;

        const endpoint = Object.keys(params).length > 0
          ? "http://localhost:8080/api/productos/filtrar"
          : "http://localhost:8080/api/productos/listarAll";

        const response = await axios.get(endpoint, { params });
        setProductos(response.data.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProductos();
  }, [selectedCategoria, selectedMarca]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, marRes] = await Promise.all([
          axios.get("http://localhost:8080/api/categorias/listar"),
          axios.get("http://localhost:8080/api/marcas/listar")
        ]);
        setCategorias(catRes.data.data);
        setMarcas(marRes.data.data);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };
    fetchInitialData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-14">
          <div className="relative z-10 flex items-baseline justify-between pt-6 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Tienda</h1>
            <button
              type="button"
              className="lg:hidden ml-2 inline-flex items-center p-2 rounded-md text-gray-500 hover:text-gray-700"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <span className="sr-only">Filtros</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          <section className="pt-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
              {/* Filtros móviles */}
              {showMobileFilters && (
                <div className="lg:hidden">
                  <div className="fixed inset-0 bg-black/25 z-40" />
                  <div className="relative z-50 bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
                      <button
                        type="button"
                        className="-mr-2 w-10 h-10 p-2 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-500"
                        onClick={() => setShowMobileFilters(false)}
                      >
                        <span className="sr-only">Cerrar menú</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="border-b border-gray-200 py-6">
                        <h3 className="-my-3 flow-root">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                            onClick={() => toggleSection("categoria")}
                          >
                            <span className="font-medium text-gray-900">Categorías</span>
                            <span className="ml-6 flex items-center">{openSections.categoria ? "-" : "+"}</span>
                          </button>
                        </h3>
                        {openSections.categoria && (
                          <div className="pt-6 space-y-4">
                            {categorias.map(cat => (
                              <div key={cat.idcategoria} className="flex items-center">
                                <input
                                  type="radio"
                                  checked={selectedCategoria === cat.idcategoria}
                                  onChange={() => handleCategoriaChange(cat.idcategoria)}
                                  className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label className="ml-3 text-sm text-gray-600">{cat.nombre}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-b border-gray-200 py-6">
                        <h3 className="-my-3 flow-root">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                            onClick={() => toggleSection("smarca")}
                          >
                            <span className="font-medium text-gray-900">Marcas</span>
                            <span className="ml-6 flex items-center">{openSections.smarca ? "-" : "+"}</span>
                          </button>
                        </h3>
                        {openSections.smarca && (
                          <div className="pt-6 space-y-4">
                            {marcas.map(mar => (
                              <div key={mar.idmarca} className="flex items-center">
                                <input
                                  type="radio"
                                  checked={selectedMarca === mar.idmarca}
                                  onChange={() => handleMarcaChange(mar.idmarca)}
                                  className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label className="ml-3 text-sm text-gray-600">{mar.nombre}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => { setSelectedCategoria(null); setSelectedMarca(null); }}
                      className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Filtros de escritorio */}
              <form className="hidden lg:block space-y-10 divide-y divide-gray-200">
                <div className="pt-4">
                  <div className="border-b border-gray-200 py-6">
                    <h3 className="-my-3 flow-root">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                        onClick={() => toggleSection("categoria")}
                      >
                        <span className="font-medium text-gray-900">Categorías</span>
                        <span className="ml-6 flex items-center">{openSections.categoria ? "-" : "+"}</span>
                      </button>
                    </h3>
                    {openSections.categoria && (
                      <div className="pt-6 space-y-4">
                        {categorias.map(cat => (
                          <div key={cat.idcategoria} className="flex items-center">
                            <input
                              type="radio"
                              checked={selectedCategoria === cat.idcategoria}
                              onChange={() => handleCategoriaChange(cat.idcategoria)}
                              className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label className="ml-3 text-sm text-gray-600">{cat.nombre}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-b border-gray-200 py-6">
                    <h3 className="-my-3 flow-root">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                        onClick={() => toggleSection("smarca")}
                      >
                        <span className="font-medium text-gray-900">Marcas</span>
                        <span className="ml-6 flex items-center">{openSections.smarca ? "-" : "+"}</span>
                      </button>
                    </h3>
                    {openSections.smarca && (
                      <div className="pt-6 space-y-4">
                        {marcas.map(mar => (
                          <div key={mar.idmarca} className="flex items-center">
                            <input
                              type="radio"
                              checked={selectedMarca === mar.idmarca}
                              onChange={() => handleMarcaChange(mar.idmarca)}
                              className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label className="ml-3 text-sm text-gray-600">{mar.nombre}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setSelectedCategoria(null); setSelectedMarca(null); }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </form>

              {/* Productos */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {productos.length > 0 ? productos.map(producto => (
                    <div
                      key={producto.idproducto}
                      className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square overflow-hidden"
                    >
                      {/* Mitad superior: imagen */}
                      <div className="h-1/2 relative overflow-hidden">
                        <img
                          src={`http://localhost:8080/uploads/${producto.imagenesNombres[0]}`}
                          alt={producto.nombre}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-30" />
                      </div>
                      {/* Mitad inferior: contenido */}
                      <div className="h-1/2 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            <button
                              onClick={() => navigate(`/tienda/producto/${producto.idproducto}`, { state: producto })}
                              className="hover:text-blue-600 focus:outline-none text-left w-full"
                            >
                              {producto.nombre}
                            </button>
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {producto.descripcion || "Descripción no disponible"}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold text-gray-900">
                            ${producto.precio.toFixed(2)}
                          </p>
                          <button
                            onClick={() => navigate(`/tienda/producto/${producto.idproducto}`, { state: producto })}
                            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                          >
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 col-span-full">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
                      <p className="mt-1 text-sm text-gray-500">Intenta con otros filtros de búsqueda</p>
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

