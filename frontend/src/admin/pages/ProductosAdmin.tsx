// src/admin/pages/ProductosAdmin.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { FaSpinner, FaEdit, FaTrash, FaPlusCircle, FaEye } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

interface Producto {
  idproducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  idcategoria: number;
  nombreCategoria: string;
  idmarca: number;
  nombreMarca: string;
  fechacreacion: string;
  imagenesNombres: string[];
}
interface Categoria { idcategoria: number; nombre: string; }
interface Marca     { idmarca: number;   nombre: string; }

const ProductosAdmin = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Form state
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [precio, setPrecio] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [marcaId, setMarcaId] = useState<string>('');
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, marRes] = await Promise.all([
        axios.get('http://localhost:8080/api/productos/listarAll'),
        axios.get('http://localhost:8080/api/categorias/listar'),
        axios.get('http://localhost:8080/api/marcas/listar')
      ]);
      if (prodRes.data.success) setProductos(prodRes.data.data);
      else setError(prodRes.data.message);
      if (catRes.data.success) setCategorias(catRes.data.data);
      if (marRes.data.success) setMarcas(marRes.data.data);
    } catch (err) {
      setError('Error al cargar datos'); console.error(err);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImagenes(Array.from(e.target.files));
  };

  const resetForm = () => {
    setIdEdit(null);
    setNombre(''); setDescripcion(''); setPrecio(''); setStock('');
    setCategoriaId(''); setMarcaId(''); setImagenes([]); setExistingImages([]);
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !descripcion.trim() || !precio || !stock || !categoriaId || !marcaId) {
      return Swal.fire('Error', 'Todos los campos son requeridos', 'error');
    }
    const payload = {
      nombre: nombre.trim(), descripcion: descripcion.trim(),
      precio: parseFloat(precio), stock: parseInt(stock),
      idcategoria: parseInt(categoriaId), idmarca: parseInt(marcaId),
      especificaciones: []
    };
    const formData = new FormData();
    formData.append('producto', JSON.stringify(payload));
    imagenes.forEach(img => formData.append('imagenes', img));

    try {
      if (idEdit === null) {
        const resp = await axios.post('http://localhost:8080/api/productos/crear', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (resp.data.success) await Swal.fire('¡Éxito!', 'Producto creado correctamente', 'success');
        else throw new Error(resp.data.message);
      } else {
        const resp = await axios.put(`http://localhost:8080/api/productos/actualizar/${idEdit}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (resp.data.success) await Swal.fire('¡Actualizado!', 'Producto actualizado correctamente', 'success');
        else throw new Error(resp.data.message);
      }
      resetForm(); fetchData();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error'); console.error(err);
    }
  };

  const handleImageDelete = async (name: string) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Eliminar imagen?',
      text: name, icon:'warning',
      showCancelButton:true
    });
    if (!isConfirmed || idEdit===null) return;
    try {
      const resp = await axios.delete(`http://localhost:8080/api/productos/imagenes/eliminar/${encodeURIComponent(name)}`);
      if (resp.data.success) {
        Swal.fire('¡Eliminada!','Imagen eliminada','success');
        setExistingImages(imgs => imgs.filter(i=>i!==name));
      } else throw new Error(resp.data.message);
    } catch (e:any) {
      Swal.fire('Error', e.response?.data?.message||e.message,'error');
    }
  };

  const handleEditClick = (prod: Producto) => {
    setIdEdit(prod.idproducto);
    setNombre(prod.nombre); setDescripcion(prod.descripcion);
    setPrecio(prod.precio.toString()); setStock(prod.stock.toString());
    setCategoriaId(prod.idcategoria.toString()); setMarcaId(prod.idmarca.toString());
    setImagenes([]); setExistingImages(prod.imagenesNombres);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (prod: Producto) => {
    const res = await Swal.fire({ title: '¿Eliminar producto?', text: prod.nombre, icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar' });
    if (res.isConfirmed) {
      try {
        const resp = await axios.delete(`http://localhost:8080/api/productos/eliminar/${prod.idproducto}`);
        if (resp.data.success) {
          await Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success'); fetchData();
        } else throw new Error(resp.data.message);
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || err.message, 'error'); console.error(err);
      }
    }
  };

  const handlePreview = (prod: Producto) => {
    Swal.fire({
      title: `<div style="font-size: 1.2rem; color: #333; margin-bottom: 1rem;">${prod.nombre}</div>`,
      html: `
        <div style="display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
                    gap: 1rem; 
                    max-height: 60vh; 
                    padding: 0.5rem;
                    overflow-y: auto;
                    width: 100%;
                    align-items: center;">
          ${prod.imagenesNombres.map(name => `
            <div style="position: relative;
                        border: 1px solid #eee;
                        border-radius: 8px;
                        padding: 4px;
                        background: #f8f9fa;
                        transition: transform 0.2s;
                        aspect-ratio: 1/1;">
              <img 
                src="http://localhost:8080/uploads/${name}" 
                style="width: 100%;
                      height: 100%;
                      object-fit: contain;
                      border-radius: 4px;"
                onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiNjY2NjY2MiPjxwYXRoIGQ9Ik0xOS41IDEyLjlIMTNWMTloMS43bC41LS4zdjAuM2gtNHYtNkg1LjV2LTEuMWMwLS4zLjItLjUuNS0uNWgxMS4xYy4zIDAgLjUuMi41LjV2MS4xem0tNi44IDYuOWg0LjNjLjMgMCAuNS0uMi41LS41di0zLjZsLTIuOSAyLjMtMi45LTIuM3YzLjZjMCAuMy4yLjUuNS41em0tNC41LTEuOGwtMy41LTIuOVYxOWgzLjVsLjUtLjR6TTIwIDh2OS40YzAgMS4xLS45IDItMiAyaC0xLjZ2LTMuNWMwLS43LS42LTEuMy0xLjMtMS4zaC03LjRjLS43IDAtMS4zLjYtMS4zIDEuM1YyMEg2Yy0xLjEgMC0yLS45LTItMlY4YzAtMS4xLjktMiAyLTJoMTJjMS4xIDAgMiAuOSAyIDJ6TTkuNSA5Yy0xLjEgMC0yIC45LTIgMnMuOSAyIDIgMiAyLS45IDItMi0uOS0yLTItMnoiLz48L3N2Zz4='"
              />
              <div style="position: absolute;
                          bottom: 4px;
                          right: 4px;
                          background: rgba(0,0,0,0.7);
                          color: white;
                          font-size: 0.7rem;
                          padding: 2px 4px;
                          border-radius: 3px;">
                ${name.length > 15 ? name.substring(0, 12) + '...' : name}
              </div>
            </div>
          `).join('')}
        </div>
      `,
      width: '60%',
      maxWidth: '800px',
      backdrop: 'rgba(0,0,0,0.4)',
      confirmButtonText: 'Cerrar',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title'
      }
    });
  };

  return (
    <div className="p-4 sm:p-6"><div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6"><h1 className="text-2xl sm:text-3xl font-bold">Gestión de Productos</h1>
        <p className="mt-1 text-gray-600">CRUD productos e imágenes</p></div>
      {/* Formulario */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* inputs con label */}
        { /* Nombre, Descripcion, Precio, Stock, Categoria, Marca, Nuevas imagenes */ }
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input className="border rounded w-full px-2 py-1" value={nombre} onChange={e=>setNombre(e.target.value)}/></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea className="border rounded w-full px-2 py-1" value={descripcion} onChange={e=>setDescripcion(e.target.value)}/></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
          <input type="number" className="border rounded w-full px-2 py-1" value={precio} onChange={e=>setPrecio(e.target.value)}/></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" className="border rounded w-full px-2 py-1" value={stock} onChange={e=>setStock(e.target.value)}/></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select className="border rounded w-full px-2 py-1" value={categoriaId} onChange={e=>setCategoriaId(e.target.value)}>
            <option value="">Seleccionar categoría</option>
            {categorias.map(c=><option key={c.idcategoria} value={c.idcategoria}>{c.nombre}</option>)}
          </select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <select className="border rounded w-full px-2 py-1" value={marcaId} onChange={e=>setMarcaId(e.target.value)}>
            <option value="">Seleccionar marca</option>
            {marcas.map(m=><option key={m.idmarca} value={m.idmarca}>{m.nombre}</option>)}
          </select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Imágenes (nuevas)</label>
          <input type="file" multiple className="border rounded w-full px-2 py-1" onChange={handleFileChange}/></div>
        {/* existing images */}
        {idEdit && existingImages.length>0 && (
          <div className="lg:col-span-3 sm:col-span-2 col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes actuales</label>
            <div className="flex gap-2 overflow-x-auto">
              {existingImages.map(name=> (
                <div key={name} className="relative">
                  <img src={`http://localhost:8080/uploads/${name}`} className="h-16 w-16 object-cover rounded" alt={name}/>
                  <button onClick={()=>handleImageDelete(name)} className="absolute top-0 right-0 bg-white p-1 text-red-600 rounded-full">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* botones */}
        <div className="lg:col-span-3 sm:col-span-2 col-span-1 flex gap-2 mt-2">
          <button onClick={handleSubmit} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <FaPlusCircle className="mr-2"/> {idEdit? 'Actualizar Producto':'Crear Producto'}
          </button>
          {idEdit && <button onClick={resetForm} className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancelar</button>}
        </div>
      </div>
      {/* Tabla/Lista */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {loading? (
          <div className="flex justify-center p-8"><FaSpinner className="animate-spin text-4xl text-blue-500"/></div>
        ) : error? (
          <div className="p-4 text-red-500">{error}</div>
        ) : productos.length===0? (
          <div className="p-4 text-center text-gray-500">No hay productos</div>
        ) : isMobile? (
          <div className="space-y-4 p-4">
            {productos.map(prod=>(
              <div key={prod.idproducto} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">{prod.nombre}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{prod.descripcion}</p>
                <div className="text-sm text-gray-800">Precio: S/ {prod.precio}</div>
                <div className="text-sm text-gray-800">Stock: {prod.stock}</div>
                <div className="text-sm text-gray-600">Categoría: {prod.nombreCategoria}</div>
                <div className="text-sm text-gray-600 mb-2">Marca: {prod.nombreMarca}</div>
                <div className="flex gap-3 mt-2">
                  <button onClick={()=>handlePreview(prod)} className="text-gray-600"><FaEye /></button>
                  <button onClick={()=>handleEditClick(prod)} className="text-blue-600"><FaEdit /></button>
                  <button onClick={()=>handleEliminar(prod)} className="text-red-600"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vista Previa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.map(prod=>(
                <tr key={prod.idproducto} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{prod.idproducto}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">{prod.nombre}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">S/ {prod.precio}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{prod.stock}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{prod.nombreCategoria}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{prod.nombreMarca}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={()=>handlePreview(prod)} className="text-gray-600"><FaEye /></button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                    <button onClick={()=>handleEditClick(prod)}><FaEdit className="text-blue-600" /></button>
                    <button onClick={()=>handleEliminar(prod)}><FaTrash className="text-red-600" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div></div>
  );
};

export default ProductosAdmin;
