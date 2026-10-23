# Rediseño + auditoría de seguridad — "TechStore" (ecommerce de tecnología), por módulo y por día

## Progreso (actualizar al cerrar cada día — así se sabe cuál sigue sin releer todo)

- [x] Día 1 — Fundamentos: tokens de diseño, piezas compartidas, seguridad transversal y base de datos versionada
- [x] Día 2 — Autenticación (correo + contraseña; se quitó el MFA por decisión del dueño)
- [x] Día 3 — Usuarios/Perfil + Roles y Permisos + Gestión de Clientes (admin) — ver nota de verificación pendiente abajo
- [x] Día 4 — Categorías + Marcas
- [x] Día 5 — Productos
- [ ] Día 6 — Favoritos y Comparador de Productos + Carrito
- [ ] Día 7 — Métodos de Pago: pasarelas reales + manual
- [ ] Día 8 — Métodos de Envío + Comentarios/Reseñas + Testimonios
- [ ] Día 9 — Checkout / Pedidos / Ventas (incluye pantalla de pago fallido)
- [ ] Día 10 — Notificaciones + Marco del Panel Admin + Reportes con gráficos
- [ ] Día 11 — Sitio Público / Home + páginas legales + 404 + cierre final
- [ ] Día 12 — Despliegue a producción

## Contexto

Este proyecto va al portafolio del dueño. El pedido es que se vea "llamativo,
vendible, que solucione problemas reales de la gente" y que **no se vea
genérico** — hoy lo es: no existe `tailwind.config`, el bloque `@theme` de
Tailwind v4 en `frontend/src/index.css` está vacío (0 tokens), no hay fuente
propia (`frontend/index.html` sigue con `<title>Vite + React + TS</title>`
del boilerplate), y los colores están sueltos y descoordinados entre
pantallas — confirmado en el código:
- `HomeUser.tsx` mezcla `bg-blue-600/700` (líneas 236 y 391) con
  `bg-indigo-600/500` (líneas 428, 437, 443) en secciones distintas de la
  misma pantalla.
- `Login.tsx` usa `bg-green-800`/`bg-gray-800`, una paleta que no aparece en
  ningún otro lugar de la app.
- `ProductosAdmin.tsx` reinventa badges de estado con `bg-blue-50/100`,
  `bg-red-50/100`, `bg-gray-50/100/200` sueltos en al menos 8 lugares del
  mismo archivo, sin un componente de badge reutilizable.
- **Confirmado además (análisis de colorimetría/tipografía/elementos
  posterior al Día 1):** el logo es un ícono hotlinkeado de icons8.com (un
  tigre, sin relación con la marca) en 6 archivos; el nombre de marca dice
  "TechShop" en el código de usuario vs. "TechStore" en estos documentos;
  dos librerías de íconos mezcladas (`react-icons` + `@heroicons` en un solo
  archivo) más PNGs de icons8 como loaders/estados; el design system de
  `components/ui/` ya existe pero el 95% de las pantallas no lo usa
  (`rounded-xl`/`shadow-*` sueltos de Tailwind en su lugar); 3 lenguajes
  visuales distintos conviviendo (tienda clara azul/cian, auth oscura
  zinc suelta, admin oscuro gris/cian); y la estructura de Home (hero
  carrusel + countdown de oferta + testimonios + marcas + beneficios),
  catálogo (sidebar de filtros fijo) y ficha de producto (specs en pestaña)
  es, comparado contra un sitio real del mismo rubro, el patrón más
  genérico de ecommerce que existe — se corrige cada uno el día que le
  corresponde abajo.

El dueño pidió que la seguridad se corrija **auditando módulo por módulo,
día por día**, con el espíritu del plan que se usó en el proyecto CAR_WASH
del mismo portafolio, con estos criterios propios para este proyecto:
1. La seguridad va **integrada en cada día**, junto al rediseño, como una
   sección más — no aparte.
2. **Los módulos grandes o de mayor riesgo van solos en su día**
   (Autenticación, Productos, Métodos de Pago, Checkout/Pedidos) — los
   módulos chicos se agrupan en el mismo día cuando tiene sentido, para que
   el plan avance sin demorar de más sin sacrificar que cada cosa quede bien
   hecha y segura.
3. **Todo el plan son días seguidos, sin agruparlos en bloques con nombre**
   — el Día 1 (fundamentos) y el Día 12 (despliegue) son días como
   cualquier otro.
4. **Todo número, estrella, badge o métrica que se muestre tiene que salir
   de un cálculo real sobre datos reales**, nunca decorativo — ver la regla
   fija antes del Día 2.
5. Pasarelas de pago reales (las más comunes en Perú, no solo una), en modo
   sandbox porque aún no hay RUC, manteniendo Yape/Plin/transferencia manual
   como alternativa aparte.
6. Autenticación de **un solo paso: correo + contraseña**, igual para admin
   y cliente, sin segundo factor (decisión final del dueño) — ver el Día 2.
7. **No es solo reacomodar las pantallas que ya existen con otra
   distribución** — se revisó qué le falta a un ecommerce real que hoy no
   existe en el proyecto, y se agregó como módulos nuevos (Favoritos y
   Comparador de Productos, Gestión de Clientes en el admin, Reportes con
   gráficos, pantalla de pago fallido, páginas legales, 404) — ver el mapa
   de pantallas más abajo.

### Sistema de diseño (detalle completo en `IDENTIDAD_VISUAL.md` — aquí solo el resumen)

Verificado contra la base `ui-ux-pro-max`, no inventado. **Estilo:**
Dimensional Layering (elevación en 4 niveles) + Minimalism & Swiss Style —
se descartó a propósito todo lo que ya usó CAR_WASH (Material 3 Expressive,
Bento Box, Glassmorphism, Dark Mode OLED) y "Vibrant & Block-based" (la
recomendación genérica de la base para "E-commerce", el look de plantilla
que se quiere evitar).

**Tipografía:** Playfair Display (headings) + Inter (body/botones/specs) —
pareo real "Classic Elegant" de la base, para e-commerce premium.

**Color:** un solo modo, **oscuro, sin toggle ni clase `.dark`** — Grafito
(`#0C0A09`/`#1C1917`) + Oro (`--color-primary: #D4AF37`, texto oscuro
encima, nunca blanco). Semánticos aclarados para leer sobre fondo casi
negro: éxito `#22C55E`, advertencia `#F97316`, error `#EF4444`. Ver tabla
completa de tokens, sombras y el resto (iconografía, estructura/layout,
anti-patrones) en `IDENTIDAD_VISUAL.md`.

**Nombre/logo de marca:** **"TechStore"** es la fuente de verdad (el código
tiene hoy "TechShop" suelto en varias pantallas de usuario — se corrige al
tocar cada una). El logo es el wordmark en Playfair Display, sin ícono —
hoy hay un ícono hotlinkeado de icons8.com (un tigre, sin relación con la
marca) en 6 archivos, se quita al tocar cada uno.

## Mapa de pantallas: las que ya existen (verificado en código) + las nuevas que se agregan

**Confirmado hoy en `frontend/src/admin/pages/` y `frontend/src/user/pages/`
(sin inventar nada):**
- **CLIENTE**: `HomeUser.tsx`, `Tienda.tsx` (catálogo), `ProductoDetails.tsx`,
  `CarritoDetalle.tsx`, `CheckoutPago.tsx`, `MisPedidos.tsx`,
  `DetallePedido.tsx`, `PerfilUser.tsx`, `Nosotros.tsx`, `Contacto.tsx`.
- **ADMIN**: `HomeAdmin.tsx`, `ProductosAdmin.tsx`, `CategoriasAdmin.tsx`,
  `MarcasAdmin.tsx`, `PedidosAdmin.tsx`, `DetallePedidoAdmin.tsx`,
  `MetodosPagoAdmin.tsx`, `MetodosEnvioAdmin.tsx`, `ReviewsProductosAdmin.tsx`,
  `TestimoniosAdmin.tsx`, `PerfilAdmin.tsx`, con `Layout.tsx` +
  `SidebarAdmin.tsx` + `HeaderAdmin.tsx` como estructura compartida.

**Pantallas nuevas que se agregan** (huecos reales confirmados, no están hoy
ni con otro nombre):
- `Favoritos.tsx` y `ComparadorProductos.tsx` (Día 6) — no existe ninguna
  forma de guardar un producto para después ni de comparar specs de dos
  productos lado a lado.
- `UsuariosAdmin.tsx` (Día 3) — **el admin no tiene ninguna pantalla para
  ver la lista de clientes registrados**, confirmado: no aparece en
  `admin/pages/` ni hay controller de listado de usuarios para admin.
- `ReportesAdmin.tsx` (Día 10) — confirmado que `recharts` está instalado en
  `package.json` pero **no se usa en ningún archivo del proyecto**
  (`grep -rl recharts frontend/src` no devuelve nada): la herramienta está,
  la pantalla no.
- Pantalla/estado de **pago fallido** dentro de `CheckoutPago.tsx` (Día 9)
  — hoy el checkout no tiene manejo explícito de una tarjeta rechazada.
- `Terminos.tsx`, `Privacidad.tsx`, `Devoluciones.tsx` (Día 11) — no existen
  páginas legales, y son obligatorias para operar con Culqi/Mercado Pago de
  verdad.
- `NotFound.tsx` (404, Día 11) — no existe, hoy una ruta inválida no tiene
  pantalla propia.

Confirmado además: **no existe ningún control de autorización en el
backend** para la mayoría de las pantallas de arriba — `SecurityConfig.java`
tiene `requestMatchers("/api/**").permitAll()` sin excepción. La única
barrera hoy es `ProtectedRoute.tsx` en el frontend (roles `[1]` admin/`[2]`
cliente hardcodeados), que cualquiera evita llamando al endpoint directo.
Esto se corrige módulo por módulo, día por día.

## Día 1 — Fundamentos: tokens de diseño, piezas compartidas, seguridad transversal y base de datos versionada

Este día es la base técnica para todos los que siguen — se hace antes del
Día 2.

### Sistema de tokens (`frontend/src/index.css`, Tailwind v4 `@theme`)

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

:root {
  color-scheme: dark; /* un solo modo — controles nativos también oscuros */

  --font-heading: "Playfair Display", serif;
  --font-body: "Inter", sans-serif;

  --color-primary: #D4AF37;
  --color-primary-hover: #E8C547;
  --color-accent: #F2C94C;
  --color-success: #22C55E;
  --color-warning: #F97316;
  --color-danger: #EF4444;

  --color-surface: #1C1917;
  --color-canvas: #0C0A09;
  --color-border: rgba(255,255,255,0.08);
  --color-text: #FAFAF9;
  --color-text-muted: #A8A29E;

  --shadow-elevation-1: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-elevation-2: 0 10px 24px -6px rgba(0,0,0,0.5);
  --shadow-elevation-3: 0 20px 40px -8px rgba(0,0,0,0.6);
  --shadow-primary-glow: 0 4px 16px rgba(212,175,55,0.35);

  --radius-card: 1rem;
  --radius-control: 0.75rem;
}
```

No hay clase `.dark` ni alternancia — es el único tema. También: cambiar
`<title>Vite + React + TS</title>` por "TechStore" en `frontend/index.html`.

### Piezas compartidas (nuevas, en `frontend/src/components/ui/`)

Hoy no existe ninguna — cada pantalla repite clases sueltas (confirmado en
`ProductosAdmin.tsx`, con al menos 8 combinaciones distintas de
`bg-{color}-{tono}` para lo que debería ser un solo componente de badge).

- **`Button.tsx`**: variantes `primary`/`secondary`/`danger`/`ghost`,
  tamaños `sm`/`md`/`lg`, estado `loading` real (spinner, no solo texto).
- **`Badge.tsx`**: variantes semánticas `success`/`warning`/`danger`/`info`
  — reemplaza los combos sueltos de `ProductosAdmin.tsx`, `PedidosAdmin.tsx`,
  `ReviewsProductosAdmin.tsx`, etc.
- **`Card.tsx`**: con `elevation` 1/2/3 de los tokens — base para tarjetas de
  producto, resumen de pedido, panel de admin.
- **`FormField.tsx`**: label visible + mensaje de error inline + helper text
  — unifica los formularios de Login/Registro/Perfil/Checkout/Admin, hoy
  todos armados a mano y distintos entre sí.

### Seguridad transversal — antes de tocar cualquier módulo

1. **Sacar credenciales del código.**
   - Backend: mover de `application.properties` (confirmado en texto plano)
     `spring.datasource.password` y `spring.mail.password` (valores
     omitidos aquí a propósito) a variables de entorno
     (`${DB_PASSWORD}`, `${MAIL_PASSWORD}`).
   - Frontend: no existe `.env` — crear `VITE_API_BASE_URL=http://localhost:8080`
     y reemplazar los **110 usos confirmados de `http://localhost:8080`** en
     ~30 archivos por `import.meta.env.VITE_API_BASE_URL`, centralizado en un
     cliente HTTP único (`frontend/src/lib/api.ts`, nuevo).
2. **Clave JWT fuera del código.** Confirmado en `JWTUtils.java` línea 23: la
   clave secreta está escrita directo en el constructor
   (valor omitido aquí a propósito). Se mueve a `${JWT_SECRET}` por
   variable de entorno, generando una clave nueva (la actual queda
   invalidada por estar expuesta en el repo).
3. **CORS real.** Confirmado en `CorsConfig.java`: `.allowedOrigins("*")`
   para los 6 métodos. Se cambia a una lista explícita (`${ALLOWED_ORIGIN}`:
   `http://localhost:5173` en dev, el dominio real en producción).
4. **Matriz de protección de `/api/**`**, que cada día siguiente va
   llenando: catálogo de lectura y auth públicos; carrito/pedidos/
   notificaciones/perfil/favoritos propios exigen sesión + dueño del
   recurso; creación/edición/borrado administrativo exige `ROLE_ADMIN`.
5. `backend/target` fuera del repo: ya resuelto, no es pendiente de este plan.

### Base de datos: migraciones versionadas desde este día, no al final

Hoy `spring.jpa.hibernate.ddl-auto=update` deja que Hibernate reescriba el
esquema solo en cada arranque (confirmado en `application.properties`) — en
un proyecto pensado para producción eso es un riesgo real en cuanto haya
datos de verdad. Se reemplaza por **Flyway aquí, en este primer día** — para
que **cada día siguiente que cambie algo del esquema escriba su propia
migración versionada en el momento** (ej. el Día 6 la tabla de favoritos, el Día 7 las columnas de pasarela de
pago, etc.), igual que se versiona el código.

1. Agregar la dependencia `flyway-core` (+ `flyway-database-postgresql` en
   Spring Boot 3.4.x) al `pom.xml`, quitar `spring.jpa.hibernate.ddl-auto`
   (pasa a `validate`, nunca `update`/`create`), y crear
   `backend/src/main/resources/db/migration/V1__esquema_inicial.sql` que
   capture el esquema actual tal como está hoy (generado desde la base real
   con `pg_dump --schema-only`, no escrito a mano) — esa es la línea base
   desde la que todo cambio futuro queda versionado.
2. Separar configuración por perfiles de Spring: `application.properties`
   (dev, valores locales) + `application-prod.properties` (producción, todo
   por variable de entorno — `${DB_URL}`, `${DB_PASSWORD}`, `${JWT_SECRET}`,
   `${ALLOWED_ORIGIN}`, llaves de pasarela), activado con
   `spring.profiles.active=prod`.
3. Quitar la dependencia `mysql-connector-j` del `pom.xml` (confirmado que
   está de más — el proyecto usa PostgreSQL, no MySQL).

### Responsive — transversal a todo el plan, no un día aparte

Ninguna pantalla se da por cerrada sin probarse en los 3 anchos. Breakpoints
de Tailwind a usar en todo el proyecto (mobile-first, sin excepción):
- **Base (< 640px, celular):** una columna, `Card` apiladas, barra de acción
  inferior fija donde haya un CTA principal (ej. "Finalizar compra",
  "Agregar al carrito") para que quede siempre a mano del pulgar.
- **`sm:`/`md:` (tablet):** 2 columnas en grillas de producto/tarjetas.
- **`lg:`/`xl:` (escritorio):** 3-4 columnas en catálogo, layout de
  admin con sidebar fija + contenido.

Los 4 componentes de arriba (`Button`, `Badge`, `Card`, `FormField`) se
construyen responsive desde este primer día (no se ajustan después) — por
ejemplo `Button` con área táctil mínima de 44px en mobile. Cada día
siguiente incluye, dentro de su "Prueba", confirmar el módulo en los 3
anchos.

### Animación y movimiento — para que no se vea estática

Los tokens de A.1 son solo forma y color; falta el movimiento para que la
tienda se sienta "novedosa" y no un sitio plantilla parado. Se agrega un
token de easing/duración junto a los de color en `index.css`:

```css
@theme {
  /* ...tokens ya definidos arriba... */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
}
```

Con eso, cada día siguiente agrega el movimiento que le corresponde a su
propia pantalla (no todo de golpe acá): transición entre login/registro en
el Día 2, el corazón de favoritos y la tarjeta de producto en hover en los
Días 5-6, los pasos del checkout y la confirmación de compra en el Día 9, el
contador de la campanita y la entrada de los gráficos de reportes en el Día
10, entre otros — cada uno se detalla en su propio día más abajo.

### Skills a usar en todo el plan (obligatorio, no solo este día)

Todo el trabajo visual de este plan — este día y los que siguen — se hace
invocando estas skills del proyecto (`.claude/skills/`), no a criterio
libre:
- **`ui-ux-pro-max`**: para cada pantalla nueva o rediseñada, consultar su
  base de datos (paletas, tipografía, patrones de UX, accesibilidad,
  responsive) antes de construir, igual que se usó para elegir el sistema de
  diseño de este plan — no reinventar a ojo.
- **`impeccable`**: para la pasada de pulido de cada día (jerarquía visual,
  espaciado, micro-interacciones, estados vacíos/carga/error) antes de dar
  el día por cerrado — es la skill pensada exactamente para que una interfaz
  no se vea genérica ni a medio terminar.
- **`find-animation-opportunities`**: al llegar a cada pantalla, antes de
  construirla, para identificar qué merece movimiento ahí y qué no — no se
  anima todo porque sí, se anima lo que ayuda a entender qué pasó (se
  agregó al carrito, el pago se confirmó, hay una notificación nueva).
- **`animate`**: para construir cada animación identificada, con los tokens
  de easing/duración de arriba — nunca una transición improvisada a ojo.
- **`animation-performance`**: para que ninguna animación trabe en un
  celular de gama media — solo propiedades compuestas (`transform`,
  `opacity`), nunca animar `width`/`top`/`left` directamente.
- **`review-animations`**: como parte del pulido de cada día (junto a
  `impeccable`), revisando que el movimiento se sienta bien, no solo que
  exista.

### Prueba del Día 1
App arrancando con variables de entorno (no hardcodeadas) en backend y
frontend; un `fetch` sin las credenciales del `.env` falla limpio; CORS
rechaza un origen no listado; los 4 componentes (`Button`, `Badge`, `Card`,
`FormField`) renderizados y probados en mobile/tablet/escritorio en una
pantalla de prueba; Flyway crea todo el esquema actual desde
`V1__esquema_inicial.sql` contra una base Postgres vacía, sin intervención
manual, y `ddl-auto` ya no puede alterar nada (queda en `validate`).

