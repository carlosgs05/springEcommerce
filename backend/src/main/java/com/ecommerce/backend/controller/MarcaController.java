package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Marca;
import com.ecommerce.backend.service.MarcaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
public class MarcaController {
    private final MarcaService marcaService;

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
            response.put("success", false);
            response.put("message", "Error al listar marcas: " + e.getMessage());
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
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener marca: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearMarca(@RequestBody Marca marca) {
        Map<String, Object> response = new HashMap<>();
        try {
            Marca nuevaMarca = marcaService.crearMarca(marca);
            response.put("success", true);
            response.put("message", "Marca creada correctamente");
            response.put("data", nuevaMarca);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear marca: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarMarca(
            @PathVariable Long id,
            @RequestBody Marca marca) {
        Map<String, Object> response = new HashMap<>();
        try {
            Marca actualizada = marcaService.actualizarMarca(id, marca);
            response.put("success", true);
            response.put("message", "Marca actualizada correctamente");
            response.put("data", actualizada);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar marca: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
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
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar marca: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}