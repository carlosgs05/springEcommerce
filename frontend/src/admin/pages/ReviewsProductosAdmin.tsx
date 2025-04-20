import { useState, useEffect } from 'react';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaClock, FaEllipsisV, FaExpand } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

interface Comentario {
  idcomentario: number;
  descripcion: string;
  fechacomentario: string;
  estado: number;
  producto: {
    idproducto: number;
    nombre: string;
  };
  usuario: {
    iduser: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
}

const ReviewsProductosAdmin = () => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number>(-1); // -1: Pendientes por defecto
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchComentarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/comentarios/estado/${filter}`);
      if (response.data.success) {
        setComentarios(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Error al cargar comentarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, [filter]);

  const handleEstadoChange = (nuevoEstado: number) => {
    setFilter(nuevoEstado);
  };

  const getEstadoBadge = (estado: number) => {
    switch (estado) {
      case -1:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          {!isMobile && <FaClock className="mr-1" />} {isMobile ? 'Pend.' : 'Pendiente'}
        </span>;
      case 0:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          {!isMobile && <FaTimesCircle className="mr-1" />} {isMobile ? 'Rech.' : 'Rechazado'}
        </span>;
      case 1:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          {!isMobile && <FaCheckCircle className="mr-1" />} {isMobile ? 'Aprob.' : 'Aprobado'}
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {isMobile ? 'Desc.' : 'Desconocido'}
        </span>;
    }
  };

  const formatFecha = (fecha: string) => {
    if (isMobile) {
      return new Date(fecha).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric'
      });
    }
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mostrarDescripcionCompleta = (descripcion: string) => {
    Swal.fire({
      title: 'Descripción completa',
      html: `
        <div class="text-left">
          <div class="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <p class="text-gray-700 whitespace-pre-line">${descripcion}</p>
          </div>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3b82f6',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-4 py-2 rounded-md'
      },
      showCloseButton: true,
      closeButtonHtml: '&times;',
      width: isMobile ? '90%' : '50%'
    });
  };

  const cambiarEstadoComentario = async (comentario: Comentario) => {
    // Determinar las opciones disponibles según el estado actual
    let opcionesEstado: { [key: string]: number } = {};
    let opcionesTexto: string[] = [];
    
    if (comentario.estado === -1) {
      opcionesEstado = {
        'Aprobar': 1,
        'Rechazar': 0
      };
      opcionesTexto = ['Aprobar', 'Rechazar'];
    } else if (comentario.estado === 0) {
      opcionesEstado = {
        'Pendiente': -1,
        'Aprobar': 1
      };
      opcionesTexto = ['Pendiente', 'Aprobar'];
    } else if (comentario.estado === 1) {
      opcionesEstado = {
        'Pendiente': -1,
        'Rechazar': 0
      };
      opcionesTexto = ['Pendiente', 'Rechazar'];
    }

    const { value: selectedOption } = await Swal.fire({
      title: 'Cambiar estado del comentario',
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 mb-1">Producto: <span class="font-medium">${comentario.producto.nombre}</span></p>
          <p class="text-sm text-gray-600 mb-1">Usuario: <span class="font-medium">${comentario.usuario.nombre} ${comentario.usuario.apellido}</span></p>
          <p class="text-sm text-gray-600 mb-4">${comentario.descripcion.substring(0, 100)}${comentario.descripcion.length > 100 ? '...' : ''}</p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado actual:</label>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${comentario.estado === -1 ? 'bg-yellow-100 text-yellow-800' : comentario.estado === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
              ${comentario.estado === -1 ? 'Pendiente' : comentario.estado === 0 ? 'Rechazado' : 'Aprobado'}
            </span>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nuevo estado:</label>
            <select id="estadoSelect" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              ${opcionesTexto.map(option => `<option value="${opcionesEstado[option]}">${option}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      focusConfirm: false,
      preConfirm: () => {
        const select = document.getElementById('estadoSelect') as HTMLSelectElement;
        return select.value;
      },
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-4 py-2 rounded-md',
        cancelButton: 'px-4 py-2 rounded-md ml-2'
      },
      showCloseButton: true,
      closeButtonHtml: '&times;',
      width: isMobile ? '80%' : '40%'
    });

    if (selectedOption) {
      try {
        const response = await axios.put(
          `http://localhost:8080/api/comentarios/estado_update/${comentario.producto.idproducto}/${comentario.idcomentario}`,
          { estado: parseInt(selectedOption as string) }
        );

        if (response.data.success) {
          await Swal.fire({
            title: '¡Éxito!',
            text: 'Estado del comentario actualizado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3b82f6',
            customClass: {
              popup: 'rounded-lg'
            }
          });
          
          // Actualizar la lista de comentarios automáticamente
          await fetchComentarios();
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el estado del comentario',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-lg'
          }
        });
        console.error(error);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Comentarios de Productos</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Administra los comentarios de los usuarios sobre los productos
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Filtrar:</span>
                <div className="grid grid-cols-3 gap-1 sm:flex sm:space-x-2">
                  <button
                    onClick={() => handleEstadoChange(-1)}
                    className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded ${filter === -1 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {isMobile ? 'Pend.' : 'Pendientes'}
                  </button>
                  <button
                    onClick={() => handleEstadoChange(0)}
                    className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded ${filter === 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {isMobile ? 'Rech.' : 'Rechazados'}
                  </button>
                  <button
                    onClick={() => handleEstadoChange(1)}
                    className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded ${filter === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {isMobile ? 'Aprob.' : 'Aprobados'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center p-8 sm:p-12">
              <FaSpinner className="animate-spin text-blue-500 text-3xl sm:text-4xl" />
            </div>
          ) : error ? (
            <div className="p-4 sm:p-6 text-red-500 text-sm sm:text-base">{error}</div>
          ) : comentarios.length === 0 ? (
            <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">No se encontraron comentarios</div>
          ) : isMobile ? (
            /* Vista móvil - Cards */
            <div className="divide-y divide-gray-200">
              {comentarios.map((comentario) => (
                <div key={comentario.idcomentario} className="p-3 sm:p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        {getEstadoBadge(comentario.estado)}
                        <button 
                          onClick={() => cambiarEstadoComentario(comentario)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaEllipsisV className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{formatFecha(comentario.fechacomentario)}</p>
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Producto: {comentario.producto.nombre}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        Usuario: {comentario.usuario.nombre} {comentario.usuario.apellido}
                      </p>
                      <div className="flex items-start">
                        <p className="text-sm text-gray-600 line-clamp-3 flex-1">{comentario.descripcion}</p>
                        {comentario.descripcion.length > 100 && (
                          <button 
                            onClick={() => mostrarDescripcionCompleta(comentario.descripcion)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                            title="Ver descripción completa"
                          >
                            <FaExpand className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => cambiarEstadoComentario(comentario)}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Cambiar estado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vista desktop - Tabla */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comentario
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comentarios.map((comentario) => (
                    <tr key={comentario.idcomentario} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {comentario.idcomentario}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {comentario.producto.nombre}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {comentario.usuario.nombre} {comentario.usuario.apellido}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 max-w-md">
                        <div className="flex items-center">
                          <div className="line-clamp-2 flex-1">{comentario.descripcion}</div>
                          {comentario.descripcion.length > 100 && (
                            <button 
                              onClick={() => mostrarDescripcionCompleta(comentario.descripcion)}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                              title="Ver descripción completa"
                            >
                              <FaExpand className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getEstadoBadge(comentario.estado)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFecha(comentario.fechacomentario)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => cambiarEstadoComentario(comentario)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Cambiar estado
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsProductosAdmin;
