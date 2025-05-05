import { useState, useEffect, ChangeEvent } from "react";
import {
  FaSpinner,
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";

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
}

interface Categoria {
  idcategoria: number;
  nombre: string;
}
interface Marca {
  idmarca: number;
  nombre: string;
}

const ProductosAdmin = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
      const [prodRes, catRes, marRes] = await Promise.all([
        axios.get("http://localhost:8080/api/productos/listarAll"),
        axios.get("http://localhost:8080/api/categorias/listar"),
        axios.get("http://localhost:8080/api/marcas/listar"),
      ]);
      if (prodRes.data.success) setProductos(prodRes.data.data);
      else setError(prodRes.data.message);
      if (catRes.data.success) setCategorias(catRes.data.data);
      if (marRes.data.success) setMarcas(marRes.data.data);
    } catch (err) {
      setError("Error al cargar datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      handleNewFiles(e.dataTransfer.files);
    }
  };

  const handleNewFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    const totalImagenes =
      existingImages.length + imagenes.length + newFiles.length;

    if (totalImagenes > 6) {
      Swal.fire("Error", "Máximo 6 imágenes permitidas", "error");
      return;
    }

    const allowedFiles = newFiles.slice(
      0,
      6 - (existingImages.length + imagenes.length)
    );

    setImagenes((prev) => [...prev, ...allowedFiles]);
    setPreviewUrls((prev) => [
      ...prev,
      ...allowedFiles.map((file) => URL.createObjectURL(file)),
    ]);
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
  };

  const handleSubmit = async () => {
    if (
      !nombre.trim() ||
      !descripcion.trim() ||
      !precio ||
      !stock ||
      !categoriaId ||
      !marcaId
    ) {
      return Swal.fire("Error", "Todos los campos son requeridos", "error");
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: parseFloat(precio),
      stock: parseInt(stock),
      idcategoria: parseInt(categoriaId),
      idmarca: parseInt(marcaId),
      especificaciones: [],
    };

    const formData = new FormData();
    formData.append("producto", JSON.stringify(payload));
    imagenes.forEach((img) => formData.append("imagenes", img));

    try {
      const url = idEdit
        ? `http://localhost:8080/api/productos/actualizar/${idEdit}`
        : "http://localhost:8080/api/productos/crear";

      const method = idEdit ? "put" : "post";

      const resp = await axios[method](url, formData, {
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
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
      console.error(err);
    }
  };

  const handleImageDelete = async (name: string) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar imagen?",
      text: name,
      icon: "warning",
      showCancelButton: true,
    });

    if (!isConfirmed || idEdit === null) return;

    try {
      const resp = await axios.delete(
        `http://localhost:8080/api/productos/imagenes/eliminar/${encodeURIComponent(
          name
        )}`
      );

      if (resp.data.success) {
        Swal.fire("¡Eliminada!", "Imagen eliminada", "success");
        setExistingImages((imgs) => imgs.filter((i) => i !== name));
      } else {
        throw new Error(resp.data.message);
      }
    } catch (e: any) {
      Swal.fire("Error", e.response?.data?.message || e.message, "error");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (prod: Producto) => {
    const res = await Swal.fire({
      title: "¿Eliminar producto?",
      text: prod.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (res.isConfirmed) {
      try {
        const resp = await axios.delete(
          `http://localhost:8080/api/productos/eliminar/${prod.idproducto}`
        );

        if (resp.data.success) {
          await Swal.fire(
            "Eliminado",
            "Producto eliminado correctamente",
            "success"
          );
          fetchData();
        } else {
          throw new Error(resp.data.message);
        }
      } catch (err: any) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
        console.error(err);
      }
    }
  };

  const handlePreview = (prod: Producto) => {
    Swal.fire({
      title: `<div style="font-size: 1.2rem; color: #333; margin-bottom: 1rem;">${prod.nombre}</div>`,
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
                        transition: transform 0.2s;
                        aspect-ratio: 1/1;">
              <img 
                src="http://localhost:8080/uploads/${name}" 
                style="width: 100%;
                      height: 100%;
                      object-fit: contain;
                      border-radius: 4px;"
                onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiNjY2NjY2MiPjxwYXRoIGQ9Ik0xOS41IDEyLjlIMTNWMTloMS43bC41LS4zdjAuM2gtNHYtNkg1LjV2LTEuMWMwLS4zLjItLjUuNS0uNWgxMS4xYy4zIDAgLjUuMi41LjV2MS4xem0tNi44IDYuOWg0LjNjLjMgMCAuNS0uMi41LS41di0zLjZsLTIuOSAyLjMtMi45LTIuM3YzLjZjMCAuMy4yLjUuNS41em0tNC41LTEuOGwtMy41LTIuOVYxOWgzLjVsLjUtLjR6TTIwIDh2OS40YzAgMS4xLS45IDItMiAyaC0xLjZ2LTMuNWMwLS43LS42LTEuMy0xLjMtMS4zaC03LjRjLS43IDAtMS4zLjYtMS4zIDEuM1YyMEg2Yy0xLjEgMC0yLS45LTItMlY4YzAtMS4xLjktMiAyLTJoMTJjMS4xIDAgMiAuOSAyIDJ6TTkuNSA5Yy0xLjEgMC0yIC45LTIgMnMuOSAyIDIgMiAyLS45IDItMi0uOS0yLTItMnoiLz48L3N2Zz4='"
              />
              <div style="position: absolute;
                          bottom: 4px;
                          right: 4px;
                          background: rgba(0,0,0,0.7);
                          color: white;
                          font-size: 0.7rem;
                          padding: 2px 4px;
                          border-radius: 3px;">
                ${name.length > 15 ? name.substring(0, 12) + "..." : name}
              </div>
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
    });
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Gestión de Productos
          </h1>
          <p className="text-gray-500">Administra los productos de tu tienda</p>
        </header>

        {/* Formulario */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Columna Izquierda */}
            <div className="h-full flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="flex-grow flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  className="w-full h-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="h-full flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((c) => (
                    <option key={c.idcategoria} value={c.idcategoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={marcaId}
                  onChange={(e) => setMarcaId(e.target.value)}
                >
                  <option value="">Seleccionar marca</option>
                  {marcas.map((m) => (
                    <option key={m.idmarca} value={m.idmarca}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección de imágenes en nueva fila */}
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {idEdit ? "Agregar imágenes" : "Imágenes"}
                <span className="text-gray-500 ml-1">(Máximo 6)</span>
              </label>

              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
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
                  multiple
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  id="file-upload"
                />
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
                    Arrastra y suelta imágenes aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos: JPG, PNG, GIF (Máx. 6 imágenes)
                  </p>
                </div>
              </div>
            </div>

            {(previewUrls.length > 0 || existingImages.length > 0) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vista previa de imágenes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {existingImages.map((name, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group aspect-square"
                    >
                      <img
                        src={`http://localhost:8080/uploads/${name}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                        alt={`Imagen ${index + 1}`}
                      />
                      <button
                        onClick={() => handleImageDelete(name)}
                        className="absolute top-1 right-1 bg-white p-1 text-red-600 hover:text-red-700 rounded-full shadow-sm hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                  {previewUrls.map((url, index) => (
                    <div
                      key={`preview-${index}`}
                      className="relative group aspect-square"
                    >
                      <img
                        src={url}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                        alt={`Previsualización ${index + 1}`}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white p-1 text-red-600 hover:text-red-700 rounded-full shadow-sm hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {existingImages.length + previewUrls.length} de 6 imágenes
                  seleccionadas
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <FaPlusCircle className="mr-2" />
              {idEdit ? "Actualizar Producto" : "Crear Producto"}
            </button>
            {idEdit && (
              <button
                onClick={resetForm}
                className="inline-flex items-center px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
        ) : productos.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
            No hay productos registrados
          </div>
        ) : isMobile ? (
          <div className="space-y-3">
            {productos.map((prod) => (
              <div
                key={prod.idproducto}
                className="bg-white p-4 shadow-sm rounded-lg border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {prod.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {prod.descripcion}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(prod)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                    >
                      <FaEye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditClick(prod)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleEliminar(prod)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Precio:</span>
                    <span className="ml-1 text-gray-800">S/ {prod.precio}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock:</span>
                    <span className="ml-1 text-gray-800">{prod.stock}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Categoría:</span>
                    <span className="ml-1 text-gray-800">
                      {prod.nombreCategoria}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Marca:</span>
                    <span className="ml-1 text-gray-800">
                      {prod.nombreMarca}
                    </span>
                  </div>
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
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((prod) => (
                  <tr key={prod.idproducto} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">
                      {prod.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      S/ {prod.precio}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {prod.stock}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {prod.nombreCategoria}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {prod.nombreMarca}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => handlePreview(prod)}
                        className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(prod)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleEliminar(prod)}
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

export default ProductosAdmin;
