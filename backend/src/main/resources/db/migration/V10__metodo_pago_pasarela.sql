-- =============================================================================
-- V10__metodo_pago_pasarela.sql  -  Agrega soporte de pasarelas de pago
--         (Culqi/Mercado Pago) sobre metodo_pago, y los campos de resultado de
--         la transaccion en pedido, sin tocar los metodos manuales existentes
--         (Yape/Plin/transferencia).
-- =============================================================================
-- Que hace:
--   1) ALTER TABLE metodo_pago:
--        - tipo        VARCHAR(20) NOT NULL DEFAULT 'MANUAL'
--                       CHECK tipo IN ('MANUAL','PASARELA')
--        - proveedor    VARCHAR(20) NULL
--                       CHECK proveedor IS NULL OR proveedor IN ('CULQI','MERCADOPAGO')
--        - CHECK de consistencia: tipo='PASARELA' => proveedor NOT NULL;
--                                 tipo='MANUAL'   => proveedor NULL.
--   2) ALTER TABLE pedido:
--        - idtransaccion_pasarela  VARCHAR(100) NULL
--        - estado_pago_pasarela    VARCHAR(20) NULL
--                       CHECK estado_pago_pasarela IS NULL OR estado_pago_pasarela
--                       IN ('PENDIENTE','PAGADO','RECHAZADO')
--        - moneda                  VARCHAR(3) NOT NULL DEFAULT 'PEN'
-- NO toca: ninguna fila existente de forma destructiva. Los metodo_pago ya
--         creados (Yape/Plin/transferencia) quedan con tipo='MANUAL' (el
--         DEFAULT los cubre) y proveedor NULL, que es justo lo que exige el
--         CHECK de consistencia - no hace falta un UPDATE aparte.
-- Orden: despues de V9.
-- Filas existentes: metodo_pago -> tipo='MANUAL', proveedor=NULL (sin cambio
--         de comportamiento). pedido -> idtransaccion_pasarela=NULL,
--         estado_pago_pasarela=NULL, moneda='PEN'.
-- Repetible: Flyway no permite reaplicar una version ya registrada en su
--         historial (flyway_schema_history), asi que en el uso normal esta
--         migracion corre una sola vez por base. Aun asi cada ADD COLUMN usa
--         IF NOT EXISTS (soportado desde PostgreSQL 9.6) y cada ADD CONSTRAINT
--         se protege con un DO/IF NOT EXISTS contra pg_constraint, para que
--         si alguien la corre dos veces a mano (fuera de Flyway, ej. restaurando
--         un historial viejo) no truene por "ya existe" a mitad de archivo.
-- Bloqueos: ADD COLUMN con DEFAULT constante en PostgreSQL 11+ no reescribe la
--         tabla; bloqueo exclusivo breve en metodo_pago/pedido. Ambas tablas
--         son chicas (catalogo y pedidos), no deberia notarse.
-- Que debe verse: metodo_pago tiene tipo/proveedor con los CHECK activos;
--         pedido tiene idtransaccion_pasarela/estado_pago_pasarela/moneda;
--         todas las filas existentes de ambas tablas pasan los CHECK nuevos
--         sin necesidad de limpieza previa.
-- No es error: ningun aviso esperado en una corrida limpia. Si se corre a
--         mano una segunda vez, los avisos "ya existe, se omite" de los
--         bloques DO no son error, son el guard haciendo su trabajo.
-- Como se deshace:
--   ALTER TABLE public.pedido DROP COLUMN IF EXISTS idtransaccion_pasarela;
--   ALTER TABLE public.pedido DROP COLUMN IF EXISTS estado_pago_pasarela;
--   ALTER TABLE public.pedido DROP COLUMN IF EXISTS moneda;
--   ALTER TABLE public.metodo_pago DROP CONSTRAINT IF EXISTS chk_metodo_pago_tipo_proveedor;
--   ALTER TABLE public.metodo_pago DROP COLUMN IF EXISTS proveedor;
--   ALTER TABLE public.metodo_pago DROP COLUMN IF EXISTS tipo;
--   (se pierde cualquier dato guardado en esas columnas; sin backup no se
--   recupera).
-- =============================================================================

-- ---------- metodo_pago ----------

ALTER TABLE public.metodo_pago
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'MANUAL';

ALTER TABLE public.metodo_pago
    ADD COLUMN IF NOT EXISTS proveedor VARCHAR(20) NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_metodo_pago_tipo'
    ) THEN
        ALTER TABLE public.metodo_pago
            ADD CONSTRAINT chk_metodo_pago_tipo CHECK (tipo IN ('MANUAL','PASARELA'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_metodo_pago_proveedor'
    ) THEN
        ALTER TABLE public.metodo_pago
            ADD CONSTRAINT chk_metodo_pago_proveedor
            CHECK (proveedor IS NULL OR proveedor IN ('CULQI','MERCADOPAGO'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_metodo_pago_tipo_proveedor'
    ) THEN
        ALTER TABLE public.metodo_pago
            ADD CONSTRAINT chk_metodo_pago_tipo_proveedor
            CHECK (
                (tipo = 'PASARELA' AND proveedor IS NOT NULL)
                OR (tipo = 'MANUAL' AND proveedor IS NULL)
            );
    END IF;
END $$;

-- ---------- pedido ----------

ALTER TABLE public.pedido
    ADD COLUMN IF NOT EXISTS idtransaccion_pasarela VARCHAR(100) NULL;

ALTER TABLE public.pedido
    ADD COLUMN IF NOT EXISTS estado_pago_pasarela VARCHAR(20) NULL;

ALTER TABLE public.pedido
    ADD COLUMN IF NOT EXISTS moneda VARCHAR(3) NOT NULL DEFAULT 'PEN';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_pedido_estado_pago_pasarela'
    ) THEN
        ALTER TABLE public.pedido
            ADD CONSTRAINT chk_pedido_estado_pago_pasarela
            CHECK (estado_pago_pasarela IS NULL OR estado_pago_pasarela IN ('PENDIENTE','PAGADO','RECHAZADO'));
    END IF;
END $$;
