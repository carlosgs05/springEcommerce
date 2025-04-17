package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Comentario;
import com.ecommerce.backend.service.ComentarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comentarios")
public class ComentarioController {

    @Autowired
    private ComentarioService comentarioService;

    @GetMapping
    public ResponseEntity<List<Comentario>> getAllComentarios() {
        return ResponseEntity.ok(comentarioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comentario> getComentarioById(@PathVariable Integer id) {
        Comentario comentario = comentarioService.findById(id);
        return comentario != null ? ResponseEntity.ok(comentario) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Comentario> createComentario(@RequestBody Comentario comentario) {
        return ResponseEntity.ok(comentarioService.save(comentario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comentario> updateComentario(@PathVariable Integer id, @RequestBody Comentario comentario) {
        if (!id.equals(comentario.getIdcomentario())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(comentarioService.save(comentario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComentario(@PathVariable Integer id) {
        comentarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Comentario>> getComentariosByUsuario(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(comentarioService.findByUsuario(usuarioId));
    }
}
