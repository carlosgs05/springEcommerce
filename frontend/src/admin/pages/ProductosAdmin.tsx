import { useState, useEffect, ChangeEvent } from "react";
import {
  MagnifyingGlass,
  PencilSimple,
  Trash,
  Plus,
  X,
  Eye,
  Package,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import Select from "react-select";
import { api, assetUrl } from "@/lib/api";
import { getStockBadge } from "@/lib/stockBadge";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormField";

interface Producto {
  idproducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  idcategoria: number;
  nombreCategoria: string;
  idmarca: number;
  nombreMarca: string;
  fechacreacion: string;
  imagenesNombres: string[];
  especificaciones: EspecificacionDTO[];
  calificacionPromedio: number;
  totalResenas: number;
}

interface Categoria {
  idcategoria: number;
  nombre: string;
}

interface Marca {
  idmarca: number;
  nombre: string;
}

interface EspecificacionDTO {
  unidadmedida: string;
  valor: string;
  descripcion: string;
}

const customSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "var(--color-surface)",
    borderRadius: "10px",
    borderColor: "var(--color-border)",
    minHeight: "44px",
    boxShadow: "none",
    "&:hover": { borderColor: "var(--color-primary)" },
  }),
  singleValue: (provided: any) => ({ ...provided, color: "var(--color-text)" }),
  input: (provided: any) => ({ ...provided, color: "var(--color-text)" }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "var(--color-primary)"
      : state.isFocused
        ? "var(--color-canvas)"
        : "var(--color-surface)",
    color: state.isSelected ? "var(--color-surface)" : "var(--color-text)",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
  }),
};

