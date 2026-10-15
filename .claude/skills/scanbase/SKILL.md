---
name: scanbase
description: Oficio senior de reconocimiento de un proyecto antes de tocarlo, universal. Úsala al llegar a un repositorio para entender cómo funciona. Triggers: reconocer proyecto, explorar repositorio, cómo funciona, rama principal, hay pruebas, hay CI, convenciones, empezar en un repo.
---

# ScanBase — enterarte de dónde estás antes de tocar

**Esto se hace una vez por proyecto, no una vez por encargo**, y va a dos
archivos distintos, no a uno solo:

- **`ARQUITECTURA_PROYECTO.md`** — el mapa técnico (lenguaje, estructura,
  módulos, convenciones). Nadie lo carga automático; solo lo lee quien lo
  necesita.
- **`CLAUDE.md`** — reglas de trabajo (rama, permisos, qué no se toca). Este
  sí se carga solo en cualquier agente del proyecto, así que se mantiene
  corto.

Antes de correr nada, mira si `ARQUITECTURA_PROYECTO.md` ya contesta la tabla
de abajo — si ya está, la lees y sigues, no repites la exploración. Si no
existe, la averiguas y la **creas ahí** para que la próxima sesión no vuelva a
pagar este costo.

Antes de tocar una línea, averigua cómo funciona este sitio. Casi todo está a la
vista. **Cuanto menos sepas de un repositorio, menos tocas.**

## Lo que se mira, y dónde va cada cosa

| Qué | Dónde mirar | Dónde se anota |
|---|---|---|
| Lenguaje y cómo se construye | `package.json`, `composer.json`, `go.mod`, `requirements.txt`, `pom.xml`… | `ARQUITECTURA_PROYECTO.md` |
| Estructura y módulos | Carpetas principales, qué vive dónde | `ARQUITECTURA_PROYECTO.md` |
| ¿Hay pruebas? | carpetas `test`/`spec`, scripts, archivos `*_test.*` | `ARQUITECTURA_PROYECTO.md` |
| ¿Hay despliegue automático? | `.github/workflows`, `.gitlab-ci.yml`, `Jenkinsfile`… | `ARQUITECTURA_PROYECTO.md` |
| Rama principal | `git symbolic-ref refs/remotes/origin/HEAD`, o `git branch -r` | `CLAUDE.md` |
| Otras ramas vivas | `git branch -a` y cuándo se tocaron | (no se anota, se mira cada vez) |
| ¿Se trabaja con PRs? | carpeta `.github`, rama protegida, PRs en el historial | `CLAUDE.md` |
| Convenciones ya escritas | `CONTRIBUTING.md`, `README.md` | (referencia, no se copia) |

**Si `ARQUITECTURA_PROYECTO.md` o `CLAUDE.md` ya existen, mándalos todo:** ahí
están el mapa técnico y las reglas de la casa, y ganan a cualquier costumbre.

## Lo que ningún repositorio dice en voz alta — pregúntalo UNA vez

1. ¿Qué rama llega a usuarios reales?
2. ¿Se puede fusionar solo, o siempre hay que pedir permiso?
3. ¿Hay algo que no se toca nunca?

Pregúntalas juntas, en un mensaje, en cristiano. Escribe las respuestas en el
`CLAUDE.md` del proyecto para no volver a preguntar.

## Lo que el reconocimiento decide

- **Sin PRs** → rama aparte, se cuenta lo hecho, nunca directo a la principal.
- **Sin CI** → las pruebas las corres tú antes de entregar.
- **Sin pruebas** → se dice: "lo que entrego no lo ha comprobado nadie más".
- **Alguien más en lo mismo** → mira ramas activas y commits recientes; si tu
  encargo toca lo que otro está tocando, dilo **antes** de empezar.

## Para un encargo chico, no barras todo el árbol

Una vez sabes el lenguaje y la estructura (por `ARQUITECTURA_PROYECTO.md`),
localizar dónde va un encargo concreto es una búsqueda acotada —`Grep`/`Glob`
sobre la carpeta o módulo que menciona el encargo—, no un recorrido del
repositorio completo. Explorarlo todo para cambiar una pantalla es gasto que
no hace falta.

## Cómo se entrega

En una tabla corta: lenguaje, rama principal, si hay PRs, si hay CI, si hay
pruebas, y qué no se toca. Sin adornos. Eso es lo que decide cómo de rápido se
puede ir.
