import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-surface hover:bg-primary-hover hover:shadow-primary-glow",
  secondary:
    "bg-surface text-text border border-border hover:bg-canvas hover:shadow-elevation-1",
  danger: "bg-danger text-surface hover:brightness-90 hover:shadow-elevation-2",
  ghost: "bg-transparent text-text hover:bg-border",
};

// Primario: texto oscuro (#1C1917 = surface) sobre oro, nunca blanco.
// Base: nunca menos de 44px de alto. sm se compacta solo desde el breakpoint sm.
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-sm sm:min-h-9",
  md: "min-h-11 px-4 text-base sm:text-sm",
  lg: "min-h-12 px-6 text-base",
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 018-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = "button",
  disabled,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      data-ui
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-control font-body font-semibold",
        "transition-[color,background-color,box-shadow,filter,border-color] duration-[var(--duration-fast)] ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {/* El contenido se mantiene (invisible) al cargar: el ancho no cambia */}
      <span
        className={cn("inline-flex items-center gap-2", loading && "invisible")}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
          <span className="sr-only">Cargando</span>
        </span>
      )}
    </button>
  );
}
