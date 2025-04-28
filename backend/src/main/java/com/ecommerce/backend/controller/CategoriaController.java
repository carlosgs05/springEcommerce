package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Categoria;
import com.ecommerce.backend.service.CategoriaService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {
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
            response.put("success", false);
            response.put("message", "Error al listar categorías: " + e.getMessage());
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
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear categoría: " + e.getMessage());
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
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener categoria: " + e.getMessage());
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
            response.put("sucess",true);
            response.put("message", "Categoria actualizada correctamente");
            response.put("data", actualizada);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("menssage", "Error al actualizar categoria" + e.getMessage());
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
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar categoria: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}