---
name: apicraft
description: Oficio senior de diseño de endpoints y APIs, universal. Úsala al crear o cambiar rutas, respuestas, contratos, paginación o versiones. Triggers: API, endpoint, ruta, respuesta, contrato, paginación, versionado, REST, status code, DTO.
---

# APICraft — endpoints coherentes

Un buen endpoint es predecible: quien lo usa adivina cómo se comporta el
siguiente. **Copia la forma que ya tenga el proyecto** (cómo declara rutas, cómo
devuelve respuestas y errores) antes de añadir la tuya. Un endpoint que no se
parece a sus vecinos es el que rompe la coherencia.

## Reglas que aguantan

1. **Misma forma de respuesta en toda la API.** Éxito y error con la misma
   estructura siempre. Si unos devuelven `{data:...}` y otros el objeto pelado,
   el cliente sufre.
2. **Códigos de estado honestos.** 200 solo si fue bien. 400 dato inválido, 401
   sin identificar, 403 identificado pero sin permiso, 404 no existe, 409
   conflicto, 422 validación, 500 fallo del servidor. No devuelvas 200 con un
   "error" dentro.
3. **Paginación desde el día uno.** Toda lista que puede crecer se pagina. Una
   lista sin tope tumba el servidor cuando hay muchos registros.
4. **El contrato es sagrado.** Cambiar el nombre o el tipo de un campo rompe a
   quien lo consume. Si hay que cambiar, se versiona o se añade sin quitar.
5. **Nombres por recurso, no por acción.** El verbo lo pone el método HTTP.

## Trampas de senior

- **Devolver de más.** Un endpoint que suelta todo el objeto (con campos
  internos o de otros) filtra datos y ata el contrato. Devuelve lo que se pide.
- **Filtros y orden sin validar.** Aceptar cualquier campo para ordenar o filtrar
  abre la puerta a consultas raras o lentas. Lista blanca.
- **Errores mudos.** Un 500 que no dice nada al cliente y tampoco registra nada
  dentro es un fallo que nadie encontrará.
- **N+1 escondido.** Un endpoint que lista y por cada fila hace otra consulta.
  Va bien con 10 filas y muere con 10.000.

## Cómo se entrega

Di qué endpoints tocaste, qué devuelven en éxito y en error, y si cambiaste algún
contrato existente. Prueba el camino malo: sin permiso, dato inválido, no existe.
