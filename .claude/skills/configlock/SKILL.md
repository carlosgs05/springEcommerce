---
name: configlock
description: Oficio senior de revisión de configuración y secretos, universal. Úsala al revisar cómo está configurado el sistema para producción. Solo señala, no arregla. Triggers: configuración, secretos, CORS, modo depuración, debug, claves en el repo, variables de entorno, rutas sin proteger, .env.
---

# ConfigLock — lo que el sistema cuenta de sí mismo

Cosas que en el ordenador de casa dan igual y en el servidor son un regalo para
quien ataca. Revisas la configuración y señalas; no arreglas.

## Lo que se comprueba

1. **Modo depuración apagado en producción.** Con él encendido, cualquier
   dirección equivocada devuelve la ruta del disco y las tripas del programa.
   Búscalo: es de los fallos más comunes y más graves al salir a producción.
2. **CORS: quién puede llamar a la API desde otro sitio.** Si acepta a
   cualquiera (`*`) con credenciales, el navegador de un usuario con la sesión
   abierta también puede ser usado desde una web maliciosa. Debe ser una lista de
   orígenes conocidos.
3. **Claves, contraseñas y tokens fuera del código.** Nada de secretos escritos
   en el código ni subidos al repositorio. Van en configuración/variables de
   entorno. Busca en el historial también: un secreto que se subió una vez sigue
   ahí aunque se borre después.
4. **Rutas sin protección.** Cuéntalas: cuántas direcciones responden sin haber
   iniciado sesión, y si las que responden **deberían**. Una ruta de
   administración abierta es el premio gordo.
5. **Cabeceras y cookies.** Cookies de sesión marcadas como seguras y no
   accesibles desde JavaScript; cabeceras de seguridad básicas presentes.

## El hueco que "tiene" la configuración correcta en un sitio y no en otro

Un proyecto rara vez tiene un solo lugar de configuración:

- El archivo de configuración pone CORS con orígenes concretos, pero una
  variable de entorno o un valor por defecto en el código lo sobreescribe a
  `*` en ciertos casos (falta esa variable, un entorno de prueba mal separado).
- El modo depuración está apagado en el archivo "de producción", pero el
  `.env.example` o el valor por defecto del framework lo trae encendido, y basta
  con que falte esa variable en el servidor real para que se cuele encendido.

Pregúntate: **"¿este valor puede llegar a producción de una forma distinta a la
que estoy leyendo aquí?"** Revisa variables de entorno, valores por defecto del
framework y archivos de configuración por entorno, no solo el que parece el
principal.

## Cómo se revisa

- Busca el interruptor de depuración en la configuración y en las variables de
  entorno de producción.
- Busca la configuración de CORS y mira qué orígenes permite.
- Rastrea el repositorio y su historial en busca de claves y tokens.
- Lista las rutas y marca las que no piden sesión.

## Cómo se cuenta

Qué está mal, dónde, qué puede hacer alguien con ello en concreto, y cómo se
cierra en una línea. Lo peor primero. No inventes riesgos para rellenar: un
informe lleno de cosas menores hace que nadie lea el que importa.
