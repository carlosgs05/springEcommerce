---
name: truthtest
description: Oficio senior de verificar que el dato es correcto, no solo que responde, universal. Úsala siempre que una respuesta "parece" bien. Triggers: verificar datos, dato correcto, cuadra, resultado equivocado, falso positivo, que responda no es que esté bien, contra la base.
---

# TruthTest — que responda no es que esté bien

El fallo más caro no revienta: **responde tan tranquilo y el dato está mal.**
Ninguna prueba automática que solo mira "¿respondió 200?" lo encuentra. Hay que
mirar el dato de verdad.

## Qué se comprueba

1. **Que el número cuadre.** Un importe, una cantidad, un total: compáralo con lo
   que hay guardado y con la cuenta hecha a mano. Un total que suma mal responde
   igual de rápido que uno correcto.
2. **Que salgan los que deben y NINGUNO que no.** Una lista filtrada: revisa que
   no se cuele uno que no cumple, y que no falte uno que sí. Los dos errores.
3. **Que no se cruce lo de otros.** Si hay clientes/empresas separadas, que la
   consulta de uno no traiga nada de otro.
4. **Desconfía del cero.** Cero resultados puede ser correcto o puede ser una
   consulta que mira donde no es. Comprueba que ahí **debería** haber algo, con
   un dato que sepas que existe.
5. **Que lo guardado sea lo que se mandó.** Guarda algo y ve a la base a mirar
   que quedó igual: sin recortes, sin redondeos, sin desfase de fecha.

## Trampas de senior

- **Confiar en la pantalla.** La pantalla puede formatear, redondear o cachear.
  Comprueba en el origen (la base, la respuesta cruda del servidor).
- **Datos de juguete que coinciden por suerte.** Con un solo registro, una
  consulta mal filtrada acierta de casualidad. Prueba con varios que se parezcan.
- **Fechas desfasadas por zona horaria.** El importe está bien pero la fecha sale
  un día corrida: cuadra en tu reloj y no en el de la base.
- **Redondeo de dinero.** Céntimos que se pierden y solo se ven al sumar muchos.

## El hueco que "tiene" una prueba y no comprueba nada

Una prueba que existe y pasa en verde puede no estar mirando lo que importa:

- **Una prueba que solo comprueba que no explotó, no que el número sea el
  correcto.** `assert response.status == 200` pasa igual con el total bien y con
  el total mal. Si la prueba no compara el valor exacto contra uno esperado, no
  está probando nada de fondo.
- **Un dato de prueba que coincide con el resultado por casualidad.** Si el
  precio de prueba es 0 o el descuento es 0%, un cálculo roto puede dar el mismo
  resultado que uno correcto. Usa valores donde un error SÍ cambiaría el
  resultado (precio y descuento distintos de cero, con decimales).

Pregúntate por cada verificación: **"si el cálculo estuviera mal de una forma
razonable (redondeo, signo invertido, campo cambiado), ¿esta prueba lo pillaría
o pasaría igual?"** Si pasaría igual, no es una prueba de fondo, es una prueba
de que no crasheó.

## Cómo se entrega

Di qué dato comprobaste, contra qué (la base, un cálculo a mano), y si cuadró.
"Todo bien" sin decir qué miraste no vale. **No arreglas**: informas.
