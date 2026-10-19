import React, { useState, FormEvent, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeSlash, EnvelopeSimple } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { Button, FormField, Input } from "../components/ui";
import { AuthAlert } from "./AuthAlert";
import {
  EMAIL_RE,
  PASSWORD_HINT,
  PASSWORD_RE,
  apiErrors,
  apiMessage,
  fieldErrorsDe,
  flagInvalid,
} from "./formUtils";

interface FormData {
  nombre: string;
  apellido: string;
  dni: string;
  celular: string;
  correo: string;
  password: string;
  passwordconfirmacion: string;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

const EMPTY: FormData = {
  nombre: "",
  apellido: "",
  dni: "",
  celular: "",
  correo: "",
  password: "",
  passwordconfirmacion: "",
};

// Orden visual de los campos (para enfocar el primero con error)
const FIELD_ORDER: (keyof FormData)[] = [
  "nombre",
  "apellido",
  "dni",
  "celular",
  "correo",
  "password",
  "passwordconfirmacion",
];

const linkClass =
  "inline-flex min-h-11 items-center font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:underline";
const eyeClass =
  "absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-control text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const RegisterUser: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!formData.nombre.trim()) e.nombre = "Escribe tus nombres.";
    if (!formData.apellido.trim()) e.apellido = "Escribe tus apellidos.";
    if (!/^\d{8}$/.test(formData.dni)) e.dni = "El DNI debe tener 8 dígitos, solo números.";
    if (!/^\d{9}$/.test(formData.celular))
      e.celular = "El celular debe tener 9 dígitos, solo números.";
    if (!EMAIL_RE.test(formData.correo.trim()))
      e.correo = "El correo necesita una @ y un dominio, por ejemplo nombre@correo.com.";
    if (!PASSWORD_RE.test(formData.password)) e.password = PASSWORD_HINT;
    if (formData.password !== formData.passwordconfirmacion)
      e.passwordconfirmacion = "Las contraseñas no coinciden. Escríbelas igual en los dos campos.";
    return e;
  };

  // Pinta los errores del servidor junto a su campo; devuelve false si no había ninguno conocido
  const aplicarCampos = (fe: Record<string, string>): boolean => {
    const found: FieldErrors = {};
    for (const k of FIELD_ORDER) if (fe[k]) found[k] = fe[k];
    const invalid = FIELD_ORDER.filter((k) => found[k]);
    if (invalid.length === 0) return false;
    setErrors(found);
    flagInvalid(invalid);
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setServerErrors([]);

    const found = validate();
    setErrors(found);
    const invalid = FIELD_ORDER.filter((k) => found[k]);
    if (invalid.length > 0) {
      flagInvalid(invalid);
      return;
    }

    setIsSubmitting(true);
    const { nombre, apellido, dni, celular, correo, password } = formData;
    try {
      const { data } = await api.post("/api/auth/register", {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni,
        celular,
        correo: correo.trim(),
        password,
      });

      if (data.statusCode === 200) {
        setSuccessMessage(data.message);
        setRegistrationSuccess(true);
        setFormData(EMPTY);
      } else if (!aplicarCampos(fieldErrorsDe(data))) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          setServerErrors(data.errors);
        } else {
          setServerErrors([data.message || "No pudimos crear tu cuenta. Inténtalo de nuevo."]);
        }
      }
    } catch (error) {
      // Lo escrito se conserva: el formulario no se limpia si falla
      if (aplicarCampos(fieldErrorsDe(error))) return;
      const list = apiErrors(error);
      setServerErrors(
        list.length > 0
          ? list
          : [apiMessage(error, "No pudimos crear tu cuenta. Inténtalo de nuevo.")],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <EnvelopeSimple size={30} weight="duotone" aria-hidden="true" />
        </span>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Revisa tu correo</h1>
        <p role="status" className="mt-3 break-words text-text-muted">
          {successMessage}
        </p>
        <p className="mt-4 text-sm text-text-muted">
          ¿No lo recibiste? Revisa la carpeta de spam o{" "}
          <button type="button" onClick={() => setRegistrationSuccess(false)} className={linkClass}>
            inténtalo de nuevo
          </button>
          .
        </p>
        <Link to="/login" className={`${linkClass} mt-2 text-sm`}>
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  const pwType = showPassword ? "text" : "password";

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Crear cuenta</h1>
        <p className="mt-1 text-sm text-text-muted">
          Te enviaremos un correo para confirmar tu cuenta.
        </p>
      </header>

      {serverErrors.length > 0 && (
        <AuthAlert tone="error" className="mb-4">
          {serverErrors.length === 1 ? (
            serverErrors[0]
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              {serverErrors.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </AuthAlert>
      )}

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Nombres" id="nombre" required error={errors.nombre}>
          {(c) => (
            <Input {...c} name="nombre" autoComplete="given-name" placeholder="Tus nombres"
              value={formData.nombre} onChange={handleChange} />
          )}
        </FormField>
        <FormField label="Apellidos" id="apellido" required error={errors.apellido}>
          {(c) => (
            <Input {...c} name="apellido" autoComplete="family-name" placeholder="Tus apellidos"
              value={formData.apellido} onChange={handleChange} />
          )}
        </FormField>
        <FormField label="DNI" id="dni" required error={errors.dni}>
          {(c) => (
            <Input {...c} name="dni" inputMode="numeric" maxLength={8} placeholder="8 dígitos"
              value={formData.dni} onChange={handleChange} />
          )}
        </FormField>
        <FormField label="Celular" id="celular" required error={errors.celular}>
          {(c) => (
            <Input {...c} name="celular" type="tel" inputMode="numeric" maxLength={9}
              autoComplete="tel-national" placeholder="9 dígitos"
              value={formData.celular} onChange={handleChange} />
          )}
        </FormField>
        <FormField label="Correo electrónico" id="correo" required error={errors.correo}
          className="sm:col-span-2">
          {(c) => (
            <Input {...c} name="correo" type="email" inputMode="email" autoComplete="email"
              placeholder="nombre@correo.com" value={formData.correo} onChange={handleChange} />
          )}
        </FormField>
        <FormField label="Contraseña" id="password" required error={errors.password}
          helperText={errors.password ? undefined : PASSWORD_HINT} className="sm:col-span-2">
          {(c) => (
            <div className="relative">
              <Input {...c} name="password" type={pwType} autoComplete="new-password"
                placeholder="Crea una contraseña" value={formData.password}
                onChange={handleChange} className="pr-12" />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                aria-pressed={showPassword}
                className={eyeClass}
              >
                {showPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
            </div>
          )}
        </FormField>
        <FormField label="Repite tu contraseña" id="passwordconfirmacion" required
          error={errors.passwordconfirmacion} className="sm:col-span-2">
          {(c) => (
            <Input {...c} name="passwordconfirmacion" type={pwType} autoComplete="new-password"
              placeholder="Repite tu contraseña" value={formData.passwordconfirmacion}
              onChange={handleChange} />
          )}
        </FormField>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="sm:col-span-2">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className={linkClass}>
          Inicia sesión
        </Link>
      </p>
    </div>
  );
};

export default RegisterUser;
