import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface LoginData {
  correo: string;
  password: string;
}

interface LoginResponse {
  statusCode: number;
  message: string;
  token: string;
  refreshToken: string;
  expirationTime: string;
  rol: {
    idrol: number;
    nombre: string;
  };
  usuario: {
    iduser: number;
    nombre: string;
    apellido?: string;
    correo: string;
    celular?: string;
    dni?: string;
    rol: {
      idrol: number;
      nombre: string;
    };
    enabled: boolean;
  };
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({ correo: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Actualiza formData al cambiar cualquiera de los inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRememberMe(checked);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, status } = await axios.post<LoginResponse>(
        'http://localhost:8080/api/auth/login',
        {
          correo: formData.correo,
          password: formData.password,
        }
      );

      if (status === 200) {
        const { token, refreshToken, rol, usuario } = data;

        const userData = {
          iduser: usuario.iduser,
          nombre: usuario.nombre,
          apellido: usuario.apellido || '',
          correo: usuario.correo,
          celular: usuario.celular || '',
          dni: usuario.dni || '',
          rol: {
            idrol: rol.idrol,
            nombre: rol.nombre,
          },
        };

        // Guardar en contexto
        login(userData, token);

        // Persistir tokens
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', token);
        storage.setItem('refreshToken', refreshToken);
        storage.setItem('userData', JSON.stringify(userData));

        // Redirigir según rol
        if (rol.idrol === 1) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      let msg = 'Error al iniciar sesión';
      if (err.response?.status === 401) {
        msg = 'Credenciales incorrectas';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      alert(msg);
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
          <h1 className="text-2xl text-center text-white font-bold mb-6">Iniciar Sesión</h1>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {/* Correo */}
          <div className="mb-6">
            <label htmlFor="correo" className="block uppercase text-white text-xs font-bold mb-2">
              Correo Electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              placeholder="Ingresa tu correo"
              value={formData.correo}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full px-4 py-3 bg-gray-800 text-cyan-600 border border-gray-700 rounded focus:outline-none focus:bg-zinc-900"
            />
          </div>

          {/* Contraseña */}
          <div className="mb-6">
            <label htmlFor="password" className="block uppercase text-white text-xs font-bold mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-gray-800 text-cyan-600 border border-gray-700 rounded focus:outline-none focus:bg-zinc-900"
            />
          </div>

          {/* Recordar sesión y enlace olvidar */}
          <div className="flex items-center justify-between mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="remember"
                checked={rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">Recordar sesión</span>
            </label>
            <a href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bold text-white rounded bg-gradient-to-r from-blue-950 to-blue-800 hover:from-cyan-900 hover:to-cyan-600 disabled:opacity-75 transition-all"
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
              'INGRESAR'
            )}
          </button>

          {/* Enlace para registrarse */}
          <p className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
              Regístrate
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;