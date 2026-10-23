-- =============================================================================
-- V8__cuenta_activa.sql  -  Agrega usuario.activo para que un admin pueda
--         desactivar una cuenta (ej. pedidos fraudulentos) sin tocar ni
--         confundir is_enabled (que es "correo verificado"), y sin borrar la
--         fila (hay pedidos relacionados por integridad referencial).
-- =============================================================================
-- Que hace: ALTER TABLE usuario ADD COLUMN activo boolean NOT NULL DEFAULT true.
-- NO toca: is_enabled, ni ninguna otra columna o tabla de V1-V7.
-- Orden: despues de V7.
-- Filas existentes: todas quedan con activo = true (nadie se desactiva solo).
-- Repetible: no aplica el patron idempotente de scripts sueltos. Flyway no
--         permite reaplicar una version ya registrada en su historial
--         (flyway_schema_history), asi que esta migracion corre una sola vez
--         por base; no hace falta comprobar antes si la columna ya existe.
-- Bloqueos: ADD COLUMN con DEFAULT constante en PostgreSQL 11+ no reescribe
--         la tabla; bloqueo exclusivo breve.
-- Que debe verse: usuario tiene la columna activo (boolean, not null, default
--         true) y todas las filas existentes en true.
-- No es error: ningun aviso esperado en una corrida limpia.
-- Como se deshace: ALTER TABLE public.usuario DROP COLUMN activo; (se pierde
--         el valor que tuviera cada fila; sin backup no se recupera).
-- =============================================================================

ALTER TABLE public.usuario
    ADD COLUMN activo BOOLEAN NOT NULL DEFAULT true;
