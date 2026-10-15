import { useState, useEffect, ChangeEvent, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import {
  FiCreditCard,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiPlusCircle,
  FiMinus,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

interface MetodoPagoDTO {
  idMetodoPago: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  iconoImg: string;
  configAdicional: string;
}

interface ConfigItem {
  clave: string;
  valor: string;
}

const PAGE_SIZE = 4;

const MetodosPagoAdmin = () => {
  const [metodos, setMetodos] = useState<MetodoPagoDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentIcon, setCurrentIcon] = useState<File | null>(null);
  const [existingIcon, setExistingIcon] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);

  // Barra de progreso
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(1);
  const [progressMsg, setProgressMsg] = useState("Procesando...");

  // Forzar refresh imagen (anti-cache)
  const [iconRefresh, setIconRefresh] = useState(Date.now());

  // Paginación
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMetodos = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(
        "http://localhost:8080/api/metodopago/listar"
      );
      if (resp.data.success) setMetodos(resp.data.data);
      else setError(resp.data.message);
      setIconRefresh(Date.now());
    } catch {
      setError("Error al cargar métodos de pago");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetodos();
  }, [fetchMetodos]);

  // Si cambia search o lista, volver a página 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, metodos.length]);

  const filtered = metodos.filter(
    (m) =>
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginar resultados
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleNewFile(e.dataTransfer.files[0]);
  };

  const handleNewFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "Solo se permiten imágenes", "error");
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
    setConfigItems([]);
    removeIcon();
    setShowModal(false);
  };

  const handleConfigChange = (
    index: number,
    field: keyof ConfigItem,
    value: string
  ) => {
    const newItems = [...configItems];
    newItems[index][field] = value;
    setConfigItems(newItems);
  };

  const addConfigItem = () => {
    setConfigItems([...configItems, { clave: "", valor: "" }]);
  };

  const removeConfigItem = (index: number) => {
    const newItems = [...configItems];
    newItems.splice(index, 1);
    setConfigItems(newItems);
  };

  // Barra de progreso con animación suave
  const animateProgress = (target: number, cb?: () => void) => {
    let current = progress;
    const step = () => {
      if (current < target) {
        current += Math.max(1, Math.ceil((target - current) / 10));
        setProgress(Math.min(current, target));
        setTimeout(step, 15);
      } else if (cb) {
        cb();
      }
    };
    step();
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Swal.fire("Error", "Nombre requerido", "error");
      return;
    }

    const configJson =
      configItems.length > 0
        ? JSON.stringify(
            configItems.reduce((acc: Record<string, string>, item) => {
              if (item.clave.trim()) {
                acc[item.clave.trim()] = item.valor.trim();
              }
              return acc;
            }, {})
          )
        : "";

    const form = new FormData();
    form.append(
      "metodoPago",
      JSON.stringify({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activo: true,
        configAdicional: configJson,
      })
    );
    if (currentIcon) form.append("icono", currentIcon);

    setProgress(1);
    setProgressMsg(idEdit ? "Actualizando método..." : "Creando método...");
    setProgressVisible(true);

    try {
      const url = idEdit
        ? `http://localhost:8080/api/metodopago/actualizar/${idEdit}`
        : "http://localhost:8080/api/metodopago/crear";
      const method = idEdit ? "put" : "post";
      await axios[method]<any>(url, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            let percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent < 99 ? percent : 99);
          }
        },
      });
      animateProgress(100, () => {
        setTimeout(() => {
          setProgressVisible(false);
          setProgress(1);
          setIconRefresh(Date.now());
          Swal.fire(
            idEdit ? "Actualizado" : "Creado",
            `Método de pago ${
              idEdit ? "actualizado" : "creado"
            } correctamente.`,
            "success"
          );
          resetForm();
          fetchMetodos();
        }, 300);
      });
    } catch (e: any) {
      setProgressVisible(false);
      Swal.fire("Error", e.response?.data?.message || e.message, "error");
    }
  };

  // Simula progreso suave para DELETE o PUT "estado"
  const fakeProgressDeleteOrEstado = (msg: string, cb: () => Promise<any>) => {
    setProgress(1);
    setProgressMsg(msg);
    setProgressVisible(true);
    let current = 1;
    const fakeStep = () => {
      if (current < 98) {
        current += Math.max(1, Math.ceil((100 - current) / 13));
        setProgress(current);
        setTimeout(fakeStep, 20);
      }
    };
    fakeStep();
    cb().then(() => {
      animateProgress(100, () => {
        setTimeout(() => {
          setProgressVisible(false);
          setProgress(1);
          setIconRefresh(Date.now());
        }, 350);
      });
    });
  };

  const handleEdit = (m: MetodoPagoDTO) => {
    setIdEdit(m.idMetodoPago);
    setNombre(m.nombre);
    setDescripcion(m.descripcion);
    setExistingIcon(m.iconoImg);
    setPreviewUrl(
      m.iconoImg ? `http://localhost:8080/uploads/${m.iconoImg}` : ""
    );
    try {
      if (m.configAdicional) {
        const parsedConfig = JSON.parse(m.configAdicional);
        const items = Object.entries(parsedConfig).map(([clave, valor]) => ({
          clave,
          valor: typeof valor === "string" ? valor : JSON.stringify(valor),
        }));
        setConfigItems(items);
      } else {
        setConfigItems([]);
      }
    } catch (error) {
      setConfigItems([]);
    }
    setShowModal(true);
  };

  const handleDelete = async (m: MetodoPagoDTO) => {
    const r = await Swal.fire({
      title: "Eliminar método?",
      text: m.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      customClass: {
        container: "font-sans rounded-2xl",
        popup: "rounded-2xl",
        confirmButton:
          "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all",
        cancelButton:
          "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-xl transition-all",
      },
    });
    if (!r.isConfirmed) return;
    fakeProgressDeleteOrEstado("Eliminando método de pago...", async () => {
      try {
        const { data } = await axios.delete(
          `http://localhost:8080/api/metodopago/eliminar/${m.idMetodoPago}`
        );
        if (data.success) {
          Swal.fire("Eliminado", data.message, "success");
          fetchMetodos();
        } else throw new Error(data.message);
      } catch (e: any) {
        Swal.fire("Error", e.response?.data?.message || e.message, "error");
      }
    });
  };

  const toggleActivo = async (m: MetodoPagoDTO) => {
    const result = await Swal.fire({
      title: m.activo ? "¿Desactivar método?" : "¿Activar método?",
      text: `Estás a punto de ${
        m.activo ? "desactivar" : "activar"
      } el método: ${m.nombre}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: m.activo ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
      customClass: {
        container: "font-sans rounded-2xl",
        popup: "rounded-2xl",
        confirmButton: m.activo
          ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all"
          : "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-4 py-2 rounded-xl transition-all",
        cancelButton:
          "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-xl transition-all",
      },
    });

    if (result.isConfirmed) {
      fakeProgressDeleteOrEstado(
        m.activo ? "Desactivando método..." : "Activando método...",
        async () => {
          try {
            const { data } = await axios.put(
              `http://localhost:8080/api/metodopago/cambiar-estado/${
                m.idMetodoPago
              }?activo=${!m.activo}`
            );
            if (data.success) {
              setMetodos((prev) =>
                prev.map((x) =>
                  x.idMetodoPago === m.idMetodoPago
                    ? { ...x, activo: !x.activo }
                    : x
                )
              );
              Swal.fire(
                m.activo ? "Desactivado" : "Activado",
                data.message,
                "success"
              );
            } else throw new Error(data.message);
          } catch (e: any) {
            Swal.fire("Error", e.response?.data?.message || e.message, "error");
          }
        }
      );
    }
  };

  // UI Paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center gap-2 py-5">
        <button
          className={`px-3 py-1 rounded-lg font-medium ${
            page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-blue-600 hover:bg-cyan-50 cursor-pointer"
          }`}
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          type="button"
        >
          &laquo;
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
              page === idx + 1
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                : "bg-white text-blue-600 hover:bg-cyan-50 cursor-pointer"
            }`}
            onClick={() => setPage(idx + 1)}
            type="button"
          >
            {idx + 1}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded-lg font-medium ${
            page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-blue-600 hover:bg-cyan-50 cursor-pointer"
          }`}
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          type="button"
        >
          &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      {/* MODAL DE PROGRESO */}
      {progressVisible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1050]">
          <div className="w-[410px] sm:w-[500px] bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center border-4 border-cyan-100">
            <div className="text-base font-semibold mb-3 text-cyan-700">
              {progressMsg}
            </div>
            <div className="w-full bg-cyan-100 h-5 rounded-xl overflow-hidden shadow-inner flex items-center">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-5 rounded-xl transition-all duration-150"
                style={{
                  width: `${progress}%`,
                  minWidth: "1.5rem",
                }}
              />
              <span className="absolute right-7 text-cyan-900 font-bold text-sm">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl shadow-sm">
              <FiCreditCard className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Gestión de Métodos de Pago
              </h1>
            </div>
          </div>
        </header>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full sm:w-64 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            <FiPlusCircle className="mr-2" />
            Nuevo Método
          </button>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiCreditCard className="text-blue-500" />
                  {idEdit ? "Editar Método" : "Nuevo Método"}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: PayPal, Tarjeta de crédito"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      className="w-full px-4 py-3 h-[155px] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe el método de pago"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icono
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors min-h-[140px] flex items-center justify-center
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
                                `http://localhost:8080/uploads/${existingIcon}?t=${iconRefresh}`
                              }
                              className="max-w-full max-h-[100px] mx-auto object-contain"
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
                            <FiCreditCard className="w-6 h-6 text-blue-600" />
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
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Información Adicional (Opcional)
                    </label>
                    <button
                      type="button"
                      onClick={addConfigItem}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <FiPlus className="mr-1" /> Agregar campo
                    </button>
                  </div>
                  {configItems.length > 0 && (
                    <div className="space-y-3">
                      {configItems.map((item, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Clave (ej: comisión, moneda)"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                              value={item.clave}
                              onChange={(e) =>
                                handleConfigChange(
                                  index,
                                  "clave",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Valor (ej: 2.5%, USD)"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                              value={item.valor}
                              onChange={(e) =>
                                handleConfigChange(
                                  index,
                                  "valor",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeConfigItem(index)}
                            className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                          >
                            <FiMinus size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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

        {/* TABLA & UI */}
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
        ) : paged.length === 0 ? (
          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-200 flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <FiCreditCard className="text-2xl text-blue-400" />
            </div>
            <p className="text-lg mb-1">No hay métodos de pago registrados</p>
            <p className="text-sm">
              Agrega tu primer método usando el botón superior
            </p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {paged.map((m) => (
              <div
                key={m.idMetodoPago}
                className="bg-white bg-opacity-80 backdrop-blur-sm p-4 shadow-sm rounded-2xl border border-gray-200 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {m.iconoImg && (
                    <div className="flex-shrink-0">
                      <div className="bg-blue-50 rounded-xl p-2">
                        <img
                          src={`http://localhost:8080/uploads/${m.iconoImg}?t=${iconRefresh}`}
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
                        onClick={() => toggleActivo(m)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {m.activo ? "Activo" : "Inactivo"}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {m.descripcion}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between border-t border-gray-100 pt-3">
                  <button
                    onClick={() => toggleActivo(m)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <FiRefreshCw className="mr-1.5 h-4 w-4" />
                    Cambiar estado
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer text-blue-500"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer text-red-500"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
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
                        Icono
                      </th>
                      <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                        Información Adicional
                      </th>
                      <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paged.map((m) => (
                      <tr
                        key={m.idMetodoPago}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {m.iconoImg && (
                            <div className="bg-blue-50 rounded-xl p-1 w-12 h-12 flex items-center justify-center">
                              <img
                                src={`http://localhost:8080/uploads/${m.iconoImg}?t=${iconRefresh}`}
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
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs">
                            {m.configAdicional ? (
                              <ul className="list-disc pl-5 space-y-1">
                                {Object.entries(
                                  JSON.parse(m.configAdicional)
                                ).map(([clave, valor], idx) => (
                                  <li key={idx}>
                                    <span className="font-semibold">
                                      {clave}:
                                    </span>{" "}
                                    {valor as string}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleActivo(m)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                              m.activo
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {m.activo ? (
                              <FiCheckCircle className="mr-1.5 h-4 w-4" />
                            ) : (
                              <FiX className="mr-1.5 h-4 w-4" />
                            )}
                            {m.activo ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(m)}
                              className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer text-blue-500 hover:text-blue-700"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(m)}
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
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default MetodosPagoAdmin;
