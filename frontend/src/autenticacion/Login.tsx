import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import swal from 'sweetalert2/dist/sweetalert2.all.js';
import { useNavigate } from 'react-router-dom';

interface LoginData {
    correo: string;
    password: string;
}

interface Rol {
    idrol: number;
    nombre: string;
    [key: string]: any; // Propiedades adicionales
}

interface UserData {
    iduser?: number;
    nombre?: string;
    apellido?: string;
    dni?: string;
    correo?: string;
    rol?: Rol;
    enabled?: boolean;
    authorities?: Array<{ authority: string }>;
    [key: string]: any; // Otras propiedades posibles
}

interface LoginResponse {
    statusCode: number;
    message: string;
    token: string;
    refreshToken: string;
    expirationTime: string;
    rol?: Rol;
    usuario?: UserData;
    user?: UserData;
    // Para administradores puede venir directamente
    idrol?: number;
    nombre?: string;
}

const Login: React.FC = () => {
    const [formData, setFormData] = useState<LoginData>({
        correo: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post<LoginResponse>('http://localhost:8080/api/auth/login', formData);
            const { data } = response;

            if (response.status === 200) {
                // Extraer token y refreshToken
                const { token, refreshToken } = data;
                
                // Determinar el rol del usuario (compatible con múltiples estructuras)
                let userRole: Rol | undefined;
                let userData: UserData | undefined;

                // Caso 1: Rol directamente en la respuesta
                if (data.rol) {
                    userRole = data.rol;
                } 
                // Caso 2: Rol dentro de usuario/user
                else if (data.usuario?.rol) {
                    userRole = data.usuario.rol;
                    userData = data.usuario;
                } 
                else if (data.user?.rol) {
                    userRole = data.user.rol;
                    userData = data.user;
                }
                // Caso 3: Para administradores (puede venir idrol directamente)
                else if (data.idrol) {
                    userRole = {
                        idrol: data.idrol,
                        nombre: data.nombre || 'ADMIN'
                    };
                }

                // Verificar si se determinó el rol
                if (!userRole) {
                    console.error('Estructura de respuesta inesperada:', data);
                    throw new Error('La estructura de la respuesta no contiene información de rol');
                }

                // Guardar datos en localStorage
                localStorage.setItem('authToken', token);
                localStorage.setItem('refreshToken', refreshToken);
                
                if (userData) {
                    localStorage.setItem('userData', JSON.stringify(userData));
                }
                
                localStorage.setItem('userRole', JSON.stringify(userRole));

                // Mostrar mensaje de éxito
                await swal.fire({
                    title: '¡Bienvenido!',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'Continuar'
                });

                // Redirigir según el rol
                switch (userRole.idrol) {
                    case 1: // Admin
                        navigate('/admin');
                        break;
                    case 2: // Cliente
                        navigate('/');
                        break;
                    default:
                        navigate('/');
                }
            }
        } catch (error: any) {
            console.error('Error en login:', error);
            let errorMessage = 'Error al iniciar sesión';
            
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Credenciales incorrectas';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            await swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
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
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="correo">
                                Correo Electrónico
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="correo"
                                name="correo"
                                type="email"
                                placeholder="Ingresa tu correo"
                                onChange={handleChange}
                                value={formData.correo}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="password">
                                Contraseña
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                onChange={handleChange}
                                value={formData.password}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">
                                Recordar sesión
                            </label>
                        </div>
                        <a href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-cyan-900 hover:to-cyan-600 text-white transition-all font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-75"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </>
                            ) : 'INGRESAR'}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            ¿No tienes una cuenta?{' '}
                            <a href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
                                Regístrate
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;