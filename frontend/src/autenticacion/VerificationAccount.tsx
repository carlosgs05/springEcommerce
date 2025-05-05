import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface VerifyResponse {
  statusCode: number;
  message: string;
  nombre?: string;
  correo?: string;
}

const VerificationAccount: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verificando cuenta...");
  const [seconds, setSeconds] = useState(5);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token no proporcionado en la URL.");
      return;
    }

    axios
      .get<VerifyResponse>(
        `http://localhost:8080/api/auth/verify-email?token=${token}`
      )
      .then((resp) => {
        console.log("HTTP status:", resp.status, "Payload:", resp.data);
        if (resp.status === 200 && resp.data.statusCode === 200) {
          const { nombre = "", message: srvMsg } = resp.data;
          setStatus("success");
          setMessage(`¡Hola ${nombre}! ${srvMsg}`);
        } else {
          setStatus("error");
          setMessage(resp.data.message || "Error en la verificación.");
        }
      })
      .catch((err) => {
        console.error("Axios catch:", err);
        const errMsg =
          err.response?.data?.message ||
          err.message ||
          "No se pudo conectar con el servidor.";
        setStatus("error");
        setMessage(errMsg);
      });
  }, []);

  // Contador y redirección
  useEffect(() => {
    if (status === "success") {
      const interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate("/login");
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-tr from-zinc-900 to-gray-700">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-2xl shadow-2xl text-center text-white space-y-4">
        <img
          className="w-20 mx-auto mb-4 animate-pulse"
          src={
            status === "loading"
              ? "https://img.icons8.com/ios-filled/50/00ffff/spinner-frame-2.png"
              : status === "success"
              ? "https://img.icons8.com/color/96/ok--v1.png"
              : "https://img.icons8.com/color/96/cancel--v1.png"
          }
          alt={status}
        />

        <h1 className="text-2xl font-semibold tracking-wide">
          {status === "loading"
            ? "Verificando cuenta..."
            : status === "success"
            ? "Cuenta verificada"
            : "Verificación fallida"}
        </h1>

        <p
          className={`text-base ${
            status === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>

        {status === "success" && (
          <p className="text-sm text-gray-300">
            Redirigiendo al login en{" "}
            <span className="font-bold">{seconds}</span> segundos...
          </p>
        )}

        {status !== "loading" && (
          <Link to="/login">
            <button
              className={`mt-4 w-full py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                status === "success"
                  ? "bg-cyan-500 hover:bg-cyan-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              Ir al Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerificationAccount;