**Deuda agregada tras el cierre de este día (hallazgo posterior, no reabre
el checklist):** cuando se edite `index.css`, aplicar el bloque de tokens de
arriba (ya actualizado a Grafito+Oro/un solo modo) en vez del original
azul/claro-con-`.dark` — es el mismo archivo, el día sigue cerrado, solo
cambia el valor final que debía quedar.

---

**Válido para todos los días siguientes, no se repite en cada uno:** todo
"Patrón + qué se construye" se hace consultando `ui-ux-pro-max` para ese tipo
de pantalla y pasando `impeccable` como pulido final antes de cerrar el día;
toda "Prueba" incluye revisar el módulo en mobile, tablet y escritorio,
además de lo funcional/seguridad descrito.

**Regla fija: todo número, estrella, badge o métrica que se muestre tiene
que salir de un cálculo real sobre datos reales — nunca un valor decorativo
o de ejemplo.** Confirmado en el código que hoy ya hay un caso real para
copiar el criterio (`ProductoDetails.tsx` línea 72-75: el promedio de
estrellas se calcula con `reviews.reduce(...) / reviews.length` sobre
`producto.comentariosAprobados`, solo reseñas aprobadas) y un caso que falta
(el catálogo `Tienda.tsx` **no muestra ninguna calificación** en las
tarjetas de producto hoy — ni real ni falsa, no está). Mismo criterio para
todo lo demás: "stock limitado" sale de comparar el `stock` real del
producto contra un umbral fijo (ej. ≤5 unidades), no de un `Badge` puesto a
ojo; las métricas del dashboard y reportes admin (Día 10) salen de consultas
reales (`COUNT`/`SUM` sobre pedidos de hoy, productos bajo el umbral de
stock), no de números fijos en el HTML.

## Día 2 — Autenticación (correo + contraseña)

- **Problema real:** un comprador que no confía en que su contraseña está
  segura, o que ve un error críptico al registrarse, abandona antes de
  comprar — en electrónica (ticket alto: laptops, celulares) esa
  desconfianza cuesta más caro que en cualquier otro rubro.
- **Decisión final del dueño (reemplaza la de 2 factores):** la
  autenticación es de **un solo paso, correo + contraseña**, igual para
  admin y cliente. **No hay segundo factor** de ningún tipo (ni Google
  Authenticator/TOTP, ni códigos de respaldo, ni WebAuthn, ni SMS). El
  código que se había escrito para eso se quitó del proyecto (no quedó
  apagado), y con él el flujo "Recuperar acceso" y su aprobación por otro
  admin, que solo existían para quien perdía el celular: quien olvida la
  clave usa "Olvidé mi contraseña", admin y cliente por igual. Riesgo
  aceptado: una contraseña robada da acceso a la cuenta. Contrato técnico
  del día: `docs/contratos/CONTRATO_DIA2.md`.
- **Hallazgos de seguridad (se corrigen aquí, no dependen del MFA):**
  - `UsuarioService.resetPassword()` **nunca valida el código de
    verificación ni su expiración** — solo pide correo + contraseña nueva.
    `verifyResetCode()` existe como endpoint separado pero no se llama desde
    ahí. Con solo el correo de alguien, cualquiera resetea su contraseña.
  - `POST /api/auth/correo`: la respuesta incluye el objeto `Usuario`
    completo, con `password` (hash) y `resetCode` en el JSON.
  - `PUT /api/auth/update-user`: busca al usuario por el `correo` del body,
    sin verificar que sea el de la sesión — cualquiera edita cualquier
    cuenta sabiendo solo su correo.
  - Mensajes de error con `"Error: " + e.getMessage()` devueltos tal cual en
    login/forgot-password/reset-password — generalizar y loguear el detalle
    solo en servidor.
  - El carrito en `localStorage` no se limpia al cerrar sesión
    (`AuthContext.tsx`) — se corrige aquí (verificación final en Día 6).
- **Lo que se construye en el backend:**
  - `POST /login` valida correo+contraseña y entrega el JWT de sesión
    directo (sin paso intermedio), con límite de intentos por correo y por
    IP. Respuestas solo con el objeto `usuario` seguro (nunca la entidad).
  - `resetPassword` exige código válido, no vencido (10 min) y con límite
    de fallos; tope por IP en las rutas de códigos.
  - `PUT /change-password` pide la contraseña actual (con límite de
    intentos) y devuelve un token nuevo; los viejos dejan de valer.
  - Cambiar correo desde el perfil: contraseña actual + código enviado al
    correo nuevo; aviso al correo viejo.
  - Cambiar rol (`PUT /api/admin/usuarios/{id}/rol`, solo admin): mueren
    las sesiones del afectado (`sesion_version`); no se puede dejar 0
    admins.
  - Correo único sin distinguir mayúsculas.
  - Migraciones: V2–V6 ya se aplicaron a la base local y no se tocan;
    `V7__quitar_mfa_y_recuperacion.sql` quita las columnas y tablas del MFA
    y de la recuperación de admin.
- **Patrón + qué se construye en pantalla:** `Login.tsx`/`RegisterUser.tsx`/
  `ForgotPassword.tsx`/`VerifyResetCode.tsx`/`ResetPassword.tsx`/
  `VerificationAccount.tsx` dejan la paleta verde/gris/zinc aislada y pasan a
  los tokens Grafito+Oro (`Card` `elevation-2`, título en `font-heading` 700,
  `FormField` con error inline, `Button` con `loading` real) — además se
  quita el ícono de icons8 (logo "tigre") de los 3 primeros y los PNG de
  icons8 (`verified-account.png`, `spinner-frame-2.png`, `ok--v1.png`,
  `cancel--v1.png`) de `RegisterUser.tsx`/`VerificationAccount.tsx`,
  reemplazados por el wordmark y por íconos Phosphor (ver
  `IDENTIDAD_VISUAL.md`). `Login.tsx` es un solo paso (correo +
  contraseña). **Movimiento:** transición deslizante entre "Iniciar
  sesión"/"Registrarse" en vez de salto brusco; cada paso de "olvidé mi
  contraseña" entra con un fade+slide corto (`--duration-fast`); error de
  campo con un shake sutil al fallar la validación (usar
  `find-animation-opportunities` para confirmar que esto ayuda y no
  distrae).
- **Prueba:** registrar → verificar correo → login → "olvidé mi contraseña"
  de punta a punta; `resetPassword` exige código válido y no expirado;
  `/api/auth/correo` ya no devuelve `password`/`resetCode`; `/update-user`
  solo edita la cuenta de la sesión actual; una cuenta admin de prueba y una
  cliente entran con correo + contraseña en un solo paso; cambiar la
  contraseña con la actual correcta (funciona) e incorrecta (se rechaza);
  cambiar correo con el código del correo nuevo; ya no existen
  `/login/mfa`, `/mfa/**`, `/recover-access*` ni `/admin/recuperaciones`.

## Día 3 — Usuarios/Perfil + Roles y Permisos + Gestión de Clientes (admin)

### Módulo: Usuarios/Perfil + Roles y Permisos

- **Problema real:** si el cliente no confía en que sus datos están
  protegidos, no deja su número de celular; si el admin no sabe qué puede
  hacer cada rol, el dueño no confía en delegar el panel a un empleado.
- **Hallazgos de seguridad:**
  - `ProtectedRoute.tsx`: roles `[1]`/`[2]` hardcodeados en el frontend, sin
    ningún espejo en el backend (`SecurityConfig.java` no usa `hasRole()` en
    ningún lugar) — el control de roles hoy es solo cosmético.
  - No existe gestión de roles en el backend — se documenta que, si se
    agrega en el futuro, debe exigir `ROLE_ADMIN` explícito.
  - Verificar aquí que `PerfilUser.tsx`/`PerfilAdmin.tsx` ya solo editan la
    propia cuenta tras el fix de `/update-user` del Día 2.
  - **Cambiar correo:** ya construido en el Día 2 (contraseña actual +
    código al correo nuevo). Aquí solo se verifica en la pantalla.
  - **Cambio de rol:** ya existe `PUT /api/admin/usuarios/{id}/rol`
    (Día 2); falta la pantalla en el panel.
- **Patrón + qué se construye:** `PerfilUser.tsx`/`PerfilAdmin.tsx` con
  `FormField` + `Card`; `Badge` de rol visible ("Cliente"/"Administrador") —
  hoy no hay ninguna pista visual de rol. De paso, `PerfilAdmin.tsx` migra
  sus íconos de `@heroicons/react` (hoy el único archivo que los usa) a
  Phosphor, consistente con el resto del proyecto.
- **Prueba:** editar perfil de punta a punta (cliente y admin); un token de
  cliente no puede llamar a un endpoint `ROLE_ADMIN` (403, no 500).

### Módulo: Gestión de Clientes (admin) — pantalla nueva

- **Problema real:** el dueño no tiene forma de ver cuántos clientes tiene,
  identificar a los frecuentes para ofrecerles algo especial, ni desactivar
  una cuenta problemática (pedidos fraudulentos, por ejemplo) sin entrar
  directo a la base de datos — confirmado que no existe ninguna pantalla
  para esto hoy (no hay `UsuariosAdmin.tsx` ni endpoint de listado para
  admin en `admin/pages/`).
- **Hallazgos de seguridad del módulo (nuevo):**
  - El endpoint de listado paginado de usuarios exige `ROLE_ADMIN` y su DTO
    de respuesta **nunca** incluye `password`, `resetCode` ni tokens de
    verificación (misma lección del Día 2: esos campos no salen del
    backend hacia ningún listado).
  - El endpoint de desactivar cuenta (no se borra, por integridad con sus
    pedidos existentes) exige `ROLE_ADMIN` y no permite que un admin se
    desactive a sí mismo si es el único admin activo (evita quedarse sin
    forma de entrar al panel).
