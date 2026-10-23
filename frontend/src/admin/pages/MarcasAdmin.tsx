import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import {
  MagnifyingGlass,
  Tag,
  PencilSimple,
  Trash,
  Plus,
  X,
  CaretLeft,
  CaretRight,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { api, assetUrl } from "../../lib/api";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/FormField";

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
  const [guardando, setGuardando] = useState(false);

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

  const logoUrl = (imagen: string) => assetUrl(`uploads/${imagen}?t=${iconRefresh}`);

  const fetchMarcas = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get("/api/marcas/listar");
      if (resp.data.success) {
        setMarcas(resp.data.data);
      } else {
        setError(resp.data.message);
      }
    } catch (err) {
      setError("No se pudo cargar la lista de marcas");
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
      setGuardando(true);
      const url = idEdit
        ? `/api/marcas/actualizar/${idEdit}`
        : "/api/marcas/crear";
      const method = idEdit ? "put" : "post";

      const resp = await api[method](url, formData, {
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
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo guardar la marca";
      Swal.fire("Error", msg, "error");
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditClick = (marca: MarcaDTO) => {
    setIdEdit(marca.idmarca);
    setNombre(marca.nombre);
    setExistingImage(marca.imagen);
    setPreviewUrl(marca.imagen ? logoUrl(marca.imagen) : "");
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

    if (!result.isConfirmed) return;
    try {
      const resp = await api.delete(`/api/marcas/eliminar/${marca.idmarca}`);
      if (resp.data.success) {
        await Swal.fire("Eliminado", "Marca eliminada correctamente", "success");
        fetchMarcas();
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo eliminar la marca";
      Swal.fire("Error", msg, "error");
    }
  };

  // Tamaño consistente del logo, sin importar las dimensiones reales de la imagen subida
  const Logo = ({ imagen, size }: { imagen: string; size: "sm" | "md" }) => (
    <div
      className={`flex items-center justify-center overflow-hidden bg-canvas rounded-xl border border-border shrink-0 ${
        size === "sm" ? "w-12 h-12" : "w-16 h-16"
      }`}
    >
      {imagen ? (
        <img
          src={logoUrl(imagen)}
          className="w-full h-full object-cover"
          alt="Logo de la marca"
        />
      ) : (
        <ImageIcon className="text-text-muted" size={20} />
      )}
    </div>
  );

  const AccionesMarca = ({ m }: { m: MarcaDTO }) => (
    <div className="flex flex-wrap gap-2">
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
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card
            elevation={3}
            padding="none"
            className="max-w-md w-full mx-4 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-text">
                {idEdit ? "Editar marca" : "Nueva marca"}
              </h3>
              <button
                onClick={resetForm}
                className="text-text-muted hover:text-text transition cursor-pointer"
                aria-label="Cerrar"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Nombre de la marca
                </label>
                <Input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Escribe el nombre de la marca"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Logo de la marca
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors min-h-[200px] flex items-center justify-center ${
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
                    aria-label="Subir logo"
                  />
                  {previewUrl || existingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl || logoUrl(existingImage)}
                          className="w-full h-full max-w-full max-h-full mx-auto object-contain"
                          alt="Previsualización"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-surface p-1.5 text-danger hover:brightness-90 rounded-full shadow-elevation-1 transition-colors cursor-pointer"
                          aria-label="Quitar imagen"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ImageIcon className="text-text-muted" size={40} />
                      <p className="text-sm text-text-muted">
                        Arrastra y suelta el logo aquí o haz clic para
                        seleccionar
                      </p>
                      <p className="text-xs text-text-muted">
                        Formatos: JPG, PNG, GIF
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="secondary" onClick={resetForm} disabled={guardando}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSubmit} loading={guardando}>
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
              <Tag className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text">
                Gestión de Marcas
              </h1>
              <p className="text-sm text-text-muted">
                {filtered.length} marca{filtered.length === 1 ? "" : "s"}
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
              placeholder="Buscar marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar marca"
            />
          </div>
          <Button
            onClick={() => setShowModal(true)}
            leftIcon={<Plus size={18} />}
            className="shrink-0"
          >
            Añadir marca
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-text-muted">Cargando marcas...</span>
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
              <Tag size={32} className="text-text-muted" />
              <p className="text-lg text-text">
                {searchTerm
                  ? "No hay marcas que coincidan con tu búsqueda"
                  : "No hay marcas registradas"}
              </p>
              {!searchTerm && (
                <p className="text-sm text-text-muted">
                  Agrega tu primera marca usando el botón superior
                </p>
              )}
            </CardBody>
          </Card>
        ) : isMobile ? (
          <div className="space-y-4">
            {paged.map((m) => (
              <Card key={m.idmarca} elevation={1} padding="md">
                <div className="flex justify-between items-center gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Logo imagen={m.imagen} size="sm" />
                    <span className="font-semibold text-text">{m.nombre}</span>
                  </div>
                </div>
                <AccionesMarca m={m} />
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
                        Logo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paged.map((m) => (
                      <tr
                        key={m.idmarca}
                        className="hover:bg-canvas/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Logo imagen={m.imagen} size="md" />
                        </td>
                        <td className="px-6 py-4 text-sm text-text">
                          {m.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <AccionesMarca m={m} />
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

export default MarcasAdmin;
