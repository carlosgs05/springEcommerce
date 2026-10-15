---
name: leakguard
description: Oficio senior de revisión de exposición de datos, universal. Úsala al revisar qué datos salen y hacia dónde. Solo señala, no arregla. Triggers: fuga de datos, datos personales, PII, mensaje de error, log, URL, exposición, filtrar información, privacidad.
---

# LeakGuard — qué datos se escapan y por dónde

Un dato sensible no hace falta robarlo si el sistema lo deja a la vista. Revisas
por dónde puede salir lo que no debería, y hacia quién. Señalas, no arreglas.

## Dónde se escapan los datos

1. **En los mensajes de error.** Un error nunca debe contar cómo está hecho el
   sistema por dentro: nombres de tablas, rutas del disco, trozos de consulta.
   Eso es un mapa para un atacante. Al usuario, mensaje útil y genérico; el
   detalle, al log interno.
2. **En los registros (logs).** Contraseñas, tokens, documentos, correos o datos
   de salud escritos en el log: lo ve más gente de la que debería, y se queda ahí.
3. **En las URLs.** Datos personales o secretos en la dirección (parámetros) se
   guardan en el historial, en el servidor y en las estadísticas. Nada sensible
   en la URL.
4. **En respuestas que devuelven de más.** Un endpoint que suelta el objeto
   entero con campos internos (contraseña cifrada, notas privadas, datos de
   otros). Devuelve solo lo que hace falta.
5. **Donde lo ve quien no debe.** Un dato en una bandeja o pantalla compartida
   que ve más gente de la necesaria.

## El hueco que "tiene" manejo de errores y aun así filtra

Que exista un bloque genérico de errores no garantiza que TODOS pasen por él:

- Busca los `catch`/`except` **sueltos**, uno por uno, no solo el manejador
  global. Uno de ellos, en el camino menos probado, puede devolver
  `error.message` o el objeto de excepción completo tal cual al cliente.
- Un log "ya filtra datos sensibles" en un sitio, pero un log distinto más abajo
  interpola el objeto entero de la petición (que incluye contraseña o token) sin
  pasar por ese filtro.

Pregúntate por cada `catch`: **"¿este bloque en concreto, devuelve el error
crudo o el mensaje limpio?"** No asumas que todos siguen la misma regla solo
porque la mayoría lo hace.

## Cómo se revisa

- Provoca (o busca) un error y mira qué cuenta: ¿genérico o las tripas?
- Mira qué se escribe en el log alrededor de datos personales o de pagos.
- Revisa qué campos devuelve cada endpoint frente a los que la pantalla usa.

## Aviso importante

Que un usuario con permiso vea registros de cualquier área puede ser **decisión
de diseño** del proyecto, no una fuga. Antes de reportarlo, mira si es la
convención (su CLAUDE.md, el patrón repetido). Lo que sí es fuga siempre: tripas
del sistema en errores, secretos en logs/URLs, y campos internos en respuestas.

## Cómo se cuenta

Qué se filtra, dónde (archivo:línea), quién lo ve y qué haría con ello, y cómo se
cerraría. Lo peor primero.
