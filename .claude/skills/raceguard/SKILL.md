---
name: raceguard
description: Oficio senior de concurrencia e idempotencia en el servidor, universal. Úsala cuando dos peticiones pueden chocar, algo se puede reintentar, o hay contadores/saldos/stock. Triggers: concurrencia, condición de carrera, race condition, idempotencia, doble clic, reintento, bloqueo, saldo, stock, contador.
---

# RaceGuard — cuando dos cosas pasan a la vez

En un servidor real nunca hay una sola petición. Dos usuarios (o el mismo dando
doble clic) hacen lo mismo en el mismo instante. El código que solo se pensó
"de uno en uno" falla justo aquí, y falla en producción, no en tu prueba.

## Reglas que aguantan

1. **Idempotencia donde importa.** Pedir dos veces lo mismo no debe cobrar dos
   veces ni duplicar. Una clave de operación, un único en la base, o comprobar
   antes de crear. El doble clic y el reintento de red son la norma, no la
   excepción.
2. **Leer-modificar-escribir es una trampa.** Leer un saldo, sumarle, y
   guardarlo: si dos lo hacen a la vez, uno pisa al otro y se pierde dinero. Se
   hace en un solo paso en la base (`UPDATE saldo = saldo + x`) o con un bloqueo.
3. **Bloquea lo justo, el menor tiempo.** Un bloqueo protege, pero si es amplio o
   largo, crea atascos y deadlocks.
4. **El único de la base es tu red de seguridad.** Comprobar "¿ya existe?" en el
   código no basta: entre la comprobación y el insert, otro pudo entrar. El
   índice único lo garantiza de verdad.

## Trampas de senior

- **Comprobar y luego actuar (check-then-act).** "Si no existe, créalo": dos a la
  vez pasan la comprobación y crean dos. Deja que el único de la base decida.
- **Contadores desde el código.** `saldo = saldo_leído + 1` pierde
  actualizaciones. Suma en la base.
- **Stock que se vende de más.** Reservar sin bloqueo vende el último dos veces.
- **Suponer orden.** Dos peticiones no llegan en el orden que imaginas.

## Cómo se entrega

Di dónde puede haber choque y cómo lo cerraste (único, bloqueo, operación
atómica). Prueba a lanzar la misma operación dos veces casi a la vez.
