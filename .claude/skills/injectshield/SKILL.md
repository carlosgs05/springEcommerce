---
name: injectshield
description: Oficio senior de revisión de inyección y validación de entrada, universal. Úsala al revisar código que arma consultas, comandos o pinta contenido de usuario. Solo señala, no arregla. Triggers: inyección, SQL injection, XSS, comando, validación, escapar, entrada sin validar, consulta armada, sanitizar.
---

# InjectShield — cuando la entrada se cuela donde no debe

Todo lo que venga de fuera (formulario, URL, cabecera, archivo, otro servicio) es
sospechoso hasta que se comprueba, **y se comprueba en el servidor.** Revisas y
señalas; no arreglas.

## Los tres sitios donde la entrada hace daño

1. **Consultas armadas pegando texto.** Si un valor del usuario se concatena
   dentro de una consulta SQL (o un comando del sistema), puede cambiar lo que la
   consulta hace: leer otras tablas, borrarlas. La defensa es **consultas
   parametrizadas** (el valor va aparte, nunca pegado). Busca concatenaciones y
   plantillas de texto que metan datos del usuario en la consulta.
2. **Contenido de usuario que se pinta sin escapar.** Un nombre con `<script>`
   que se muestra tal cual se ejecuta en el navegador de quien lo vea (XSS).
   Busca dónde se inserta HTML crudo con datos de usuario.
3. **Rutas de archivo que vienen de fuera.** Un nombre de archivo con `../`
   permite salir de la carpeta y leer o escribir donde no se debe. Busca aperturas
   de archivo cuyo nombre venga del usuario sin limpiar.

## Qué se comprueba de la validación

- ¿Se valida **tipo, rango y formato** en el servidor, no solo en la pantalla?
- ¿La validación es **lista blanca** (solo lo permitido pasa) y no lista negra
  (todo pasa menos lo prohibido, que siempre se queda corta)?
- ¿Se valida **antes** de usar el dato, no después?

## El hueco que "tiene" la defensa y no la aplica

No te quedes en si existe una función que suena segura. Comprueba que **se usa
de verdad, en ESTE punto**:

- Hay un método "parametrizado" en el proyecto, pero en este archivo el valor se
  pegó con `+`/interpolación antes de llamarlo. La defensa existe en otro sitio;
  aquí no se usó.
- La "lista blanca" tiene un comodín (`*`, `.*`, un `else` que deja pasar todo).
  Eso no es lista blanca, es lista negra con nombre bonito.
- Se valida el tipo pero no se usa el valor validado — el código sigue leyendo
  la variable original sin validar más abajo.

Pregúntate por cada defensa: **"si borro esta línea, ¿de verdad cambia algo?"**
Si la respuesta es no, la defensa no está haciendo su trabajo aunque esté ahí.

## Cómo se cuenta cada hallazgo

Qué está mal, dónde (archivo:línea), qué puede hacer alguien en concreto ("con un
nombre con comillas puede leer toda la tabla de usuarios"), y qué haría falta para
cerrarlo. Lo peor primero. No inventes riesgos menores para rellenar.