const ProductosAdmin = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [especificaciones, setEspecificaciones] = useState<EspecificacionDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Form state
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [precio, setPrecio] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [marcaId, setMarcaId] = useState<string>("");
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, catRes, marRes] = await Promise.all([
        api.get("/api/productos/listarAll"),
        api.get("/api/categorias/listar"),
        api.get("/api/marcas/listar"),
      ]);

      if (prodRes.data.success) {
        setProductos(
          prodRes.data.data.map((p: any) => ({
            ...p,
            especificaciones: p.especificaciones || [],
            calificacionPromedio: p.calificacionPromedio ?? 0,
            totalResenas: p.totalResenas ?? 0,
          }))
        );
      } else {
        setError(prodRes.data.message);
      }

      if (catRes.data.success) setCategorias(catRes.data.data);
      if (marRes.data.success) setMarcas(marRes.data.data);
    } catch (err) {
      setError("No se pudo cargar la lista de productos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
      handleNewFiles(e.dataTransfer.files);
    }
  };

  const handleNewFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    const totalImagenes = existingImages.length + imagenes.length + newFiles.length;

    if (totalImagenes > 6) {
      Swal.fire("Error", "Máximo 6 imágenes permitidas", "error");
      return;
    }

    const allowedFiles = newFiles.slice(0, 6 - (existingImages.length + imagenes.length));

    setImagenes((prev) => [...prev, ...allowedFiles]);
    setPreviewUrls((prev) => [...prev, ...allowedFiles.map((file) => URL.createObjectURL(file))]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleNewFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    const newImagenes = [...imagenes];
    const newPreviewUrls = [...previewUrls];
    newImagenes.splice(index, 1);
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setImagenes(newImagenes);
    setPreviewUrls(newPreviewUrls);
  };

  const resetForm = () => {
    setIdEdit(null);
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setStock("");
    setCategoriaId("");
    setMarcaId("");
    setImagenes([]);
    setExistingImages([]);
    setPreviewUrls([]);
    setEspecificaciones([]);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !descripcion.trim() || !precio || !stock || !categoriaId || !marcaId) {
      Swal.fire("Error", "Todos los campos son requeridos", "error");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: parseFloat(precio),
      stock: parseInt(stock),
      idcategoria: parseInt(categoriaId),
      idmarca: parseInt(marcaId),
      especificaciones: especificaciones.filter(
        (spec) => spec.unidadmedida.trim() || spec.valor.trim() || spec.descripcion.trim()
      ),
    };

    const formData = new FormData();
    formData.append("producto", JSON.stringify(payload));

    if (idEdit) {
      existingImages.forEach((imgName) => {
        formData.append("keepImages", imgName);
      });
    }

    imagenes.forEach((img) => formData.append("imagenes", img));

    try {
      setGuardando(true);
      const url = idEdit ? `/api/productos/actualizar/${idEdit}` : "/api/productos/crear";
      const method = idEdit ? "put" : "post";

      const resp = await api[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (resp.data.success) {
        await Swal.fire(
          idEdit ? "¡Actualizado!" : "¡Éxito!",
          `Producto ${idEdit ? "actualizado" : "creado"} correctamente`,
          "success"
        );
        resetForm();
        fetchData();
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo guardar el producto";
      Swal.fire("Error", msg, "error");
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleImageDelete = async (name: string) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar imagen?",
      text: name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed || idEdit === null) return;

    try {
      const resp = await api.delete(
        `/api/productos/imagenes/eliminar/${encodeURIComponent(name)}`
      );

      if (resp.data.success) {
        Swal.fire("¡Eliminada!", "Imagen eliminada", "success");
        setExistingImages((imgs) => imgs.filter((i) => i !== name));
      } else {
        throw new Error(resp.data.message);
      }
    } catch (e: any) {
      const msg =
        (axios.isAxiosError(e) && e.response?.data?.message) || e.message || "No se pudo eliminar la imagen";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleEditClick = (prod: Producto) => {
    setIdEdit(prod.idproducto);
    setNombre(prod.nombre);
    setDescripcion(prod.descripcion);
    setPrecio(prod.precio.toString());
    setStock(prod.stock.toString());
    setCategoriaId(prod.idcategoria.toString());
    setMarcaId(prod.idmarca.toString());
    setImagenes([]);
    setPreviewUrls([]);
    setExistingImages(prod.imagenesNombres);
    setEspecificaciones(prod.especificaciones || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (prod: Producto) => {
    const res = await Swal.fire({
      title: "¿Eliminar producto?",
      text: prod.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "rounded-2xl",
        confirmButton:
          "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all",
        cancelButton:
          "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-xl transition-all",
      },
    });

    if (!res.isConfirmed) return;
    try {
      const resp = await api.delete(`/api/productos/eliminar/${prod.idproducto}`);

      if (resp.data.success) {
        await Swal.fire("Eliminado", "Producto eliminado correctamente", "success");
        fetchData();
      } else {
        throw new Error(resp.data.message);
      }
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo eliminar el producto";
      Swal.fire("Error", msg, "error");
      console.error(err);
    }
  };

  const handlePreview = (prod: Producto) => {
    Swal.fire({
      title: `<div style="font-size: 1.2rem; margin-bottom: 1rem;">${prod.nombre}</div>`,
      html: `
        <div style="display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    max-height: 60vh;
                    padding: 0.5rem;
                    overflow-y: auto;
                    width: 100%;
                    align-items: center;">
          ${prod.imagenesNombres
            .map(
              (name) => `
            <div style="position: relative;
                        border: 1px solid #eee;
                        border-radius: 8px;
                        padding: 4px;
                        background: #f8f9fa;
                        aspect-ratio: 1/1;">
              <img
                src="${assetUrl(`uploads/${name}`)}"
                style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;"
              />
            </div>
          `
            )
            .join("")}
        </div>
      `,
      width: "60%",
      maxWidth: "800px",
      backdrop: "rgba(0,0,0,0.4)",
      confirmButtonText: "Cerrar",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: { popup: "rounded-2xl" },
    });
  };

  const categoriaOptions = categorias.map((c) => ({
    value: c.idcategoria.toString(),
    label: c.nombre,
  }));

  const marcaOptions = marcas.map((m) => ({
    value: m.idmarca.toString(),
    label: m.nombre,
  }));

  const AccionesProducto = ({ p }: { p: Producto }) => (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="secondary" onClick={() => handlePreview(p)} leftIcon={<Eye size={16} />}>
        Ver
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleEditClick(p)}
        leftIcon={<PencilSimple size={16} />}
      >
        Editar
      </Button>
      <Button size="sm" variant="danger" onClick={() => handleEliminar(p)} leftIcon={<Trash size={16} />}>
        Eliminar
      </Button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/15 p-2 rounded-xl">
              <Package className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text">Gestión de Productos</h1>
              <p className="text-sm text-text-muted">
                {filtered.length} producto{filtered.length === 1 ? "" : "s"}
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
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar producto"
            />
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              leftIcon={<Plus size={18} />}
              className="shrink-0"
            >
              Añadir producto
            </Button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <Card elevation={1} padding="md" className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-text">
                {idEdit ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button
                onClick={resetForm}
                className="text-text-muted hover:text-text transition cursor-pointer"
                aria-label="Cerrar formulario"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Nombre</label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="flex-grow flex flex-col">
                  <label className="block text-sm font-semibold text-text mb-2">Descripción</label>
                  <Textarea
                    className="min-h-32"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Precio</label>
                    <Input
                      type="number"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Stock</label>
                    <Input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Categoría</label>
                  <Select
                    options={categoriaOptions}
                    value={categoriaOptions.find((opt) => opt.value === categoriaId) || null}
                    onChange={(selected) => setCategoriaId(selected?.value || "")}
                    placeholder="Seleccionar categoría"
                    styles={customSelectStyles}
                    className="w-full"
                    classNamePrefix="select"
                    isSearchable
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Marca</label>
                  <Select
                    options={marcaOptions}
                    value={marcaOptions.find((opt) => opt.value === marcaId) || null}
                    onChange={(selected) => setMarcaId(selected?.value || "")}
                    placeholder="Seleccionar marca"
                    styles={customSelectStyles}
                    className="w-full"
                    classNamePrefix="select"
                    isSearchable
                  />
                </div>
              </div>
            </div>

            {/* Especificaciones */}
            <div className="mt-6 space-y-3">
              <label className="block text-sm font-semibold text-text">Especificaciones</label>
              <p className="text-xs text-text-muted">(Unidad de medida, Valor, Descripción)</p>
              {especificaciones.map((spec, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Unidad de medida"
                    value={spec.unidadmedida}
                    onChange={(e) => {
                      const newSpecs = [...especificaciones];
                      newSpecs[index].unidadmedida = e.target.value;
                      setEspecificaciones(newSpecs);
                    }}
                  />
                  <Input
                    placeholder="Valor"
                    value={spec.valor}
                    onChange={(e) => {
                      const newSpecs = [...especificaciones];
                      newSpecs[index].valor = e.target.value;
                      setEspecificaciones(newSpecs);
                    }}
                  />
                  <Input
                    placeholder="Descripción"
                    value={spec.descripcion}
                    onChange={(e) => {
                      const newSpecs = [...especificaciones];
                      newSpecs[index].descripcion = e.target.value;
                      setEspecificaciones(newSpecs);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newSpecs = [...especificaciones];
                      newSpecs.splice(index, 1);
                      setEspecificaciones(newSpecs);
                    }}
                    className="px-2 py-2 text-danger hover:brightness-90 transition-colors cursor-pointer"
                    aria-label="Quitar especificación"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={() =>
                  setEspecificaciones([
                    ...especificaciones,
                    { unidadmedida: "", valor: "", descripcion: "" },
                  ])
                }
              >
                Agregar especificación
              </Button>
            </div>

            {/* Imágenes */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {idEdit ? "Agregar imágenes" : "Imágenes"}
                  <span className="text-text-muted ml-1">(Máximo 6)</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                    dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    aria-label="Subir imágenes"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ImageIcon className="text-text-muted" size={36} />
                    <p className="text-sm text-text-muted">
                      Arrastra y suelta imágenes aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-text-muted">Formatos: JPG, PNG, GIF (Máx. 6)</p>
                  </div>
                </div>
              </div>

              {(previewUrls.length > 0 || existingImages.length > 0) && (
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Vista previa de imágenes
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {existingImages.map((name, index) => (
                      <div key={`existing-${index}`} className="relative group aspect-square">
                        <img
                          src={assetUrl(`uploads/${name}`)}
                          className="w-full h-full object-cover rounded-xl border border-border"
                          alt={`Imagen ${index + 1}`}
                        />
                        <button
                          onClick={() => handleImageDelete(name)}
                          className="absolute top-1 right-1 bg-surface p-1 text-danger rounded-full shadow-elevation-1 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          aria-label="Eliminar imagen"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {previewUrls.map((url, index) => (
                      <div key={`preview-${index}`} className="relative group aspect-square">
                        <img
                          src={url}
                          className="w-full h-full object-cover rounded-xl border border-border"
                          alt={`Previsualización ${index + 1}`}
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-surface p-1 text-danger rounded-full shadow-elevation-1 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          aria-label="Quitar imagen nueva"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-1 text-center">
                    {existingImages.length + previewUrls.length} de 6 imágenes seleccionadas
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="primary" onClick={handleSubmit} loading={guardando}>
                {idEdit ? "Actualizar producto" : "Crear producto"}
              </Button>
              <Button variant="secondary" onClick={resetForm} disabled={guardando}>
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Lista de productos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-text-muted">Cargando productos...</span>
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
              <Package size={32} className="text-text-muted" />
              <p className="text-lg text-text">
                {searchTerm
                  ? "No hay productos que coincidan con tu búsqueda"
                  : "No hay productos registrados"}
              </p>
              {!searchTerm && (
                <p className="text-sm text-text-muted">
                  Agrega tu primer producto usando el botón superior
                </p>
              )}
            </CardBody>
          </Card>
        ) : isMobile ? (
          <div className="space-y-4">
            {filtered.map((p) => {
              const stockBadge = getStockBadge(p.stock);
              return (
                <Card key={p.idproducto} elevation={1} padding="md">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-text">{p.nombre}</h3>
                      <p className="text-sm text-text-muted line-clamp-2">{p.descripcion}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-text-muted">Precio:</span>{" "}
                      <span className="text-text">S/ {p.precio.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Stock:</span>{" "}
                      <Badge variant={stockBadge.variant} size="sm">
                        {stockBadge.label} ({p.stock})
                      </Badge>
                    </div>
                    <div>
                      <span className="text-text-muted">Categoría:</span>{" "}
                      <span className="text-text">{p.nombreCategoria}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Marca:</span>{" "}
                      <span className="text-text">{p.nombreMarca}</span>
                    </div>
                  </div>
                  <AccionesProducto p={p} />
                </Card>
              );
            })}
          </div>
        ) : (
          <Card elevation={1} padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-canvas">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => {
                    const stockBadge = getStockBadge(p.stock);
                    return (
                      <tr key={p.idproducto} className="hover:bg-canvas/60 transition-colors">
                        <td className="px-6 py-4 text-sm text-text max-w-xs truncate">{p.nombre}</td>
                        <td className="px-6 py-4 text-sm text-text">S/ {p.precio.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={stockBadge.variant} size="sm">
                            {stockBadge.label} ({p.stock})
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-muted">{p.nombreCategoria}</td>
                        <td className="px-6 py-4 text-sm text-text-muted">{p.nombreMarca}</td>
                        <td className="px-6 py-4 text-sm">
                          <AccionesProducto p={p} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductosAdmin;
