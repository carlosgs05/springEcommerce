---
name: atomicguard
description: Oficio senior de transacciones e integridad de datos en el servidor, universal. Úsala cuando una operación toca varias tablas o pasos y no puede quedar a medias. Triggers: transacción, atomicidad, rollback, consistencia, a medias, todo o nada, integridad, commit.
---

# AtomicGuard — o va entero, o no va

La regla que evita los peores desastres de datos: **lo que toca varias cosas va
junto o no va.** Un cobro que se registra pero no descuenta el saldo, un pedido
que se crea sin sus líneas: eso deja la base en un estado que nadie sabe
describir, y se descubre semanas después.

## Reglas que aguantan

1. **Envuelve en una transacción todo lo que debe pasar junto.** Si un paso
   falla, se deshace todo. No a medias.
2. **La transacción es corta.** Abre, haz lo imprescindible, cierra. Meter dentro
   una llamada a otro servicio o un cálculo lento bloquea filas y crea atascos.
3. **Lo que no se puede deshacer, va al final.** Enviar un correo o llamar a otro
   servicio no tiene rollback. Hazlo **después** de confirmar la transacción, no
   dentro. Si lo haces dentro y luego falla el commit, ya mandaste el correo de
   algo que no ocurrió.
4. **Valida antes de abrir la transacción.** No abras para descubrir dentro que
   el dato era inválido.

## Trampas de senior

- **Efectos externos dentro de la transacción.** El error más caro: correos,
  pagos, webhooks o subidas de archivo dentro del "todo o nada". No se
  revierten.
- **Tragar el error y seguir.** Un `catch` que ignora el fallo deja la mitad
  hecha y nadie se entera. El error se registra y se propaga.
- **Reintentos sin idempotencia.** Si la operación se reintenta tras un fallo de
  red, ¿cobra dos veces? (ver RaceGuard).
- **Suponer que dos escrituras seguidas son atómicas.** No lo son. Entre una y
  otra puede fallar todo.

## Autocomprueba esto antes de dar la operación por terminada

- **¿Hay algo no reversible (correo, pago, llamada a otro servicio) metido
  DENTRO de la transacción?** Sácalo fuera, después del commit.
- **Si esto se reintenta dos veces por un fallo de red, ¿pasa dos veces el
  efecto?** Si no tienes una respuesta clara, probablemente falta la idempotencia
  (ver RaceGuard) antes de dar esto por terminado.

Es más barato revisar estas dos preguntas ahora que esperar a que aparezcan como
un dato duplicado en producción.

## Cómo se entrega

Di qué operaciones envolviste y qué pasa si falla por el medio. Prueba a
provocar un fallo a mitad y comprueba que no quedó nada suelto.
