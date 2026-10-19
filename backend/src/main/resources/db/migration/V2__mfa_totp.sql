-- =============================================================================
-- V2__mfa_totp.sql  -  Segundo factor de acceso con codigo de app (Dia 2)
-- =============================================================================
-- Que hace: anade a "usuario" las columnas para el codigo de app (TOTP, tipo
--         Google Authenticator) y crea la tabla de codigos de respaldo de un
--         solo uso. Admin y cliente quedan con 2 factores: contrasena + codigo.
-- Orden: despues de V1. Es un cambio solo de "expandir": no quita ni cambia
--         nada existente, asi que la version anterior de la app sigue valiendo.
-- Filas existentes: quedan con mfa_enabled=false (por el DEFAULT); mfa_secret
--         queda en NULL.
-- Repetible: todo lleva IF NOT EXISTS; se puede correr dos veces sin error.
-- Bloqueos: ADD COLUMN con DEFAULT constante en PostgreSQL 11+ no reescribe la
--         tabla; el bloqueo dura milisegundos.
-- Que debe verse: 2 columnas nuevas en usuario (mfa_secret, mfa_enabled) y la
--         tabla mfa_codigo_respaldo con su indice idx_mfa_codigo_respaldo_iduser.
-- No es error: los avisos "ya existe, se omite" (NOTICE) al repetirlo.
-- Como se deshace (a mano, solo en local o con copia de seguridad):
--         DROP TABLE IF EXISTS public.mfa_codigo_respaldo;
--         ALTER TABLE public.usuario DROP COLUMN IF EXISTS mfa_secret,
--           DROP COLUMN IF EXISTS mfa_enabled;
-- =============================================================================

ALTER TABLE public.usuario
    ADD COLUMN IF NOT EXISTS mfa_secret text,
    ADD COLUMN IF NOT EXISTS mfa_enabled boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS public.mfa_codigo_respaldo (
    id serial PRIMARY KEY,
    iduser integer NOT NULL,
    codigo_hash character varying(255) NOT NULL,
    usado_en timestamp without time zone,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT mfa_codigo_respaldo_iduser_fkey
        FOREIGN KEY (iduser) REFERENCES public.usuario(iduser) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mfa_codigo_respaldo_iduser
    ON public.mfa_codigo_respaldo USING btree (iduser);
