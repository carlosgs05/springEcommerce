// src/admin/pages/MarcaAdmin.tsx
import { useState, useEffect } from "react";
import { FaSpinner, FaEdit, FaTrash, FaPlusCircle } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";

interface CategoriaDTO {
  idcategoria: number;
  nombre: string;
}

const MarcasAdmin = () => {
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevaCategoria, setNuevaCategoria] = useState<string>("");

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

  const handleEditar = async (categoria: CategoriaDTO) => {
    const { value: nuevoNombre } = await Swal.fire({
      title: "Editar Categoria",
      input: "text",
      inputLabel: "Nombre de la categoria",
      inputValue: categoria.nombre,
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
      inputValidator: (value: string) =>
        !value?.trim() && "El nombre no puede estar vacío",
    });
    if (nuevoNombre) {
      try {
        const resp = await axios.put(
          `http://localhost:8080/api/categorias/actualizar/${categoria.idcategoria}`,
          { nombre: nuevoNombre }
        );
        if (resp.data.success) {
          Swal.fire(
            "¡Actualizado!",
            "Categoria actualizada correctamente",
            "success"
          );
          fetchCategorias();
        } else throw new Error(resp.data.message);
      } catch (err: any) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      }
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
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Gestión de Categorías
          </h1>
          <p className="text-gray-500">
            Administra las categorías de los productos en tu tienda
          </p>
        </header>

        {/* Formulario Crear */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Nombre de la nueva categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
            />
            <button
              onClick={handleCrear}
              className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <FaPlusCircle className="mr-2" /> Añadir
            </button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
        ) : categorias.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
            No hay categorías registradas
          </div>
        ) : isMobile ? (
          <div className="space-y-3">
            {categorias.map((m) => (
              <div
                key={m.idcategoria}
                className="bg-white p-4 shadow-sm rounded-lg border border-gray-100 flex justify-between items-center"
              >
                <span className="text-gray-700">{m.nombre}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditar(m)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleEliminar(m)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categorias.map((m) => (
                  <tr key={m.idcategoria} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {m.idcategoria}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {m.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => handleEditar(m)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleEliminar(m)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default MarcasAdmin;