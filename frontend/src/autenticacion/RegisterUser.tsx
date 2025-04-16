import React, { useState, FormEvent, ChangeEvent, useRef } from 'react';
import axios from 'axios';
import swal from 'sweetalert2/dist/sweetalert2.all.js';

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

        // Validación de contraseña
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

                if (formRef.current) {
                    formRef.current.reset();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            swal.fire("Error", "Error al conectar con el servidor", "error");
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
                    <h1 className="text-2xl text-center text-white font-bold mb-6">Registro de Usuario</h1>
                </header>

                <form onSubmit={handleSubmit} ref={formRef} noValidate>
                    {/* Nombres y Apellidos */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="nombre"
                            >
                                Nombres
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="Ingresa tus nombres"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="w-full md:w-1/2 px-3">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="apellido"
                            >
                                Apellidos
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="apellido"
                                name="apellido"
                                type="text"
                                placeholder="Ingresa tus apellidos"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Teléfono y DNI */}
                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="celular"
                            >
                                Teléfono
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="celular"
                                name="celular"
                                type="tel"
                                placeholder="Ingresa tu teléfono"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="dni"
                            >
                                DNI
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="dni"
                                name="dni"
                                type="text"
                                placeholder="Ingresa tu DNI"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Correo */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="correo"
                            >
                                Correo
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="correo"
                                name="correo"
                                type="email"
                                placeholder="Ingresa tu correo"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="password"
                            >
                                Contraseña
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Escribe una contraseña segura"
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Confirmación de Contraseña */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="passwordconfirmacion"
                            >
                                Confirma Contraseña
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600 bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="passwordconfirmacion"
                                name="passwordconfirmacion"
                                type="password"
                                placeholder="Confirma tu contraseña"
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Botón de Envío */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-cyan-900 hover:to-cyan-600 text-white transition-all font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            REGISTRAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterUser;