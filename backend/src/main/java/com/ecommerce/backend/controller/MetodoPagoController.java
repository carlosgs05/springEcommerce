package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.MetodoPagoDTO;
import com.ecommerce.backend.service.MetodoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/metodopago")
@RequiredArgsConstructor
public class MetodoPagoController {

    private final MetodoPagoService metodoPagoService;

    @GetMapping("/listar")
    public ResponseEntity<?> listarMetodosPago() {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<MetodoPagoDTO> lista = metodoPagoService.obtenerTodosMetodosPago();
            resp.put("success", true);
            resp.put("data", lista);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error al recuperar métodos de pago: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearMetodoPago(
            @RequestParam("metodoPago") String metodoPagoJson,
            @RequestParam(value = "icono", required = false) MultipartFile icono
    ) {
        Map<String, Object> resp = new HashMap<>();
        try {
            MetodoPagoDTO req = metodoPagoService.parsearJson(metodoPagoJson, icono);
            MetodoPagoDTO creado = metodoPagoService.crearMetodoPago(req);
            resp.put("success", true);
            resp.put("message", "Método de pago creado correctamente");
            resp.put("data", creado);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        } catch (IOException e) {
            resp.put("success", false);
            resp.put("message", "Error al procesar ícono: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarMetodoPago(
            @PathVariable Long id,
            @RequestParam("metodoPago") String metodoPagoJson,
            @RequestParam(value = "icono", required = false) MultipartFile icono
    ) {
        Map<String, Object> resp = new HashMap<>();
        try {
            MetodoPagoDTO req = metodoPagoService.parsearJson(metodoPagoJson, icono);
            MetodoPagoDTO actualizado = metodoPagoService.actualizarMetodoPago(id, req);
            resp.put("success", true);
            resp.put("message", "Método de pago actualizado correctamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
        } catch (IOException e) {
            resp.put("success", false);
            resp.put("message", "Error al procesar ícono: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarMetodoPago(@PathVariable Long id) {
        Map<String, Object> resp = new HashMap<>();
        try {
            metodoPagoService.eliminarMetodoPago(id);
            resp.put("success", true);
            resp.put("message", "Método de pago eliminado correctamente");
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @PutMapping("/cambiar-estado/{id}")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestParam("activo") boolean activo
    ) {
        Map<String, Object> resp = new HashMap<>();
        try {
            MetodoPagoDTO actualizado = metodoPagoService.cambiarEstadoMetodoPago(id, activo);
            resp.put("success", true);
            resp.put("message", "Estado de método de pago actualizado correctamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }
}