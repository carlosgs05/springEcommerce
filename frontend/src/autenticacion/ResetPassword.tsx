import React, { useState, FormEvent, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert2/dist/sweetalert2.all.js";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: { correo: string } };
  const correo = state?.correo || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!correo) {
      navigate("/forgot-password");
    }
  }, [correo, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      swal.fire(
        "Error",
        "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 caracter especial (@$!%*?&#_)",
        "error"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/auth/reset-password",
        { correo, newPassword, confirmPassword }
      );

      if (data.statusCode === 200) {
        swal.fire("Éxito", data.message, "success");
        navigate("/login");
      } else {
        swal.fire(
          "Error",
          data.message || "No se pudo cambiar la contraseña",
          "error"
        );
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
            Cambiar Contraseña
          </h1>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label
              htmlFor="newPassword"
              className="block uppercase text-white text-xs font-bold mb-2"
            >
              Nueva Contraseña
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Ingresa nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 text-cyan-600 border border-gray-700 rounded focus:outline-none focus:bg-zinc-900"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block uppercase text-white text-xs font-bold mb-2"
            >
              Repetir Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 text-cyan-600 border border-gray-700 rounded focus:outline-none focus:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bold text-white rounded bg-gradient-to-r from-blue-950 to-blue-800 hover:from-cyan-900 hover:to-cyan-600 disabled:opacity-75 transition-all mb-6 cursor-pointer"
          >
            {loading ? "Actualizando..." : "CAMBIAR CONTRASEÑA"}
          </button>

          <p className="text-center text-sm text-gray-400">
            <Link
              to="/login"
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Volver a login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
