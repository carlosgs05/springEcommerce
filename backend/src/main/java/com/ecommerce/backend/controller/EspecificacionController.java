package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Especificacion;
import com.ecommerce.backend.service.EspecificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/especificaciones")
public class EspecificacionController {

    @Autowired
    private EspecificacionService especificacionService;

    @GetMapping
    public ResponseEntity<List<Especificacion>> getAllEspecificaciones() {
        return ResponseEntity.ok(especificacionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Especificacion> getEspecificacionById(@PathVariable Integer id) {
        Especificacion especificacion = especificacionService.findById(id);
        return especificacion != null ? ResponseEntity.ok(especificacion) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Especificacion> createEspecificacion(@RequestBody Especificacion especificacion) {
        return ResponseEntity.ok(especificacionService.save(especificacion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Especificacion> updateEspecificacion(@PathVariable Integer id, @RequestBody Especificacion especificacion) {
        if (!id.equals(especificacion.getIdespecificacion())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(especificacionService.save(especificacion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEspecificacion(@PathVariable Integer id) {
        especificacionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Especificacion>> getEspecificacionesByProducto(@PathVariable Integer productoId) {
        return ResponseEntity.ok(especificacionService.findByProducto(productoId));
    }
}