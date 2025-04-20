import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaStar, FaRegStar, FaCartPlus, FaTimes } from 'react-icons/fa'
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
  descripcion: string
  fechacomentario: string
  usuario: {
    nombre: string
    apellido: string
  }
}

interface ComentarioConEstrellas extends Comentario {
  stars: number
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

const tabs = [
  { key: 'description', label: 'Descripción' },
  { key: 'additional', label: 'Información adicional' },
  { key: 'reviews', label: 'Reseñas' }
] as const

type TabKey = typeof tabs[number]['key']

const ProductoDetails = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const producto = state as Producto
  const { user, isAuthenticated } = useAuth()

  // Generar 3–5 estrellas cíclicas:
  const reviewsWithStars: ComentarioConEstrellas[] =
    (producto.comentariosAprobados ?? []).map((c, i) => ({
      ...c,
      stars: 3 + (i % 3)
    }))

  const maxStars = reviewsWithStars.length
    ? Math.max(...reviewsWithStars.map(r => r.stars))
    : 0

  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState<TabKey>('description')
  const [loaded, setLoaded] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isOpinionModalOpen, setIsOpinionModalOpen] = useState(false)
  const [opinionText, setOpinionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    })

  const handleSubmitOpinion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { data } = await axios.post(
        `http://localhost:8080/api/comentarios/crear`,
        {
          descripcion: opinionText.trim(),
          iduser: user?.iduser,
          idproducto: producto.idproducto
        }
      )
      if (data.success) {
        swal.fire('¡Éxito!', 'Tu opinión ha sido enviada para revisión', 'success')
        setIsOpinionModalOpen(false)
        setOpinionText('')
      } else {
        swal.fire('Error', data.message, 'error')
      }
    } catch (err: any) {
      swal.fire('Error', err.response?.data?.message || err.message, 'error')
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
        >
          Volver
        </button>
      </div>
    )
  }

  const hasStock = producto.stock > 0
  const showOpinionButton = isAuthenticated && user?.rol.idrol === 2

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-[1450px] mx-auto">
        {/* Volver */}
        <button
          className="mb-4 text-blue-500 hover:underline flex items-center"
          onClick={() => navigate(-1)}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-12 xl:gap-x-20">
          {/* Imágenes */}
          <div className="space-y-6">
            <div className="aspect-w-1 aspect-h-1 bg-gray-50 rounded-xl overflow-hidden shadow-sm">
              <img
                src={`http://localhost:8080/uploads/${encodeURIComponent(producto.imagenesNombres[selectedImage])}`}
                alt={producto.nombre}
                className={`w-full h-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLoaded(true)}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {producto.imagenesNombres.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${i === selectedImage
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-300'
                    }`}
                >
                  <img
                    src={`http://localhost:8080/uploads/${encodeURIComponent(img)}`}
                    alt={`Vista ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Detalles */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) =>
                  i < maxStars
                    ? <FaStar key={i} className="w-5 h-5" />
                    : <FaRegStar key={i} className="w-5 h-5" />
                )}
              </div>
              <span className="text-sm text-gray-500">({reviewsWithStars.length} reseñas)</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              S/ {producto.precio.toFixed(2)}
            </div>

            {/* Stock y metadatos */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${hasStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {hasStock ? 'En stock' : 'Agotado'}
                </span>
                <span className="text-sm text-gray-500">{producto.stock} unidades</span>
              </div>
              <button
                className={`w-full flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition ${isDetailsOpen ? 'bg-gray-100' : ''
                  }`}
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                <span className="font-medium">Metadatos del producto</span>
                <svg className={`w-5 h-5 transform transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDetailsOpen && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Marca</p>
                    <p className="font-medium">{producto.nombreMarca}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="font-medium">{producto.nombreCategoria}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Añadir al carrito / Opinar */}
            <div className="flex gap-4">
              <button
                className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg transition ${hasStock ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                disabled={!hasStock}
              >
                <FaCartPlus className="mr-2" /> Añadir al carrito
              </button>
              {showOpinionButton && (
                <button
                  onClick={() => setIsOpinionModalOpen(true)}
                  className="py-3 px-6 rounded-lg bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition"
                >
                  Opinar
                </button>
              )}
            </div>

            {/* Info envío */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3 p-4 bg-indigo-50 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-indigo-600">Envío rápido y seguro</p>
                  <p className="text-sm text-gray-600">
                    Recibe tu producto en 24-48 horas con envío express disponible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas con mismo ancho y padding */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          {/* Botones de tab */}
          <div className="flex space-x-8 -mt-px">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Contenido de cada tab */}
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600">{producto.descripcion}</p>
              </div>
            )}
            {activeTab === 'additional' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Especificaciones técnicas
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {producto.especificaciones.map((es, i) => (
                      <div key={i} className="py-2">
                        <dt className="text-sm font-medium text-gray-500">{es.descripcion}</dt>
                        <dd className="mt-1 text-gray-900">
                          {es.valor} {es.unidadmedida}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ¿Qué opinan nuestros clientes?
                  </h3>
                </div>
                {reviewsWithStars.length > 0 ? (
                  <div className="space-y-8">
                    {reviewsWithStars.map(c => (
                      <div key={c.idcomentario} className="pb-8 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) =>
                              i < c.stars
                                ? <FaStar key={i} className="w-5 h-5" />
                                : <FaRegStar key={i} className="w-5 h-5" />
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900">
                            {c.usuario.nombre} {c.usuario.apellido}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(c.fechacomentario)}
                          </span>
                        </div>
                        <div className="prose max-w-none">
                          <p className="text-gray-600 whitespace-pre-wrap">
                            {c.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Este producto aún no tiene reseñas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal Opinión */}
      {isOpinionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">Escribe tu reseña</h3>
              <button
                onClick={() => setIsOpinionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitOpinion} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu reseña
                  </label>
                  <textarea
                    value={opinionText}
                    onChange={(e) => setOpinionText(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Escribe tu experiencia con el producto..."
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpinionModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                    }`}
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar reseña'}
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