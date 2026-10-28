package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.service.SesionActual;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Estructura de pasarelas de pago (Culqi / Mercado Pago), en modo sandbox.
 *
 * AUN NO hay llaves reales: mientras CULQI_SECRET_KEY / MERCADOPAGO_ACCESS_TOKEN
 * esten vacias (default de application.properties), los endpoints de cargo/pago
 * responden 503 "Pasarela no configurada todavia" en vez de intentar nada. No se
 * agrega ningun SDK: cuando haya llave se llama con RestTemplate (ya disponible
 * via spring-boot-starter-web, sin dependencia nueva).
 *
 * El estado de pago de un pedido (estadoPagoPasarela=PAGADO) solo lo puede poner
 * la confirmacion real de la pasarela (webhook o respuesta directa del cargo),
 * NUNCA un campo "estado"/"pagado" que venga en el body de una peticion del
 * cliente — eso seria confiar en el navegador para decidir si alguien pago.
 */
@RestController
public class PagoPasarelaController {

    private static final Logger log = LoggerFactory.getLogger(PagoPasarelaController.class);

    @Value("${app.culqi.secret-key:}")
    private String culqiSecretKey;

    @Value("${app.culqi.public-key:}")
    private String culqiPublicKey;

    @Value("${app.mercadopago.access-token:}")
    private String mercadopagoAccessToken;

    @Value("${app.mercadopago.public-key:}")
    private String mercadopagoPublicKey;

    /** Dueño del token de sesion (typ=access); null si no hay (SecurityConfig ya da 401 antes). */
    private static Integer idSesion() {
        return SesionActual.usuarioAccess().map(Usuario::getIduser).orElse(null);
    }

    private static boolean vacia(String valor) {
        return valor == null || valor.isBlank();
    }

    /**
     * Llaves PUBLICAS de cada pasarela, para que el frontend inicialice sus
     * widgets. Nunca incluye las llaves secretas (CULQI_SECRET_KEY /
     * MERCADOPAGO_ACCESS_TOKEN) — esas solo las usa este backend.
     * Contrato: GET /api/config/pasarelas ->
     * { "success": true, "data": { "culqiPublicKey": "..."|null, "mercadopagoPublicKey": "..."|null } }
     * Un valor null significa que esa pasarela todavia no está configurada.
     */
    @GetMapping("/api/config/pasarelas")
    public ResponseEntity<?> obtenerLlavesPublicasPasarelas() {
        Map<String, Object> data = new HashMap<>();
        data.put("culqiPublicKey", vacia(culqiPublicKey) ? null : culqiPublicKey);
        data.put("mercadopagoPublicKey", vacia(mercadopagoPublicKey) ? null : mercadopagoPublicKey);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("data", data);
        return ResponseEntity.ok(resp);
    }

    // ---------------------------------------------------------------------
    // Culqi
    // ---------------------------------------------------------------------

    /**
     * Crea un cargo en Culqi a partir de un token generado en el frontend con
     * la llave publica (nunca se recibe el numero de tarjeta aqui).
     * Requiere sesion de cliente (igual que /api/carrito): la identidad sale
     * de SesionActual, nunca de un id en el body.
     */
    @PostMapping("/api/pagos/culqi/cargo")
    public ResponseEntity<?> crearCargoCulqi(@RequestBody Map<String, Object> body) {
        Map<String, Object> resp = new HashMap<>();
        Integer idUsuario = idSesion();

        if (vacia(culqiSecretKey)) {
            log.warn("Intento de cargo Culqi sin CULQI_SECRET_KEY configurada (usuario={})", idUsuario);
            resp.put("success", false);
            resp.put("message", "Pasarela no configurada todavía");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(resp);
        }

        // Nunca confiar en un "estado"/"pagado" que venga en el body: eso lo decide
        // solo la respuesta de Culqi (o su webhook), no el cliente.
        Object token = body.get("token");
        if (token == null || token.toString().isBlank()) {
            resp.put("success", false);
            resp.put("message", "El token de la tarjeta es obligatorio");
            return ResponseEntity.badRequest().body(resp);
        }

        // TODO: llamar a la API real de Culqi (POST https://api.culqi.com/v2/charges)
        // con RestTemplate, Authorization: Bearer <culqiSecretKey>, usando el token
        // y el monto (sacado del pedido en el servidor, nunca del body del cliente).
        // Con la respuesta real: si outcome=venta/exitosa -> pedido.estadoPagoPasarela=PAGADO
        // y pedido.idTransaccionPasarela=<id de Culqi>; si no, RECHAZADO.

        resp.put("success", false);
        resp.put("message", "Pasarela no configurada todavía");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(resp);
    }

