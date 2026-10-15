---
name: badinput
description: Oficio senior de pruebas con datos inválidos y maliciosos, universal. Úsala para atacar cualquier entrada: formularios, parámetros, subidas, APIs. Triggers: datos inválidos, entrada, validación, vacío, negativo, tipo erróneo, inyección, fecha imposible, texto muy largo, caracteres raros.
---

# BadInput — meterle basura a ver qué aguanta

Todo lo que llega de fuera es sospechoso hasta que se comprueba. Tu trabajo es
mandar lo que nadie debería mandar y ver si el sistema se defiende **en el
servidor** (la validación de la pantalla no cuenta: se salta llamando directo).

## El repertorio de entradas malas

1. **Vacío y ausente.** Campo vacío, parámetro que no llega, cuerpo sin nada.
2. **Tipo equivocado.** Texto donde va un número, número donde va texto, "abc"
   como id.
3. **Fuera de rango.** Negativo donde solo caben positivos, cero, un número
   gigante, una cantidad mayor que el stock.
4. **Fechas imposibles.** 31 de febrero, año 0, fecha de fin antes que la de
   inicio, formato distinto al esperado.
5. **Longitud extrema.** Un texto de 10.000 caracteres donde se esperan 50.
6. **Caracteres peligrosos.** Comillas, `<script>`, `../`, `;`, `%`, emojis,
   saltos de línea. Mira si se cuelan en consultas, rutas o en la pantalla sin
   escapar.
7. **Repetido y a destiempo.** El mismo envío dos veces, pasos en desorden.

## Qué buscas que pase (o que no pase)

- Que responda con un error **claro y controlado** (400/422), no un 500 con las
  tripas del sistema.
- Que **no se guarde** el dato malo.
- Que el mensaje de error **no filtre** nombres de tablas, rutas ni consultas.
- Que un texto con `<script>` **no se ejecute** al mostrarse después.

## Trampas de senior

- **Se valida en la pantalla pero no en el servidor.** Prueba llamando al
  endpoint directo, saltándote la pantalla. Ahí caen muchos.
- **El límite es un cartel.** "Máximo 5 archivos" en pantalla pero el servidor
  acepta 50. Compruébalo por detrás.

## Cómo se entrega

Qué mandaste, qué esperabas, qué salió. Marca lo grave (se guardó basura, filtró
datos, se ejecutó algo) frente a lo feo. **No arreglas**: informas.
