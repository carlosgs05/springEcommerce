import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * Un paso de un flujo de varios pasos (p. ej. correo -> código -> nueva contraseña).
 * Al cambiar `stepKey` se vuelve a montar y entra con fade + slide corto
 * (tokens de duración/easing; solo transform/opacity; sin movimiento si el sistema lo pide).
 */
export function AuthStep({
  stepKey,
  direction = "forward",
  className,
  children,
}: {
  stepKey: string;
  direction?: "forward" | "back";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      key={stepKey}
      className={cn(direction === "forward" ? "auth-step-right" : "auth-step-left", className)}
    >
      {children}
    </div>
  );
}
