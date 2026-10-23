package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Categoria;
import com.ecommerce.backend.service.CategoriaService;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private static final Logger log = LoggerFactory.getLogger(CategoriaController.class);
    private static final String MSG_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo más tarde.";

    private final CategoriaService categoriaService;

    @GetMapping("/listar")
    public ResponseEntity<?> listarCategorias() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Categoria> categorias = categoriaService.listarCategorias();
            response.put("success", true);
            response.put("message", "Categorías listadas correctamente");
            response.put("data", categorias);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Fallo al listar categorías", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearCategoria(@RequestBody Categoria categoria) {
        Map<String, Object> response = new HashMap<>();
        try {
            Categoria nuevaCategoria = categoriaService.crearCategoria(categoria);
            response.put("success", true);
            response.put("message", "Categoría creada correctamente");
            response.put("data", nuevaCategoria);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Fallo al crear categoría", e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCategoria(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Categoria categoria = categoriaService.obtenerCategoriaPorId(id);
            response.put("success", true);
            response.put("message", "Categoria obtenida correctamente");
            response.put("data", categoria);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Fallo al obtener categoria {}", id, e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarCategoria(
            @PathVariable Long id,
            @RequestBody Categoria categoria) {
        Map<String, Object> response = new HashMap<>();
        try {
            Categoria actualizada = categoriaService.actualizarCategoria(id, categoria);
            response.put("success", true);
            response.put("message", "Categoria actualizada correctamente");
            response.put("data", actualizada);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Fallo al actualizar categoria {}", id, e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            categoriaService.eliminarCategoria(id);
            response.put("success", true);
            response.put("message", "Categoria eliminada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error("Fallo al eliminar categoria {}", id, e);
            response.put("success", false);
            response.put("message", MSG_GENERICO);
            return ResponseEntity.badRequest().body(response);
        }
    }
}