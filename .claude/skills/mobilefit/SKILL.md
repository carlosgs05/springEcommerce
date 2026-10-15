---
name: mobilefit
description: Oficio senior de diseño responsive y móvil, universal. Úsala al construir o revisar cualquier pantalla que se vea en móvil, tableta y escritorio. Triggers: responsive, móvil, tableta, pantalla pequeña, breakpoint, táctil, se sale, scroll horizontal, adaptativo.
---

# MobileFit — que quepa y se use en cualquier pantalla

La mayoría de la gente entra desde el móvil. Una pantalla que solo se probó en
un monitor grande está a medio hacer. **Diseña pensando primero en lo estrecho**
y ensancha desde ahí; es más fácil que al revés.

## Lo que se comprueba siempre

1. **Nada se sale de lado.** Cero scroll horizontal. Si algo obliga a desplazar
   a lo ancho, está roto. Culpables típicos: anchos fijos en píxeles, tablas,
   imágenes sin límite, texto larguísimo sin cortar.
2. **Se puede tocar con el dedo.** Los blancos táctiles miden al menos ~44px y no
   están pegados unos a otros. Un enlace diminuto es inservible con el pulgar.
3. **El texto se lee sin ampliar.** Nada de letra de 10px en móvil.
4. **Lo importante primero.** En estrecho, lo que importa arriba; lo secundario
   se apila o se esconde tras un menú.
5. **Las tablas anchas tienen plan.** O se desplazan solas en su caja, o se
   reordenan en tarjetas. Nunca romper la maqueta.

## Trampas de senior

- **Probar solo estirando la ventana.** El navegador de escritorio estrecho NO
  es un móvil: falta el teclado que tapa media pantalla, el táctil, el "notch".
  Prueba en el modo dispositivo o en uno real.
- **El teclado tapa el campo.** En móvil, al escribir, el teclado sube y esconde
  lo de abajo. El campo activo tiene que quedar visible.
- **`100vh` en móvil.** La barra del navegador hace que `100vh` no sea lo que
  crees; deja recortes. Ojo con eso.
- **Hover que no existe.** En táctil no hay "pasar el ratón por encima". Lo que
  solo aparece con hover, en móvil no aparece nunca.

## Cómo se entrega

Di en qué anchos lo probaste (móvil, tableta, escritorio) y con qué (modo
dispositivo o aparato real). Si solo lo viste en escritorio, dilo claramente.
