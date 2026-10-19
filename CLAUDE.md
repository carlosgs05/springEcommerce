# Reglas de trabajo — PROYECTO_ECOMMERCE

Mapa técnico en `ARQUITECTURA_PROYECTO.md` (no se carga solo; lo lee el líder).
Plan vigente: rediseño + seguridad en 12 días, en `PLAN_DISENO_PORTAFOLIO.md`; diseño en `IDENTIDAD_VISUAL.md`. Un día a la vez.

## Ramas y permisos
- Rama principal: `main` (hasta ahora se empuja directo a `main`; hay ramas por integrante `Carlos`, `Brahayan`, `Gianfranco`, `Juan`).
- Cada día del plan se trabaja en su propia rama (`dia-01-fundamentos`, `dia-02-...`).
- **Commit y push los revisa el dueño**: no se hace commit ni push sin que lo pida.
- Nunca fusionar a `main`, desplegar, ni ejecutar contra una base real sin permiso explícito.
- Pendiente de confirmar con el dueño: qué rama llega a usuarios reales y si hay algo que no se toca nunca.

## Decisiones del dueño
- Autenticación = solo correo + contraseña, para siempre. No hay ni se propone segundo factor (MFA/TOTP/WebAuthn/SMS) ni flujo "Recuperar acceso". Se quitó en el Día 2.

## Secretos
- Ningún secreto en el código ni en `application.properties`: van en `backend/.env` y `frontend/.env` (ignorados por git). Los `.env.example` sí se versionan.

## Trampas del entorno (Windows de esta PC)
- `NoDefaultCurrentDirectoryInExePath` activo: los .bat/.cmd se llaman con `.\` (ej. `.\mvnw.cmd`, `.\detener_sistema.bat`).
- El `java` del PATH es 17; el backend exige 21+. Compilar con `JAVA_HOME=C:\Program Files\Java\jdk-23` y `-Dmaven.compiler.proc=full` (sin eso Lombok no corre). `backend/arrancar_backend.bat` ya lo hace.
- Levantar/detener todo: `iniciar_sistema.bat` / `detener_sistema.bat` en la raíz (log en `scripts/ecommerce_log.txt`).
- Si se renombra o borra una migración, compilar con `mvnw clean ...`: sin `clean`, la vieja queda en `target/classes` y Flyway no arranca ("more than one migration with version N").
- Para pruebas de punta a punta, correr el jar desde una carpeta del scratchpad, NUNCA desde `backend/`: ahí carga `backend/.env`, que apunta a la base real. Pasar siempre `DB_URL` a la base descartable y comprobarlo en el log.
- Base descartable: `"C:\Program Files\PostgreSQL\17\bin\initdb" -D <scratchpad>\pgl -U postgres -A trust` + `pg_ctl ... -o "-p 55433" start`; usuarios de prueba por SQL con `pgcrypto` (`crypt('clave', gen_salt('bf',10))`). Al terminar, parar y borrar la carpeta.
- Pruebas con base descartable: el registro manda correo; con el host de correo caído borra la cuenta recién creada. Usar un sumidero SMTP local (`--spring.mail.host=127.0.0.1 --spring.mail.port=2525`) o crear las cuentas por SQL en esa base.

## Base de datos
- El esquema lo maneja Flyway (`backend/src/main/resources/db/migration`). `ddl-auto=validate`: Hibernate ya no cambia tablas.
- Todo cambio de esquema = migración nueva `V<n>__descripcion.sql`. Nunca editar una migración ya aplicada (V1 incluida).
