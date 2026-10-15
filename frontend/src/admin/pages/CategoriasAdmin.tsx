import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiGrid,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";

interface CategoriaDTO {
  idcategoria: number;
  nombre: string;
}

const PAGE_SIZE = 4;

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [categoriaEditando, setCategoriaEditando] =
    useState<CategoriaDTO | null>(null);
  const [nombreCategoria, setNombreCategoria] = useState<string>("");

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);

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
      setError("Error al cargar categorías");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Search & pagination
  const filtered = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categorias.length]);

  const renderPagination = () =>
    totalPages > 1 ? (
      <div className="flex justify-center items-center gap-2 py-6 select-none">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-cyan-100 transition cursor-pointer"
          disabled={page === 1}
        >
          <FiChevronLeft />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`w-8 h-8 rounded-full font-bold transition-all ${
              page === i + 1
                ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-cyan-50"
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-cyan-100 transition cursor-pointer"
          disabled={page === totalPages}
        >
          <FiChevronRight />
        </button>
      </div>
    ) : null;

  // Crear o actualizar
  const handleGuardar = async () => {
    if (!nombreCategoria.trim()) {
      Swal.fire("Error", "El nombre no puede estar vacío", "error");
      return;
    }
    try {
      if (categoriaEditando) {
        // Actualizar
        const resp = await axios.put(
          `http://localhost:8080/api/categorias/actualizar/${categoriaEditando.idcategoria}`,
          { nombre: nombreCategoria }
        );
        if (resp.data.success) {
          Swal.fire(
            "¡Actualizado!",
            "Categoría actualizada correctamente",
            "success"
          );
        } else throw new Error(resp.data.message);
      } else {
        // Crear
        const resp = await axios.post(
          "http://localhost:8080/api/categorias/crear",
          { nombre: nombreCategoria }
        );
        if (resp.data.success) {
          Swal.fire("¡Éxito!", "Categoría creada correctamente", "success");
        } else throw new Error(resp.data.message);
      }
      fetchCategorias();
      cerrarModal();
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  const abrirModalNueva = () => {
    setCategoriaEditando(null);
    setNombreCategoria("");
    setShowModal(true);
  };

  const abrirModalEditar = (categoria: CategoriaDTO) => {
    setCategoriaEditando(categoria);
    setNombreCategoria(categoria.nombre);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setCategoriaEditando(null);
    setNombreCategoria("");
  };

  const handleEliminar = async (categoria: CategoriaDTO) => {
    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: categoria.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        container: "font-sans rounded-2xl",
        popup: "rounded-2xl",
        confirmButton:
          "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all",
        cancelButton:
          "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-xl transition-all",
      },
    });
    if (result.isConfirmed) {
      try {
        const resp = await axios.delete(
          `http://localhost:8080/api/categorias/eliminar/${categoria.idcategoria}`
        );
        if (resp.data.success) {
          Swal.fire(
            "¡Eliminado!",
            "Categoría eliminada correctamente",
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
      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {categoriaEditando ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-500 text-2xl font-light cursor-pointer"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6">
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="nombreCategoria"
              >
                Nombre de la categoría
              </label>
              <input
                id="nombreCategoria"
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                placeholder="Escribe el nombre"
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-colors cursor-pointer text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all cursor-pointer font-medium"
              >
                {categoriaEditando ? "Actualizar" : "Crear"}
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

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <input
            className="px-4 py-2 w-full sm:w-72 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-400 outline-none bg-gray-50 text-gray-700 transition-all"
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={abrirModalNueva}
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            <FiPlus className="mr-2" /> Añadir Categoría
          </button>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span>{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-200 flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <FiGrid className="text-2xl text-blue-400" />
            </div>
            <p className="text-lg mb-1">No hay categorías registradas</p>
            <p className="text-sm">
              Agrega tu primera categoría usando el botón superior
            </p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {paged.map((m) => (
              <div
                key={m.idcategoria}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-sm rounded-2xl border border-gray-200 flex justify-between items-center transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <span className="text-gray-800 font-medium">{m.nombre}</span>
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
            {renderPagination()}
          </div>
        ) : (
          <>
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paged.map((m) => (
                      <tr
                        key={m.idcategoria}
                        className="hover:bg-gray-50 transition-colors"
                      >
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
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoriasAdmin;
