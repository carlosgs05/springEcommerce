import React, { useState, FormEvent, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import swal from 'sweetalert2/dist/sweetalert2.all.js';
import { Link } from 'react-router-dom';

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
        nombre: '',
        apellido: '',
        dni: '',
        celular: '',
        correo: '',
        password: '',
        passwordconfirmacion: '',
        idrol: 2,
    });

    const formRef = useRef<HTMLFormElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.passwordconfirmacion) {
            swal.fire("Error", "Las contraseñas no coinciden", "error");
            return;
        }

        const { nombre, apellido, dni, celular, correo, password, idrol } = formData;
        const payload = { nombre, apellido, dni, celular, correo, password, idrol };

        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', payload);

            if (response.status === 200) {
                swal.fire("Éxito", "Usuario registrado exitosamente", "success");
                setFormData({
                    nombre: '',
                    apellido: '',
                    dni: '',
                    celular: '',
                    correo: '',
                    password: '',
                    passwordconfirmacion: '',
                    idrol: 2,
                });

                formRef.current?.reset();
            }
        } catch (error) {
            console.error('Error:', error);
            swal.fire("Error", "Error al conectar con el servidor", "error");
        }
    };

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
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Nombres
                                </label>
                                <input
                                    className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
                                    name="nombre"
                                    type="text"
                                    placeholder="Ingresa tus nombres"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Apellidos
                                </label>
                                <input
                                    className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
                                    name="apellido"
                                    type="text"
                                    placeholder="Ingresa tus apellidos"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    DNI
                                </label>
                                <input
                                    className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
                                    name="dni"
                                    type="text"
                                    placeholder="Ingresa tu DNI"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Teléfono
                                </label>
                                <input
                                    className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
                                    name="celular"
                                    type="tel"
                                    placeholder="Ingresa tu teléfono"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Credenciales */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
                                    name="correo"
                                    type="email"
                                    placeholder="Ingresa tu correo"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Contraseña
                                </label>
                                <input
                                    className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
                                    name="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Repite tu contraseña
                                </label>
                                <input
                                    className="w-full bg-gray-800 text-cyan-400 rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-cyan-500"
                                    name="passwordconfirmacion"
                                    type="password"
                                    placeholder="Repite tu contraseña"
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-cyan-900 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                        >
                            REGISTRAR
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-400 mt-4">
                        <Link
                            to="/login"
                            className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            ¿Ya tienes cuenta? Inicia sesión aquí
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterUser;