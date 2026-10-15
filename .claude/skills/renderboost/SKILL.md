---
name: renderboost
description: Oficio senior de rendimiento de interfaz, universal. Úsala cuando una pantalla va lenta, una lista es larga, el arranque tarda, o antes de entregar algo que pinta mucho. Triggers: rendimiento, lento, re-render, lag, lista larga, virtualizar, bundle, carga diferida, memoria.
---

# RenderBoost — que la pantalla vaya ligera

Antes de optimizar, **mide**. Optimizar a ojo suele mover el problema de sitio.
Usa las herramientas del proyecto (perfilador del navegador, del framework) y
ataca lo que de verdad cuesta, no lo que parece.

## Las causas reales, por frecuencia

1. **Se vuelve a pintar todo por un cambio pequeño.** El 80% de la lentitud es
   esto: un componente alto se renderiza y arrastra a todos sus hijos. Corta la
   cadena donde toca (memoización, dividir componentes, subir/bajar el estado).
2. **Listas largas pintadas enteras.** Cientos o miles de filas en el DOM
   ahogan al navegador. Se virtualiza: solo se dibuja lo que se ve.
3. **Trabajo pesado en cada render.** Cálculos, ordenaciones o filtrados que se
   repiten en cada pintada. Se calculan una vez y se cachean.
4. **Todo el código llega de golpe.** El primer arranque baja megabytes que no
   se usan aún. Se parte por rutas y se carga bajo demanda lo secundario.
5. **Imágenes sin dieta.** Sin tamaño declarado (saltos de maqueta), sin formato
   moderno, sin carga diferida.

## Trampas de senior

- **Memoizar de más.** Envolver todo "por si acaso" añade coste y esconde el
  problema real. Memoiza lo caro y lo que se pasa a hijos memoizados, no todo.
- **Claves de lista inestables.** Usar el índice como clave hace que el framework
  reconstruya filas al reordenar. Usa un id estable.
- **Efectos que se disparan de más.** Dependencias mal puestas = llamadas y
  cálculos repetidos. Revisa qué las dispara.
- **Optimizar sin problema real.** Si va bien, no lo toques. Complejidad que no
  se necesita es deuda.

## Cómo se entrega

Di el número antes y después (tiempo de pintada, peso del bundle, filas en DOM).
Sin medida, no es una mejora, es una corazonada. Y si no pudiste medir, dilo.
