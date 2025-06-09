import { useState, useEffect, ChangeEvent, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import {
  HiOutlineCreditCard,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineMinus,
} from "react-icons/hi";

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
    } catch {
      setError("Error al cargar métodos de pago");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetodos();
  }, [fetchMetodos]);

  const filtered = metodos.filter(
    (m) =>
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        activo: true, // Siempre activo
        configAdicional: configJson,
      })
    );
    if (currentIcon) form.append("icono", currentIcon);

    try {
      const url = idEdit
        ? `http://localhost:8080/api/metodopago/actualizar/${idEdit}`
        : "http://localhost:8080/api/metodopago/crear";
      const method = idEdit ? "put" : "post";
      const { data } = await axios[method]<any>(url, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        Swal.fire(idEdit ? "Actualizado" : "Creado", data.message, "success");
        resetForm();
        fetchMetodos();
      } else throw new Error(data.message);
    } catch (e: any) {
      Swal.fire("Error", e.response?.data?.message || e.message, "error");
    }
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
    });
    if (!r.isConfirmed) return;
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
    });

    if (result.isConfirmed) {
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
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2 uppercase">
            Gestión de Métodos de Pago
          </h1>
          <p className="text-gray-500">
            Administra los métodos de pago disponibles en tu tienda
          </p>
        </header>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow cursor-pointer transition-colors duration-200"
          >
            <HiOutlinePlusCircle className="mr-2 text-lg" /> Nuevo Método
          </button>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar método..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                  <HiOutlineCreditCard className="text-indigo-600" />
                  {idEdit ? "Editar Método" : "Nuevo Método"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  <HiOutlineX size={24} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="md:w-1/2 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: PayPal, Tarjeta de crédito"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all resize-none"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe el método de pago"
                    />
                  </div>
                </div>

                <div className="md:w-1/2 flex flex-col">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Icono
                  </label>
                  <div
                    className={`flex-1 relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                      dragActive
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-300 hover:border-indigo-300"
                    } cursor-pointer`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    {previewUrl || existingIcon ? (
                      <div className="relative h-full flex flex-col justify-center">
                        <img
                          src={
                            previewUrl ||
                            `http://localhost:8080/uploads/${existingIcon}`
                          }
                          className="mx-auto max-h-40 max-w-full rounded object-contain"
                          alt="Previsualización"
                        />
                        <button
                          onClick={removeIcon}
                          className="absolute top-2 right-2 text-red-600 bg-white rounded-full p-1 hover:bg-red-50 cursor-pointer shadow-md"
                        >
                          <HiOutlineX size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <HiOutlineCreditCard className="text-indigo-500 text-4xl mb-2" />
                        <p className="mb-1">
                          Arrastra o haz clic para cargar icono
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, SVG (max 2MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Configuración Adicional (Opcional)
                  </label>
                  <button
                    type="button"
                    onClick={addConfigItem}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <HiOutlinePlus className="mr-1" /> Agregar campo
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                            value={item.clave}
                            onChange={(e) =>
                              handleConfigChange(index, "clave", e.target.value)
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Valor (ej: 2.5%, USD)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                            value={item.valor}
                            onChange={(e) =>
                              handleConfigChange(index, "valor", e.target.value)
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeConfigItem(index)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <HiOutlineMinus size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg cursor-pointer transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
                >
                  {idEdit ? "Actualizar Método" : "Crear Método"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-t-2 border-indigo-600 rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 text-red-700 rounded">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200">
            <HiOutlineCreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay métodos de pago registrados
            </h3>
          </div>
                ) : isMobile ? (
          <div className="space-y-4">
            {filtered.map(m => (
              <div key={m.idMetodoPago} className="bg-white p-4 shadow rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {m.iconoImg && (
                      <img
                        src={`http://localhost:8080/uploads/${m.iconoImg}`} // Ruta corregida
                        className="w-12 h-12 object-contain bg-indigo-50 p-2 rounded-lg"
                        alt="Icono"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{m.nombre}</h3>
                      <p className="text-sm text-gray-600">{m.descripcion}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActivo(m)}
                    className={`px-2 py-1 rounded-full text-xs ${
                      m.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    } cursor-pointer transition`}>
                    {m.activo ? "Activo" : "Inactivo"}
                  </button>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => handleEdit(m)} className="text-indigo-600 cursor-pointer">
                    <HiOutlinePencil />
                  </button>
                  <button onClick={() => handleDelete(m)} className="text-red-600 cursor-pointer">
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(m => (
                <tr key={m.idMetodoPago} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {m.iconoImg && (
                      <img
                        src={`http://localhost:8080/uploads/${m.iconoImg}`} // Ruta corregida
                        className="w-10 h-10 object-contain bg-indigo-50 p-1 rounded-lg"
                        alt="Icono"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{m.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{m.descripcion}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActivo(m)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        m.activo 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      } cursor-pointer transition`}>
                      {m.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => handleEdit(m)} 
                      className="text-indigo-600 hover:text-indigo-800 cursor-pointer p-1 rounded hover:bg-indigo-50"
                      title="Editar"
                    >
                      <HiOutlinePencil size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(m)} 
                      className="text-red-600 hover:text-red-800 cursor-pointer p-1 rounded hover:bg-red-50"
                      title="Eliminar"
                    >
                      <HiOutlineTrash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MetodosPagoAdmin;