    /**
     * Webhook de Culqi. Publico en SecurityConfig (lo llama Culqi, no un usuario
     * con JWT). Mientras no haya una llave/secreto de firma real configurado,
     * NO se puede validar que el webhook sea autentico — por eso se rechaza en
     * vez de confiar en el a ciegas. Nunca se usa este webhook como unica fuente
     * de verdad hasta que validarFirma funcione con una llave real.
     */
    @PostMapping("/api/pagos/culqi/webhook")
    public ResponseEntity<?> webhookCulqi(@RequestBody String payload,
            @RequestHeader(value = "X-Culqi-Signature", required = false) String firma) {
        if (!validarFirmaCulqi(payload, firma)) {
            log.warn("Webhook de Culqi rechazado: firma inválida o pasarela sin configurar");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // TODO: una vez validada la firma de verdad, parsear el payload y actualizar
        // pedido.estadoPagoPasarela / idTransaccionPasarela según el evento recibido.
        return ResponseEntity.ok().build();
    }

    private boolean validarFirmaCulqi(String payload, String firma) {
        if (vacia(culqiSecretKey) || firma == null) {
            // Sin llave de firma real configurada todavía: no hay forma de validar
            // de verdad, así que se rechaza en vez de confiar a ciegas.
            return false;
        }
        // TODO: calcular el HMAC esperado con el secreto de firma de Culqi y
        // compararlo con "firma" en tiempo constante.
        return false;
    }

    // ---------------------------------------------------------------------
    // Mercado Pago
    // ---------------------------------------------------------------------

    /**
     * Crea un pago en Mercado Pago a partir de un token generado en el frontend.
     * Requiere sesion de cliente, igual que Culqi.
     */
    @PostMapping("/api/pagos/mercadopago/pago")
    public ResponseEntity<?> crearPagoMercadoPago(@RequestBody Map<String, Object> body) {
        Map<String, Object> resp = new HashMap<>();
        Integer idUsuario = idSesion();

        if (vacia(mercadopagoAccessToken)) {
            log.warn("Intento de pago Mercado Pago sin MERCADOPAGO_ACCESS_TOKEN configurado (usuario={})",
                    idUsuario);
            resp.put("success", false);
            resp.put("message", "Pasarela no configurada todavía");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(resp);
        }

        Object token = body.get("token");
        if (token == null || token.toString().isBlank()) {
            resp.put("success", false);
            resp.put("message", "El token de pago es obligatorio");
            return ResponseEntity.badRequest().body(resp);
        }

        // TODO: llamar a la API real de Mercado Pago (POST
        // https://api.mercadopago.com/v1/payments) con RestTemplate,
        // Authorization: Bearer <mercadopagoAccessToken>, usando el token y el
        // monto calculado en el servidor (nunca el que mande el cliente).
        // Con la respuesta real: status=approved -> pedido.estadoPagoPasarela=PAGADO
        // y pedido.idTransaccionPasarela=<id de Mercado Pago>; si no, RECHAZADO.

        resp.put("success", false);
        resp.put("message", "Pasarela no configurada todavía");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(resp);
    }

    /**
     * Webhook de Mercado Pago. Publico en SecurityConfig. Misma regla que Culqi:
     * sin secreto de validacion real configurado, se rechaza en vez de confiar
     * a ciegas, y no se usa como fuente de verdad todavía.
     */
    @PostMapping("/api/pagos/mercadopago/webhook")
    public ResponseEntity<?> webhookMercadoPago(@RequestBody String payload,
            @RequestHeader(value = "X-Signature", required = false) String firma) {
        if (!validarFirmaMercadoPago(payload, firma)) {
            log.warn("Webhook de Mercado Pago rechazado: firma inválida o pasarela sin configurar");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // TODO: una vez validada la firma de verdad, parsear el payload y actualizar
        // pedido.estadoPagoPasarela / idTransaccionPasarela según el evento recibido.
        return ResponseEntity.ok().build();
    }

    private boolean validarFirmaMercadoPago(String payload, String firma) {
        if (vacia(mercadopagoAccessToken) || firma == null) {
            return false;
        }
        // TODO: calcular la firma esperada con el secreto de Mercado Pago y
        // compararla con "firma" en tiempo constante.
        return false;
    }
}
