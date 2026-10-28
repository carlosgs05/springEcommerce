package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CarritoDTO;
import com.ecommerce.backend.entity.Carrito;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.service.CarritoService;
import com.ecommerce.backend.service.SesionActual;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {
    private static final Logger log = LoggerFactory.getLogger(CarritoController.class);
    private static final String MSG_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo más tarde.";

    private final CarritoService carritoService;

    /** Dueño del token de sesion (typ=access); null si no hay (las reglas de SecurityConfig ya dan 401 antes). */
    private static Integer idSesion() {
        return SesionActual.usuarioAccess().map(Usuario::getIduser).orElse(null);
    }

    // Obtener carrito del usuario de la sesion
    @GetMapping
    public ResponseEntity<?> obtenerCarrito() {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Carrito> carrito = carritoService.obtenerCarritoPorUsuario(idSesion());
            if (carrito.isPresent()) {
                response.put("success", true);
                response.put("data", carrito.get());
            } else {
                response.put("success", false);
                response.put("message", "Carrito no encontrado para el usuario");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fallo al obtener carrito", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Guardar o actualizar carrito del usuario de la sesion
    @PostMapping("/guardar")
    public ResponseEntity<?> guardarCarrito(@RequestBody CarritoDTO carritoDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            Carrito carrito = carritoService.guardarActualizarCarrito(idSesion(), carritoDTO);
            response.put("success", true);
            response.put("message", "Carrito guardado correctamente");
            response.put("data", carrito);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Fallo al guardar carrito", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Eliminar carrito del usuario de la sesion (por ejemplo, al finalizar compra o desloguear)
    @DeleteMapping
    public ResponseEntity<?> eliminarCarrito() {
        Map<String, Object> response = new HashMap<>();
        try {
            carritoService.eliminarCarritoPorUsuario(idSesion());
            response.put("success", true);
            response.put("message", "Carrito eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fallo al eliminar carrito", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }
}
