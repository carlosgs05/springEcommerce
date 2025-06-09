import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../Header';
import Footer from '../Footer';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineViewList } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

interface Usuario {
  iduser: number;
}

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

const HistorialCompras: React.FC = () => {
  const { user } = useAuth() as { user: Usuario | null };
  const [ventas, setVentas] = useState<VentaDTO[]>([]);
  const [ventaExpandida, setVentaExpandida] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.iduser) return;

    axios.get(`http://localhost:8080/api/ventas/listarByUsuario/${user.iduser}`)
      .then((res) => {
        if (res.data.success) {
          setVentas(res.data.data);
        }
      })
      .catch((err) => console.error('Error al obtener historial:', err));
  }, [user]);

  const toggleDetalles = (idVenta: number) => {
    setVentaExpandida(ventaExpandida === idVenta ? null : idVenta);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Historial de Compras</h1>

        <div className="relative overflow-hidden rounded-xl shadow-lg bg-white">
          <table className="w-full text-sm text-center text-gray-800">
            <thead className="bg-cyan-500 text-white uppercase text-base">
              <tr>
                <th className="px-6 py-4">Fecha de Compra</th>
                <th className="px-6 py-4">Monto Total</th>
                <th className="px-6 py-4">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <React.Fragment key={venta.idVenta}>
                  <tr className="bg-cyan-100 border-b hover:bg-cyan-200 transition">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {new Date(venta.fechaVenta).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">${venta.montoTotal.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleDetalles(venta.idVenta)}
                        className="text-cyan-700 hover:text-cyan-900 text-2xl"
                      >
                        <HiOutlineViewList />
                      </button>
                    </td>
                  </tr>
                  {ventaExpandida === venta.idVenta && (
                    <tr>
                      <td colSpan={3} className="bg-white px-6 py-6">
                        <div className="rounded-xl border border-cyan-200 shadow-md p-4">
                          <h4 className="text-lg font-semibold text-cyan-700 mb-4 flex items-center gap-2">
                            Detalle de la Compra:
                          </h4>
                          <div className="divide-y divide-gray-200">
                            {venta.detalles.map((detalle, idx) => (
                              <div key={idx} className="flex justify-between py-2 text-sm text-gray-800">
                                <div className="font-medium">{detalle.nombreProducto}</div>
                                <div className="text-right">
                                  <span className="text-gray-600">{detalle.cantidad} x</span>{' '}
                                  <span className="text-cyan-600 font-semibold">
                                    ${detalle.precioVenta.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 py-6">
                    No se encontraron compras registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HistorialCompras;
