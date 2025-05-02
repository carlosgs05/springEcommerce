// src/admin/pages/MarcaAdmin.tsx
import { useState, useEffect } from 'react';
import { FaSpinner, FaEdit, FaTrash, FaPlusCircle } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

interface CategoriaDTO {
  idcategoria: number;
  nombre: string;
}

const MarcasAdmin = () => {
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevaCategoria, setNuevaCategoria] = useState<string>('');

  // Detect responsive
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const resp = await axios.get('http://localhost:8080/api/categorias/listar');
      if (resp.data.success) {
        setCategorias(resp.data.data);
      } else {
        setError(resp.data.message);
      }
    } catch (err) {
      setError('Error al cargar categorias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleCrear = async () => {
    if (!nuevaCategoria.trim()) {
      Swal.fire('Error', 'El nombre no puede estar vacío', 'error');
      return;
    }
    try {
      const resp = await axios.post('http://localhost:8080/api/categorias/crear', { nombre: nuevaCategoria });
      if (resp.data.success) {
        Swal.fire('¡Éxito!', 'Categoria creada correctamente', 'success');
        setNuevaCategoria('');
        fetchCategorias();
      } else throw new Error(resp.data.message);
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleEditar = async (categoria: CategoriaDTO) => {
    const { value: nuevoNombre } = await Swal.fire({
      title: 'Editar Categoria',
      input: 'text',
      inputLabel: 'Nombre de la categoria',
      inputValue: categoria.nombre,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value: string) => !value?.trim() && 'El nombre no puede estar vacío'
    });
    if (nuevoNombre) {
      try {
        const resp = await axios.put(
          `http://localhost:8080/api/categorias/actualizar/${categoria.idcategoria}`,
          { nombre: nuevoNombre }
        );
        if (resp.data.success) {
          Swal.fire('¡Actualizado!', 'Categoria actualizada correctamente', 'success');
          fetchCategorias();
        } else throw new Error(resp.data.message);
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || err.message, 'error');
      }
    }
  };

  const handleEliminar = async (categoria: CategoriaDTO) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoria?',
      text: categoria.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        const resp = await axios.delete(`http://localhost:8080/api/categorias/eliminar/${categoria.idcategoria}`);
        if (resp.data.success) {
          Swal.fire('¡Eliminado!', 'Categoria eliminada correctamente', 'success');
          fetchCategorias();
        } else throw new Error(resp.data.message);
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || err.message, 'error');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Gestión de Categorias</h1>
          <p className="text-gray-600">Crear, editar y eliminar marcas de categorias</p>
        </header>

        {/* Formulario Crear */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Nueva categoria"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
          />
          <button
            onClick={handleCrear}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaPlusCircle className="mr-2" /> Añadir
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : categorias.length === 0 ? (
          <div className="text-center text-gray-500">No hay categorias registradas</div>
        ) : isMobile ? (
          <div className="space-y-4">
            {categorias.map((m) => (
              <div key={m.idcategoria} className="p-4 shadow rounded flex justify-between items-center">
                <span>{m.nombre}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditar(m)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleEliminar(m)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorias.map((m) => (
                <tr key={m.idcategoria} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{m.idcategoria}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{m.nombre}</td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => handleEditar(m)} className="mr-3">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleEliminar(m)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
);
};
export default MarcasAdmin;
