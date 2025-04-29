// PerfilAdmin.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';

interface UserData {
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PerfilAdmin: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    nombre: '',
    apellido: '',
    correo: '',
    celular: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Partial<UserData & { general: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'security'>('personal');

  // Cargamos todos los campos desde user
  useEffect(() => {
    if (user) {
      setUserData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        correo: user.correo || '',
        celular: user.celular || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setIsSaved(false);
  };

  const validarFormulario = () => {
    const nuevosErrores: Partial<UserData> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userData.nombre.trim()) nuevosErrores.nombre = 'Nombre requerido';
    if (!userData.apellido.trim()) nuevosErrores.apellido = 'Apellido requerido';
    if (!userData.correo.trim()) {
      nuevosErrores.correo = 'Correo requerido';
    } else if (!emailRegex.test(userData.correo)) {
      nuevosErrores.correo = 'Correo inválido';
    }
    // Opcional validar celular
    if (!/^[0-9]{10}$/.test(userData.celular)) {
      nuevosErrores.celular = 'Celular inválido (10 dígitos)';
    }

    if (userData.newPassword) {
      if (!userData.currentPassword) nuevosErrores.currentPassword = 'Contraseña actual requerida';
      if (userData.newPassword.length < 8) nuevosErrores.newPassword = 'Mínimo 8 caracteres';
      if (userData.newPassword !== userData.confirmPassword) nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setIsSubmitting(true);
    // Aún sin implementación de llamada al backend
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 500);
  };

  const togglePasswordVisibility = (campo: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Perfil Administrativo</h1>
      <p className="text-gray-600 mb-6">Actualiza tu información personal y de seguridad</p>

      {errors.general && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 112 0v3a1 1 0 11-2 0V9zm1-5a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errors.general}</span>
        </div>
      )}

      <div className="mb-8 border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSection('personal')}
            className={`pb-3 px-1 ${
              activeSection === 'personal'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`pb-3 px-1 ${
              activeSection === 'security'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Seguridad
          </button>
        </nav>
      </div>

      {isSaved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>¡Cambios guardados correctamente!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeSection === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
                <input
                  name="nombre"
                  value={userData.nombre}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>
            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido
                <input
                  name="apellido"
                  value={userData.apellido}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
              {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
            </div>
            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
                <input
                  type="email"
                  name="correo"
                  value={userData.correo}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
              {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
            </div>
            {/* Celular */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Celular
                <div className="flex items-center">
                  <span className="mr-2">+51</span>
                  <input
                    type="tel"
                    name="celular"
                    value={userData.celular}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </label>
              {errors.celular && <p className="text-red-500 text-sm mt-1">{errors.celular}</p>}
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-4">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={userData.currentPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 pr-10 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.current ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </label>
              {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
            </div>
            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 pr-10 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.new ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </label>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>
            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 pr-10 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.confirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </label>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerfilAdmin;
