import React, { createContext, useContext, useEffect, useState } from "react";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
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
    // eslint-disable-next-line
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (roleId: number) => user?.rol.idrol === roleId;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, hasRole }}
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
