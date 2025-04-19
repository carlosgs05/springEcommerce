import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRoute from './components/HomeRoute';
import PublicRoute from './components/PublicRoute';

import Login from './autenticacion/Login';
import RegisterUser from './autenticacion/RegisterUser';
import Nosotros from './user/pages/Nosotros';
import Tienda from './user/pages/Tienda';
import Contacto from './user/pages/Contacto';
import Layout from './admin/Layout';
import HomeAdmin from './admin/pages/HomeAdmin';
import PerfilAdmin from './admin/pages/PerfilAdmin';
import ProductosAdmin from './admin/pages/ProductosAdmin';
import PerfilUser from './user/pages/PerfilUser';
import CategoriasAdmin from './admin/pages/CategoriasAdmin';
import MarcasAdmin from './admin/pages/MarcasAdmin';
import ReseñasAdmin from './admin/pages/ReseñasAdmin';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta raíz */}
        <Route path="/" element={<HomeRoute />} />

        {/* Rutas para invitados */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterUser />} />
        </Route>

        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/contacto" element={<Contacto />} />
        </Route>

        {/* Rutas para admin (rol 1) */}
        <Route element={<ProtectedRoute roles={[1]} redirectTo="/" />}>
          <Route path="/admin/*" element={<Layout />}>
            <Route index element={<HomeAdmin />} />
            <Route path="perfil" element={<PerfilAdmin />} />
            <Route path="categorias" element={<CategoriasAdmin />} />
            <Route path="marcas" element={<MarcasAdmin />} />
            <Route path="productos" element={<ProductosAdmin />} />
            <Route path="reseñas" element={<ReseñasAdmin />} />
          </Route>
        </Route>

        {/* Ruta de perfil especial para clientes (rol 2) */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute
              roles={[2]}
              redirectTo="/"
              specialRedirectPath="/" // Redirige a '/' cuando no autenticado
            />
          }
        >
          <Route index element={<PerfilUser />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;