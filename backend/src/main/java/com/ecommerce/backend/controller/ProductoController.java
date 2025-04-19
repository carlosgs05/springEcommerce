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

}