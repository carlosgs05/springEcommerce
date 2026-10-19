import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { FaUserEdit, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import axios from "axios";
import { api } from "../../lib/api";
import Swal from "sweetalert2";
import Header from "../Header";
import Footer from "../Footer";
import { useAuth } from '../../context/AuthContext';
import { FieldError, INVALID_CLASS, fieldAria } from '../../components/FieldError';
import { useCambiarCorreo, idCorreo } from '../../autenticacion/useCambiarCorreo';
import { PASSWORD_HINT, PASSWORD_RE, fieldErrorsDe, flagInvalid } from '../../autenticacion/formUtils';

interface UserData {
  nombre: string;
  apellido: string;
  celular: string;
  dni: string;
  correo: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type Errores = Partial<Record<keyof UserData, string>>;
// Orden visual de los campos (para enfocar el primero con error)
const ORDEN: (keyof UserData)[] = ['nombre', 'apellido', 'celular', 'currentPassword', 'newPassword', 'confirmPassword'];

const PerfilUser = () => {
  const { user, updateUser, setAuthToken } = useAuth();
  const correo = useCambiarCorreo();
  const [userData, setUserData] = useState<UserData>({
    nombre: "",
    apellido: "",
    celular: "",
    dni: "",
    correo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errores>({});

  useEffect(() => {
    if (user) {
      // Las contraseñas escritas se conservan: updateUser cambia `user` a mitad del envío
      setUserData(prev => ({
        ...prev,
        nombre: user.nombre,
        apellido: user.apellido,
        celular: user.celular || "",
        dni: user.dni || "",
        correo: user.correo,
      }));
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const mostrarErrores = (found: Errores) => {
    setErrors(found);
    flagInvalid(ORDEN.filter(k => found[k]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const found: Errores = {};
    if (!userData.nombre.trim()) found.nombre = 'Escribe tu nombre.';
    if (!userData.apellido.trim()) found.apellido = 'Escribe tu apellido.';
    if (userData.newPassword) {
      if (!userData.currentPassword) found.currentPassword = 'Escribe tu contraseña actual para poder cambiarla.';
      if (!PASSWORD_RE.test(userData.newPassword)) found.newPassword = PASSWORD_HINT;
      if (userData.newPassword !== userData.confirmPassword) found.confirmPassword = 'Las contraseñas no coinciden. Escríbelas igual en los dos campos.';
    }
    if (Object.keys(found).length > 0) {
      mostrarErrores(found);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      // Sin correo: el servidor edita la cuenta de la sesión
      const updateData = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        celular: userData.celular
      };

      const response = await api.put('/api/auth/update-user', updateData);
      const datosGuardados = response.data.statusCode === 200;
      // Lo que ya se guardó se refleja aunque el cambio de contraseña falle después
      if (datosGuardados) updateUser(response.data.usuario);

      let passwordChanged = false;
      if (userData.newPassword) {
        const pw =await api.put('/api/auth/change-password', {
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword,
          confirmPassword: userData.confirmPassword
        });
        // Las sesiones anteriores quedan invalidadas: se guarda el token nuevo
        if (pw.data?.token) setAuthToken(pw.data.token);
        passwordChanged = true;
      }

      if (datosGuardados) {
        Swal.fire({
          title: 'Éxito',
          text: passwordChanged ? 'Datos y contraseña actualizados correctamente' : 'Datos actualizados correctamente',
          icon: 'success'
        });
        setUserData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (error) {
      // Error de validación del servidor: va junto a su campo (si falla change-password, en ese campo)
      const fe = fieldErrorsDe(error);
      const found: Errores = {};
      for (const k of ORDEN) if (fe[k]) found[k] = fe[k];
      if (Object.keys(found).length > 0) {
        mostrarErrores(found);
        return;
      }
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message 
        ? error.response.data.message 
        : 'Error en la operación';
      Swal.fire({ title: 'Error', text: errorMessage, icon: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="flex-grow bg-gradient-to-b from-gray-50 to-stone-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-cyan-600 mb-8 flex items-center gap-2">
            <FaUserEdit className="inline-block" /> Mi Perfil
          </h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <FaUser className="text-4xl text-gray-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {userData.nombre} {userData.apellido}
                </h2>
                <p className="text-gray-600">{userData.correo}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-cyan-600 mb-6">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    {...fieldAria("nombre", errors.nombre)}
                    value={userData.nombre}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none ${INVALID_CLASS}`}
                    required
                  />
                  <FieldError id="nombre" error={errors.nombre} />
                </div>
                <div>
                  <label htmlFor="apellido" className="block text-gray-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    {...fieldAria("apellido", errors.apellido)}
                    value={userData.apellido}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none ${INVALID_CLASS}`}
                    required
                  />
                  <FieldError id="apellido" error={errors.apellido} />
                </div>
                <div>
                  <label htmlFor="celular" className="block text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="celular"
                    {...fieldAria("celular", errors.celular)}
                    value={userData.celular}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none ${INVALID_CLASS}`}
                  />
                  <FieldError id="celular" error={errors.celular} />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={userData.dni}
                    disabled
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-cyan-600 mb-6">
                Seguridad
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="correo" className="block text-gray-700 mb-2">Correo Electrónico (se cambia en «Cambiar correo», más abajo)</label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    value={userData.correo}
                    disabled
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-6 space-y-6">
                  <div className="relative">
                    <label htmlFor="currentPassword" className="block text-gray-700 mb-2">Contraseña Actual</label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        {...fieldAria("currentPassword", errors.currentPassword)}
                        value={userData.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none pr-12 ${INVALID_CLASS}`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-3.5 text-gray-500 hover:text-cyan-600"
                      >
                        {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <FieldError id="currentPassword" error={errors.currentPassword} />
                  </div>

                  <div className="relative">
                    <label htmlFor="newPassword" className="block text-gray-700 mb-2">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        {...fieldAria("newPassword", errors.newPassword)}
                        value={userData.newPassword}
                        onChange={handleChange}
                        className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none pr-12 ${INVALID_CLASS}`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-3.5 text-gray-500 hover:text-cyan-600"
                      >
                        {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <FieldError id="newPassword" error={errors.newPassword} />
                  </div>

                  <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        {...fieldAria("confirmPassword", errors.confirmPassword)}
                        value={userData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none pr-12 ${INVALID_CLASS}`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-3.5 text-gray-500 hover:text-cyan-600"
                      >
                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <FieldError id="confirmPassword" error={errors.confirmPassword} />
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>

          <form onSubmit={correo.paso === 1 ? correo.pedirCodigo : correo.confirmar} noValidate className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200 space-y-6">
            <h2 className="text-xl font-semibold text-cyan-600">Cambiar correo</h2>
            {correo.aviso && (
              <p role="status" className="rounded-lg bg-cyan-50 border border-cyan-200 px-4 py-3 text-sm text-gray-800">{correo.aviso}</p>
            )}
            {correo.paso === 1 ? (
              <>
                <div>
                  <label htmlFor={idCorreo("newCorreo")} className="block text-gray-700 mb-2">Correo nuevo</label>
                  <input
                    type="email"
                    name="newCorreo"
                    inputMode="email"
                    autoComplete="email"
                    {...fieldAria(idCorreo("newCorreo"), correo.errors.newCorreo)}
                    value={correo.valores.newCorreo}
                    onChange={correo.handleChange}
                    className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none ${INVALID_CLASS}`}
                  />
                  <FieldError id={idCorreo("newCorreo")} error={correo.errors.newCorreo} />
                </div>
                <div>
                  <label htmlFor={idCorreo("currentPassword")} className="block text-gray-700 mb-2">Contraseña actual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    {...fieldAria(idCorreo("currentPassword"), correo.errors.currentPassword)}
                    value={correo.valores.currentPassword}
                    onChange={correo.handleChange}
                    className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none ${INVALID_CLASS}`}
                  />
                  <FieldError id={idCorreo("currentPassword")} error={correo.errors.currentPassword} />
                </div>
              </>
            ) : (
                <div>
                  <label htmlFor={idCorreo("emailCode")} className="block text-gray-700 mb-2">Código de 6 dígitos enviado al correo nuevo</label>
                  <input
                    type="text"
                    name="emailCode"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    {...fieldAria(idCorreo("emailCode"), correo.errors.emailCode)}
                    value={correo.valores.emailCode}
                    onChange={correo.handleChange}
                    className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none ${INVALID_CLASS}`}
                  />
                  <FieldError id={idCorreo("emailCode")} error={correo.errors.emailCode} />
                </div>
            )}
            {correo.paso === 2 && (
              <p className="text-sm text-gray-600 break-all">Correo nuevo: <strong>{correo.valores.newCorreo}</strong></p>
            )}
            <div className="flex flex-wrap justify-end gap-4">
              {correo.paso === 2 && (
                <button type="button" onClick={correo.volver} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200">
                  Pedir otro código
                </button>
              )}
              <button
                type="submit"
                disabled={correo.loading}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {correo.loading ? 'Enviando...' : correo.paso === 1 ? 'Enviar código' : 'Confirmar correo'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PerfilUser;