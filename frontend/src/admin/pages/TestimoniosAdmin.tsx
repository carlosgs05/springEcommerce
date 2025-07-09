import { useState, useEffect } from "react";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExpand,
  FaStar,
} from "react-icons/fa";
import axios from "axios";
import Select from "react-select";

interface Usuario {
  iduser: number;
  nombre: string;
  apellido: string;
  correo: string;
}

interface Testimonio {
  idtestimonio: number;
  descripcion: string;
  fechatestimonio: string;
  estado: number;
  calificacion: number;
  usuario: Usuario;
}

const TestimoniosAdmin = () => {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [showDescModal, setShowDescModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [selectedTestimonio, setSelectedTestimonio] =
    useState<Testimonio | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchTestimonios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/testimonios/estado/${filter}`
      );
      if (response.data.success) {
        setTestimonios(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Error al cargar testimonios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonios();
  }, [filter]);

  const handleEstadoChange = (nuevoEstado: number) => {
    setFilter(nuevoEstado);
  };

  const getEstadoBadge = (estado: number) => {
    switch (estado) {
      case -1:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            {!isMobile && <FaClock className="mr-1" />}
            {isMobile ? "Pend." : "Pendiente"}
          </span>
        );
      case 0:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {!isMobile && <FaTimesCircle className="mr-1" />}
            {isMobile ? "Rech." : "Rechazado"}
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {!isMobile && <FaCheckCircle className="mr-1" />}
            {isMobile ? "Aprob." : "Aprobado"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {isMobile ? "Desc." : "Desconocido"}
          </span>
        );
    }
  };

  const renderCalificacion = (calificacion: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`h-4 w-4 ${
              i < calificacion ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        {!isMobile && (
          <span className="ml-1 text-xs text-gray-500">({calificacion})</span>
        )}
      </div>
    );
  };

  const formatFecha = (fecha: string) => {
    if (isMobile) {
      return new Date(fecha).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      });
    }
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const mostrarDescripcionCompleta = (testimonio: Testimonio) => {
    setSelectedTestimonio(testimonio);
    setShowDescModal(true);
  };

  const abrirModalEstado = (testimonio: Testimonio) => {
    setSelectedTestimonio(testimonio);
    setSelectedEstado(testimonio.estado);
    setShowEstadoModal(true);
  };

  const cambiarEstadoTestimonio = async () => {
    if (!selectedTestimonio || selectedEstado === null) return;

    try {
      const response = await axios.put(
        `http://localhost:8080/api/testimonios/estado_update/${selectedTestimonio.idtestimonio}`,
        { estado: selectedEstado }
      );

      if (response.data.success) {
        setShowEstadoModal(false);
        fetchTestimonios();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getOpcionesEstado = (estadoActual: number) => {
    switch (estadoActual) {
      case -1: // Pendiente
        return [
          { value: 1, label: "Aprobar" },
          { value: 0, label: "Rechazar" },
        ];
      case 0: // Rechazado
        return [
          { value: -1, label: "Pendiente" },
          { value: 1, label: "Aprobar" },
        ];
      case 1: // Aprobado
        return [
          { value: -1, label: "Pendiente" },
          { value: 0, label: "Rechazar" },
        ];
      default:
        return [];
    }
  };

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      borderRadius: "0.75rem",
      borderColor: "#d1d5db",
      padding: "0.5rem",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      cursor: "pointer",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3b82f6" : "white",
      color: state.isSelected ? "white" : "#4b5563",
      "&:hover": {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
      },
      padding: "0.75rem 1rem",
      cursor: "pointer",
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "0.75rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-xl shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Gestión de Testimonios
              </h1>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm shadow rounded-2xl p-4 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:space-x-2">
              <button
                onClick={() => handleEstadoChange(-1)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  filter === -1
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isMobile ? "Pend." : "Pendientes"}
              </button>
              <button
                onClick={() => handleEstadoChange(0)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  filter === 0
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isMobile ? "Rech." : "Rechazados"}
              </button>
              <button
                onClick={() => handleEstadoChange(1)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  filter === 1
                    ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isMobile ? "Aprob." : "Aprobados"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm shadow rounded-2xl border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            </div>
          ) : error ? (
            <div className="p-6 text-red-500 text-center">{error}</div>
          ) : testimonios.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="bg-blue-50 p-3 rounded-full inline-block mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium mb-1">
                No se encontraron testimonios
              </p>
              <p className="text-sm">Cambia los filtros o intenta más tarde</p>
            </div>
          ) : isMobile ? (
            /* Vista móvil - Cards */
            <div className="divide-y divide-gray-200">
              {testimonios.map((testimonio) => (
                <div
                  key={testimonio.idtestimonio}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {formatFecha(testimonio.fechatestimonio)}
                      </p>
                    </div>
                    {getEstadoBadge(testimonio.estado)}
                  </div>

                  {/* Nueva línea para el usuario */}
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-800">
                      {testimonio.usuario.nombre} {testimonio.usuario.apellido}
                    </p>
                  </div>

                  {/* Nueva línea para la calificación */}
                  <div className="mb-2 flex items-center">
                    {renderCalificacion(testimonio.calificacion)}
                  </div>

                  <div className="flex items-start mb-3">
                    <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                      {testimonio.descripcion}
                    </p>
                    {testimonio.descripcion.length > 100 && (
                      <button
                        onClick={() => mostrarDescripcionCompleta(testimonio)}
                        className="ml-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                        title="Ver descripción completa"
                      >
                        <FaExpand className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => abrirModalEstado(testimonio)}
                      className="px-3 py-1.5 text-cyan-700 text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
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
                <thead className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                  <tr>
                    {/* Quitamos la columna ID */}
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider"
                    >
                      Usuario
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider"
                    >
                      Descripción
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider"
                    >
                      Fecha
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider"
                    >
                      Calificación
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-base font-medium uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-base font-medium uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testimonios.map((testimonio) => (
                    <tr
                      key={testimonio.idtestimonio}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Columna Usuario */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {testimonio.usuario.nombre}{" "}
                            {testimonio.usuario.apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            {testimonio.usuario.correo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-600 line-clamp-2 flex-1">
                            {testimonio.descripcion}
                          </div>
                          {testimonio.descripcion.length > 100 && (
                            <button
                              onClick={() =>
                                mostrarDescripcionCompleta(testimonio)
                              }
                              className="ml-2 text-blue-500 hover:text-blue-700 cursor-pointer"
                              title="Ver descripción completa"
                            >
                              <FaExpand className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatFecha(testimonio.fechatestimonio)}
                      </td>
                      {/* Columna Calificación con estrellas */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderCalificacion(testimonio.calificacion)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(testimonio.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => abrirModalEstado(testimonio)}
                          className="px-4 py-2 text-cyan-700 font-medium transition-all cursor-pointer"
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

      {/* Modal Descripción Completa */}
      {showDescModal && selectedTestimonio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                Descripción completa
              </h3>
              <button
                onClick={() => setShowDescModal(false)}
                className="text-gray-400 hover:text-gray-500 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-1">Usuario:</p>
                <p className="text-gray-800 font-medium">
                  {selectedTestimonio.usuario.nombre}{" "}
                  {selectedTestimonio.usuario.apellido}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-1">Calificación:</p>
                <div className="flex items-center">
                  {renderCalificacion(selectedTestimonio.calificacion)}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-1">Fecha:</p>
                <p className="text-gray-600">
                  {new Date(selectedTestimonio.fechatestimonio).toLocaleString(
                    "es-ES"
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-2">Testimonio:</p>
                <div className="bg-gray-50 p-4 rounded-xl max-h-96 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedTestimonio.descripcion}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDescModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Estado */}
      {showEstadoModal && selectedTestimonio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Cambiar estado del testimonio
              </h3>
              <button
                onClick={() => setShowEstadoModal(false)}
                className="text-gray-400 hover:text-gray-500 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-1">Usuario:</p>
                <p className="text-gray-800 font-medium">
                  {selectedTestimonio.usuario.nombre}{" "}
                  {selectedTestimonio.usuario.apellido}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-1">Estado actual:</p>
                <div className="inline-block">
                  {getEstadoBadge(selectedTestimonio.estado)}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo estado:
                </label>
                <Select
                  options={getOpcionesEstado(selectedTestimonio.estado)}
                  value={getOpcionesEstado(selectedTestimonio.estado).find(
                    (opt) => opt.value === selectedEstado
                  )}
                  onChange={(selectedOption) =>
                    selectedOption && setSelectedEstado(selectedOption.value)
                  }
                  styles={customStyles}
                  className="w-full cursor-pointer"
                  classNamePrefix="select"
                  isSearchable={false}
                  placeholder="Selecciona un estado"
                />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-1">Testimonio:</p>
                <div className="bg-gray-50 p-4 rounded-xl max-h-32 overflow-y-auto">
                  <p className="text-gray-700">
                    {selectedTestimonio.descripcion.substring(0, 200)}
                    {selectedTestimonio.descripcion.length > 200 && "..."}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEstadoModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-colors cursor-pointer text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={cambiarEstadoTestimonio}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all cursor-pointer"
              >
                Actualizar estado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimoniosAdmin;
