import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface FavoritoDTO {
  idproducto: number;
  nombre: string;
  precio: number;
  stock: number;
  primeraImagen: string | null;
  calificacionPromedio: number;
  totalResenas: number;
  fechaAgregado: string;
}

/**
 * Maneja el set de ids favoritos del usuario autenticado. Trae los ids una sola vez
 * al montar (si hay sesión) y expone un toggle optimista: cambia el estado local al
 * instante y revierte si la petición al servidor falla.
 */
export function useFavoritos(isAuthenticated: boolean) {
  const [favoritoIds, setFavoritoIds] = useState<Set<number>>(new Set());
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoritoIds(new Set());
      setCargado(true);
      return;
    }
    let cancelado = false;
    const cargar = async () => {
      try {
        const resp = await api.get("/api/favoritos/ids");
        if (!cancelado) setFavoritoIds(new Set(resp.data.data));
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelado) setCargado(true);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [isAuthenticated]);

  const esFavorito = useCallback(
    (idproducto: number) => favoritoIds.has(idproducto),
    [favoritoIds]
  );

  /** Devuelve true si el toggle tuvo éxito, false si falló (y ya revirtió el estado). */
  const toggleFavorito = useCallback(
    async (idproducto: number): Promise<boolean> => {
      const yaEsFavorito = favoritoIds.has(idproducto);

      setFavoritoIds((prev) => {
        const nuevo = new Set(prev);
        if (yaEsFavorito) nuevo.delete(idproducto);
        else nuevo.add(idproducto);
        return nuevo;
      });

      try {
        if (yaEsFavorito) {
          await api.delete(`/api/favoritos/${idproducto}`);
        } else {
          await api.post(`/api/favoritos/${idproducto}`);
        }
        return true;
      } catch (e) {
        console.error(e);
        // Revierte el cambio optimista
        setFavoritoIds((prev) => {
          const nuevo = new Set(prev);
          if (yaEsFavorito) nuevo.add(idproducto);
          else nuevo.delete(idproducto);
          return nuevo;
        });
        return false;
      }
    },
    [favoritoIds]
  );

  return { favoritoIds, esFavorito, toggleFavorito, cargado };
}
