---
name: querytune
description: Oficio senior de rendimiento de consultas e índices, universal. Úsala cuando una consulta va lenta, una lista tarda, o antes de dar por buena una consulta sobre tablas grandes. Triggers: consulta lenta, índice, plan de ejecución, explain, optimizar query, tarda, escaneo, N+1.
---

# QueryTune — por qué esa consulta va lenta

Antes de tocar nada, **pídele al motor su plan** (`EXPLAIN` o equivalente). El
plan dice la verdad: si está escaneando la tabla entera o usando un índice. A ojo
se optimiza mal.

## Las causas reales, por frecuencia

1. **Falta el índice donde se filtra u ordena.** Sin índice, el motor lee toda la
   tabla. Con muchos registros, eso es la lentitud. Se indexa la columna por la
   que se busca, se une o se ordena.
2. **N+1: una consulta que dispara mil.** Traer una lista y por cada fila hacer
   otra consulta. Va bien con 10 filas y muere con 10.000. Se trae todo junto
   (join o carga anticipada).
3. **`SELECT *` cuando hacen falta tres columnas.** Trae de más, ocupa memoria y
   red, y evita que el motor resuelva todo desde el índice.
4. **Funciones sobre la columna en el filtro.** `WHERE año(fecha) = 2024` impide
   usar el índice de `fecha`. Se reescribe por rango.
5. **Traer todo para contar o paginar mal.** Paginar con desplazamientos enormes
   es lento; hay técnicas mejores para páginas profundas.

## Trampas de senior

- **Indexar de más.** Cada índice acelera la lectura pero frena cada escritura y
  ocupa espacio. Indexa lo que se consulta, no todo.
- **Índice que no sirve por el orden.** En un índice de varias columnas, el orden
  importa: sirve para filtrar por la primera, no por la segunda sola.
- **Optimizar sobre datos de juguete.** Con 20 filas todo vuela. Prueba con
  volumen parecido al real, o el plan miente.

## Cómo se entrega

Enseña el plan antes y después, y el tiempo. Como esto puede implicar crear un
índice (cambio de esquema), entregas el script y **no lo ejecutas** contra una
base real; lo pruebas en local o de pruebas.
