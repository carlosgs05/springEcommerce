package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ProductoRequest;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.service.ProductoService;
import com.ecommerce.backend.repository.ProductoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {
    private final ProductoService productoService;
    private final ProductoRepository productoRepository;

    @PostMapping("/crear")
    public ResponseEntity<?> crearProducto(
            @RequestParam("producto") String productoRequestJson,
            @RequestParam("imagenes") MultipartFile[] imagenes) {
    
        Map<String, Object> response = new HashMap<>();
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ProductoRequest productoRequest = objectMapper.readValue(productoRequestJson, ProductoRequest.class);
            productoRequest.setImagenes(Arrays.asList(imagenes));
    
            // Forzar la carga de relaciones
            Producto producto = productoService.crearProducto(productoRequest);
            producto = productoRepository.findById(producto.getIdproducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    
            response.put("success", true);
            response.put("message", "Producto creado correctamente");
            response.put("data", producto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}