import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

// Tipos para producto con imágenes y especs
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
  nombreCategoria: string
  nombreMarca: string
  especificaciones: Especificacion[]
  imagenesNombres: string[]
}

const HomeUser = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/productos/listarAll')
        if (response.data.success) {
          setProductos(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching productos:', error)
      }
    }

    fetchProductos()
  }, [])

  return (
    <div>
      <Header />
      <section className="p-4">
        <h2 className="text-xl font-semibold mb-4">Nuestros Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((producto) => (
            <div
              key={producto.idproducto}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-medium text-gray-700">{producto.nombre}</h3>
              <p className="text-sm text-gray-500 mb-2">{producto.descripcion}</p>

              {/* Muestra la primera imagen como miniatura */}
              {producto.imagenesNombres.length > 0 && (
                <img
                  src={`http://localhost:8080/uploads/${encodeURIComponent(
                    producto.imagenesNombres[0]
                  )}`}
                  alt={producto.nombre}
                  className="w-full h-32 object-cover mb-2 rounded"
                />
              )}

              <div className="flex justify-between items-center">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  onClick={() => navigate(`/tienda/producto/${producto.idproducto}`, { state: producto })}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default HomeUser