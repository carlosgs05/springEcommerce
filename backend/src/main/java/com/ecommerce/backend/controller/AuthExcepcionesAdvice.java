package com.ecommerce.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ecommerce.backend.dto.UsuarioDTO;

/** Cuerpo JSON roto o de tipo equivocado en los endpoints de auth: 400 con la forma de siempre, sin el cuerpo por defecto de Spring. */
@RestControllerAdvice(assignableTypes = {UsuarioController.class, AdminUsuarioController.class})
public class AuthExcepcionesAdvice {

    private static final Logger log = LoggerFactory.getLogger(AuthExcepcionesAdvice.class);

    @ExceptionHandler({HttpMessageNotReadableException.class, HttpMediaTypeNotSupportedException.class,
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class})
    public ResponseEntity<UsuarioDTO> cuerpoNoValido(Exception e) {
        // Solo el tipo de error: nunca el cuerpo (puede traer claves o codigos)
        log.warn("Cuerpo de peticion no valido en auth: {}", e.getClass().getSimpleName());
        UsuarioDTO r = new UsuarioDTO();
        r.setStatusCode(400);
        r.setMessage("Datos no válidos");
        return ResponseEntity.badRequest().body(r);
    }
}
