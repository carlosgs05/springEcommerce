import { useState } from 'react';
import axios from 'axios';

function Formulario() {
    const [formData, setFormData] = useState({
        Nombres: '',
        Apellidos: '',
        Dni: '',
        Telefono: '',
        Correo: '',
        password: '',
        passwordconfirmacion: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Evita que la página se recargue
    
        // Validación básica (opcional)
        if (formData.password !== formData.passwordconfirmacion) {
            alert("Las contraseñas no coinciden");
            return;
        }
    
        try {
            // Realiza la solicitud al backend con axios
            const response = await axios.post('http://localhost:8080/api/auth/register', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            // Verifica si la respuesta fue exitosa
            if (response.status === 200) {
                alert('Usuario registrado exitosamente');
                setFormData({
                    Nombres: '',
                    Apellidos: '',
                    Dni: '',
                    Telefono: '',
                    Correo: '',
                    password: '',
                    passwordconfirmacion: ''
                });
            } else {
                alert('Error al registrar el usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
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
                </header>
    
                <form onSubmit={handleSubmit}>
                    {/* Nombres y Apellidos Fields */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="grid-first-name"
                            >
                                Nombres
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600  bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="grid-first-name"
                                name="Nombres"
                                type="text"
                                placeholder=" "
                                value={formData.Nombres}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="w-full md:w-1/2 px-3">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="grid-last-name"
                            >
                                Apellidos
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600  bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="grid-last-name"
                                name="Apellidos"
                                type="text"
                                placeholder=" "
                                value={formData.Apellidos}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
    
                    {/* Telefono y DNI */}
                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="grid-city"
                            >
                                Telefono
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600  bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="grid-telefono"
                                name="Telefono"
                                type="text"
                                placeholder=" "
                                value={formData.Telefono}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="grid-zip"
                            >
                                DNI
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600  bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="grid-dni"
                                name="Dni"
                                type="text"
                                placeholder=" "
                                value={formData.Dni}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
    
                    {/* Correo Field */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="grid-email"
                            >
                                Correo
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600  bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="grid-email"
                                name="Correo"
                                type="text"
                                placeholder=" "
                                value={formData.Correo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
    
                    {/* Password Field */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="grid-password"
                            >
                                Contraseña
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600  bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="grid-password"
                                name="password"
                                type="password"
                                placeholder="******************"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <p className="text-cyan-600  text-xs italic">Escribe una contraseña segura mierda</p>
                        </div>
                    </div>
    
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-white text-xs font-bold mb-2"
                                htmlFor="grid-password"
                            >
                                Confirma Contraseña
                            </label>
                            <input
                                className="appearance-none block w-full text-cyan-600  bg-gray-800 border border-gray-700 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-zinc-900 focus:border-zinc-800"
                                id="grid-password"
                                name="passwordconfirmacion"
                                type="password"
                                placeholder="******************"
                                value={formData.passwordconfirmacion}
                                onChange={handleChange}
                            />
                            <p className="text-cyan-600  text-xs italic">Que sea igual a la de arriba mierda</p>
                        </div>
                    </div>
    
                    {/* Submit Button */}
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
}

export default Formulario;