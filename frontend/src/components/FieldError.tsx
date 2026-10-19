/**
 * Error inline para las páginas de perfil (fondo claro, inputs propios).
 * Mismo patrón que FormField: aria-invalid + aria-describedby en el campo y
 * un <p role="alert"> debajo. El borde rojo lo pone `aria-[invalid=true]:` en el input.
 */
export const INVALID_CLASS = "aria-[invalid=true]:border-red-600 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-600 aria-[invalid=true]:focus:border-red-600 aria-[invalid=true]:focus:ring-red-600";

/** Props de accesibilidad del control. `describedBy` conserva otras ayudas (p. ej. el texto de ayuda). */
export function fieldAria(id: string, error?: string, describedBy?: string) {
  const ids = [error && `${id}-error`, describedBy].filter(Boolean).join(" ");
  return {
    id,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": ids || undefined,
  };
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  // La región se mantiene en el DOM para que el cambio se anuncie
  return (
    <p id={`${id}-error`} role="alert" className={error ? "mt-1 text-sm font-medium text-red-600" : "hidden"}>
      {error}
    </p>
  );
}
