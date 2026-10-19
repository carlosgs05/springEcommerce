package com.ecommerce.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Registro de auditoria de seguridad. Solo escribe el evento, el iduser (o "desconocido") y la IP.
 * NUNCA correo, contraseña, codigo ni token.
 */
public final class Auditoria {

    private static final Logger log = LoggerFactory.getLogger(Auditoria.class);

    private Auditoria() {
    }

    public static void evento(String evento, Integer iduser, String ip) {
        log.info("AUDIT {} iduser={} ip={}", evento, iduser == null ? "desconocido" : iduser, limpiarIp(ip));
    }

    /** Cambio de rol: quien lo hizo (admin), a quien afecta y el rol anterior/nuevo. Solo ids, nunca correo. */
    public static void rolCambiado(Integer admin, Integer afectado, Integer rolAnterior, Integer rolNuevo, String ip) {
        log.info("AUDIT rol_cambiado iduser={} afectado={} rol_anterior={} rol_nuevo={} ip={}",
                admin == null ? "desconocido" : admin, afectado, rolAnterior, rolNuevo, limpiarIp(ip));
    }

    /** Deja solo caracteres propios de una IP (evita meter saltos de linea u otro texto en el log). */
    static String limpiarIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return "desconocida";
        }
        String s = ip.length() > 64 ? ip.substring(0, 64) : ip;
        return s.replaceAll("[^0-9a-fA-F:.%]", "?");
    }
}
