import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface ProductoCarrito {
  idproducto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string;
}

interface UsuarioCarrito {
  iduser?: number;
  rol: { idrol: number };
}

export const getCarrito = (): ProductoCarrito[] => {
  const stored = localStorage.getItem("carrito");
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    return parsed.map((producto: any) => ({
      ...producto,
      cantidad: Number(producto.cantidad) || 1,
      stock: Number(producto.stock) || 0,
    }));
  } catch {
    return [];
  }
};

export const setCarrito = (productos: ProductoCarrito[]) => {
  localStorage.setItem("carrito", JSON.stringify(productos));
  window.dispatchEvent(new CustomEvent("carrito-updated"));
};

export const eliminarCarritoLocal = () => {
  localStorage.removeItem("carrito");
  window.dispatchEvent(new CustomEvent("carrito-updated"));
};

export function useCarrito(
  user: UsuarioCarrito | null | undefined,
  isAuthenticated: boolean
) {
  const [productosCarrito, setProductosCarrito] = useState<ProductoCarrito[]>(
    []
  );

  useEffect(() => {
    setProductosCarrito(getCarrito());
    const handler = () => setProductosCarrito(getCarrito());
    window.addEventListener("carrito-updated", handler);
    return () => window.removeEventListener("carrito-updated", handler);
  }, []);

  // Fusiona el carrito local (localStorage) con el guardado en BD al iniciar sesión
  useEffect(() => {
    const fusionarCarritos = async () => {
      if (isAuthenticated && user && user.iduser && user.rol.idrol === 2) {
        let carritoBD: ProductoCarrito[] = [];
        try {
          const resp = await api.get(`/api/carrito/${user.iduser}`);
          if (
            resp.data.success &&
            resp.data.data &&
            resp.data.data.listaProductos
          ) {
            carritoBD = JSON.parse(resp.data.data.listaProductos);
          }
        } catch (e) {
          carritoBD = [];
        }

        const carritoLocal = getCarrito();
        let carritoFinal: ProductoCarrito[] = [];

        if (carritoLocal.length > 0 && carritoBD.length > 0) {
          const localMap = new Map(carritoLocal.map((p) => [p.idproducto, p]));
          carritoBD.forEach((p) => {
            if (!localMap.has(p.idproducto)) {
              localMap.set(p.idproducto, p);
            }
          });
          carritoFinal = Array.from(localMap.values());
        } else if (carritoBD.length > 0) {
          carritoFinal = carritoBD;
        } else if (carritoLocal.length > 0) {
          carritoFinal = carritoLocal;
        }

        setCarrito(carritoFinal);
        setProductosCarrito(carritoFinal);

        if (carritoBD.length > 0 || carritoFinal.length > 0) {
          try {
            await api.delete(`/api/carrito/eliminar/${user.iduser}`);
          } catch (e) {}
        }
      }
    };

    if (isAuthenticated) {
      fusionarCarritos();
    }
  }, [isAuthenticated, user?.iduser]);

  // Guarda el carrito en BD (si tiene productos) o lo elimina (si está vacío) al cerrar sesión
  const guardarOEliminarCarritoAlSalir = async (
    usuarioActual: UsuarioCarrito | null | undefined
  ) => {
    if (
      isAuthenticated &&
      usuarioActual &&
      usuarioActual.rol.idrol === 2
    ) {
      const carritoLocal = getCarrito();
      if (carritoLocal.length > 0) {
        try {
          await api.post("/api/carrito/guardar", {
            iduser: usuarioActual.iduser,
            listaProductos: JSON.stringify(carritoLocal),
          });
        } catch (e) {}
      } else {
        try {
          await api.delete(`/api/carrito/${usuarioActual.iduser}`);
        } catch (e) {}
      }
    }
    eliminarCarritoLocal();
    setProductosCarrito([]);
  };

  const quitarDelCarrito = (idproducto: number) => {
    const nuevo = productosCarrito.filter((p) => p.idproducto !== idproducto);
    setCarrito(nuevo);
    setProductosCarrito(nuevo);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setProductosCarrito([]);
  };

  const actualizarCantidad = (idproducto: number, nuevaCantidad: number) => {
    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) return;
    const nuevo = productosCarrito.map((p) =>
      p.idproducto === idproducto ? { ...p, cantidad: nuevaCantidad } : p
    );
    setCarrito(nuevo);
    setProductosCarrito(nuevo);
  };

  return {
    productosCarrito,
    quitarDelCarrito,
    vaciarCarrito,
    actualizarCantidad,
    guardarOEliminarCarritoAlSalir,
  };
}
