import { JSX, useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaMobileAlt, FaLaptop, FaTv, FaHeadphones, FaTag, FaClock, FaFire, FaBoxOpen, FaAngleRight } from 'react-icons/fa'
import Footer from './Footer'
import Header from './Header'

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
  fechacreacion: string
}


interface Categoria {
  idcategoria: number
  nombre: string
}

const HomeUser = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [banners, setBanners] = useState<string[]>([])
  const [activeBanner, setActiveBanner] = useState<number>(0)
  const [countdown, setCountdown] = useState<number>(60 * 60 * 6) // 6 horas
  const navigate = useNavigate()

  const categoryIcons: Record<string, JSX.Element> = {
    Smartphones: <FaMobileAlt />,  
    Laptops: <FaLaptop />,         
    Televisores: <FaTv />,        
    Accesorios: <FaHeadphones />  
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get('http://localhost:8080/api/productos/listarAll'),
          axios.get('http://localhost:8080/api/categorias/listar')
        ])
        if (prodRes.data.success) {
          const data: Producto[] = prodRes.data.data
          setProductos(data)
          const urls = data
            .filter(p => p.imagenesNombres.length > 0)
            .slice(0, 3)
            .map(p => 
              `http://localhost:8080/uploads/${encodeURIComponent(p.imagenesNombres[0])}`
            )
          setBanners(urls)
        }
        if (catRes.data.success) {
          setCategorias(catRes.data.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!banners.length) return
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const nuevosLanzamientos = [...productos]
    .sort((a, b) => new Date(b.fechacreacion).getTime() - new Date(a.fechacreacion).getTime())
    .slice(0, 6)

  const ofertasRelampago = [...productos]
    .filter(p => p.precio < 500)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)

  const featuredCategories = categorias.slice(0, 4)

  const ProductCard = ({ producto, highlight = false }: { producto: Producto, highlight?: boolean }) => (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${highlight ? 'border-2 border-yellow-400' : ''}`}
    >
      <div className="relative h-48 overflow-hidden">
        {producto.imagenesNombres.length > 0 ? (
          <img
            src={`http://localhost:8080/uploads/${encodeURIComponent(producto.imagenesNombres[0])}`}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FaBoxOpen className="text-gray-400 text-4xl" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{producto.nombreCategoria}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 truncate">{producto.nombre}</h3>
        <p className="text-sm text-gray-500 h-12 overflow-hidden">{producto.descripcion}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg text-gray-900">S/ {producto.precio.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => navigate(`/tienda/producto/${producto.idproducto}`, { state: producto })}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            Ver más <FaAngleRight className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* Hero Banner */}
      <section className="relative w-full h-96 overflow-hidden">
        {banners.map((src, idx) => (
          <div 
            key={idx} 
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
              idx === activeBanner ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={src}
              alt={`Banner ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-lg">
                  <h2 className="text-4xl font-bold text-white mb-2">Tecnología de Vanguardia</h2>
                  <p className="text-white/90 mb-6">Descubre las últimas innovaciones en nuestra tienda</p>
                  <button 
                    onClick={() => navigate('/tienda')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                  >
                    Explorar Productos
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBanner(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === activeBanner ? 'bg-white w-6' : 'bg-white/60'
              }`}
              aria-label={`Ver banner ${idx + 1}`}
              aria-label={`Ver banner ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredCategories.map(cat => (
            <div
              key={cat.idcategoria}
              onClick={() => navigate(`/tienda?categoria=${cat.idcategoria}`)}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="text-4xl text-blue-600 mb-3">
                {categoryIcons[cat.nombre] || <FaTag />}
              </div>
              <span className="font-medium text-gray-800">{cat.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ofertas Relámpago */}
      <section className="container mx-auto py-10 px-4">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center flex-wrap mb-6">
              <div className="flex items-center">
                <FaFire className="text-white text-3xl mr-3" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Ofertas Relámpago</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mt-2 sm:mt-0">
                <div className="flex items-center gap-1">
                  <FaClock className="text-white" />
                  <span className="font-mono text-xl text-white">
                    {formatTime(countdown)}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ofertasRelampago.map(producto => (
                <div
                  key={producto.idproducto}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {producto.imagenesNombres.length > 0 && (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={`http://localhost:8080/uploads/${encodeURIComponent(producto.imagenesNombres[0])}`}
                        alt={producto.nombre}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">{producto.nombre}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{producto.descripcion}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">S/ {(producto.precio * 1.2).toFixed(2)}</span>
                        <span className="font-bold text-lg text-red-600">S/ {producto.precio.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/tienda/producto/${producto.idproducto}`, { state: producto })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-medium text-sm transition-colors"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ofertas Relámpago */}
      <section className="container mx-auto py-10 px-4">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center flex-wrap mb-6">
              <div className="flex items-center">
                <FaFire className="text-white text-3xl mr-3" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Ofertas Relámpago</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mt-2 sm:mt-0">
                <div className="flex items-center gap-1">
                  <FaClock className="text-white" />
                  <span className="font-mono text-xl text-white">
                    {formatTime(countdown)}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ofertasRelampago.map(producto => (
                <div
                  key={producto.idproducto}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {producto.imagenesNombres.length > 0 && (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={`http://localhost:8080/uploads/${encodeURIComponent(producto.imagenesNombres[0])}`}
                        alt={producto.nombre}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">{producto.nombre}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{producto.descripcion}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">S/ {(producto.precio * 1.2).toFixed(2)}</span>
                        <span className="font-bold text-lg text-red-600">S/ {producto.precio.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/tienda/producto/${producto.idproducto}`, { state: producto })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-medium text-sm transition-colors"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nuevos Lanzamientos */}
      <section className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaBoxOpen className="mr-2 text-blue-600" /> Nuevos Lanzamientos
          </h2>
          <button 
            onClick={() => navigate('/tienda?sort=newest')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            Ver todos <FaAngleRight className="ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {nuevosLanzamientos.map(producto => (
            <div
              key={producto.idproducto}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              onClick={() => navigate(`/tienda/producto/${producto.idproducto}`, { state: producto })}
            >
              <div className="h-32 overflow-hidden">
                {producto.imagenesNombres.length > 0 ? (
                  <img
                    src={`http://localhost:8080/uploads/${encodeURIComponent(producto.imagenesNombres[0])}`}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FaBoxOpen className="text-gray-300 text-3xl" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-800 truncate text-sm">{producto.nombre}</h3>
                <div className="mt-1 font-semibold text-blue-600">S/ {producto.precio.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lista general de productos */}
      <section className="container mx-auto py-8 px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nuestros Productos</h2>
          <button 
            onClick={() => navigate('/tienda')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            Ver catálogo completo <FaAngleRight className="ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.slice(0, 8).map(producto => (
            <ProductCard key={producto.idproducto} producto={producto} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomeUser