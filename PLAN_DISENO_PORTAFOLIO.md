# Rediseño + auditoría de seguridad — "TechStore" (ecommerce de tecnología), por módulo y por día

## Progreso (actualizar al cerrar cada día — así se sabe cuál sigue sin releer todo)

- [ ] Día 1 — Fundamentos: tokens de diseño, piezas compartidas, seguridad transversal y base de datos versionada
- [ ] Día 2 — Autenticación (con multifactor de 3 factores)
- [ ] Día 3 — Usuarios/Perfil + Roles y Permisos + Gestión de Clientes (admin)
- [ ] Día 4 — Categorías + Marcas
- [ ] Día 5 — Productos
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

El dueño pidió que la seguridad se corrija **auditando módulo por módulo,
día por día**, con el espíritu del plan que se usó en el proyecto CAR_WASH
del mismo portafolio, con estos criterios propios para este proyecto:
1. La seguridad va **integrada en cada día**, junto al rediseño, como una
   sección más — no aparte.
2. **Los módulos grandes o de mayor riesgo van solos en su día**
   (Autenticación+MFA, Productos, Métodos de Pago, Checkout/Pedidos) — los
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
6. Autenticación con **3 factores reales** de categorías distintas
   (contraseña, Google Authenticator, verificación del dispositivo) — ver
   el Día 2.
7. **No es solo reacomodar las pantallas que ya existen con otra
   distribución** — se revisó qué le falta a un ecommerce real que hoy no
   existe en el proyecto, y se agregó como módulos nuevos (Favoritos y
   Comparador de Productos, Gestión de Clientes en el admin, Reportes con
   gráficos, pantalla de pago fallido, páginas legales, 404) — ver el mapa
   de pantallas más abajo.

### Por qué este sistema de diseño (verificado contra la base de datos de `ui-ux-pro-max`, no inventado)

Se descartó explícitamente todo lo que ya usó CAR_WASH (Material 3
Expressive, Bento Box Grid, Glassmorphism, Dark Mode OLED como base). Se
eligieron dos estilos **activos** de `styles.csv` que no se superponen:

| Estilo (ID) | Rol en este plan |
|---|---|
| **Dimensional Layering** (`dimensional-layering`) | Tarjetas de producto con profundidad real por elevación (`box-shadow` en 4 niveles) — una laptop/celular "flota" sobre el fondo en catálogo y detalle, sensación premium sin el look traslúcido de Glassmorphism. |
| **Minimalism & Swiss Style** (`minimalism-and-swiss-style`) | Grid tipográfico limpio y de alto contraste para checkout, perfil y panel admin — genera confianza (crítico para que alguien meta su tarjeta) sin verse "plano" porque se combina con la elevación de arriba. |

Se descartó a propósito "Vibrant & Block-based" (la recomendación genérica de
`products.csv` para `E-commerce`) porque es justo el estilo que reutilizan
las plantillas — el objetivo es que no se vea como una.

**Tipografía** (`typography.csv`, pareo real): *"Tech Startup"* — **Space
Grotesk** (headings) + **DM Sans** (body). Marcada en la base como
`Best For: Tech companies, startups, SaaS, developer tools, AI products`.

- Google Fonts: `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap`
- **Space Grotesk 700** — títulos de pantalla / precios grandes.
- **Space Grotesk 600** — encabezados de sección, nombres de producto en tarjeta.
- **Space Grotesk 500** — botones, labels de formulario.
- **DM Sans 400** — cuerpo de texto, descripciones, tablas.
- **DM Sans 500/700** — énfasis dentro de texto de cuerpo (precio inline, estado).

