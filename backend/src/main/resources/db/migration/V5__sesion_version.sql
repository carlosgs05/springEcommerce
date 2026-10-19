-- =============================================================================
-- V5__sesion_version.sql  -  Version de sesion por usuario (Dia 2)
-- =============================================================================
-- Que hace: agrega usuario.sesion_version (entero, por defecto 0). Se sube en 1
--         cada vez que se reinicia el MFA o cambia el rol; los JWT que lleven
--         otra version dejan de valer.
-- Orden: despues de V4. Solo "expandir": columna nueva con valor por defecto;
--         la version anterior de la app la ignora y sigue funcionando.
-- Filas existentes: quedan en 0 (no se tocan otros datos).
-- Repetible: ADD COLUMN IF NOT EXISTS; si ya esta, no hace nada.
-- Bloqueos: en PostgreSQL 11+ un DEFAULT constante no reescribe la tabla; el
--         bloqueo es de milisegundos.
-- Que debe verse: columna usuario.sesion_version integer NOT NULL DEFAULT 0.
-- No es error: el aviso "column already exists, skipping" (NOTICE) al repetirlo.
-- Como se deshace (a mano, solo en local o con copia de seguridad):
--         ALTER TABLE public.usuario DROP COLUMN IF EXISTS sesion_version;
-- =============================================================================

ALTER TABLE public.usuario
    ADD COLUMN IF NOT EXISTS sesion_version integer NOT NULL DEFAULT 0;