- **Patrón + qué se construye:** `UsuariosAdmin.tsx` con tabla paginada,
  búsqueda por nombre/correo, `Badge` de estado (activo/inactivo) y de rol;
  vista de detalle de cada cliente con su historial de pedidos (reutiliza
  los datos ya construidos en el Día 9).
- **Prueba:** listar y buscar clientes como admin; desactivar una cuenta de
  prueba y confirmar que ya no puede iniciar sesión; acceder sin sesión de
  admin → rechaza; confirmar que la respuesta de la lista nunca trae
  `password`/`resetCode`.

**Cierre real del Día 3:** backend con 125 pruebas unitarias (mocks) en
verde, incluidas las 11 nuevas de cambio de estado; `seguridad` revisó todo
lo nuevo (listado, desactivar cuenta, login con cuenta inactiva, IDOR,
mensajes de error) y no encontró hallazgos bloqueantes. **Verificado en vivo
en el navegador, contra la base local real del dueño** (no una descartable):
login normal del cliente, entrar como admin y ver `UsuariosAdmin.tsx` con los
usuarios reales + de prueba, desactivar una cuenta de prueba desde la
pantalla, confirmar en la pestaña de Network que la respuesta de la lista
nunca trae `password`/`resetCode`, e intentar iniciar sesión con la cuenta
recién desactivada → rechazada con el mensaje "Tu cuenta ha sido desactivada.
Contacta con soporte." Los dos usuarios de prueba se crearon por SQL (sin
mandar correo real) y se borraron al terminar. **Pendiente de verificar, no
bloqueante:** no se probó la concurrencia real del "último admin" con dos
transacciones simultáneas contra una base de verdad (la lógica SQL se
revisó y es correcta, pero sin ejecutarla). El botón "Ver pedidos" en
`UsuariosAdmin.tsx` queda deshabilitado — el historial de pedidos por
usuario es del Día 9, todavía no existe.

## Día 4 — Categorías + Marcas

### Módulo: Categorías

- **Problema real:** sin categorías bien organizadas, el comprador no
  encuentra rápido "laptops" vs. "celulares" y se va a otra tienda; si
  cualquiera puede crear/borrar categorías sin ser admin, se destruye la
  organización del catálogo completo en segundos.
- **Hallazgos de seguridad:** `CategoriaController` sin ningún control de
  rol (consecuencia de `permitAll()`) — se restringe `POST`/`PUT`/`DELETE`
  a `ROLE_ADMIN`, `GET` queda público.
- **Patrón + qué se construye:** `CategoriasAdmin.tsx` con `Card` + tabla,
  formulario con `FormField` — quita el degradado `from-blue-500
  to-cyan-500` de su encabezado (color sólido + elevación, igual que el
  resto del admin); filtros de categoría en `Tienda.tsx` como chips con los
  tokens nuevos.
- **Prueba:** crear/editar/eliminar categoría como admin; la misma llamada
  sin sesión de admin devuelve 401/403.

### Módulo: Marcas

- **Problema real:** el comprador filtra por marca de confianza (Lenovo,
  Samsung, Apple); sin control de quién edita, cualquiera podría insertar
  una marca falsa o borrar una legítima del catálogo.
- **Hallazgos de seguridad:** `MarcaController` sin control de rol — se
  restringe escritura a `ROLE_ADMIN`; revisar que la subida del logo de
  marca (`MarcaDTO.getImagen()`/multipart) valide tipo de archivo y tamaño
  antes de guardarlo.
- **Patrón + qué se construye:** `MarcasAdmin.tsx` con `Card` + tabla (quita
  el mismo degradado azul→cian de su encabezado), logos de marca con tamaño
  consistente.
- **Prueba:** crear/editar/eliminar marca con logo; subir un archivo
  no-imagen como logo → debe rechazar; sin sesión admin → rechaza.

**Cierre real del Día 4:** probado en vivo contra la base local del dueño,
con el sistema arrancado igual que siempre (`iniciar_sistema.bat`), no con
mocks. Categorías y Marcas: crear/editar/eliminar en el navegador con sesión
admin, filtros de categoría en `Tienda.tsx` (chips, incluye el drawer de
filtros en mobile); subida de logo probada contra el backend real con un
archivo de texto disfrazado de `.jpg` (rechazado, 400, revisa los bytes
reales del archivo) y con un PNG válido (aceptado, visible en pantalla);
sin sesión admin, la escritura rechaza con 401; `seguridad` revisó permisos,
la validación de logo (incluida la posibilidad de un archivo polyglot) y el
nuevo manejador de `/uploads/**` — sin hallazgos bloqueantes tras corregir
el que encontró (ver abajo). Responsive revisado en mobile/tablet/escritorio
no solo en las pantallas de hoy sino en las del Día 1 al 4 (Login,
Perfil/UsuariosAdmin, Categorías/Marcas/Tienda) a pedido del dueño, sin
hallazgos.

**Bugs reales encontrados hoy y corregidos (no estaban en el encargo
original, salieron al probar en vivo):**
- `CategoriaController.actualizarCategoria` tenía un typo (`"sucess"` en vez
  de `"success"`) que hacía que el frontend mostrara "Error" en cada edición
  de categoría aunque sí se guardara — corregido.
- **Las 4 pantallas con subida de archivo del proyecto** (Marcas, Productos,
  Métodos de Envío, Métodos de Pago) guardaban el archivo en una carpeta que
  el sistema nunca sirve, por una ruta relativa que asume mal desde dónde se
  arranca el backend — con la forma en que el sistema arranca siempre
  (`iniciar_sistema.bat`), **ninguna subida de imagen funcionaba de verdad**.
  Corregido en los 4 servicios (`uploadDir` ya no asume el directorio raíz
  del proyecto) + se agregó un `ResourceHandler` nuevo en `CorsConfig.java`
  que sirve `/uploads/**` directo desde disco (antes dependía del classpath
  compilado, que no se actualiza con archivos subidos en caliente).
- `seguridad` encontró que `CategoriaController`/`MarcaController` devolvían
  `e.getMessage()` crudo al cliente en los catch genéricos (patrón heredado
  del resto del proyecto) — corregido con mensaje genérico + log en servidor,
  igual que ya se hizo en el Día 2/3; los mensajes de validación propia
  (ej. "Ya existe una categoría con ese nombre") se siguen mostrando.

### Adelanto del Día 11 (navbar/footer del cliente) + reestructuración de carpetas

Al probar el Día 4 en el navegador, el navbar/footer del cliente seguía con el
diseño viejo (azul/cian, "TechShop", ícono hotlinkeado de icons8.com) mientras
las pantallas de adentro ya tenían Grafito+Oro. El dueño pidió adelantar SOLO
el navbar/footer (no `HomeUser.tsx`, que sigue siendo Día 11 completo) y de
paso reestructurar las carpetas del frontend aprovechando que se iba a tocar
`Header.tsx` de todos modos.

**Qué se hizo:**
- `Header.tsx` (883 líneas) partido en `frontend/src/user/components/header/`:
  `Header.tsx` (orquestador, ~249 líneas), `useClickOutside.ts`, `HeaderNav.tsx`,
  `UserMenu.tsx`, `CartMenu.tsx`, `NotificationsMenu.tsx`, `HeaderMobileMenu.tsx`
  — elimina la duplicación desktop/mobile que tenía cada dropdown escrito dos
  veces.
- Lógica de datos extraída a `frontend/src/user/hooks/{useCarrito.ts,
  useNotificaciones.ts}`, migrando las 7 llamadas `axios` con URL hardcodeada
  `http://localhost:8080/...` al cliente HTTP centralizado `lib/api.ts` (antes
  el carrito/notificaciones no habrían funcionado fuera de `localhost`).
- `Footer.tsx` movido a `frontend/src/user/components/footer/Footer.tsx`.
- Guards de router movidos de `components/` a `router/`:
  `GuestRoute`/`ProtectedRoute`/`PublicRoute`/`HomeRoute` — `HomeRoute` ahora
  usa `<Outlet/>` en vez de renderizar `HomeUser` directo.
- `frontend/src/layouts/UserLayout.tsx` nuevo (Header + `<Outlet/>` + Footer),
  anidado en `App.tsx` dentro de cada guard que sirve pantallas de cliente —
  las 9 páginas de `user/pages/*` ya no importan ni pintan Header/Footer ellas
  mismas.
- Rediseño visual Grafito+Oro de Header y Footer: "TechShop" → "TechStore" en
  `font-heading`, ícono hotlinkeado de icons8 reemplazado por `Storefront` de
  `@phosphor-icons/react` (también reemplaza el resto de iconos `react-icons`
  del Header/Footer), `<a href>` → `<Link>` en la navegación interna, y todos
  los colores migrados a los tokens de `index.css` (`bg-canvas`/`bg-surface`,
  `text-primary`/`text-primary-hover`, `text-text`/`text-text-muted`,
  `border-border`, `shadow-elevation-*`) — un grep final de
  `cyan-|blue-[0-9]|gray-[0-9]|red-[0-9]00|#[0-9a-f]{3,6}` sobre los 8 archivos
  salió limpio.
- Alias `@/` configurado de verdad (`vite.config.ts` **y** `tsconfig.app.json`,
  los dos, a diferencia de referencias externas que solo lo hacen a medias) y
  aplicado en los 24 archivos que este encargo tocó (imports que "suben" varios
  niveles `../../..`; los imports entre archivos vecinos de una misma carpeta
  chica se dejaron relativos a propósito). El resto del proyecto (~48 archivos)
  queda con imports relativos para una pasada futura aparte.
