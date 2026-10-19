import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, SpinnerGap, XCircle } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { Button } from "../components/ui";
import { apiMessage } from "./formUtils";

interface VerifyResponse {
  statusCode: number;
  message: string;
  nombre?: string;
  correo?: string;
}

const VerificationAccount: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(5);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("El enlace no es válido. Abre el enlace completo que te enviamos por correo.");
      return;
    }

    api
      .get<VerifyResponse>("/api/auth/verify-email", { params: { token } })
      .then((resp) => {
        if (resp.data.statusCode === 200) {
          const { nombre = "", message: srvMsg } = resp.data;
          setStatus("success");
          setMessage(nombre ? `¡Hola ${nombre}! ${srvMsg}` : srvMsg);
        } else {
          setStatus("error");
          setMessage(resp.data.message || "No pudimos verificar tu cuenta.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(apiMessage(err, "No pudimos verificar tu cuenta. Inténtalo de nuevo."));
      });
  }, []);

  // Cuenta regresiva y redirección al login
  useEffect(() => {
    if (status !== "success") return;
    const interval = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === "success" && seconds <= 0) navigate("/login");
  }, [status, seconds, navigate]);

  const title =
    status === "loading"
      ? "Verificando tu cuenta"
      : status === "success"
        ? "Cuenta verificada"
        : "No pudimos verificar tu cuenta";

  return (
    <div className="text-center">
      <span
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
          status === "error" ? "bg-danger/15 text-danger" : status === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
        }`}
      >
        {status === "loading" && <SpinnerGap size={30} className="animate-spin" aria-hidden="true" />}
        {status === "success" && <CheckCircle size={30} weight="fill" aria-hidden="true" />}
        {status === "error" && <XCircle size={30} weight="fill" aria-hidden="true" />}
      </span>

      <h1 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h1>

      <div role="status" aria-live="polite">
        {status === "loading" ? (
          <p className="mt-3 text-text-muted">Un momento, estamos confirmando tu correo.</p>
        ) : (
          <p className="mt-3 break-words text-text-muted">{message}</p>
        )}
        {status === "success" && (
          <p className="mt-2 text-sm text-text-muted">
            Te llevamos a iniciar sesión en {Math.max(seconds, 0)} segundos.
          </p>
        )}
      </div>

      {status !== "loading" && (
        <Button fullWidth size="lg" className="mt-6" onClick={() => navigate("/login")}>
          Ir a iniciar sesión
        </Button>
      )}
    </div>
  );
};

export default VerificationAccount;
