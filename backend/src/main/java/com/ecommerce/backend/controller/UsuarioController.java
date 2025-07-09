package com.ecommerce.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.backend.dto.UsuarioDTO;
import com.ecommerce.backend.service.UsuarioService;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<UsuarioDTO> regeister(@RequestBody UsuarioDTO reg) {
        return ResponseEntity.ok(usuarioService.register(reg));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<UsuarioDTO> verifyEmail(@RequestParam String token) {
        UsuarioDTO response = usuarioService.verifyEmail(token);

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> login(@RequestBody UsuarioDTO req, HttpSession session) {
        UsuarioDTO res = usuarioService.login(req);
        if (res.getStatusCode() == 200) {
            // Solo si el login fue exitoso (statusCode == 200) guardamos el id en la sesión
            session.setAttribute("userId", res.getUsuario().getIduser());
        }
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<UsuarioDTO> forgotPassword(@RequestBody UsuarioDTO req) {
        return ResponseEntity.ok(usuarioService.forgotPassword(req));
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<UsuarioDTO> verifyResetCode(@RequestBody UsuarioDTO req) {
        return ResponseEntity.ok(usuarioService.verifyResetCode(req));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<UsuarioDTO> resetPassword(@RequestBody UsuarioDTO req) {
        return ResponseEntity.ok(usuarioService.resetPassword(req));
    }

    @PostMapping("/correo")
    public ResponseEntity<UsuarioDTO> getUserByCorreo(@RequestBody UsuarioDTO req) {
        return ResponseEntity.ok(usuarioService.getUserByCorreo(req.getCorreo()));
    }
}
