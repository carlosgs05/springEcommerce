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
}