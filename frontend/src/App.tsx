import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRoute from "./components/HomeRoute";
import PublicRoute from "./components/PublicRoute";

import Login from "./autenticacion/Login";
import RegisterUser from "./autenticacion/RegisterUser";
import Nosotros from "./user/pages/Nosotros";
import Tienda from "./user/pages/Tienda";
import Contacto from "./user/pages/Contacto";
import Layout from "./admin/Layout";
import HomeAdmin from "./admin/pages/HomeAdmin";
import PerfilAdmin from "./admin/pages/PerfilAdmin";
import ProductosAdmin from "./admin/pages/ProductosAdmin";
import PerfilUser from "./user/pages/PerfilUser";
import CategoriasAdmin from "./admin/pages/CategoriasAdmin";
import MarcasAdmin from "./admin/pages/MarcasAdmin";
import TestimoniosAdmin from "./admin/pages/TestimoniosAdmin";
import ReviewsProductosAdmin from "./admin/pages/ReviewsProductosAdmin";
import ProductoDetails from "./user/pages/ProductoDetails";
import ForgotPassword from "./autenticacion/ForgotPassword";
import VerificationAccount from "./autenticacion/VerificationAccount";
import VerifyResetCode from "./autenticacion/VerifyResetCode";
import ResetPassword from "./autenticacion/ResetPassword";
import MetodosEnvioAdmin from "./admin/pages/MetodosEnvioAdmin";
import MetodosPagoAdmin from "./admin/pages/MetodosPagoAdmin";
import CarritoDetalle from "./user/pages/CarritoDetalle";
import CheckoutPago from "./user/pages/CheckoutPago";
import MisPedidos from "./user/pages/MisPedidos";
import DetallePedido from "./user/pages/DetallePedido";
import PedidosAdmin from "./admin/pages/PedidosAdmin";
import DetallePedidoAdmin from "./admin/pages/DetallePedidoAdmin";

// Solo en desarrollo: en el build de producción la rama se elimina y el chunk no se genera
const UiShowcase = import.meta.env.DEV
  ? lazy(() =>
      import("./dev/UiShowcase").then((m) => ({ default: m.UiShowcase })),
    )
  : null;

function App() {
  return (
    <AuthProvider>
      <Routes>
        {UiShowcase && (
          <Route
            path="/dev/ui"
            element={
              <Suspense fallback={<p className="p-6">Cargando…</p>}>
                <UiShowcase />
              </Suspense>
            }
          />
        )}

        {/* Ruta raíz */}
        <Route path="/" element={<HomeRoute />} />

        {/* Rutas para invitados */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/verify-account" element={<VerificationAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-code" element={<VerifyResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/tienda/producto/:id" element={<ProductoDetails />} />
        </Route>

        {/* Rutas para admin (rol 1) */}
        <Route element={<ProtectedRoute roles={[1]} redirectTo="/" />}>
          <Route path="/admin/*" element={<Layout />}>
            <Route index element={<HomeAdmin />} />
            <Route path="perfil" element={<PerfilAdmin />} />
            <Route path="categorias" element={<CategoriasAdmin />} />
            <Route path="marcas" element={<MarcasAdmin />} />
            <Route path="productos" element={<ProductosAdmin />} />
            <Route path="metodos-envio" element={<MetodosEnvioAdmin />} />
            <Route path="metodos-pago" element={<MetodosPagoAdmin />} />
            <Route path="pedidos" element={<PedidosAdmin />} />
            <Route path="pedidos/:id" element={<DetallePedidoAdmin />} />
            <Route
              path="reviews_productos"
              element={<ReviewsProductosAdmin />}
            />
            <Route path="testimonios" element={<TestimoniosAdmin />} />
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

        {/* RUTA PROTEGIDA PARA EL CARRITO (solo clientes, rol 2) */}
        <Route
          path="/carrito"
          element={
            <ProtectedRoute
              roles={[2]}
              redirectTo="/login"
              specialRedirectPath="/"
            />
          }
        >
          <Route index element={<CarritoDetalle />} />
        </Route>

        {/* RUTA PROTEGIDA PARA EL CHECKOUT (solo clientes, rol 2) */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute
              roles={[2]}
              redirectTo="/login"
              specialRedirectPath="/"
            />
          }
        >
          <Route index element={<CheckoutPago />} />
        </Route>

        {/* NUEVA RUTA PROTEGIDA PARA MIS PEDIDOS (solo clientes, rol 2) */}
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute
              roles={[2]}
              redirectTo="/login"
              specialRedirectPath="/"
            />
          }
        >
          <Route index element={<MisPedidos />} />
          <Route path=":id" element={<DetallePedido />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
