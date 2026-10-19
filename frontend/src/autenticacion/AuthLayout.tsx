import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Card } from "../components/ui";
import { AuthStep } from "./AuthStep";

// Orden de las pestañas: define hacia qué lado desliza la transición.
const ORDER = ["/login", "/register"];

/**
 * Marco común de las pantallas de autenticación (layout route de /login, /register, etc.).
 * Wordmark + Card fijos; solo el contenido (Outlet) se vuelve a montar con slide al cambiar de ruta.
 * Para flujos de varios pasos dentro de una pantalla, usar <AuthStep stepKey=...> (ver AuthStep.tsx).
 */
export default function AuthLayout() {
  const { pathname } = useLocation();
  const prev = useRef(pathname);
  const from = ORDER.indexOf(prev.current);
  const to = ORDER.indexOf(pathname);
  const direction = from !== -1 && to !== -1 && to < from ? "back" : "forward";

  useEffect(() => {
    prev.current = pathname;
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col items-center bg-canvas px-4 py-6 text-text sm:justify-center sm:py-10">
      <Link
        to="/"
        className="mb-5 inline-flex min-h-11 items-center rounded-control font-heading text-3xl font-bold tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        TechStore
      </Link>
      <main className="w-full max-w-lg">
        <Card elevation={2} padding="lg" className="overflow-x-clip">
          <AuthStep stepKey={pathname} direction={direction}>
            <Outlet />
          </AuthStep>
        </Card>
      </main>
    </div>
  );
}