- `frontend/src/user/Dropdown.tsx` borrado (confirmado sin importadores).
- Bug cosmético preexistente corregido de pasada: el dropdown de notificaciones
  en el menú mobile se salía de la pantalla por la izquierda (heredaba el mismo
  posicionamiento `absolute` del dropdown desktop, que no cabe en un panel
  angosto) — ahora se ancla al contenedor del panel mobile en vez de al botón.

**Qué NO se tocó (fuera de alcance, documentado):** `HomeUser.tsx` (sigue
siendo Día 11), `admin/`, `autenticacion/`, los enlaces rotos del Footer
(`/products`, `/testimonials`, etc. no son rutas reales — deuda señalada, no
arreglada hoy), migración de `services/` por recurso, renombre de carpetas por
rol a `features/`.

**Bug preexistente encontrado y señalado (no corregido, fuera de alcance):**
`DELETE /api/carrito/{iduser}` devuelve 405 cuando el carrito ya está vacío al
cerrar sesión (el backend solo tiene mapeado `DELETE /api/carrito/eliminar/{id}`,
no `DELETE /api/carrito/{id}`); está envuelto en `try/catch` en el frontend así
que no rompe la UI, pero es deuda real del contrato HTTP del backend.

**Qué probar (se suma a lo de Categorías/Marcas para el cierre único del Día
4):** login/logout como cliente y como admin, las 9 páginas de cliente con el
Header/Footer nuevo, los 3 dropdowns (usuario/carrito/notificaciones) abriendo
y cerrando en desktop y en el menú mobile, fusión de carrito (local+BD) y
guardado al salir, notificaciones (llegada, marcar leída, polling), navegación
interna sin recarga completa de página, responsive en 3 anchos
(375/768/1440).

**Cierre real de este bloque:** el líder se quedó atascado reintentando a
ciegas la prueba del dropdown de carrito/notificaciones en el navegador
automatizado (6 intentos fallidos seguidos, sin converger) y hubo que
cortarlo; la verificación final de punta a punta la terminé yo directamente,
contra la base local del dueño (usuario cliente y admin de prueba creados y
borrados por SQL), con el sistema arrancado igual que siempre
(`iniciar_sistema.bat`). Confirmado en el navegador real: login/logout
cliente y admin (los guards movidos a `router/` siguen redirigiendo bien),
agregar producto al carrito desde `ProductoDetails.tsx` y verlo reflejado en
el dropdown con imagen/precio/controles, dropdown de notificaciones con una
notificación de prueba real (título, mensaje, "hace unos segundos"), menú de
usuario, y el navbar/Tienda con el diseño nuevo consistente en escritorio y
mobile (incluido el drawer de filtros).

**Un bug real más, encontrado en esta verificación final (no lo había
agarrado nadie antes, es justo lo que tenía atascado al líder):** en el menú
mobile, el badge rojo del contador de notificaciones (`w-5 h-5`, anclado
`top-0 right-0`) tapaba casi por completo el ícono de la campana (16px,
centrado en un botón de 36px) — visualmente parecía que el ícono no existía.
Corregido en `NotificationsMenu.tsx`, `CartMenu.tsx` y el botón de carrito de
`HeaderMobileMenu.tsx`: el badge pasa de `top-0 right-0` a `-top-1 -right-1`
(se asoma por fuera de la esquina del botón, patrón estándar de badge de
contador) — confirmado visualmente en el navegador tras el cambio. `seguridad`
revisó Header/Footer/hooks/guards/layout antes de este último fix — sin
hallazgos bloqueantes (el único punto señalado, el patrón de IDOR por id sin
verificar dueño en el cliente, es diseño preexistente del proyecto, no algo
que este cambio introdujo; el candado real está del lado del backend, fuera
de este encargo). No se pidió `pruebas` — esto lo probaron el líder/frontend
y, en la parte final, yo mismo directamente en navegador; no es una revisión
de un tercero ajeno a la implementación.

## Día 5 — Productos

- **Problema real:** en electrónica el detalle técnico (RAM, almacenamiento,
  procesador) decide la compra — specs poco claras hacen que el comprador se
  vaya a comparar a otro sitio; sin control de quién edita precio/stock, el
  negocio pierde control de su catálogo y de su plata.
- **Hallazgos de seguridad:** `ProductoController` sin control de rol en
  escritura — restringir a `ROLE_ADMIN`; `/uploads/**` también está en
  `permitAll()` sin distinción — confirmar que la subida de imágenes de
  producto valida tipo de archivo (solo imágenes) y tamaño máximo, no solo
  que exista el archivo (riesgo de subir un ejecutable disfrazado).
- **Patrón + qué se construye:** `Tienda.tsx`/`ProductoDetails.tsx` con
  `Card` `elevation-2` para la tarjeta de producto; specs en tabla de dos
  columnas con `font-body`. **Estructura (no solo color):** el sidebar de
  filtros fijo de `Tienda.tsx` pasa a chips compactos + drawer en mobile
  (nunca una fila fija que corte chips, deben envolver o colapsar en "+n");
  en `ProductoDetails.tsx`, las specs técnicas dejan de ser una pestaña más
  entre otras — pasan a sección visible inmediatamente debajo de
  galería/compra, sin clic extra (patrón confirmado comparando con una
  marca real de electrónica premium, ver `IDENTIDAD_VISUAL.md`).
  `ProductosAdmin.tsx` reemplaza los 8+ combos de badges sueltos por el
  `Badge` único del Día 1. **Calificación real en el
  catálogo:** hoy `Tienda.tsx` no muestra ninguna estrella — se agrega
  `calificacionPromedio` y `totalResenas` calculados en el backend
  (`ProductoService`, consulta agregada sobre comentarios aprobados, no en
  el navegador por cada tarjeta) y se exponen en `ProductoDTO`, visibles en
  la tarjeta de catálogo y reutilizados en `ProductoDetails.tsx` (que hoy lo
  recalcula aparte en el cliente — se deja ese cálculo server-side como
  única fuente de verdad). **Stock real:** `Badge` de "poco stock" cuando
  `stock > 0 && stock <= 5`, y "agotado" cuando `stock == 0` — umbral fijo,
  no decorativo, usado igual en `Tienda.tsx`, `ProductoDetails.tsx` y
  `ProductosAdmin.tsx`. **Movimiento:** la tarjeta de producto eleva su
  sombra (`elevation-1` → `elevation-2`) y escala levemente al pasar el
  mouse/tocar (`transform: scale`, nunca `width`/`height`); el selector de
  imágenes en `ProductoDetails.tsx` hace crossfade entre fotos en vez de
  salto directo; el grid del catálogo entra con un fade+slide escalonado
  (stagger corto) la primera vez que carga.
- **Prueba:** crear producto con imagen, specs y precio de punta a punta;
  subir un archivo no-imagen → rechaza; catálogo sigue siendo visible sin
  sesión; la calificación mostrada en la tarjeta de catálogo coincide con el
  promedio real de reseñas aprobadas de ese producto; bajar el stock de un
  producto a 3 y a 0 y confirmar que el badge cambia en las tres pantallas.

**Cierre real del Día 5:** backend con 127 pruebas pasando (incluye las 2
nuevas que prueban la validación de imagen: un archivo de texto disfrazado
de `.jpg` se rechaza, una imagen JPEG real se acepta con nombre solo
UUID). Verificado en vivo contra la base local del dueño: creé un producto
real con imagen (vía backend directo, el formulario del navegador
automatizado no permite adjuntar archivos — confirmado que el administrador
sí puede hacerlo normal desde el navegador real), con categoría, marca y una
especificación técnica. Confirmado en los 3 anchos y en las 3 pantallas:
- Tienda: chips de categoría **y marca** (antes la marca eran radios),
  estrellas con la calificación real del backend, badge de stock.
- `ProductoDetails.tsx`: specs técnicas visibles de inmediato, sin pestaña
  extra; calificación y badge de stock iguales a los de Tienda; botón
  "Añadir al carrito" deshabilitado cuando está agotado.
- `ProductosAdmin.tsx`: migrado al patrón `Card`/`Badge`/`Button`/`Input`,
  columna de stock con el mismo `Badge` compartido (`getStockBadge`).

Subí el stock del producto de prueba a 3 y a 0 **a través del endpoint real
de actualizar** (no con un `UPDATE` directo a la base, que no limpia la
caché del backend y deja viendo datos viejos — detalle a tener en cuenta
para pruebas futuras de Producto) y confirmé que el badge cambia a "Poco
stock"/"Agotado" en las tres pantallas. Archivo de texto disfrazado de
`.jpg` → rechazado (400, revisa los bytes reales); sin sesión admin →
rechazado (401). Datos de prueba borrados al terminar.

**Bug real encontrado hoy, no corregido (preexistente, fuera de alcance del
Día 5):** `ProductoDetails.tsx` recibe el producto completo por
`location.state` de react-router al navegar desde `Tienda.tsx`, **no vuelve
a pedirlo al backend por su id**. Si alguien recarga la página, entra por un
enlace directo o lo comparte, `state` viene vacío y la pantalla muestra
"Producto no encontrado" sin forma de recuperarse salvo volver al inicio —
confirmado reproduciéndolo (recargar `/tienda/producto/:id` rompe la
pantalla). No es algo que el Día 5 haya introducido (ninguno de los cambios
de hoy tocó cómo llega el dato), pero es un hueco real de experiencia de
usuario que conviene resolver: agregar un `GET /api/productos/{id}` al
backend (hoy `ProductoController` no tiene uno — solo `/listarAll` y
`/filtrar`) y que `ProductoDetails.tsx` lo use como respaldo cuando
`location.state` viene vacío.

## Día 6 — Favoritos y Comparador de Productos + Carrito

