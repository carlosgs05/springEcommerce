import React, { useState, FormEvent, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { Button, FormField, Input } from "../components/ui";
import { AuthAlert } from "./AuthAlert";
import {
  PASSWORD_HINT,
  PASSWORD_RE,
  apiErrors,
  apiMessage,
  fieldErrorsDe,
  flagInvalid,
} from "./formUtils";

const rutas = { inicio: "/forgot-password", endpoint: "/api/auth/reset-password" };

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { state: routeState, pathname } = useLocation();
  // Se copia al estado de React una vez y se quita del historial del navegador
  const [state] = useState(routeState as { correo?: string; resetCode?: string } | null);
  const correo = state?.correo || "";
  const resetCode = state?.resetCode || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state?.correo && state?.resetCode) navigate(pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sin correo y código verificado no se puede cambiar la clave: volver a pedirlo
  useEffect(() => {
    if (!correo || !resetCode) {
      navigate(rutas.inicio, { replace: true });
    }
  }, [correo, resetCode, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setFormErrors([]);

    const next: typeof errors = {};
    if (!PASSWORD_RE.test(newPassword)) next.newPassword = PASSWORD_HINT;
    if (newPassword !== confirmPassword)
      next.confirmPassword = "Las contraseñas no coinciden. Escríbelas igual en los dos campos.";
    setErrors(next);
    if (next.newPassword || next.confirmPassword) {
      flagInvalid([next.newPassword ? "newPassword" : "", next.confirmPassword ? "confirmPassword" : ""].filter(Boolean));
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(rutas.endpoint, {
        correo,
        resetCode,
        newPassword,
        confirmPassword,
      });
      navigate("/login", {
        replace: true,
        state: { verificationSuccess: data.message || "Contraseña actualizada. Ya puedes iniciar sesión." },
      });
    } catch (err) {
      const fe = fieldErrorsDe(err);
      const campos: typeof errors = {};
      if (fe.newPassword) campos.newPassword = fe.newPassword;
      if (fe.confirmPassword) campos.confirmPassword = fe.confirmPassword;
      const ids = (["newPassword", "confirmPassword"] as const).filter((k) => campos[k]);
      if (ids.length > 0 || fe.resetCode) {
        setErrors(campos);
        if (ids.length > 0) flagInvalid([...ids]);
        // El código no tiene campo en esta pantalla: aviso general con enlace para pedir otro
        if (fe.resetCode) setFormErrors([fe.resetCode]);
        return;
      }
      const list = apiErrors(err);
      setFormErrors(
        list.length > 0 ? list : [apiMessage(err, "No pudimos cambiar la contraseña. Inténtalo de nuevo.")],
      );
    } finally {
      setLoading(false);
    }
  };

  const pwType = showPassword ? "text" : "password";

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Nueva contraseña</h1>
        <p className="mt-1 text-sm text-text-muted">Elige una contraseña nueva para tu cuenta.</p>
      </header>

      {formErrors.length > 0 && (
        <AuthAlert tone="error" className="mb-4">
          {formErrors.length === 1 ? (
            formErrors[0]
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              {formErrors.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </AuthAlert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="Nueva contraseña"
          id="newPassword"
          required
          error={errors.newPassword}
          helperText={errors.newPassword ? undefined : PASSWORD_HINT}
        >
          {(c) => (
            <div className="relative">
              <Input
                {...c}
                name="newPassword"
                type={pwType}
                autoComplete="new-password"
                placeholder="Tu nueva contraseña"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((p) => ({ ...p, newPassword: undefined }));
                }}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-control text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {showPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
            </div>
          )}
        </FormField>

        <FormField label="Repite la contraseña" id="confirmPassword" required error={errors.confirmPassword}>
          {(c) => (
            <Input
              {...c}
              name="confirmPassword"
              type={pwType}
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
            />
          )}
        </FormField>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Cambiar contraseña
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link
          to="/login"
          className="inline-flex min-h-11 items-center font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:underline"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
