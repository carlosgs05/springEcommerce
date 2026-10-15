---
name: squadsync
description: Oficio senior de repartir trabajo entre agentes en paralelo, universal. Úsala al coordinar frontend, backend, base de datos y seguridad. Triggers: repartir, paralelo, rondas, coordinar agentes, quién a la vez, equipo, delegar.
---

# SquadSync — repartir bien y en paralelo

El líder reparte, no ejecuta. La diferencia entre rápido y lento está en lanzar a
la vez lo que no depende entre sí.

**Son equipo, no subagentes sueltos.** Cada uno trabaja de forma independiente
—no se pisan, no esperan al otro para escribir su parte— pero **siempre se
comunican**, y esa comunicación pasa siempre por ti: ellos no se hablan entre
sí directamente. Esto no es solo para cuando hay un contrato que compartir
(ver más abajo): si algo que descubre o decide un agente le sirve a otro que
vas a lanzar después —una convención del proyecto, un dato que no existía, un
límite que encontró—, se lo pasas. Repartir en paralelo no es lanzar y
olvidarte de cada uno; es que trabajen a la vez sin perder lo que el otro ya
sabe.

## El patrón de rondas

    ronda 1 (a la vez)   frontend  +  backend  +  base-de-datos
    ronda 2              seguridad     <- sobre lo ya escrito, si toca lo sensible
    ronda 3              quien lo escribió arregla lo que salió

Dentro de una ronda, **todos en el mismo mensaje** (varias llamadas al Agent tool
a la vez). Entre rondas, esperas. Lanzar en fila lo que podía ir junto multiplica
la espera sin ganar nada.

**`pruebas` no va por defecto.** Es un cambio de costo consciente: `frontend` y
`backend` se prueban a sí mismos (camino bueno y malo) antes de entregar, y
`pruebas` solo entra si la persona lo pide explícitamente para algo que le
preocupe. El líder siempre dice en su informe si nadie ajeno probó el trabajo.

## Las reglas del reparto

1. **Dos agentes NO tocan el mismo archivo a la vez.** Si hace falta, van en
   orden, no en paralelo.
2. **Seguridad va al final, siempre que el encargo toque usuarios, permisos,
   datos personales, dinero o archivos**, sobre código ya escrito. Y va aunque
   el cambio parezca pequeño: los fallos salen de los cambios que parecían
   pequeños.
3. **Si seguridad (o `pruebas`, cuando se pidió) encuentra algo, se arregla
   antes de entregar.** No se anota para luego.
4. **Entrega a cada agente el trabajo masticado.** Dile los 2-3 archivos exactos a
   imitar, el idioma de los textos y de dónde salen los datos. Así no reexplora y
   va directo — ahorra turnos y va al grano.
5. **Al corregirle algo a un especialista, lánzalo de nuevo limpio — no
   reanudes su conversación.** Cada corrección reanudada se suma encima de la
   conversación anterior — sus intentos, sus errores, sus propias dudas.
   Reanudado varias veces, esa conversación se vuelve gigante y cada vuelta
   siguiente se vuelve más lenta y más cara aunque la corrección sea chica
   (pasó de verdad: una tabla terminó en más de diez reanudaciones, 500 mil
   tokens acumulados y una vuelta de 82 minutos). Ya le diste el trabajo
   masticado (regla 4) — no necesita su memoria de conversación, necesita un
   encargo completo. Resume tú qué falló y qué falta, y lánzalo como encargo
   nuevo.

## El contrato compartido: cuando dos agentes tocan la misma interfaz

No hace falta que dos agentes toquen el mismo archivo para chocar. Pasa en dos
sitios:

- **Front y back**, con lo que viaja entre pantalla y servidor —un endpoint,
  los campos de una respuesta, un tipo de dato.
- **Backend y base-de-datos**, con una columna o tabla nueva —el nombre
  exacto, el tipo, si acepta vacío. Si backend escribe código esperando una
  columna `fecha_entrega` y el script de base-de-datos la crea como
  `fecha_envio`, los dos entregan bien por separado y falla en cuanto se
  juntan.

En cualquiera de los dos casos, **no lo inventan cada uno por su lado**. Eso es
lo que rompe sin que nadie viera el archivo del otro: cada pieza pasa sus
propias pruebas, y falla igual cuando se juntan.

Antes de lanzar la ronda:

1. **Decide tú el contrato**, o pide a quien lo origina que lo defina primero:
   - Front+back: qué campos, qué nombres, qué forma tiene la respuesta.
   - Backend+base-de-datos: el nombre y tipo exacto de lo nuevo lo define
     `base-de-datos` primero (es quien sabe qué acepta el motor), y backend
     escribe su código sobre ESE nombre, no sobre el que le parecería lógico.
2. **Pasa el mismo contrato a los dos** en el encargo de cada uno, con las
   mismas palabras. No dejes que cada uno intuya la forma del otro lado.
3. Si el contrato cambia a mitad de camino (uno de los dos descubre que no
   funciona así), **tú lo relayas al otro** antes de que siga. Los agentes no
   se hablan entre sí — el equipo se coordina siempre a través de ti. Son
   equipo, no piezas sueltas que trabajan a ciegas cada una por su cuenta.

## Cuándo NO se reparte

- Cambio de una sola parte → un solo agente, no reparto.
- Cambio **solo visual** (ancho, color, espaciado, letra) → lo mira quien
  pidió, directo en el navegador. Pero si ese cambio "visual" mueve algo
  conectado al servidor (qué se guarda o borra), sí va a seguridad.

## Front y back cambiaron juntos: que se comprueben hablando entre sí

Si un encargo tocó back y front a la vez, no basta con que cada uno pase sus
pruebas por separado — "front bien" + "back bien" no es "front y back bien
juntos". Como `pruebas` ya no entra por defecto, esta comprobación la hacen
`frontend` y `backend` entre ellos: antes de dar por cerrado, uno de los dos
(el que cerró último) verifica que la pantalla real le sigue hablando al
endpoint real con el contrato nuevo, no solo que cada lado funciona con su
propia idea de cómo es el otro. Puntual sobre lo que cambió, no una vuelta
completa. Si algo así te preocupa más de lo normal, ahí sí vale la pena pedir
`pruebas` explícitamente.

## Cómo se entrega

Di a quién lanzaste, en qué ronda, y qué hará cada uno. El reparto claro es lo que
hace que el trabajo fluya sin choques.
