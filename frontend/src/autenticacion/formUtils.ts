import { isAxiosError } from "axios";

export const EMAIL_RE = /^[^\s@.]+(?:\.[^\s@.]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
// Misma regla que valida el backend para contraseñas nuevas
export const PASSWORD_RE =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;
export const PASSWORD_HINT =
  "Mínimo 8 caracteres, con una mayúscula, un número y un símbolo (@$!%*?&#_).";

export const NETWORK_ERROR =
  "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";

/** Mensaje del backend (siempre genérico y en español) o, si no hay, uno de respaldo. */
export function apiMessage(err: unknown, fallback: string = NETWORK_ERROR): string {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (!err.response) return NETWORK_ERROR;
  }
  return fallback;
}

/** Lista de errores de validación del backend (400 con `errors`), si la hay. */
export function apiErrors(err: unknown): string[] {
  if (isAxiosError(err)) {
    const errors = err.response?.data?.errors;
    if (Array.isArray(errors)) return errors.filter((e) => typeof e === "string");
  }
  return [];
}

/** Errores por campo del backend (`fieldErrors`: {campo del body: mensaje}), del cuerpo o de un error de axios. */
export function fieldErrorsDe(src: unknown): Record<string, string> {
  const data = isAxiosError(src) ? src.response?.data : src;
  const raw = (data as { fieldErrors?: unknown } | null | undefined)?.fieldErrors;
  const out: Record<string, string> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string" && v.trim()) out[k] = v;
    }
  }
  return out;
}

const reducedMotion =() =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Shake corto (solo transform) en los campos inválidos; no se anima con movimiento reducido. */
export function shakeFields(ids: string[]) {
  if (reducedMotion()) return;
  ids.forEach((id) => {
    document.getElementById(id)?.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-5px)", offset: 0.2 },
        { transform: "translateX(5px)", offset: 0.4 },
        { transform: "translateX(-3px)", offset: 0.6 },
        { transform: "translateX(3px)", offset: 0.8 },
        { transform: "translateX(0)" },
      ],
      { duration: 250, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    );
  });
}

/**
 * Marca los campos con error: shake y foco en el primero. El campo se centra en la ventana para que
 * su mensaje de error no quede tapado por un header fijo (el focus() solo lo pegaría al borde superior).
 */
export function flagInvalid(ids: string[]) {
  if (ids.length === 0) return;
  shakeFields(ids);
  const el = document.getElementById(ids[0]);
  if (!el) return;
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "center" });
}
