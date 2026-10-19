import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button, FormField, Input } from "../components/ui";
import { AuthAlert } from "./AuthAlert";
import { EMAIL_RE, apiMessage, fieldErrorsDe, flagInvalid } from "./formUtils";

const RUTAS = { endpoint: "/api/auth/forgot-password", siguiente: "/verify-reset-code" };

const ForgotPassword: React.FC = () => {
  const rutas = RUTAS;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setFormError(null);

    const correo = email.trim();
    if (!EMAIL_RE.test(correo)) {
      setError(
        correo
          ? "El correo necesita una @ y un dominio, por ejemplo nombre@correo.com."
          : "Escribe el correo con el que te registraste.",
      );
      flagInvalid(["email"]);
      return;
    }

    setLoading(true);
    try {
      // El backend responde siempre 200 con un mensaje genérico, exista o no la cuenta
      const { data } = await api.post(rutas.endpoint, { correo });
      navigate(rutas.siguiente, { state: { correo, mensaje: data.message } });
    } catch (err) {
      const fe = fieldErrorsDe(err);
      if (fe.correo) {
        setError(fe.correo);
        flagInvalid(["email"]);
        return;
      }
      setFormError(apiMessage(err, "No pudimos enviar el código. Inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-text-muted">
          Escribe tu correo y te enviaremos un código de 6 dígitos.
        </p>
      </header>

      {formError && (
        <AuthAlert tone="error" className="mb-4">
          {formError}
        </AuthAlert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Correo electrónico" id="email" required error={error}>
          {(c) => (
            <Input
              {...c}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              value={email}
              onChange={handleChange}
            />
          )}
        </FormField>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Enviar código
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

export default ForgotPassword;
