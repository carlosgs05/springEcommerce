-- =============================================================================
-- V7__quitar_mfa_y_recuperacion.sql  -  Quita la verificacion en 2 pasos (MFA) y la recuperacion de acceso de admins (Dia 2)
-- =============================================================================
-- ATENCION: ESTA MIGRACION ES DESTRUCTIVA. Borra para siempre los datos de MFA
--         (secretos y codigos de respaldo) y todas las solicitudes de recuperacion
--         de admin (pendientes e historicas). No hay vuelta atras de los datos.
-- Que hace: el dueno decidio eliminar el segundo factor y el flujo "recuperar
--         acceso". Deshace lo que crearon V2, V3 (en parte) y V4/V6 (en parte):
--         (1) borra la tabla mfa_codigo_respaldo (y su indice y FK).
--         (2) borra la tabla recuperacion_admin (incluye sesion_version_solicitud
--             y pwv_solicitud que le agrego V6, y sus indices y FKs).
--         (3) en usuario: anula los codigos de reset emitidos para RECUPERAR_ACCESO
--             y borra el CHECK usuario_reset_code_proposito_chk y las columnas
--             mfa_secret, mfa_enabled y reset_code_proposito.
-- NO toca: usuario.sesion_version (V5), usuario.correo_pendiente,
--         correo_pendiente_codigo y correo_pendiente_expira (V3), el indice
--         uq_usuario_correo_lower (V6), ni nada de V1. Los codigos de reset de
--         tipo PASSWORD (reset_code, reset_code_expires_at) siguen intactos.
-- Orden: despues de V6. Es el paso de "contraer": el backend debe desplegarse
--         con la entidad Usuario SIN estas 3 columnas (ddl-auto=validate no se
--         queja de columnas de mas en la base, pero la app vieja que aun las
--         lea/escriba se rompe al quitarlas). Desplegar app nueva y migracion
--         juntas, o app nueva primero.
-- Filas existentes: usuario no pierde filas; pierde el contenido de 3 columnas.
--         Se pone reset_code y reset_code_expires_at en NULL SOLO en las filas con
--         reset_code_proposito = 'RECUPERAR_ACCESO' (normalmente 0 o muy pocas;
--         contar antes con: SELECT count(*) FROM public.usuario
--         WHERE reset_code_proposito = 'RECUPERAR_ACCESO';). Las filas de
--         mfa_codigo_respaldo y recuperacion_admin desaparecen enteras (contar
--         antes con SELECT count(*) de cada una).
-- Repetible: todo lleva IF EXISTS; el UPDATE solo corre si la columna
--         reset_code_proposito existe (consulta al catalogo), asi la segunda
--         corrida no falla ni hace nada.
-- Bloqueos: DROP TABLE y DROP COLUMN toman bloqueo exclusivo breve (milisegundos
--         en tablas pequenas). DROP COLUMN en PostgreSQL no reescribe la tabla.
--         El UPDATE toca solo las filas RECUPERAR_ACCESO.
-- Que debe verse: las tablas mfa_codigo_respaldo y recuperacion_admin ya no
--         existen; usuario ya no tiene mfa_secret, mfa_enabled ni
--         reset_code_proposito, ni el constraint usuario_reset_code_proposito_chk;
--         sigue teniendo sesion_version, correo_pendiente*, reset_code y el
--         indice uq_usuario_correo_lower.
-- No es error: los avisos NOTICE "no existe, se omite" al repetirlo.
-- Como se deshace: NO se recuperan datos, solo la estructura vacia. Para volver
--         a tener las tablas/columnas hay que repetir a mano el contenido de V2,
--         V3 (reset_code_proposito + CHECK), V4 y V6 (las 2 columnas de
--         recuperacion_admin). Para recuperar datos, solo una copia de seguridad.
-- =============================================================================

DROP TABLE IF EXISTS public.mfa_codigo_respaldo;

DROP TABLE IF EXISTS public.recuperacion_admin;

-- Anular codigos de reset emitidos para RECUPERAR_ACCESO (solo si la columna
-- todavia existe). SQL dinamico para que la sentencia no se resuelva si falta.
DO $$
BEGIN
    IF EXISTS (SELECT 1
                 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'usuario'
                  AND column_name = 'reset_code_proposito') THEN
        EXECUTE 'UPDATE public.usuario
                    SET reset_code = NULL,
                        reset_code_expires_at = NULL
                  WHERE reset_code_proposito = ''RECUPERAR_ACCESO''';
    END IF;
END
$$;

ALTER TABLE public.usuario
    DROP CONSTRAINT IF EXISTS usuario_reset_code_proposito_chk;

ALTER TABLE public.usuario
    DROP COLUMN IF EXISTS mfa_secret,
    DROP COLUMN IF EXISTS mfa_enabled,
    DROP COLUMN IF EXISTS reset_code_proposito;