### Módulo: Favoritos y Comparador de Productos — pantallas nuevas

- **Problema real:** en electrónica, decidir entre dos o tres laptops o
  celulares parecidos es difícil sin ver las specs lado a lado — hoy el
  comprador abre pestañas de otras tiendas para comparar y ahí se pierde la
  venta. Y sin una forma de "guardar para después", un comprador indeciso
  cierra la pestaña y probablemente no vuelve — confirmado que ninguna de
  las dos cosas existe hoy en el proyecto (ni pantalla ni endpoint).
- **Hallazgos de seguridad del módulo (nuevo, aplicar el criterio desde el
  inicio en vez de repetir errores de otros módulos):** el nuevo
  `FavoritoController` debe exigir sesión y sacar el `idUsuario` del token
  JWT, nunca del path/body — exactamente el error de IDOR que tiene
  `CarritoController` (se corrige en el otro módulo de este mismo día); acá
  se evita desde el diseño. Los endpoints de comparación son de solo
  lectura sobre datos públicos (specs de producto).
- **Cambios de modelo:** migración Flyway de este día — nueva tabla
  `favorito` (`id_usuario`, `id_producto`, `fecha_agregado`, clave única
  `(id_usuario, id_producto)` para que no se pueda duplicar).
- **Patrón + qué se construye:** ícono de corazón (toggle real, guardado en
  el backend — no en `localStorage`, para que persista entre dispositivos)
  en `ProductoDetails.tsx` y en las tarjetas de `Tienda.tsx`; nueva pantalla
  `Favoritos.tsx` con la lista guardada, mismo `Card`/`Badge` del catálogo;
  nueva pantalla `ComparadorProductos.tsx` — selector de hasta 3 productos,
  tabla comparativa de especificaciones (`Especificacion`) lado a lado,
  resaltando con `color-accent` la mejor cifra de cada fila (ej. más RAM,
  más almacenamiento). **Movimiento:** el corazón de favoritos hace un
  "pop" (escala 1 → 1.3 → 1) al marcarse, con un pequeño destello de color
  — el tipo de micro-feedback que confirma la acción sin un toast aparte;
  las columnas del comparador entran con stagger al agregar un producto.
- **Prueba:** marcar/desmarcar un favorito y confirmar que persiste tras
  recargar y tras cerrar sesión y volver a entrar en otro navegador (prueba
  de que vive en el backend, no en `localStorage`); comparar 3 productos y
  confirmar que las specs mostradas coinciden con las de cada
  `ProductoDetails.tsx`; Usuario A no puede ver los favoritos de Usuario B
  cambiando el id en la URL.

### Módulo: Carrito

- **Problema real:** si el carrito de un cliente se mezcla con el de otro,
  puede terminar comprando algo que no eligió — pérdida de confianza
  inmediata.
- **Hallazgos de seguridad:** `CarritoController` — **IDOR confirmado** en
  sus 3 endpoints (`GET /api/carrito/{idUsuario}`,
  `DELETE /api/carrito/eliminar/{idUsuario}`, `POST /api/carrito/guardar`):
  ninguno verifica que el `idUsuario` de la URL/body coincida con la sesión
  autenticada. Se corrige extrayendo el id del usuario del token JWT, no del
  path/body. Mensajes de error con `e.getMessage()` expuestos en los 3
  métodos — generalizar.
- **Patrón + qué se construye:** `CarritoDetalle.tsx` con `Card` por ítem,
  `Badge` de "stock limitado" si aplica, botón "Finalizar compra" sticky en
  mobile. **Movimiento:** al agregar un producto desde `Tienda.tsx`/
  `ProductoDetails.tsx`, el ícono del carrito en el header rebota y el
  contador cambia con un pequeño "pop" (confirma la acción sin salir de la
  pantalla); quitar un ítem del carrito lo desliza hacia afuera antes de
  desaparecer, en vez de saltar instantáneo.
- **Prueba:** agregar/quitar productos, persiste tras recargar; Usuario A
  intenta pedir el carrito de Usuario B cambiando el id → 403/404; logout
  limpia el carrito local (confirmar el fix del Día 2).

## Día 7 — Métodos de Pago: pasarelas reales (Culqi + Mercado Pago) + Yape/Plin/transferencia manual

- **Problema real:** hoy el "pago" es 100% manual (confirmado en el código:
  `CheckoutPago.tsx` solo pinta los datos de `MetodoPago.configAdicional` —
  número de Yape, cuenta BCP, etc. — y el cliente sube una foto/PDF de
  comprobante; `PedidoController.registrar` solo guarda ese archivo, no hay
  ningún SDK de pagos en `pom.xml`/`package.json`). Eso significa: nadie
  puede pagar con tarjeta de verdad, cada pedido queda "pendiente de
  verificación" hasta que un humano revise el comprobante a mano (lento, no
  escala, y un comprador que quiere pagar YA con su tarjeta simplemente se
  va). Un ecommerce real de electrónica (ticket alto) necesita poder cobrar
  con tarjeta al instante.
- **Decisión de alcance:** se integran **Culqi y Mercado Pago** (las dos
  pasarelas más usadas por negocios chicos en Perú) para pago con tarjeta,
  **en modo sandbox/pruebas** — sin RUC todavía no se pueden recibir cobros
  reales, pero el código queda 100% real y conectado contra la API de ambas
  pasarelas (igual que se hizo el login social en CAR_WASH: funciona de
  verdad, solo con llaves de prueba hasta que existan las reales). **Se
  mantiene Yape/Plin/transferencia manual** como alternativa aparte (sin
  comisión de pasarela), tal como está hoy pero con las correcciones de
  seguridad de este día.
- **Cambios de modelo necesarios** (se escriben como migración Flyway de
  este día, usando el sistema del Día 1): `MetodoPago` gana un campo `tipo`
  (`MANUAL` | `PASARELA`) y `proveedor` (`CULQI` | `MERCADOPAGO` | null si es
  manual); `Pedido` gana `idTransaccionPasarela`, `estadoPagoPasarela`,
  `moneda` (default `PEN`).
- **Hallazgos de seguridad del módulo:**
  - `MetodoPagoController` sin control de rol — restringir
    `POST`/`PUT`/`DELETE` a `ROLE_ADMIN` (el catálogo de métodos, incluidas
    las llaves públicas de cada pasarela, no se edita desde el cliente).
  - **Nunca** la llave privada/secreta de Culqi o Mercado Pago va al
    frontend ni se guarda en `MetodoPago.configAdicional` (que hoy es un
    TEXT libre visible en cualquier GET público) — las llaves secretas viven
    solo en variables de entorno del backend (`CULQI_SECRET_KEY`,
    `MERCADOPAGO_ACCESS_TOKEN`), nunca en una tabla que un endpoint público
    pueda devolver. Solo las llaves **públicas** (`CULQI_PUBLIC_KEY`,
    `MERCADOPAGO_PUBLIC_KEY`) se exponen al frontend, vía `.env` del
    frontend, no hardcodeadas.
  - El endpoint que confirma un pago (webhook de la pasarela) debe validar
    la firma/autenticidad de la notificación (Culqi y Mercado Pago firman
    sus webhooks) — nunca confiar en un `estado: "pagado"` que venga del
    propio frontend sin validarlo contra la pasarela.
- **Patrón + qué se construye:**
  - `MetodosPagoAdmin.tsx`: tabla con `Badge` activo/inactivo y un `Badge`
    de tipo (Pasarela/Manual); el admin ya no escribe llaves secretas acá,
    solo activa/desactiva qué aparece en checkout.
  - `CheckoutPago.tsx`: al elegir un método tipo `PASARELA`, se muestra el
    widget oficial embebido de esa pasarela (Culqi.js o el Brick de Mercado
    Pago) que tokeniza la tarjeta en el navegador del cliente — el número de
    tarjeta **nunca** toca nuestro backend, solo el token. Al elegir un
    método manual, sigue el flujo actual (datos + subir comprobante).
- **Prueba:** pagar un pedido de prueba con tarjeta de prueba de Culqi y de
  Mercado Pago (cada pasarela publica números de tarjeta de prueba para
  sandbox) de punta a punta, confirmando que el pedido pasa a "pagado" solo
  cuando la pasarela confirma, no antes; pagar con el flujo manual
  (Yape/transferencia + comprobante) y confirmar que sigue funcionando
  igual que hoy; confirmar que ninguna llave secreta aparece en las
  respuestas del API ni en el código del frontend (buscar en el bundle
  compilado); sin sesión admin, no se puede editar el catálogo de métodos.

## Día 8 — Métodos de Envío + Comentarios/Reseñas + Testimonios

### Módulo: Métodos de Envío

- **Problema real:** sin claridad de costos/tiempos de envío, el comprador
  abandona el carrito justo en el último paso — el abandono de checkout es
  de los problemas más caros en un ecommerce real.
- **Hallazgos de seguridad:** `MetodoEnvioController` sin control de rol —
  restringir escritura a `ROLE_ADMIN`.
- **Patrón + qué se construye:** `MetodosEnvioAdmin.tsx` con tabla + `Badge`;
  en `CheckoutPago.tsx`, opciones de envío con costo y tiempo estimado bien
  visibles (`font-heading` para el costo).
- **Prueba:** activar/desactivar método de envío; checkout muestra solo los
  activos con costo/tiempo claros.

### Módulo: Comentarios / Reseñas

- **Problema real:** las reseñas son la prueba social que decide una compra
  de $800 sin haber tocado el producto — si se pueden falsificar o no
  moderar rápido, el catálogo entero pierde credibilidad.
- **Hallazgos de seguridad:** `PUT /api/comentarios/estado_update/{idProducto}/{idComentario}`
  aprueba/rechaza reseñas **sin chequeo de rol** — se restringe a
  `ROLE_ADMIN`; revisar que no se use `dangerouslySetInnerHTML` para el
  texto de reseñas en `ProductoDetails.tsx`.
