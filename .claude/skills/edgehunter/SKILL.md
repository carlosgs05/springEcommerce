---
name: edgehunter
description: Oficio senior de casos límite al probar, universal. Úsala al probar cualquier cosa: los bordes son donde vive la mayoría de los bugs. Triggers: casos límite, bordes, cero uno muchos, primero último, vacío, máximo, mínimo, desbordamiento, límite.
---

# EdgeHunter — los bordes, que es donde se rompe

El camino bueno lo probó quien lo escribió. Los bugs viven en los bordes: el
cero, el uno, el muchísimo, el primero y el último. **Prueba siempre los
extremos, no el caso cómodo del medio.**

## La lista de bordes que hay que recorrer

1. **Cero elementos.** Lista vacía, cero resultados, cero permisos. ¿Se ve algo
   sensato o revienta / muestra "undefined"?
2. **Exactamente uno.** Muchos bugs aparecen con un solo elemento (plurales,
   separadores, "y" final).
3. **Muchísimos.** Miles de filas: ¿se pagina, se ralentiza, se cuelga?
4. **El primero y el último.** El primero de una lista, el último, el que está
   justo en el límite de la página.
5. **El límite exacto y su alrededor.** Si el máximo es 5: prueba 4, 5 y 6. Si es
   "hasta 100 caracteres": 99, 100, 101.
6. **Valores extremos.** El número más grande posible, el más pequeño, el
   negativo, el cero, la fecha muy antigua y la muy futura.

## Trampas de senior

- **Desbordamiento y precisión.** Sumas que pasan del máximo, decimales que
  pierden céntimos, divisiones entre cero.
- **Off-by-one.** El clásico: se procesa uno de más o uno de menos en los
  extremos de un rango.
- **Vacío que parece bien.** Cero resultados puede ser correcto o puede ser que
  la consulta mira donde no es. Comprueba que ahí **debería** haber algo.
- **El último de la última página.** La paginación falla justo en el corte.

## Cómo se entrega

De cada borde probado: qué hiciste, qué esperabas, qué salió (el error tal cual).
Di qué bordes NO llegaste a probar. **No arreglas nada**: informas.
