import { useState, useEffect, ChangeEvent, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import {
  HiOutlineTruck,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineSwitchHorizontal,
  HiOutlineSearch,
} from "react-icons/hi";

interface MetodoEnvioDTO {
  idMetodoEnvio: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
  iconoImg: string;
  costo: number;
  tiempoEstimado: string;
}

const MetodosEnvioAdmin = () => {
  const [metodos, setMetodos] = useState<MetodoEnvioDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentIcon, setCurrentIcon] = useState<File | null>(null);
  const [existingIcon, setExistingIcon] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Form state
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [costo, setCosto] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<string>("");
  const [estado, setEstado] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMetodos = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(
        "http://localhost:8080/api/metodoenvio/listar"
      );
      if (resp.data.success) {
        setMetodos(resp.data.data);
      } else {
        setError(resp.data.message);
      }
    } catch (err) {
      setError("Error al cargar métodos de envío");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetodos();
  }, [fetchMetodos]);

  const filteredMetodos = metodos.filter(
    (metodo) =>
      metodo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metodo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setCurrentIcon(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleNewFile(e.target.files[0]);
  };

  const removeIcon = () => {
    setCurrentIcon(null);
    setPreviewUrl("");
    setExistingIcon("");
  };

  const resetForm = () => {
    setIdEdit(null);
    setNombre("");
    setDescripcion("");
    setCosto(0);
    setTiempoEstimado("");
    setEstado(true);
    setCurrentIcon(null);
    setPreviewUrl("");
    setExistingIcon("");
    setShowModal(false);
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Swal.fire("Error", "El nombre es requerido", "error");
      return;
    }
    if (costo < 0) {
      Swal.fire("Error", "El costo debe ser un valor positivo", "error");
      return;
    }

    const formData = new FormData();
    formData.append(
      "metodoEnvio",
      JSON.stringify({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        costo,
        tiempoEstimado: tiempoEstimado.trim(),
        estado,
      })
    );

    if (currentIcon) {
      formData.append("icono", currentIcon);
    }

    try {
      const url = idEdit
        ? `http://localhost:8080/api/metodoenvio/actualizar/${idEdit}`
        : "http://localhost:8080/api/metodoenvio/crear";
      const method = idEdit ? "put" : "post";

      const resp = await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (resp.data.success) {
        await Swal.fire(
          idEdit ? "¡Actualizado!" : "¡Éxito!",
          `Método de envío ${idEdit ? "actualizado" : "creado"} correctamente`,
          "success"
        );
        resetForm();
        fetchMetodos();
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
      console.error(err);
    }
  };

  const handleEditClick = (m: MetodoEnvioDTO) => {
    setIdEdit(m.idMetodoEnvio);
    setNombre(m.nombre);
    setDescripcion(m.descripcion);
    setCosto(m.costo);
    setTiempoEstimado(m.tiempoEstimado);
    setEstado(m.estado);
    setExistingIcon(m.iconoImg);
    setPreviewUrl(
      m.iconoImg ? `http://localhost:8080/uploads/${m.iconoImg}` : ""
    );
    setShowModal(true);
  };

  const handleEliminar = async (m: MetodoEnvioDTO) => {
    const result = await Swal.fire({
      title: "¿Eliminar método de envío?",
      text: m.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        const resp = await axios.delete(
          `http://localhost:8080/api/metodoenvio/eliminar/${m.idMetodoEnvio}`
        );
        if (resp.data.success) {
          await Swal.fire(
            "Eliminado",
            "Método eliminado correctamente",
            "success"
          );
          fetchMetodos();
        } else {
          throw new Error(resp.data.message);
        }
      } catch (err: any) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      }
    }
  };

  const toggleEstado = async (m: MetodoEnvioDTO) => {
    const nuevoEstado = !m.estado;
    const result = await Swal.fire({
      title: nuevoEstado ? "¿Activar método?" : "¿Desactivar método?",
      text: `¿Estás seguro que quieres ${nuevoEstado ? "activar" : "desactivar"} ${m.nombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: nuevoEstado ? "#10b981" : "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        const url = `http://localhost:8080/api/metodoenvio/cambiar-estado/${
          m.idMetodoEnvio
        }?estado=${nuevoEstado}`;
        const resp = await axios.put(url);

        if (resp.data.success) {
          setMetodos((prev) =>
            prev.map((item) =>
              item.idMetodoEnvio === m.idMetodoEnvio
                ? { ...item, estado: nuevoEstado }
                : item
            )
          );
          Swal.fire(
            "Estado cambiado",
            `El método ha sido ${nuevoEstado ? "activado" : "desactivado"}`,
            "success"
          );
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2 uppercase">
            Gestión de Métodos de Envío
          </h1>
          <p className="text-gray-500">
            Administra los métodos de envío disponibles en tu tienda
          </p>
        </header>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
          >
            <HiOutlinePlusCircle className="mr-2 text-lg" />
            Nuevo Método
          </button>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar método..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <HiOutlineTruck />
                  {idEdit ? "Editar Método" : "Nuevo Método"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer rounded-full hover:bg-gray-100 p-1"
                >
                  <HiOutlineX size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo (S/)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiOutlineCurrencyDollar className="text-gray-500" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                        value={costo}
                        onChange={(e) => setCosto(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo Estimado
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiOutlineClock className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Ej: 24-48 horas"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                        value={tiempoEstimado}
                        onChange={(e) => setTiempoEstimado(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors min-h-[160px] flex items-center justify-center
                      ${
                        dragActive
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-300 hover:border-indigo-400"
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

                    {previewUrl || existingIcon ? (
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        <div className="relative w-full h-full flex justify-center">
                          <img
                            src={
                              previewUrl ||
                              `http://localhost:8080/uploads/${existingIcon}`
                            }
                            className="max-w-full max-h-[120px] mx-auto object-contain"
                            alt="Previsualización"
                          />
                          <button
                            onClick={removeIcon}
                            className="absolute top-2 right-2 bg-white p-1.5 text-red-600 hover:text-red-700 rounded-full shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <HiOutlineX size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                        <div className="p-3 bg-indigo-100 rounded-full">
                          <HiOutlineTruck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-sm">
                          Arrastra y suelta el icono aquí o haz clic para
                          seleccionar
                        </p>
                        <p className="text-xs">
                          Formatos: PNG, JPG, SVG (max 2MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer shadow hover:shadow-md"
                  >
                    {idEdit ? "Actualizar Método" : "Crear Método"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de métodos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
            {error}
          </div>
        ) : metodos.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200">
            <HiOutlineTruck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay métodos de envío registrados
            </h3>
            <p className="mt-1 text-gray-500">
              Comienza agregando un nuevo método de envío
            </p>
          </div>
        ) : filteredMetodos.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200">
            <HiOutlineSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No se encontraron métodos
            </h3>
            <p className="mt-1 text-gray-500">
              No hay métodos que coincidan con "{searchTerm}"
            </p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {filteredMetodos.map((m) => (
              <div
                key={m.idMetodoEnvio}
                className="bg-white p-4 shadow rounded-xl border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  {m.iconoImg && (
                    <div className="flex-shrink-0">
                      <div className="bg-indigo-50 rounded-lg p-2">
                        <img
                          src={`http://localhost:8080/uploads/${m.iconoImg}`}
                          className="w-12 h-12 object-contain"
                          alt="Icono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{m.nombre}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.estado
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {m.estado ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      {m.descripcion}
                    </p>

                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <HiOutlineCurrencyDollar className="mr-1.5 h-4 w-4" />
                      <span>S/ {m.costo.toFixed(2)}</span>
                      <span className="mx-2">•</span>
                      <HiOutlineClock className="mr-1.5 h-4 w-4" />
                      <span>{m.tiempoEstimado}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-gray-100 pt-3">
                  <button
                    onClick={() => toggleEstado(m)}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer"
                  >
                    <HiOutlineSwitchHorizontal className="mr-1.5 h-4 w-4" />
                    Cambiar estado
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(m)}
                      className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <HiOutlinePencil size={18} />
                    </button>
                    <button
                      onClick={() => handleEliminar(m)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMetodos.map((m) => (
                  <tr key={m.idMetodoEnvio} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.iconoImg && (
                        <div className="bg-indigo-50 rounded-lg p-1 w-12 h-12 flex items-center justify-center">
                          <img
                            src={`http://localhost:8080/uploads/${m.iconoImg}`}
                            className="max-w-full max-h-full object-contain"
                            alt="Icono"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {m.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {m.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <HiOutlineCurrencyDollar className="mr-1 h-4 w-4 text-gray-500" />
                        S/ {m.costo.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <HiOutlineClock className="mr-1 h-4 w-4 text-gray-500" />
                        {m.tiempoEstimado}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleEstado(m)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                          m.estado
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {m.estado ? (
                          <HiOutlineCheckCircle className="mr-1.5 h-4 w-4" />
                        ) : (
                          <HiOutlineX className="mr-1.5 h-4 w-4" />
                        )}
                        {m.estado ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(m)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <HiOutlinePencil size={18} />
                        </button>
                        <button
                          onClick={() => handleEliminar(m)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
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

export default MetodosEnvioAdmin;
