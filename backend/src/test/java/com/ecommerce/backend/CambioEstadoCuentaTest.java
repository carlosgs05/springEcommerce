package com.ecommerce.backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.ecommerce.backend.config.JWTAuthFilter;
import com.ecommerce.backend.config.SecurityConfig;
import com.ecommerce.backend.controller.AdminUsuarioController;
import com.ecommerce.backend.controller.UsuarioController;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.RolRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import com.ecommerce.backend.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Activar/desactivar una cuenta por el administrador: exito, proteccion del ultimo admin activo, usuario
 * inexistente y que el login de una cuenta desactivada da 403. Sin base real (repositorios simulados), mismo
 * estilo que CambioRolDia2Test.
 */
@WebMvcTest({UsuarioController.class, AdminUsuarioController.class})
@Import({SecurityConfig.class, JWTAuthFilter.class, JWTUtils.class, UsuarioDetailsService.class, UsuarioService.class,
        AdminUsuarioService.class, RolPersistencia.class, EstadoCuentaPersistencia.class})
@TestPropertySource(properties = {"app.jwt.secret=" + AuthSeguridadDia2Test.SECRETO})
class CambioEstadoCuentaTest {

    static final String CLAVE = AuthSeguridadDia2Test.CLAVE;

    @Autowired MockMvc mvc;
    @Autowired JWTUtils jwt;
    @MockitoBean UsuarioRepository repo;
    @MockitoBean RolRepository rolRepo;
    @MockitoBean EmailService email;

    final ObjectMapper om = new ObjectMapper();
    final BCryptPasswordEncoder enc = new BCryptPasswordEncoder(4);
    Usuario admin, otroAdmin, cliente;

    private Usuario usuario(int id, String correo, int idrol, String nombreRol) {
        Rol r = new Rol();
        r.setIdrol(idrol);
        r.setNombre(nombreRol);
        Usuario u = new Usuario();
        u.setIduser(id);
        u.setNombre("Nombre" + id);
        u.setApellido("Apellido" + id);
        u.setCorreo(correo);
        u.setDni("12345678");
        u.setCelular("987654321");
        u.setPassword(enc.encode(CLAVE));
        u.setEnabled(true);
        u.setActivo(true);
        u.setRol(r);
        return u;
    }

    @BeforeEach
    void preparar() {
        admin = usuario(1, "admin@x.com", 1, "ADMINISTRADOR");
        otroAdmin = usuario(2, "otro@x.com", 1, "ADMINISTRADOR");
        cliente = usuario(3, "cliente@x.com", 2, "CLIENTE");
        for (Usuario u : new Usuario[]{admin, otroAdmin, cliente}) {
            when(repo.findByCorreo(u.getCorreo())).thenReturn(Optional.of(u));
            when(repo.findById(u.getIduser())).thenReturn(Optional.of(u));
            when(repo.cambiarEstado(eq(u.getIduser()), anyBoolean(), anyBoolean())).thenAnswer(i -> {
                if (u.isActivo() != (Boolean) i.getArgument(2)) return 0;   // UPDATE condicionado al activo actual
                u.setSesionVersion(u.getSesionVersion() + 1);
                u.setActivo(i.getArgument(1));
                return 1;
            });
        }
        when(repo.bloquearAdminsActivosYHabilitados()).thenAnswer(i -> java.util.stream.Stream.of(admin, otroAdmin, cliente)
                .filter(x -> x.getRol().getIdrol() == 1 && x.isEnabled() && x.isActivo())
                .map(Usuario::getIduser).toList());
    }

    private String access(Usuario u) {
        return "Bearer " + jwt.generateToken(u);
    }

    private MvcResult cambiarEstado(String auth, int iduser, Boolean activo) throws Exception {
        String cuerpo = activo == null ? "{}" : "{\"activo\":" + activo + "}";
        var rb = put("/api/admin/usuarios/" + iduser + "/estado").contentType(MediaType.APPLICATION_JSON).content(cuerpo);
        if (auth != null) rb = rb.header("Authorization", auth);
        return mvc.perform(rb).andReturn();
    }

    private JsonNode json(MvcResult r) throws Exception {
        return om.readTree(r.getResponse().getContentAsString());
    }

