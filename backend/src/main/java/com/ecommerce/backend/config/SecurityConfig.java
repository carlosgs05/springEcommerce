package com.ecommerce.backend.config;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.core.Authentication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ecommerce.backend.service.SesionActual;
import com.ecommerce.backend.service.UsuarioDetailsService;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UsuarioDetailsService usuarioDetailsService;
    @Autowired
    private JWTAuthFilter jwtAuthFilter;


    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
        httpSecurity.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(request -> request
                        // Rutas que operan sobre el dueño del token: exigen sesion (JWT typ=access).
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/correo").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/update-user").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/change-password").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/change-email").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/change-email/confirm").authenticated()
                        // Carrito y favoritos: del dueño de la sesion, no admin. Sin sesion, 401.
                        .requestMatchers("/api/carrito/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())))
                        .requestMatchers("/api/favoritos/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())))
                        // Administracion: sesion access Y rol ADMINISTRADOR (sin sesion 401, con otro rol 403).
                        .requestMatchers("/api/admin/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        // Escritura de categorias y marcas: sesion access Y rol ADMINISTRADOR. El GET sigue publico.
                        .requestMatchers(HttpMethod.POST, "/api/categorias/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.PUT, "/api/categorias/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.DELETE, "/api/categorias/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.POST, "/api/marcas/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.PUT, "/api/marcas/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.DELETE, "/api/marcas/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.POST, "/api/productos/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.PUT, "/api/productos/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        // Escritura de metodos de pago: sesion access Y rol ADMINISTRADOR. El GET sigue publico.
                        .requestMatchers(HttpMethod.POST, "/api/metodopago/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.PUT, "/api/metodopago/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        .requestMatchers(HttpMethod.DELETE, "/api/metodopago/**").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())
                                        && auth.get().getAuthorities().stream()
                                                .anyMatch(g -> "ADMINISTRADOR".equals(g.getAuthority()))))
                        // Pasarelas de pago: cargo/token lo pide el cliente con su propia sesion (igual que carrito).
                        .requestMatchers(HttpMethod.POST, "/api/pagos/culqi/cargo").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())))
                        .requestMatchers(HttpMethod.POST, "/api/pagos/mercadopago/pago").access((auth, ctx) ->
                                new AuthorizationDecision(tieneSesionAccess(auth.get())))
                        // Webhooks: los llama la pasarela externa, no un usuario con JWT -> publicos.
                        // La validacion de autenticidad va DENTRO del controller (validarFirma), no aqui.
                        .requestMatchers("/api/pagos/culqi/webhook").permitAll()
                        .requestMatchers("/api/pagos/mercadopago/webhook").permitAll()
                        // /error debe ser accesible: sin esto un JSON mal formado de un anonimo acaba en 401 en vez de 400
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) -> escribirJson(res, 401, "Sesión no válida o expirada"))
                        .accessDeniedHandler((req, res, ex) -> escribirJson(res, 403, "No tienes permiso para esta acción")))
                .sessionManagement(manager->manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider()).addFilterBefore(
                        jwtAuthFilter, UsernamePasswordAuthenticationFilter.class
                );
        return httpSecurity.build();
    }

    private static boolean tieneSesionAccess(Authentication a) {
        return a != null && a.isAuthenticated()
                && a.getAuthorities().stream().anyMatch(g -> SesionActual.AUTH_ACCESS.equals(g.getAuthority()));
    }

    private static void escribirJson(jakarta.servlet.http.HttpServletResponse res, int status, String mensaje)
            throws java.io.IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        res.getWriter().write("{\"statusCode\":" + status + ",\"message\":\"" + mensaje + "\"}");
    }

    @Bean
    AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(usuarioDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception{
        return authenticationConfiguration.getAuthenticationManager();
    }

}
