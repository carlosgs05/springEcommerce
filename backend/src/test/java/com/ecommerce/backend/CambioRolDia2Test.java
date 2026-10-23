package com.ecommerce.backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
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

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;

/**
 * Cambio de rol por el administrador (sin segundo factor), version de sesion (sv), ultimo administrador,
 * UPDATE condicionado, auditoria y correos de aviso. Sin base real (repositorios simulados).
 */
@WebMvcTest({UsuarioController.class, AdminUsuarioController.class})
@Import({SecurityConfig.class, JWTAuthFilter.class, JWTUtils.class, UsuarioDetailsService.class, UsuarioService.class,
        AdminUsuarioService.class, RolPersistencia.class, EstadoCuentaPersistencia.class})
@TestPropertySource(properties = {"app.jwt.secret=" + AuthSeguridadDia2Test.SECRETO})
class CambioRolDia2Test {

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
            when(repo.cambiarRol(eq(u.getIduser()), anyInt(), anyInt())).thenAnswer(i -> {
                if (!u.getRol().getIdrol().equals(i.getArgument(2))) return 0;   // UPDATE condicionado al rol actual
                u.setSesionVersion(u.getSesionVersion() + 1);
                Rol r = new Rol();
                r.setIdrol(i.getArgument(1));
                r.setNombre(((Integer) i.getArgument(1)) == 1 ? "ADMINISTRADOR" : "CLIENTE");
                u.setRol(r);
                return 1;
            });
        }
        when(repo.bloquearAdminsActivos()).thenAnswer(i -> java.util.stream.Stream.of(admin, otroAdmin, cliente)
                .filter(x -> x.getRol().getIdrol() == 1 && x.isEnabled())
                .map(Usuario::getIduser).toList());
    }

    // ---------- utilidades ----------

    private String access(Usuario u) {
        return "Bearer " + jwt.generateToken(u);
    }

    private MvcResult cambiarRol(String auth, String ruta, String cuerpo) throws Exception {
        var rb = put(ruta).contentType(MediaType.APPLICATION_JSON).content(cuerpo);
        if (auth != null) rb = rb.header("Authorization", auth);
        return mvc.perform(rb).andReturn();
    }

    private MvcResult cambiarRol(String auth, int iduser, Object idrol) throws Exception {
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        if (idrol != null) body.put("idrol", idrol);
        return cambiarRol(auth, "/api/admin/usuarios/" + iduser + "/rol", om.writeValueAsString(body));
    }

    private JsonNode json(MvcResult r) throws Exception {
        return om.readTree(r.getResponse().getContentAsString());
    }

    private int estado(String auth, String ruta) throws Exception {
        return mvc.perform(get(ruta).header("Authorization", auth)).andReturn().getResponse().getStatus();
    }

    // ---------- caminos malos ----------

    @Test
    void sinSesionEs401YNoToca() throws Exception {
        assertEquals(401, cambiarRol(null, 3, 1).getResponse().getStatus());
        assertEquals(401, cambiarRol("Bearer basura", 3, 1).getResponse().getStatus());
        verify(repo, never()).cambiarRol(any(), any(), any());
    }

    @Test
    void clienteConSesionEs403EnSecurityConfigYNoToca() throws Exception {
        MvcResult r = cambiarRol(access(cliente), 2, 1);
        assertEquals(403, r.getResponse().getStatus());
        assertEquals("No tienes permiso para esta acción", json(r).get("message").asText());
        verify(repo, never()).cambiarRol(any(), any(), any());
    }

    @Test
    void idrolMaloEs400ConFieldErrors() throws Exception {
        for (Object malo : new Object[]{null, 0, 3, -1, 99999}) {
            MvcResult r = cambiarRol(access(admin), 3, malo);
            assertEquals(400, r.getResponse().getStatus(), String.valueOf(malo));
            assertEquals("Rol no válido", json(r).get("fieldErrors").get("idrol").asText());
        }
        verify(repo, never()).cambiarRol(any(), any(), any());
    }

    @Test
    void jsonRotoOTiposEquivocadosEs400DatosNoValidos() throws Exception {
        for (String cuerpo : new String[]{"{no es json", "[]"}) {
            MvcResult r = cambiarRol(access(admin), "/api/admin/usuarios/3/rol", cuerpo);
            assertEquals(400, r.getResponse().getStatus(), cuerpo);
            assertEquals("Datos no válidos", json(r).get("message").asText(), cuerpo);
        }
        MvcResult r = cambiarRol(access(admin), "/api/admin/usuarios/abc/rol", "{\"idrol\":1}");
        assertEquals(400, r.getResponse().getStatus());
        assertEquals("Datos no válidos", json(r).get("message").asText());
    }

    @Test
    void usuarioInexistenteEs404() throws Exception {
        MvcResult r = cambiarRol(access(admin), 9999, 1);
        assertEquals(404, r.getResponse().getStatus());
        assertEquals("Usuario no encontrado", json(r).get("message").asText());
        verify(repo, never()).cambiarRol(any(), any(), any());
    }

    @Test
    void cambiarElRolPropioEs409() throws Exception {
        MvcResult r = cambiarRol(access(admin), 1, 2);
        assertEquals(409, r.getResponse().getStatus());
        assertEquals("No puedes cambiar tu propio rol", json(r).get("message").asText());
        verify(repo, never()).cambiarRol(any(), any(), any());
        assertEquals(1, admin.getRol().getIdrol());
    }

    @Test
    void idrolNoEnteroSeRechazaSinPromover() throws Exception {
        String ruta = "/api/admin/usuarios/3/rol";
        for (String malo : new String[]{"1.5", "1.0", "\"1\"", "true", "null", "[1]", "99999999999", "2.9"}) {
            MvcResult r = cambiarRol(access(admin), ruta, "{\"idrol\":" + malo + "}");
            assertEquals(400, r.getResponse().getStatus(), malo);
            assertEquals("Rol no válido", json(r).get("fieldErrors").get("idrol").asText(), malo);
        }
        assertEquals(400, cambiarRol(access(admin), ruta, "{}").getResponse().getStatus());
        assertEquals(2, cliente.getRol().getIdrol());
        verify(repo, never()).cambiarRol(any(), any(), any());
        assertEquals(200, cambiarRol(access(admin), ruta, "{\"idrol\":1}").getResponse().getStatus());
        assertEquals(1, cliente.getRol().getIdrol());
    }

    @Test
    void siElCambioFallaEnLaBaseResponde500GenericoSinDetalle() throws Exception {
        when(repo.cambiarRol(eq(3), anyInt(), anyInt())).thenThrow(new RuntimeException("tabla usuario rota SELECT secreto"));
        MvcResult r = cambiarRol(access(admin), 3, 1);
        assertEquals(500, r.getResponse().getStatus());
        assertFalse(r.getResponse().getContentAsString().contains("tabla"));
        Thread.sleep(300);
        verify(email, never()).sendRolCambiadoEmail(anyString(), anyString(), anyString());
    }

    // ---------- caminos buenos ----------

    @Test
    void clienteAAdminCambiaElRolSinCodigoAlgunoYAvisaPorCorreo() throws Exception {
        MvcResult r = cambiarRol(access(admin), 3, 1);   // body solo {idrol}: no hay segundo factor
        assertEquals(200, r.getResponse().getStatus(), r.getResponse().getContentAsString());
        JsonNode j = json(r);
        assertEquals("Rol actualizado", j.get("message").asText());
        assertEquals(1, j.get("usuario").get("rol").get("idrol").asInt());
        assertEquals("ADMINISTRADOR", j.get("usuario").get("rol").get("nombre").asText());
        String cuerpo = r.getResponse().getContentAsString();
        for (String prohibido : new String[]{"password", "mfa", "resetCode", "sesionVersion", "$2a$"}) {
            assertFalse(cuerpo.contains(prohibido), prohibido);
        }
        verify(repo).cambiarRol(3, 1, 2);
        verify(email, timeout(3000)).sendRolCambiadoEmail("cliente@x.com", "Nombre3", "administrador");
        assertEquals(1, cliente.getSesionVersion());
    }

    @Test
    void adminAClienteCambiaElRolSubeSvYAvisa() throws Exception {
        MvcResult r = cambiarRol(access(admin), 2, 2);
        assertEquals(200, r.getResponse().getStatus(), r.getResponse().getContentAsString());
        assertEquals(2, json(r).get("usuario").get("rol").get("idrol").asInt());
        verify(repo).cambiarRol(2, 2, 1);
        assertEquals(1, otroAdmin.getSesionVersion());
        verify(email, timeout(3000)).sendRolCambiadoEmail("otro@x.com", "Nombre2", "cliente");
    }

    @Test
    void mismoRolEs200SinCambiosNiCorreo() throws Exception {
        MvcResult r = cambiarRol(access(admin), 2, 1);
        assertEquals(200, r.getResponse().getStatus());
        assertTrue(json(r).has("usuario"));
        verify(repo, never()).cambiarRol(any(), any(), any());
        assertEquals(0, otroAdmin.getSesionVersion());
        Thread.sleep(300);
        verify(email, never()).sendRolCambiadoEmail(anyString(), anyString(), anyString());
    }

    // ---------- version de sesion (sv) ----------

    /** Access con un claim sv a medida (o sin sv si es null). */
    private String accessConSv(Usuario u, Integer sv) {
        var b = io.jsonwebtoken.Jwts.builder().claim("typ", "access").claim("pwv", JWTUtils.pwv(u.getPassword()))
                .setSubject(u.getCorreo()).setExpiration(new java.util.Date(System.currentTimeMillis() + 60000));
        if (sv != null) b.claim("sv", sv);
        return "Bearer " + b.signWith(new javax.crypto.spec.SecretKeySpec(
                java.util.Base64.getDecoder().decode(AuthSeguridadDia2Test.SECRETO), "HmacSHA256"),
                io.jsonwebtoken.SignatureAlgorithm.HS256).compact();
    }

    @Test
    void elCambioDeRolMataLasSesionesViejasDelAfectado() throws Exception {
        String viejo = access(cliente);
        assertEquals(200, estado(viejo, "/api/auth/me"));
        assertEquals(200, cambiarRol(access(admin), 3, 1).getResponse().getStatus());
        assertTrue(cliente.getSesionVersion() > 0);
        assertEquals(401, estado(viejo, "/api/auth/me"), "el token viejo no resucita");
        assertEquals(200, estado(access(cliente), "/api/auth/me"), "uno nuevo con el sv actual si vale");
    }

    @Test
    void accessConSvDistintoOSinSvEsRechazado() throws Exception {
        assertEquals(200, estado(accessConSv(cliente, 0), "/api/auth/me"));
        assertEquals(401, estado(accessConSv(cliente, 1), "/api/auth/me"));
        assertEquals(401, estado(accessConSv(cliente, -1), "/api/auth/me"));
        assertEquals(401, estado(accessConSv(cliente, null), "/api/auth/me"));
        cliente.setSesionVersion(5);
        assertEquals(401, estado(accessConSv(cliente, 0), "/api/auth/me"));
        assertEquals(200, estado(accessConSv(cliente, 5), "/api/auth/me"));
    }

    @Test
    void elJwtDeSesionLlevaElClaimSv() {
        cliente.setSesionVersion(7);
        var c = jwt.parseClaims(jwt.generateToken(cliente));
        assertEquals(7, c.get("sv", Integer.class));
    }

    // ---------- ultimo administrador / UPDATE condicionado / auditoria ----------

    @Test
    void quitarElUltimoAdministradorDa409SinCambiarNada() throws Exception {
        // el unico admin habilitado es el objetivo: el actor ya no cuenta en la lista bloqueada
        when(repo.bloquearAdminsActivos()).thenReturn(java.util.List.of(2));
        MvcResult r = cambiarRol(access(admin), 2, 2);
        assertEquals(409, r.getResponse().getStatus(), r.getResponse().getContentAsString());
        assertEquals("No se puede quitar el último administrador", json(r).get("message").asText());
        verify(repo, never()).cambiarRol(any(), any(), any());
        assertEquals(1, otroAdmin.getRol().getIdrol());
        assertEquals(0, otroAdmin.getSesionVersion());
    }

    @Test
    void unAdminDeshabilitadoNoCuentaComoAdministradorRestante() throws Exception {
        admin.setEnabled(true);
        // el que actua es admin habilitado, pero la consulta (idrol=1 y habilitado) solo devuelve al objetivo
        otroAdmin.setEnabled(true);
        when(repo.bloquearAdminsActivos()).thenReturn(java.util.List.of(2));
        assertEquals(409, cambiarRol(access(admin), 2, 2).getResponse().getStatus());
        // la consulta nativa filtra por rol y habilitado, sin mfa_enabled
        String q = UsuarioRepository.class.getMethod("bloquearAdminsActivos")
                .getAnnotation(org.springframework.data.jpa.repository.Query.class).value();
        assertTrue(q.contains("idrol = 1") && q.contains("is_enabled = true") && q.contains("FOR UPDATE"), q);
        assertFalse(q.toLowerCase().contains("mfa"), q);
    }

    @Test
    void degradarAdminConOtroAdminActivoSigueFuncionandoYSubeSv() throws Exception {
        assertEquals(200, cambiarRol(access(admin), 2, 2).getResponse().getStatus());
        assertEquals(2, otroAdmin.getRol().getIdrol());
        assertEquals(1, otroAdmin.getSesionVersion());
        verify(repo).bloquearAdminsActivos();
    }

    @Test
    void updateCondicionadoCon0FilasDa409SinAvisar() throws Exception {
        when(repo.cambiarRol(eq(3), eq(1), eq(2))).thenReturn(0);   // alguien le cambio el rol entre medias
        MvcResult r = cambiarRol(access(admin), 3, 1);
        assertEquals(409, r.getResponse().getStatus(), r.getResponse().getContentAsString());
        assertEquals("El rol cambió mientras tanto, vuelve a intentarlo", json(r).get("message").asText());
        Thread.sleep(300);
        verify(email, never()).sendRolCambiadoEmail(anyString(), anyString(), anyString());
    }

    @Test
    void rolCambiadoSeAuditaConAfectadoYRolesSinCorreo() throws Exception {
        var logger = (ch.qos.logback.classic.Logger) org.slf4j.LoggerFactory.getLogger(Auditoria.class);
        var appender = new ch.qos.logback.core.read.ListAppender<ch.qos.logback.classic.spi.ILoggingEvent>();
        appender.start();
        logger.addAppender(appender);
        try {
            assertEquals(200, cambiarRol(access(admin), 3, 1).getResponse().getStatus());
        } finally {
            logger.detachAppender(appender);
        }
        String linea = appender.list.stream().map(e -> e.getFormattedMessage()).filter(m -> m.contains("rol_cambiado")).findFirst().orElseThrow();
        assertTrue(linea.contains("iduser=1") && linea.contains("afectado=3") && linea.contains("rol_anterior=2")
                && linea.contains("rol_nuevo=1"), linea);
        assertFalse(linea.contains("@"), linea);
    }

    // ---------- correos ----------

    private static String texto(Object contenido) throws Exception {
        if (contenido instanceof String s) return s;
        if (contenido instanceof MimeMultipart mm) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mm.getCount(); i++) sb.append(texto(mm.getBodyPart(i).getContent()));
            return sb.toString();
        }
        return "";
    }

    private EmailService emailReal(JavaMailSender sender) {
        EmailService real = new EmailService();
        ReflectionTestUtils.setField(real, "mailSender", sender);
        ReflectionTestUtils.setField(real, "fromEmail", "tienda@x.com");
        ReflectionTestUtils.setField(real, "frontendUrl", "http://localhost:5173");
        return real;
    }

    @Test
    void losCorreosDeAvisoSeEnvianEscapadosSinEnlacesNiMencionarElSegundoFactor() throws Exception {
        JavaMailSender sender = mock(JavaMailSender.class);
        when(sender.createMimeMessage()).thenAnswer(i -> new MimeMessage((Session) null));
        EmailService real = emailReal(sender);
        String nombre = "<script>alert(1)</script>";

        real.sendCambioCorreoCodigoEmail("nuevo@x.com", nombre, 123456);
        real.sendCambioCorreoSolicitadoEmail("a@x.com", nombre);
        real.sendCorreoCambiadoEmail("viejo@x.com", nombre, "n***@x.com");
        real.sendRolCambiadoEmail("a@x.com", nombre, "administrador");

        ArgumentCaptor<MimeMessage> cap = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender, times(4)).send(cap.capture());
        String[] esperado = {"123456", "Se pidió cambiar el correo", "n***@x.com", "cambió el rol de tu cuenta"};
        for (int i = 0; i < 4; i++) {
            String bruto = texto(cap.getAllValues().get(i).getContent());
            String html = org.springframework.web.util.HtmlUtils.htmlUnescape(bruto);
            assertTrue(html.contains(esperado[i]), i + ": " + html);
            assertFalse(bruto.contains("<script>"), "nombre sin escapar en " + i);
            assertTrue(bruto.contains("&lt;script&gt;"), "nombre escapado en " + i);
            assertFalse(html.contains("http"), "sin enlaces en " + i);
            assertFalse(bruto.contains("<a "), "sin enlaces en " + i);
            assertFalse(html.contains("2 pasos") || html.contains("Recuperar acceso"), "texto de un flujo que ya no existe en " + i);
            String quitado = html.replaceAll("<[^>]*>", "").replaceAll("\\w+@[\\w.*]+", "");   // las direcciones pueden llevar puntos
            assertFalse(quitado.contains(".."), html);
        }
        assertEquals("tienda@x.com", cap.getAllValues().get(0).getFrom()[0].toString());
    }
}
