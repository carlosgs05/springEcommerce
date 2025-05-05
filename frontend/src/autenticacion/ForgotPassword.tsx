import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert2/dist/sweetalert2.all.js";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, status } = await axios.post(
        "http://localhost:8080/api/auth/forgot-password",
        { correo: email }
      );

      if (status === 200 && data.statusCode === 200) {
        swal.fire("Éxito", data.message, "success");
        navigate("/verify-reset-code", { state: { correo: email } });
      } else {
        swal.fire("Error", data.message || "Error inesperado", "error");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Error al conectar con el servidor";
      swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-zinc-900 from-60% to-gray-600 to-110%">
      <div className="w-full max-w-lg m-auto bg-gradient-to-tr from-gray-900 from-60% to-stone-800 to-110% rounded-lg p-9 shadow-[-12px_12px_20px_0px_rgba(0,0,0,0.6)]">
        <header>
          <img
            className="w-20 mx-auto mb-5"
            src="https://img.icons8.com/fluent/344/year-of-tiger.png"
            alt="Logo"
          />
          <h1 className="text-2xl text-center text-white font-bold mb-6">
            Recuperar Contraseña
          </h1>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block uppercase text-white text-xs font-bold mb-2"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Ingresa tu correo registrado"
              value={email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-gray-800 text-cyan-600 border border-gray-700 rounded focus:outline-none focus:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bold text-white rounded bg-gradient-to-r from-blue-950 to-blue-800 hover:from-cyan-900 hover:to-cyan-600 disabled:opacity-75 transition-all mb-6 cursor-pointer"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              "BUSCAR CUENTA"
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            <Link
              to="/login"
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Regresar a login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