- **Patrón + qué se construye:** estrellas de calificación con los tokens de
  color, usando el mismo `calificacionPromedio` calculado en el backend del
  Día 5 (no un cálculo distinto acá); `ReviewsProductosAdmin.tsx` con
  `Badge` pendiente/aprobado/rechazado consistente con el resto del admin.
- **Prueba:** dejar reseña, aprobarla como admin, verificar que aparece en
  `ProductoDetails.tsx`; aprobar sin sesión admin → rechaza.

### Módulo: Testimonios

- **Problema real:** testimonios falsos atribuidos a clientes reales dañan
  la marca del negocio completo, no solo un producto puntual.
- **Hallazgos de seguridad:** `POST /api/testimonios/crear/{idUsuario}` crea
  un testimonio a nombre de cualquier `idUsuario` sin verificar sesión — se
  corrige exigiendo que coincida con la sesión autenticada;
  `PUT /api/testimonios/estado_update/{idTestimonio}` sin chequeo de rol —
  se restringe a `ROLE_ADMIN`.
- **Patrón + qué se construye:** `TestimoniosAdmin.tsx` con `Badge`
  consistente; tarjeta de testimonio en `HomeUser.tsx` con `Card`
  `elevation-1`.
- **Prueba:** crear testimonio propio, aprobarlo como admin, verlo en Home;
  crearlo a nombre de otro `idUsuario` → rechaza.

## Día 9 — Checkout / Pedidos / Ventas (incluye pantalla de pago fallido)

- **Problema real:** este es el módulo de mayor riesgo (446 líneas el
  controller, 348 el service) — si el cliente no ve claro el estado de su
  pedido, escribe a soporte por algo que la pantalla debería responder sola;
  si cualquiera puede cambiar el estado de un pedido ajeno o verlo, es
  fraude directo. Además, hoy el checkout **no tiene ninguna pantalla para
  cuando la tarjeta es rechazada** (confirmado: `CheckoutPago.tsx` no maneja
  ese caso) — un comprador que ve un error genérico o la pantalla en blanco
  tras un rechazo simplemente se va, sin intentar otro método.
- **Hallazgos de seguridad:**
  - `PATCH /api/pedidos/{idPedido}/estado`: **sin chequeo de rol** —
    cualquiera marca cualquier pedido como "entregado"/"cancelado". Se
    restringe a `ROLE_ADMIN`.
  - `GET /api/pedidos/por-estado`: lista pedidos de **todos** los clientes
    sin filtrar ni exigir rol — se restringe a `ROLE_ADMIN`.
  - `GET /api/pedidos/{idPedido}` y `GET /api/pedidos/usuario/{iduser}/filtro`:
    **IDOR confirmado** — un cliente puede ver el pedido de otro cambiando
    el id. Se corrige: si el rol es cliente, el id consultado debe coincidir
    con su propia sesión; el admin sigue viendo cualquiera.
  - Mensajes de error con `e.getMessage()` crudo en varios catch del
    controller — generalizar.
  - Limpieza de clases muertas del sistema "Venta" viejo: `CheckoutDTO`,
    `ItemCompraDTO`, `VentaDTO`, `DetalleVentaDTO` — se eliminan aquí.
- **Patrón + qué se construye:** `CheckoutPago.tsx` con pasos claros
  (dirección → pago/envío → confirmación), `Card` `elevation-2` por paso,
  resumen de orden siempre visible, y el paso de pago usando ya el widget de
  Culqi/Mercado Pago del Día 7 cuando el método elegido es de pasarela.
  **Pantalla de pago fallido (nueva):** cuando la pasarela rechaza la
  tarjeta, un estado dedicado dentro del checkout muestra el motivo si la
  pasarela lo entrega (fondos insuficientes, tarjeta inválida, etc.) y un
  botón para reintentar con otro método, sin perder el carrito ni los datos
  de envío ya ingresados. `MisPedidos.tsx`/`DetallePedido.tsx` con `Badge`
  de estado (pendiente/pagado/enviado/entregado/cancelado) en los 5 colores
  semánticos, distinguiendo si el pago fue por pasarela (con el id de
  transacción visible) o manual (con el comprobante subido);
  `PedidosAdmin.tsx`/`DetallePedidoAdmin.tsx` con línea de tiempo de
  estados, `font-heading` para el estado actual, y quita el degradado
  azul→cian de su encabezado (color sólido + elevación). **Movimiento:** cada paso
  del checkout entra con slide horizontal (avanza a la derecha, retrocede a
  la izquierda — refuerza en qué paso está sin leer el breadcrumb); al
  confirmarse un pago exitoso, un check animado (dibujo del trazo, no un
  ícono estático) antes de redirigir a `DetallePedido.tsx`; el estado de
  pago fallido entra con un shake corto para que se note que algo salió mal
  sin ser alarmante.
- **Prueba:** comprar de punta a punta con pago por pasarela (tarjeta de
  prueba) y con pago manual (comprobante); usar una tarjeta de prueba de
  rechazo (Culqi y Mercado Pago también publican tarjetas que fallan a
  propósito) y confirmar que se ve la pantalla de pago fallido, clara, sin
  perder el carrito; cambiar estado como admin y ver el cambio reflejado en
  el cliente; ver/filtrar pedido ajeno como cliente → rechaza; `/por-estado`
  ya no responde sin sesión de admin; confirmar que un pedido pagado por
  pasarela no se puede marcar "pagado" a mano sin que haya una transacción
  real detrás.

## Día 10 — Notificaciones + Marco del Panel Admin + Reportes con gráficos

### Módulo: Notificaciones

- **Problema real:** si el cliente no ve que su pedido cambió de estado,
  vuelve a escribir a soporte por algo que ya pasó — costo de atención
  evitable.
- **Hallazgos de seguridad:** `GET /api/notificaciones/pendientes/{iduser}`
  y `PUT /api/notificaciones/marcar-leido/{id}` — **IDOR confirmado**, no
  verifican dueño (el payload además filtra nombre/apellido del dueño real
  de la notificación). Se corrige extrayendo el usuario del token y
  verificando propiedad antes de marcar como leída.
- **Patrón + qué se construye:** campanita de notificaciones en
  `Header.tsx`/`HeaderAdmin.tsx` con contador y `Badge` de no leídas.
  **Movimiento:** al llegar una notificación nueva, la campanita vibra
  sutilmente (rotación corta de ida y vuelta) y el contador aparece con un
  "pop", no un salto directo del número.
- **Prueba:** generar notificación (ej. del Día 9) y verla en la campanita;
  Usuario A intenta marcar como leída una notificación de Usuario B → rechaza.

### Módulo: Marco del Panel Admin (menú lateral, encabezado, dashboard) + Reportes con gráficos — pantalla nueva

- **Problema real:** si el panel admin no transmite "herramienta de trabajo
  seria", un empleado nuevo no confía en usarlo para operaciones reales
  (cambiar precios, aprobar pedidos). Además, el dueño no puede ver
  tendencias (ventas de los últimos días, qué productos se venden más) sin
  revisar la base de datos a mano — confirmado que `recharts` está
  instalado en `package.json` pero no se usa en ningún archivo del
  proyecto: la herramienta está, la pantalla no.
- **Hallazgos de seguridad (checkpoint transversal del panel admin
  completo):** confirmar que cada ruta de escritura de los módulos ya
  tocados (Días 3–9) efectivamente exige `ROLE_ADMIN` en el **backend**, no
  solo que el frontend oculte el botón; los nuevos endpoints de reportes
  (agregaciones de ventas) también exigen `ROLE_ADMIN`, ya que exponen
  cifras del negocio.
- **Patrón + qué se construye:**
  - `SidebarAdmin.tsx`/`HeaderAdmin.tsx`/`Layout.tsx` con los tokens de
    marca aplicados y estado activo de navegación consistente — quita el
    ícono de icons8 (logo "tigre") de `SidebarAdmin.tsx`, pasa a wordmark;
    `HomeAdmin.tsx` (dashboard) con métricas reales destacadas (pedidos de
    hoy, productos con poco stock) en `font-heading` para los números
    grandes, sin el degradado azul→cian de su encabezado actual.
  - **`ReportesAdmin.tsx` (nueva):** gráfico de línea de ventas de los
    últimos 30 días y gráfico de barras de productos más vendidos, con
    `recharts`, alimentados por endpoints de agregación reales (`GROUP BY`
    fecha, `SUM` de `montoTotal` sobre pedidos pagados) — nunca datos de
    ejemplo. **Movimiento:** las barras/la línea del gráfico se dibujan al
    entrar (animación nativa de `recharts`, no desactivada), y el ítem del
    menú activo en `SidebarAdmin.tsx` desliza su indicador en vez de
    saltar directo entre secciones.
- **Prueba:** recorrer el panel admin completo confirmando que cada acción
  de escritura exige el rol correcto; el dashboard muestra datos reales;
  generar algunos pedidos pagados de prueba y confirmar que el gráfico de
  ventas los refleja, comparando contra una suma manual de verificación.

## Día 11 — Sitio Público / Home + páginas legales + 404 + cierre final

- **Problema real:** la home es la primera impresión — hoy mezcla azul e
  índigo sin coherencia (confirmado en `HomeUser.tsx`), lo que se lee como
  "sitio armado rápido, no un negocio serio". Además, no existen páginas
  legales (confirmado: no hay `Terminos.tsx`/`Privacidad.tsx`/
  `Devoluciones.tsx`) — son obligatorias para operar de verdad con
  Culqi/Mercado Pago, y sin una política de devoluciones clara (común en
  electrónica: 7 días de cambio) el comprador duda antes de pagar. Tampoco
  existe una página 404 propia. Y sin una revisión final de punta a punta,
  una corrección de seguridad de un día anterior puede tener un hueco
  suelto que nadie prueba hasta que alguien lo encuentra primero.
