package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CarritoDTO;
import com.ecommerce.backend.entity.Carrito;
import com.ecommerce.backend.service.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    // Obtener carrito por usuario
    @GetMapping("/{idUsuario}")
    public ResponseEntity<?> obtenerCarrito(@PathVariable Integer idUsuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Carrito> carrito = carritoService.obtenerCarritoPorUsuario(idUsuario);
            if (carrito.isPresent()) {
                response.put("success", true);
                response.put("data", carrito.get());
            } else {
                response.put("success", false);
                response.put("message", "Carrito no encontrado para el usuario");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Guardar o actualizar carrito
    @PostMapping("/guardar")
    public ResponseEntity<?> guardarCarrito(@RequestBody CarritoDTO carritoDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            Carrito carrito = carritoService.guardarActualizarCarrito(carritoDTO);
            response.put("success", true);
            response.put("message", "Carrito guardado correctamente");
            response.put("data", carrito);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Eliminar carrito por usuario (por ejemplo, al finalizar compra o desloguear)
    @DeleteMapping("/eliminar/{idUsuario}")
    public ResponseEntity<?> eliminarCarrito(@PathVariable Integer idUsuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            carritoService.eliminarCarritoPorUsuario(idUsuario);
            response.put("success", true);
            response.put("message", "Carrito eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
