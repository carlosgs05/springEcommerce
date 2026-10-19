// AuthContext.tsx
import React, { createContext, useContext, startTransition, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  iduser: number;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  dni?: string;
  rol: {
    idrol: number;
    nombre: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roleId: number) => boolean;
  updateUser: (updatedUser: User) => void;
  /** Guarda un token de sesión nuevo (p. ej. tras cambiar la contraseña) sin tocar userData. */
  setAuthToken: (token: string) => void;
}

// Datos de compra del usuario: no deben quedar para quien entre después
const PURCHASE_KEYS = ["carrito", "metodo-envio", "punto-recojo", "direccion-envio"];
// Id del último usuario cuya sesión caducó (para no heredar su carrito si entra otra persona)
const LAST_USER_KEY = "lastUserId";

// Lee y sanea la sesión guardada. Si los datos están corruptos, se limpia y se trata como sin sesión.
function readStoredSession(): User | null {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");
  if (!token || !userData) return null;
  try {
    const parsedUser: User = JSON.parse(userData);
    return {
      iduser: parsedUser.iduser,
      nombre: parsedUser.nombre || "",
      apellido: parsedUser.apellido || "",
      correo: parsedUser.correo || "",
      celular: parsedUser.celular || "",
      dni: parsedUser.dni || undefined,
      rol: {
        idrol: parsedUser.rol?.idrol ?? 0,
        nombre: parsedUser.rol?.nombre || "",
      },
    };
  } catch {
    console.error("No se pudieron leer los datos de sesión guardados");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Sesión leída de forma síncrona en el primer render: así las rutas protegidas no
  // redirigen antes de que se restaure (recargar o abrir /perfil directo).
  const [initialUser] = useState<User | null>(readStoredSession);
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(initialUser !== null);
  const navigate = useNavigate();

  const login = (userData: User, token: string) => {
    // Si entra una persona distinta a la anterior, no hereda su carrito. Si no había nadie
    // (invitado que se loguea para pagar) el carrito se respeta.
    let previousId: number | undefined;
    try {
      const prev = localStorage.getItem("userData");
      if (prev) previousId = JSON.parse(prev)?.iduser;
    } catch {
      /* datos ilegibles: se tratan como si no hubiera usuario previo */
    }
    const lastId = localStorage.getItem(LAST_USER_KEY);
    if (previousId === undefined && lastId !== null) previousId = Number(lastId);
    if (previousId !== undefined && previousId !== userData.iduser) {
      PURCHASE_KEYS.forEach((k) => localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent("carrito-updated"));
    }
    localStorage.removeItem(LAST_USER_KEY);
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    const userRole = user?.rol.idrol;
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(LAST_USER_KEY);
    PURCHASE_KEYS.forEach((k) => localStorage.removeItem(k));
    // El Header guarda una copia del carrito en estado: se resincroniza por evento
    window.dispatchEvent(new CustomEvent("carrito-updated"));
    setUser(null);
    setIsAuthenticated(false);
    if (userRole === 2) {
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  // Los listeners viven toda la vida del provider: leen la versión actual de logout/user por ref
  const logoutRef = useRef(logout);
  logoutRef.current = logout;
  const userIdRef = useRef<number | undefined>(undefined);
  userIdRef.current = user?.iduser;

  useEffect(() => {
    // 401 de la API con la sesión guardada: caducó o fue revocada
    const onExpired = () => {
      if (userIdRef.current !== undefined) localStorage.setItem(LAST_USER_KEY, String(userIdRef.current));
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("refreshToken");
      // Todo en la misma transición que usa el router: si no, ProtectedRoute alcanza a
      // redirigir a "/" antes de que llegue la navegación a /login
      startTransition(() => {
        setUser(null);
        setIsAuthenticated(false);
        navigate("/login", {
          replace: true,
          state: { verificationError: "Tu sesión expiró, vuelve a iniciar sesión." },
        });
      });
    };
    // Otra pestaña cerró sesión: esta también
    const onStorage = (e: StorageEvent) => {
      if ((e.key === "authToken" || e.key === null) && !localStorage.getItem("authToken") && userIdRef.current !== undefined) {
        logoutRef.current();
      }
    };
    window.addEventListener("auth-expired", onExpired);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth-expired", onExpired);
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate]);

  const setAuthToken = (token: string) => localStorage.setItem("authToken", token);

  const hasRole = (roleId: number) => user?.rol.idrol === roleId;

  // Implementación en el provider
  const updateUser = (updatedUser: User) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUser,
    }));
    localStorage.setItem("userData", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, hasRole, updateUser, setAuthToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};