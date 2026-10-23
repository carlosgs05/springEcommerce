# Arquitectura del proyecto

Ecommerce de tecnología ("TechStore", nombre provisional) con dos partes en carpetas propias.
Sistema de diseño: `IDENTIDAD_VISUAL.md`. Plan de 12 días: `PLAN_DISENO_PORTAFOLIO.md`.

## Backend (`backend/`)
- Java 21 + Spring Boot 3.4.5 (Maven wrapper, `pom.xml`). Solo PostgreSQL (driver MySQL quitado en Día 1).
- Starters: `data-jpa`, `security`, `web`, `mail`, `spring-session-jdbc`; JWT con jjwt 0.11.5; Lombok.
- Flyway 10.20.1 (`flyway-core` + `flyway-database-postgresql`): migraciones en `src/main/resources/db/migration/`.
  - `V2`–`V6` (Día 2) ya aplicadas a la base local: no se tocan. `V2` agregó MFA, `V4` la tabla `recuperacion_admin`; ambas cosas las quita `V7__quitar_mfa_y_recuperacion.sql` (destructiva). Quedan de V3/V5/V6: `correo_pendiente*`, `usuario.sesion_version`, índice único `uq_usuario_correo_lower`.
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
- Autenticación (Día 2): **solo correo + contraseña, un paso, sin segundo factor** (decisión del dueño; MFA y "Recuperar acceso" se quitaron). `POST /api/auth/login` devuelve el JWT directo. Contrato: `docs/contratos/CONTRATO_DIA2.md`.
  - JWT único `typ=access` (24 h) con `pwv` (huella de la clave) y `sv` (= `usuario.sesion_version`); `JWTUtils` + `JWTAuthFilter` rechazan cualquier otro. `SesionActual` da el usuario del token. `sesion_version` sube al cambiar rol o correo.
  - Respuestas solo con `dto/UsuarioResponse` (nunca la entidad). JSON roto en auth → `controller/AuthExcepcionesAdvice` (400 "Datos no válidos").
  - Contraseñas: máximo 72 bytes UTF-8 (BCrypt lanza excepción por encima); validar con `UsuarioService.claveDemasiadoLarga()` antes de `encode`/`matches`.
  - Límites de intentos con `service/ContadorAcotado` (en memoria, una instancia; falla cerrado al llenarse): login por correo/IP, clave actual, códigos de reset, tope por IP en rutas de códigos.
  - Panel admin: `/api/admin/**` exige sesión + autoridad `ADMINISTRADOR` (`SecurityConfig`). Cambio de rol: `AdminUsuarioController` → `AdminUsuarioService` → `RolPersistencia` (transacción, no deja 0 admins).
  - Correos fuera de la petición: `service/CorreoSegundoPlano.enviar(...)`. Auditoría: `service/Auditoria`.
  - Pruebas: `AuthSeguridadDia2Test`, `CambioCorreoDia2Test`, `CambioRolDia2Test`, `HardeningUnitTest`, `SeguridadConfigTest` (todas sin base, con mocks).
- Frontend Día 2: `src/autenticacion/useCambiarCorreo.ts` (usado por los 2 perfiles); `ForgotPassword`/`VerifyResetCode`/`ResetPassword` = solo "olvidé mi contraseña"; regex de correo en `formUtils.ts` (`EMAIL_RE`).
- Archivos subidos en `src/main/resources/static/uploads/`, servidos en `/uploads/**`.
- Pruebas: `src/test/java/com/ecommerce/backend/SeguridadConfigTest.java` (JWT y CORS, unitaria). Todas las pruebas son sin base (mocks); no hay ninguna que levante la app completa.
- `target/` es salida de Maven, no se versiona.

## Frontend (`frontend/`)
- React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (`@tailwindcss/vite`, sin `tailwind.config`).
- Rutas con `react-router-dom`, HTTP con `axios`.
- Tokens de diseño en `src/index.css` (`@theme static`, Grafito+Oro, un solo modo oscuro con `color-scheme: dark`, sin `.dark`). Fuentes Playfair Display + Inter en `index.html`. Íconos: `@phosphor-icons/react`.
- Auth: `src/autenticacion/AuthLayout` (marco + transición entre rutas), `AuthStep` (paso animado), `AuthAlert`, `formUtils`; `Login.tsx` de un paso; `src/lib/api.ts` agrega el Bearer de `authToken`.
- Piezas compartidas en `src/components/ui/`: `Button`, `Badge`, `Card`, `FormField` (+ `Input`/`Textarea`/`Select`); helper `src/lib/cn.ts`.
- Cliente HTTP central `src/lib/api.ts` (`api`, `API_BASE_URL`, `assetUrl`) que lee `VITE_API_BASE_URL` de `frontend/.env`. Las pantallas viejas todavía usan `http://localhost:8080` a mano (pendiente de migrar).
- Pantalla de muestra solo en dev: `/dev/ui` (`src/dev/UiShowcase.tsx`).
- Estructura: `src/admin/` (panel), `src/user/` (tienda — `pages/`, `components/header|footer/`, `hooks/`), `src/autenticacion/`, `src/context/` (AuthContext), `src/router/` (guards: GuestRoute/ProtectedRoute/PublicRoute/HomeRoute), `src/layouts/` (UserLayout: Header+Outlet+Footer), `src/components/ui/`.
- Alias `@/` → `src/` configurado en `vite.config.ts` y `tsconfig.app.json`, en uso solo en los archivos del área cliente tocados en el Día 4 (Header y piezas, Footer, hooks, layout, guards, router, `user/pages/*`) — el resto del proyecto sigue con imports relativos.
- Build: `npm run build` (tsc + vite); dev: `npm run dev`; `npm run lint` (tiene errores previos en archivos viejos).

## Arranque
- `iniciar_sistema.bat` / `detener_sistema.bat` en la raíz; `backend/arrancar_backend.bat` elige un JDK 21+.
- Sin CI. Sin pruebas de frontend.
