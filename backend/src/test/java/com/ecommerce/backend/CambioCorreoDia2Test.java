package com.ecommerce.backend;

import com.ecommerce.backend.config.JWTAuthFilter;
import com.ecommerce.backend.config.SecurityConfig;
import com.ecommerce.backend.controller.UsuarioController;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.RolRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import com.ecommerce.backend.service.ContadorAcotado;
import com.ecommerce.backend.service.EmailService;
import com.ecommerce.backend.service.JWTUtils;
import com.ecommerce.backend.service.UsuarioDetailsService;
import com.ecommerce.backend.service.UsuarioService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

/**
 * Dia 2: cambiar correo (contraseña actual + codigo al correo nuevo) y restablecer clave sin caso especial de admin. Sin base real: repositorios simulados
 * que imitan los UPDATE condicionados (mismo patron que AuthSeguridadDia2Test).
 */
@WebMvcTest(UsuarioController.class)
@Import({SecurityConfig.class, JWTAuthFilter.class, JWTUtils.class, UsuarioDetailsService.class, UsuarioService.class})
@TestPropertySource(properties = {"app.jwt.secret=" + AuthSeguridadDia2Test.SECRETO})
class CambioCorreoDia2Test {

    static final String CLAVE = AuthSeguridadDia2Test.CLAVE;
    static final JsonMapper JSON = JsonMapper.builder().build();

    @Autowired MockMvc mvc;
    @Autowired JWTUtils jwt;
    @Autowired UsuarioService usuarioService;
    @MockitoBean UsuarioRepository repo;
    @MockitoBean RolRepository rolRepo;
    @MockitoBean EmailService email;

    final BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
    Usuario ana, beto;

    private Usuario usuario(int id, String correo) {
        Rol r = new Rol();
        r.setIdrol(2);
        r.setNombre("CLIENTE");
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
        return u;
    }

