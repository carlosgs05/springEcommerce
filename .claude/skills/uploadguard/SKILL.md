---
name: uploadguard
description: Oficio senior de revisión de subida de archivos, universal. Úsala al revisar cualquier sitio donde el usuario sube archivos. Solo señala, no arregla. Triggers: subida de archivos, upload, adjuntar, imagen, fichero, extensión, tipo de archivo, almacenamiento, ejecutar archivo.
---

# UploadGuard — el agujero que parece cerrado y no lo está

La subida de archivos es de los agujeros más peligrosos y de los que más se creen
resueltos. El clásico: se mira **el contenido** del archivo para ver que es una
imagen, pero no **la extensión del nombre**. Una imagen de verdad con
instrucciones pegadas al final pasa esa comprobación, se guarda como `foto.php`, y
el servidor las ejecuta en cuanto alguien abre esa dirección.

## Las cuatro comprobaciones, y las cuatro hacen falta

1. **La extensión**, contra una lista blanca de las permitidas. No basta con
   mirar el contenido; la extensión decide qué ejecuta el servidor.
2. **El nombre**: se genera uno nuevo. **Nunca** se conserva el que puso la
   persona (puede traer `../`, puede traer una extensión doble como
   `foto.php.jpg`).
3. **La carpeta**: donde se guardan las subidas, el servidor no debe ejecutar
   nada. Y si el navegador puede abrir esa carpeta, que no queden archivos
   ejecutables dentro.
4. **El tamaño**: con un tope. Sin él, cualquiera llena el disco subiendo cosas
   enormes.

## Cómo se revisa

- Compara con el resto del proyecto: si veinte subidas validan la extensión y una
  no, **esa una es el agujero.**
- Mira las extensiones dobles y los nombres con `../` (ver InjectShield para el
  recorrido de ruta).
- Comprueba que el tipo declarado y el real coinciden, pero **no confíes solo en
  el tipo declarado**: lo pone el navegador y se puede falsear.

## El hueco que "cumple las cuatro" y no protege nada

Esto es lo que se te escapa si solo marcas la lista de arriba como cumplida sin
mirar más:

- **¿Qué valida el código exactamente — el nombre del archivo o su contenido?**
  Un `if` que mira `nombreArchivo.endsWith('.pdf')` valida el **nombre**, no que
  el archivo sea de verdad un PDF. Un archivo ejecutable renombrado a
  `informe.pdf` pasa esa comprobación entera. Busca si en algún punto se abre o
  inspecciona el contenido real (cabecera del archivo, tipo MIME detectado por el
  propio servidor, no el que manda el navegador) — si no lo hay, **la
  comprobación de extensión es solo un nombre bonito, no una defensa.**
- **Pregúntate: "con esta comprobación tal cual está escrita, ¿qué archivo
  malicioso pasaría igual?"** Si la respuesta es "cualquiera con el nombre
  correcto", ahí está el hallazgo, aunque el código "tenga" la comprobación.
- Aplica lo mismo a las otras tres: un tamaño que se valida en el frontend pero
  no en el backend "existe" y no protege nada; una carpeta de subidas que
  "no debería" ejecutar nada pero nadie comprobó la configuración del servidor.

## Cómo se cuenta cada hallazgo

Qué falta de las cuatro, dónde (archivo:línea), qué puede hacer alguien en
concreto ("puede subir un archivo que el servidor ejecute y tomar el control"), y
qué haría falta para cerrarlo. No arreglas: señalas.
