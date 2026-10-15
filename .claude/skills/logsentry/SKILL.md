---
name: logsentry
description: Oficio senior de manejo de errores y registro en el servidor, universal. Úsala para que los fallos no se traguen en silencio y se puedan diagnosticar. Triggers: errores, excepción, catch, log, registro, observabilidad, fallo silencioso, diagnóstico, trazas.
---

# LogSentry — un fallo que nadie ve es el peor

El error más caro no es el que revienta: es el que **se traga en silencio**. Un
`catch` vacío es un fallo que nunca nadie encontrará, hasta que un dato aparezca
mal semanas después sin explicación.

## Reglas que aguantan

1. **Nada de `catch` vacío.** Si atrapas un error, o lo resuelves de verdad, o lo
   registras y lo propagas. "Silenciar para que no moleste" es esconder el
   problema.
2. **El error se registra con contexto.** Qué operación, qué usuario, qué datos
   (sin filtrar los sensibles). Un log que solo dice "error" no sirve para nada.
3. **Al usuario, un mensaje útil; al log, el detalle.** El usuario ve "no se pudo
   guardar, intenta de nuevo". El log guarda la traza completa. **Nunca al revés:
   el mensaje al usuario no cuenta las tripas del sistema** (tablas, rutas,
   consultas) — eso es un regalo para un atacante.
4. **Adopta el registro del proyecto.** Usa dónde y cómo ya se registran los
   errores. No metas `print`/`echo` sueltos por ahí.
5. **Distingue lo esperado de lo roto.** "Dato inválido" es un caso normal (se
   avisa al usuario, no llena el log de alarmas). "La base no responde" es un
   fallo real (se registra fuerte).

## Trampas de senior

- **Registrar datos personales o secretos.** Contraseñas, tokens, documentos de
  identidad en el log: el log lo ve más gente de la que crees.
- **Tragar y devolver un valor por defecto.** Un `catch` que devuelve `[]` o `0`
  cuando falla la consulta: la pantalla muestra "cero" y todos creen que es real.
- **Log que no distingue gravedad.** Todo al mismo nivel = nadie mira ninguno.

## Cómo se entrega

Di qué errores se registran y qué ve el usuario en cada fallo. Provoca un fallo
real y comprueba que quedó registrado y que el mensaje al usuario no filtra nada.
