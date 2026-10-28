import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, assetUrl } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Especificacion {
  unidadmedida: string;
  valor: number;
  descripcion: string;
}

interface Producto {
  idproducto: number;
  nombre: string;
  precio: number;
  stock: number;
  nombreMarca: string;
  nombreCategoria: string;
  imagenesNombres: string[];
  especificaciones: Especificacion[];
  calificacionPromedio: number;
  totalResenas: number;
}

const ComparadorProductos = () => {
  const location = useLocation();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = new URLSearchParams(location.search);
  const idsParam = params.get("ids");
  const ids = idsParam
    ? idsParam
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n) && n > 0)
    : [];

  useEffect(() => {
    if (ids.length === 0) {
      setProductos([]);
      setLoading(false);
      setError(null);
      return;
    }
    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await api.get("/api/productos/comparar", {
          params: { ids: ids.join(",") },
        });
        setProductos(resp.data.data);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los productos a comparar. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Agrupa las especificaciones de todos los productos por su descripción (ej. "RAM")
  const filas: { descripcion: string; unidadMedida: string }[] = [];
  const vistos = new Set<string>();
  productos.forEach((p) => {
    p.especificaciones?.forEach((esp) => {
      if (!vistos.has(esp.descripcion)) {
        vistos.add(esp.descripcion);
        filas.push({ descripcion: esp.descripcion, unidadMedida: esp.unidadmedida });
      }
    });
  });

  const valorDe = (producto: Producto, descripcion: string): Especificacion | undefined =>
    producto.especificaciones?.find((e) => e.descripcion === descripcion);

  const esMaximo = (descripcion: string, producto: Producto): boolean => {
    const valores = productos
      .map((p) => valorDe(p, descripcion)?.valor)
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
    if (valores.length < 2) return false;
    const max = Math.max(...valores);
    const propio = valorDe(producto, descripcion)?.valor;
    return propio !== undefined && propio === max;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-14 py-8">
          <h1 className="text-3xl font-extrabold text-text mb-6">
            Comparador de productos
          </h1>

          {loading ? (
            <div className="flex justify-center py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <Card elevation={1} padding="lg" className="text-center">
              <p className="text-danger">{error}</p>
            </Card>
          ) : ids.length === 0 || productos.length === 0 ? (
            <Card elevation={1} padding="lg" className="text-center">
              <p className="text-text-muted mb-4">
                Selecciona productos desde la tienda para compararlos.
              </p>
              <Link
                to="/tienda"
                className="text-primary font-medium hover:underline"
              >
                Ir a la tienda
              </Link>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 min-w-[640px]">
                <thead>
                  <tr>
                    <th className="w-40"></th>
                    {productos.map((producto, index) => (
                      <th
                        key={producto.idproducto}
                        className="p-0 align-top"
                      >
                        <Card
                          elevation={1}
                          padding="md"
                          className="card-enter text-center"
                          style={{ animationDelay: `${index * 60}ms` }}
                        >
                          <img
                            src={assetUrl(`uploads/${producto.imagenesNombres?.[0] ?? ""}`)}
                            alt={producto.nombre}
                            className="w-28 h-28 object-cover rounded-card mx-auto mb-3"
                          />
                          <p className="font-semibold text-text line-clamp-2">
                            {producto.nombre}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            {producto.nombreMarca}
                          </p>
                          <p className="font-bold text-primary text-lg mt-2">
                            S/ {producto.precio.toFixed(2)}
                          </p>
                        </Card>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-2 text-sm font-medium text-text-muted border-b border-border">
                      Categoría
                    </td>
                    {productos.map((producto) => (
                      <td
                        key={producto.idproducto}
                        className="py-3 px-2 text-center text-sm text-text border-b border-border"
                      >
                        {producto.nombreCategoria}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-sm font-medium text-text-muted border-b border-border">
                      Stock
                    </td>
                    {productos.map((producto) => (
                      <td
                        key={producto.idproducto}
                        className="py-3 px-2 text-center text-sm border-b border-border"
                      >
                        <Badge
                          variant={producto.stock > 0 ? "success" : "danger"}
                          size="sm"
                        >
                          {producto.stock > 0 ? `${producto.stock} disponibles` : "Sin stock"}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  {filas.map((fila) => (
                    <tr key={fila.descripcion}>
                      <td className="py-3 px-2 text-sm font-medium text-text-muted border-b border-border">
                        {fila.descripcion}
                      </td>
                      {productos.map((producto) => {
                        const esp = valorDe(producto, fila.descripcion);
                        const destacar = esp && esMaximo(fila.descripcion, producto);
                        return (
                          <td
                            key={producto.idproducto}
                            className={`py-3 px-2 text-center text-sm border-b border-border ${
                              destacar ? "text-accent font-semibold bg-accent/10" : "text-text"
                            }`}
                          >
                            {esp ? `${esp.valor} ${esp.unidadmedida}` : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComparadorProductos;