    private int login(String correo, String clave) throws Exception {
        String cuerpo = om.writeValueAsString(java.util.Map.of("correo", correo, "password", clave));
        return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(cuerpo))
                .andReturn().getResponse().getStatus();
    }

    // ---------- camino bueno: desactivar con exito ----------

    @Test
    void desactivarUnClienteFuncionaYSubeSv() throws Exception {
        MvcResult r = cambiarEstado(access(admin), 3, false);
        assertEquals(200, r.getResponse().getStatus(), r.getResponse().getContentAsString());
        assertEquals("Estado actualizado", json(r).get("message").asText());
        assertFalse(json(r).get("usuario").get("activo").asBoolean());
        verify(repo).cambiarEstado(3, false, true);
        assertEquals(1, cliente.getSesionVersion());
        assertFalse(cliente.isActivo());
    }

    @Test
    void reactivarUnClienteFuncionaYSubeSv() throws Exception {
        cliente.setActivo(false);
        MvcResult r = cambiarEstado(access(admin), 3, true);
        assertEquals(200, r.getResponse().getStatus());
        assertTrue(json(r).get("usuario").get("activo").asBoolean());
        verify(repo).cambiarEstado(3, true, false);
    }

    @Test
    void mismoEstadoEs200SinCambios() throws Exception {
        MvcResult r = cambiarEstado(access(admin), 3, true);   // cliente ya esta activo
        assertEquals(200, r.getResponse().getStatus());
        verify(repo, never()).cambiarEstado(anyInt(), anyBoolean(), anyBoolean());
        assertEquals(0, cliente.getSesionVersion());
    }

    // ---------- proteccion del ultimo administrador activo ----------

    @Test
    void desactivarAlUltimoAdminActivoDa409SinCambiarNada() throws Exception {
        // el unico admin activo+habilitado es el objetivo mismo (otroAdmin)
        when(repo.bloquearAdminsActivosYHabilitados()).thenReturn(java.util.List.of(2));
        MvcResult r = cambiarEstado(access(admin), 2, false);
        assertEquals(409, r.getResponse().getStatus(), r.getResponse().getContentAsString());
        assertEquals("No se puede desactivar al único administrador activo", json(r).get("message").asText());
        verify(repo, never()).cambiarEstado(anyInt(), anyBoolean(), anyBoolean());
        assertTrue(otroAdmin.isActivo());
        assertEquals(0, otroAdmin.getSesionVersion());
    }

    @Test
    void desactivarAUnAdminConOtroAdminActivoFunciona() throws Exception {
        MvcResult r = cambiarEstado(access(admin), 2, false);   // admin (actor) sigue activo
        assertEquals(200, r.getResponse().getStatus(), r.getResponse().getContentAsString());
        assertFalse(otroAdmin.isActivo());
        verify(repo).bloquearAdminsActivosYHabilitados();
    }

    // ---------- usuario inexistente ----------

    @Test
    void usuarioInexistenteEs404() throws Exception {
        MvcResult r = cambiarEstado(access(admin), 9999, false);
        assertEquals(404, r.getResponse().getStatus());
        assertEquals("Usuario no encontrado", json(r).get("message").asText());
        verify(repo, never()).cambiarEstado(anyInt(), anyBoolean(), anyBoolean());
    }

    // ---------- datos invalidos / sin permiso ----------

    @Test
    void activoNuloEs400ConFieldError() throws Exception {
        MvcResult r = cambiarEstado(access(admin), 3, null);
        assertEquals(400, r.getResponse().getStatus());
        assertEquals("Estado no válido", json(r).get("fieldErrors").get("activo").asText());
        verify(repo, never()).cambiarEstado(anyInt(), anyBoolean(), anyBoolean());
    }

    @Test
    void sinSesionEs401YNoToca() throws Exception {
        assertEquals(401, cambiarEstado(null, 3, false).getResponse().getStatus());
        verify(repo, never()).cambiarEstado(anyInt(), anyBoolean(), anyBoolean());
    }

    @Test
    void clienteConSesionEs403EnSecurityConfigYNoToca() throws Exception {
        MvcResult r = cambiarEstado(access(cliente), 2, false);
        assertEquals(403, r.getResponse().getStatus());
        verify(repo, never()).cambiarEstado(anyInt(), anyBoolean(), anyBoolean());
    }

    // ---------- cuenta desactivada no puede loguear ----------

    @Test
    void loginDeCuentaDesactivadaEs403NoCrashNiOk() throws Exception {
        cliente.setActivo(false);
        assertEquals(403, login("cliente@x.com", CLAVE));
    }

    @Test
    void loginDeCuentaActivaSigueFuncionando() throws Exception {
        assertEquals(200, login("cliente@x.com", CLAVE));
    }
}
