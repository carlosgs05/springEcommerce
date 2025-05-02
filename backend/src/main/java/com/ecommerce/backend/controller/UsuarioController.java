package com.ecommerce.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.backend.dto.ReqRes;
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

    @PostMapping("/forgot-password")
    public ResponseEntity<ReqRes> forgotPassword(@RequestBody ReqRes req) {
        return ResponseEntity.ok(usuarioService.forgotPassword(req));
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<ReqRes> verifyResetCode(@RequestBody ReqRes req) {
        return ResponseEntity.ok(usuarioService.verifyResetCode(req));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ReqRes> resetPassword(@RequestBody ReqRes req) {
        return ResponseEntity.ok(usuarioService.resetPassword(req));
    }

    @PostMapping("/correo")
    public ResponseEntity<ReqRes> getUserByCorreo(@RequestBody ReqRes req) {
        return ResponseEntity.ok(usuarioService.getUserByCorreo(req.getCorreo()));
    }

    // Nuevo endpoint para actualizar datos de usuario
    @PutMapping("/update-user")
    public ResponseEntity<ReqRes> updateUser(@RequestBody ReqRes updateRequest) {
        return ResponseEntity.ok(usuarioService.updateUser(updateRequest));
    }

}
