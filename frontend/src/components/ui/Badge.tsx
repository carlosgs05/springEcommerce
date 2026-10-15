import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

// Usa la paleta Tailwind (no --color-success/warning/...) porque esos tokens son tonos medios que no alcanzan 4.5:1 como texto sobre fondo claro; success=green, warning=amber, danger=red, info=blue.
// Texto 800 sobre fondo 50 (>= 7:1 en claro). En oscuro: texto 300 sobre fondo tenue.
const variants: Record<BadgeVariant, { box: string; dot: string }> = {
  success: {
    box: "bg-green-50 text-green-800 border-green-200 dark:bg-green-400/15 dark:text-green-300 dark:border-green-400/20",
    dot: "bg-green-600 dark:bg-green-400",
  },
  warning: {
    box: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/20",
    dot: "bg-amber-600 dark:bg-amber-400",
  },
  danger: {
    box: "bg-red-50 text-red-800 border-red-200 dark:bg-red-400/15 dark:text-red-300 dark:border-red-400/20",
    dot: "bg-red-600 dark:bg-red-400",
  },
  info: {
    box: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-400/15 dark:text-blue-300 dark:border-blue-400/20",
    dot: "bg-blue-600 dark:bg-blue-400",
  },
  neutral: {
    box: "bg-slate-100 text-slate-700 border-border dark:bg-white/10 dark:text-slate-300",
    dot: "bg-slate-500 dark:bg-slate-400",
  },
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  const v = variants[variant];
  return (
    <span
      data-ui
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        v.box,
        sizes[size],
        className,
      )}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", v.dot)}
        />
      )}
      {children}
    </span>
  );
}
