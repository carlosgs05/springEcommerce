import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { api } from '../../lib/api';
import Swal from 'sweetalert2';
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

const PerfilAdmin: React.FC = () => {
  const { user, updateUser, setAuthToken } = useAuth();
  const correo = useCambiarCorreo();
  const [userData, setUserData] = useState<UserData>({
    nombre: '',
    apellido: '',
    celular: '',
    dni: '',
    correo: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errores>({});
  const [activeSection, setActiveSection] = useState<'personal' | 'security'>('personal');

  useEffect(() => {
    if (user) {
      setUserData({
        nombre: user.nombre,
        apellido: user.apellido,
        celular: user.celular || '',
        dni: user.dni || '',
        correo: user.correo,
        currentPassword: '',
            newPassword: '',
        confirmPassword: '',
      });
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
    if (activeSection === 'security') {
      if (!userData.currentPassword) found.currentPassword = 'Escribe tu contraseña actual para poder cambiarla.';
      if (!PASSWORD_RE.test(userData.newPassword)) found.newPassword = PASSWORD_HINT;
      if (userData.newPassword !== userData.confirmPassword) found.confirmPassword = 'Las contraseñas no coinciden. Escríbelas igual en los dos campos.';
    } else {
      if (!userData.nombre.trim()) found.nombre = 'Escribe tu nombre.';
      if (!userData.apellido.trim()) found.apellido = 'Escribe tu apellido.';
    }
    if (Object.keys(found).length > 0) {
      mostrarErrores(found);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      if (activeSection === 'security') {
        const response = await api.put('/api/auth/change-password', {
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword,
          confirmPassword: userData.confirmPassword
        });

        if (response.data.statusCode === 200) {
          // Las sesiones anteriores quedan invalidadas: se guarda el token nuevo
          if (response.data.token) setAuthToken(response.data.token);
          Swal.fire({ title: 'Éxito', text: 'Contraseña actualizada correctamente', icon: 'success' });
          setUserData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        }
      } else {
        // Sin correo: el servidor edita la cuenta de la sesión
        const response = await api.put('/api/auth/update-user', {
          nombre: userData.nombre,
          apellido: userData.apellido,
          celular: userData.celular
        });

        if (response.data.statusCode === 200) {
          updateUser(response.data.usuario);
          Swal.fire({ title: 'Éxito', text: 'Datos actualizados correctamente', icon: 'success' });
        }
      }
    } catch (error) {
      // Error de validación del servidor: va junto a su campo
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

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTabChange = (section: 'personal' | 'security') => {
    setActiveSection(section);
  };

  return (
    <div className="flex items-center justify-center min-h-[590px] py-8">
      <div className="w-full max-w-5xl mx-auto bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 relative">
        {/* Avatar position */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border-4 border-white shadow-md">
            <UserCircleIcon className="w-16 h-16 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            Admin
          </span>
        </div>

        <div className="pt-16 px-6 pb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Configuración de Perfil
            </h1>
            <p className="text-gray-600 mt-1">Administra tu información personal y de seguridad</p>
          </div>

          <div className="flex space-x-4 mb-8 border-b border-gray-200 justify-center">
            <button
              onClick={() => handleTabChange('personal')}
              className={`pb-3 px-1 text-base font-medium cursor-pointer transition-all duration-300 ease-in-out relative ${activeSection === 'personal'
                ? 'text-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Información Personal
              {activeSection === 'personal' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('security')}
              className={`pb-3 px-1 text-base font-medium cursor-pointer transition-all duration-300 ease-in-out relative ${activeSection === 'security'
                ? 'text-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Seguridad
              {activeSection === 'security' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></span>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-8 transition-all duration-300 ease-in-out">
            {activeSection === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ease-in-out">
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <label htmlFor="nombre" className="block w-full text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      name="nombre"
                      {...fieldAria('nombre', errors.nombre)}
                      value={userData.nombre}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 text-base text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${INVALID_CLASS}`}
                    />
                    <FieldError id="nombre" error={errors.nombre} />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="celular" className="block w-full text-sm font-medium text-gray-700 mb-2">Celular</label>
                    <div className="flex rounded-xl shadow-sm w-full">
                      <span className="px-4 inline-flex items-center text-base text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-xl">
                        +51
                      </span>
                      <input
                        name="celular"
                        {...fieldAria('celular', errors.celular)}
                        value={userData.celular}
                        onChange={handleChange}
                        className={`py-2.5 px-4 w-full text-base text-gray-900 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${INVALID_CLASS}`}
                        placeholder="Ej: 987654321"
                      />
                    </div>
                      <FieldError id="celular" error={errors.celular} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col">
                    <label htmlFor="apellido" className="block w-full text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <input
                      name="apellido"
                      {...fieldAria('apellido', errors.apellido)}
                      value={userData.apellido}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 text-base text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${INVALID_CLASS}`}
                    />
                    <FieldError id="apellido" error={errors.apellido} />
                  </div>
                  <div className="flex flex-col">
                    <label className="block w-full text-sm font-medium text-gray-700 mb-2">DNI</label>
                    <input
                      name="dni"
                      value={userData.dni}
                      disabled
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                      placeholder="Ingrese su DNI"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6 transition-all duration-300 ease-in-out pb-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label htmlFor="correo" className="block w-full text-sm font-medium text-gray-700 mb-2">Correo electrónico (se cambia en «Cambiar correo», más abajo)</label>
                    <input
                      id="correo"
                      name="correo"
                      value={userData.correo}
                      disabled
                      className="w-full px-4 py-2.5 text-base rounded-xl border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="currentPassword" className="block w-full text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                    <div className="relative w-full">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        name="currentPassword"
                        {...fieldAria('currentPassword', errors.currentPassword)}
                        value={userData.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        className={`w-full px-4 py-2.5 text-base text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 transition-all ${INVALID_CLASS}`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 cursor-pointer"
                      >
                        {showPassword.current ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                      <FieldError id="currentPassword" error={errors.currentPassword} />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label htmlFor="newPassword" className="block w-full text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                      <div className="relative w-full">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          name="newPassword"
                          {...fieldAria('newPassword', errors.newPassword)}
                          value={userData.newPassword}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 text-base text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 transition-all ${INVALID_CLASS}`}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 cursor-pointer"
                        >
                          {showPassword.new ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <FieldError id="newPassword" error={errors.newPassword} />
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor="confirmPassword" className="block w-full text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
                      <div className="relative w-full">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          {...fieldAria('confirmPassword', errors.confirmPassword)}
                          value={userData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 text-base text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 transition-all ${INVALID_CLASS}`}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 cursor-pointer"
                        >
                          {showPassword.confirm ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <FieldError id="confirmPassword" error={errors.confirmPassword} />
                    </div>
                  </div>
                </div>

              </div>
            )}

            <div className="flex justify-center gap-3 pt-8 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-colors cursor-pointer text-white font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-base font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>

          {activeSection === 'security' && (
          <form onSubmit={correo.paso === 1 ? correo.pedirCodigo : correo.confirmar} noValidate className="mt-8 pt-6 border-t border-gray-200 space-y-6">
            <h2 className="text-base font-semibold text-gray-700">Cambiar correo</h2>
            {correo.aviso && (
              <p role="status" className="rounded-xl bg-cyan-50 border border-cyan-200 px-4 py-3 text-sm text-gray-800">{correo.aviso}</p>
            )}
            {correo.paso === 1 ? (
              <>
                <div>
                  <label htmlFor={idCorreo("newCorreo")} className="block w-full text-sm font-medium text-gray-700 mb-2">Correo nuevo</label>
                  <input
                    type="email"
                    name="newCorreo"
                    inputMode="email"
                    autoComplete="email"
                    {...fieldAria(idCorreo("newCorreo"), correo.errors.newCorreo)}
                    value={correo.valores.newCorreo}
                    onChange={correo.handleChange}
                    className={`w-full px-4 py-2.5 text-base text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${INVALID_CLASS}`}
                  />
                  <FieldError id={idCorreo("newCorreo")} error={correo.errors.newCorreo} />
                </div>
                <div>
                  <label htmlFor={idCorreo("currentPassword")} className="block w-full text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    {...fieldAria(idCorreo("currentPassword"), correo.errors.currentPassword)}
                    value={correo.valores.currentPassword}
                    onChange={correo.handleChange}
                    className={`w-full px-4 py-2.5 text-base text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${INVALID_CLASS}`}
                  />
                  <FieldError id={idCorreo("currentPassword")} error={correo.errors.currentPassword} />
                </div>
              </>
            ) : (
                <div>
                  <label htmlFor={idCorreo("emailCode")} className="block w-full text-sm font-medium text-gray-700 mb-2">Código de 6 dígitos enviado al correo nuevo</label>
                  <input
                    type="text"
                    name="emailCode"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    {...fieldAria(idCorreo("emailCode"), correo.errors.emailCode)}
                    value={correo.valores.emailCode}
                    onChange={correo.handleChange}
                    className={`w-full px-4 py-2.5 text-base text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${INVALID_CLASS}`}
                  />
                  <FieldError id={idCorreo("emailCode")} error={correo.errors.emailCode} />
                </div>
            )}
            {correo.paso === 2 && (
              <p className="text-sm text-gray-600 break-all">Correo nuevo: <strong>{correo.valores.newCorreo}</strong></p>
            )}
            <div className="flex flex-wrap justify-end gap-4">
              {correo.paso === 2 && (
                <button type="button" onClick={correo.volver} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors cursor-pointer">
                  Pedir otro código
                </button>
              )}
              <button
                type="submit"
                disabled={correo.loading}
                className="px-6 py-2.5 text-base font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                {correo.loading ? 'Enviando...' : correo.paso === 1 ? 'Enviar código' : 'Confirmar correo'}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilAdmin;