# Identidad visual — TechStore

Este documento es la fuente de verdad del sistema de diseño. **Toda pantalla
nueva o rediseñada debe seguir esto**, no reinventar valores sueltos. Si algo
cambia aquí durante la construcción (un ajuste de contraste, un hover que no
se sentía bien, etc.), se actualiza este archivo en el mismo commit que lo
cambia en código — nunca al revés. El detalle día por día de qué pantalla usa
qué está en `PLAN_DISENO_PORTAFOLIO.md`; esto es solo el sistema en sí.

## Marca

- **Nombre:** "TechStore" — placeholder. No existe ningún nombre real en el
  proyecto todavía (`frontend/index.html` seguía con el título por defecto de
  Vite antes del Día 1). Queda centralizado en pocos lugares (`index.html`,
  `Header.tsx`, `Footer.tsx`, pantallas de auth) para poder cambiarlo en un
  minuto cuando el dueño tenga el nombre real — **no repetirlo hardcodeado**
  en más archivos de los necesarios.
- **Logo:** no existe todavía. Pendiente de que el dueño lo traiga o se
  diseñe uno — no es parte de los 12 días del plan.

## Por qué este sistema (no genérico, no repite lo de CAR_WASH)

Dos estilos activos de la base de datos de la skill `ui-ux-pro-max`, elegidos
a propósito por no superponerse con lo que ya usó CAR_WASH (que usó Material
3 Expressive, Bento Box Grid, Glassmorphism, Dark Mode OLED):

| Estilo | Rol aquí |
|---|---|
| **Dimensional Layering** | Tarjetas de producto con profundidad real por elevación (sombra en 4 niveles) — una laptop/celular "flota" sobre el fondo, sensación premium sin blur. |
| **Minimalism & Swiss Style** | Grid tipográfico limpio y de alto contraste en checkout, perfil y panel admin — genera confianza sin verse "plano". |

Se descartó a propósito "Vibrant & Block-based" (la recomendación genérica
de la base para "E-commerce") porque es el estilo que reutilizan las
plantillas — el objetivo es que esta tienda no se vea como una.

## Tipografía

Pareo real de `typography.csv`: **"Tech Startup"**.

- **Space Grotesk** — headings.
- **DM Sans** — body.
- Google Fonts: `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap`

| Peso | Uso |
|---|---|
| Space Grotesk 700 | Títulos de pantalla / precios grandes |
| Space Grotesk 600 | Encabezados de sección, nombre de producto en tarjeta |
| Space Grotesk 500 | Botones, labels de formulario |
| DM Sans 400 | Cuerpo de texto, descripciones, tablas |
| DM Sans 500/700 | Énfasis dentro de texto de cuerpo (precio inline, estado) |

## Paleta — Claro (por defecto)

| Token | Valor | Uso |
|---|---|---|
| `--color-canvas` | `#F8FAFC` | Fondo general |
| `--color-surface` | `#FFFFFF` | Tarjetas/superficies (borde 1px `--color-border`) |
| `--color-border` | `#E2E8F0` | Borde de tarjetas/inputs |
| `--color-text` | `#0F172A` | Texto principal |
| `--color-text-muted` | `#475569` | Texto secundario |
| `--color-primary` | `#2563EB` | Marca/CTA |
| `--color-primary-hover` | `#1D4ED8` | Hover de primario |
| `--color-accent` | `#06B6D4` | Precio, badges "oferta" |
| `--color-success` | `#16A34A` | Stock disponible, pedido entregado |
| `--color-warning` | `#D97706` | Poco stock |
| `--color-danger` | `#DC2626` | Error/destructivo |

Sombras (elevación por capas, nunca blur/backdrop-filter):
- `--shadow-elevation-1`: `0 1px 3px rgba(15,23,42,0.08)` — tarjeta en reposo.
- `--shadow-elevation-2`: `0 10px 24px -6px rgba(15,23,42,0.12)` — tarjeta en hover/destacada.
- `--shadow-elevation-3`: `0 20px 40px -8px rgba(15,23,42,0.18)` — modal/panel flotante.
- `--shadow-primary-glow`: `0 4px 12px rgba(37,99,235,0.25)` — hover del botón primario (token agregado en el Día 1).

