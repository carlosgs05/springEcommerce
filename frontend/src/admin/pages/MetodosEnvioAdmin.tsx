import { useState, useEffect, ChangeEvent, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import { 
  FiTruck, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiX,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch
} from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

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
  const [searchTerm] = useState<string>("");

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
      customClass: {
        container: 'font-sans rounded-2xl',
        popup: 'rounded-2xl',
        confirmButton: nuevoEstado 
          ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-4 py-2 rounded-xl transition-all'
          : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all',
        cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-xl transition-all'
      }
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
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl shadow-sm">
              <FiTruck className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Gestión de Métodos de Envío
              </h1>
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            <FiPlus className="mr-2" />
            Nuevo Método
          </button>
        </div>

        {/* Modal - Más ancho y con campos en la misma fila */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiTruck className="text-blue-500" />
                  {idEdit ? "Editar Método" : "Nuevo Método"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-500 text-2xl font-light cursor-pointer"
                >
                  <FiX />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre del método"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción del método de envío"
                  />
                </div>

                {/* Campos en la misma fila: Costo, Tiempo y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo (S/)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-500" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700"
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
                        <FiClock className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Ej: 24-48 horas"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                        value={tiempoEstimado}
                        onChange={(e) => setTiempoEstimado(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <div className="flex h-full">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={estado}
                          onChange={(e) => setEstado(e.target.checked)}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-700">
                          {estado ? "Activo" : "Inactivo"}
                        </span>
                      </label>
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
                            <FiX size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <FiTruck className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Arrastra y suelta el icono aquí o haz clic para
                          seleccionar
                        </p>
                        <p className="text-xs text-gray-500">
                          Formatos: PNG, JPG, SVG (max 2MB)
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

        {/* Lista de métodos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-3xl text-blue-500 mb-3" />
              <span className="text-gray-500">Cargando métodos...</span>
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
        ) : metodos.length === 0 ? (
          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-200 flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <FiTruck className="text-2xl text-blue-400" />
            </div>
            <p className="text-lg mb-1">No hay métodos de envío registrados</p>
            <p className="text-sm">Agrega tu primer método usando el botón superior</p>
          </div>
        ) : filteredMetodos.length === 0 ? (
          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-200 flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <FiSearch className="text-2xl text-blue-400" />
            </div>
            <p className="text-lg mb-1">No se encontraron métodos</p>
            <p className="text-sm">No hay métodos que coincidan con "{searchTerm}"</p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {filteredMetodos.map((m) => (
              <div
                key={m.idMetodoEnvio}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-sm rounded-2xl border border-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {m.iconoImg && (
                    <div className="flex-shrink-0">
                      <div className="bg-blue-50 rounded-xl p-2">
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
                      <button
                        onClick={() => toggleEstado(m)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.estado
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {m.estado ? "Activo" : "Inactivo"}
                      </button>
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      {m.descripcion}
                    </p>

                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiDollarSign className="mr-1.5 h-4 w-4" />
                      <span>S/ {m.costo.toFixed(2)}</span>
                      <span className="mx-2">•</span>
                      <FiClock className="mr-1.5 h-4 w-4" />
                      <span>{m.tiempoEstimado}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-gray-100 pt-3">
                  <button
                    onClick={() => toggleEstado(m)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <FiRefreshCw className="mr-1.5 h-4 w-4" />
                    Cambiar estado
                  </button>

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
                      Icono
                    </th>
                    <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                      Costo
                    </th>
                    <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                      Tiempo
                    </th>
                    <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-base font-medium uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMetodos.map((m) => (
                    <tr key={m.idMetodoEnvio} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {m.iconoImg && (
                          <div className="bg-blue-50 rounded-xl p-1 w-12 h-12 flex items-center justify-center">
                            <img
                              src={`http://localhost:8080/uploads/${m.iconoImg}`}
                              className="max-w-full max-h-full object-contain"
                              alt="Icono"
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base font-medium text-gray-900">
                          {m.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {m.descripcion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base text-gray-900 flex items-center">
                          S/ {m.costo.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base text-gray-900 flex items-center">
                          <FiClock className="mr-1 h-4 w-4 text-gray-500" />
                          {m.tiempoEstimado}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleEstado(m)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                            m.estado
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {m.estado ? (
                            <FiCheckCircle className="mr-1.5 h-4 w-4" />
                          ) : (
                            <FiX className="mr-1.5 h-4 w-4" />
                          )}
                          {m.estado ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
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
                        </div>
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

export default MetodosEnvioAdmin;
