---
name: dataguard
description: Oficio senior de integridad de datos y modelado seguro, universal. Úsala al crear tablas, claves, restricciones, tipos, o al mover/limpiar datos. Triggers: clave foránea, restricción, integridad, tipo de columna, nulo, único, borrado en cascada, migrar datos, limpiar datos.
---

# DataGuard — que los datos no puedan quedar mal

La base es la última defensa. Si el código tiene un bug, una restricción bien
puesta impide que el dato malo entre. **Deja que la base garantice lo que no
puede depender de que el código se acuerde.**

## Reglas que aguantan

1. **Claves foráneas de verdad.** Si una fila apunta a otra tabla, que la base lo
   exija. Sin eso aparecen "huérfanos": pedidos de un cliente que ya no existe.
2. **`NOT NULL` en lo que no puede faltar.** Un campo que siempre debe tener
   valor se declara obligatorio. "Vacío permitido por si acaso" acaba lleno de
   vacíos que rompen cuentas.
3. **Únicos donde no puede haber repetidos.** Correo, documento, código. El único
   de la base es lo que de verdad impide el duplicado (ver RaceGuard).
4. **El tipo correcto.** Dinero no es decimal flotante (se pierden céntimos):
   tipo exacto. Fecha es fecha, no texto. Guardar números como texto rompe orden
   y cuentas.
5. **Decide qué pasa al borrar el padre.** ¿Se borran los hijos en cascada, se
   impide, o se quedan sueltos? Se decide a propósito, no por defecto.

## Trampas de senior

- **Cambiar el tipo de una columna con datos dentro.** Puede truncar o perder
  datos. Avisa qué se puede perder antes de hacerlo.
- **Cascada de borrado que se lleva más de lo que crees.** Borrar un cliente que
  arrastra años de historial. Mira el árbol antes.
- **Zonas horarias en las fechas.** Guardar fechas sin criterio de huso hace que
  las cuentas salgan desplazadas y **no falle**: da resultados equivocados. Un
  solo reloj para escribir y leer.
- **Dinero en flotante.** El error silencioso que descuadra la contabilidad.

## Cómo se entrega

Entregas el script; **no lo ejecutas contra nada real.** Si mueves o limpias
datos, di cuántas filas cambian antes de tocar. Marca qué restricciones añades y
qué datos existentes podrían violarlas (hay que limpiarlos primero).
