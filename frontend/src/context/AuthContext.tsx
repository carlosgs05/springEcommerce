// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        // Verificamos que tenga todos los campos esperados
        const safeUser: User = {
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
        setUser(safeUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data", error);
        logout();
      }
    }
  }, []);

  const login = (userData: User, token: string) => {
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
    setUser(null);
    setIsAuthenticated(false);
    if (userRole === 2) {
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

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
      value={{ user, login, logout, isAuthenticated, hasRole, updateUser }}
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
