---
name: formshield
description: Oficio senior de formularios robustos, universal. Úsala al construir o arreglar cualquier formulario: validación, envío, errores, no perder lo escrito. Triggers: formulario, form, validación, enviar, submit, campos, guardar, doble envío, datos perdidos.
---

# FormShield — formularios que no dan disgustos

Un formulario es donde el usuario más se frustra y donde más se duplican y
pierden datos. **Adopta la forma del proyecto** (su librería de formularios, sus
componentes de campo) y asegúrate de que cumple esto.

## Lo que lleva todo formulario

1. **Se valida antes de enviar, y el mensaje dice cómo arreglarlo.** No "campo
   inválido": "el correo necesita una @". El mensaje va junto al campo, no en un
   cartel lejos.
2. **El botón de enviar se bloquea mientras envía.** Si no, la gente pulsa dos
   veces y se duplica el envío. Al terminar, se desbloquea.
3. **Lo escrito no se pierde si el envío falla.** El error del servidor no borra
   el formulario. Se muestra el error y se conserva todo.
4. **Los errores del servidor se pintan en su campo.** Si el servidor dice "ese
   correo ya existe", va junto al correo, no en un genérico.
5. **Números y fechas se muestran como se leen en ese país**, pero se envían en
   el formato que espera el servidor. No confundas mostrar con guardar.

## Trampas de senior

- **Validar solo en la pantalla.** La validación de pantalla es comodidad, no
  defensa: quien llame al servidor directo se la salta. El servidor valida
  siempre (eso es del backend, pero recuérdalo al entregar).
- **Perder el foco al validar.** Que el mensaje de error no salte el cursor a
  otro sitio.
- **Autocompletar roto.** Campos de correo, teléfono o dirección deben dejar que
  el navegador autocomplete (atributos correctos). Ayuda mucho en móvil.
- **Enviar en cada tecla.** Validar mientras escribe está bien; enviar al
  servidor en cada tecla, no.
- **Formularios largos sin guardar progreso.** Si es largo, no perder lo hecho
  al recargar.

## Cómo se entrega

Prueba el camino malo: enviar vacío, enviar dos veces rápido, que el servidor
falle. Di qué pasó en cada uno. El camino bueno lo prueba cualquiera.
