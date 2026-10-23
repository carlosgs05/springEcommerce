package com.ecommerce.backend.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.CambiarEstadoRequest;
import com.ecommerce.backend.dto.CambiarRolRequest;
import com.ecommerce.backend.dto.UsuarioDTO;
import com.ecommerce.backend.dto.UsuariosPaginaResponse;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.service.AdminUsuarioService;
import com.ecommerce.backend.service.SesionActual;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Administracion de cuentas (contrato Dia 2). SecurityConfig exige sesion access + rol ADMINISTRADOR para
 * /api/admin/**; aqui el admin sale SOLO de SesionActual, nunca del body.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminUsuarioController {

    @Autowired
    private AdminUsuarioService adminService;

    private static ResponseEntity<UsuarioDTO> http(UsuarioDTO r) {
        return ResponseEntity.status(r.getStatusCode()).cacheControl(CacheControl.noStore()).body(r);
    }

    private static ResponseEntity<UsuarioDTO> sinSesion() {
        UsuarioDTO r = new UsuarioDTO();
        r.setStatusCode(401);
        r.setMessage("Sesión no válida o expirada");
        return http(r);
    }

    private static ResponseEntity<UsuariosPaginaResponse> httpPagina(UsuariosPaginaResponse r) {
        return ResponseEntity.status(r.getStatusCode()).cacheControl(CacheControl.noStore()).body(r);
    }

    private static ResponseEntity<UsuariosPaginaResponse> sinSesionPagina() {
        UsuariosPaginaResponse r = new UsuariosPaginaResponse();
        r.setStatusCode(401);
        r.setMessage("Sesión no válida o expirada");
        return httpPagina(r);
    }

    @PutMapping("/usuarios/{iduser}/rol")
    public ResponseEntity<UsuarioDTO> cambiarRol(@PathVariable Integer iduser, @RequestBody CambiarRolRequest req,
                                                 HttpServletRequest request) {
        Optional<Usuario> admin = SesionActual.usuarioAccess();
        return admin.isPresent() ? http(adminService.cambiarRol(admin.get(), iduser, req, request.getRemoteAddr())) : sinSesion();
    }

    @GetMapping("/usuarios")
    public ResponseEntity<UsuariosPaginaResponse> listarUsuarios(@RequestParam(required = false) String search,
                                                                 @RequestParam(required = false) Integer page,
                                                                 @RequestParam(required = false) Integer size) {
        Optional<Usuario> admin = SesionActual.usuarioAccess();
        return admin.isPresent() ? httpPagina(adminService.listarUsuarios(admin.get(), search, page, size)) : sinSesionPagina();
    }

    @PutMapping("/usuarios/{iduser}/estado")
    public ResponseEntity<UsuarioDTO> cambiarEstado(@PathVariable Integer iduser, @RequestBody CambiarEstadoRequest req,
                                                    HttpServletRequest request) {
        Optional<Usuario> admin = SesionActual.usuarioAccess();
        return admin.isPresent() ? http(adminService.cambiarEstado(admin.get(), iduser, req, request.getRemoteAddr())) : sinSesion();
    }
}
