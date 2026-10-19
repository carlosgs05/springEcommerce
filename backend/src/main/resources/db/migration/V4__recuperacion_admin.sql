-- =============================================================================
-- V4__recuperacion_admin.sql  -  Recuperar una cuenta ADMINISTRADOR con aprobacion de otro admin (Dia 2)
-- =============================================================================
-- Que hace: crea la tabla recuperacion_admin. Cuando un admin pide recuperar su
--         acceso, la solicitud (con el hash de la clave nueva, nunca en claro)
--         queda PENDIENTE hasta que OTRO admin la aprueba o la rechaza.
-- Orden: despues de V3. Solo "expandir": tabla nueva, no toca nada existente;
--         la version anterior de la app sigue valiendo.
-- Reglas que garantiza la base:
--         - estado solo puede ser PENDIENTE, APROBADA, RECHAZADA o REEMPLAZADA.
--         - una sola solicitud PENDIENTE por cuenta (indice unico parcial);
--           varias RECHAZADA/APROBADA/REEMPLAZADA del mismo usuario si caben.
--         - iduser borrado => se borran sus solicitudes (CASCADE);
--           resuelto_por borrado => queda NULL (SET NULL).
-- Repetible: tabla e indices con IF NOT EXISTS; CHECK y FKs se crean solo si no
--         existen (tambien cubre una tabla que quedo a medias).
-- Bloqueos: tabla nueva y vacia; milisegundos.
-- Que debe verse: tabla recuperacion_admin con constraints
--         recuperacion_admin_estado_check, recuperacion_admin_iduser_fkey,
--         recuperacion_admin_resuelto_por_fkey e indices
--         uq_recuperacion_admin_pendiente_iduser e idx_recuperacion_admin_estado.
-- No es error: los avisos "ya existe, se omite" (NOTICE) al repetirlo.
-- Fechas: timestamp sin huso, como el resto del esquema; el backend escribe
--         creado_en/expira_en y compara con un solo reloj.
-- Como se deshace (a mano, solo en local o con copia de seguridad):
--         DROP TABLE IF EXISTS public.recuperacion_admin;
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.recuperacion_admin (
    id serial PRIMARY KEY,
    iduser integer NOT NULL,
    nuevo_password_hash character varying(255) NOT NULL,
    estado character varying(20) DEFAULT 'PENDIENTE' NOT NULL,
    creado_en timestamp without time zone DEFAULT now() NOT NULL,
    expira_en timestamp without time zone NOT NULL,
    resuelto_por integer,
    resuelto_en timestamp without time zone
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'recuperacion_admin_estado_check'
                     AND conrelid = 'public.recuperacion_admin'::regclass) THEN
        ALTER TABLE public.recuperacion_admin
            ADD CONSTRAINT recuperacion_admin_estado_check
            CHECK (estado IN ('PENDIENTE','APROBADA','RECHAZADA','REEMPLAZADA'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'recuperacion_admin_iduser_fkey'
                     AND conrelid = 'public.recuperacion_admin'::regclass) THEN
        ALTER TABLE public.recuperacion_admin
            ADD CONSTRAINT recuperacion_admin_iduser_fkey
            FOREIGN KEY (iduser) REFERENCES public.usuario(iduser) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'recuperacion_admin_resuelto_por_fkey'
                     AND conrelid = 'public.recuperacion_admin'::regclass) THEN
        ALTER TABLE public.recuperacion_admin
            ADD CONSTRAINT recuperacion_admin_resuelto_por_fkey
            FOREIGN KEY (resuelto_por) REFERENCES public.usuario(iduser) ON DELETE SET NULL;
    END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_recuperacion_admin_pendiente_iduser
    ON public.recuperacion_admin USING btree (iduser) WHERE estado = 'PENDIENTE';

CREATE INDEX IF NOT EXISTS idx_recuperacion_admin_estado
    ON public.recuperacion_admin USING btree (estado);
