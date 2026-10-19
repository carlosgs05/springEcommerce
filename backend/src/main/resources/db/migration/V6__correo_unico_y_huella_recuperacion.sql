-- =============================================================================
-- V6__correo_unico_y_huella_recuperacion.sql  -  Correo unico sin mayusculas + huella en recuperacion de admin (Dia 2)
-- =============================================================================
-- Que hace: (1) intenta crear un indice unico sobre lower(usuario.correo), para
--         que 'A@x.com' y 'a@x.com' no puedan ser dos cuentas. (2) agrega a
--         recuperacion_admin dos columnas que guardan, al PEDIR la recuperacion,
--         la version de sesion y una huella de la clave; el backend las compara
--         al APROBAR para detectar que la cuenta cambio entre medias.
-- Orden: despues de V5. Solo "expandir": no quita ni cambia nada existente.
-- IMPORTANTE (1): si ya hay correos repetidos ignorando mayusculas, el indice
--         NO se crea y la migracion TERMINA SIN ERROR con un WARNING (asi la app
--         arranca). Hay que limpiar los duplicados y crear el indice a mano
--         (la sentencia exacta esta en el propio WARNING / mas abajo).
--         Consulta para listar los duplicados:
--             SELECT lower(correo) AS correo_normalizado, count(*) AS veces,
--                    array_agg(iduser ORDER BY iduser) AS ids
--               FROM public.usuario
--              GROUP BY lower(correo)
--             HAVING count(*) > 1;
--         Crear el indice a mano una vez limpio:
--             CREATE UNIQUE INDEX uq_usuario_correo_lower
--                 ON public.usuario (lower(correo));
-- Repetible: el indice se crea solo si no existe; las columnas con ADD COLUMN
--         IF NOT EXISTS. Si el indice ya existe no hace nada. Si falto por
--         duplicados y se limpian, basta volver a lanzar la sentencia manual.
-- Bloqueos: CREATE UNIQUE INDEX bloquea escrituras de usuario mientras se
--         construye (tabla pequena: milisegundos). ADD COLUMN NULL: instantaneo.
-- Filas existentes: no se modifican; las columnas nuevas quedan en NULL.
-- Que debe verse: indice uq_usuario_correo_lower (o WARNING si hay duplicados) y
--         columnas recuperacion_admin.sesion_version_solicitud integer NULL y
--         recuperacion_admin.pwv_solicitud varchar(64) NULL.
-- No es error: NOTICE "column already exists, skipping" al repetirlo, y el
--         WARNING de duplicados (es un aviso a atender, no un fallo).
-- Como se deshace (a mano, solo en local o con copia de seguridad):
--         DROP INDEX IF EXISTS public.uq_usuario_correo_lower;
--         ALTER TABLE public.recuperacion_admin
--             DROP COLUMN IF EXISTS sesion_version_solicitud,
--             DROP COLUMN IF EXISTS pwv_solicitud;
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes
                WHERE schemaname = 'public'
                  AND tablename = 'usuario'
                  AND indexname = 'uq_usuario_correo_lower') THEN
        RAISE NOTICE 'uq_usuario_correo_lower ya existe, se omite';
    ELSIF EXISTS (SELECT 1 FROM public.usuario
                   GROUP BY lower(correo) HAVING count(*) > 1) THEN
        RAISE WARNING 'uq_usuario_correo_lower NO creado: hay correos duplicados; limpialos y crea el indice a mano (CREATE UNIQUE INDEX uq_usuario_correo_lower ON public.usuario (lower(correo)))';
    ELSE
        CREATE UNIQUE INDEX uq_usuario_correo_lower ON public.usuario (lower(correo));
    END IF;
END
$$;

ALTER TABLE public.recuperacion_admin
    ADD COLUMN IF NOT EXISTS sesion_version_solicitud integer NULL;

ALTER TABLE public.recuperacion_admin
    ADD COLUMN IF NOT EXISTS pwv_solicitud character varying(64) NULL;
