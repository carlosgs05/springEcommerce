import { useState } from 'react';
import { FaUserEdit, FaCamera, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import Header from "../Header";
import Footer from "../Footer";

const PerfilUser = () => {
    const [userData, setUserData] = useState({
        nombre: 'Juan Pérez',
        email: 'juan.perez@example.com',
        telefono: '+569 1234 5678',
        direccion: 'Av. Principal 123, Santiago'
    });

    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [profileImage, setProfileImage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPassword(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPassword) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para guardar cambios
        console.log('Datos actualizados:', userData);
        console.log('Contraseña actualizada:', password);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            
            <section className="flex-grow bg-gradient-to-b from-gray-900 to-stone-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center gap-2">
                        <FaUserEdit className="inline-block" /> Mi Perfil
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Sección de Foto de Perfil */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUser className="text-4xl text-gray-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-cyan-400 p-2 rounded-full cursor-pointer transition-transform hover:scale-110">
                                    <FaCamera className="text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{userData.nombre}</h2>
                                <p className="text-gray-300">{userData.email}</p>
                            </div>
                        </div>

                        {/* Sección de Información Personal */}
                        <div className="bg-stone-900 rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-semibold text-cyan-400 mb-6">Información Personal</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-300 mb-2">Nombre Completo</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={userData.nombre}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={userData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={userData.direccion}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección de Cambio de Contraseña */}
                        <div className="bg-stone-900 rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-semibold text-cyan-400 mb-6">Cambio de Contraseña</h2>
                            <div className="space-y-6">
                                <div className="relative">
                                    <label className="block text-gray-300 mb-2">Contraseña Actual</label>
                                    <input
                                        type={showPassword.current ? "text" : "password"}
                                        name="current"
                                        value={password.current}
                                        onChange={handlePasswordChange}
                                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute right-3 top-9 text-gray-400 hover:text-cyan-400"
                                    >
                                        {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label className="block text-gray-300 mb-2">Nueva Contraseña</label>
                                    <input
                                        type={showPassword.new ? "text" : "password"}
                                        name="new"
                                        value={password.new}
                                        onChange={handlePasswordChange}
                                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute right-3 top-9 text-gray-400 hover:text-cyan-400"
                                    >
                                        {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <label className="block text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
                                    <input
                                        type={showPassword.confirm ? "text" : "password"}
                                        name="confirm"
                                        value={password.confirm}
                                        onChange={handlePasswordChange}
                                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute right-3 top-9 text-gray-400 hover:text-cyan-400"
                                    >
                                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                type="button"
                                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
                            >
                                Guardar Cambios
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