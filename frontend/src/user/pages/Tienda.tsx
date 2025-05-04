import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Header';
import Footer from '../Footer';
import { useNavigate } from 'react-router-dom';

const Tienda = () => {
    const [categorias, setCategorias] = useState<any[]>([]); // Estado para las categorías
    const [marcas, setMarcas] = useState<any[]>([]); // Estado para las marcas
    const [productos, setProductos] = useState<any[]>([]); // Estado para los productos
    const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null); // Solo una categoría seleccionada
    const [selectedMarca, setSelectedMarca] = useState<number | null>(null); // Solo una marca seleccionada
    const navigate = useNavigate();

    const [openSections, setOpenSections] = useState({
        categoria: false,
        smarca: false,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Actualiza solo una categoría seleccionada
    const handleCategoriaChange = (idcategoria: number) => {
        setSelectedCategoria(idcategoria === selectedCategoria ? null : idcategoria); // Selecciona o deselecciona
    };

    // Actualiza solo una marca seleccionada
    const handleMarcaChange = (idmarca: number) => {
        setSelectedMarca(idmarca === selectedMarca ? null : idmarca); // Selecciona o deselecciona
    };

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                console.log("Categoría seleccionada:", selectedCategoria);
                console.log("Marca seleccionada:", selectedMarca);

                // Enviar parámetros correctamente
                const response = await axios.get('http://localhost:8080/api/productos/filtrar', {
                    params: {
                        categoria: selectedCategoria !== null ? selectedCategoria : undefined, // Enviar solo si no es null
                        marca: selectedMarca !== null ? selectedMarca : undefined              // Enviar solo si no es null
                    }
                });

                console.log("Productos filtrados:", response.data.data);
                setProductos(response.data.data);
            } catch (error) {
                console.error('Error al cargar productos filtrados:', error);
            }
        };

        // Solo hacer la solicitud si hay filtros aplicados
        if (selectedCategoria !== null || selectedMarca !== null) {
            fetchProductos();
        } else {
            // Si no hay filtros, cargar todos los productos
            axios.get('http://localhost:8080/api/productos/listarAll')
                .then(response => {
                    console.log('Productos cargados:', response.data.data);
                    setProductos(response.data.data);
                })
                .catch(error => console.error('Error al cargar productos:', error));
        }
    }, [selectedCategoria, selectedMarca]); // Ejecutar cuando las categorías o marcas seleccionadas cambian




    useEffect(() => {
        // Obtener categorías desde el backend
        axios.get('http://localhost:8080/api/categorias/listar')
            .then(response => setCategorias(response.data.data)) // Guardar las categorías en el estado
            .catch(error => console.error('Error al cargar categorías:', error));

        // Obtener marcas desde el backend
        axios.get('http://localhost:8080/api/marcas/listar')
            .then(response => setMarcas(response.data.data)) // Guardar las marcas en el estado
            .catch(error => console.error('Error al cargar marcas:', error));
    }, []);

    return (
        <div className="bg-white">
            <div>
                <Header />
                <section aria-labelledby="products-heading" className="pt-6 pb-24">
                    <h2 id="products-heading" className="sr-only">Products</h2>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                        {/* Filtros de escritorio */}
                        <form className="hidden lg:block ml-10">
                            {/* Filtro de categorías */}
                            <div className="border-b border-gray-200 py-6">
                                <h3 className="-my-3 flow-root">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500"
                                        onClick={() => toggleSection('categoria')}
                                        aria-expanded={openSections.categoria}
                                    >
                                        <span className="font-medium text-gray-900">Categorías</span>
                                        <span className="ml-6 flex items-center">
                                            {openSections.categoria ? '-' : '+'}
                                        </span>
                                    </button>
                                </h3>
                                {openSections.categoria && (
                                    <div className="pt-6">
                                        <ul className="space-y-4">
                                            {categorias.map((categoria: any) => (
                                                <li key={categoria.idcategoria}>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            value={categoria.idcategoria}
                                                            className="mr-2"
                                                            checked={selectedCategoria === categoria.idcategoria}
                                                            onChange={() => handleCategoriaChange(categoria.idcategoria)}
                                                        />
                                                        {categoria.nombre}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Filtro de marcas */}
                            <div className="border-b border-gray-200 py-6">
                                <h3 className="-my-3 flow-root">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500"
                                        onClick={() => toggleSection('smarca')}
                                        aria-expanded={openSections.smarca}
                                    >
                                        <span className="font-medium text-gray-900">Marcas</span>
                                        <span className="ml-6 flex items-center">
                                            {openSections.smarca ? '-' : '+'}
                                        </span>
                                    </button>
                                </h3>
                                {openSections.smarca && (
                                    <div className="pt-6">
                                        <ul className="space-y-4">
                                            {marcas.map((marca: any) => (
                                                <li key={marca.idmarca}>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            value={marca.idmarca}
                                                            className="mr-2"
                                                            checked={selectedMarca === marca.idmarca}
                                                            onChange={() => handleMarcaChange(marca.idmarca)}
                                                        />
                                                        {marca.nombre}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {/* Botón para limpiar filtros */}
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategoria(null);
                                        setSelectedMarca(null);
                                    }}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </form>

                        {/* Contenido principal de Productos */}
                        <div className="lg:col-span-3">
                            <h1 className="text-2xl font-bold">Productos</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {productos.length > 0 ? (
                                    productos.map((producto: any) => (
                                        <div key={producto.idproducto} className="bg-white p-4 rounded-lg shadow-md">
                                            <img
                                                src={`http://localhost:8080/uploads/${producto.imagenesNombres[0]}`}
                                                alt={producto.nombre}
                                                className="w-full h-32 object-cover rounded mb-4"
                                            />
                                            <h3 className="text-lg font-medium">{producto.nombre}</h3>
                                            <p className="text-sm text-gray-500">{producto.descripcion}</p>
                                            <p className="font-semibold text-gray-800">${producto.precio}</p>
                                            <div className="flex justify-between items-center">
                                                <button
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                                    onClick={() => navigate(`/tienda/producto/${producto.idproducto}`, { state: producto })}
                                                >
                                                    Ver detalles
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No se encontraron productos.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        </div>
    );
};

export default Tienda;
