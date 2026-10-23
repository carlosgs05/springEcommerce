# Reglas de trabajo — PROYECTO_ECOMMERCE

Mapa técnico en `ARQUITECTURA_PROYECTO.md` (no se carga solo; lo lee el líder).
Plan vigente: rediseño + seguridad en 12 días, en `PLAN_DISENO_PORTAFOLIO.md`; diseño en `IDENTIDAD_VISUAL.md`. Un día a la vez.

## Ramas y permisos
- Rama principal: `main` (hasta ahora se empuja directo a `main`; hay ramas por integrante `Carlos`, `Brahayan`, `Gianfranco`, `Juan`).
- Cada día del plan se trabaja en su propia rama (`dia-01-fundamentos`, `dia-02-...`).
- **Commit y push los revisa el dueño**: no se hace commit ni push sin que lo pida.
- Nunca fusionar a `main`, desplegar, ni ejecutar contra una base real sin permiso explícito.
- Pendiente de confirmar con el dueño: qué rama llega a usuarios reales y si hay algo que no se toca nunca.

## Decisiones del dueño
- Autenticación = solo correo + contraseña, para siempre. No hay ni se propone segundo factor (MFA/TOTP/WebAuthn/SMS) ni flujo "Recuperar acceso". Se quitó en el Día 2.

## Caché del backend (Día 5 — trampa al probar)
- `CategoriaService`/`MarcaService`/`ProductoService` usan `@Cacheable`/`@CacheEvict` de Spring. Si para probar algo se hace un `UPDATE`/`DELETE` directo por SQL a la base en vez de pasar por el endpoint real, la caché NO se entera y la pantalla sigue mostrando el dato viejo (parece un bug, no lo es). Para pruebas de punta a punta, cambiar los datos siempre por el endpoint real (login + PUT/DELETE con el token), nunca con SQL directo, salvo que sea para *crear* datos de prueba que todavía no existen (eso sí es seguro, no hay nada en caché para ese id todavía).

## Deuda encontrada (Día 5 — programada para el Día 11)
- `ProductoDetails.tsx` recibe el producto por `location.state` de react-router (lo pasa `Tienda.tsx` al navegar) y **nunca vuelve a pedirlo al backend por id**. Recargar la página, entrar por enlace directo o compartir la URL de un producto rompe la pantalla ("Producto no encontrado"). `ProductoController` tampoco tiene un `GET /api/productos/{id}` hoy (solo `/listarAll` y `/filtrar`). No es un bug de hoy, se detectó probando el Día 5 — el dueño decidió corregirlo en el **Día 11** (ya está anotado ahí en `PLAN_DISENO_PORTAFOLIO.md`), no antes.

## Convenciones (Día 3)
- `usuario.activo` (cuenta desactivada por admin) es una columna distinta de `usuario.is_enabled` (correo verificado) — no mezclar ambos checks. `activo` se agregó en `V8__cuenta_activa.sql`.
- Para "no quedarse sin admin", hay dos guardas separadas en `UsuarioRepository`: `bloquearAdminsActivos()` (solo `is_enabled`, la usa `RolPersistencia` al cambiar rol) y `bloquearAdminsActivosYHabilitados()` (`is_enabled` Y `activo`, la usa `EstadoCuentaPersistencia` al desactivar cuenta) — ambas con `SELECT ... FOR UPDATE` sobre todos los admins activos para evitar que dos desactivaciones simultáneas dejen el sistema sin ningún admin.
- `UsuariosAdmin.tsx` (Día 3), `CategoriasAdmin.tsx` y `MarcasAdmin.tsx` (Día 4) ya están migradas a las piezas del Día 1 (`Card`/`Badge`/`Button`/`Input`, header sólido+elevación en vez del gradiente azul/cian) — son el patrón a copiar para las tablas admin que faltan (`MetodosEnvioAdmin.tsx`, `MetodosPagoAdmin.tsx`, `ReviewsProductosAdmin.tsx`, `TestimoniosAdmin.tsx`, `PedidosAdmin.tsx`, todavía sin migrar). Las que ya migraron también usan el cliente `api` de `lib/api.ts` (con token) en vez de `axios` plano — si una pantalla admin todavía usa `axios` directo para escritura, se va a romper en cuanto su endpoint pase a exigir `ROLE_ADMIN`, revisar eso al tocarla.
- En este entorno (sandbox de este agente), `postgres.exe` no puede abrir socket TCP (bind da "Permission denied") aunque Python sí puede — bloquea la prueba de punta a punta con base descartable. Si vuelve a pasar, probar desde una terminal fuera del sandbox del agente antes de asumir que es un problema del proyecto.
- `iniciar_sistema.bat` lanza backend/frontend como procesos separados (hidden, vía `Start-Process`) — si se arranca con una herramienta de comando "de fondo" cuyo proceso padre se mata al terminar la llamada, Windows mata también esos hijos y el backend/frontend quedan arriba un momento y luego mueren solos (el log dice "OK" pero después no hay nada escuchando). Arrancarlo en una pestaña de terminal persistente, no en un comando de un solo uso.
- El dueño confirmó que sus bases **locales** (`localhost:5432/Ecommerce` incluida) son de prueba, no producción — se puede conectar directo con `backend/.env` para pruebas de punta a punta ahí, sin armar una base descartable aparte, siempre creando los datos de prueba por SQL (evita que el registro mande un correo real) y borrándolos al terminar.

