package com.ecommerce.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.backend.dto.ReqRes;
import com.ecommerce.backend.dto.UsuarioUpdateRequest;
import com.ecommerce.backend.service.UsuarioService;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<ReqRes> regeister(@RequestBody ReqRes reg) {
        return ResponseEntity.ok(usuarioService.register(reg));
    }

    @PostMapping("/login")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req) {
        ReqRes res = usuarioService.login(req);
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<ReqRes> obtenerUsuarioPorId(@PathVariable Long id) {
        ReqRes res = usuarioService.obtenerUsuarioPorId(id);
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }
    @PutMapping("/actualizar/{usuarioId}")
    public ResponseEntity<ReqRes> actualizarUsuario(
            @PathVariable Long usuarioId,
            @RequestBody UsuarioUpdateRequest updateRequest) {
    
        ReqRes response = usuarioService.actualizarUsuario(usuarioId);
        return ResponseEntity
                 .status(response.getStatusCode())
                 .body(response);
    }
}
