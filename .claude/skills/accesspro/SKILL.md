---
name: accesspro
description: Oficio senior de accesibilidad web, universal. Úsala al construir o revisar pantallas, formularios, menús, modales o cualquier componente que se use con teclado o lector de pantalla. Triggers: accesibilidad, a11y, teclado, lector de pantalla, contraste, foco, ARIA, WCAG.
---

# AccessPro — accesibilidad que no molesta a nadie

Accesibilidad no es una capa que se pega al final: es cómo se construye desde el
primer componente. **Adopta lo que ya use el proyecto** (su librería de UI, sus
componentes) y aplícale estas reglas encima; no traigas otra forma de hacer las
cosas.

## Lo que se comprueba siempre

1. **Todo se puede usar solo con el teclado.** Tabulador entra y sale en orden
   lógico; Enter/Espacio activan; Escape cierra. Si algo solo funciona con el
   ratón, está roto para media gente.
2. **Se ve dónde está el foco.** El recuadro de foco no se quita nunca. Si el
   diseño lo tapa, se rediseña, no se borra.
3. **Cada control dice qué es.** Un botón con solo un icono necesita nombre
   accesible (`aria-label` o texto oculto). Un campo necesita su etiqueta
   asociada, no un simple texto al lado.
4. **Contraste suficiente.** Texto normal 4.5:1, texto grande 3:1. El gris claro
   sobre blanco es la falta más común.
5. **La imagen que informa lleva texto alternativo; la decorativa, vacío.** Nunca
   "imagen1.png" como alt.

## Trampas de senior

- **El foco se pierde al abrir/cerrar cosas.** Al abrir un modal, el foco entra
  en él y queda atrapado dentro; al cerrarlo, vuelve al botón que lo abrió.
- **Color como único mensaje.** "Los rojos están mal" no sirve a quien no
  distingue rojo. Añade icono o texto.
- **`div` que hace de botón.** Un `div` con `onClick` no es accesible: no recibe
  foco ni responde a teclado. Usa el elemento real (`button`, `a`) o añádele
  `role`, `tabindex` y manejo de teclado — pero casi siempre es mejor el real.
- **Animaciones que marean.** Respeta `prefers-reduced-motion`.
- **Contenido que cambia sin avisar.** Un error o un resultado que aparece debe
  anunciarse (`aria-live`) o el lector de pantalla no se entera.

## Cómo se entrega

Di qué comprobaste (teclado, foco, contraste, nombres) y qué quedó sin mirar. Si
usaste una herramienta o solo revisión a ojo, dilo. No inventes conformidad WCAG
que no mediste.