    @BeforeEach
    void preparar() {
        for (String campo : new String[]{"loginCorreo", "loginIp", "fallosCodigo", "fallosReset", "pedidosForgot", "avisosExistente", "resetIp",
                "pedidosCambioCorreo", "fallosCodigoCorreo", "fallosCorreoHora", "claveUsuario", "claveIp"}) {
            ((ContadorAcotado) ReflectionTestUtils.getField(usuarioService, campo)).clear();
        }
        ana = usuario(1, "ana@x.com");
        beto = usuario(2, "beto@x.com");
        for (Usuario u : new Usuario[]{ana, beto}) {
            when(repo.findByCorreo(u.getCorreo())).thenReturn(Optional.of(u));
            when(repo.findById(u.getIduser())).thenReturn(Optional.of(u));
            when(repo.existsByCorreo(u.getCorreo())).thenReturn(true);
            when(repo.guardarCorreoPendiente(eq(u.getIduser()), anyString(), anyInt(), any())).thenAnswer(i -> {
                u.setCorreoPendiente(i.getArgument(1));
                u.setCorreoPendienteCodigo(i.getArgument(2));
                u.setCorreoPendienteExpira(i.getArgument(3));
                return 1;
            });
            when(repo.anularCorreoPendiente(u.getIduser())).thenAnswer(i -> {
                u.setCorreoPendiente(null);
                u.setCorreoPendienteCodigo(null);
                u.setCorreoPendienteExpira(null);
                return 1;
            });
            // imita el UPDATE condicionado: codigo igual y no vencido
            when(repo.confirmarCambioCorreo(eq(u.getIduser()), anyInt(), any())).thenAnswer(i -> {
                synchronized (u) {
                    LocalDateTime ahora = i.getArgument(2);
                    if (u.getCorreoPendiente() == null || !u.getCorreoPendienteCodigo().equals(i.getArgument(1))
                            || u.getCorreoPendienteExpira().isBefore(ahora)) return 0;
                    String nuevo = u.getCorreoPendiente();
                    String viejo = u.getCorreo();
                    u.setCorreo(nuevo);
                    u.setSesionVersion(u.getSesionVersion() + 1);   // el UPDATE real sube sesion_version
                    when(repo.findByCorreo(viejo)).thenReturn(Optional.empty());   // como en la base: el correo viejo ya no existe
                    u.setCorreoPendiente(null);
                    u.setCorreoPendienteCodigo(null);
                    u.setCorreoPendienteExpira(null);
                    when(repo.findByCorreo(nuevo)).thenReturn(Optional.of(u));
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
            when(repo.restablecerPassword(eq(u.getIduser()), anyString(), anyInt(), any(LocalDateTime.class))).thenAnswer(i -> {
                // imita el UPDATE real: codigo y vigencia (igual para admin y cliente)
                if (u.getResetCode() == null || !u.getResetCode().equals(i.getArgument(2))
                        || u.getResetCodeExpiresAt().isBefore(i.getArgument(3))) return 0;
                u.setCorreoPendiente(null);
                u.setCorreoPendienteCodigo(null);
                u.setCorreoPendienteExpira(null);
                u.setPassword(i.getArgument(1));
                u.setResetCode(null);
                u.setResetCodeExpiresAt(null);
                return 1;
            });
        }
    }

    // ---------- ayudas ----------

    private String bearer(Usuario u) {
        return "Bearer " + jwt.generateToken(u);
    }

    private MvcResult post(String url, String auth, String json) throws Exception {
        var req = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(url)
                .contentType(MediaType.APPLICATION_JSON).content(json);
        if (auth != null) req = req.header("Authorization", auth);
        return mvc.perform(req).andReturn();
    }

    private MvcResult pedirCambio(Usuario u, String clave, String nuevoCorreo) throws Exception {
        String cuerpo = "{\"currentPassword\":\"" + clave + "\""
                + (nuevoCorreo == null ? "" : ",\"newCorreo\":\"" + nuevoCorreo + "\"") + "}";
        return post("/api/auth/change-email", bearer(u), cuerpo);
    }

    private MvcResult confirmar(Usuario u, String codigo) throws Exception {
        return post("/api/auth/change-email/confirm", bearer(u),
                "{" + (codigo == null ? "" : "\"emailCode\":\"" + codigo + "\"") + "}");
    }

    private JsonNode json(MvcResult r) throws Exception {
        return JSON.readTree(r.getResponse().getContentAsString());
    }

    private String body(MvcResult r) throws Exception {
        return r.getResponse().getContentAsString();
    }

    private static void sinSecretos(String s) {
        for (String p : new String[]{"password", "resetCode", "mfa", "correoPendiente", "$2a$"}) {
            assertFalse(s.contains(p), "No debe aparecer '" + p + "' en: " + s);
        }
    }

    private String reset(String correo, Object codigo, String nueva, String confirmacion) {
        return "{\"correo\":\"" + correo + "\",\"resetCode\":" + codigo + ",\"newPassword\":\"" + nueva
                + "\",\"confirmPassword\":\"" + confirmacion + "\"}";
    }

    private String verif(String correo, Object codigo) {
        return "{\"correo\":\"" + correo + "\",\"resetCode\":" + codigo + "}";
    }

    // =====================================================================
    // 2. Cambiar correo
    // =====================================================================

    @Test
    void cambiarCorreo_caminoBueno_pideConfirmaYDaTokenNuevo() throws Exception {
        String tokenViejo = bearer(ana);
        MvcResult r = pedirCambio(ana, CLAVE, " Nuevo@X.com ");
        assertEquals(200, r.getResponse().getStatus(), body(r));
        assertEquals("Te enviamos un código de 6 dígitos al correo nuevo", json(r).get("message").asText());
        assertEquals("ana@x.com", ana.getCorreo(), "el correo todavia NO cambia");
        assertEquals("nuevo@x.com", ana.getCorreoPendiente(), "normalizado");
        int codigo = ana.getCorreoPendienteCodigo();
        assertTrue(codigo >= 100000 && codigo <= 999999);
        assertTrue(ana.getCorreoPendienteExpira().isAfter(LocalDateTime.now().plusMinutes(9)));
        verify(email, timeout(5000)).sendCambioCorreoCodigoEmail(eq("nuevo@x.com"), any(), eq(codigo));
        verify(email, timeout(5000)).sendCambioCorreoSolicitadoEmail(eq("ana@x.com"), any());

        MvcResult ok = confirmar(ana, String.valueOf(codigo));
        assertEquals(200, ok.getResponse().getStatus(), body(ok));
        sinSecretos(body(ok));
        assertEquals("Correo actualizado", json(ok).get("message").asText());
        assertEquals("nuevo@x.com", ana.getCorreo());
        assertNull(ana.getCorreoPendiente());
        assertNull(ana.getCorreoPendienteCodigo());
        assertNull(ana.getCorreoPendienteExpira());
        assertEquals("nuevo@x.com", json(ok).get("usuario").get("correo").asText());
        verify(email, timeout(5000)).sendCorreoCambiadoEmail(eq("ana@x.com"), any(), eq("nu****@x.com"));
        String tokenNuevo = json(ok).get("token").asText();
        assertEquals("nuevo@x.com", jwt.parseClaims(tokenNuevo).getSubject());
        assertEquals(200, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + tokenNuevo)).andReturn().getResponse().getStatus());
        assertEquals(401, mvc.perform(get("/api/auth/me").header("Authorization", tokenViejo)).andReturn().getResponse().getStatus(),
                "el token viejo (sujeto = correo viejo) ya no vale");
        // la otra cuenta no se toco
        assertEquals("beto@x.com", beto.getCorreo());
        assertNull(beto.getCorreoPendiente());
    }

    @Test
    void cambiarCorreo_sinSesionEs401() throws Exception {
        assertEquals(401, post("/api/auth/change-email", null, "{\"currentPassword\":\"x\",\"newCorreo\":\"a@b.com\"}").getResponse().getStatus());
        assertEquals(401, post("/api/auth/change-email/confirm", null, "{\"emailCode\":\"123456\"}").getResponse().getStatus());
        // un token que no es de sesion (typ distinto, p. ej. los viejos de MFA) tampoco es una sesion
        String viejo = io.jsonwebtoken.Jwts.builder().setSubject(ana.getCorreo()).claim("typ", "mfa_setup")
                .claim("pwv", JWTUtils.pwv(ana.getPassword())).claim("sv", ana.getSesionVersion())
                .setExpiration(new java.util.Date(System.currentTimeMillis() + 60000))
                .signWith(new javax.crypto.spec.SecretKeySpec(java.util.Base64.getDecoder().decode(AuthSeguridadDia2Test.SECRETO), "HmacSHA256"),
                        io.jsonwebtoken.SignatureAlgorithm.HS256).compact();
        assertEquals(401, post("/api/auth/change-email", "Bearer " + viejo, "{\"currentPassword\":\"x\"}").getResponse().getStatus());
        verify(repo, never()).guardarCorreoPendiente(any(), any(), any(), any());
    }

    @Test
    void cambiarCorreo_claveMalaEs400_noGuardaNada() throws Exception {
        MvcResult r = pedirCambio(ana, "Incorrecta1_", "nuevo@x.com");
        assertEquals(400, r.getResponse().getStatus());
        assertEquals("La contraseña actual no es correcta", json(r).get("fieldErrors").get("currentPassword").asText());
        assertNull(ana.getCorreoPendiente());
        verify(repo, never()).guardarCorreoPendiente(any(), any(), any(), any());
        // con la clave buena pasa
        assertEquals(200, pedirCambio(ana, CLAVE, "nuevo@x.com").getResponse().getStatus());
        // vacia / muy larga: 400 sin 500
        for (String c : new String[]{"", "x".repeat(200)}) {
            assertEquals(400, pedirCambio(ana, c, "otro@x.com").getResponse().getStatus());
        }
    }

    @Test
    void cambiarCorreo_correoInvalidoIgualOOcupado() throws Exception {
        String[][] casos = {
                {"", "Ingresa un correo electrónico válido"},
                {"sin-arroba", "Ingresa un correo electrónico válido"},
                {"a".repeat(95) + "@x.com", "Ingresa un correo electrónico válido"},
                {"  ANA@x.com ", "Ese ya es tu correo actual"},
                {"beto@x.com", "Ese correo no está disponible"},
        };
        for (String[] c : casos) {
            MvcResult r = pedirCambio(ana, CLAVE, c[0]);
            assertEquals(400, r.getResponse().getStatus(), c[0]);
            assertEquals(c[1], json(r).get("fieldErrors").get("newCorreo").asText(), c[0]);
        }
        // ausente del cuerpo
        assertEquals(400, pedirCambio(ana, CLAVE, null).getResponse().getStatus());
        verify(repo, never()).guardarCorreoPendiente(any(), any(), any(), any());
        // los rechazos de formato no consumen pedidos: el bueno pasa
        assertEquals(200, pedirCambio(ana, CLAVE, "nuevo@x.com").getResponse().getStatus());
    }

    @Test
    void cambiarCorreo_yaNoPideNiUsaCodigoDeSegundoFactor() throws Exception {
        // un totpCode que mande alguien en el body se ignora: ni lo exige ni cambia el resultado
        MvcResult r = post("/api/auth/change-email", bearer(ana),
                "{\"currentPassword\":\"" + CLAVE + "\",\"totpCode\":\"000000\",\"newCorreo\":\"nuevo@x.com\"}");
        assertEquals(200, r.getResponse().getStatus(), body(r));
        assertEquals("nuevo@x.com", ana.getCorreoPendiente());
        // beto (sin nada especial) tambien puede: no hay cuentas "sin verificacion"
        assertEquals(200, post("/api/auth/change-email", bearer(beto),
                "{\"currentPassword\":\"" + CLAVE + "\",\"newCorreo\":\"otro@x.com\"}").getResponse().getStatus());
    }

    @Test
    void cambiarCorreo_elCuartoPedidoEn15MinEs429() throws Exception {
        ContadorAcotado pedidos = (ContadorAcotado) ReflectionTestUtils.getField(usuarioService, "pedidosCambioCorreo");
        for (int i = 0; i < 3; i++) pedidos.sumar("u:1");   // ya hubo 3 pedidos emitidos
        MvcResult r = pedirCambio(ana, CLAVE, "nuevo@x.com");
        assertEquals(429, r.getResponse().getStatus());
        assertTrue(body(r).contains(ContadorAcotado.MSG_LIMITE));
        verify(repo, never()).guardarCorreoPendiente(any(), any(), any(), any());
        // y de verdad: 3 pedidos reales pasan y el siguiente se bloquea
        pedidos.clear();
        assertEquals(200, pedirCambio(ana, CLAVE, "uno@x.com").getResponse().getStatus());
        assertEquals(200, pedirCambio(ana, CLAVE, "dos@x.com").getResponse().getStatus());
        assertEquals(200, pedirCambio(ana, CLAVE, "tres@x.com").getResponse().getStatus());
        assertEquals(429, pedirCambio(ana, CLAVE, "cuatro@x.com").getResponse().getStatus());
        assertEquals("tres@x.com", ana.getCorreoPendiente());
    }

    @Test
    void cambiarCorreo_claveMalaRepetidaDa429ComoChangePassword() throws Exception {
        for (int i = 1; i <= 10; i++) {
            assertEquals(400, pedirCambio(ana, "Incorrecta1_", "nuevo@x.com").getResponse().getStatus(), "intento " + i);
        }
        assertEquals(429, pedirCambio(ana, "Incorrecta1_", "nuevo@x.com").getResponse().getStatus());
        assertEquals(429, pedirCambio(ana, CLAVE, "nuevo@x.com").getResponse().getStatus());
        verify(repo, never()).guardarCorreoPendiente(any(), any(), any(), any());
    }

    @Test
    void confirmar_codigoMaloCincoVecesAnulaElPedido() throws Exception {
        assertEquals(200, pedirCambio(ana, CLAVE, "nuevo@x.com").getResponse().getStatus());
        int bueno = ana.getCorreoPendienteCodigo();
        int malo = bueno == 111111 ? 222222 : 111111;
        for (int i = 1; i <= 5; i++) {
            MvcResult r = confirmar(ana, String.valueOf(malo));
            assertEquals(400, r.getResponse().getStatus(), "fallo " + i);
            assertEquals(i < 5 ? "Código inválido o expirado" : "Demasiados intentos. Pide un código nuevo",
                    json(r).get("fieldErrors").get("emailCode").asText(), "fallo " + i);
        }
        assertNull(ana.getCorreoPendiente(), "al 5.o fallo el pedido se anula");
        assertEquals(400, confirmar(ana, String.valueOf(bueno)).getResponse().getStatus(), "ya ni el bueno sirve");
        assertEquals("ana@x.com", ana.getCorreo());
        verify(repo, never()).confirmarCambioCorreo(any(), anyInt(), any());
    }

    @Test
    void confirmar_vencidoSinPedidoYFormatosRaros() throws Exception {
        // sin pedido
        assertEquals(400, confirmar(ana, "123456").getResponse().getStatus());
        // formatos raros: nunca 500
        for (String c : new String[]{null, "", "abc", "12345", "1234567", "12 456", "-12345", "1e5000"}) {
            assertEquals(400, confirmar(ana, c).getResponse().getStatus(), "codigo=" + c);
        }
        // vencido
        assertEquals(200, pedirCambio(ana, CLAVE, "nuevo@x.com").getResponse().getStatus());
        int codigo = ana.getCorreoPendienteCodigo();
        ana.setCorreoPendienteExpira(LocalDateTime.now().minusMinutes(1));
        MvcResult r = confirmar(ana, String.valueOf(codigo));
        assertEquals(400, r.getResponse().getStatus());
        assertTrue(json(r).get("fieldErrors").has("emailCode"));
        assertEquals("ana@x.com", ana.getCorreo());
    }

    @Test
    void confirmar_correoOcupadoEntretanto_anulaElPedido() throws Exception {
        assertEquals(200, pedirCambio(ana, CLAVE, "libre@x.com").getResponse().getStatus());
        int codigo = ana.getCorreoPendienteCodigo();
        when(repo.existsByCorreo("libre@x.com")).thenReturn(true);   // alguien se lo quedo
        MvcResult r = confirmar(ana, String.valueOf(codigo));
        assertEquals(400, r.getResponse().getStatus());
        assertEquals("Ese correo ya no está disponible", json(r).get("fieldErrors").get("emailCode").asText());
        assertNull(ana.getCorreoPendiente());
        assertEquals("ana@x.com", ana.getCorreo());
    }

    @Test
    void confirmar_carreraConElUnicoDeLaBase_dice400SinTraza() throws Exception {
        assertEquals(200, pedirCambio(ana, CLAVE, "libre@x.com").getResponse().getStatus());
        int codigo = ana.getCorreoPendienteCodigo();
        when(repo.confirmarCambioCorreo(eq(1), anyInt(), any())).thenThrow(new DataIntegrityViolationException("usuario_correo_key detalle interno"));
        MvcResult r = confirmar(ana, String.valueOf(codigo));
        assertEquals(400, r.getResponse().getStatus());
        assertEquals("Ese correo ya no está disponible", json(r).get("fieldErrors").get("emailCode").asText());
        assertFalse(body(r).contains("usuario_correo_key"));
        assertNull(ana.getCorreoPendiente());
    }

    @Test
    void confirmar_dosVecesSeguidasSoloVale1() throws Exception {
        assertEquals(200, pedirCambio(ana, CLAVE, "nuevo@x.com").getResponse().getStatus());
        String codigo = String.valueOf(ana.getCorreoPendienteCodigo());
        assertEquals(200, confirmar(ana, codigo).getResponse().getStatus());
        // el segundo ya no tiene pedido (y el token usado era el viejo: se firma con el correo actual)
        assertEquals(400, confirmar(ana, codigo).getResponse().getStatus());
        verify(repo, times(1)).confirmarCambioCorreo(any(), anyInt(), any());
    }

    @Test
    void confirmar_subeLaVersionDeSesionYElTokenNuevoLlevaLaVersionNueva() throws Exception {
        String tokenViejo = bearer(ana).substring(7);
        assertEquals(200, pedirCambio(ana, CLAVE, "nuevo@x.com").getResponse().getStatus());
        MvcResult r = confirmar(ana, String.valueOf(ana.getCorreoPendienteCodigo()));
        assertEquals(200, r.getResponse().getStatus());
        assertEquals(1, ana.getSesionVersion());
        String tokenNuevo = json(r).get("token").asText();
        assertTrue((JWTUtils.pwvCoincide(jwt.parseClaims(tokenNuevo), ana.getPassword()) && JWTUtils.svCoincide(jwt.parseClaims(tokenNuevo), ana.getSesionVersion())), "el token nuevo lleva sv=1 y la clave actual");
        assertFalse((JWTUtils.pwvCoincide(jwt.parseClaims(tokenViejo), ana.getPassword()) && JWTUtils.svCoincide(jwt.parseClaims(tokenViejo), ana.getSesionVersion())), "el token anterior (sv=0) ya no vale");
        // y el nuevo abre sesion de verdad
        assertEquals(200, mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + tokenNuevo)).andReturn().getResponse().getStatus());
    }

    @Test
    void confirmar_conElCorreoYaTomadoSeAnulaElPedidoSinFiltrarDetalle() throws Exception {
        // el unico lower(correo) (V6) hace real este caso: el UPDATE lanza y se responde 400 sin traza
        assertEquals(200, pedirCambio(ana, CLAVE, "Libre@X.com").getResponse().getStatus());
        assertEquals("libre@x.com", ana.getCorreoPendiente(), "el pedido guarda el correo normalizado");
        int codigo = ana.getCorreoPendienteCodigo();
        when(repo.confirmarCambioCorreo(eq(1), anyInt(), any())).thenThrow(new DataIntegrityViolationException("uq_usuario_correo_lower detalle"));
        MvcResult r = confirmar(ana, String.valueOf(codigo));
        assertEquals(400, r.getResponse().getStatus());
        assertFalse(body(r).contains("uq_usuario_correo_lower"));
        assertNull(ana.getCorreoPendiente());
        assertEquals("ana@x.com", ana.getCorreo());
        assertEquals(0, ana.getSesionVersion());
    }

    @Test
    void restablecerAnulaElPedidoDeCorreoPendiente() throws Exception {
        // lo garantiza el UPDATE (columnas correo_pendiente* a NULL); el simulador lo imita y aqui se comprueba el flujo
        ana.setCorreoPendiente("otro@x.com");
        ana.setCorreoPendienteCodigo(654321);
        ana.setCorreoPendienteExpira(LocalDateTime.now().plusMinutes(5));
        assertEquals(200, post("/api/auth/reset-password", null, reset("ana@x.com", 123456, "Nueva_clave1", "Nueva_clave1")).getResponse().getStatus());
        assertNull(ana.getCorreoPendiente());
        assertNull(ana.getCorreoPendienteCodigo());
        assertNull(ana.getCorreoPendienteExpira());
    }

    @Test
    void restablecerPasswordNoValeSiElCodigoVencio() throws Exception {
        ana.setResetCodeExpiresAt(LocalDateTime.now().minusMinutes(1));
        MvcResult r = post("/api/auth/reset-password", null, reset("ana@x.com", 123456, "Nueva_clave1", "Nueva_clave1"));
        assertEquals(400, r.getResponse().getStatus());
        assertTrue(enc.matches(CLAVE, ana.getPassword()), "la clave no cambio");
    }

    @Test
    void lasConsultasLlevanLasCondicionesDeSeguridad() {
        // No hay base en las pruebas: se comprueba el texto de las consultas que protegen estos casos.
        String restablecer = consulta(UsuarioRepository.class, "restablecerPassword");
        assertTrue(restablecer.contains("u.resetCodeExpiresAt >= :ahora"), restablecer);
        assertTrue(restablecer.contains("u.resetCode = :codigo"), restablecer);
        assertTrue(restablecer.contains("u.correoPendiente = null"), restablecer);
        assertFalse(restablecer.toLowerCase().contains("mfa"), restablecer);
        assertTrue(consulta(UsuarioRepository.class, "cambiarPassword").contains("u.correoPendiente = null"));
        assertTrue(consulta(UsuarioRepository.class, "confirmarCambioCorreo").contains("u.sesionVersion = u.sesionVersion + 1"));
        // el cambio de rol sube la version de sesion en el mismo UPDATE y esta condicionado al rol leido
        String rol = consulta(UsuarioRepository.class, "cambiarRol");
        assertTrue(rol.contains("u.sesionVersion = u.sesionVersion + 1") && rol.contains("u.rol.idrol = :rolActual"), rol);
        // el correo se compara sin distinguir mayusculas (igual que el unico uq_usuario_correo_lower)
        assertTrue(consulta(UsuarioRepository.class, "findByCorreo").contains("lower(u.correo) = lower(:correo)"));
        assertTrue(consulta(UsuarioRepository.class, "existsByCorreo").contains("lower(u.correo) = lower(:correo)"));
    }

    private static String consulta(Class<?> repo, String metodo) {
        for (java.lang.reflect.Method m : repo.getDeclaredMethods()) {
            if (m.getName().equals(metodo)) {
                return m.getAnnotation(org.springframework.data.jpa.repository.Query.class).value();
            }
        }
        throw new IllegalArgumentException(metodo);
    }

    @Test
    void registroGuardaElCorreoNormalizado() throws Exception {
        when(repo.findByCorreo("nuevo@x.com")).thenReturn(Optional.empty());
        when(rolRepo.findById(2)).thenReturn(Optional.of(ana.getRol()));
        when(repo.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        assertEquals(200, post("/api/auth/register", null, "{\"nombre\":\"N\",\"apellido\":\"A\",\"dni\":\"12345678\",\"celular\":\"987654321\","
                + "\"correo\":\"  Nuevo@X.com \",\"password\":\"Clave_buena1\"}").getResponse().getStatus());
        org.mockito.ArgumentCaptor<Usuario> guardado = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(repo).save(guardado.capture());
        assertEquals("nuevo@x.com", guardado.getValue().getCorreo());
    }

    @Test
    void registroConCorreoTomadoEnCarreraDaLaRespuestaGenericaSinDetalle() throws Exception {
        when(repo.findByCorreo("carrera@x.com")).thenReturn(Optional.empty());
        when(rolRepo.findById(2)).thenReturn(Optional.of(ana.getRol()));
        when(repo.save(any(Usuario.class))).thenThrow(new DataIntegrityViolationException("uq_usuario_correo_lower detalle"));
        MvcResult r = post("/api/auth/register", null, "{\"nombre\":\"N\",\"apellido\":\"A\",\"dni\":\"12345678\",\"celular\":\"987654321\","
                + "\"correo\":\"Carrera@x.com\",\"password\":\"Clave_buena1\"}");
        assertEquals(200, r.getResponse().getStatus());
        assertFalse(body(r).contains("uq_usuario"));
    }

    @Test
    void enmascararCorreo() {
        assertEquals("da****@gmail.com", UsuarioService_enmascarar("daniel@gmail.com"));
        assertEquals("a****@x.com", UsuarioService_enmascarar("a@x.com"));
        assertEquals("a****@x.com", UsuarioService_enmascarar("ab@x.com"));
        assertEquals("ab****@x.com", UsuarioService_enmascarar("abc@x.com"));
        assertEquals("****", UsuarioService_enmascarar("@x.com"));
    }

    @Test
    void validadorDeCorreo() {
        String re = (String) ReflectionTestUtils.getField(UsuarioService.class, "EMAIL_REGEX");
        for (String ok : new String[]{"daniel18.dg95@gmail.com", "a+b@sub.dominio.pe", "x_y-z@dominio.com", "a@b.co", "A.B@C-D.org"}) {
            assertTrue(ok.matches(re), ok);
        }
        for (String mal : new String[]{"a@b..com", "a@b", "a@.com", "a@b.", "a@b.c", ".a@b.com", "a.@b.com", "a..b@c.com",
                "a@-b.com", "a@b-.com", "a@b.c1", "a@@b.com", "a b@c.com", "@b.com", "a@", "a@b.com.", "a@b.co m", "a@b_c.com"}) {
            assertFalse(mal.matches(re), mal);
        }
        // sin saltos de linea colados al final
        assertFalse("a@b.com\n".matches(re));
    }

    private static String UsuarioService_enmascarar(String c) {
        return ReflectionTestUtils.invokeMethod(UsuarioService.class, "enmascarar", c);
    }

    // =====================================================================
    // Restablecer clave: igual para admin y cliente (sin caso especial) y sin rutas de "recuperar acceso"
    // =====================================================================

    @Test
    void forgotPasswordDeUnAdminEmiteElCodigoIgualQueUnCliente() throws Exception {
        Rol rolAdmin = new Rol();
        rolAdmin.setIdrol(1);
        rolAdmin.setNombre("ADMINISTRADOR");
        beto.setRol(rolAdmin);
        MvcResult r = post("/api/auth/forgot-password", null, "{\"correo\":\"beto@x.com\"}");
        assertEquals(200, r.getResponse().getStatus());
        assertEquals("Si el correo está registrado, te enviamos un código de 6 dígitos", json(r).get("message").asText());
        verify(email, timeout(5000)).sendPasswordResetEmail(eq("beto@x.com"), any(), anyInt());
        verify(repo, timeout(5000)).guardarCodigoReset(eq(2), anyInt(), any());
    }

    @Test
    void restablecerPasswordDeUnAdminFuncionaConElCodigo() throws Exception {
        Rol rolAdmin = new Rol();
        rolAdmin.setIdrol(1);
        rolAdmin.setNombre("ADMINISTRADOR");
        beto.setRol(rolAdmin);
        MvcResult r = post("/api/auth/reset-password", null, reset("beto@x.com", 123456, "Nueva_clave1", "Nueva_clave1"));
        assertEquals(200, r.getResponse().getStatus(), body(r));
        assertTrue(enc.matches("Nueva_clave1", beto.getPassword()));
        assertNull(beto.getResetCode());
    }

    @Test
    void lasRutasDeRecuperarAccesoYaNoExisten() throws Exception {
        for (String ruta : new String[]{"/api/auth/recover-access", "/api/auth/verify-recover-code", "/api/auth/recover-access/reset",
                "/api/auth/login/mfa", "/api/auth/mfa/setup/totp"}) {
            int st = post(ruta, null, "{\"correo\":\"ana@x.com\"}").getResponse().getStatus();
            assertTrue(st == 404 || st == 401 || st == 405, ruta + " => " + st);
        }
        assertTrue(enc.matches(CLAVE, ana.getPassword()));
        verify(repo, never()).guardarCodigoReset(any(), any(), any());
    }
}
