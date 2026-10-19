import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

// Un solo modo (oscuro): texto en tono 300 sobre fondo tenue del mismo color (contraste alto sobre surface).
// info usa oro claro (accent) porque la identidad no tiene azul.
const variants: Record<BadgeVariant, { box: string; dot: string }> = {
  success: {
    box: "bg-green-400/15 text-green-300 border-green-400/20",
    dot: "bg-green-400",
  },
  warning: {
    box: "bg-orange-400/15 text-orange-300 border-orange-400/20",
    dot: "bg-orange-400",
  },
  danger: {
    box: "bg-red-400/15 text-red-300 border-red-400/20",
    dot: "bg-red-400",
  },
  info: {
    box: "bg-accent/15 text-accent border-accent/20",
    dot: "bg-accent",
  },
  neutral: {
    box: "bg-white/10 text-stone-300 border-border",
    dot: "bg-stone-400",
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
