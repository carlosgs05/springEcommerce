---
name: stateflow
description: Oficio senior de gestión de estado en la interfaz, universal. Úsala cuando la pantalla se desincroniza de los datos, hay que cachear respuestas, evitar pantallazos o coordinar estado entre componentes. Triggers: estado, state, sincronía, caché, datos desactualizados, recargar, fuente de verdad.
---

# StateFlow — el estado ordenado

El origen de la mayoría de bugs de interfaz es el mismo: **la pantalla y los
datos dejan de coincidir.** La regla que lo evita: cada dato tiene **una sola
fuente de verdad**, y todo lo demás se deriva de ella.

## Reglas que aguantan

1. **Separa el estado del servidor del estado de la pantalla.** No son lo mismo.
   Lo del servidor (la lista de clientes) se cachea y se refresca. Lo de la
   pantalla (qué pestaña está abierta) vive local. Mezclarlos es el desorden.
2. **No dupliques.** Si un dato se puede calcular de otro, se calcula, no se
   guarda aparte. Dos copias del mismo dato acaban discrepando.
3. **El estado vive lo más abajo posible.** Súbelo solo hasta donde de verdad se
   comparte. Estado global para todo convierte cada cambio en un re-render de
   toda la app.
4. **Adopta el patrón del proyecto.** Si ya usan un gestor de estado o un cliente
   de datos, úsalo. No metas otro al lado.

## Trampas de senior

- **Actualización optimista sin vuelta atrás.** Pintas el cambio antes de que el
  servidor confirme (bien, va rápido), pero si el servidor falla hay que
  revertir y avisar. Si no, la pantalla miente.
- **Estado obsoleto en un cierre.** Un manejador captura un valor viejo del
  estado y opera sobre él. Clásico y difícil de ver.
- **Cargar en cascada.** Pantalla espera dato A, luego B, luego C, uno tras
  otro. Lo que no dependa entre sí se pide a la vez.
- **No limpiar al desmontar.** Suscripciones y temporizadores que siguen vivos
  tras cerrar el componente: fugas y errores fantasma.

## Cómo se entrega

Di cuál es la fuente de verdad de cada dato que tocaste y cómo se refresca.
Prueba el caso de "el dato cambió por detrás": ¿la pantalla se entera?
