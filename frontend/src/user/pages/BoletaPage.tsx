import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import Footer from '../Footer';

interface DetalleVentaDTO {
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  precioVenta: number;
}

interface VentaDTO {
  idVenta: number;
  fechaVenta: string;
  montoTotal: number;
  detalles: DetalleVentaDTO[];
}

export default function BoletaPage() {
  const { idVenta } = useParams();
  const [venta, setVenta] = useState<VentaDTO | null>(null);

  useEffect(() => {
    const fetchBoleta = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/ventas/boleta/${idVenta}`);
        setVenta(response.data);
      } catch (error) {
        console.error('Error al obtener la boleta:', error);
      }
    };
    fetchBoleta();
  }, [idVenta]);

  const handleDownloadPDF = () => {
    window.print(); // Invoca la ventana de impresión (con opción de guardar como PDF)
  };

  if (!venta) return <div className="text-center mt-20">Cargando boleta...</div>;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white print:text-black">
      <Header />
      <main className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-10 p-10 print:shadow-none print:mt-0 print:p-0">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Boleta de Venta</h1>

        <div className="text-sm text-gray-700 mb-6">
          <p><strong>ID Venta:</strong> #{venta.idVenta}</p>
          <p><strong>Fecha:</strong> {new Date(venta.fechaVenta).toLocaleDateString()}</p>
        </div>

        <table className="w-full text-left border-t border-b border-gray-300 mb-6 text-sm print:text-xs">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-2 px-4">Producto</th>
              <th className="py-2 px-4 text-center">Cantidad</th>
              <th className="py-2 px-4 text-right">Precio Unitario</th>
              <th className="py-2 px-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.detalles.map((d, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-2 px-4">{d.nombreProducto}</td>
                <td className="py-2 px-4 text-center">{d.cantidad}</td>
                <td className="py-2 px-4 text-right">S/ {d.precioVenta.toFixed(2)}</td>
                <td className="py-2 px-4 text-right">S/ {(d.precioVenta * d.cantidad).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right text-lg font-semibold text-gray-800 print:text-black">
          Importe Total: <span className="text-indigo-700 print:text-black">S/ {venta.montoTotal.toFixed(2)}</span>
        </div>

        <div className="text-center mt-10 no-print">
          <button
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded shadow"
          >
            Imprimir o Guardar como PDF
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
