# Identidad visual — TechStore

Fuente de verdad del sistema de diseño. Toda pantalla nueva o rediseñada
sigue esto, no inventa valores sueltos. Si algo cambia durante la
construcción, se actualiza este archivo en el mismo commit que lo cambia en
código. El detalle día por día de qué pantalla usa qué está en
`PLAN_DISENO_PORTAFOLIO.md`; esto es solo el sistema en sí.

## Marca

- **Nombre:** "TechStore" — única fuente de verdad (el código tiene hoy
  "TechShop" suelto en varios archivos de usuario; se corrige al tocar cada
  pantalla, no se inventa un nombre nuevo).
- **Logo:** no existe un logo real todavía. Mientras tanto, **el logo es el
  wordmark del nombre en Playfair Display** — nada de íconos prestados. Hoy
  el código usa un ícono hotlinkeado de `icons8.com` (un tigre, sin relación
  con la marca) en 6 archivos (`Header`, `Footer`, `SidebarAdmin`, `Login`,
  `ForgotPassword`, `RegisterUser`) — se quita al tocar cada pantalla.

## Por qué este sistema (no genérico, no repite lo de CAR_WASH)

Estilos activos de `ui-ux-pro-max` elegidos para no superponerse con el otro
proyecto del portafolio (CAR_WASH: Material 3 Expressive, Bento Box,
Glassmorphism, Dark Mode OLED):

| Estilo | Rol aquí |
|---|---|
| **Dimensional Layering** | Tarjetas de producto con profundidad por elevación (sombra en 4 niveles) — sensación premium sin blur. |
| **Minimalism & Swiss Style** | Grid tipográfico limpio y de alto contraste en checkout/perfil/admin. |

Se descartó "Vibrant & Block-based" (recomendación genérica de la base para
"E-commerce") y "Glassmorphism"/"Liquid Glass" (recomendación genérica para
"E-commerce Luxury") a propósito — son el estilo que reutilizan las
plantillas; el objetivo es que esta tienda no se vea como una.

## Modo: oscuro único, sin toggle

**No hay modo claro.** Es un solo sistema, sin clase `.dark` ni lógica de
alternancia — se declara `color-scheme: dark` en `:root` para que los
controles nativos del navegador también se vean oscuros.

| Token | Valor | Uso |
|---|---|---|
| `--color-canvas` | `#0C0A09` | Fondo general |
| `--color-surface` | `#1C1917` | Tarjetas/superficies |
| `--color-border` | `rgba(255,255,255,0.08)` | Borde de tarjetas/inputs |
| `--color-text` | `#FAFAF9` | Texto principal |
| `--color-text-muted` | `#A8A29E` | Texto secundario |
| `--color-primary` | `#D4AF37` | Marca/CTA (oro — sobre un fondo tan oscuro el grafito no se vería) |
| `--color-primary-hover` | `#E8C547` | Hover de primario |
| `--color-accent` | `#F2C94C` | Precio, badges "oferta" (oro claro, distinto del primario) |
| `--color-success` | `#22C55E` | Stock disponible, pedido entregado |
| `--color-warning` | `#F97316` | Poco stock |
| `--color-danger` | `#EF4444` | Error/destructivo |

Sombras (elevación por capas, recalculadas para fondo oscuro — nunca
blur/backdrop-filter):
- `--shadow-elevation-1`: `0 1px 3px rgba(0,0,0,0.4)` — tarjeta en reposo.
- `--shadow-elevation-2`: `0 10px 24px -6px rgba(0,0,0,0.5)` — hover/destacada.
- `--shadow-elevation-3`: `0 20px 40px -8px rgba(0,0,0,0.6)` — modal/panel flotante.
- `--shadow-primary-glow`: `0 4px 16px rgba(212,175,55,0.35)` — hover del botón primario.

**On-primary fijo:** texto **oscuro** (`#1C1917`) sobre el botón primario
(oro) — nunca blanco, blanco sobre oro no pasa contraste.

## Tipografía

Pareo real de `typography.csv`: **"Classic Elegant"** (recomendado para
e-commerce premium, combina con Grafito+Oro mejor que un sans+sans).

- **Playfair Display** — headings (serif de alto contraste).
- **Inter** — body, botones, labels, **tablas de specs técnicas** (el serif
  nunca baja a tamaño de botón ni a datos tabulares).
- Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap`

| Peso | Uso |
|---|---|
| Playfair Display 700 | Títulos de pantalla / precios grandes |
| Playfair Display 600 | Encabezados de sección, nombre de producto en tarjeta |
| Inter 500/600 | Botones, labels de formulario |
| Inter 400 | Cuerpo de texto, descripciones, tablas de specs |
| Inter 500/700 | Énfasis dentro de texto de cuerpo (precio inline, estado) |

Cuidado a aplicar: Playfair Display en mobile necesita tamaños de título más
conservadores que un sans — probar salto de línea en nombres de producto
largos en las tarjetas del catálogo, en los 3 anchos.

## Iconografía

**Phosphor** (`@phosphor-icons/react`) como librería única; **Heroicons**
solo como respaldo si falta un ícono puntual. `react-icons` deja de usarse
para código nuevo (hoy es la librería dominante en el proyecto, mezclada
además con Heroicons en un solo archivo y con PNGs sueltos de icons8 para
estados de carga/verificación — se migra pantalla por pantalla, el día que
el plan la toque).

## Botón principal

- Color sólido `#D4AF37` (oro — **sin degradado**), texto oscuro encima.
  Hover: `box-shadow: 0 4px 16px rgba(212,175,55,0.35)`.
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

Solo propiedades compuestas (`transform`, `opacity`) — nunca `width`/`top`/
`left` directamente. No se anima todo porque sí: usar
`find-animation-opportunities` antes de animar una pantalla; construir con
`animate`; revisar con `review-animations`.

## Distribución/estructura — no solo color

Comparado contra un sitio real del mismo rubro (electrónica/audio premium),
confirmado que el patrón actual (hero en carrusel + countdown de oferta +
testimonios + marcas + beneficios en la Home; sidebar de filtros fijo en el
catálogo; specs técnicas escondidas en una pestaña en la ficha de producto)
es el más genérico de ecommerce que existe. Reglas para el rediseño:

- **Home:** hero de una sola pieza (no carrusel automático); nada de
  countdown de "oferta relámpago" sin fecha real de vencimiento (presión
  artificial, además de ser el patrón de plantilla más repetido) — en su
  lugar, una franja de "más vendidos"/"recomendados" con datos reales.
- **Catálogo:** los filtros no se quitan (hacen falta con un catálogo
  real), pero no van en un sidebar fijo de escritorio — van en chips
  compactos + drawer en mobile; los chips deben poder envolver o colapsar
  en "+n", nunca cortarse en una fila fija.
- **Ficha de producto:** se mantienen las 2 columnas (galería + compra,
  funciona), pero las specs técnicas no van en una pestaña más — son la
  sección fuerte visible justo debajo, sin clic extra (es lo que decide una
  compra de electrónica de ticket alto).

## Anti-patrones a evitar (decisión explícita, no olvido)

- Nada de `backdrop-filter`/blur, nada de tonal elevation ni state layers de
  Material, nada de grillas asimétricas tipo bento.
- Nada de imágenes hotlinkeadas de servicios externos (icons8 u otros) para
  logo o estados de carga/verificación.
- Nada de degradados azul→cian tipo "dashboard de plantilla" (incluido
  texto con degradado `bg-clip-text`).
- Nada de `rounded-xl`/`shadow-*` sueltos de Tailwind fuera de los
  tokens/componentes ya definidos en `components/ui/`, al tocar una
  pantalla del plan.
- Nada de countdown de urgencia sin fecha real detrás.

## Responsive

Mobile-first, sin excepción, en los 3 anchos (base <640px una columna con
barra de acción inferior fija; `sm/md` 2 columnas; `lg/xl` 3-4 columnas en
catálogo, admin con sidebar fija). Área táctil mínima de 44px en mobile.
Ningún componente se cierra sin probarse en los 3 anchos.

## Piezas compartidas (`frontend/src/components/ui/`)

Construidas en el Día 1, casi no usadas hoy fuera de sí mismas (el 95% de
las pantallas reales cae en utilidades Tailwind sueltas en su lugar — se
corrige pantalla por pantalla según el plan):

- **`Button.tsx`**: variantes `primary`/`secondary`/`danger`/`ghost`,
  tamaños `sm`/`md`/`lg`, estado `loading` real.
- **`Badge.tsx`**: variantes `success`/`warning`/`danger`/`info`/`neutral`
  (texto en tono 800 de Tailwind sobre fondo tenue, el token directo no
  llega a contraste AA).
- **`Card.tsx`**: con `elevation` 1/2/3.
- **`FormField.tsx`**: label + error inline + helper text.

## Skills a usar siempre que se toque el diseño

- **`ui-ux-pro-max`** — antes de construir cualquier pantalla nueva/rediseñada.
- **`impeccable`** — pulido final de cada pantalla antes de cerrarla.
- **`find-animation-opportunities`** / **`animate`** / **`animation-performance`**
  / **`review-animations`** — para todo lo de movimiento.

## Dónde se aplica esto

Se extiende a cada pantalla según `PLAN_DISENO_PORTAFOLIO.md`, día por día —
al rediseñar cada módulo, usa estos mismos tokens y reglas, no inventa una
paleta, tipografía, radios o estructura distintos.
