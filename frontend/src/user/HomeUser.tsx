// src/pages/HomeUser.tsx
import { JSX, useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaMobileAlt, FaLaptop, FaTv, FaHeadphones, FaTag, FaClock } from 'react-icons/fa'
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

  return (
    <div>
      <Header />

      {/* Hero Banner */}
      <section className="relative w-full h-64 overflow-hidden">
        {banners.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Banner ${idx + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === activeBanner ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBanner(idx)}
              className={`w-3 h-3 rounded-full ${
                idx === activeBanner ? 'bg-white' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Ofertas Relámpago */}
      <section className="p-6 bg-yellow-50 border-t border-b border-yellow-200 text-center">
        <h2 className="text-2xl font-bold mb-2 text-yellow-700 flex justify-center items-center gap-2">
          <FaClock className="text-yellow-600" /> Ofertas Relámpago
        </h2>
        <p className="text-lg font-semibold text-gray-700">
          Termina en <span className="font-mono text-2xl text-red-600">{formatTime(countdown)}</span>
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {ofertasRelampago.map(producto => (
            <div
              key={producto.idproducto}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-medium text-gray-700">{producto.nombre}</h3>
              {producto.imagenesNombres.length > 0 && (
                <img
                  src={`http://localhost:8080/uploads/${encodeURIComponent(
                    producto.imagenesNombres[0]
                  )}`}
                  alt={producto.nombre}
                  className="w-full h-24 object-cover mb-2 rounded"
                />
              )}
              <p className="text-sm text-gray-500 truncate">{producto.descripcion}</p>
              <div className="mt-2 text-sm text-gray-800 font-bold">S/ {producto.precio}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Nuevos Lanzamientos */}
      <section className="p-4">
        <h2 className="text-xl font-semibold mb-4">Nuevos Lanzamientos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {nuevosLanzamientos.map(producto => (
            <div
              key={producto.idproducto}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-medium text-gray-700">{producto.nombre}</h3>
              {producto.imagenesNombres.length > 0 && (
                <img
                  src={`http://localhost:8080/uploads/${encodeURIComponent(
                    producto.imagenesNombres[0]
                  )}`}
                  alt={producto.nombre}
                  className="w-full h-24 object-cover mb-2 rounded"
                />
              )}
              <p className="text-sm text-gray-500 truncate">{producto.descripcion}</p>
              <div className="mt-2 text-sm text-gray-800">Precio: S/ {producto.precio}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Lista general de productos */}
      <section className="p-4">
        <h2 className="text-xl font-semibold mb-4">Nuestros Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map(producto => (
            <div
              key={producto.idproducto}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-medium text-gray-700">{producto.nombre}</h3>
              <p className="text-sm text-gray-500 mb-2 truncate">{producto.descripcion}</p>
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
                  onClick={() =>
                    navigate(`/tienda/producto/${producto.idproducto}`, {
                      state: producto,
                    })
                  }
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="p-6">
        <h2 className="text-xl font-semibold mb-4">Categorías Destacadas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredCategories.map(cat => (
            <div
              key={cat.idcategoria}
              onClick={() => navigate(`/tienda?categoria=${cat.idcategoria}`)}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer"
            >
              <div className="text-4xl text-gray-600 mb-2">
                {categoryIcons[cat.nombre] || <FaTag />}
              </div>
              <span className="text-sm font-medium text-gray-700">{cat.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomeUser
