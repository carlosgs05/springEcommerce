package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.MarcaDTO;
import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.service.MarcaService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
public class MarcaController {
    private static final Logger log = LoggerFactory.getLogger(MarcaController.class);
    private static final String MSG_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo más tarde.";

    private final MarcaService marcaService;
    private final ObjectMapper objectMapper;

    @GetMapping("/listar")
    public ResponseEntity<?> listarMarcas() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Marca> marcas = marcaService.listarMarcas();
            response.put("success", true);
            response.put("message", "Marcas listadas correctamente");
            response.put("data", marcas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fallo al listar marcas", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerMarca(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Marca marca = marcaService.obtenerMarcaPorId(id);
            response.put("success", true);
            response.put("message", "Marca obtenida correctamente");
            response.put("data", marca);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Fallo al obtener marca {}", id, e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearMarca(
            @RequestParam("marca") String marcaJson,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Parsear JSON
            MarcaDTO req = objectMapper.readValue(marcaJson, MarcaDTO.class);
            req.setImagen(imagen);

            // Crear marca
            Marca nuevaMarca = marcaService.crearMarca(req);

            response.put("success", true);
            response.put("message", "Marca creada correctamente");
            response.put("data", nuevaMarca);
            return ResponseEntity.ok(response);

        } catch (JsonProcessingException e) {
            response.put("success", false);
            response.put("message", "Error en formato JSON");
            return ResponseEntity.badRequest().body(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (IOException e) {
            log.error("Fallo al procesar la imagen de la marca", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

        } catch (Exception e) {
            log.error("Fallo al crear marca", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarMarca(
            @PathVariable Long id,
            @RequestParam("marca") String marcaJson,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Parsear JSON
            MarcaDTO req = objectMapper.readValue(marcaJson, MarcaDTO.class);
            req.setImagen(imagen);

            // Actualizar marca
            Marca actualizada = marcaService.actualizarMarca(id, req);

            response.put("success", true);
            response.put("message", "Marca actualizada correctamente");
            response.put("data", actualizada);
            return ResponseEntity.ok(response);

        } catch (JsonProcessingException e) {
            response.put("success", false);
            response.put("message", "Error en formato JSON");
            return ResponseEntity.badRequest().body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (IOException e) {
            log.error("Fallo al procesar la imagen de la marca {}", id, e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            log.error("Fallo al actualizar marca {}", id, e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarMarca(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            marcaService.eliminarMarca(id);
            response.put("success", true);
            response.put("message", "Marca eliminada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Fallo al eliminar marca {}", id, e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }
}