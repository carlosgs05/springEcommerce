import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { useFavoritos } from "@/user/hooks/useFavoritos";

interface FavoritoButtonProps {
  idproducto: number;
  esFavorito: boolean;
  toggleFavorito: ReturnType<typeof useFavoritos>["toggleFavorito"];
  /** Tamaño del ícono. Por defecto 20 (uso en tarjetas de Tienda). */
  size?: number;
  className?: string;
}

/**
 * Corazón toggle reusado en Tienda (tarjetas) y ProductoDetails. Sin sesión, redirige a
 * /login al click. Con sesión, cambia de estado al instante (optimista) y hace "pop" con
 * destello de --color-accent al marcar como favorito.
 */
const FavoritoButton: React.FC<FavoritoButtonProps> = ({
  idproducto,
  esFavorito,
  toggleFavorito,
  size = 20,
  className = "",
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [animar, setAnimar] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const marcandoFavorito = !esFavorito;
    if (marcandoFavorito) {
      setAnimar(true);
      setTimeout(() => setAnimar(false), 180);
    }
    await toggleFavorito(idproducto);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={esFavorito}
      className={`p-2 rounded-full bg-surface/90 hover:bg-surface transition-colors duration-[var(--duration-fast)] ease-standard cursor-pointer ${className}`}
    >
      <Heart
        size={size}
        weight={esFavorito ? "fill" : "regular"}
        className={`transition-colors duration-[var(--duration-fast)] ease-standard ${
          esFavorito ? "text-danger" : "text-text-muted"
        } ${animar ? "heart-pop" : ""}`}
      />
    </button>
  );
};

export default FavoritoButton;
