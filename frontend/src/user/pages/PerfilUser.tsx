import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { FaUserEdit, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import Header from "../Header";
import Footer from "../Footer";
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

const PerfilUser = () => {
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    nombre: "",
    apellido: "",
    celular: "",
    dni: "",
    correo: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        nombre: user.nombre,
        apellido: user.apellido,
        celular: user.celular || "",
        dni: user.dni || "",
        correo: user.correo,
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        celular: userData.celular,
        correo: user?.correo
      };

      const response = await axios.put('http://localhost:8080/api/auth/update-user', updateData);

      if (userData.newPassword) {
        if (userData.newPassword !== userData.confirmPassword) {
          Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
          return;
        }

        await axios.post('http://localhost:8080/api/auth/reset-password', {
          correo: user?.correo,
          newPassword: userData.newPassword,
          confirmPassword: userData.confirmPassword
        });
      }

      if (response.data.statusCode === 200) {
        updateUser(response.data.usuario);
        Swal.fire('Éxito', 'Datos actualizados correctamente', 'success');
        setUserData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message 
        ? error.response.data.message 
        : 'Error en la operación';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
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

          <form onSubmit={handleSubmit} className="space-y-8">
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
                  <label className="block text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={userData.nombre}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={userData.apellido}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="celular"
                    value={userData.celular}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
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
                  <label className="block text-gray-700 mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={userData.correo}
                    disabled
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-6 space-y-6">
                  <div className="relative">
                    <label className="block text-gray-700 mb-2">Contraseña Actual</label>
                    <input
                      type="password"
                      value="••••••••••••••••••••"
                      disabled
                      className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-gray-700 mb-2">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        value={userData.newPassword}
                        onChange={handleChange}
                        className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-3.5 text-gray-500 hover:text-cyan-600"
                      >
                        {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={userData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-3.5 text-gray-500 hover:text-cyan-600"
                      >
                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PerfilUser;