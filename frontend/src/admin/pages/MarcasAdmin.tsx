import { useState, useEffect, ChangeEvent } from "react";
import { FaSpinner } from "react-icons/fa";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import { FaTags } from "react-icons/fa6";

interface MarcaDTO {
  idmarca: number;
  nombre: string;
  imagen: string;
}

const PAGE_SIZE = 4;

const MarcasAdmin = () => {
  const [marcas, setMarcas] = useState<MarcaDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");
  const [iconRefresh, setIconRefresh] = useState(Date.now());

  // Form state
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMarcas = async () => {
    try {
      setLoading(true);
      const resp = await axios.get("http://localhost:8080/api/marcas/listar");
      if (resp.data.success) {
        setMarcas(resp.data.data);
      } else {
        setError(resp.data.message);
      }
    } catch (err) {
      setError("Error al cargar marcas");
      console.error(err);
    } finally {
      setLoading(false);
      setIconRefresh(Date.now());
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  // PAGINADO Y BUSQUEDA
  const filtered = marcas.filter((m) =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, marcas.length]);

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

  // FILE INPUT/DRAG & DROP
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleNewFile(e.dataTransfer.files[0]);
    }
  };

  const handleNewFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "Solo se permiten archivos de imagen", "error");
      return;
    }
    setCurrentImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleNewFile(e.target.files[0]);
  };

  const removeImage = () => {
    setCurrentImage(null);
    setPreviewUrl("");
    setExistingImage("");
  };

  const resetForm = () => {
    setIdEdit(null);
    setNombre("");
    setCurrentImage(null);
    setPreviewUrl("");
    setExistingImage("");
    setShowModal(false);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Swal.fire("Error", "El nombre es requerido", "error");
      return;
    }

    const formData = new FormData();
    formData.append("marca", JSON.stringify({ nombre: nombre.trim() }));
    if (currentImage) {
      formData.append("imagen", currentImage);
    }

    try {
      const url = idEdit
        ? `http://localhost:8080/api/marcas/actualizar/${idEdit}`
        : "http://localhost:8080/api/marcas/crear";
      const method = idEdit ? "put" : "post";

      const resp = await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (resp.data.success) {
        await Swal.fire(
          idEdit ? "¡Actualizado!" : "¡Éxito!",
          `Marca ${idEdit ? "actualizada" : "creada"} correctamente`,
          "success"
        );
        resetForm();
        fetchMarcas();
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
      console.error(err);
    }
  };

  const handleEditClick = (marca: MarcaDTO) => {
    setIdEdit(marca.idmarca);
    setNombre(marca.nombre);
    setExistingImage(marca.imagen);
    setPreviewUrl(
      marca.imagen
        ? `http://localhost:8080/uploads/${marca.imagen}?t=${iconRefresh}`
        : ""
    );
    setShowModal(true);
  };

  const handleEliminar = async (marca: MarcaDTO) => {
    const result = await Swal.fire({
      title: "¿Eliminar marca?",
      text: marca.nombre,
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
          `http://localhost:8080/api/marcas/eliminar/${marca.idmarca}`
        );
        if (resp.data.success) {
          await Swal.fire(
            "Eliminado",
            "Marca eliminada correctamente",
            "success"
          );
          fetchMarcas();
        } else {
          throw new Error(resp.data.message);
        }
      } catch (err: any) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {idEdit ? "Editar Marca" : "Nueva Marca"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500 text-2xl font-light cursor-pointer"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nombre de la marca
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Escribe el nombre de la marca"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Logo de la marca
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors min-h-[200px] flex items-center justify-center
                    ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400"
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  {previewUrl || existingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <div className="relative w-full h-full">
                        <img
                          src={
                            previewUrl ||
                            `http://localhost:8080/uploads/${existingImage}?t=${iconRefresh}`
                          }
                          className="w-full h-full max-w-full max-h-full mx-auto object-contain"
                          alt="Previsualización"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-white p-1.5 text-red-600 hover:text-red-700 rounded-full shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Arrastra y suelta el logo aquí o haz clic para
                        seleccionar
                      </p>
                      <p className="text-xs text-gray-500">
                        Formatos: JPG, PNG, GIF
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-colors cursor-pointer text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all cursor-pointer font-medium"
              >
                {idEdit ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl shadow-sm">
              <FaTags className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Gestión de Marcas
              </h1>
            </div>
          </div>
        </header>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <input
            className="px-4 py-2 w-full sm:w-72 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-400 outline-none bg-gray-50 text-gray-700 transition-all"
            placeholder="Buscar marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            <FiPlus className="mr-2" /> Añadir Marca
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-3xl text-blue-500 mb-3" />
              <span className="text-gray-500">Cargando marcas...</span>
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
            <p className="text-lg mb-1">No hay marcas registradas</p>
            <p className="text-sm">
              Agrega tu primera marca usando el botón superior
            </p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {paged.map((m) => (
              <div
                key={m.idmarca}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-sm rounded-2xl border border-gray-200 flex justify-between items-center transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  {m.imagen && (
                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden bg-gray-100 rounded-xl">
                      <img
                        src={`http://localhost:8080/uploads/${m.imagen}?t=${iconRefresh}`}
                        className="max-w-full max-h-full"
                        alt="Logo"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-gray-800 font-medium">
                      {m.nombre}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(m)}
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
                        Logo
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
                    {paged.map((m) => (
                      <tr
                        key={m.idmarca}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {m.imagen && (
                            <div className="w-16 h-16 flex items-center justify-center overflow-hidden bg-gray-100 rounded-xl">
                              <img
                                src={`http://localhost:8080/uploads/${m.imagen}?t=${iconRefresh}`}
                                className="max-w-full max-h-full object-contain"
                                alt="Logo"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-base text-gray-800">
                          {m.nombre}
                        </td>
                        <td className="px-6 py-4 text-base space-x-2">
                          <button
                            onClick={() => handleEditClick(m)}
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

export default MarcasAdmin;
