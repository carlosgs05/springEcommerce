---
name: breakpath
description: Oficio senior de pruebas del camino malo, universal. Úsala para probar lo que falla, no lo que funciona: sin permiso, no existe, a mitad, dos veces. Triggers: camino malo, sin permiso, no existe, a medias, doble ejecución, fallo parcial, concurrencia, reintento, error.
---

# BreakPath — el camino que nadie probó

Quien escribió algo probó que funciona. Tú pruebas que **no se rompe cuando algo
va mal**. Aquí es donde está la mayoría de los fallos que llegan al usuario.

## Los caminos malos que hay que recorrer

1. **Sin permiso.** Alguien que no debería poder: otro usuario, sin sesión, con
   la sesión de otro rol. ¿Le deja? Prueba pedir el recurso de otro cambiando el
   id en la URL.
2. **Lo que no existe.** Un id inventado, un archivo que no está, un padre
   borrado. ¿404 limpio o 500?
3. **Dos veces seguidas.** Lo que funciona una vez y rompe la segunda es de lo
   más común: doble clic, doble envío, reintento. ¿Duplica? ¿Cobra dos veces?
4. **A mitad.** ¿Qué pasa si falla por el medio? Corta la red, mata el proceso,
   haz fallar el segundo paso. ¿Queda algo a medias, un dato suelto, un candado
   puesto sin quitar?
5. **A la vez.** Dos peticiones iguales en el mismo instante. ¿Se pisan?
6. **Fuera de orden.** El paso 3 antes que el 2. Confirmar algo ya confirmado.
   Cancelar algo ya cancelado.

## Trampas de senior

- **Suponer que el fallo es limpio.** Muchos sistemas dejan basura al fallar a
  mitad: eso es el hallazgo.
- **Probar solo con tu usuario admin.** Con permisos totales no ves el agujero de
  permisos. Prueba como usuario normal y como ajeno.
- **La red que se cae.** El móvil pierde señal a mitad de envío: caso real, no
  raro.

## El hueco que "se probó" pero con el camino fácil disfrazado de malo

No confundas "probé un caso raro" con "probé el camino malo real":

- Probar "sin permiso" con un usuario que en realidad SÍ tiene ese permiso por
  otra vía (rol heredado, admin de pruebas) no prueba nada. Confirma primero que
  ese usuario de verdad no debería poder, antes de intentarlo.
- Probar "dos veces seguidas" con tanta pausa entre una y otra que ya no hay
  condición de carrera real — dispara las dos lo más simultáneo posible.

Pregúntate por cada camino: **"¿esto que acabo de probar era de verdad el caso
malo, o una versión suave que no iba a fallar de todos modos?"**

## Cómo se entrega

De cada camino: qué hiciste (para repetirlo), qué esperabas, qué salió tal cual,
y qué tan grave. Si algo quedó a medias, es de lo más importante que reportes.
**No arreglas**: informas.