## Paleta — Oscuro (opción activable, clase `.dark`, no es la base)

| Token | Valor |
|---|---|
| `--color-canvas` | `#0B1120` |
| `--color-surface` | `#151E32` (borde `rgba(255,255,255,0.08)`) |
| `--color-text` | `#F1F5F9` |
| `--color-primary` | `#3B82F6` |
| `--color-accent` | `#22D3EE` |

## Botón principal

- Color sólido `#2563EB` (**sin degradado** — a propósito, eso ya lo usó
  CAR_WASH en su botón). Hover: `box-shadow: 0 4px 12px rgba(37,99,235,0.25)`.
- Forma: `rounded-xl` (12px) — no píldora.

## Radios

- Tarjetas de producto: `rounded-2xl` (16px) — con elevación, nunca blur.
- Inputs/botones: `rounded-xl` (12px).

## Movimiento (easing/duración)

```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;
```

Reglas:
- Solo propiedades compuestas (`transform`, `opacity`) — nunca animar
  `width`/`top`/`left` directamente (skill `animation-performance`).
- No se anima todo porque sí — antes de animar una pantalla, usar
  `find-animation-opportunities` para confirmar que ayuda (confirma una
  acción: se agregó al carrito, el pago se confirmó, hay notificación
  nueva), no que distrae.
- Construir cada animación con la skill `animate`, revisar con
  `review-animations` como parte del pulido de cada día.

## Anti-patrones a evitar (decisión explícita, no olvido)

- Nada de `backdrop-filter`/blur.
- Nada de tonal elevation ni state layers de Material.
- Nada de grillas asimétricas tipo bento — las tarjetas de producto son
  todas del mismo tamaño base; la jerarquía se construye con elevación y
  tipografía, no con tamaños de celda distintos.

## Responsive

Mobile-first, sin excepción, en los 3 anchos:
- **Base (< 640px):** una columna, tarjetas apiladas, barra de acción
  inferior fija donde haya un CTA principal (ej. "Finalizar compra").
- **`sm:`/`md:` (tablet):** 2 columnas en grillas de producto/tarjetas.
- **`lg:`/`xl:` (escritorio):** 3-4 columnas en catálogo, layout de admin
  con sidebar fija + contenido.

Ningún componente se da por cerrado sin probarse en los 3 anchos — área
táctil mínima de 44px en botones para mobile.

## Piezas compartidas (`frontend/src/components/ui/`)

Construidas en el Día 1, reutilizadas en el resto del plan — no se repiten
clases sueltas por pantalla (ese era el problema confirmado: `ProductosAdmin.tsx`
tenía 8+ combinaciones distintas de `bg-{color}-{tono}` para lo que debía ser
un solo componente).

- **`Button.tsx`**: variantes `primary`/`secondary`/`danger`/`ghost`, tamaños
  `sm`/`md`/`lg`, estado `loading` real (spinner).
- **`Badge.tsx`**: variantes semánticas `success`/`warning`/`danger`/`info` (+ `neutral`).
  El texto del badge usa tonos 800 de la paleta de Tailwind (green/amber/red/blue)
  sobre fondo tenue, no el token directo: `--color-success` como texto no llega
  a contraste AA.
- **`Card.tsx`**: con `elevation` 1/2/3.
- **`FormField.tsx`**: label + error inline + helper text.

## Skills a usar siempre que se toque el diseño

- **`ui-ux-pro-max`** — antes de construir cualquier pantalla nueva/rediseñada.
- **`impeccable`** — pulido final de cada pantalla antes de cerrarla.
- **`find-animation-opportunities`** / **`animate`** / **`animation-performance`**
  / **`review-animations`** — para todo lo de movimiento (ver arriba).

## Dónde se aplica esto

Se extiende a cada pantalla según `PLAN_DISENO_PORTAFOLIO.md`, día por día —
cuando se rediseñe cada módulo, debe usar estos mismos tokens y reglas, no
inventar una paleta, tipografía o radios distintos.
