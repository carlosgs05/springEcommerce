import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert2/dist/sweetalert2.all.js";

const VerifyResetCode: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: { correo: string } };
  const correo = state?.correo || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!correo) {
      navigate("/forgot-password");
    }
  }, [correo, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      swal.fire("Error", "El código debe tener 6 dígitos numéricos", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/auth/verify-reset-code",
        { correo, resetCode: Number(code) }
      );

      if (data.statusCode === 200) {
        swal.fire("Éxito", data.message, "success");
        navigate("/reset-password", { state: { correo } });
      } else {
        swal.fire("Error", data.message || "Código inválido", "error");
      }
    } catch (err: any) {
      swal.fire(
        "Error",
        err.response?.data?.message || "Error de servidor",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-zinc-900 from-60% to-gray-600 to-110%">
      <div className="w-full max-w-md m-auto bg-gradient-to-tr from-gray-900 from-60% to-stone-800 to-110% rounded-lg p-9 shadow-[-12px_12px_20px_0px_rgba(0,0,0,0.6)]">
        <header>
          <h1 className="text-2xl text-center text-white font-bold mb-6">
            Verificar Código
          </h1>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label
              htmlFor="code"
              className="block uppercase text-white text-xs font-bold mb-2"
            >
              Código de 6 dígitos
            </label>
            <input
              id="code"
              name="code"
              type="text"
              placeholder="Ingresa el código recibido"
              value={code}
              onChange={handleChange}
              required
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-800 text-cyan-600 border border-gray-700 rounded focus:outline-none focus:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bold text-white rounded bg-gradient-to-r from-blue-950 to-blue-800 hover:from-cyan-900 hover:to-cyan-600 disabled:opacity-75 transition-all mb-6 cursor-pointer"
          >
            {loading ? "Verificando..." : "VERIFICAR CÓDIGO"}
          </button>

          <p className="text-center text-sm text-gray-400">
            <Link
              to="/forgot-password"
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Volver
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetCode;
