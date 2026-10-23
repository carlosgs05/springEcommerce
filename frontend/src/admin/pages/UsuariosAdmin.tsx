import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import {
  MagnifyingGlass,
  UsersThree,
  CaretLeft,
  CaretRight,
  CheckCircle,
  XCircle,
  Receipt,
} from "@phosphor-icons/react";
import { api } from "../../lib/api";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/FormField";

interface RolDTO {
  idrol: number;
  nombre: string;
}

interface UsuarioDTO {
  iduser: number;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  dni: string;
  activo: boolean;
  rol: RolDTO;
}

interface ListarResponse {
  statusCode: number;
  message: string;
  content: UsuarioDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const PAGE_SIZE = 10;

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0); // 0-based, como lo pide el backend
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [cambiandoId, setCambiandoId] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Debounce del buscador: espera a que la persona termine de escribir antes de pedir al servidor
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get<ListarResponse>("/api/admin/usuarios", {
        params: {
          search: search || undefined,
          page,
          size: PAGE_SIZE,
        },
      });
      setUsuarios(resp.data.content);
      setTotalPages(Math.max(resp.data.totalPages, 1));
      setTotalElements(resp.data.totalElements);
    } catch (err) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        "No se pudo cargar la lista de usuarios";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleCambiarEstado = async (usuario: UsuarioDTO) => {
    const activar = !usuario.activo;
    const result = await Swal.fire({
      title: activar ? "¿Activar cuenta?" : "¿Desactivar cuenta?",
      text: `${usuario.nombre} ${usuario.apellido} (${usuario.correo})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: activar ? "Sí, activar" : "Sí, desactivar",
      cancelButtonText: "Cancelar",
      customClass: {
        container: "font-sans rounded-2xl",
        popup: "rounded-2xl",
        confirmButton: activar
          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-xl transition-all"
          : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-xl transition-all",
        cancelButton:
          "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-xl transition-all",
      },
    });
    if (!result.isConfirmed) return;

    try {
      setCambiandoId(usuario.iduser);
      const resp = await api.put(`/api/admin/usuarios/${usuario.iduser}/estado`, {
        activo: activar,
      });
      Swal.fire(
        "¡Listo!",
        resp.data.message || "Estado actualizado correctamente",
        "success",
      );
      fetchUsuarios();
    } catch (err: any) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        err.message ||
        "No se pudo cambiar el estado";
      Swal.fire("No se pudo completar", msg, "error");
    } finally {
      setCambiandoId(null);
    }
  };

  const verPedidos = () => {
    Swal.fire({
      title: "Disponible próximamente",
      text: "El historial de pedidos por usuario todavía no está listo.",
      icon: "info",
    });
  };

  const renderPagination = () =>
    totalPages > 1 ? (
      <div className="flex justify-center items-center gap-2 py-6 select-none">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="p-2 bg-canvas rounded-full text-text-muted hover:bg-border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <CaretLeft />
        </button>
        <span className="text-sm text-text-muted px-2">
          Página {page + 1} de {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
          className="p-2 bg-canvas rounded-full text-text-muted hover:bg-border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <CaretRight />
        </button>
      </div>
    ) : null;

  const rolVariant = (idrol: number) => (idrol === 1 ? "info" : "neutral");

  const AccionesUsuario = ({ u }: { u: UsuarioDTO }) => (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant={u.activo ? "danger" : "secondary"}
        loading={cambiandoId === u.iduser}
        onClick={() => handleCambiarEstado(u)}
        leftIcon={u.activo ? <XCircle size={16} /> : <CheckCircle size={16} />}
      >
        {u.activo ? "Desactivar" : "Activar"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled
        title="Disponible próximamente"
        onClick={verPedidos}
        leftIcon={<Receipt size={16} />}
      >
        Ver pedidos
      </Button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/15 p-2 rounded-xl">
              <UsersThree className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text">
                Gestión de Usuarios
              </h1>
              <p className="text-sm text-text-muted">
                {totalElements} usuario{totalElements === 1 ? "" : "s"} registrado
                {totalElements === 1 ? "" : "s"}
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
              placeholder="Buscar por nombre, apellido o correo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Buscar usuario"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-text-muted">Cargando usuarios...</span>
            </div>
          </div>
        ) : error ? (
          <Card elevation={1} padding="md" className="border-danger/30">
            <CardBody className="flex items-center gap-3 text-danger">
              <XCircle size={24} />
              <span>{error}</span>
            </CardBody>
          </Card>
        ) : usuarios.length === 0 ? (
          <Card elevation={1} padding="lg">
            <CardBody className="text-center flex flex-col items-center gap-2">
              <UsersThree size={32} className="text-text-muted" />
              <p className="text-lg text-text">
                {search
                  ? "No hay usuarios que coincidan con tu búsqueda"
                  : "No hay usuarios registrados"}
              </p>
              {search && (
                <p className="text-sm text-text-muted">
                  Intenta con otro nombre, apellido o correo
                </p>
              )}
            </CardBody>
          </Card>
        ) : isMobile ? (
          <div className="space-y-4">
            {usuarios.map((u) => (
              <Card key={u.iduser} elevation={1} padding="md">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-text">
                      {u.nombre} {u.apellido}
                    </p>
                    <p className="text-sm text-text-muted break-all">{u.correo}</p>
                    {u.celular && (
                      <p className="text-sm text-text-muted">{u.celular}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={u.activo ? "success" : "danger"}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant={rolVariant(u.rol.idrol)}>{u.rol.nombre}</Badge>
                  </div>
                </div>
                <AccionesUsuario u={u} />
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
                        Usuario
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Rol
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
                    {usuarios.map((u) => (
                      <tr key={u.iduser} className="hover:bg-canvas/60 transition-colors">
                        <td className="px-6 py-4 text-sm text-text">
                          {u.nombre} {u.apellido}
                          {u.dni && (
                            <p className="text-xs text-text-muted">DNI: {u.dni}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-muted">
                          <p className="break-all">{u.correo}</p>
                          {u.celular && <p>{u.celular}</p>}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={rolVariant(u.rol.idrol)}>{u.rol.nombre}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant={u.activo ? "success" : "danger"}>
                            {u.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <AccionesUsuario u={u} />
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

export default UsuariosAdmin;
