---
name: authcore
description: Oficio senior de autenticación y autorización en el servidor, universal. Úsala en cualquier endpoint que tenga que saber quién pide algo y si puede. Triggers: autenticación, autorización, permisos, sesión, token, quién soy, rol, acceso, seguridad de rutas.
---

# AuthCore — quién eres y qué puedes

Dos preguntas distintas, y confundirlas es un agujero: **autenticación** es
"¿quién eres?"; **autorización** es "¿puedes hacer esto?". Estar dentro del
sistema no da permiso para todo.

## Reglas que aguantan

1. **La identidad sale SIEMPRE de la sesión/token, nunca de lo que manda el
   navegador.** Si el endpoint acepta un identificador de usuario por parámetro
   y se fía, cualquiera pone el de otro. Es el agujero más común y más caro.
2. **El permiso se comprueba en el servidor, en CADA petición.** No al abrir la
   pantalla. Esconder un botón no protege el endpoint que hay detrás.
3. **Quien valida y quien recibe el cambio son el mismo.** La trampa fina: se
   comprueba la contraseña de una persona y se modifican los datos de otra.
4. **Los permisos se revisan al usarlos, no se cachean para siempre.** Una sesión
   dura días. Si a alguien le quitan un permiso el martes, no puede seguir
   usándolo el miércoles porque el lunes lo tenía.
5. **Adopta el sistema de permisos del proyecto.** Si ya hay middleware, guards o
   políticas, úsalos. No inventes otro camino al lado que se salte el existente.

## Trampas de senior

- **Referencia directa insegura.** `/factura/123` que sirve la 123 sin comprobar
  que es tuya. Cambiar el número da la de otro.
- **Confiar en campos del cliente.** `esAdmin: true` que llega en la petición.
- **Rutas nuevas sin proteger.** Se añade un endpoint y se olvida el candado que
  tienen sus vecinos. Compara: si 20 rutas exigen sesión y una no, esa es el
  agujero.
- **Tokens que no caducan o no se pueden revocar.**

## Autocomprueba esto antes de dar el endpoint por terminado

No es lo mismo "puse una comprobación de permiso" que "esa comprobación protege
de verdad". Antes de entregar, repásate:

- **¿El id del recurso que devuelvo se compara contra el dueño real, o solo
  compruebo que hay sesión?** Exigir login y servir cualquier id que llegue es
  el fallo más común y el más fácil de dejar pasar sin querer.
- **¿Esta ruta nueva quedó dentro de la lista/grupo que exige permiso,** o la
  escribí suelta y se me olvidó engancharla al middleware que usan las demás?

Si tienes dudas de una de las dos, es más barato arreglarlo tú ahora que esperar
a que `seguridad` lo encuentre después.

## Cómo se entrega

Di de dónde sacas la identidad y dónde compruebas el permiso. Prueba a pedir algo
de otro usuario y algo sin permiso: deben dar 403/404, no el dato.
