import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import {
  MagnifyingGlass,
  SquaresFour,
  PencilSimple,
  Trash,
  Plus,
  X,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { api } from "../../lib/api";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/FormField";

interface CategoriaDTO {
  idcategoria: number;
  nombre: string;
}

const PAGE_SIZE = 4;

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [categoriaEditando, setCategoriaEditando] =
    useState<CategoriaDTO | null>(null);
  const [nombreCategoria, setNombreCategoria] = useState<string>("");
  const [guardando, setGuardando] = useState(false);

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get("/api/categorias/listar");
      if (resp.data.success) {
        setCategorias(resp.data.data);
      } else {
        setError(resp.data.message);
      }
    } catch (err) {
      setError("No se pudo cargar la lista de categorías");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Search & pagination
  const filtered = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categorias.length]);

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

  // Crear o actualizar
  const handleGuardar = async () => {
    if (!nombreCategoria.trim()) {
      Swal.fire("Error", "El nombre no puede estar vacío", "error");
      return;
    }
    try {
      setGuardando(true);
      if (categoriaEditando) {
        const resp = await api.put(
          `/api/categorias/actualizar/${categoriaEditando.idcategoria}`,
          { nombre: nombreCategoria }
        );
        if (resp.data.success) {
          Swal.fire(
            "¡Actualizado!",
            "Categoría actualizada correctamente",
            "success"
          );
        } else throw new Error(resp.data.message);
      } else {
        const resp = await api.post("/api/categorias/crear", {
          nombre: nombreCategoria,
        });
        if (resp.data.success) {
          Swal.fire("¡Éxito!", "Categoría creada correctamente", "success");
        } else throw new Error(resp.data.message);
      }
      fetchCategorias();
      cerrarModal();
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo guardar la categoría";
      Swal.fire("Error", msg, "error");
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalNueva = () => {
    setCategoriaEditando(null);
    setNombreCategoria("");
    setShowModal(true);
  };

  const abrirModalEditar = (categoria: CategoriaDTO) => {
    setCategoriaEditando(categoria);
    setNombreCategoria(categoria.nombre);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setCategoriaEditando(null);
    setNombreCategoria("");
  };

  const handleEliminar = async (categoria: CategoriaDTO) => {
    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: categoria.nombre,
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
      const resp = await api.delete(
        `/api/categorias/eliminar/${categoria.idcategoria}`
      );
      if (resp.data.success) {
        Swal.fire(
          "¡Eliminado!",
          "Categoría eliminada correctamente",
          "success"
        );
        fetchCategorias();
      } else throw new Error(resp.data.message);
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo eliminar la categoría";
      Swal.fire("Error", msg, "error");
    }
  };

  const AccionesCategoria = ({ c }: { c: CategoriaDTO }) => (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => abrirModalEditar(c)}
        leftIcon={<PencilSimple size={16} />}
      >
        Editar
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => handleEliminar(c)}
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card
            elevation={3}
            padding="none"
            className="max-w-md w-full mx-4 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-text">
                {categoriaEditando ? "Editar categoría" : "Nueva categoría"}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-text-muted hover:text-text transition cursor-pointer"
                aria-label="Cerrar"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6">
              <label
                className="block text-sm font-semibold text-text mb-2"
                htmlFor="nombreCategoria"
              >
                Nombre de la categoría
              </label>
              <Input
                id="nombreCategoria"
                type="text"
                placeholder="Escribe el nombre"
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button variant="secondary" onClick={cerrarModal} disabled={guardando}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleGuardar} loading={guardando}>
                {categoriaEditando ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/15 p-2 rounded-xl">
              <SquaresFour className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text">
                Gestión de Categorías
              </h1>
              <p className="text-sm text-text-muted">
                {filtered.length} categoría{filtered.length === 1 ? "" : "s"}
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
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar categoría"
            />
          </div>
          <Button
            onClick={abrirModalNueva}
            leftIcon={<Plus size={18} />}
            className="shrink-0"
          >
            Añadir categoría
          </Button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-text-muted">Cargando categorías...</span>
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
              <SquaresFour size={32} className="text-text-muted" />
              <p className="text-lg text-text">
                {searchTerm
                  ? "No hay categorías que coincidan con tu búsqueda"
                  : "No hay categorías registradas"}
              </p>
              {!searchTerm && (
                <p className="text-sm text-text-muted">
                  Agrega tu primera categoría usando el botón superior
                </p>
              )}
            </CardBody>
          </Card>
        ) : isMobile ? (
          <div className="space-y-4">
            {paged.map((c) => (
              <Card key={c.idcategoria} elevation={1} padding="md">
                <div className="flex justify-between items-center gap-3 mb-3">
                  <span className="font-semibold text-text">{c.nombre}</span>
                </div>
                <AccionesCategoria c={c} />
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
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paged.map((c) => (
                      <tr
                        key={c.idcategoria}
                        className="hover:bg-canvas/60 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-text">
                          {c.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <AccionesCategoria c={c} />
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

export default CategoriasAdmin;
