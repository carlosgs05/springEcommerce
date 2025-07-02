import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { FiEdit2, FiTrash2, FiPlus, FiGrid, FiX } from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";

interface CategoriaDTO {
  idcategoria: number;
  nombre: string;
}

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevaCategoria, setNuevaCategoria] = useState<string>("");
  
  // Estados para el modal de edición
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaDTO | null>(null);
  const [nombreEditando, setNombreEditando] = useState<string>("");

  // Detect responsive
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(
        "http://localhost:8080/api/categorias/listar"
      );
      if (resp.data.success) {
        setCategorias(resp.data.data);
      } else {
        setError(resp.data.message);
      }
    } catch (err) {
      setError("Error al cargar categorias");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleCrear = async () => {
    if (!nuevaCategoria.trim()) {
      Swal.fire("Error", "El nombre no puede estar vacío", "error");
      return;
    }
    try {
      const resp = await axios.post(
        "http://localhost:8080/api/categorias/crear",
        { nombre: nuevaCategoria }
      );
      if (resp.data.success) {
        Swal.fire("¡Éxito!", "Categoria creada correctamente", "success");
        setNuevaCategoria("");
        fetchCategorias();
      } else throw new Error(resp.data.message);
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  // Abrir modal para editar
  const abrirModalEditar = (categoria: CategoriaDTO) => {
    setCategoriaEditando(categoria);
    setNombreEditando(categoria.nombre);
    setModalAbierto(true);
  };

  // Cerrar modal sin guardar
  const cerrarModal = () => {
    setModalAbierto(false);
    setCategoriaEditando(null);
    setNombreEditando("");
  };

  // Guardar cambios de edición
  const handleActualizar = async () => {
    if (!categoriaEditando) return;
    if (!nombreEditando.trim()) {
      Swal.fire("Error", "El nombre no puede estar vacío", "error");
      return;
    }
    try {
      const resp = await axios.put(
        `http://localhost:8080/api/categorias/actualizar/${categoriaEditando.idcategoria}`,
        { nombre: nombreEditando }
      );
      if (resp.data.success) {
        Swal.fire("¡Actualizado!", "Categoria actualizada correctamente", "success");
        fetchCategorias();
        cerrarModal();
      } else throw new Error(resp.data.message);
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  const handleEliminar = async (categoria: CategoriaDTO) => {
    const result = await Swal.fire({
      title: "¿Eliminar categoria?",
      text: categoria.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        container: 'font-sans rounded-2xl',
        popup: 'rounded-2xl',
        confirmButton: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-xl transition-all'
      }
    });
    if (result.isConfirmed) {
      try {
        const resp = await axios.delete(
          `http://localhost:8080/api/categorias/eliminar/${categoria.idcategoria}`
        );
        if (resp.data.success) {
          Swal.fire(
            "¡Eliminado!",
            "Categoria eliminada correctamente",
            "success"
          );
          fetchCategorias();
        } else throw new Error(resp.data.message);
      } catch (err: any) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Modal de edición */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            {/* Encabezado */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Editar Categoría</h3>
              <button 
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-500 text-2xl font-light cursor-pointer"
              >
                <FiX />
              </button>
            </div>
            
            {/* Cuerpo */}
            <div className="p-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="nombreCategoria">
                Nombre de la categoría
              </label>
              <input
                id="nombreCategoria"
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                placeholder="Escribe el nombre"
                value={nombreEditando}
                onChange={(e) => setNombreEditando(e.target.value)}
              />
            </div>
            
            {/* Pie */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-colors cursor-pointer text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleActualizar}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all cursor-pointer font-medium"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl shadow-sm">
              <FiGrid className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Gestión de Categorías
              </h1>
            </div>
          </div>
        </header>

        {/* Formulario Crear */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm p-5 md:p-6 rounded-2xl shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
              placeholder="Nombre de la nueva categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
            />
            <button
              onClick={handleCrear}
              className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
            >
              <FiPlus className="mr-2" /> Añadir
            </button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-3xl text-blue-500 mb-3" />
              <span className="text-gray-500">Cargando categorías...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-5 rounded-2xl text-red-500 border border-red-100 flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>{error}</span>
          </div>
        ) : categorias.length === 0 ? (
          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-200 flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <FiGrid className="text-2xl text-blue-400" />
            </div>
            <p className="text-lg mb-1">No hay categorías registradas</p>
            <p className="text-sm">Agrega tu primera categoría usando el formulario</p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {categorias.map((m) => (
              <div
                key={m.idcategoria}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-sm rounded-2xl border border-gray-200 flex justify-between items-center transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <span className="text-gray-800 font-medium">{m.nombre}</span>
                  <div className="text-xs text-gray-400 mt-1">ID: {m.idcategoria}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalEditar(m)}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer text-blue-500"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleEliminar(m)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer text-red-500"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorias.map((m) => (
                    <tr key={m.idcategoria} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-600">
                          {m.idcategoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-base text-gray-800">
                        {m.nombre}
                      </td>
                      <td className="px-6 py-4 text-base space-x-2">
                        <button
                          onClick={() => abrirModalEditar(m)}
                          className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer text-blue-500 hover:text-blue-700"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminar(m)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CategoriasAdmin;