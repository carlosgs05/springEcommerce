// src/pages/Tienda.tsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa'
import Header from '../Header'
import Footer from '../Footer'

interface Especificacion {
  unidadmedida: string
  valor: number
  descripcion: string
}

interface Producto {
  idproducto: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  idcategoria: number
  nombreCategoria: string
  nombreMarca: string
  especificaciones: Especificacion[]
  imagenesNombres: string[]
}

interface Categoria {
  idcategoria: number
  nombre: string
}

const Tienda = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categoriaNombre, setCategoriaNombre] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Leer parámetro ?categoria=
  const categoriaParam = searchParams.get('categoria')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Traer productos
        const prodRes = await axios.get('http://localhost:8080/api/productos/listarAll')
        let lista: Producto[] = []
        if (prodRes.data.success) lista = prodRes.data.data

        // Filtrar si viene categoria
        if (categoriaParam) {
          lista = lista.filter(p => p.idcategoria.toString() === categoriaParam)
          // Obtener nombre de categoría
          const catRes = await axios.get('http://localhost:8080/api/categorias/listar')
          if (catRes.data.success) {
            const cat = (catRes.data.data as Categoria[])
              .find(c => c.idcategoria.toString() === categoriaParam)
            setCategoriaNombre(cat?.nombre || '')
          }
        }

        setProductos(lista)
      } catch (err) {
        console.error(err)
        setError('Error al cargar productos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [categoriaParam])

  return (
    <div>
      <Header />
      <section className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {categoriaParam ? `Categoría: ${categoriaNombre}` : 'Tienda'}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : productos.length === 0 ? (
          <div className="text-gray-500 text-center">No hay productos disponibles.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map(prod => (
              <div
                key={prod.idproducto}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Thumbnail */}
                {prod.imagenesNombres.length > 0 && (
                  <img
                    src={`http://localhost:8080/uploads/${encodeURIComponent(
                      prod.imagenesNombres[0]
                    )}`}
                    alt={prod.nombre}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 truncate">{prod.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {prod.descripcion}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">S/ {prod.precio.toFixed(2)}</span>
                    <button
                      onClick={() => navigate(`/tienda/producto/${prod.idproducto}`, { state: prod })}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default Tienda;
