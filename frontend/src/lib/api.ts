import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawBaseUrl) {
  throw new Error("Falta VITE_API_BASE_URL en frontend/.env");
}

export const API_BASE_URL: string = rawBaseUrl.replace(/\/+$/, "");

export const api = axios.create({ baseURL: API_BASE_URL });

// Agrega la sesión (JWT de localStorage) a cada petición, salvo que la petición ya traiga
// su propio Authorization.
api.interceptors.request.use((config) => {
  if (!config.headers.has("Authorization")) {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Rutas donde un 401/400 es un error de dato (clave mala, código mal), no una sesión caducada
const NO_EXPIRE_PATHS = [
  "/api/auth/login",
];

// Sesión caducada o revocada: si el servidor rechaza (401) una petición que llevó el token guardado,
// se avisa a AuthContext (api.ts no tiene acceso a React) para que cierre la sesión.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const stored = localStorage.getItem("authToken");
      const sent = error.config?.headers?.get("Authorization");
      const path = (error.config?.url ?? "").split("?")[0].replace(API_BASE_URL, "");
      if (stored && sent === `Bearer ${stored}` && !NO_EXPIRE_PATHS.includes(path)) {
        window.dispatchEvent(new Event("auth-expired"));
      }
    }
    return Promise.reject(error);
  },
);

/** Arma la URL completa de un archivo servido por el backend (/uploads/...). */
export function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
