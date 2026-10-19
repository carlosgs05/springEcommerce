package com.ecommerce.backend;

import com.ecommerce.backend.config.JWTAuthFilter;
import com.ecommerce.backend.config.SecurityConfig;
import com.ecommerce.backend.controller.UsuarioController;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.RolRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import com.ecommerce.backend.service.EmailService;
import com.ecommerce.backend.service.JWTUtils;
import com.ecommerce.backend.service.ContadorAcotado;
import com.ecommerce.backend.service.UsuarioDetailsService;
import com.ecommerce.backend.service.UsuarioService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Pruebas del Dia 2 (tanda 1): /api/auth sin base real (repositorios simulados). */
@WebMvcTest(UsuarioController.class)
@Import({SecurityConfig.class, JWTAuthFilter.class, JWTUtils.class, UsuarioDetailsService.class, UsuarioService.class})
@TestPropertySource(properties = {"app.jwt.secret=" + AuthSeguridadDia2Test.SECRETO})
class AuthSeguridadDia2Test {

    // 64 bytes en Base64 (solo para pruebas)
    static final String SECRETO = "dGVzdC1zZWNyZXRvLXBhcmEtcHJ1ZWJhcy1kZS1qd3QtMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dQ==";
    static final String CLAVE = "Clave_Buena1";

    @Autowired MockMvc mvc;
    @Autowired JWTUtils jwt;
    @Autowired UsuarioService usuarioService;
    @MockitoBean UsuarioRepository repo;
    @MockitoBean RolRepository rolRepo;
    @MockitoBean EmailService email;

