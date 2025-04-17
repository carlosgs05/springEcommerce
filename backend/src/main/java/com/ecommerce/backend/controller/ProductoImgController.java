package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.ProductoImg;
import com.ecommerce.backend.service.ProductoImgService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/producto-imagenes")
public class ProductoImgController {

    @Autowired
    private ProductoImgService productoImgService;

    @GetMapping
    public ResponseEntity<List<ProductoImg>> getAllProductoImagenes() {
        return ResponseEntity.ok(productoImgService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoImg> getProductoImgById(@PathVariable Integer id) {
        ProductoImg productoImg = productoImgService.findById(id);
        return productoImg != null ? ResponseEntity.ok(productoImg) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<ProductoImg> createProductoImg(@RequestBody ProductoImg productoImg) {
        return ResponseEntity.ok(productoImgService.save(productoImg));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoImg> updateProductoImg(@PathVariable Integer id, @RequestBody ProductoImg productoImg) {
        if (!id.equals(productoImg.getId())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productoImgService.save(productoImg));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductoImg(@PathVariable Integer id) {
        productoImgService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<ProductoImg>> getImagenesByProducto(@PathVariable Integer productoId) {
        return ResponseEntity.ok(productoImgService.findByProducto(productoId));
    }
}