**Paleta** (adaptando `color.csv` de confianza B2B/fintech a un acento más
propio de producto tech, ya que no hay entrada exacta "ecommerce de
tecnología"):

**Claro (por defecto):**
| Uso | Valor |
|---|---|
| Fondo (canvas) | `#F8FAFC` |
| Superficie/tarjeta | `#FFFFFF`, borde 1px `#E2E8F0` |
| Elevación 1 (tarjeta reposo) | `box-shadow: 0 1px 3px rgba(15,23,42,0.08)` |
| Elevación 2 (tarjeta hover/producto destacado) | `box-shadow: 0 10px 24px -6px rgba(15,23,42,0.12)` |
| Elevación 3 (modal/panel flotante) | `box-shadow: 0 20px 40px -8px rgba(15,23,42,0.18)` |
| Texto principal | `#0F172A` |
| Texto secundario | `#475569` |
| Primario (marca/CTA) | `#2563EB` |
| Primario hover | `#1D4ED8` |
| Acento (precio, badges "oferta") | `#06B6D4` |
| Éxito (stock disponible, pedido entregado) | `#16A34A` |
| Advertencia (poco stock) | `#D97706` |
| Error/destructivo | `#DC2626` |

**Oscuro (opción activable, no la base):**
| Uso | Valor |
|---|---|
| Fondo (canvas) | `#0B1120` |
| Superficie/tarjeta | `#151E32`, borde 1px `rgba(255,255,255,0.08)` |
| Texto principal | `#F1F5F9` |
| Primario | `#3B82F6` |
| Acento | `#22D3EE` |

**Tokens de forma:** tarjetas de producto `rounded-2xl` (16px) con
elevación (nunca blur); inputs y botones `rounded-xl` (12px). Botón
primario: color sólido `#2563EB` (sin degradado — eso ya lo usó CAR_WASH) con
`box-shadow: 0 4px 12px rgba(37,99,235,0.25)` al hover.

**Anti-patrones a evitar:** nada de `backdrop-filter`/blur, nada de tonal
elevation ni state layers de Material, nada de grillas asimétricas tipo
bento — las tarjetas de producto son todas del mismo tamaño base, la
jerarquía se construye con elevación y tipografía.

**Nombre de marca:** se usa **"TechStore"** como placeholder (no existe
ningún nombre en el proyecto hoy — `index.html` sigue con el título por
defecto de Vite). Queda centralizado en pocos lugares (`index.html`,
`Header.tsx`, `Footer.tsx`, pantallas de auth) para poder cambiarlo en un
minuto cuando el dueño tenga el nombre real.

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
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

@theme {
  --font-heading: "Space Grotesk", sans-serif;
  --font-body: "DM Sans", sans-serif;

  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-accent: #06B6D4;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger: #DC2626;

  --color-surface: #FFFFFF;
  --color-canvas: #F8FAFC;
  --color-border: #E2E8F0;
  --color-text: #0F172A;
  --color-text-muted: #475569;

  --shadow-elevation-1: 0 1px 3px rgba(15,23,42,0.08);
  --shadow-elevation-2: 0 10px 24px -6px rgba(15,23,42,0.12);
  --shadow-elevation-3: 0 20px 40px -8px rgba(15,23,42,0.18);

  --radius-card: 1rem;
  --radius-control: 0.75rem;
}

.dark {
  --color-surface: #151E32;
  --color-canvas: #0B1120;
  --color-border: rgba(255,255,255,0.08);
  --color-text: #F1F5F9;
  --color-primary: #3B82F6;
  --color-accent: #22D3EE;
}
```

También: cambiar `<title>Vite + React + TS</title>` por "TechStore" en
`frontend/index.html`.

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
migración versionada en el momento** (ej. el Día 2 agrega las columnas de
MFA, el Día 6 la tabla de favoritos, el Día 7 las columnas de pasarela de
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

## Día 2 — Autenticación (con multifactor de 3 factores)

- **Problema real:** un comprador que no confía en que su contraseña está
  segura, o que ve un error críptico al registrarse, abandona antes de
  comprar — en electrónica (ticket alto: laptops, celulares) esa
  desconfianza cuesta más caro que en cualquier otro rubro.
- **Hallazgos de seguridad:**
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
- **Autenticación multifactor con 3 factores — criterio de riesgo, no
  decoración:** ISO/IEC 27001 (control A.9.4.2, acceso seguro) y COBIT
  (DSS05, gestionar servicios de seguridad según el riesgo) piden reforzar
  la autenticación donde el daño de una cuenta robada es mayor. Aquí eso es
  la cuenta `ROLE_ADMIN` (puede cambiar precios, aprobar pedidos, ver datos
  de todos los clientes) — por eso los 3 factores son **obligatorios para
  admin** y **opcionales, ofrecidos, para cliente**. El estándar (NIST SP
  800-63B) define multifactor como 2+ factores de categorías distintas;
  aquí se usan las 3 categorías completas para que cada factor aporte algo
  real y no sea un paso de relleno:
  1. **Algo que sabes** — la contraseña (ya existe).
  2. **Algo que tienes** — código TOTP de 6 dígitos con **Google
     Authenticator** (RFC 6238, librería `dev.samstevens.totp` en el
     backend). No SMS: NIST ya no lo recomienda como factor por el riesgo
     de SIM-swap, y además evita pagar por mensajes.
  3. **Verificación del dispositivo** — vía **WebAuthn** (la API estándar
     de navegadores; la misma que usan GitHub, Google y Microsoft). No
     exige cámara ni lector de huella: el navegador le pide al sistema
     operativo "verifica que es el dueño" y el dispositivo usa lo que
     tenga disponible — huella o rostro si hay sensor, el PIN/patrón de
     desbloqueo de Windows/Android/iOS si no lo hay, o una llave de
     seguridad física (USB) si se conecta una. Nuestro código no elige el
     método, el sistema operativo sí — así que funciona igual en una PC
     sin cámara que en un celular con huella. El dato biométrico (cuando se
     usa) nunca sale del dispositivo ni llega al backend: solo se guarda
     una llave pública de verificación (`webauthn_credential_id`,
     `webauthn_public_key`).
  - Migración Flyway de este día: `Usuario` gana `mfa_secret` (TEXT,
    cifrado en reposo), `mfa_enabled` (boolean, default `false`),
    `webauthn_credential_id` (TEXT) y `webauthn_public_key` (TEXT).
  - Backend: además de `dev.samstevens.totp`, la librería `webauthn4j` (o
    el soporte nativo de Spring Security 6 para WebAuthn) para registrar y
    verificar la credencial biométrica.
  - **Códigos de respaldo:** al activar los 3 factores se generan 8 códigos
    de un solo uso (hasheados en la base, igual que una contraseña) para
    cuando el usuario pierda el celular o cambie de dispositivo — sin esto,
    perder cualquiera de los dos factores extra deja la cuenta inaccesible,
    un problema real de soporte.
  - Flujo de login en tres pasos cuando los 3 factores están activos:
    `POST /login` valida correo+contraseña y devuelve un token temporal
    corto; `POST /login/mfa` valida el código TOTP; `POST /login/webauthn`
    valida la verificación del dispositivo y recién ahí entrega el JWT
    real. El JWT de sesión **nunca** se entrega sin pasar los 3 factores
    cuando están activos.
- **Patrón + qué se construye:** `Login.tsx`/`RegisterUser.tsx`/
  `ForgotPassword.tsx`/`VerifyResetCode.tsx`/`ResetPassword.tsx`/
  `VerificationAccount.tsx` dejan la paleta verde/gris aislada y pasan a
  `Card` `elevation-2`, título en `font-heading` 700, `FormField` con error
  inline, `Button` con `loading` real. Nueva pantalla `ActivarMFA.tsx` con
  los 3 pasos de activación (QR de Google Authenticator, registro de la
  verificación del dispositivo vía WebAuthn — huella, rostro, PIN o llave
  física, según lo que el dispositivo ofrezca — y la lista de códigos de
  respaldo para guardar) y un `Login.tsx` que, cuando la cuenta los tiene
  activos, pide los 3 en orden tras la contraseña. **Movimiento:**
  transición deslizante entre "Iniciar sesión"/"Registrarse" en vez de salto
  brusco; cada paso del flujo de MFA entra con un fade+slide corto
  (`--duration-fast`); error de campo con un shake sutil al fallar la
  validación (usar `find-animation-opportunities` para confirmar que esto
  ayuda y no distrae).
- **Prueba:** registrar → verificar correo → login → "olvidé mi contraseña"
  de punta a punta; `resetPassword` ahora exige código válido y no expirado;
  `/api/auth/correo` ya no devuelve `password`/`resetCode`; `/update-user`
  solo edita la cuenta de la sesión actual; crear una cuenta admin de
  prueba, confirmar que no puede entrar sin activar los 3 factores primero;
  activar los 3 en una cuenta cliente, cerrar sesión y volver a entrar
  pasando contraseña → código TOTP → verificación del dispositivo (con lo
  que haya disponible: huella, PIN o llave), en ese orden; entrar con un
  código de respaldo y confirmar que ese código ya no sirve una segunda
  vez.

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
- **Patrón + qué se construye:** `PerfilUser.tsx`/`PerfilAdmin.tsx` con
  `FormField` + `Card`; `Badge` de rol visible ("Cliente"/"Administrador") —
  hoy no hay ninguna pista visual de rol.
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
    de respuesta **nunca** incluye `password`, `mfaSecret` ni
    `webauthnPublicKey` (misma lección del Día 2: esos campos no salen del
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
  `password`/`mfaSecret`/`webauthnPublicKey`.

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
  formulario con `FormField`; filtros de categoría en `Tienda.tsx` como
  chips con los tokens nuevos.
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
- **Patrón + qué se construye:** `MarcasAdmin.tsx` con `Card` + tabla, logos
  de marca con tamaño consistente.
- **Prueba:** crear/editar/eliminar marca con logo; subir un archivo
  no-imagen como logo → debe rechazar; sin sesión admin → rechaza.

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
  columnas con `font-body`; `ProductosAdmin.tsx` reemplaza los 8+ combos de
  badges sueltos por el `Badge` único del Día 1. **Calificación real en el
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
  estados, `font-heading` para el estado actual. **Movimiento:** cada paso
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
    marca aplicados y estado activo de navegación consistente;
    `HomeAdmin.tsx` (dashboard) con métricas reales destacadas (pedidos de
    hoy, productos con poco stock) en `font-heading` para los números
    grandes, reemplazando contenido estático si lo hay.
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
- **Patrón + qué se construye:** `HomeUser.tsx` unifica toda la paleta a
  `color-primary`/`color-accent` (quita la mezcla azul/índigo);
  `Header.tsx`/`Footer.tsx`/`Dropdown.tsx` con `font-heading` en el
  logo/nombre; `Nosotros.tsx`/`Contacto.tsx` con el mismo sistema de
  `Card`/`FormField` del resto de la app. **Nuevas:** `Terminos.tsx`,
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
  que los links del footer a Términos/Privacidad/Devoluciones funcionan.

## Día 12 — Despliegue a producción

Este día no es de pantallas — es dónde se pone en vivo todo lo que ya se
construyó (incluida la base de datos versionada con Flyway desde el Día 1).
Va al final porque recién tiene sentido cuando hay algo terminado que
mostrar, y porque los webhooks de pago del Día 7 **necesitan una URL
pública**, algo que no existe hoy (todo corre en `localhost`).

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
- `backend/src/main/java/com/ecommerce/backend/entity/{MetodoPago,Pedido,Usuario,Favorito}.java` (campos nuevos de pasarela, MFA, y la entidad Favorito)
- `backend/src/main/resources/application.properties` (+ `application-prod.properties` nuevo)
- `backend/src/main/resources/db/migration/` (nuevo: scripts Flyway)
- `backend/pom.xml` (agregar Flyway + SDK de Mercado Pago + `dev.samstevens.totp` y `webauthn4j` para MFA; quitar `mysql-connector-j`)
- `frontend/src/index.css` (tokens `@theme`)
- `frontend/src/components/ui/` (nuevo: `Button`, `Badge`, `Card`, `FormField`)
- `frontend/src/lib/api.ts` (nuevo: cliente HTTP centralizado con `VITE_API_BASE_URL`)
- `frontend/src/user/pages/CheckoutPago.tsx` (widget de Culqi/Mercado Pago + pantalla de pago fallido)
- `frontend/src/autenticacion/ActivarMFA.tsx` (nuevo: activación de MFA y códigos de respaldo)
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