    final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
    Usuario ana, beto, admin;

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
        u.setResetCode(123456);
        u.setResetCodeExpiresAt(LocalDateTime.now().plusMinutes(5));
        u.setVerificationToken("tok-secreto");
        return u;
    }

    @BeforeEach
    void preparar() {
        // los contadores en memoria viven en el servicio (contexto compartido entre pruebas)
        for (String campo : new String[]{"loginCorreo", "loginIp", "fallosCodigo", "fallosReset", "pedidosForgot", "avisosExistente", "resetIp", "claveUsuario", "claveIp"}) {
            ((ContadorAcotado) org.springframework.test.util.ReflectionTestUtils.getField(usuarioService, campo)).clear();
        }
        ana = usuario(1, "ana@x.com", 2, "CLIENTE");
        beto = usuario(2, "beto@x.com", 2, "CLIENTE");
        admin = usuario(3, "admin@x.com", 1, "ADMINISTRADOR");
        for (Usuario u : new Usuario[]{ana, beto, admin}) {
            when(repo.findByCorreo(u.getCorreo())).thenReturn(Optional.of(u));
            when(repo.findById(u.getIduser())).thenReturn(Optional.of(u));
        }
        when(repo.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        // UPDATE puntuales: igual que en la base, solo cambian sus columnas
        for (Usuario u : new Usuario[]{ana, beto, admin}) {
            when(repo.actualizarPerfil(eq(u.getIduser()), anyString(), anyString(), anyString())).thenAnswer(i -> {
                u.setNombre(i.getArgument(1));
                u.setApellido(i.getArgument(2));
                u.setCelular(i.getArgument(3));
                return 1;
            });
            when(repo.cambiarPassword(eq(u.getIduser()), anyString())).thenAnswer(i -> {
                u.setPassword(i.getArgument(1));
                return 1;
            });
            when(repo.restablecerPassword(eq(u.getIduser()), anyString(), anyInt(), any(LocalDateTime.class))).thenAnswer(i -> {
                synchronized (u) {
                    if (u.getResetCode() == null || !u.getResetCode().equals(i.getArgument(2))) return 0;
                    u.setPassword(i.getArgument(1));
                    u.setResetCode(null);
                    u.setResetCodeExpiresAt(null);
                    return 1;
                }
            });
            when(repo.guardarCodigoReset(eq(u.getIduser()), anyInt(), any())).thenAnswer(i -> {
                u.setResetCode(i.getArgument(1));
                u.setResetCodeExpiresAt(i.getArgument(2));
                return 1;
            });
            when(repo.anularCodigoReset(u.getIduser())).thenAnswer(i -> {
                u.setResetCode(null);
                u.setResetCodeExpiresAt(null);
                return 1;
            });
        }
        Rol cliente = new Rol();
        cliente.setIdrol(2);
        cliente.setNombre("CLIENTE");
        Rol adminRol = new Rol();
        adminRol.setIdrol(1);
        adminRol.setNombre("ADMINISTRADOR");
        when(rolRepo.findById(2)).thenReturn(Optional.of(cliente));
        when(rolRepo.findById(1)).thenReturn(Optional.of(adminRol));
    }

    private MvcResult cambiar(Usuario u, String actual, String nueva) throws Exception {
        String cuerpo = "{\"currentPassword\":\"" + actual + "\",\"newPassword\":\"" + nueva
                + "\",\"confirmPassword\":\"" + nueva + "\"}";
        return mvc.perform(put("/api/auth/change-password").header("Authorization", bearer(u))
                .contentType(MediaType.APPLICATION_JSON).content(cuerpo)).andReturn();
    }

    private String bearer(Usuario u) {
        return "Bearer " + jwt.generateToken(u);
    }

    private static void sinSecretos(String json) {
        for (String prohibido : new String[]{"password", "resetCode", "resetCodeExpiresAt", "verificationToken",
                "tokenExpiration", "mfaEnabled", "mfaSecret", "tok-secreto", "$2a$"}) {
            assertFalse(json.contains(prohibido), "No debe aparecer '" + prohibido + "' en: " + json);
        }
    }

    private String body(MvcResult r) throws Exception {
        return r.getResponse().getContentAsString();
    }

    private MvcResult enviar(String url, String json) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json)).andReturn();
    }

    // ---------- login ----------

    @Test
    void loginOkDaTokenDirectoParaClienteYAdmin() throws Exception {
        String[] formas = new String[2];
        int i = 0;
        for (String correo : new String[]{"ana@x.com", "admin@x.com"}) {
            MvcResult r = login(correo, CLAVE);
            assertEquals(200, r.getResponse().getStatus(), correo);
            String json = body(r);
            sinSecretos(json);
            var nodo = json(r);
            assertEquals(200, nodo.get("statusCode").asInt());
            assertEquals("Inicio de sesión exitoso", nodo.get("message").asText());
            assertTrue(nodo.hasNonNull("token"), json);
            assertTrue(nodo.hasNonNull("usuario"));
            assertTrue(nodo.get("rol").hasNonNull("idrol") && nodo.get("rol").hasNonNull("nombre"));
            assertTrue(nodo.has("permisos"));
            assertEquals(correo, nodo.get("usuario").get("correo").asText());
            // el token es de sesion (typ=access) y sirve de verdad en una ruta protegida
            assertEquals(JWTUtils.TYP_ACCESS, jwt.parseClaims(nodo.get("token").asText()).get("typ", String.class));
            assertEquals(200, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + nodo.get("token").asText()))
                    .andReturn().getResponse().getStatus());
            for (String prohibido : new String[]{"mfaRequired", "mfaSetupRequired", "mfaStep", "mfaToken", "restart"}) {
                assertFalse(json.contains(prohibido), prohibido + " ya no existe: " + json);
            }
            var campos = new java.util.TreeSet<String>();
            nodo.fieldNames().forEachRemaining(campos::add);
            formas[i++] = campos.toString();
        }
        assertEquals(formas[0], formas[1], "admin y cliente reciben exactamente los mismos campos");
    }

    @Test
    void loginConClaveMalaDa401SinTokenNiUsuario() throws Exception {
        MvcResult r = login("ana@x.com", "Mala_clave1");
        assertEquals(401, r.getResponse().getStatus());
        assertEquals(401, json(r).get("statusCode").asInt());
        assertEquals("Correo o contraseña incorrectos", json(r).get("message").asText());
        assertFalse(body(r).contains("\"token\""));
        assertFalse(body(r).contains("\"usuario\""));
    }

    @Test
    void loginSinCamposOVacioDa401() throws Exception {
        for (String cuerpo : new String[]{"{}", "{\"correo\":\"ana@x.com\"}", "{\"correo\":\"\",\"password\":\"\"}",
                "{\"password\":\"" + CLAVE + "\"}"}) {
            assertEquals(401, enviar("/api/auth/login", cuerpo).getResponse().getStatus(), cuerpo);
        }
    }

    @Test
    void loginMalaClaveYCorreoInexistenteDanElMismoMensaje() throws Exception {
        MvcResult mala = enviar("/api/auth/login", "{\"correo\":\"ana@x.com\",\"password\":\"Otra_clave1\"}");
        when(repo.findByCorreo("nadie@x.com")).thenReturn(Optional.empty());
        MvcResult inexistente = enviar("/api/auth/login", "{\"correo\":\"nadie@x.com\",\"password\":\"Otra_clave1\"}");
        assertEquals(401, mala.getResponse().getStatus());
        assertEquals(401, inexistente.getResponse().getStatus());
        assertEquals(body(mala), body(inexistente));
        assertTrue(body(mala).contains("Correo o contraseña incorrectos"));
    }

    @Test
    void loginSinVerificarEs403SoloConClaveCorrecta() throws Exception {
        ana.setEnabled(false);
        assertEquals(403, enviar("/api/auth/login", "{\"correo\":\"ana@x.com\",\"password\":\"" + CLAVE + "\"}").getResponse().getStatus());
        assertEquals(401, enviar("/api/auth/login", "{\"correo\":\"ana@x.com\",\"password\":\"Otra_clave1\"}").getResponse().getStatus());
    }

    @Test
    void errorInternoNoFiltraDetalle() throws Exception {
        when(repo.findByCorreo("ana@x.com")).thenThrow(new RuntimeException("tabla usuario columna secreta"));
        MvcResult r = enviar("/api/auth/login", "{\"correo\":\"ana@x.com\",\"password\":\"" + CLAVE + "\"}");
        assertEquals(500, r.getResponse().getStatus());
        assertFalse(body(r).contains("tabla"));
    }

    // ---------- register ----------

    @Test
    void registerIgnoraIdrolDelBodyYCreaCliente() throws Exception {
        when(repo.findByCorreo("nuevo@x.com")).thenReturn(Optional.empty());
        MvcResult r = enviar("/api/auth/register",
                "{\"nombre\":\"N\",\"apellido\":\"A\",\"dni\":\"12345678\",\"correo\":\"nuevo@x.com\","
                        + "\"password\":\"" + CLAVE + "\",\"celular\":\"987654321\",\"idrol\":1}");
        assertEquals(200, r.getResponse().getStatus());
        ArgumentCaptor<Usuario> cap = ArgumentCaptor.forClass(Usuario.class);
        verify(repo).save(cap.capture());
        assertEquals(2, cap.getValue().getRol().getIdrol());
        assertFalse(cap.getValue().isEnabled());
        verify(rolRepo, never()).findById(1);
    }

    @Test
    void registerSinIdrolYaNoDaError() throws Exception {
        when(repo.findByCorreo("nuevo@x.com")).thenReturn(Optional.empty());
        MvcResult r = enviar("/api/auth/register",
                "{\"nombre\":\"N\",\"apellido\":\"A\",\"dni\":\"12345678\",\"correo\":\"nuevo@x.com\","
                        + "\"password\":\"" + CLAVE + "\",\"celular\":\"987654321\"}");
        assertEquals(200, r.getResponse().getStatus());
    }

    @Test
    void registerDatosInvalidosDa400ConErrors() throws Exception {
        MvcResult r = enviar("/api/auth/register", "{\"nombre\":\"\",\"correo\":\"mal\",\"dni\":\"abc\"}");
        assertEquals(400, r.getResponse().getStatus());
        assertTrue(body(r).contains("\"errors\""));
        verify(repo, never()).save(any());
    }

    private com.fasterxml.jackson.databind.JsonNode json(MvcResult r) throws Exception {
        return new com.fasterxml.jackson.databind.ObjectMapper().readTree(body(r));
    }

    @Test
    void fieldErrorsEnRegisterResetChangeYSinEllosEnLogin() throws Exception {
        // register: varios campos malos
        MvcResult reg = enviar("/api/auth/register", "{\"nombre\":\"\",\"correo\":\"mal\",\"dni\":\"abc\",\"celular\":\"1\",\"password\":\"debil\"}");
        assertEquals(400, reg.getResponse().getStatus());
        var fe = json(reg).get("fieldErrors");
        assertNotNull(fe, body(reg));
        for (String k : new String[]{"nombre", "apellido", "dni", "celular", "correo", "password"}) {
            assertTrue(fe.hasNonNull(k), "falta " + k + " en " + fe);
        }
        assertTrue(json(reg).get("errors").size() >= fe.size());

        // reset: claves distintas -> confirmPassword
        MvcResult rs = enviar("/api/auth/reset-password", "{\"correo\":\"ana@x.com\",\"resetCode\":123456,"
                + "\"newPassword\":\"Nueva_clave1\",\"confirmPassword\":\"Otra_clave1\"}");
        assertEquals(400, rs.getResponse().getStatus());
        assertEquals("Las contraseñas no coinciden", json(rs).get("fieldErrors").get("confirmPassword").asText());
        assertFalse(json(rs).get("fieldErrors").has("newPassword"));
        assertTrue(json(rs).has("errors"));

        // reset con codigo malo -> resetCode
        MvcResult rc = enviar("/api/auth/reset-password", reset("ana@x.com", 111111, "Nueva_clave1"));
        assertEquals(400, rc.getResponse().getStatus());
        assertTrue(json(rc).get("fieldErrors").hasNonNull("resetCode"));

        // change-password: actual mala -> currentPassword
        MvcResult mala = cambiar(ana, "Incorrecta1_", "Nueva_clave1");
        assertEquals(400, mala.getResponse().getStatus());
        assertEquals("La contraseña actual no es correcta", json(mala).get("fieldErrors").get("currentPassword").asText());

        // login con credenciales malas: 401 sin fieldErrors
        MvcResult lg = enviar("/api/auth/login", "{\"correo\":\"ana@x.com\",\"password\":\"Otra_clave1\"}");
        assertEquals(401, lg.getResponse().getStatus());
        assertFalse(body(lg).contains("fieldErrors"));
    }

    @Test
    void registerSiFallaElCorreoDeshaceLaCuenta() throws Exception {
        when(repo.findByCorreo("nuevo@x.com")).thenReturn(Optional.empty());
        doThrow(new RuntimeException("smtp host interno")).when(email).sendVerificationEmail(any(), any(), any());
        MvcResult r = enviar("/api/auth/register",
                "{\"nombre\":\"N\",\"apellido\":\"A\",\"dni\":\"12345678\",\"correo\":\"nuevo@x.com\","
                        + "\"password\":\"" + CLAVE + "\",\"celular\":\"987654321\"}");
        // el correo sale en segundo plano: la respuesta ya es la generica y la cuenta sin verificar se deshace desde la tarea
        assertEquals(200, r.getResponse().getStatus());
        assertFalse(body(r).contains("smtp"));
        verify(repo, timeout(3000)).borrarSiNoVerificada(any());
    }

    // ---------- sesion: /me, update-user, correo, change-password ----------

    @Test
    void meDevuelveSoloElDuenoYSinCamposSensibles() throws Exception {
        MvcResult r = mvc.perform(get("/api/auth/me").header("Authorization", bearer(ana))).andReturn();
        assertEquals(200, r.getResponse().getStatus());
        String json = body(r);
        sinSecretos(json);
        assertTrue(json.contains("\"correo\":\"ana@x.com\""));
        assertFalse(json.contains("beto"));
    }

    @Test
    void rutasProtegidasSinTokenDan401Json() throws Exception {
        String[][] rutas = {{"GET", "/api/auth/me"}, {"POST", "/api/auth/correo"},
                {"PUT", "/api/auth/update-user"}, {"PUT", "/api/auth/change-password"}};
        for (String[] ruta : rutas) {
            MvcResult r = mvc.perform(request(org.springframework.http.HttpMethod.valueOf(ruta[0]), ruta[1])
                    .contentType(MediaType.APPLICATION_JSON).content("{}")).andReturn();
            assertEquals(401, r.getResponse().getStatus(), ruta[1]);
            assertTrue(r.getResponse().getContentType().startsWith("application/json"), ruta[1]);
            assertTrue(body(r).contains("\"statusCode\":401"), ruta[1]);
        }
    }

    @Test
    void tokenBasuraYSinBearerDan401NoError500() throws Exception {
        String[] cabeceras = {"Bearer basura", "Bearer ", "Bearer a.b.c", "Basic abc", jwt.generateToken(ana),
                "Bearer " + jwt.generateToken(ana).substring(0, 40)};
        for (String h : cabeceras) {
            int s = mvc.perform(get("/api/auth/me").header("Authorization", h)).andReturn().getResponse().getStatus();
            assertEquals(401, s, "Cabecera: " + h);
        }
    }

    @Test
    void tokenFirmadoConOtraClaveOExpiradoNoSirve() throws Exception {
        String ajeno = Jwts.builder().claim("typ", "access").setSubject("ana@x.com")
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(Keys.hmacShaKeyFor(new byte[64]), SignatureAlgorithm.HS256).compact();
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + ajeno)).andReturn().getResponse().getStatus());
        String expirado = Jwts.builder().claim("typ", "access").setSubject("ana@x.com")
                .setExpiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRETO)), SignatureAlgorithm.HS256).compact();
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + expirado)).andReturn().getResponse().getStatus());
    }

    @Test
    void tokenSinTypYTokensMfaViejosNoSirvenComoSesion() throws Exception {
        var clave = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRETO));
        String sinTyp = Jwts.builder().setSubject("ana@x.com")
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(clave, SignatureAlgorithm.HS256).compact();
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + sinTyp)).andReturn().getResponse().getStatus());
        // tokens que emitia el MFA (ya no existen): firmados bien, con pwv y sv correctos, pero NO son typ=access
        for (String typ : new String[]{"mfa_totp", "mfa_setup", "mfa_webauthn", "otro"}) {
            String viejo = Jwts.builder().setSubject("ana@x.com").claim("typ", typ)
                    .claim("pwv", JWTUtils.pwv(ana.getPassword())).claim("sv", ana.getSesionVersion())
                    .setId(java.util.UUID.randomUUID().toString())
                    .setExpiration(new Date(System.currentTimeMillis() + 60000))
                    .signWith(clave, SignatureAlgorithm.HS256).compact();
            assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + viejo)).andReturn().getResponse().getStatus(), typ);
            assertEquals(401, mvc.perform(put("/api/auth/update-user").header("Authorization", "Bearer " + viejo)
                    .contentType(MediaType.APPLICATION_JSON).content("{}")).andReturn().getResponse().getStatus(), typ);
            assertEquals(401, mvc.perform(put("/api/auth/change-password").header("Authorization", "Bearer " + viejo)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"currentPassword\":\"" + CLAVE + "\",\"newPassword\":\"Nueva_clave1\",\"confirmPassword\":\"Nueva_clave1\"}"))
                    .andReturn().getResponse().getStatus(), typ);
        }
        verify(repo, never()).cambiarPassword(any(), any());
    }

    @Test
    void cuentaDeshabilitadaConTokenViejoNoEntra() throws Exception {
        String t = bearer(ana);
        ana.setEnabled(false);
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", t)).andReturn().getResponse().getStatus());
    }

    @Test
    void updateUserEditaSoloAlDuenoAunqueElBodyTraigaOtroCorreo() throws Exception {
        MvcResult r = mvc.perform(put("/api/auth/update-user").header("Authorization", bearer(ana))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"correo\":\"beto@x.com\",\"nombre\":\"Nuevo\",\"apellido\":\"Ape\",\"celular\":\"911111111\"}")).andReturn();
        assertEquals(200, r.getResponse().getStatus());
        sinSecretos(body(r));
        verify(repo, times(1)).actualizarPerfil(eq(1), eq("Nuevo"), eq("Ape"), eq("911111111"));
        verify(repo, never()).save(any());   // nunca la fila entera: no puede pisar otras columnas
        assertEquals("Nuevo", ana.getNombre());
        assertEquals("Nombre2", beto.getNombre());
        assertEquals("ana@x.com", ana.getCorreo());
    }

    @Test
    void updateUserDatosInvalidosDa400YNoGuarda() throws Exception {
        String[] malos = {
                "{\"nombre\":\"\",\"apellido\":\"A\",\"celular\":\"911111111\"}",
                "{\"nombre\":\"N\",\"apellido\":\"  \",\"celular\":\"911111111\"}",
                "{\"nombre\":\"N\",\"apellido\":\"A\",\"celular\":\"12345\"}",
                "{\"nombre\":\"N\",\"apellido\":\"A\",\"celular\":\"abcdefghi\"}",
                "{\"nombre\":\"" + "x".repeat(80) + "\",\"apellido\":\"A\",\"celular\":\"911111111\"}",
                "{}"};
        for (String b : malos) {
            MvcResult r = mvc.perform(put("/api/auth/update-user").header("Authorization", bearer(ana))
                    .contentType(MediaType.APPLICATION_JSON).content(b)).andReturn();
            assertEquals(400, r.getResponse().getStatus(), b);
            assertTrue(body(r).contains("\"errors\""));
        }
        verify(repo, never()).actualizarPerfil(any(), any(), any(), any());
    }

    @Test
    void correoIgnoraElBodyYDevuelveSoloAlDueno() throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/correo").header("Authorization", bearer(ana))
                .contentType(MediaType.APPLICATION_JSON).content("{\"correo\":\"admin@x.com\"}")).andReturn();
        assertEquals(200, r.getResponse().getStatus());
        sinSecretos(body(r));
        assertTrue(body(r).contains("ana@x.com"));
        assertFalse(body(r).contains("admin@x.com"));
    }

    @Test
    void changePassword() throws Exception {
        MvcResult mala = cambiar(ana, "Incorrecta1_", "Nueva_clave1");
        assertEquals(400, mala.getResponse().getStatus());
        assertTrue(body(mala).contains("La contraseña actual no es correcta"));

        MvcResult distinta = mvc.perform(put("/api/auth/change-password").header("Authorization", bearer(ana))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"" + CLAVE + "\",\"newPassword\":\"Nueva_clave1\",\"confirmPassword\":\"Otra_clave1\"}")).andReturn();
        assertEquals(400, distinta.getResponse().getStatus());
        assertTrue(body(distinta).contains("\"errors\""));
        verify(repo, never()).cambiarPassword(any(), any());

        // sin totpCode: funciona
        MvcResult ok = cambiar(ana, CLAVE, "Nueva_clave1");
        assertEquals(200, ok.getResponse().getStatus(), body(ok));
        assertTrue(enc.matches("Nueva_clave1", ana.getPassword()));
        assertTrue(enc.matches(CLAVE, beto.getPassword()));
        verify(repo, never()).save(any());
        assertTrue(body(ok).contains("\"token\""));
        sinSecretos(body(ok));
    }

    @Test
    void m3_lasClavesActualesMalasCuentanEnElLimiteYDan429SinGastarBcrypt() throws Exception {
        for (int i = 1; i <= 10; i++) {
            assertEquals(400, cambiar(ana, "Incorrecta1_", "Nueva_clave1").getResponse().getStatus(), "intento " + i);
        }
        MvcResult bloqueado = cambiar(ana, "Incorrecta1_", "Nueva_clave1");   // el 11.o supera el limite
        assertEquals(429, bloqueado.getResponse().getStatus());
        assertTrue(body(bloqueado).contains(ContadorAcotado.MSG_LIMITE));
        // ya bloqueado, ni la clave correcta pasa
        assertEquals(429, cambiar(ana, CLAVE, "Nueva_clave1").getResponse().getStatus());
        verify(repo, never()).cambiarPassword(any(), any());
    }

    @Test
    void changePasswordConClaveNuevaDebilDa400YNoCambiaNada() throws Exception {
        String hashAntes = ana.getPassword();
        MvcResult r = cambiar(ana, CLAVE, "corta");
        assertEquals(400, r.getResponse().getStatus());
        assertTrue(body(r).contains("\"errors\""));
        assertEquals(hashAntes, ana.getPassword());
        verify(repo, never()).cambiarPassword(any(), any());
    }

    @Test
    void changePasswordSinSesionEs401() throws Exception {
        assertEquals(401, mvc.perform(put("/api/auth/change-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"" + CLAVE + "\",\"newPassword\":\"Nueva_clave1\",\"confirmPassword\":\"Nueva_clave1\"}"))
                .andReturn().getResponse().getStatus());
        verify(repo, never()).cambiarPassword(any(), any());
    }

    // ---------- reset de contrasena ----------

    private String reset(String correo, Object codigo, String nueva) {
        return "{\"correo\":\"" + correo + "\",\"resetCode\":" + codigo + ",\"newPassword\":\"" + nueva
                + "\",\"confirmPassword\":\"" + nueva + "\"}";
    }

    @Test
    void resetPasswordSinCodigoOConCodigoMaloNoCambiaNada() throws Exception {
        String hashAntes = ana.getPassword();
        for (String b : new String[]{
                "{\"correo\":\"ana@x.com\",\"newPassword\":\"Nueva_clave1\",\"confirmPassword\":\"Nueva_clave1\"}",
                reset("ana@x.com", 999999, "Nueva_clave1"),
                reset("nadie@x.com", 123456, "Nueva_clave1"),
                "{\"newPassword\":\"Nueva_clave1\",\"confirmPassword\":\"Nueva_clave1\"}"}) {
            MvcResult r = enviar("/api/auth/reset-password", b);
            assertEquals(400, r.getResponse().getStatus(), b);
            assertTrue(body(r).contains("Código inválido o expirado"), b);
        }
        assertEquals(hashAntes, ana.getPassword());
    }

    @Test
    void resetPasswordConCodigoVencidoDa400() throws Exception {
        ana.setResetCodeExpiresAt(LocalDateTime.now().minusMinutes(1));
        String hashAntes = ana.getPassword();
        MvcResult r = enviar("/api/auth/reset-password", reset("ana@x.com", 123456, "Nueva_clave1"));
        assertEquals(400, r.getResponse().getStatus());
        assertTrue(body(r).contains("Código inválido o expirado"));
        assertEquals(hashAntes, ana.getPassword());
        // verify-reset-code dice lo mismo
        assertEquals(400, enviar("/api/auth/verify-reset-code", "{\"correo\":\"ana@x.com\",\"resetCode\":123456}").getResponse().getStatus());
    }

    @Test
    void resetPasswordBuenoCambiaClaveYAnulaCodigo() throws Exception {
        MvcResult r = enviar("/api/auth/reset-password", reset("ana@x.com", 123456, "Nueva_clave1"));
        assertEquals(200, r.getResponse().getStatus());
        assertTrue(enc.matches("Nueva_clave1", ana.getPassword()));
        assertNull(ana.getResetCode());
        // dos veces seguidas: el segundo ya no vale
        assertEquals(400, enviar("/api/auth/reset-password", reset("ana@x.com", 123456, "Otra_clave1")).getResponse().getStatus());
        assertTrue(enc.matches("Nueva_clave1", ana.getPassword()));
    }

    @Test
    void resetPasswordClaveDebilDa400ConErrorsYNoGastaElCodigo() throws Exception {
        MvcResult r = enviar("/api/auth/reset-password", reset("ana@x.com", 123456, "debil"));
        assertEquals(400, r.getResponse().getStatus());
        assertTrue(body(r).contains("\"errors\""));
        assertEquals(123456, ana.getResetCode());
    }

    @Test
    void cincoFallosAnulanElCodigoYElBuenoYaNoSirve() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertEquals(400, enviar("/api/auth/verify-reset-code", "{\"correo\":\"ana@x.com\",\"resetCode\":" + (100000 + i) + "}").getResponse().getStatus());
        }
        assertNull(ana.getResetCode(), "al 5.o fallo se anula el codigo en BD");
        assertEquals(400, enviar("/api/auth/verify-reset-code", "{\"correo\":\"ana@x.com\",\"resetCode\":123456}").getResponse().getStatus());
        assertEquals(400, enviar("/api/auth/reset-password", reset("ana@x.com", 123456, "Nueva_clave1")).getResponse().getStatus());
    }

    @Test
    void codigoCorrectoVerificaOk() throws Exception {
        assertEquals(200, enviar("/api/auth/verify-reset-code", "{\"correo\":\"ana@x.com\",\"resetCode\":123456}").getResponse().getStatus());
    }

    @Test
    void forgotPasswordNoEnumeraCuentas() throws Exception {
        when(repo.findByCorreo("nadie@x.com")).thenReturn(Optional.empty());
        MvcResult existe = enviar("/api/auth/forgot-password", "{\"correo\":\"ana@x.com\"}");
        MvcResult noExiste = enviar("/api/auth/forgot-password", "{\"correo\":\"nadie@x.com\"}");
        assertEquals(200, existe.getResponse().getStatus());
        assertEquals(200, noExiste.getResponse().getStatus());
        assertEquals(body(existe), body(noExiste));
        assertTrue(body(existe).contains("Si el correo está registrado, te enviamos un código de 6 dígitos"));
        verify(email, timeout(3000).times(1)).sendPasswordResetEmail(eq("ana@x.com"), any(), anyInt());
        verify(email, never()).sendPasswordResetEmail(eq("nadie@x.com"), any(), anyInt());
        // formato invalido => 400
        assertEquals(400, enviar("/api/auth/forgot-password", "{\"correo\":\"\"}").getResponse().getStatus());
        assertEquals(400, enviar("/api/auth/forgot-password", "{\"correo\":\"mal\"}").getResponse().getStatus());
    }

    @Test
    void forgotPasswordSiFallaElCorreoSigueDando200() throws Exception {
        doThrow(new RuntimeException("smtp interno")).when(email).sendPasswordResetEmail(any(), any(), anyInt());
        MvcResult r = enviar("/api/auth/forgot-password", "{\"correo\":\"ana@x.com\"}");
        assertEquals(200, r.getResponse().getStatus());
        assertFalse(body(r).contains("smtp"));
    }

    @Test
    void forgotPasswordTieneTopeDePedidosPorCorreo() throws Exception {
        for (int i = 0; i < 6; i++) {
            assertEquals(200, enviar("/api/auth/forgot-password", "{\"correo\":\"beto@x.com\"}").getResponse().getStatus());
        }
        verify(email, after(800).times(3)).sendPasswordResetEmail(eq("beto@x.com"), any(), anyInt());
    }

    // ---------- JWTUtils ----------

    @Test
    void jwtSoloEmiteTokensDeSesionConPwvYSv() {
        long ahora = System.currentTimeMillis();
        var acceso = jwt.parseClaims(jwt.generateToken(ana));
        assertEquals("access", acceso.get("typ", String.class));
        assertNull(acceso.getId());
        assertEquals(JWTUtils.pwv(ana.getPassword()), acceso.get("pwv", String.class));
        assertEquals(ana.getSesionVersion(), acceso.get("sv", Integer.class));
        long ttl = acceso.getExpiration().getTime() - ahora;
        assertTrue(ttl > 23 * 3600_000L && ttl <= 24 * 3600_000L + 2000, "24 h, fue " + ttl);
        assertThrows(io.jsonwebtoken.JwtException.class, () -> jwt.parseClaims("basura"));
    }

    // =====================================================================
    // Endurecimiento tras la revision de seguridad (M1, M2, M3, B3, B6, B10)
    // =====================================================================

    private MvcResult login(String correo, String clave) throws Exception {
        return enviar("/api/auth/login", "{\"correo\":\"" + correo + "\",\"password\":\"" + clave + "\"}");
    }

    private static final String MSG_429 = "Demasiados intentos. Espera unos minutos e inténtalo de nuevo";

    @Test
    void m1_cincoFallosPorCorreoBloqueanCon429IgualExistaONoLaCuenta() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertEquals(401, login("ana@x.com", "Mala_clave1").getResponse().getStatus());
            assertEquals(401, login("nadie@x.com", "Mala_clave1").getResponse().getStatus());
        }
        MvcResult anaBloqueada = login("ana@x.com", CLAVE);      // aun con la clave correcta
        MvcResult nadieBloqueado = login("nadie@x.com", "Mala_clave1");
        assertEquals(429, anaBloqueada.getResponse().getStatus());
        assertEquals(429, nadieBloqueado.getResponse().getStatus());
        assertEquals(body(anaBloqueada), body(nadieBloqueado), "mismo texto exista o no la cuenta");
        assertTrue(body(anaBloqueada).contains("\"statusCode\":429"));
        assertTrue(body(anaBloqueada).contains(MSG_429));
        assertFalse(body(anaBloqueada).contains("token"));
        // otra cuenta no se ve afectada
        assertEquals(200, login("beto@x.com", CLAVE).getResponse().getStatus());
    }

    @Test
    void m1_exitoReiniciaElContadorDelCorreo() throws Exception {
        for (int i = 0; i < 4; i++) {
            assertEquals(401, login("ana@x.com", "Mala_clave1").getResponse().getStatus());
        }
        assertEquals(200, login("ana@x.com", CLAVE).getResponse().getStatus());
        for (int i = 0; i < 4; i++) {
            assertEquals(401, login("ana@x.com", "Mala_clave1").getResponse().getStatus(), "tras el exito se cuenta de cero");
        }
        assertEquals(200, login("ana@x.com", CLAVE).getResponse().getStatus());
    }

    @Test
    void m1_treintaFallosDesdeUnaIpBloqueanLaIp() throws Exception {
        for (int i = 0; i < 30; i++) {
            assertEquals(401, login("u" + i + "@x.com", "Mala_clave1").getResponse().getStatus(), "intento " + i);
        }
        MvcResult r = login("beto@x.com", CLAVE);   // cuenta distinta y clave buena, misma IP
        assertEquals(429, r.getResponse().getStatus());
        assertTrue(body(r).contains(MSG_429));
    }

    @Test
    void m1_losLoginsBuenosTambienGastanElLimiteDeIp() throws Exception {
        // 29 fallos (correos distintos, para no activar el tope por correo) + 1 login correcto = intento 30: aun pasa
        for (int i = 0; i < 29; i++) {
            assertEquals(401, login("u" + i + "@x.com", "Mala_clave1").getResponse().getStatus(), "fallo " + i);
        }
        assertEquals(200, login("beto@x.com", CLAVE).getResponse().getStatus(), "intento 30");
        // el acierto no libero cupo: el intento 31 desde la misma IP ya es 429, aun con clave correcta
        MvcResult r = login("ana@x.com", CLAVE);
        assertEquals(429, r.getResponse().getStatus());
        assertTrue(body(r).contains(MSG_429));
    }

    @Test
    void m1_alternarFalloYAciertoNoEvitaElTopeDeIp() throws Exception {
        // password spraying: 1 fallo contra la victima + 1 login propio correcto, repetido
        int estado = 0, intentos = 0;
        while (estado != 429 && intentos < 40) {
            estado = login("victima" + intentos + "@x.com", "Mala_clave1").getResponse().getStatus();
            intentos++;
            if (estado == 429) break;
            estado = login("beto@x.com", CLAVE).getResponse().getStatus();
            intentos++;
        }
        assertEquals(429, estado, "el tope por IP debe llenarse");
        assertEquals(31, intentos, "30 intentos pasan (fallos y aciertos cuentan igual), el 31 se bloquea");
    }

    @Test
    void m2_peticionesConcurrentesNoComparanMasDeCincoCodigos() throws Exception {
        ExecutorService ex = Executors.newFixedThreadPool(24);
        CountDownLatch salida = new CountDownLatch(1);
        List<Future<Integer>> fs = new ArrayList<>();
        for (int i = 0; i < 60; i++) {
            final int n = 200000 + i;
            fs.add(ex.submit(() -> {
                salida.await();
                return enviar("/api/auth/verify-reset-code", "{\"correo\":\"ana@x.com\",\"resetCode\":" + n + "}")
                        .getResponse().getStatus();
            }));
        }
        salida.countDown();
        int topeIp = 0;
        for (Future<Integer> f : fs) {
            int st = f.get(60, TimeUnit.SECONDS);
            assertTrue(st == 400 || st == 429, "estado " + st);   // 429 = tope de 30 por IP
            if (st == 429) topeIp++;
        }
        ex.shutdown();
        assertEquals(30, topeIp, "de 60 peticiones desde una IP, 30 pasan y 30 topan con el limite por IP");
        ((ContadorAcotado) org.springframework.test.util.ReflectionTestUtils.getField(usuarioService, "resetIp")).clear();
        // solo 5 intentos llegaron a mirar el codigo guardado; el resto se rechazo antes de comparar
        verify(repo, atMost(5)).findByCorreo("ana@x.com");
        assertNull(ana.getResetCode(), "al 5.o fallo el codigo se anula");
        assertEquals(400, enviar("/api/auth/verify-reset-code", "{\"correo\":\"ana@x.com\",\"resetCode\":123456}").getResponse().getStatus());
    }

    @Test
    void m2_dosResetConElMismoCodigoValidoACualquierHoraSoloUnoCambiaLaClave() throws Exception {
        ExecutorService ex = Executors.newFixedThreadPool(8);
        CountDownLatch salida = new CountDownLatch(1);
        List<Future<Integer>> fs = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            final String clave = "Nueva_clave" + i;
            fs.add(ex.submit(() -> {
                salida.await();
                return enviar("/api/auth/reset-password", reset("ana@x.com", 123456, clave)).getResponse().getStatus();
            }));
        }
        salida.countDown();
        int ok = 0;
        for (Future<Integer> f : fs) {
            if (f.get(60, TimeUnit.SECONDS) == 200) ok++;
        }
        ex.shutdown();
        assertEquals(1, ok, "el codigo es de un solo uso");
    }

    @Test
    void m2_pedirOtroCodigoNoReiniciaElTopeAcumuladoDeDiezFallos() throws Exception {
        for (int tanda = 0; tanda < 2; tanda++) {
            for (int i = 0; i < 5; i++) {
                assertEquals(400, enviar("/api/auth/verify-reset-code",
                        "{\"correo\":\"ana@x.com\",\"resetCode\":" + (100000 + i) + "}").getResponse().getStatus());
            }
            assertNull(ana.getResetCode());
            // pide otro codigo (reinicia los 5 del codigo, pero no el tope de 10 por hora)
            enviar("/api/auth/forgot-password", "{\"correo\":\"ana@x.com\"}");
            verify(email, timeout(3000).times(tanda + 1)).sendPasswordResetEmail(eq("ana@x.com"), any(), anyInt());
            int intentos = 0;
            while (ana.getResetCode() == null && intentos++ < 50) Thread.sleep(20);
            assertNotNull(ana.getResetCode(), "se emitio un codigo nuevo");
        }
        // 10 fallos acumulados: ni el codigo recien emitido (y correcto) se acepta hasta que pase la hora
        int bueno = ana.getResetCode();
        assertEquals(400, enviar("/api/auth/verify-reset-code", "{\"correo\":\"ana@x.com\",\"resetCode\":" + bueno + "}").getResponse().getStatus());
        assertEquals(400, enviar("/api/auth/reset-password", reset("ana@x.com", bueno, "Nueva_clave1")).getResponse().getStatus());
        assertTrue(enc.matches(CLAVE, ana.getPassword()));
    }

    @Test
    void m3_registerDaLaMismaRespuestaExistaONoElCorreoYAvisaAlExistente() throws Exception {
        when(repo.findByCorreo("nuevo@x.com")).thenReturn(Optional.empty());
        String bodyNuevo = "{\"nombre\":\"N\",\"apellido\":\"A\",\"dni\":\"12345678\",\"correo\":\"nuevo@x.com\","
                + "\"password\":\"" + CLAVE + "\",\"celular\":\"987654321\"}";
        String bodyExiste = bodyNuevo.replace("nuevo@x.com", "ana@x.com");
        MvcResult nuevo = enviar("/api/auth/register", bodyNuevo);
        MvcResult existe = enviar("/api/auth/register", bodyExiste);
        assertEquals(200, nuevo.getResponse().getStatus());
        assertEquals(200, existe.getResponse().getStatus());
        assertEquals(body(nuevo), body(existe));
        assertTrue(body(existe).contains("Si los datos son válidos, te enviamos un correo para activar tu cuenta"));
        assertFalse(body(existe).contains("registrado"));
        verify(repo, times(1)).save(any(Usuario.class));   // solo el nuevo; con el existente no se crea nada
        verify(email, timeout(3000)).sendAccountExistsEmail("ana@x.com", "Nombre1");
        verify(email, timeout(3000)).sendVerificationEmail(eq("nuevo@x.com"), any(), any());
        verify(email, never()).sendVerificationEmail(eq("ana@x.com"), any(), any());
        // las validaciones de formato siguen dando 400 y no revelan nada de la cuenta existente
        MvcResult mal = enviar("/api/auth/register", bodyExiste.replace("12345678", "abc"));
        assertEquals(400, mal.getResponse().getStatus());
        assertTrue(body(mal).contains("\"errors\""));
        assertFalse(body(mal).contains("registrado"));
    }

    // ---------- cierres de la revision (register) ----------

    private static final String BODY_NUEVO = "{\"nombre\":\"N\",\"apellido\":\"A\",\"dni\":\"12345678\",\"correo\":\"nuevo@x.com\","
            + "\"password\":\"" + CLAVE + "\",\"celular\":\"987654321\"}";

    @Test
    void cierre1_colaLlenaDaLaMismaRespuestaConCorreoNuevoYExistenteYDeshaceLaFila() throws Exception {
        when(repo.findByCorreo("nuevo@x.com")).thenReturn(Optional.empty());
        Object original = org.springframework.test.util.ReflectionTestUtils.getField(usuarioService, "correos");
        java.util.concurrent.ThreadPoolExecutor llena = new java.util.concurrent.ThreadPoolExecutor(1, 1, 1, TimeUnit.SECONDS,
                new java.util.concurrent.ArrayBlockingQueue<>(1));
        llena.shutdown();   // rechaza todo, como una cola llena
        org.springframework.test.util.ReflectionTestUtils.setField(usuarioService, "correos", llena);
        try {
            MvcResult nuevo = enviar("/api/auth/register", BODY_NUEVO);
            MvcResult existe = enviar("/api/auth/register", BODY_NUEVO.replace("nuevo@x.com", "ana@x.com"));
            assertEquals(200, nuevo.getResponse().getStatus());
            assertEquals(200, existe.getResponse().getStatus());
            assertEquals(body(nuevo), body(existe));
            verify(repo).borrarSiNoVerificada(any());   // la fila de la rama nueva se deshizo
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(usuarioService, "correos", original);
        }
    }

    @Test
    void cierre2_elLogDelFalloDeCorreoNoLlevaElCorreoNiLaExcepcion() throws Exception {
        when(repo.findByCorreo("nuevo@x.com")).thenReturn(Optional.empty());
        doThrow(new org.springframework.mail.MailSendException("fallo para nuevo@x.com")).when(email).sendVerificationEmail(any(), any(), any());
        Logger logger = (Logger) LoggerFactory.getLogger(UsuarioService.class);
        ListAppender<ILoggingEvent> app = new ListAppender<>();
        app.start();
        logger.addAppender(app);
        try {
            enviar("/api/auth/register", BODY_NUEVO);
            verify(repo, timeout(3000)).borrarSiNoVerificada(any());
            Thread.sleep(200);
            assertFalse(app.list.isEmpty());
            for (ILoggingEvent ev : new ArrayList<>(app.list)) {
                assertNull(ev.getThrowableProxy(), "no se loguea la excepcion completa");
                assertFalse(ev.getFormattedMessage().contains("nuevo@x.com"));
            }
            assertTrue(app.list.stream().anyMatch(ev -> ev.getFormattedMessage().contains("MailSendException")));
        } finally {
            logger.detachAppender(app);
        }
    }

    @Test
    void cierre3_deshacerSoloBorraSiLaCuentaSigueSinVerificar() throws Exception {
        when(repo.findByCorreo("nuevo@x.com")).thenReturn(Optional.empty());
        doThrow(new RuntimeException("smtp")).when(email).sendVerificationEmail(any(), any(), any());
        enviar("/api/auth/register", BODY_NUEVO);
        verify(repo, timeout(3000)).borrarSiNoVerificada(any());
        verify(repo, never()).delete(any(Usuario.class));   // nunca el borrado incondicional
        String q = UsuarioRepository.class.getMethod("borrarSiNoVerificada", Integer.class)
                .getAnnotation(org.springframework.data.jpa.repository.Query.class).value();
        assertTrue(q.contains("DELETE") && q.contains("u.enabled = false"), q);
    }

    @Test
    void cierre4_losAvisosDeCuentaExistenteTienenTopeDe3PorHoraConLaMismaRespuesta() throws Exception {
        String body = BODY_NUEVO.replace("nuevo@x.com", "ana@x.com");
        String primera = null;
        for (int i = 1; i <= 5; i++) {
            MvcResult r = enviar("/api/auth/register", body);
            assertEquals(200, r.getResponse().getStatus());
            if (primera == null) primera = body(r);
            assertEquals(primera, body(r));
        }
        verify(email, timeout(3000).times(3)).sendAccountExistsEmail(eq("ana@x.com"), any());
        Thread.sleep(300);
        verify(email, times(3)).sendAccountExistsEmail(eq("ana@x.com"), any());
    }

    @Test
    void m3_forgotPasswordNoEnviaNiGuardaNadaEnElHiloDeLaPeticion() throws Exception {
        // el envio es asincrono: aunque el SMTP tarde, la respuesta no espera
        doAnswer(i -> {
            Thread.sleep(1500);
            return null;
        }).when(email).sendPasswordResetEmail(any(), any(), anyInt());
        long t0 = System.nanoTime();
        MvcResult r = enviar("/api/auth/forgot-password", "{\"correo\":\"ana@x.com\"}");
        long ms = (System.nanoTime() - t0) / 1_000_000;
        assertEquals(200, r.getResponse().getStatus());
        assertTrue(ms < 1200, "la respuesta no debe esperar al correo (tardo " + ms + " ms)");
        verify(email, timeout(5000)).sendPasswordResetEmail(eq("ana@x.com"), any(), anyInt());
    }

    @Test
    void b3_changePasswordRevocaLosTokensAnterioresYDaUnoNuevo() throws Exception {
        String viejo = bearer(ana);
        assertEquals(200, mvc.perform(get("/api/auth/me").header("Authorization", viejo)).andReturn().getResponse().getStatus());
        MvcResult ok = mvc.perform(put("/api/auth/change-password").header("Authorization", viejo)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"" + CLAVE + "\",\"newPassword\":\"Nueva_clave1\",\"confirmPassword\":\"Nueva_clave1\"}")).andReturn();
        assertEquals(200, ok.getResponse().getStatus());
        String nuevo = com.fasterxml.jackson.databind.json.JsonMapper.builder().build().readTree(body(ok)).get("token").asText();
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", viejo)).andReturn().getResponse().getStatus());
        assertEquals(200, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + nuevo)).andReturn().getResponse().getStatus());
        // y el token viejo tampoco sirve para volver a cambiar la clave
        assertEquals(401, mvc.perform(put("/api/auth/change-password").header("Authorization", viejo)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"Nueva_clave1\",\"newPassword\":\"Otra_clave1\",\"confirmPassword\":\"Otra_clave1\"}"))
                .andReturn().getResponse().getStatus());
    }

    @Test
    void b3_resetPasswordRevocaLosTokensAnteriores() throws Exception {
        String viejo = bearer(ana);
        assertEquals(200, mvc.perform(get("/api/auth/me").header("Authorization", viejo)).andReturn().getResponse().getStatus());
        assertEquals(200, enviar("/api/auth/reset-password", reset("ana@x.com", 123456, "Nueva_clave1")).getResponse().getStatus());
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", viejo)).andReturn().getResponse().getStatus());
        // con la clave nueva el login da sesion directa y esa sesion sirve
        MvcResult nuevo = login("ana@x.com", "Nueva_clave1");
        assertEquals(200, nuevo.getResponse().getStatus());
        String t = json(nuevo).get("token").asText();
        assertEquals(200, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + t)).andReturn().getResponse().getStatus());
        // la clave vieja ya no entra
        assertEquals(401, login("ana@x.com", CLAVE).getResponse().getStatus());
    }

    @Test
    void b3_tokenDeSesionSinClaimPwvNoSirve() throws Exception {
        String sinPwv = Jwts.builder().claim("typ", "access").setSubject("ana@x.com")
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRETO)), SignatureAlgorithm.HS256).compact();
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + sinPwv)).andReturn().getResponse().getStatus());
        String pwvAjeno = Jwts.builder().claim("typ", "access").claim("pwv", "0000000000000000").setSubject("ana@x.com")
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRETO)), SignatureAlgorithm.HS256).compact();
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + pwvAjeno)).andReturn().getResponse().getStatus());
        String hex = jwt.parseClaims(jwt.generateToken(ana)).get("pwv", String.class);
        assertEquals(16, hex.length());
        assertFalse(ana.getPassword().contains(hex));
    }

    @Test
    void b6_laAuditoriaRegistraEventosConIduserEIpSinDatosSensibles() throws Exception {
        Logger logger = (Logger) LoggerFactory.getLogger(com.ecommerce.backend.service.Auditoria.class);
        ListAppender<ILoggingEvent> app = new ListAppender<>();
        app.start();
        logger.addAppender(app);
        try {
            assertEquals(200, login("ana@x.com", CLAVE).getResponse().getStatus());
            assertEquals(401, login("ana@x.com", "Mala_clave1").getResponse().getStatus());
            assertEquals(401, login("nadie@x.com", "Mala_clave1").getResponse().getStatus());
            for (int i = 0; i < 4; i++) login("ana@x.com", "Mala_clave1");
            assertEquals(429, login("ana@x.com", CLAVE).getResponse().getStatus());
            assertEquals(200, enviar("/api/auth/reset-password", reset("beto@x.com", 123456, "Nueva_clave1")).getResponse().getStatus());
            String jwtBeto = jwt.generateToken(beto);
            String nuevaBeto = jwtBeto;
            assertEquals(200, mvc.perform(put("/api/auth/change-password").header("Authorization", "Bearer " + nuevaBeto)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"currentPassword\":\"Nueva_clave1\",\"newPassword\":\"Otra_clave1\",\"confirmPassword\":\"Otra_clave1\"}"))
                    .andReturn().getResponse().getStatus());
        } finally {
            logger.detachAppender(app);
        }
        List<String> msgs = app.list.stream().map(ILoggingEvent::getFormattedMessage).toList();
        assertTrue(msgs.contains("AUDIT login_ok iduser=1 ip=127.0.0.1"), msgs.toString());
        assertTrue(msgs.contains("AUDIT login_fallido iduser=1 ip=127.0.0.1"), msgs.toString());
        assertTrue(msgs.contains("AUDIT login_fallido iduser=desconocido ip=127.0.0.1"), msgs.toString());
        assertTrue(msgs.contains("AUDIT login_bloqueado iduser=desconocido ip=127.0.0.1"), msgs.toString());
        assertTrue(msgs.contains("AUDIT password_restablecida iduser=2 ip=127.0.0.1"), msgs.toString());
        assertTrue(msgs.contains("AUDIT password_cambiada iduser=2 ip=127.0.0.1"), msgs.toString());
        for (String m : msgs) {
            assertTrue(m.startsWith("AUDIT "), m);
            assertFalse(m.contains("@"), "sin correo: " + m);
            assertFalse(m.contains("clave") || m.contains("Clave") || m.contains("eyJ") || m.contains("123456"), m);
        }
    }

    @Test
    void b10_errorEsAccesibleParaAnonimos() throws Exception {
        // /error debe estar permitido: si no, un JSON mal formado de un anonimo acaba en 401 en vez de 400
        assertNotEquals(401, mvc.perform(get("/error")).andReturn().getResponse().getStatus());
        MvcResult malo = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{mal json")).andReturn();
        assertEquals(400, malo.getResponse().getStatus());
        assertFalse(body(malo).contains("JsonParseException"));
        assertFalse(body(malo).contains("at com."));
    }

    // ---------- contraseñas de mas de 72 bytes (limite de BCrypt) y cuerpo roto ----------

    private static String larga(int n) {
        return "Aa1_" + "x".repeat(n - 4);
    }

    @Test
    void changePasswordConClaveNuevaDe73o10000Da400ConErrors() throws Exception {
        String hashAntes = ana.getPassword();
        for (int n : new int[]{73, 10_000}) {
            MvcResult r = cambiar(ana, CLAVE, larga(n));
            assertEquals(400, r.getResponse().getStatus(), "n=" + n);
            assertTrue(body(r).contains("\"errors\""), body(r));
            assertTrue(body(r).contains("La contraseña no puede superar 72 caracteres"), body(r));
            assertEquals(hashAntes, ana.getPassword());
        }
        verify(repo, never()).cambiarPassword(any(), any());
        // 72 caracteres es el maximo valido
        assertEquals(200, cambiar(ana, CLAVE, larga(72)).getResponse().getStatus());
        assertTrue(enc.matches(larga(72), ana.getPassword()));
    }

    @Test
    void resetPasswordYRegisterConClaveDe100Da400ConErrors() throws Exception {
        MvcResult r = enviar("/api/auth/reset-password", reset("ana@x.com", 123456, larga(100)));
        assertEquals(400, r.getResponse().getStatus());
        assertTrue(body(r).contains("\"errors\""), body(r));
        assertEquals(123456, ana.getResetCode());   // el codigo no se gasta
        MvcResult reg = enviar("/api/auth/register", "{\"nombre\":\"N\",\"apellido\":\"A\",\"dni\":\"12345678\","
                + "\"correo\":\"nuevo@x.com\",\"celular\":\"987654321\",\"password\":\"" + larga(100) + "\"}");
        assertEquals(400, reg.getResponse().getStatus());
        assertTrue(body(reg).contains("\"errors\""), body(reg));
        assertTrue(body(reg).contains("La contraseña no puede superar 72 caracteres"), body(reg));
        verify(repo, never()).save(any());
    }

    @Test
    void loginYClaveActualDe10000CaracteresSonClaveIncorrectaSin500() throws Exception {
        MvcResult l = enviar("/api/auth/login", "{\"correo\":\"ana@x.com\",\"password\":\"" + larga(10_000) + "\"}");
        assertEquals(401, l.getResponse().getStatus());
        assertTrue(body(l).contains("Correo o contraseña incorrectos"));
        MvcResult l2 = enviar("/api/auth/login", "{\"correo\":\"nadie@x.com\",\"password\":\"" + larga(10_000) + "\"}");
        assertEquals(401, l2.getResponse().getStatus());
        MvcResult c = cambiar(ana, larga(10_000), "Nueva_clave1");
        assertEquals(400, c.getResponse().getStatus());
        assertTrue(body(c).contains("La contraseña actual no es correcta"), body(c));
    }

    @Test
    void jsonRotoOConTiposEquivocadosDa400ConLaFormaDeSiempre() throws Exception {
        for (String cuerpo : new String[]{"{rota", "{\"correo\":{\"a\":1}}"}) {
            MvcResult r = enviar("/api/auth/login", cuerpo);
            assertEquals(400, r.getResponse().getStatus(), cuerpo);
            assertTrue(body(r).contains("\"statusCode\":400") && body(r).contains("Datos no válidos"), body(r));
            assertFalse(body(r).contains("timestamp"), body(r));
        }
    }
}
