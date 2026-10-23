import React, { type RefObject } from "react";
import {
  ShoppingCart,
  Trash,
  Minus,
  Plus,
  SmileyMeh,
  Package,
} from "@phosphor-icons/react";
import { assetUrl } from "@/lib/api";
import type { ProductoCarrito } from "@/user/hooks/useCarrito";

interface CartMenuProps {
  productosCarrito: ProductoCarrito[];
  open: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onVaciar: () => void;
  onActualizarCantidad: (idproducto: number, cantidad: number) => void;
  onQuitar: (idproducto: number) => void;
  onVerCarrito: () => void;
  iconBtnClassName: string;
}

const CartMenu: React.FC<CartMenuProps> = ({
  productosCarrito,
  open,
  dropdownRef,
  onToggle,
  onVaciar,
  onActualizarCantidad,
  onQuitar,
  onVerCarrito,
  iconBtnClassName,
}) => {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Carrito"
        className={`${iconBtnClassName} text-text-muted hover:text-primary relative`}
        onClick={onToggle}
        type="button"
      >
        <ShoppingCart size={22} />
        {productosCarrito.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-primary to-primary-hover rounded-full text-xs flex items-center justify-center text-canvas font-bold">
            {productosCarrito.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-3 w-96 max-w-xs sm:max-w-sm bg-surface border border-border rounded-card shadow-elevation-3 z-50 animate-fade-in transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-canvas text-text">
            <div className="flex items-center gap-2 text-lg font-semibold cursor-pointer">
              <Package size={24} className="text-primary" />
              Carrito
            </div>
            <button
              onClick={onVaciar}
              className="flex items-center gap-1 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-control px-3 py-1.5 text-text transition-all duration-200 cursor-pointer"
              title="Vaciar carrito"
              type="button"
            >
              <Trash size={16} />
              Vaciar
            </button>
          </div>
          {/* Productos */}
          <div className="flex-1 max-h-72 overflow-y-auto divide-y divide-border">
            {productosCarrito.length > 0 ? (
              productosCarrito.map((p) => (
                <div
                  key={p.idproducto}
                  className="flex items-center gap-3 px-5 py-4 bg-surface hover:bg-canvas transition-all duration-200"
                >
                  {/* Imagen */}
                  <div className="flex-shrink-0 bg-canvas rounded-control p-2">
                    <img
                      src={assetUrl(`uploads/${encodeURIComponent(p.imagen)}`)}
                      alt={p.nombre}
                      className="w-12 h-12 object-contain rounded-md"
                    />
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-text truncate cursor-pointer">
                      {p.nombre}
                    </div>
                    <div className="text-primary text-sm mt-1 cursor-pointer">
                      S/ {p.precio.toFixed(2)}
                    </div>
                  </div>

                  {/* Controles de cantidad + papelera */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onActualizarCantidad(
                            p.idproducto,
                            (Number(p.cantidad) || 1) - 1
                          )
                        }
                        disabled={p.cantidad <= 1}
                        className={`p-1 rounded-md cursor-pointer ${
                          p.cantidad <= 1
                            ? "bg-canvas text-text-muted cursor-not-allowed"
                            : "bg-canvas text-primary hover:bg-primary hover:text-canvas"
                        }`}
                        type="button"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-text w-6 text-center cursor-pointer">
                        {Number(p.cantidad) || 1}
                      </span>
                      <button
                        onClick={() =>
                          onActualizarCantidad(
                            p.idproducto,
                            (Number(p.cantidad) || 1) + 1
                          )
                        }
                        className="p-1 rounded-md cursor-pointer bg-canvas text-primary hover:bg-primary hover:text-canvas"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      className="text-danger hover:text-danger/80 transition-colors cursor-pointer p-1.5"
                      onClick={() => onQuitar(p.idproducto)}
                      title="Quitar"
                      type="button"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center py-10 px-4 text-primary opacity-80 animate-in fade-in-0">
                <SmileyMeh className="text-6xl mb-2 cursor-pointer" size={48} />
                <span className="text-base font-medium cursor-pointer">
                  Tu carrito está vacío
                </span>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="px-6 py-4 bg-canvas border-t border-border flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted font-medium cursor-pointer">
                Subtotal:
              </span>
              <span className="text-xl font-bold text-primary tracking-wide cursor-pointer">
                S/{" "}
                {productosCarrito
                  .reduce((a, p) => a + p.precio * (p.cantidad || 1), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={onVerCarrito}
                className="w-full py-3 text-center text-primary hover:text-primary-hover font-medium transition-all duration-300 cursor-pointer"
                type="button"
              >
                Ver carrito completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartMenu;
