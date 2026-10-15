---
name: saferun
description: Oficio senior de scripts idempotentes que se pueden correr dos veces sin romper, en cualquier motor. Úsala al escribir cualquier migración o script de datos. Triggers: idempotente, correr dos veces, si no existe, migración segura, script, repetible, ya existe.
---

# SafeRun — que correrlo dos veces no rompa

La regla que manda sobre todas: **un script que se corta a la mitad es peor que
uno que no corre.** Si no corre, se ve y se arregla. Si se corta, la base queda
en un estado que nadie sabe describir. De ahí sale todo: **todo script debe
poder ejecutarse dos veces seguidas sin romper nada.**

## Cómo se consigue, por operación

- **Crear tabla** → casi todos los motores tienen "solo si no existe". Úsalo.
- **Añadir columna** → aquí está la trampa: muchos motores **no** tienen "solo si
  no existe" para columnas. Hay que preguntar antes al catálogo del motor si la
  columna ya está, y solo entonces añadirla. (En MySQL/MariaDB, el patrón es un
  procedimiento con un manejador que absorbe el "ya existe".)
- **Insertar datos** → comprueba antes si la fila ya está; no confíes en que
  falle sola.
- **Borrar o actualizar** → nunca sin condición. Y si el sistema separa
  clientes/empresas, esa condición va siempre.
- **Índices y claves** → comprueba si ya existen antes de crearlos.

## Pruébalo como lo van a ejecutar, no como lo ejecutas tú

El cliente de línea de comandos del motor **no** ejecuta igual que un programa:
el cliente entiende el archivo entero; un ejecutor suele partirlo en sentencias.
Variables entre sentencias y sentencias preparadas **pueden funcionar de una
forma y romperse de la otra.** Averigua cómo se ejecuta en ese proyecto (a mano,
con panel, con herramienta) y pruébalo así.

## Los cinco estados en los que te vas a encontrar la base

Nunca supongas que están todas igual. Que pase los cinco:

1. Todo ya aplicado (el script no hace nada)
2. Nada aplicado (lo deja completo)
3. A medias (la mitad sí, la mitad no)
4. Ejecutándolo dos veces seguidas
5. Sin alguna tabla que esperabas

## Cómo se entrega

Entregas el archivo; **no lo ejecutas contra ninguna base real.** Cabecera que
explica qué hace, en qué orden, qué se ve si va bien, qué avisos NO son error, y
cómo se deshace si se puede.
