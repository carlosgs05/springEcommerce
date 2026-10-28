package com.ecommerce.backend.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Cuerpo JSON roto, tipo de parámetro equivocado o Content-Type no soportado
 * en el resto de controllers (no auth, que tiene su propio advice): 400 con
 * el mismo formato {success, message} que ya usan estos controllers.
 */
@RestControllerAdvice(assignableTypes = {
        CarritoController.class,
        CategoriaController.class,
        ComentarioController.class,
        FavoritoController.class,
        MarcaController.class,
        MetodoEnvioController.class,
        MetodoPagoController.class,
        NotificacionController.class,
        PedidoController.class,
        ProductoController.class,
        TestimonioController.class
})
public class GlobalExcepcionesAdvice {

    private static final Logger log = LoggerFactory.getLogger(GlobalExcepcionesAdvice.class);

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            HttpMediaTypeNotSupportedException.class})
    public ResponseEntity<Map<String, Object>> solicitudInvalida(Exception e) {
        // Solo el tipo de error: nunca el cuerpo (puede traer datos sensibles)
        log.warn("Solicitud invalida: {}", e.getClass().getSimpleName());
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Solicitud inválida."));
    }
}
