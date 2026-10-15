# Arquitectura del proyecto

Ecommerce con dos partes separadas en carpetas propias:

## Backend (`backend/`)
- Java 21 + Spring Boot 3.4.5 (Maven, `pom.xml`).
- Starters: `data-jpa`, `security`, `web`. Conectores MySQL y PostgreSQL, Lombok.
- Estructura por capas dentro de `com.ecommerce.backend`:
  - `controller/` — endpoints REST (Usuario, Producto, Carrito, Pedido, Comentario, Testimonio, MetodoPago, MetodoEnvio, Notificacion).
  - `service/` — lógica de negocio.
  - `repository/` — acceso a datos (Spring Data JPA).
  - `entity/` — entidades JPA (Usuario, Producto, Carrito, Pedido, DetallePedido, Venta, Comentario, Testimonio, MetodoPago, MetodoEnvio, Notificacion).
  - `dto/` — objetos de transferencia (CarritoDTO, PedidoDTO, ComentarioDTO, MetodoEnvioDTO).
  - `config/` — configuración (CORS, seguridad).
- Archivos subidos por usuarios en `src/main/resources/static/uploads/`.
- `target/` es salida compilada de Maven, no se edita a mano.

## Frontend (`frontend/`)
- React 19 + TypeScript + Vite 6, Tailwind CSS 4.
- Rutas con `react-router-dom`, llamadas HTTP con `axios`.
- Estructura:
  - `src/admin/` — panel de administración (páginas y layout: Header/SidebarAdmin, Productos, Categorías, Marcas, Pedidos, Métodos de pago/envío, Testimonios, Reviews, Perfil).
  - `src/user/` — tienda para el cliente final (Home, Carrito, Checkout, Pedidos, Detalle de producto, Contacto).
  - `src/autenticacion/` — login.
  - `src/context/` — estado global (AuthContext).
- Build: `npm run build` (tsc + vite build); dev: `npm run dev`.

## Nota de ramas
El repo tiene varias ramas por integrante (`Carlos`, `Brahayan`, `Gianfranco`, `Juan`) que se van fusionando a `main`.
