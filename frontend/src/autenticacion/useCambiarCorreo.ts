import { useState, ChangeEvent, FormEvent } from "react";
import Swal from "sweetalert2";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { EMAIL_RE, apiMessage, fieldErrorsDe, flagInvalid } from "./formUtils";

type Campo = "newCorreo" | "currentPassword" | "emailCode";
type Errores = Partial<Record<Campo, string>>;
/** Ids con prefijo: la pantalla ya tiene otro campo "currentPassword" (cambio de contraseña). */
export const idCorreo = (k: string) => `correo-${k}`;
const PEDIDO_ANULADO = ["Ese correo ya no está disponible", "Demasiados intentos"];
const ORDEN_1: Campo[] = ["newCorreo", "currentPassword"];

/** Lógica de "Cambiar correo" (2 pasos) compartida por PerfilUser y PerfilAdmin; cada pantalla pone su propio aspecto. */
export function useCambiarCorreo() {
  const { user, updateUser, setAuthToken } = useAuth();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [valores, setValores] = useState({ newCorreo: "", currentPassword: "", emailCode: "" });
  const [errors, setErrors] = useState<Errores>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const limpio = name === "emailCode" ? value.replace(/\D/g, "").slice(0, 6) : value;
    setValores((p) => ({ ...p, [name]: limpio }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const mostrar = (found: Errores, orden: Campo[]) => {
    setErrors(found);
    flagInvalid(orden.filter((k) => found[k]).map(idCorreo));
  };

  const pedirCodigo = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setAviso(null);
    const found: Errores = {};
    const nuevo = valores.newCorreo.trim();
    if (!nuevo) found.newCorreo = "Escribe el correo nuevo.";
    else if (!EMAIL_RE.test(nuevo)) found.newCorreo = "El correo necesita una @ y un dominio, por ejemplo nombre@correo.com.";
    if (!valores.currentPassword) found.currentPassword = "Escribe tu contraseña actual para poder cambiar el correo.";
    if (Object.keys(found).length > 0) return mostrar(found, ORDEN_1);
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/change-email", {
        newCorreo: nuevo,
        currentPassword: valores.currentPassword,
      });
      setAviso(data.message || "Te enviamos un código de 6 dígitos al correo nuevo");
      setValores((p) => ({ ...p, currentPassword: "", emailCode: "" }));
      setPaso(2);
    } catch (err) {
      const fe = fieldErrorsDe(err);
      const found: Errores = {};
      for (const k of ORDEN_1) if (fe[k]) found[k] = fe[k];
      // El código de la app ya se gastó o falló: hay que escribir uno nuevo
      setValores((p) => ({ ...p,}));
      if (Object.keys(found).length > 0) return mostrar(found, ORDEN_1);
      Swal.fire({ title: "Error", text: apiMessage(err, "No pudimos enviar el código. Inténtalo de nuevo."), icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  const confirmar = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!/^\d{6}$/.test(valores.emailCode)) {
      mostrar({ emailCode: "El código tiene 6 dígitos, solo números. Revisa el correo nuevo." }, ["emailCode"]);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/change-email/confirm", { emailCode: valores.emailCode });
      // El token anterior deja de valer solo: se guarda el nuevo y el correo nuevo se ve al instante
      if (data.token) setAuthToken(data.token);
      if (data.usuario) updateUser(data.usuario);
      setValores({ newCorreo: "", currentPassword: "", emailCode: "" });
      setAviso(null);
      setPaso(1);
      Swal.fire({ title: "Éxito", text: data.message || "Correo actualizado", icon: "success" });
    } catch (err) {
      const fe = fieldErrorsDe(err);
      if (fe.emailCode && PEDIDO_ANULADO.some((t) => fe.emailCode.includes(t))) {
        // El backend anuló el pedido: el código ya no sirve, se vuelve al paso 1 con el motivo
        setValores((p) => ({ ...p, emailCode: "" }));
        setErrors({});
        setPaso(1);
        setAviso(fe.emailCode);
        return;
      }
      if (fe.emailCode) return mostrar({ emailCode: fe.emailCode }, ["emailCode"]);
      Swal.fire({ title: "Error", text: apiMessage(err, "No pudimos confirmar el correo. Inténtalo de nuevo."), icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  /** Vuelve al paso 1 (para corregir el correo o pedir otro código). Conserva el correo escrito. */
  const volver = () => {
    setPaso(1);
    setErrors({});
    setAviso(null);
    setValores((p) => ({ ...p, emailCode: "" }));
  };

  return { correoActual: user?.correo ?? "", paso, valores, errors, aviso, loading, handleChange, pedirCodigo, confirmar, volver };
}
