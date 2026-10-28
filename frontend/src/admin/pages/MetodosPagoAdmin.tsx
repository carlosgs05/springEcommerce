import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import {
  MagnifyingGlass,
  CreditCard,
  PencilSimple,
  Trash,
  Plus,
  X,
  CaretLeft,
  CaretRight,
  Minus,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { api, assetUrl } from "../../lib/api";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input, Select } from "../../components/ui/FormField";

type TipoMetodoPago = "MANUAL" | "PASARELA";
type ProveedorPasarela = "CULQI" | "MERCADOPAGO";

interface MetodoPagoDTO {
  idMetodoPago: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  iconoImg: string;
  configAdicional: string;
  tipo: TipoMetodoPago;
  proveedor: ProveedorPasarela | null;
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
  const [iconRefresh, setIconRefresh] = useState(Date.now());
  const [guardando, setGuardando] = useState(false);

  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [tipo, setTipo] = useState<TipoMetodoPago>("MANUAL");
  const [proveedor, setProveedor] = useState<ProveedorPasarela | "">("");
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const iconUrl = (icono: string) => assetUrl(`uploads/${icono}?t=${iconRefresh}`);

  const fetchMetodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get("/api/metodopago/listar");
      if (resp.data.success) {
        setMetodos(resp.data.data);
      } else {
        setError(resp.data.message);
      }
    } catch (err) {
      setError("No se pudo cargar la lista de métodos de pago");
      console.error(err);
    } finally {
      setLoading(false);
      setIconRefresh(Date.now());
    }
  };

  useEffect(() => {
    fetchMetodos();
  }, []);

  const filtered = metodos.filter(
    (m) =>
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, metodos.length]);

  const renderPagination = () =>
    totalPages > 1 ? (
      <div className="flex justify-center items-center gap-2 py-6 select-none">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="p-2 bg-canvas rounded-full text-text-muted hover:bg-border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <CaretLeft />
        </button>
        <span className="text-sm text-text-muted px-2">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="p-2 bg-canvas rounded-full text-text-muted hover:bg-border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <CaretRight />
        </button>
      </div>
    ) : null;

  // Drag & drop del icono
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
    setTipo("MANUAL");
    setProveedor("");
    setConfigItems([]);
    removeIcon();
    setShowModal(false);
  };

  const handleConfigChange = (index: number, field: keyof ConfigItem, value: string) => {
    const newItems = [...configItems];
    newItems[index][field] = value;
    setConfigItems(newItems);
  };

  const addConfigItem = () => setConfigItems([...configItems, { clave: "", valor: "" }]);

  const removeConfigItem = (index: number) => {
    const newItems = [...configItems];
    newItems.splice(index, 1);
    setConfigItems(newItems);
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Swal.fire("Error", "El nombre no puede estar vacío", "error");
      return;
    }
    if (tipo === "PASARELA" && !proveedor) {
      Swal.fire("Error", "Selecciona el proveedor de la pasarela", "error");
      return;
    }

    const configJson =
      configItems.length > 0
        ? JSON.stringify(
            configItems.reduce((acc: Record<string, string>, item) => {
              if (item.clave.trim()) acc[item.clave.trim()] = item.valor.trim();
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
        tipo,
        proveedor: tipo === "PASARELA" ? proveedor : null,
      })
    );
    if (currentIcon) form.append("icono", currentIcon);

    try {
      setGuardando(true);
      const url = idEdit
        ? `/api/metodopago/actualizar/${idEdit}`
        : "/api/metodopago/crear";
      const method = idEdit ? "put" : "post";
      const resp = await api[method](url, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resp.data.success) {
        await Swal.fire(
          idEdit ? "¡Actualizado!" : "¡Éxito!",
          `Método de pago ${idEdit ? "actualizado" : "creado"} correctamente`,
          "success"
        );
        resetForm();
        fetchMetodos();
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo guardar el método de pago";
      Swal.fire("Error", msg, "error");
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalNuevo = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (m: MetodoPagoDTO) => {
    setIdEdit(m.idMetodoPago);
    setNombre(m.nombre);
    setDescripcion(m.descripcion);
    setTipo(m.tipo ?? "MANUAL");
    setProveedor(m.proveedor ?? "");
    setExistingIcon(m.iconoImg);
    setPreviewUrl(m.iconoImg ? iconUrl(m.iconoImg) : "");
    try {
      if (m.configAdicional) {
        const parsed = JSON.parse(m.configAdicional);
        setConfigItems(
          Object.entries(parsed).map(([clave, valor]) => ({
            clave,
            valor: typeof valor === "string" ? valor : JSON.stringify(valor),
          }))
        );
      } else {
        setConfigItems([]);
      }
    } catch {
      setConfigItems([]);
    }
    setShowModal(true);
  };

  const handleEliminar = async (m: MetodoPagoDTO) => {
    const result = await Swal.fire({
      title: "¿Eliminar método de pago?",
      text: m.nombre,
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
    if (!result.isConfirmed) return;
    try {
      const resp = await api.delete(`/api/metodopago/eliminar/${m.idMetodoPago}`);
      if (resp.data.success) {
        await Swal.fire("¡Eliminado!", "Método de pago eliminado correctamente", "success");
        fetchMetodos();
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo eliminar el método de pago";
      Swal.fire("Error", msg, "error");
    }
  };

  const toggleActivo = async (m: MetodoPagoDTO) => {
    const result = await Swal.fire({
      title: m.activo ? "¿Desactivar método?" : "¿Activar método?",
      text: `Estás a punto de ${m.activo ? "desactivar" : "activar"} el método: ${m.nombre}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: m.activo ? "Sí, desactivar" : "Sí, activar",
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
    if (!result.isConfirmed) return;
    try {
      const resp = await api.put(
        `/api/metodopago/cambiar-estado/${m.idMetodoPago}?activo=${!m.activo}`
      );
      if (resp.data.success) {
        setMetodos((prev) =>
          prev.map((x) =>
            x.idMetodoPago === m.idMetodoPago ? { ...x, activo: !x.activo } : x
          )
        );
        Swal.fire(m.activo ? "Desactivado" : "Activado", resp.data.message, "success");
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo cambiar el estado";
      Swal.fire("Error", msg, "error");
    }
  };

  const Icono = ({ icono, size }: { icono: string; size: "sm" | "md" }) => (
    <div
      className={`flex items-center justify-center overflow-hidden bg-canvas rounded-xl border border-border shrink-0 ${
        size === "sm" ? "w-12 h-12" : "w-16 h-16"
      }`}
    >
      {icono ? (
        <img src={iconUrl(icono)} className="w-full h-full object-contain p-1" alt="Icono del método de pago" />
      ) : (
        <CreditCard className="text-text-muted" size={20} />
      )}
    </div>
  );

  const BadgeTipo = ({ m }: { m: MetodoPagoDTO }) =>
    m.tipo === "PASARELA" ? (
      <Badge variant="info">
        Pasarela{m.proveedor ? ` · ${m.proveedor === "CULQI" ? "Culqi" : "Mercado Pago"}` : ""}
      </Badge>
    ) : (
      <Badge variant="neutral">Manual</Badge>
    );

  const AccionesMetodo = ({ m }: { m: MetodoPagoDTO }) => (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => toggleActivo(m)}
        leftIcon={<ArrowsClockwise size={16} />}
      >
        {m.activo ? "Desactivar" : "Activar"}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleEditClick(m)}
        leftIcon={<PencilSimple size={16} />}
      >
        Editar
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => handleEliminar(m)}
        leftIcon={<Trash size={16} />}
      >
        Eliminar
      </Button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card
            elevation={3}
            padding="none"
            className="max-w-2xl w-full mx-4 my-8 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-text">
                {idEdit ? "Editar método de pago" : "Nuevo método de pago"}
              </h3>
              <button
                onClick={resetForm}
                className="text-text-muted hover:text-text transition cursor-pointer"
                aria-label="Cerrar"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Nombre</label>
                <Input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: PayPal, Tarjeta de crédito"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Tipo <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={tipo}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value as TipoMetodoPago;
                      setTipo(nuevoTipo);
                      if (nuevoTipo === "MANUAL") setProveedor("");
                      if (nuevoTipo === "PASARELA") setConfigItems([]);
                    }}
                  >
                    <option value="MANUAL">Manual (Yape, Plin, transferencia)</option>
                    <option value="PASARELA">Pasarela (cobro con tarjeta)</option>
                  </Select>
                </div>
                {tipo === "PASARELA" && (
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Proveedor <span className="text-danger">*</span>
                    </label>
                    <Select
                      value={proveedor}
                      onChange={(e) => setProveedor(e.target.value as ProveedorPasarela)}
                    >
                      <option value="">Selecciona un proveedor...</option>
                      <option value="CULQI">Culqi</option>
                      <option value="MERCADOPAGO">Mercado Pago</option>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-text mb-2">Descripción</label>
                  <textarea
                    className="block w-full min-h-11 h-[140px] rounded-control border border-border bg-surface px-3 py-2 text-base text-text sm:text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe el método de pago"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-text mb-2">Icono</label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors min-h-[140px] flex items-center justify-center ${
                      dragActive
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
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
                      aria-label="Subir icono"
                    />
                    {previewUrl || existingIcon ? (
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        <div className="relative w-full h-full flex justify-center">
                          <img
                            src={previewUrl || iconUrl(existingIcon)}
                            className="max-w-full max-h-[100px] mx-auto object-contain"
                            alt="Previsualización"
                          />
                          <button
                            onClick={removeIcon}
                            className="absolute top-2 right-2 bg-surface p-1.5 text-danger hover:brightness-90 rounded-full shadow-elevation-1 transition-colors cursor-pointer"
                            aria-label="Quitar icono"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CreditCard className="text-text-muted" size={32} />
                        <p className="text-sm text-text-muted">
                          Arrastra o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-text-muted">PNG, JPG, SVG (máx 2MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {tipo === "PASARELA" ? (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-sm text-amber-700">
                    Un método de pasarela no usa "Información adicional": el
                    pago se procesa con las llaves del proveedor configuradas
                    en el servidor, nunca con datos sueltos aquí (este campo
                    es público, lo ve cualquiera sin iniciar sesión).
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-text">
                      Información adicional (opcional)
                    </label>
                    <button
                      type="button"
                      onClick={addConfigItem}
                      className="flex items-center gap-1 text-sm text-primary hover:brightness-110 cursor-pointer"
                    >
                      <Plus size={16} /> Agregar campo
                    </button>
                  </div>
                  {configItems.length > 0 && (
                    <div className="space-y-3">
                      {configItems.map((item, index) => (
                        <div key={index} className="flex gap-3">
                          <Input
                            className="flex-1"
                            type="text"
                            placeholder="Clave (ej: comisión, moneda)"
                            value={item.clave}
                            onChange={(e) => handleConfigChange(index, "clave", e.target.value)}
                          />
                          <Input
                            className="flex-1"
                            type="text"
                            placeholder="Valor (ej: 2.5%, USD)"
                            value={item.valor}
                            onChange={(e) => handleConfigChange(index, "valor", e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeConfigItem(index)}
                            className="p-2.5 rounded-xl text-danger hover:bg-danger/10 cursor-pointer transition-colors"
                            aria-label="Quitar campo"
                          >
                            <Minus size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="secondary" onClick={resetForm} disabled={guardando}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleGuardar} loading={guardando}>
                {idEdit ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/15 p-2 rounded-xl">
              <CreditCard className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text">
                Gestión de Métodos de Pago
              </h1>
              <p className="text-sm text-text-muted">
                {filtered.length} método{filtered.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <Input
              className="pl-9"
              placeholder="Buscar método..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar método de pago"
            />
          </div>
          <Button onClick={abrirModalNuevo} leftIcon={<Plus size={18} />} className="shrink-0">
            Añadir método
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-text-muted">Cargando métodos de pago...</span>
            </div>
          </div>
        ) : error ? (
          <Card elevation={1} padding="md" className="border-danger/30">
            <CardBody className="flex items-center gap-3 text-danger">
              <X size={24} />
              <span>{error}</span>
            </CardBody>
          </Card>
        ) : filtered.length === 0 ? (
          <Card elevation={1} padding="lg">
            <CardBody className="text-center flex flex-col items-center gap-2">
              <CreditCard size={32} className="text-text-muted" />
              <p className="text-lg text-text">
                {searchTerm
                  ? "No hay métodos que coincidan con tu búsqueda"
                  : "No hay métodos de pago registrados"}
              </p>
              {!searchTerm && (
                <p className="text-sm text-text-muted">
                  Agrega tu primer método usando el botón superior
                </p>
              )}
            </CardBody>
          </Card>
        ) : isMobile ? (
          <div className="space-y-4">
            {paged.map((m) => (
              <Card key={m.idMetodoPago} elevation={1} padding="md">
                <div className="flex items-start gap-3 mb-3">
                  <Icono icono={m.iconoImg} size="sm" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-text">{m.nombre}</span>
                      <Badge variant={m.activo ? "success" : "danger"}>
                        {m.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <BadgeTipo m={m} />
                    </div>
                    {m.descripcion && (
                      <p className="mt-2 text-sm text-text-muted">{m.descripcion}</p>
                    )}
                  </div>
                </div>
                <AccionesMetodo m={m} />
              </Card>
            ))}
            {renderPagination()}
          </div>
        ) : (
          <>
            <Card elevation={1} padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-canvas">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Icono
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paged.map((m) => (
                      <tr key={m.idMetodoPago} className="hover:bg-canvas/60 transition-colors">
                        <td className="px-6 py-4">
                          <Icono icono={m.iconoImg} size="md" />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-text">{m.nombre}</td>
                        <td className="px-6 py-4 text-sm">
                          <BadgeTipo m={m} />
                        </td>
                        <td className="px-6 py-4 text-sm text-text-muted max-w-xs">
                          {m.descripcion || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={m.activo ? "success" : "danger"}>
                            {m.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <AccionesMetodo m={m} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default MetodosPagoAdmin;
