package com.ecommerce.backend.config;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.service.JWTUtils;
import com.ecommerce.backend.service.SesionActual;
import com.ecommerce.backend.service.UsuarioDetailsService;

import io.jsonwebtoken.Claims;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Lee "Authorization: Bearer ...". Un token invalido, expirado, mal firmado o de otro tipo NUNCA
 * produce error: la peticion sigue como anonima y la regla de la ruta decide (401 si la exige).
 *
 * - typ=access  -> autentica la sesion (principal Usuario, authority TOKEN_ACCESS + rol).
 *   Cualquier otro typ (incluidos los viejos mfa_totp / mfa_setup) se ignora.
 */
@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JWTAuthFilter.class);
    private static final String BEARER = "Bearer ";

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private UsuarioDetailsService usuarioDetailsService;


    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith(BEARER)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                autenticar(authHeader.substring(BEARER.length()).trim(), request);
            } catch (Exception e) {
                // Token malo/expirado/usuario inexistente: se sigue como anonimo. Sin el token en el log.
                log.debug("Token Bearer rechazado ({}), la peticion sigue como anonima", e.getClass().getSimpleName());
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }

    private void autenticar(String jwtToken, HttpServletRequest request) {
        Claims claims = jwtUtils.parseClaims(jwtToken);   // lanza si expirado / firma mala / malformado
        String typ = claims.get(JWTUtils.CLAIM_TYP, String.class);
        String correo = claims.getSubject();
        if (typ == null || correo == null) {
            return;
        }

        if (JWTUtils.TYP_ACCESS.equals(typ)) {
            Usuario usuario = cargarUsuarioActivo(correo);
            if (usuario == null) {
                return;
            }
            // Token emitido con otra contraseña (cambiada o restablecida despues): ya no vale
            if (!JWTUtils.pwvCoincide(claims, usuario.getPassword())) {
                log.debug("Token de sesion con contraseña anterior: la peticion sigue como anonima");
                return;
            }
            // Token de una version de sesion anterior (rol o correo cambiados) o sin sv: no vale
            if (!JWTUtils.svCoincide(claims, usuario.getSesionVersion())) {
                log.debug("Token de sesion con version anterior (sv): la peticion sigue como anonima");
                return;
            }
            List<GrantedAuthority> authorities = new ArrayList<>(usuario.getAuthorities());
            authorities.add(new SimpleGrantedAuthority(SesionActual.AUTH_ACCESS));
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(usuario, null, authorities);
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);
        }
        // cualquier otro typ: no sirve como sesion
    }

    private Usuario cargarUsuarioActivo(String correo) {
        Usuario u = (Usuario) usuarioDetailsService.loadUserByUsername(correo);
        return u.isEnabled() ? u : null;
    }
}
