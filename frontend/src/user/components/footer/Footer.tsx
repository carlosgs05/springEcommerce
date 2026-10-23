import { Link } from "react-router-dom";
import {
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  Envelope,
  Clock,
  Storefront,
} from "@phosphor-icons/react";

const Footer = () => {
  return (
    <footer className="w-full bg-surface text-text">
      <div className="max-w-8xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-primary-hover rounded-full p-1">
                <div className="bg-canvas rounded-full p-1.5">
                  <Storefront className="w-8 h-8 text-primary" weight="fill" aria-hidden="true" />
                </div>
              </div>
              <h2 className="font-heading text-2xl font-bold text-primary tracking-wide">TechStore</h2>
            </div>
            <p className="text-text-muted">
              Tu tienda de electrónica favorita con los mejores productos y precios competitivos.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                <FacebookLogo size={20} weight="fill" />
              </a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                <TwitterLogo size={20} weight="fill" />
              </a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                <InstagramLogo size={20} weight="fill" />
              </a>
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                <LinkedinLogo size={20} weight="fill" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-primary mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-text-muted hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link to="/tienda" className="text-text-muted hover:text-primary transition-colors">Productos</Link></li>
              <li><a href="/testimonials" className="text-text-muted hover:text-primary transition-colors">Testimonios</a></li>
              <li><Link to="/contacto" className="text-text-muted hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-primary mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="text-primary mt-1" size={18} />
                <span className="text-text-muted">Av. Tecnológica 123, Distrito Digital</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-primary" size={18} />
                <span className="text-text-muted">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Envelope className="text-primary" size={18} />
                <span className="text-text-muted">info@techstore.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="text-primary" size={18} />
                <span className="text-text-muted">Lun-Vie: 9:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Copyright y enlaces legales */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-muted text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TechStore. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6">
            <a href="/privacy" className="text-text-muted hover:text-primary text-sm transition-colors">Política de Privacidad</a>
            <a href="/terms" className="text-text-muted hover:text-primary text-sm transition-colors">Términos de Servicio</a>
            <a href="/cookies" className="text-text-muted hover:text-primary text-sm transition-colors">Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