- **Hallazgos de seguridad (cierre transversal):**
  - Confirmar que `SecurityConfig.java` quedó con la matriz completa
    decidida en el Día 1 (público / autenticado+dueño / `ROLE_ADMIN`) sin
    ningún `permitAll()` olvidado de los módulos tocados.
  - Confirmar que `CorsConfig.java` ya no tiene `allowedOrigins("*")`.
  - Confirmar que los mensajes de error genéricos quedaron aplicados en
    todos los controllers tocados.
  - Dejar documentado (se ejecuta en el Día 12): agregar pruebas
    automáticas reales antes de un deploy serio.
- **Deuda técnica de días anteriores a corregir aquí:**
  - `ProductoDetails.tsx` (Día 5) recibe el producto por `location.state` de
    react-router, pasado desde `Tienda.tsx` al navegar — **nunca vuelve a
    pedirlo al backend por su id**. Recargar la página, entrar por un enlace
    directo o compartirlo muestra "Producto no encontrado" sin forma de
    recuperarse. Se agrega `GET /api/productos/{id}` a `ProductoController`
    (hoy solo tiene `/listarAll` y `/filtrar`) y `ProductoDetails.tsx` lo usa
    como respaldo cuando `location.state` viene vacío.
- **Patrón + qué se construye:** `HomeUser.tsx` unifica toda la paleta a
  `color-primary`/`color-accent` (quita la mezcla azul/índigo) **y
  reestructura el orden de secciones** (ver `IDENTIDAD_VISUAL.md`): hero de
  una sola pieza en vez de carrusel automático; se quita la sección
  "Ofertas relámpago" con countdown (presión artificial sin fecha real, y el
  patrón más repetido de plantilla ecommerce) a favor de "Más
  vendidos"/"Recomendados" con datos reales; se quita la clase ajena
  `font-samsung-one` de la sección de testimonios (resto de otra
  plantilla). `Header.tsx`/`Footer.tsx`/`Dropdown.tsx` con `font-heading`
  en el wordmark (se quita el ícono de icons8 y se corrige el texto de
  marca de "TechShop" a "TechStore"); `Nosotros.tsx`/`Contacto.tsx` con el
  mismo sistema de `Card`/`FormField` del resto de la app. **Nuevas:**
  `Terminos.tsx`,
  `Privacidad.tsx`, `Devoluciones.tsx` con contenido real y específico del
  negocio (política de cambio de 7 días para electrónica, qué datos se
  guardan y por qué, condiciones de uso), enlazadas desde `Footer.tsx`;
  `NotFound.tsx` (404) con el mismo sistema visual para cualquier ruta que
  no exista.
- **Prueba:** navegar la app completa (visitante → cliente → admin)
  confirmando consistencia visual; repetir manualmente los ataques de IDOR
  ya corregidos en Días 2, 6, 9 y 10 para confirmar que ninguno se volvió a
  abrir por un cambio de otro día; entrar a una ruta inexistente y ver la
  página 404 con el estilo de la marca, no un error en blanco; confirmar
  que los links del footer a Términos/Privacidad/Devoluciones funcionan;
  recargar la página de un producto (`/tienda/producto/:id`) directo y
  confirmar que ya no dice "Producto no encontrado".

## Día 12 — Despliegue a producción

Este día no es de pantallas — es dónde se pone en vivo todo lo que ya se
construyó (incluida la base de datos versionada con Flyway desde el Día 1).
Va al final porque recién tiene sentido cuando hay algo terminado que
mostrar, y porque los webhooks de pago del Día 7 **necesitan una URL
pública**, algo que no existe hoy (todo corre en `localhost`).

**Pendientes de seguridad heredados del Día 2 (revisar antes de abrir al público):**
- Sin segundo factor (decisión del dueño), las cuentas admin dependen solo
  de su contraseña: usar claves largas y únicas para cada admin real
  **antes** de exponer el sistema.
- Los límites de intentos por IP usan la IP de la conexión. Si el backend
  queda detrás de un proxy (Nginx, el del proveedor), configurar
  `server.forward-headers-strategy` con el proxy de confianza; si no, todos
  los usuarios comparten IP y un atacante puede bloquear el login de todos
  (429 por 15 min).
- El código de "olvidé mi contraseña" (`reset_code`, 6 dígitos, expira y
  admite 5 fallos) se guarda legible en la base. Quien pudiera leer la base
  podría usarlo durante su vigencia; guardarlo con hash (HMAC con clave del
  servidor, porque 6 dígitos con un hash simple se adivinan al instante).

### Dónde correr esto en producción (hoy no hay nada preparado — ni Docker ni config de ningún proveedor)

Como esto va al portafolio y aún no hay RUC, se propone empezar en capas
gratuitas/baratas, reales, sin tarjeta de empresa:

| Pieza | Opción recomendada | Por qué |
|---|---|---|
| Base de datos | **Neon** o **Supabase** (Postgres administrado, capa gratuita real) | Nada que instalar, backups automáticos, URL de conexión lista para producción. |
| Backend (Spring Boot) | **Render** (Web Service, capa gratuita) | Despliega directo desde GitHub, variables de entorno en su panel, URL pública HTTPS (necesaria para los webhooks de Culqi/Mercado Pago). |
| Frontend (Vite/React) | **Vercel** o **Netlify** | Despliega el build de `npm run build` directo desde GitHub, dominio gratis con HTTPS. |

Esto da un link real para el portafolio (no solo código), y ya deja la URL
pública que los webhooks de pago necesitan para confirmar un cobro real
cuando llegue el RUC.

### Qué NO se hace en este plan (documentado, no ejecutado)

- No se compra dominio propio ni se configura DNS — se usa el subdominio
  gratis que da Render/Vercel.
- No se activan llaves reales de Culqi/Mercado Pago (necesitan RUC) — se
  deja todo listo para que ese cambio sea solo reemplazar las variables de
  entorno.
- No se monta un pipeline de CI/CD elaborado — el despliegue automático que
  ya trae Render/Vercel al conectar el repo de GitHub es suficiente para
  esta etapa.

### Prueba del Día 12
Migraciones de Flyway corren limpias desde una base vacía (recrean todo el
esquema actual + todos los campos nuevos agregados en el plan); la app
desplegada en Render + Vercel + Neon/Supabase carga igual que en local; un
webhook de prueba (Culqi/Mercado Pago tienen un botón de "enviar evento de
prueba" en su panel) llega a la URL pública del backend desplegado y
actualiza el estado del pedido correspondiente.

## Archivos críticos

- `backend/src/main/java/com/ecommerce/backend/config/SecurityConfig.java`
- `backend/src/main/java/com/ecommerce/backend/config/CorsConfig.java`
- `backend/src/main/java/com/ecommerce/backend/service/JWTUtils.java`
- `backend/src/main/java/com/ecommerce/backend/controller/{Usuario,Carrito,Pedido,Notificacion,Comentario,Testimonio,Categoria,Marca,MetodoPago,MetodoEnvio,Producto}Controller.java`
- `backend/src/main/java/com/ecommerce/backend/controller/{Favorito,Reporte}Controller.java` (nuevos)
- `backend/src/main/java/com/ecommerce/backend/entity/{MetodoPago,Pedido,Usuario,Favorito}.java` (campos nuevos de pasarela y la entidad Favorito)
- `backend/src/main/resources/application.properties` (+ `application-prod.properties` nuevo)
- `backend/src/main/resources/db/migration/` (nuevo: scripts Flyway)
- `backend/pom.xml` (agregar Flyway + SDK de Mercado Pago; quitar `mysql-connector-j`)
- `frontend/src/index.css` (tokens `@theme`)
- `frontend/src/components/ui/` (nuevo: `Button`, `Badge`, `Card`, `FormField`)
- `frontend/src/lib/api.ts` (nuevo: cliente HTTP centralizado con `VITE_API_BASE_URL`)
- `frontend/src/user/pages/CheckoutPago.tsx` (widget de Culqi/Mercado Pago + pantalla de pago fallido)
- `frontend/src/user/pages/{Favoritos,ComparadorProductos,Terminos,Privacidad,Devoluciones}.tsx` (nuevas)
- `frontend/src/admin/pages/{UsuariosAdmin,ReportesAdmin}.tsx` (nuevas)
- `frontend/src/NotFound.tsx` (nueva, 404)

## Cómo se ejecuta esto (equipo y flujo)

Por el tamaño (12 días en total), cada día se reparte igual que el resto del
trabajo en este proyecto: se entra por `lider`, que coordina `frontend`
(rediseño de las pantallas del día, usando `ui-ux-pro-max` para las
decisiones de diseño e `impeccable` para el pulido final de cada pantalla),
`backend` (correcciones de seguridad y endpoints del día) y pide a
`seguridad` que revise antes de dar el día por cerrado — `pruebas` corre lo
que aplique, incluyendo confirmar que el módulo se ve y funciona bien en
mobile, tablet y escritorio. Se avanza un día a la vez; el checklist de
progreso al inicio del documento se marca `[x]` al cerrar cada uno, para
retomar sin releer todo.

## Verificación end-to-end

Para cada día: `iniciar_sistema.bat` levanta backend+frontend, se prueba el
flujo funcional del módulo del día en el navegador (no solo por API), se
repiten los intentos de ataque descritos en "Prueba" de ese día (cambiar ids
en la URL, llamar endpoints sin sesión/con otro rol vía curl o Postman), y se
confirma que no se rompió nada de días anteriores navegando la app completa
antes de marcar el día como cerrado en el checklist.
