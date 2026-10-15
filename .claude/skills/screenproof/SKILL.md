---
name: screenproof
description: Oficio senior de pruebas en pantalla real con navegador automatizado, universal. Úsala cuando hay que ver la interfaz de verdad, no solo probar por API. Triggers: navegador, playwright, e2e, pantalla, interfaz, end to end, automatizar navegador, ver la pantalla, headless.
---

# ScreenProof — verlo en pantalla, no solo por API

Probar por API está bien, pero **no sustituye a ver la pantalla**: pasa a menudo
que algo funciona por API y en la pantalla no (un botón que no llama, un dato que
no se pinta, un error que no se muestra). Si el encargo toca interfaz, no está
probado hasta que se vio funcionar.

## Cómo se hace bien

1. **Primero comprueba si el proyecto trae navegador de pruebas.** Mira las
   dependencias (`package.json`) y `node_modules/.bin` buscando Playwright,
   Cypress o Selenium. Si está, úsalo lanzándolo desde un script que apunte a esa
   instalación. Si **no** está, no lo instales: pasa a probar por API y dilo (ver
   la sección de abajo). Comprobar antes evita intentar abrir algo que no existe.
2. **Entra de verdad.** Casi todo lo interesante está detrás de un login. Consigue
   un usuario válido antes de empezar (búscalo en seeds/fixtures/.env.example o
   pídelo). Si no entras, rebotas en la puerta y no pruebas nada.
3. **Usa la cosa como una persona.** Haz clic, escribe, envía, navega. No solo
   cargues la página: interactúa.
4. **Mira la consola y la red.** Un error de JavaScript o una petición en rojo
   que la pantalla esconde es un hallazgo.

## Conseguir el navegador — en este orden, sin martillear

Casi siempre hay un navegador disponible. Úsalo en este orden:

1. **El del proyecto.** Si el proyecto trae Playwright/Cypress/Selenium en sus
   dependencias, usa ese, lanzándolo desde un script que apunte a su instalación.
2. **El Playwright global.** Si el proyecto no lo trae, usa el Playwright
   instalado globalmente en la máquina (`npx playwright`, o el `playwright`
   global). Existe justo para esto: ver la pantalla en **cualquier** proyecto,
   tenga o no navegador propio. Chromium suele estar disponible.
3. **Si no hay ninguno** (ni del proyecto ni global), NO lo instales tú a mano:
   dilo en una línea —«no hay Playwright en el proyecto ni global; corre una vez
   `instalar-playwright.ps1` del repo de agentes»— y mientras tanto prueba por
   API para no quedarte parado.

Reglas para no quemar turnos (esto es lo que fallaba antes):

- **Un solo intento serio por vía.** Si una vía falla, prueba UN arreglo
  razonable (ruta correcta al ejecutable, esperar a que el servidor esté arriba).
  Si vuelve a fallar, pasa a la siguiente vía o para. **Nunca repitas el mismo
  comando en bucle.**
- **No descargues navegadores una y otra vez.** Si el paquete está pero falta el
  binario («browser not installed» / «Executable doesn't exist»), se arregla
  **una vez** con `instalar-playwright.ps1`, no martilleando en cada intento.
- **El objetivo es ver la pantalla**, y con Playwright global casi siempre se
  puede. Solo si de verdad no hay forma, una entrega probada por API + el aviso
  claro es honesta.

## Qué se comprueba en pantalla

- Que el dato **se pinte** y sea el correcto (no solo que la API lo devuelva).
- Estados de **carga, error y vacío**: fuerza cada uno.
- Que los botones **hagan lo que dicen** y se bloqueen al enviar.
- Que en **móvil** no se salga nada (ver MobileFit).

## Trampas de senior

- **Dar por bueno lo que solo probaste por API.** El caso clásico de "por API
  iba, en pantalla no".
- **No esperar a que cargue.** Comprobar antes de que aparezca el dato da falsos
  fallos; usa esperas por elemento, no por tiempo fijo.
- **Capturas con datos personales.** No guardes en disco capturas con nombres,
  correos o documentos reales.

## Cómo se entrega

Di qué pantallas abriste, con qué usuario (o que no entraste), qué hiciste y qué
viste. Si no pudiste abrir el navegador, dilo y para. **No arreglas**: informas.
