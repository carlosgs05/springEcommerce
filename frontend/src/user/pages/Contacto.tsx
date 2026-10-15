import React, { useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert2/dist/sweetalert2.all.js';
import { useAuth } from '../../context/AuthContext';
import Header from '../Header';
import Footer from '../Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCommentAlt } from 'react-icons/fa';

const Contacto: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [descripcion, setDescripcion] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = descripcion.trim();
    if (!text) {
      swal.fire('Error', 'Por favor ingresa tu opinión', 'error');
      return;
    }
    try {
      const { data } = await axios.post(
        `http://localhost:8080/api/testimonios/crear/${user?.iduser}`,
        { descripcion: text }
      );
      if (data.success) {
        swal.fire('¡Éxito!', 'Testimonio registrado correctamente', 'success');
        setDescripcion('');
      } else {
        swal.fire('Error', data.message, 'error');
      }
    } catch (error: any) {
      swal.fire('Error', error.response?.data?.message || error.message, 'error');
    }
  };

  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-gray-50 to-gray-100 py-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          {/* Título principal */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-4">
              Contáctanos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Encuéntranos en nuestra ubicación, contáctanos por teléfono 
              o envíanos tus comentarios.
            </p>
          </div>

          {/* 1) Información de contacto */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaMapMarkerAlt className="text-cyan-500 mr-3" />
                    <span>Nuestra ubicación</span>
                  </h3>
                  <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-6">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.982328475746!2d-84.10731672480085!3d9.9352906731517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e3f5c5a9d9d9%3A0x5f5e5e5e5e5e5e5e!2sSan%20Jos%C3%A9%2C%20Costa%20Rica!5e0!3m2!1ses!2scr!4v1620000000000!5m2!1ses!2scr" 
                      width="100%" 
                      height="100%"
                      className="border-0"
                      allowFullScreen
                      loading="lazy"
                      title="Mapa de ubicación"
                    ></iframe>
                  </div>
                  <p className="text-gray-600">
                    Av. Tecnológica 123, Distrito Digital, San José, Costa Rica
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Información de contacto</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-cyan-100 p-3 rounded-full">
                          <FaPhone className="text-cyan-600 text-lg" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-800">Teléfono</h4>
                        <p className="text-gray-600 mt-1">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-cyan-100 p-3 rounded-full">
                          <FaEnvelope className="text-cyan-600 text-lg" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-800">Correo electrónico</h4>
                        <p className="text-gray-600 mt-1">info@techshop.com</p>
                        <p className="text-gray-600">soporte@techshop.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-cyan-100 p-3 rounded-full">
                          <FaClock className="text-cyan-600 text-lg" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-800">Horario</h4>
                        <p className="text-gray-600 mt-1">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                        <p className="text-gray-600">Sábados: 10:00 AM - 2:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2) Formulario para clientes */}
          {isAuthenticated && user?.rol.idrol === 2 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FaCommentAlt className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-2">
                    Tu Opinión Importa
                  </h2>
                  <p className="text-gray-600 max-w-xl mx-auto">
                    Comparte tu experiencia con nosotros. Tus comentarios nos ayudan a mejorar.
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                  <div>
                    <textarea
                      value={descripcion}
                      onChange={e => setDescripcion(e.target.value)}
                      rows={8}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                      placeholder="¿Qué te gustó de tu experiencia? ¿Tienes sugerencias para mejorar?"
                    />
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      Enviar Testimonio
                    </button>
                  </div>
                  
                  <div className="text-center pt-4">
                    <p className="text-gray-500 text-sm">
                      Todos los testimonios son revisados antes de publicarse
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Contacto;