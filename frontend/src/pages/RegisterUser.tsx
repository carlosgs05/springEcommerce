import { useState } from 'react';

function Formulario() {
    const [formData, setFormData] = useState({
        Nombres: '',
        Apellidos: '',
        Dni: '',
        Telefono: '',
        Correo: '',
        password: ''
    });

    return (
        <div className="flex h-screen bg-gradient-to-r from-white from-10% via-cyan-200 via-35% to-lime-200 to-90%">
            <div className="w-full max-w-lg m-auto bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg p-9 shadow-lg">
                <header>
                    <img
                        className="w-20 mx-auto mb-5"
                        src="https://img.icons8.com/fluent/344/year-of-tiger.png"
                        alt="Logo"
                    />
                </header>

                <form>

                    {/* Nombres y Apellidos Fields */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-first-name"
                            >
                                Nombres
                            </label>
                            <input
                                className="appearance-none block w-full bg-teal-100 text-gray-700 border  border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="grid-first-name"
                                name="Nombres"
                                type="text"
                                placeholder=" "
                                value={formData.Nombres}

                            />
                        </div>
                        <div className="w-full md:w-1/2 px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-last-name"
                            >
                                Apellidos
                            </label>
                            <input
                                className="appearance-none block w-full bg-teal-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="grid-last-name"
                                name="Apellidos"
                                type="text"
                                placeholder=" "
                                value={formData.Apellidos}

                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-email"
                            >
                                Correo
                            </label>
                            <input
                                className="appearance-none block w-full bg-teal-100 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="grid-email"
                                name="Correo"
                                type="text"
                                placeholder=" "
                                value={formData.Correo}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-password"
                            >
                                Contraseña
                            </label>
                            <input
                                className="appearance-none block w-full bg-teal-100 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="grid-password"
                                name="password"
                                type="password"
                                placeholder="******************"
                                value={formData.password}
                            />
                            <p className="text-gray-600 text-xs italic">Escribe una contraseña segura mierda</p>
                        </div>
                    </div>

                    {/* Telefono y DNI */}
                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-city"
                            >
                                Telefono
                            </label>
                            <input
                                className="appearance-none block w-full bg-teal-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="grid-telefono"
                                name="Telefono"
                                type="text"
                                placeholder=" "
                                value={formData.Telefono}
                            />
                        </div>
                        
                        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                                htmlFor="grid-zip"
                            >
                                DNI
                            </label>
                            <input
                                className="appearance-none block w-full bg-teal-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="grid-dni"
                                name="Dni"
                                type="text"
                                placeholder=" "
                                value={formData.Dni}
                            />
                        </div>
                    </div>

                    {/* Submit Button (added) */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-700 to-blue-800 hover:from-green-500 hover:to-blue-600 text-white  transition-all font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
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