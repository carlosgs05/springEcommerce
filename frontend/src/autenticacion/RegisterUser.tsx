import React, { useState, FormEvent, ChangeEvent, useRef } from "react";
import axios from "axios";
import swal from "sweetalert2/dist/sweetalert2.all.js";
import { Link } from "react-router-dom";

interface FormData {
  nombre: string;
  apellido: string;
  dni: string;
  celular: string;
  correo: string;
  password: string;
  passwordconfirmacion: string;
  idrol: number;
}

const RegisterUser: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    dni: "",
    celular: "",
    correo: "",
    password: "",
    passwordconfirmacion: "",
    idrol: 2,
  });

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showErrors = (errors: string[]) => {
    const listHtml = `
      <ol style="
        text-align: left;
        margin: 0;
        padding-left: 1.2em;
        font-size: 0.95rem;
        line-height: 1.4;
      ">
        ${errors
          .map(
            (err, i) =>
              `<li style="margin-bottom:0.5em;"><strong>${i + 1}.</strong> ${err}</li>`
          )
          .join("")}
      </ol>
    `;
    swal.fire({
      icon: "error",
      title: "<span style='font-size:1.25rem'>Errores de validación</span>",
      html: listHtml,
      customClass: {
        popup: "p-6 rounded-xl",
        confirmButton: "mt-4 w-24 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
      },
      showCloseButton: true,
      confirmButtonText: "Entendido",
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1️⃣ Validación local completa
    const validationErrors: string[] = [];

    if (!/^\d{8}$/.test(formData.dni)) {
      validationErrors.push("El DNI debe contener 8 dígitos numéricos");
    }
    if (!/^\d{9}$/.test(formData.celular)) {
      validationErrors.push("El celular debe contener 9 dígitos numéricos");
    }
    if (formData.password !== formData.passwordconfirmacion) {
      validationErrors.push("Las contraseñas no coinciden");
    }

    if (validationErrors.length > 0) {
      showErrors(validationErrors);
      return;
    }

    // 2️⃣ Iniciamos spinner
    setIsSubmitting(true);

    const { nombre, apellido, dni, celular, correo, password, idrol } = formData;
    const payload = { nombre, apellido, dni, celular, correo, password, idrol };

    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/auth/register",
        payload
      );

      if (data.statusCode === 200) {
        // Éxito
        setSuccessMessage(data.message);
        setRegistrationSuccess(true);
        setFormData({
          nombre: "",
          apellido: "",
          dni: "",
          celular: "",
          correo: "",
          password: "",
          passwordconfirmacion: "",
          idrol: 2,
        });
        formRef.current?.reset();
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        // Errores del backend (correo, rol, etc.)
        showErrors(data.errors);
      } else {
        showErrors([data.error || data.message || "Error en el registro"]);
      }
    } catch (error: any) {
      console.error(error);
      const resp = error.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        showErrors(resp.errors);
      } else if (resp?.error) {
        showErrors([resp.error]);
      } else {
        showErrors(["Error al conectar con el servidor"]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-zinc-900 from-60% to-gray-600 to-110% flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-gradient-to-tr from-gray-900 from-60% to-stone-800 to-110% rounded-xl shadow-2xl p-8 text-center">
          <img
            className="w-32 mx-auto mb-6 animate-pulse"
            src="https://img.icons8.com/fluent/344/verified-account.png"
            alt="Verificación"
          />
          <h2 className="text-2xl text-cyan-400 font-bold mb-4">
            ¡Registro Exitoso!
          </h2>
          <p className="text-gray-200 text-lg mb-8">{successMessage}</p>
          <p className="text-gray-400 text-sm mb-6">
            ¿No recibiste el correo? Revisa tu carpeta de spam o{" "}
            <button
              onClick={() => setRegistrationSuccess(false)}
              className="ml-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              inténtalo de nuevo
            </button>
          </p>
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-zinc-900 from-60% to-gray-600 to-110% flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gradient-to-tr from-gray-900 from-60% to-stone-800 to-110% rounded-xl shadow-2xl p-8">
        <header className="text-center mb-8">
          <img
            className="w-20 mx-auto mb-4"
            src="https://img.icons8.com/fluent/344/year-of-tiger.png"
            alt="Logo"
          />
          <h1 className="text-3xl text-white font-bold">Registro de Usuario</h1>
        </header>

        <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
          {/* Sección 1: Datos Personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nombres
              </label>
              <input
                name="nombre"
                type="text"
                placeholder="Ingresa tus nombres"
                onChange={handleChange}
                required
                className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Apellidos
              </label>
              <input
                name="apellido"
                type="text"
                placeholder="Ingresa tus apellidos"
                onChange={handleChange}
                required
                className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                DNI
              </label>
              <input
                name="dni"
                type="text"
                placeholder="Ingresa tu DNI"
                onChange={handleChange}
                required
                className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Celular
              </label>
              <input
                name="celular"
                type="tel"
                placeholder="Ingresa tu celular"
                onChange={handleChange}
                required
                className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Sección 2: Credenciales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Correo Electrónico
              </label>
              <input
                name="correo"
                type="email"
                placeholder="Ingresa tu correo"
                onChange={handleChange}
                required
                className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres con mayúscula, número y símbolo"
                onChange={handleChange}
                required
                minLength={8}
                className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Repite tu contraseña
              </label>
              <input
                name="passwordconfirmacion"
                type="password"
                placeholder="Repite tu contraseña"
                onChange={handleChange}
                required
                minLength={8}
                className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-8 bg-gradient-to-r from-blue-950 to-blue-800 hover:from-cyan-900 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
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
                <span>Registrando...</span>
              </div>
            ) : (
              "REGISTRAR"
            )}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;