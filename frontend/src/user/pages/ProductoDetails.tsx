import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaStar, FaCartPlus, FaTimes } from 'react-icons/fa'
import axios from 'axios'
import swal from 'sweetalert2/dist/sweetalert2.all.js'
import Footer from '../Footer'
import Header from '../Header'
import { useAuth } from '../../context/AuthContext'

interface Especificacion {
  unidadmedida: string
  valor: number
  descripcion: string
}

interface Comentario {
  idcomentario: number
  texto: string
  usuarioNombre: string
  fecha: string
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
  comentariosAprobados?: Comentario[]
}

// interface User {
//   iduser: number
//   rol: {
//     idrol: number
//   }
// }

const tabs = [
  { key: 'description', label: 'Descripción' },
  { key: 'additional', label: 'Información adicional' },
  { key: 'reviews', label: 'Reseñas' }
]

type TabKey = 'description' | 'additional' | 'reviews'

const generateProductRating = (productId: number) => {
  const seed = productId % 10
  const stars = Math.min(5, Math.max(2, Math.floor(seed / 2) + 2))
  const baseCount = 2000 + (stars - 2) * 800
  const count = baseCount + (productId % 500)
  return { stars, count }
}

const ProductoDetails = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const producto = state as Producto
  const { user, isAuthenticated } = useAuth()

  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState<TabKey>('description')
  const [loaded, setLoaded] = useState(false)
  const [ratingData, setRatingData] = useState<{stars: number, count: number} | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isOpinionModalOpen, setIsOpinionModalOpen] = useState(false)
  const [opinionText, setOpinionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (producto) {
      const rating = generateProductRating(producto.idproducto)
      setRatingData(rating)
    }
    setLoaded(false)
  }, [producto?.idproducto])

  const handleSubmitOpinion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { data } = await axios.post(
        `http://localhost:8080/api/comentarios/crear/${user?.iduser}/${producto.idproducto}`,
        { texto: opinionText.trim() }
      )
      
      if (data.success) {
        swal.fire('¡Éxito!', 'Tu opinión ha sido enviada para revisión', 'success')
        setIsOpinionModalOpen(false)
        setOpinionText('')
      } else {
        swal.fire('Error', data.message, 'error')
      }
    } catch (error: any) {
      swal.fire('Error', error.response?.data?.message || error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!producto) {
    return (
      <div className="p-8 text-center">
        <p>Producto no encontrado.</p>
        <button
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
          onClick={() => navigate('/')}
        >Volver</button>
      </div>
    )
  }

  const hasStock = producto.stock > 0
  const showOpinionButton = isAuthenticated && user?.rol.idrol === 2

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <button
          className="mb-4 text-blue-500 hover:underline"
          onClick={() => navigate(-1)}
        >← Volver</button>

        {/* Gallery & Basic Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-12 xl:gap-x-20">
          {/* Gallery */}
          <div>
            <div className="w-full h-80 sm:h-96 lg:h-[450px] rounded-lg overflow-hidden bg-white shadow-sm">
              <img
                src={`http://localhost:8080/uploads/${encodeURIComponent(
                  producto.imagenesNombres[selectedImage]
                )}`}
                alt={producto.nombre}
                className={`w-full h-full object-contain transition-opacity duration-500 ease-in-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
              />
            </div>
            
            <div className="flex flex-wrap mt-4 gap-2">
              {producto.imagenesNombres.map((imgName, idx) => (
                <div
                  key={imgName}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg cursor-pointer overflow-hidden transition-all duration-300 ${
                    idx === selectedImage
                      ? 'ring-2 ring-indigo-500'
                      : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={`http://localhost:8080/uploads/${encodeURIComponent(imgName)}`}
                    alt={`${producto.nombre} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Basic Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{producto.nombre}</h1>
            <p className="text-gray-600 mb-4 line-clamp-3">{producto.descripcion}</p>

            {ratingData && (
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`${i < ratingData.stars ? 'text-yellow-400' : 'text-gray-300'} mr-1`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({ratingData.count.toLocaleString()})</span>
              </div>
            )}

            <div className="mb-4">
              <span className="text-2xl font-semibold text-gray-800">S/ {producto.precio.toFixed(2)}</span>
            </div>

            <div className="mb-6">
              <span className={`px-2 py-1 rounded-full text-sm ${
                hasStock 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {hasStock ? 'Disponible' : 'Agotado'}
              </span>
            </div>

            <div className="mb-6">
              <button 
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="font-medium text-gray-800">Características</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDetailsOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDetailsOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Marca</p>
                    <p className="font-medium text-gray-800">{producto.nombreMarca}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="font-medium text-gray-800">{producto.nombreCategoria}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className={`font-medium ${hasStock ? 'text-green-600' : 'text-red-600'}`}>
                      {hasStock ? 'Disponible' : 'Agotado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-8">
              <button 
                className={`flex items-center px-6 py-3 rounded-lg transition ${
                  hasStock 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!hasStock}
              >
                <FaCartPlus className="mr-2" /> Agregar al carrito
              </button>

              {showOpinionButton && (
                <button
                  onClick={() => setIsOpinionModalOpen(true)}
                  className="flex items-center px-6 py-3 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                >
                  Danos tu opinión
                </button>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <p className="font-medium">Envío gratis</p>
                  <p className="text-sm text-gray-600">Ingresa tu código postal para ver disponibilidad de envío.</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <p className="font-medium">Devoluciones</p>
                  <p className="text-sm text-gray-600">Devoluciones gratis durante 30 días. Detalles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-9">
          <div className="flex border-b mb-4">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`px-4 py-2 -mb-px font-medium text-sm transition ${
                  activeTab === tab.key
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'border-b-2 border-transparent text-gray-600 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab(tab.key as TabKey)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'description' && (
              <div className="prose prose-sm text-gray-700">
                <p>{producto.descripcion}</p>
              </div>
            )}

            {activeTab === 'additional' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Descripción</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Valor</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Unidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {producto.especificaciones.map((es, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-700">{es.descripcion}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{es.valor}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{es.unidadmedida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {producto.comentariosAprobados && producto.comentariosAprobados.length > 0 ? (
                  producto.comentariosAprobados.map(c => (
                    <div key={c.idcomentario} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-800">{c.usuarioNombre}</span>
                        <span className="text-sm text-gray-500">{new Date(c.fecha).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{c.texto}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No hay comentarios aún.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal de Opinión */}
      {isOpinionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-2/3 p-6 relative">
            <button
              onClick={() => setIsOpinionModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            
            <h2 className="text-2xl font-bold mb-4">Danos tu opinión</h2>
            <p className="text-gray-600 mb-4">¿Qué te parece este producto?</p>
            
            <form onSubmit={handleSubmitOpinion}>
              <textarea
                value={opinionText}
                onChange={(e) => setOpinionText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={11}
                placeholder="Escribe tu opinión aquí..."
                required
              />
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpinionModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar opinión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductoDetails