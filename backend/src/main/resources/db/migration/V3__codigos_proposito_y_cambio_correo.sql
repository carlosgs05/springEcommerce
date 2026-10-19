-- =============================================================================
-- V3__codigos_proposito_y_cambio_correo.sql  -  Proposito del codigo y cambio de correo (Dia 2)
-- =============================================================================
-- Que hace: anade a "usuario" (a) el proposito del codigo de reset
--         (reset_code_proposito: PASSWORD o RECUPERAR_ACCESO) para que un codigo
--         pedido para una cosa no sirva para otra, y (b) los campos del cambio de
--         correo con verificacion (correo_pendiente, su codigo y su caducidad).
-- Orden: despues de V2. Es un cambio solo de "expandir": columnas nuevas que
--         admiten vacio; no quita ni cambia nada, la version anterior de la app
--         sigue valiendo.
-- Filas existentes: las 4 columnas quedan en NULL (sin DEFAULT, sin relleno).
--         NULL en reset_code_proposito es valido para el CHECK.
-- Repetible: columnas con IF NOT EXISTS; el CHECK se crea solo si no existe
--         (PostgreSQL no tiene IF NOT EXISTS para constraints, se consulta el
--         catalogo). Se puede correr dos veces sin error.
-- Bloqueos: ADD COLUMN sin DEFAULT no reescribe la tabla (milisegundos). El ADD
--         CONSTRAINT CHECK recorre la tabla una vez para validar; como la columna
--         recien creada es NULL en todas las filas, es rapido.
-- Que debe verse: 4 columnas nuevas en usuario y el constraint
--         usuario_reset_code_proposito_chk.
-- No es error: los avisos "ya existe, se omite" (NOTICE) al repetirlo.
-- Como se deshace (a mano, solo en local o con copia de seguridad):
--         ALTER TABLE public.usuario
--           DROP CONSTRAINT IF EXISTS usuario_reset_code_proposito_chk,
--           DROP COLUMN IF EXISTS reset_code_proposito,
--           DROP COLUMN IF EXISTS correo_pendiente,
--           DROP COLUMN IF EXISTS correo_pendiente_codigo,
--           DROP COLUMN IF EXISTS correo_pendiente_expira;
-- =============================================================================

ALTER TABLE public.usuario
    ADD COLUMN IF NOT EXISTS reset_code_proposito character varying(20),
    ADD COLUMN IF NOT EXISTS correo_pendiente character varying(100),
    ADD COLUMN IF NOT EXISTS correo_pendiente_codigo integer,
    ADD COLUMN IF NOT EXISTS correo_pendiente_expira timestamp without time zone;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'usuario_reset_code_proposito_chk'
          AND conrelid = 'public.usuario'::regclass
    ) THEN
        ALTER TABLE public.usuario
            ADD CONSTRAINT usuario_reset_code_proposito_chk
            CHECK (reset_code_proposito IS NULL
                   OR reset_code_proposito IN ('PASSWORD', 'RECUPERAR_ACCESO'));
    END IF;
END
$$;
