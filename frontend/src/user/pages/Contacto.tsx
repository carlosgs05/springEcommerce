import React, { useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert2/dist/sweetalert2.all.js';
import { useAuth } from '../../context/AuthContext';
import Header from '../Header';
import Footer from '../Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

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
      <main className="bg-gray-100 py-16">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
          {/* Título principal */}
          <h2 className="text-4xl font-bold text-cyan-500 mb-8 text-center">
            Contacto
          </h2>

          {/* 1) Información de contacto */}
          <div className="space-y-6 text-center">
            <p className="flex items-center justify-center space-x-2 text-gray-700">
              <FaMapMarkerAlt className="text-cyan-500" />
              <span>Av. Tecnológica 123, Distrito Digital</span>
            </p>
            <p className="flex items-center justify-center space-x-2 text-gray-700">
              <FaPhone className="text-cyan-500" />
              <span>+1 (555) 123-4567</span>
            </p>
            <p className="flex items-center justify-center space-x-2 text-gray-700">
              <FaEnvelope className="text-cyan-500" />
              <span>info@techshop.com</span>
            </p>
            <p className="flex items-center justify-center space-x-2 text-gray-700">
              <FaClock className="text-cyan-500" />
              <span>Lun-Vie: 9:00 - 18:00</span>
            </p>
          </div>
        </div>

        {/* 2) Formulario para clientes (div separado y con título) */}
        {isAuthenticated && user?.rol.idrol === 2 && (
          <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg mt-16 p-8">
            <div>
              <h2 className="text-4xl font-bold text-cyan-500 mb-8 text-center">
                Tu Opinión
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-gray-700 font-semibold">
                  Cuentanos tu experiencia en TechShop:
                </label>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  rows={5}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Escribe tu testimonio aquí..."
                />
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition"
                  >
                    Enviar Testimonio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Contacto;