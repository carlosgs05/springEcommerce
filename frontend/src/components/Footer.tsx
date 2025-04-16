import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-br from-gray-900 to-stone-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://img.icons8.com/fluent/344/year-of-tiger.png"
                alt="Logo TechShop"
                className="w-10 h-10"
              />
              <h2 className="text-2xl font-bold text-cyan-400 tracking-wide">TechShop</h2>
            </div>
            <p className="text-gray-300">
              Tu tienda de electrónica favorita con los mejores productos y precios competitivos.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-cyan-400 transition-colors">Inicio</a></li>
              <li><a href="/products" className="text-gray-300 hover:text-cyan-400 transition-colors">Productos</a></li>
              <li><a href="/testimonials" className="text-gray-300 hover:text-cyan-400 transition-colors">Testimonios</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-cyan-400 transition-colors">Contacto</a></li>
              <li><a href="/blog" className="text-gray-300 hover:text-cyan-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-cyan-400 mt-1" />
                <span className="text-gray-300">Av. Tecnológica 123, Distrito Digital</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-cyan-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-cyan-400" />
                <span className="text-gray-300">info@techshop.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaClock className="text-cyan-400" />
                <span className="text-gray-300">Lun-Vie: 9:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Copyright y enlaces legales */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TechShop. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6">
            <a href="/privacy" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Política de Privacidad</a>
            <a href="/terms" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Términos de Servicio</a>
            <a href="/cookies" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;