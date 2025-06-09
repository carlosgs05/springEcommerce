import { useState, useEffect, ChangeEvent } from "react";
import {
  FaSpinner,
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";

interface MarcaDTO {
  idmarca: number;
  nombre: string;
  imagen: string;
}

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

  // Form state
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string>("");

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
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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
      marca.imagen ? `http://localhost:8080/uploads/${marca.imagen}` : ""
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
    });

    if (result.isConfirmed) {
      try {
        const resp = await axios.delete(
          `http://localhost:8080/api/marcas/eliminar/${marca.idmarca}`
        );
        if (resp.data.success) {
          await Swal.fire("Eliminado", "Marca eliminada correctamente", "success");
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
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-3 uppercase">
            Gestión de Marcas
          </h1>
          <p className="text-gray-500">
            Administra las marcas de productos en tu tienda
          </p>
        </header>

        <button
          onClick={() => setShowModal(true)}
          className="mb-6 inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
        >
          <FaPlusCircle className="mr-2" /> Añadir Marca
        </button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {idEdit ? "Editar Marca" : "Nueva Marca"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la marca
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo de la marca
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors min-h-[200px] flex items-center justify-center
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
                              `http://localhost:8080/uploads/${existingImage}`
                            }
                            className="w-full h-full max-w-full max-h-full mx-auto"
                            alt="Previsualización"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-white p-1.5 text-red-600 hover:text-red-700 rounded-full shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <FaTimes size={16} />
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

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 inline-flex items-center justify-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    {idEdit ? "Actualizar" : "Crear"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de marcas */}
        {loading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
        ) : marcas.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
            No hay marcas registradas
          </div>
        ) : isMobile ? (
          <div className="space-y-3">
            {marcas.map((m) => (
              <div
                key={m.idmarca}
                className="bg-white p-4 shadow-sm rounded-lg border border-gray-100 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  {m.imagen && (
                    <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                      <img
                        src={`http://localhost:8080/uploads/${m.imagen}`}
                        className="max-w-full max-h-full"
                        alt="Logo"
                      />
                    </div>
                  )}
                  <span className="text-gray-700">{m.nombre}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditClick(m)}
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
                    Logo
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
                {marcas.map((m) => (
                  <tr key={m.idmarca} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {m.imagen && (
                        <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                          <img
                            src={`http://localhost:8080/uploads/${m.imagen}`}
                            className="max-w-full max-h-full"
                            alt="Logo"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {m.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => handleEditClick(m)}
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