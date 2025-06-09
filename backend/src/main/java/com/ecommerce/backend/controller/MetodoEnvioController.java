package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.MetodoEnvioDTO;
import com.ecommerce.backend.service.MetodoEnvioService;

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
@RequestMapping("/api/metodoenvio")
@RequiredArgsConstructor
public class MetodoEnvioController {

    private final MetodoEnvioService metodoEnvioService;

    @GetMapping("/listar")
    public ResponseEntity<?> listarMetodosEnvio() {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<MetodoEnvioDTO> lista = metodoEnvioService.obtenerTodosMetodosEnvio();
            resp.put("success", true);
            resp.put("data", lista);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error al recuperar métodos de envío: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearMetodoEnvio(
            @RequestParam("metodoEnvio") String metodoEnvioJson,
            @RequestParam(value = "icono", required = false) MultipartFile icono) {
        Map<String, Object> resp = new HashMap<>();
        try {
            MetodoEnvioDTO req = metodoEnvioService.parsearJson(metodoEnvioJson, icono);
            MetodoEnvioDTO creado = metodoEnvioService.crearMetodoEnvio(req);

            resp.put("success", true);
            resp.put("message", "Método de envío creado correctamente");
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
    public ResponseEntity<?> actualizarMetodoEnvio(
            @PathVariable Long id,
            @RequestParam("metodoEnvio") String metodoEnvioJson,
            @RequestParam(value = "icono", required = false) MultipartFile icono) {
        Map<String, Object> resp = new HashMap<>();
        try {
            MetodoEnvioDTO req = metodoEnvioService.parsearJson(metodoEnvioJson, icono);
            MetodoEnvioDTO actualizado = metodoEnvioService.actualizarMetodoEnvio(id, req);

            resp.put("success", true);
            resp.put("message", "Método de envío actualizado correctamente");
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
    public ResponseEntity<?> eliminarMetodoEnvio(@PathVariable Long id) {
        Map<String, Object> resp = new HashMap<>();
        try {
            metodoEnvioService.eliminarMetodoEnvio(id);
            resp.put("success", true);
            resp.put("message", "Método de envío eliminado correctamente");
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
            @RequestParam("estado") boolean estado) {
        Map<String, Object> resp = new HashMap<>();
        try {
            MetodoEnvioDTO actualizado = metodoEnvioService.cambiarEstadoMetodoEnvio(id, estado);
            resp.put("success", true);
            resp.put("message", "Estado actualizado correctamente");
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
