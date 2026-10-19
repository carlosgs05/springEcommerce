import React, { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button, FormField, Input } from "../components/ui";
import { AuthAlert } from "./AuthAlert";
import { EMAIL_RE, apiMessage, flagInvalid } from "./formUtils";

interface LoginResponse {
  statusCode: number;
  message: string;
  token?: string;
  rol?: { idrol: number; nombre: string };
  usuario?: {
    iduser: number;
    nombre: string;
    apellido?: string;
    correo: string;
    celular?: string;
    dni?: string;
  };
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ correo: "", password: "" });
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as {
      verificationSuccess?: string;
      verificationError?: string;
    } | null;
    if (state?.verificationSuccess) {
      setVerificationMessage(state.verificationSuccess);
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => setVerificationMessage(null), 8000);
      return () => clearTimeout(timer);
    }
    if (state?.verificationError) {
      setFormError(state.verificationError);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const finishLogin = (data: LoginResponse) => {
    const { token, rol, usuario } = data;
    if (!token || !rol || !usuario) {
      setFormError(data.message || "No pudimos iniciar tu sesión. Inténtalo de nuevo.");
      return;
    }
    login(
      {
        iduser: usuario.iduser,
        nombre: usuario.nombre,
        apellido: usuario.apellido || "",
        correo: usuario.correo,
        celular: usuario.celular || "",
        dni: usuario.dni || "",
        rol: { idrol: rol.idrol, nombre: rol.nombre },
      },
      token,
    );

    const state = location.state as { from?: string } | null;
    if (state?.from === "carrito" && rol.idrol === 2) {
      navigate("/carrito", { replace: true });
    } else if (rol.idrol === 1) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setFormError(null);

    const next: typeof errors = {};
    if (!formData.correo.trim()) next.correo = "Escribe tu correo electrónico.";
    else if (!EMAIL_RE.test(formData.correo.trim()))
      next.correo = "El correo necesita una @ y un dominio, por ejemplo nombre@correo.com.";
    if (!formData.password) next.password = "Escribe tu contraseña.";
    setErrors(next);
    if (next.correo || next.password) {
      flagInvalid([next.correo ? "correo" : "", next.password ? "password" : ""].filter(Boolean));
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>("/api/auth/login", {
        correo: formData.correo.trim(),
        password: formData.password,
      });

      if (data.token) {
        finishLogin(data);
      } else {
        setFormError(data.message || "No pudimos iniciar tu sesión. Inténtalo de nuevo.");
      }
    } catch (err) {
      setFormError(apiMessage(err, "No pudimos iniciar tu sesión. Inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-text-muted">Entra para ver tu carrito y tus pedidos.</p>
      </header>

      {verificationMessage && (
        <AuthAlert tone="success" className="mb-4">
          {verificationMessage}
        </AuthAlert>
      )}
      {formError && (
        <AuthAlert tone="error" className="mb-4">
          {formError}
        </AuthAlert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Correo electrónico" id="correo" required error={errors.correo}>
          {(c) => (
            <Input
              {...c}
              name="correo"
              type="email"
              inputMode="email"
              placeholder="nombre@correo.com"
              autoComplete="username"
              value={formData.correo}
              onChange={handleChange}
            />
          )}
        </FormField>

        <FormField label="Contraseña" id="password" required error={errors.password}>
          {(c) => (
            <div className="relative">
              <Input
                {...c}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-control text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showPassword ? (
                  <EyeSlash size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </FormField>

        <div className="-mt-2 flex justify-end">
          <Link
            to="/forgot-password"
            className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Ingresar
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-text-muted">
        ¿No tienes una cuenta?{" "}
        <Link
          to="/register"
          className="inline-flex min-h-11 items-center font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
};

export default Login;
