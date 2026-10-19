import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Button, FormField, Input } from "../components/ui";
import { AuthAlert } from "./AuthAlert";
import { apiMessage, fieldErrorsDe, flagInvalid } from "./formUtils";

const rutas = { inicio: "/forgot-password", endpoint: "/api/auth/verify-reset-code", siguiente: "/reset-password" };

const VerifyResetCode: React.FC = () => {
  const navigate = useNavigate();
  const { state: routeState, pathname } = useLocation();
  // Se copia al estado de React una vez y se quita del historial del navegador
  const [initial] = useState(routeState as { correo?: string; mensaje?: string } | null);
  const state = initial;
  const correo = state?.correo || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (correo) navigate(pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!correo) {
      navigate(rutas.inicio, { replace: true });
    }
  }, [correo, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
    setError(undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setFormError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("El código tiene 6 dígitos, solo números. Revisa el correo que te enviamos.");
      flagInvalid(["code"]);
      return;
    }

    setLoading(true);
    try {
      await api.post(rutas.endpoint, { correo, resetCode: Number(code) });
      // El código verificado viaja a la pantalla siguiente: el backend lo exige para cambiar la clave.
      navigate(rutas.siguiente, { replace: true, state: { correo, resetCode: code } });
    } catch (err) {
      const fe = fieldErrorsDe(err);
      if (fe.resetCode) {
        setError(fe.resetCode);
        flagInvalid(["code"]);
        return;
      }
      setFormError(apiMessage(err, "No pudimos verificar el código. Inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Verificar código</h1>
        <p className="mt-1 break-words text-sm text-text-muted">
          Escribe el código de 6 dígitos que enviamos a <strong className="font-semibold text-text">{correo}</strong>.
        </p>
      </header>

      {state?.mensaje && !formError && (
        <AuthAlert tone="info" className="mb-4">
          {state.mensaje}
        </AuthAlert>
      )}
      {formError && (
        <AuthAlert tone="error" className="mb-4">
          {formError}
        </AuthAlert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Código de 6 dígitos" id="code" required error={error}>
          {(c) => (
            <Input
              {...c}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={handleChange}
              className="text-center font-mono text-lg tracking-[0.4em] sm:text-lg"
            />
          )}
        </FormField>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Verificar código
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link
          to={rutas.inicio}
          className="inline-flex min-h-11 items-center font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:underline"
        >
          Pedir otro código
        </Link>
      </p>
    </div>
  );
};

export default VerifyResetCode;
