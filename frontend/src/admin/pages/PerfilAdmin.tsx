import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';

interface UserData {
  nombre: string;
  apellido: string;
  celular: string;
  dni: string;
  correo: string;
  newPassword: string;
  confirmPassword: string;
}

const PerfilAdmin: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    nombre: '',
    apellido: '',
    celular: '',
    dni: '',
    correo: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'security'>('personal');

  useEffect(() => {
    if (user) {
      setUserData({
        nombre: user.nombre,
        apellido: user.apellido,
        celular: user.celular || '',
        dni: user.dni || '',
        correo: user.correo,
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTabChange = (section: 'personal' | 'security') => {
    setActiveSection(section);
  };

  return (
    <div className="flex items-center justify-center min-h-[590px] py-8"> {/* Cambiado a min-h y agregado py-8 */}
      <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg relative">
        {/* Avatar position */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
            <UserCircleIcon className="w-16 h-16 text-blue-600" />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            Admin
          </span>
        </div>

        <div className="pt-16 px-6 pb-6"> {/* Añadido pb-6 para padding bottom */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Configuración de Perfil</h1>
            <p className="text-gray-500 mt-1">Administra tu información personal y de seguridad</p>
          </div>

          <div className="flex space-x-4 mb-8 border-b border-gray-200 justify-center">
            <button
              onClick={() => handleTabChange('personal')}
              className={`pb-3 px-1 text-base font-medium cursor-pointer transition-all duration-300 ease-in-out ${activeSection === 'personal'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Información Personal
            </button>
            <button
              onClick={() => handleTabChange('security')}
              className={`pb-3 px-1 text-base font-medium cursor-pointer transition-all duration-300 ease-in-out ${activeSection === 'security'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Seguridad
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 transition-all duration-300 ease-in-out">
            {activeSection === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ease-in-out">
                <div className="space-y-7">
                  <div className="flex flex-col">
                    <label className="block w-full text-base font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      name="nombre"
                      value={userData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block w-full text-base font-medium text-gray-700 mb-2">Celular</label>
                    <div className="flex rounded-lg shadow-sm w-full">
                      <span className="px-4 inline-flex items-center text-base text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                        +51
                      </span>
                      <input
                        name="celular"
                        value={userData.celular}
                        onChange={handleChange}
                        className="py-2.5 px-4 w-full text-base border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 987654321"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-7">
                  <div className="flex flex-col">
                    <label className="block w-full text-base font-medium text-gray-700 mb-2">Apellido</label>
                    <input
                      name="apellido"
                      value={userData.apellido}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block w-full text-base font-medium text-gray-700 mb-2">DNI</label>
                    <input
                      name="dni"
                      value={userData.dni}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Ingrese su DNI"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6 transition-all duration-300 ease-in-out pb-4"> {/* Añadido pb-4 */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="block w-full text-base font-medium text-gray-700 mb-2">Correo electrónico</label>
                    <input
                      name="correo"
                      value={userData.correo}
                      disabled
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block w-full text-base font-medium text-gray-700 mb-2">Contraseña actual</label>
                    <input
                      type="password"
                      value="••••••••••••••••••••"
                      disabled
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-7">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="block w-full text-base font-medium text-gray-700 mb-2">Nueva contraseña</label>
                      <div className="relative w-full">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          name="newPassword"
                          value={userData.newPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12"
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
                    </div>

                    <div className="flex flex-col">
                      <label className="block w-full text-base font-medium text-gray-700 mb-2">Confirmar contraseña</label>
                      <div className="relative w-full">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={userData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12"
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-8 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2.5 text-base font-medium text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PerfilAdmin;