## Estructura de carpetas del frontend (Día 4 — adelanto navbar/footer + reestructuración)
- Alias `@/` → `frontend/src/` configurado de verdad en los dos archivos que hace falta (`vite.config.ts` y `tsconfig.app.json`) — úsalo en imports que "suben" varios niveles (`../../..`); los imports entre archivos vecinos de una misma carpeta chica se pueden dejar relativos (`./archivo`), no es obligatorio aliasearlos. Aplicado hoy solo en los 24 archivos que tocó este encargo (Header y sus piezas, Footer, hooks, `UserLayout`, `App.tsx`, los 4 guards, las 9 `user/pages/*`) — el resto del proyecto (~48 archivos) sigue con imports relativos para una pasada futura aparte; no asumas que todo el proyecto ya usa `@/`.
- `frontend/src/router/` — los guards de ruta (`GuestRoute`, `ProtectedRoute`, `PublicRoute`, `HomeRoute`), antes mezclados en `components/` con componentes de UI real. Si se agrega un guard nuevo, va aquí, no en `components/`.
- `frontend/src/layouts/` — layouts compartidos (`UserLayout.tsx`: Header + `<Outlet/>` + Footer, anidado en `App.tsx` dentro de cada guard que sirve pantallas de cliente). Las páginas de `user/pages/*` NO importan Header/Footer directo, lo heredan del layout.
- `frontend/src/user/components/` — componentes de UI propios del área cliente, organizados en subcarpetas por componente grande (`header/` con `Header.tsx` + sus piezas extraídas — hooks de UI como `useClickOutside` y componentes de presentación como `HeaderNav`/`UserMenu`/`CartMenu`/`NotificationsMenu`/`HeaderMobileMenu`; `footer/` con `Footer.tsx`). Si un componente de cliente crece mucho (como pasó con el Header de 883 líneas), este es el patrón a seguir: orquestador + hooks de datos aparte + piezas de presentación aparte, no todo en un archivo.
- `frontend/src/user/hooks/` — hooks de datos del área cliente (`useCarrito.ts`, `useNotificaciones.ts`), que hablan con el backend vía `lib/api.ts` (nunca `axios` crudo con URL hardcodeada). Si se necesita un hook de datos nuevo para el área cliente, va aquí.
- Patrón para partir un componente grande (el que se usó con Header): primero extraer la lógica de datos a hooks en `user/hooks/`, probarla a fondo sin tocar el JSX; recién después extraer piezas de presentación del JSX, una por una, verificando cada una antes de seguir con la siguiente. No mezclar ambos cambios en el mismo paso — hace más difícil saber qué rompió qué si algo falla.

