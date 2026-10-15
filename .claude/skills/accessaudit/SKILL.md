---
name: accessaudit
description: Oficio senior de revisión de identidad y permisos, universal. Úsala al revisar cualquier código que decida quién es alguien y qué puede hacer. Solo señala, no arregla. Triggers: revisar permisos, autorización, identidad, sesión, IDOR, acceso, escalada de privilegios, quién puede.
---

# AccessAudit — de dónde sale la identidad y dónde se comprueba el permiso

Revisas, no arreglas. Señalas, explicas por qué importa, y dices qué haría
alguien con el fallo. Estas son las dos preguntas que cierran la mayoría de los
agujeros graves.

## Pregunta 1: ¿de dónde sale la identidad de quien pide algo?

- **De la sesión/token → bien.**
- **De lo que manda el navegador (un parámetro, un campo) → ahí está el
  agujero.** Cualquiera escribe el identificador de otro y opera como él.
- **La trampa fina:** que se valide la contraseña de **una** persona y se
  modifiquen los datos de **otra**. Quien valida y quien recibe el cambio tienen
  que ser el mismo.

## Pregunta 2: ¿puede este usuario hacer esto, y dónde se comprueba?

- El permiso se comprueba **en el servidor, en cada petición** — no al abrir la
  pantalla. Esconder un botón no protege el endpoint.
- **Referencia directa insegura (IDOR):** `/factura/123` que sirve la factura sin
  comprobar de quién es. Cambiar el número da la de otro. Búscalo en cada
  endpoint que recibe un id.
- Una sesión dura días: si a alguien le quitan un permiso, ¿deja de funcionar al
  momento o sigue hasta que caduque la sesión?
- **Rutas nuevas sin candado:** compara con las vecinas. Si 20 exigen permiso y
  una no, esa una es el agujero.

## El hueco que "tiene" permiso y no protege el dato

Que un endpoint exija sesión no es lo mismo que exigir que el dato sea tuyo. Los
dos casos que se escapan si solo miras "¿pide login?":

- **Comprueba el rol pero no el dueño.** El middleware exige "usuario
  autenticado" o "rol X", y ahí para. Pero el id del recurso (factura, pedido,
  archivo) viene de la URL sin comprobar que pertenece a ESE usuario. Pasa el
  candado de la puerta principal y falta el de cada habitación.
- **La ruta nueva se coló fuera de la lista protegida.** Busca dónde se registra
  qué rutas exigen sesión (middleware global, decorador, grupo de rutas) y
  comprueba que la ruta que acabas de revisar está DENTRO de esa lista, no solo
  que "debería estarlo" por el nombre del archivo.

Pregúntate: **"con el permiso tal cual está escrito, ¿puedo pedir el recurso de
otro usuario cambiando solo el id?"** Pruébalo mentalmente con dos ids distintos
antes de dar por bueno un endpoint.

## Cómo se cuenta cada hallazgo

- **Qué está mal**, en una frase.
- **Dónde**, con archivo y línea.
- **Qué puede hacer alguien con eso**, en concreto: no "podría haber un
  problema", sino "cualquier usuario puede ver la factura de otro cambiando el
  número de la URL".
- **Qué haría falta para cerrarlo**, en una línea.

## Aviso importante

En algunos sistemas, que un usuario vea registros de cualquier área es una
**decisión de diseño**, no un fallo. Antes de reportar "ve datos de otra
zona/facultad/sede", mira si el proyecto lo hace así a propósito (su CLAUDE.md,
el patrón repetido). Si es la convención, no es hallazgo. No inventes riesgos.
