package com.ecommerce.backend.service;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ecommerce.backend.entity.Usuario;

/**
 * Quien hace la peticion, SIEMPRE sacado del token verificado (nunca del body/parametros).
 *
 * - Sesion normal (JWT typ=access): JWTAuthFilter deja un Authentication en el SecurityContext
 *   con principal = Usuario y authority "TOKEN_ACCESS" (mas el nombre del rol).
 */
public final class SesionActual {

    public static final String AUTH_ACCESS = "TOKEN_ACCESS";

    private SesionActual() {
    }

    /** Usuario de una sesion normal (typ=access), o vacio. */
    public static Optional<Usuario> usuarioAccess() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a != null && a.isAuthenticated() && a.getPrincipal() instanceof Usuario u
                && a.getAuthorities().stream().anyMatch(g -> AUTH_ACCESS.equals(g.getAuthority()))) {
            return Optional.of(u);
        }
        return Optional.empty();
    }
}
