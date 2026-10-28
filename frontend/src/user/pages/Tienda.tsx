import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Scales } from "@phosphor-icons/react";
import { api, assetUrl } from "@/lib/api";
import { getStockBadge } from "@/lib/stockBadge";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useFavoritos } from "@/user/hooks/useFavoritos";
import FavoritoButton from "@/user/components/FavoritoButton";

const MAX_COMPARAR = 3;

interface Categoria {
  idcategoria: number;
  nombre: string;
}

interface Marca {
  idmarca: number;
  nombre: string;
}

interface Producto {
  idproducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenesNombres: string[];
  calificacionPromedio: number;
  totalResenas: number;
}

function Estrellas({ calificacion }: { calificacion: number }) {
  return (
    <div className="flex text-primary" aria-hidden="true">
      {[...Array(5)].map((_, i) =>
        i < Math.round(calificacion) ? (
          <FaStar key={i} className="h-3.5 w-3.5" />
        ) : (
          <FaRegStar key={i} className="h-3.5 w-3.5" />
        )
      )}
    </div>
  );
}

function FiltroChips<T extends { nombre: string }>({
  titulo,
  items,
  getId,
  getLabel,
  selectedId,
  onToggle,
}: {
  titulo: string;
  items: T[];
  getId: (item: T) => number;
  getLabel: (item: T) => string;
  selectedId: number | null;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="py-5 border-b border-border">
      <h3 className="font-semibold text-text mb-3">{titulo}</h3>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">Sin opciones disponibles</p>
        ) : (
          items.map((item) => {
            const id = getId(item);
            const active = selectedId === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-[color,background-color,border-color] duration-[var(--duration-fast)] ease-standard cursor-pointer ${
                  active
                    ? "bg-primary text-surface border-primary"
                    : "bg-transparent text-text-muted border-border hover:border-primary/50 hover:text-text"
                }`}
              >
                {getLabel(item)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

const Tienda = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(
    null
  );
  const [selectedMarca, setSelectedMarca] = useState<number | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparando, setComparando] = useState<number[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { esFavorito, toggleFavorito } = useFavoritos(isAuthenticated);

  // 1) Cargo categorías y marcas
  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, marRes] = await Promise.all([
          api.get("/api/categorias/listar"),
          api.get("/api/marcas/listar"),
        ]);
        setCategorias(catRes.data.data);
        setMarcas(marRes.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  // 2) Cada vez que cambia la URL (query) leo filtros y recargo productos
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("categoria");
    const mar = params.get("marca");
    const catId = cat ? Number(cat) : null;
    const marId = mar ? Number(mar) : null;

    setSelectedCategoria(catId);
    setSelectedMarca(marId);

    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        const query: Record<string, number> = {};
        if (catId !== null) query.categoria = catId;
        if (marId !== null) query.marca = marId;
        const endpoint =
          Object.keys(query).length > 0
            ? "/api/productos/filtrar"
            : "/api/productos/listarAll";
        const resp = await api.get(endpoint, { params: query });
        setProductos(resp.data.data);
        window.scrollTo(0, 0);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los productos. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [location.search]);

  // 3) Handlers que actualizan URL y hacen scroll al top
  const handleCategoriaChange = (idcategoria: number) => {
    const params = new URLSearchParams(location.search);
    if (selectedCategoria === idcategoria) {
      params.delete("categoria");
    } else {
      params.set("categoria", idcategoria.toString());
    }
    navigate(
      { pathname: "/tienda", search: params.toString() },
      { replace: true }
    );
    window.scrollTo(0, 0);
  };

  const handleMarcaChange = (idmarca: number) => {
    const params = new URLSearchParams(location.search);
    if (selectedMarca === idmarca) {
      params.delete("marca");
    } else {
      params.set("marca", idmarca.toString());
    }
    navigate(
      { pathname: "/tienda", search: params.toString() },
      { replace: true }
    );
    window.scrollTo(0, 0);
  };

  const limpiarFiltros = () => navigate("/tienda");

  const toggleComparar = (idproducto: number) => {
    setComparando((prev) => {
      if (prev.includes(idproducto)) {
        return prev.filter((id) => id !== idproducto);
      }
      if (prev.length >= MAX_COMPARAR) return prev;
      return [...prev, idproducto];
    });
  };

  const irAComparador = () => {
    navigate(`/comparador?ids=${comparando.join(",")}`);
  };

  const filtrosContent = (
    <>
      <FiltroChips
        titulo="Categorías"
        items={categorias}
        getId={(c) => c.idcategoria}
        getLabel={(c) => c.nombre}
        selectedId={selectedCategoria}
        onToggle={handleCategoriaChange}
      />
      <FiltroChips
        titulo="Marcas"
        items={marcas}
        getId={(m) => m.idmarca}
        getLabel={(m) => m.nombre}
        selectedId={selectedMarca}
        onToggle={handleMarcaChange}
      />
      <Button variant="secondary" fullWidth className="mt-4" onClick={limpiarFiltros}>
        Limpiar filtros
      </Button>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-14">
          <div className="relative z-10 flex items-baseline justify-between pt-6 pb-6 border-b border-border">
            <h1 className="text-3xl font-extrabold text-text">Tienda</h1>
            <button
              className="lg:hidden p-2 text-text-muted hover:text-text cursor-pointer"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              aria-label="Mostrar filtros"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"
                />
              </svg>
            </button>
          </div>

          <section className="pt-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
              {/* Filtros móviles */}
              {showMobileFilters && (
                <div className="lg:hidden fixed inset-0 z-50">
                  <div
                    className="fixed inset-0 bg-black/40"
                    onClick={() => setShowMobileFilters(false)}
                  />
                  <div className="relative z-50 bg-surface p-4 h-full w-5/6 max-w-sm overflow-y-auto border-r border-border">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-text">Filtros</h2>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="text-text-muted hover:text-text cursor-pointer"
                        aria-label="Cerrar filtros"
                      >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    {filtrosContent}
                  </div>
                </div>
              )}

              {/* Filtros escritorio */}
              <div className="hidden lg:block">{filtrosContent}</div>

              {/* Productos */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="flex justify-center py-16">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : error ? (
                  <Card elevation={1} padding="lg" className="text-center">
                    <p className="text-danger">{error}</p>
                  </Card>
                ) : productos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {productos.map((producto, index) => {
                      const stockBadge = getStockBadge(producto.stock);
                      const irADetalle = () =>
                        navigate(`/tienda/producto/${producto.idproducto}`, {
                          state: producto,
                        });
                      const enComparador = comparando.includes(producto.idproducto);
                      const comparadorLleno =
                        !enComparador && comparando.length >= MAX_COMPARAR;
                      return (
                        <Card
                          key={producto.idproducto}
                          elevation={1}
                          padding="none"
                          className="card-enter overflow-hidden flex flex-col transition-[box-shadow,transform] duration-[var(--duration-base)] ease-standard hover:shadow-elevation-3 hover:scale-[1.02]"
                          style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-canvas">
                            <button
                              onClick={irADetalle}
                              className="block w-full h-full cursor-pointer"
                              aria-label={`Ver detalles de ${producto.nombre}`}
                            >
                              <img
                                src={assetUrl(`uploads/${producto.imagenesNombres[0]}`)}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                              />
                            </button>
                            <FavoritoButton
                              idproducto={producto.idproducto}
                              esFavorito={esFavorito(producto.idproducto)}
                              toggleFavorito={toggleFavorito}
                              className="absolute top-2 right-2"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!comparadorLleno) toggleComparar(producto.idproducto);
                              }}
                              disabled={comparadorLleno}
                              aria-pressed={enComparador}
                              aria-label={
                                enComparador
                                  ? "Quitar de comparador"
                                  : comparadorLleno
                                  ? "Ya seleccionaste 3 productos para comparar"
                                  : "Agregar a comparador"
                              }
                              title={
                                comparadorLleno
                                  ? "Ya seleccionaste 3 productos para comparar"
                                  : undefined
                              }
                              className={`absolute top-2 left-2 p-2 rounded-full transition-colors duration-[var(--duration-fast)] ease-standard ${
                                comparadorLleno
                                  ? "bg-surface/70 cursor-not-allowed opacity-50"
                                  : "bg-surface/90 hover:bg-surface cursor-pointer"
                              }`}
                            >
                              <Scales
                                size={20}
                                weight={enComparador ? "fill" : "regular"}
                                className={
                                  enComparador ? "text-accent" : "text-text-muted"
                                }
                              />
                            </button>
                          </div>
                          <div className="p-4 flex flex-col gap-2 flex-1">
                            <button
                              onClick={irADetalle}
                              className="text-left font-medium text-text hover:text-primary cursor-pointer line-clamp-1"
                            >
                              {producto.nombre}
                            </button>
                            <p className="text-sm text-text-muted line-clamp-2">
                              {producto.descripcion}
                            </p>
                            <div className="flex items-center gap-2">
                              <Estrellas calificacion={producto.calificacionPromedio} />
                              <span className="text-xs text-text-muted">
                                ({producto.totalResenas})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={stockBadge.variant} size="sm">
                                {stockBadge.label}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-auto pt-2">
                              <p className="font-bold text-primary text-lg">
                                S/ {producto.precio.toFixed(2)}
                              </p>
                              <Button size="sm" onClick={irADetalle}>
                                Ver detalles
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-text">
                      No se encontraron productos
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      Intenta con otros filtros de búsqueda
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {comparando.length > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4">
          <Card
            elevation={3}
            padding="sm"
            className="flex items-center gap-4 card-enter"
          >
            <span className="text-sm text-text-muted">
              {comparando.length} de {MAX_COMPARAR} seleccionados
            </span>
            <Button size="sm" onClick={irAComparador}>
              Comparar ({comparando.length})
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tienda;
