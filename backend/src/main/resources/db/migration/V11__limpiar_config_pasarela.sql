-- Deuda de seguridad (Día 7): metodo_pago.config_adicional es TEXT libre que
-- GET /api/metodopago/listar devuelve público sin sesión (lo necesita el
-- checkout para mostrar Yape/cuenta bancaria de los métodos MANUAL). Un
-- método PASARELA no necesita ese campo (el widget de la pasarela no lo usa,
-- ver CheckoutPago.tsx) y nunca debería tenerlo relleno. Esta limpieza es
-- idempotente: no falla y no cambia nada si ya corrió antes.
UPDATE metodo_pago
SET config_adicional = NULL
WHERE tipo = 'PASARELA'
  AND config_adicional IS NOT NULL;
