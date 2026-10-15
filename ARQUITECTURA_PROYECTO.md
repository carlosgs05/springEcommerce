# Arquitectura del proyecto

Ecommerce de tecnología ("TechStore", nombre provisional) con dos partes en carpetas propias.
Sistema de diseño: `IDENTIDAD_VISUAL.md`. Plan de 12 días: `PLAN_DISENO_PORTAFOLIO.md`.

## Backend (`backend/`)
- Java 21 + Spring Boot 3.4.5 (Maven wrapper, `pom.xml`). Solo PostgreSQL (driver MySQL quitado en Día 1).
- Starters: `data-jpa`, `security`, `web`, `mail`, `spring-session-jdbc`; JWT con jjwt 0.11.5; Lombok.
- Flyway 10.20.1 (`flyway-core` + `flyway-database-postgresql`): migraciones en `src/main/resources/db/migration/`.
  - `V1__esquema_inicial.sql` = línea base sacada con `pg_dump --schema-only` de la base local (20 tablas, incluye `spring_session*`) + filas de `rol`/`permiso`/`rol_permisos`.
  - Bases existentes se marcan como versión 1 (`baseline-on-migrate=true` solo en dev). Hibernate en `ddl-auto=validate`.
- Configuración:
  - `application.properties` (dev): importa `backend/.env`; secretos por variable (`DB_PASSWORD`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `JWT_SECRET`); `DB_URL`/`DB_USERNAME`/`ALLOWED_ORIGIN` con default local.
  - `application-prod.properties`: todo por variable, se activa con `SPRING_PROFILES_ACTIVE=prod`.
  - `backend/.env.example` lista las variables. `.env` no se versiona.
  - Propiedades propias: `app.jwt.secret` (Base64, ≥32 bytes) y `app.cors.allowed-origins` (lista separada por comas).
- Paquete `com.ecommerce.backend`, por capas:
  - `controller/` — endpoints REST (Usuario, Producto, Categoria, Marca, Carrito, Pedido, Comentario, Testimonio, MetodoPago, MetodoEnvio, Notificacion).
  - `service/` — lógica (incluye `JWTUtils`).
  - `repository/` — Spring Data JPA.
  - `entity/` — entidades JPA (Usuario, Rol, Permiso, RolPermiso, Producto, ProductoImg, Especificacion, Categoria, Marca, Carrito, Pedido, DetallePedido, Venta, Comentario, Testimonio, MetodoPago, MetodoEnvio, Notificacion).
  - `dto/` — objetos de transferencia.
  - `config/` — `SecurityConfig` (hoy `/api/**` en permitAll; se cierra módulo por módulo), `CorsConfig`, `JWTAuthFilter`.
- Archivos subidos en `src/main/resources/static/uploads/`, servidos en `/uploads/**`.
- Pruebas: `src/test/java/com/ecommerce/backend/SeguridadConfigTest.java` (JWT y CORS, unitaria). La prueba vieja `com.phegondev...ApplicationTests` levanta el contexto completo.
- `target/` es salida de Maven, no se versiona.

## Frontend (`frontend/`)
- React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (`@tailwindcss/vite`, sin `tailwind.config`).
- Rutas con `react-router-dom`, HTTP con `axios`.
- Tokens de diseño en `src/index.css` (`@theme static`: colores, fuentes, sombras `elevation-1..3`, radios `card`/`control`, `ease-standard`, `duration-*`; `.dark` por clase). Fuentes Space Grotesk + DM Sans cargadas en `index.html`.
- Piezas compartidas en `src/components/ui/`: `Button`, `Badge`, `Card`, `FormField` (+ `Input`/`Textarea`/`Select`); helper `src/lib/cn.ts`.
- Cliente HTTP central `src/lib/api.ts` (`api`, `API_BASE_URL`, `assetUrl`) que lee `VITE_API_BASE_URL` de `frontend/.env`. Las pantallas viejas todavía usan `http://localhost:8080` a mano (pendiente de migrar).
- Pantalla de muestra solo en dev: `/dev/ui` (`src/dev/UiShowcase.tsx`).
- Estructura: `src/admin/` (panel), `src/user/` (tienda), `src/autenticacion/`, `src/context/` (AuthContext), `src/components/` (rutas protegidas + `ui/`).
- Build: `npm run build` (tsc + vite); dev: `npm run dev`; `npm run lint` (tiene errores previos en archivos viejos).

## Arranque
- `iniciar_sistema.bat` / `detener_sistema.bat` en la raíz; `backend/arrancar_backend.bat` elige un JDK 21+.
- Sin CI. Sin pruebas de frontend.
