import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawBaseUrl) {
  throw new Error("Falta VITE_API_BASE_URL en frontend/.env");
}

export const API_BASE_URL: string = rawBaseUrl.replace(/\/+$/, "");

// Sin interceptores de autenticación todavía (se decide en el Día 2).
export const api = axios.create({ baseURL: API_BASE_URL });

/** Arma la URL completa de un archivo servido por el backend (/uploads/...). */
export function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
