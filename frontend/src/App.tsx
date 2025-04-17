import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRoute from './components/HomeRoute';

import Login from './autenticacion/Login';
import RegisterUser from './autenticacion/RegisterUser';
import Productos from './user/pages/Productos';
import Layout from './admin/Layout';
import HomeAdmin from './admin/pages/HomeAdmin';
import UserAdmin from './admin/pages/UserAdmin';
import ProductsAdmin from './admin/pages/ProductsAdmin';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 1) Ruta raíz: si eres admin → /admin, sino HomeUser */}
        <Route path="/" element={<HomeRoute />} />

        {/* 2) Sólo para invitados */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterUser />} />
        </Route>

        {/* 3) Sólo para clientes (rol 2) */}
        <Route element={<ProtectedRoute roles={[2]} redirectTo="/" />}>
          <Route path="/productos" element={<Productos />} />
        </Route>

        {/* 4) Sólo para admins (rol 1) */}
        <Route element={<ProtectedRoute roles={[1]} redirectTo="/" />}>
          <Route path="/admin/*" element={<Layout />}>
            {/* ruta /admin */}
            <Route index element={<HomeAdmin />} />
            {/* ruta /admin/users */}
            <Route path="users" element={<UserAdmin />} />
            {/* ruta /admin/users */}
            <Route path="products" element={<ProductsAdmin />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;