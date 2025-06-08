import { useState } from 'react';
import Header from "../Header";
import Footer from "../Footer";
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Asegúrate que este hook esté bien implementado

interface ProductoCheckout {
  idProducto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl: string;
  especificaciones: string;
}

export default function CheckoutPage() {
  const { user } = useAuth(); // <-- obtiene el usuario autenticado

  const [productos] = useState<ProductoCheckout[]>([
    {
      idProducto: 1,
      nombre: 'Mouse Logitech',
      precio: 49.90,
      cantidad: 1,
      imagenUrl: 'https://via.placeholder.com/100x100?text=Mouse',
      especificaciones: 'Inalámbrico, 1600 DPI',
    },
    {
      idProducto: 2,
      nombre: 'Teclado Redragon',
      precio: 79.90,
      cantidad: 1,
      imagenUrl: 'https://via.placeholder.com/100x100?text=Teclado',
      especificaciones: 'RGB, Mecánico Blue Switch',
    },
  ]);

  const [idVenta, setIdVenta] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  const finalizarCompra = async () => {
    if (!user) {
      alert("Debes iniciar sesión para realizar la compra.");
      return;
    }

    setIsLoading(true);
    try {
      const items = productos.map(p => ({
        idProducto: p.idProducto,
        cantidad: p.cantidad,
      }));

      const response = await axios.post('http://localhost:8080/api/ventas/checkout', {
        iduser: user.iduser, // <-- este es el ID real del usuario autenticado
        items,
      });

      setIdVenta(response.data.idVenta);
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al realizar la compra');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 text-lg">
        Debes iniciar sesión para continuar con la compra.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Resumen del Pedido
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {productos.map((p) => (
              <div 
                key={p.idProducto} 
                className="group bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex gap-6 items-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <img
                          src={p.imagenUrl}
                          alt={p.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                        {p.cantidad}x
                      </div>
                    </div>

                    <div className="flex-1">
                      <h2 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                        {p.nombre}
                      </h2>
                      <p className="text-gray-600 text-sm mb-2 bg-gray-100 inline-block px-3 py-1 rounded-full">
                        {p.especificaciones}
                      </p>
                      <div className="text-sm text-gray-700">
                        Importe unitario: <span className="font-semibold text-indigo-600">S/ {p.precio.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        S/ {(p.precio * p.cantidad).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Importe total
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Resumen de Compra
                </h3>
                
                <div className="space-y-4 mb-6">
                  {productos.map(p => (
                    <div key={p.idProducto} className="flex justify-between text-sm">
                      <span className="text-gray-600">{p.nombre} x{p.cantidad}</span>
                      <span className="font-semibold">S/ {(p.precio * p.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Subtotal</span>
                      <span>S/ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>Envío</span>
                      <span className="text-green-600 font-semibold">Gratis</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total a Pagar</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      S/ {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={finalizarCompra}
                  disabled={isLoading || idVenta !== null}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Procesando...' : idVenta ? 'Compra Completada' : 'Finalizar Compra'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {idVenta && (
          <div className="mt-12 text-center">
            <div className="bg-green-100 border border-green-300 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-green-700 mb-2">¡Compra Confirmada!</h3>
              <p className="text-green-600">Tu pedido ha sido procesado correctamente.</p>
              <a
                href={`/boleta/${idVenta}`}
                className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300"
              >
                Ver Boleta
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
