---
name: zerodown
description: Oficio senior de migraciones de esquema sin tumbar el sistema, universal. Úsala al cambiar tablas o columnas en una base que está en uso. Triggers: migración, esquema, sin downtime, cambiar columna, renombrar, alter table, en caliente, despliegue, compatibilidad.
---

# ZeroDown — cambiar el esquema sin apagar nada

Cambiar la base mientras la app sigue viva es donde se rompen los sistemas. El
truco: **ningún cambio de esquema debe romper la versión de la app que está
corriendo ahora mismo.** Se hace por pasos, cada uno compatible con el anterior.

## El patrón que no falla: expandir, migrar, contraer

1. **Expandir.** Añade lo nuevo sin quitar lo viejo. Columna nueva que admite
   vacío, tabla nueva. La app vieja la ignora, sigue funcionando.
2. **Migrar.** Rellena lo nuevo con los datos, en lotes si son muchos. Despliega
   la app que ya escribe en lo viejo Y en lo nuevo.
3. **Contraer.** Cuando nadie usa ya lo viejo, se quita. En otro despliegue, no
   en el mismo.

Renombrar una columna de golpe rompe la app vieja en el instante del cambio. Se
hace: añade la nueva, copia, haz que la app use la nueva, y luego borra la vieja.

## Reglas que aguantan

- **Columna nueva obligatoria = dos pasos.** Primero se añade admitiendo vacío y
  con un valor por defecto; se rellena; y solo después se vuelve obligatoria. Si
  la creas obligatoria de golpe en una tabla con datos, revienta.
- **Cuidado con los bloqueos.** En algunos motores, cierto `ALTER` bloquea la
  tabla entera mientras dura. En una tabla enorme eso es el sistema parado. Mira
  cómo se comporta tu motor y su versión.
- **Índices en tablas grandes, en concurrente** si el motor lo permite; si no,
  en ventana de poco uso.

## Trampas de senior

- **Un solo script que hace expandir y contraer a la vez.** Rompe la app vieja en
  el intervalo del despliegue.
- **Rellenar millones de filas en una sentencia.** Bloquea y agota memoria. En
  lotes.
- **Suponer que el esquema de producción es igual al local.** Puede no serlo. El
  script debe ser idempotente (ver SafeRun) y comprobar antes de tocar.

## Cómo se entrega

Como es un cambio de base: **entregas el script, no lo ejecutas contra nada
real.** Di el orden de los pasos, cuáles van en despliegues distintos, y qué se
ve si va bien. Marca lo que bloquea y cuánto podría durar.
