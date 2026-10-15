---
name: lockwatch
description: Oficio senior de bloqueos, deadlocks y transacciones en la base de datos, universal. Úsala cuando hay atascos, esperas, deadlocks o transacciones largas. Triggers: bloqueo, lock, deadlock, atasco, espera, transacción larga, timeout, contención, se cuelga.
---

# LockWatch — cuando la base se atasca

Un bloqueo es normal: protege un dato mientras alguien lo cambia. El problema es
cuando **dura de más o dos operaciones se bloquean entre sí** (deadlock). Se ve
como "la app se cuelga a ratos sin razón" — y la razón está aquí.

## Reglas que aguantan

1. **Transacciones cortas.** Abre, haz lo mínimo, cierra. Cuanto más dura una
   transacción, más tiempo tiene bloqueado lo suyo y más gente espera.
2. **Nada lento dentro de una transacción.** Llamar a otro servicio, esperar una
   respuesta o hacer un cálculo grande con la transacción abierta bloquea filas
   todo ese rato. Prepara fuera, entra, escribe, sal.
3. **Toca las cosas siempre en el mismo orden.** Los deadlocks salen cuando una
   operación bloquea A y pide B, y otra bloquea B y pide A. Si todos toman los
   recursos en el mismo orden, no se cruzan.
4. **Bloquea lo justo.** Bloquear una fila es barato; bloquear la tabla entera
   para y a todos. Usa el bloqueo más fino que resuelva.

## Trampas de senior

- **La transacción que engloba una petición de red.** El clásico: dentro de la
  transacción se llama a una API externa. Si tarda, todo lo que toque esas filas
  espera.
- **Leer con bloqueo sin querer.** Ciertas lecturas para actualizar bloquean;
  saber cuándo tu motor lo hace evita sorpresas.
- **Reintentar el deadlock sin límite.** Un deadlock se puede reintentar, pero
  con tope y con espera; en bucle ciego, empeora el atasco.
- **Migraciones en hora punta.** Un `ALTER` que bloquea la tabla a las 12 del
  mediodía para el negocio (ver ZeroDown).

## Cómo se entrega

Di dónde estaba el atasco y cómo lo acortaste (transacción más corta, orden fijo,
bloqueo más fino). Como toca la base, no ejecutas contra nada real: lo razonas y
lo pruebas en local.