## Subida de archivos (Día 4 — bug real que afectaba las 4 pantallas con upload)
- `Marca/Producto/MetodoEnvio/MetodoPagoService` calculan `uploadDir` como ruta relativa a `src/main/resources/static/uploads` (sin el prefijo `backend/`, que estaba mal: asumía que el proceso arranca desde la raíz del proyecto). El backend, arrancado como siempre con `iniciar_sistema.bat`, corre con el directorio de trabajo en `backend/` — con el prefijo de más, los archivos cuevos (subidos en caliente) caían en una carpeta fantasma `backend/backend/...` que nadie servía. Si se toca `uploadDir` en cualquiera de esos 4 servicios, no volver a poner el prefijo `backend/`.
- `/uploads/**` se sirve con un `ResourceHandler` explícito en `CorsConfig.java` (`addResourceLocations("file:" + uploadDir)`), directo desde disco — **no** depende del classpath compilado (`target/classes/static/uploads`), que es una foto fija de build y no ve archivos subidos después de compilar. Si algún día alguien "arregla" esto quitando el ResourceHandler y confiando en el classpath de nuevo, las subidas en caliente se vuelven a romper.
- `MarcaService.eliminarMarca` (y el patrón que copian los otros 3 servicios) borra la fila de la base pero **no** borra el archivo físico — quedan huérfanos en `uploads/`. No es un riesgo de seguridad, es deuda de limpieza; no se tocó porque no era parte del Día 4.

## Patrón de badge de contador (Día 4 — navbar/footer)
- Un badge de contador sobre un ícono chico (16px) dentro de un botón chico (36px, como los del Header) va con `-top-1 -right-1` (se asoma fuera de la esquina), nunca `top-0 right-0` — con `top-0 right-0` el badge (20px) queda casi encima del ícono y lo tapa visualmente casi por completo en vez de marcar solo la esquina. Aplica a cualquier ícono+badge nuevo que se agregue al navbar o a cualquier otro lado.

## Deuda encontrada hoy, no corregida (Día 4 — navbar/footer)
- `DELETE /api/carrito/{iduser}` devuelve 405: el backend solo mapea `DELETE /api/carrito/eliminar/{id}`, no `DELETE /api/carrito/{id}`. El frontend (`useCarrito.ts`, `guardarOEliminarCarritoAlSalir`) llama a esa ruta al cerrar sesión con el carrito vacío; está envuelto en `try/catch` así que no rompe la UI, pero el DELETE nunca se ejecuta de verdad. Si se toca el backend de carrito, revisar y unificar esa ruta.

## Secretos
- Ningún secreto en el código ni en `application.properties`: van en `backend/.env` y `frontend/.env` (ignorados por git). Los `.env.example` sí se versionan.

## Trampas del entorno (Windows de esta PC)
- `NoDefaultCurrentDirectoryInExePath` activo: los .bat/.cmd se llaman con `.\` (ej. `.\mvnw.cmd`, `.\detener_sistema.bat`).
- El `java` del PATH es 17; el backend exige 21+. Compilar con `JAVA_HOME=C:\Program Files\Java\jdk-23` y `-Dmaven.compiler.proc=full` (sin eso Lombok no corre). `backend/arrancar_backend.bat` ya lo hace.
- Levantar/detener todo: `iniciar_sistema.bat` / `detener_sistema.bat` en la raíz (log en `scripts/ecommerce_log.txt`).
- Si se renombra o borra una migración, compilar con `mvnw clean ...`: sin `clean`, la vieja queda en `target/classes` y Flyway no arranca ("more than one migration with version N").
- Para pruebas de punta a punta, correr el jar desde una carpeta del scratchpad, NUNCA desde `backend/`: ahí carga `backend/.env`, que apunta a la base real. Pasar siempre `DB_URL` a la base descartable y comprobarlo en el log.
- Base descartable: `"C:\Program Files\PostgreSQL\17\bin\initdb" -D <scratchpad>\pgl -U postgres -A trust` + `pg_ctl ... -o "-p 55433" start`; usuarios de prueba por SQL con `pgcrypto` (`crypt('clave', gen_salt('bf',10))`). Al terminar, parar y borrar la carpeta.
- Pruebas con base descartable: el registro manda correo; con el host de correo caído borra la cuenta recién creada. Usar un sumidero SMTP local (`--spring.mail.host=127.0.0.1 --spring.mail.port=2525`) o crear las cuentas por SQL en esa base.

## Base de datos
- El esquema lo maneja Flyway (`backend/src/main/resources/db/migration`). `ddl-auto=validate`: Hibernate ya no cambia tablas.
- Todo cambio de esquema = migración nueva `V<n>__descripcion.sql`. Nunca editar una migración ya aplicada (V1 incluida).
