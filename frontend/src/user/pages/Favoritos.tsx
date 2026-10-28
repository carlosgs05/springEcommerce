import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";
import { HeartBreak } from "@phosphor-icons/react";
import { api, assetUrl } from "@/lib/api";
import { getStockBadge } from "@/lib/stockBadge";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { FavoritoDTO } from "@/user/hooks/useFavoritos";

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

const Favoritos = () => {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState<FavoritoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quitando, setQuitando] = useState<number | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await api.get("/api/favoritos");
        setFavoritos(resp.data.data);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar tus favoritos. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const quitarFavorito = async (idproducto: number) => {
    setQuitando(idproducto);
    try {
      await api.delete(`/api/favoritos/${idproducto}`);
      setFavoritos((prev) => prev.filter((p) => p.idproducto !== idproducto));
    } catch (e) {
      console.error(e);
    } finally {
      setQuitando(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-14">
          <div className="pt-6 pb-6 border-b border-border">
            <h1 className="text-3xl font-extrabold text-text">Mis favoritos</h1>
          </div>

          <section className="pt-6 pb-24">
            {loading ? (
              <div className="flex justify-center py-16">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : error ? (
              <Card elevation={1} padding="lg" className="text-center">
                <p className="text-danger">{error}</p>
              </Card>
            ) : favoritos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {favoritos.map((producto) => {
                  const stockBadge = getStockBadge(producto.stock);
                  const irADetalle = () =>
                    navigate(`/tienda/producto/${producto.idproducto}`);
                  return (
                    <Card
                      key={producto.idproducto}
                      elevation={1}
                      padding="none"
                      className="overflow-hidden flex flex-col transition-[box-shadow,transform] duration-[var(--duration-base)] ease-standard hover:shadow-elevation-3 hover:scale-[1.02]"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-canvas">
                        <button
                          onClick={irADetalle}
                          className="block w-full h-full cursor-pointer"
                          aria-label={`Ver detalles de ${producto.nombre}`}
                        >
                          <img
                            src={assetUrl(`uploads/${producto.primeraImagen ?? ""}`)}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => quitarFavorito(producto.idproducto)}
                          disabled={quitando === producto.idproducto}
                          aria-label="Quitar de favoritos"
                          className="absolute top-2 right-2 p-2 rounded-full bg-surface/90 hover:bg-surface text-danger transition-colors duration-[var(--duration-fast)] ease-standard cursor-pointer disabled:opacity-60"
                        >
                          <HeartBreak size={20} weight="fill" />
                        </button>
                      </div>
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <button
                          onClick={irADetalle}
                          className="text-left font-medium text-text hover:text-primary cursor-pointer line-clamp-1"
                        >
                          {producto.nombre}
                        </button>
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
                <HeartBreak className="mx-auto h-12 w-12 text-text-muted" size={48} />
                <h3 className="mt-2 text-sm font-medium text-text">
                  Todavía no tienes favoritos
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  Explora la tienda y marca los productos que te interesen.
                </p>
                <Button className="mt-4" onClick={() => navigate("/tienda")}>
                  Ir a la tienda
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Favoritos;
