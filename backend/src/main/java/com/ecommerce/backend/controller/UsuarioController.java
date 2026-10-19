package com.ecommerce.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.backend.dto.UsuarioDTO;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.service.SesionActual;
import com.ecommerce.backend.service.UsuarioService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    private static ResponseEntity<UsuarioDTO> http(UsuarioDTO r) {
        return ResponseEntity.status(r.getStatusCode()).body(r);
    }

    /** Dueño del token de sesion (typ=access); null si no hay (las reglas de SecurityConfig ya dan 401 antes). */
    private static Integer idSesion() {
        return SesionActual.usuarioAccess().map(Usuario::getIduser).orElse(null);
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioDTO> register(@RequestBody UsuarioDTO reg) {
        return http(usuarioService.register(reg));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<UsuarioDTO> verifyEmail(@RequestParam String token) {
        return http(usuarioService.verifyEmail(token));
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> login(@RequestBody UsuarioDTO req, HttpServletRequest request) {
        return http(usuarioService.login(req, request.getRemoteAddr()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<UsuarioDTO> forgotPassword(@RequestBody UsuarioDTO req, HttpServletRequest request) {
        return http(usuarioService.forgotPassword(req, request.getRemoteAddr()));
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<UsuarioDTO> verifyResetCode(@RequestBody UsuarioDTO req, HttpServletRequest request) {
        return http(usuarioService.verifyResetCode(req, request.getRemoteAddr()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<UsuarioDTO> resetPassword(@RequestBody UsuarioDTO req, HttpServletRequest request) {
        return http(usuarioService.resetPassword(req, request.getRemoteAddr()));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> me() {
        return http(usuarioService.getMe(idSesion()));
    }

    // Se mantiene por compatibilidad: exige sesion y devuelve SOLO al dueño del token (ignora el body).
    @PostMapping("/correo")
    public ResponseEntity<UsuarioDTO> getUserByCorreo() {
        return http(usuarioService.getMe(idSesion()));
    }

    // Edita SOLO la cuenta del token; cualquier "correo" del body se ignora.
    @PutMapping("/update-user")
    public ResponseEntity<UsuarioDTO> updateUser(@RequestBody UsuarioDTO updateRequest) {
        return http(usuarioService.updateUser(idSesion(), updateRequest));
    }

    @PutMapping("/change-password")
    public ResponseEntity<UsuarioDTO> changePassword(@RequestBody UsuarioDTO req, HttpServletRequest request) {
        return http(usuarioService.changePassword(idSesion(), req, request.getRemoteAddr()));
    }

    @PostMapping("/change-email")
    public ResponseEntity<UsuarioDTO> changeEmail(@RequestBody UsuarioDTO req, HttpServletRequest request) {
        return http(usuarioService.changeEmail(idSesion(), req, request.getRemoteAddr()));
    }

    @PostMapping("/change-email/confirm")
    public ResponseEntity<UsuarioDTO> confirmChangeEmail(@RequestBody UsuarioDTO req, HttpServletRequest request) {
        return http(usuarioService.confirmChangeEmail(idSesion(), req, request.getRemoteAddr()));
    }

}
