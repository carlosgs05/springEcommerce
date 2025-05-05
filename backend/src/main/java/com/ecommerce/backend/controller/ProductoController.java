package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ProductoRequest;
import com.ecommerce.backend.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permite todos los orígenes
public class ProductoController {
    private final ProductoService productoService;

    @PostMapping("/crear")
    public ResponseEntity<?> crearProducto(
            @RequestParam("producto") String productoJson,
            @RequestParam("imagenes") MultipartFile[] imagenes) {
        Map<String, Object> resp = new HashMap<>();
        try {
            ProductoRequest req = productoService.parsearJson(productoJson, Arrays.asList(imagenes));
            ProductoRequest creado = productoService.crearProducto(req);

            resp.put("success", true);
            resp.put("message", "Producto creado correctamente");
            resp.put("data", creado);
            return ResponseEntity.ok(resp);

        } catch (IllegalArgumentException e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);

        } catch (IOException e) {
            resp.put("success", false);
            resp.put("message", "Error al procesar imágenes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);

        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @GetMapping("/listarAll")
    public ResponseEntity<?> listarTodosLosProductos() {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<ProductoRequest> lista = productoService.listarTodosLosProductos();
            resp.put("success", true);
            resp.put("data", lista);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @GetMapping("/filtrar")
    public ResponseEntity<?> filtrarProductos(
            @RequestParam(required = false) Long categoria,
            @RequestParam(required = false) Long marca) {
        List<ProductoRequest> productos = productoService.filtrarProductos(categoria, marca);
        return ResponseEntity.ok(Map.of("data", productos, "success", true));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        Map<String,Object> resp = new HashMap<>();
        try {
            productoService.eliminarProducto(id);
            resp.put("success", true);
            resp.put("message", "Producto y sus imágenes eliminados correctamente");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error al eliminar producto: " + e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }

    @DeleteMapping("/imagenes/eliminar/{nombre}")
    public ResponseEntity<?> eliminarImagen(@PathVariable String nombre) {
        Map<String,Object> resp = new HashMap<>();
        try {
            productoService.eliminarImagen(nombre);
            resp.put("success", true);
            resp.put("message", "Imagen eliminada correctamente");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", "Error al eliminar imagen: " + e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }
}