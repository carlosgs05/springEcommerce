package com.ecommerce.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.UsuarioDTO;
import com.ecommerce.backend.dto.UsuarioResponse;
import com.ecommerce.backend.entity.Permiso;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.UsuarioRepository;
import com.ecommerce.backend.repository.RolRepository;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    public static final int ROL_CLIENTE = 2;

    private static final String MSG_CREDENCIALES = "Correo o contraseña incorrectos";
    private static final String MSG_CODIGO_RESET = "Código inválido o expirado";
    static final String MSG_REGISTRO_GENERICO = "Si los datos son válidos, te enviamos un correo para activar tu cuenta";
    private static final String MSG_SESION = "Sesión no válida o expirada";
    private static final String MSG_ERROR_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo más tarde.";
    private static final String PASSWORD_REGEX = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$";
    private static final String PASSWORD_REGLA =
            "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 caracter especial (@$!%*?&#_)";
    private static final String MSG_CLAVE_LARGA = "La contraseña no puede superar 72 caracteres";
    private static final int MAX_BYTES_CLAVE = 72;   // limite de BCrypt
    /** Local: sin punto al inicio/fin ni dobles. Dominio: etiquetas no vacias (sin guion al borde) y TLD de 2+ letras. */
    static final String EMAIL_REGEX = "^[A-Za-z0-9+_-]+(?:\\.[A-Za-z0-9+_-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z]{2,}$";

    // Limites en memoria (se pierden al reiniciar; una sola instancia). Todos con tamaño maximo.
    static final int MAX_LOGIN_CORREO = 5;          // fallos de contraseña por correo -> bloqueo
    static final int MAX_LOGIN_IP = 30;             // fallos por IP -> bloqueo
    static final int MAX_FALLOS_RESET = 5;          // fallos por CODIGO de reset (se reinicia al emitir uno nuevo)
    static final int MAX_FALLOS_RESET_HORA = 10;    // fallos acumulados por correo en 1 h (NO se reinicia con forgot-password)
    static final int MAX_FORGOT = 3;
    static final int MAX_RESET_IP = 30;      // peticiones de forgot/verify/reset por IP y 15 min (todas las rutas juntas)
    static final int MAX_PEDIDOS_CORREO = 3;        // pedidos de codigo de cambio de correo por usuario y 15 min
    static final int MAX_FALLOS_CLAVE_USUARIO = 10;  // claves actuales falladas (change-password / change-email) por usuario
    static final int MAX_FALLOS_CLAVE_IP = 30;       // idem por IP
    private static final long VENTANA_MS = 15 * 60 * 1000L;
    private static final long VENTANA_RESET_ACUM_MS = 60 * 60 * 1000L;
    private static final int MAX_ENTRADAS = 10_000;

    private final ContadorAcotado loginCorreo = new ContadorAcotado(MAX_LOGIN_CORREO, VENTANA_MS, MAX_ENTRADAS);
    private final ContadorAcotado loginIp = new ContadorAcotado(MAX_LOGIN_IP, VENTANA_MS, MAX_ENTRADAS);
    /** Fallos del codigo de reset vigente, por correo: al emitir un codigo nuevo vuelve a cero. */
    private final ContadorAcotado fallosCodigo = new ContadorAcotado(MAX_FALLOS_RESET, VENTANA_MS, MAX_ENTRADAS);
    /** Fallos acumulados por correo en 1 h: pedir otro codigo NO lo reinicia. */
    private final ContadorAcotado fallosReset = new ContadorAcotado(MAX_FALLOS_RESET_HORA, VENTANA_RESET_ACUM_MS, MAX_ENTRADAS);
    private final ContadorAcotado pedidosForgot = new ContadorAcotado(MAX_FORGOT, VENTANA_MS, MAX_ENTRADAS);
    // Cambiar correo (clave = "u:" + iduser): pedidos de codigo, fallos por codigo emitido y fallos acumulados por hora
    private final ContadorAcotado pedidosCambioCorreo = new ContadorAcotado(MAX_PEDIDOS_CORREO, VENTANA_MS, MAX_ENTRADAS);
    private final ContadorAcotado fallosCodigoCorreo = new ContadorAcotado(MAX_FALLOS_RESET, VENTANA_MS, MAX_ENTRADAS);
    private final ContadorAcotado fallosCorreoHora = new ContadorAcotado(MAX_FALLOS_RESET_HORA, VENTANA_RESET_ACUM_MS, MAX_ENTRADAS);
    /** Fallos de contraseña actual en change-password / change-email, por usuario ("p:" + correo) y por IP. */
    private final ContadorAcotado claveUsuario = new ContadorAcotado(MAX_FALLOS_CLAVE_USUARIO, VENTANA_MS, MAX_ENTRADAS);
    private final ContadorAcotado claveIp = new ContadorAcotado(MAX_FALLOS_CLAVE_IP, VENTANA_MS, MAX_ENTRADAS);
    /** Peticiones por IP a forgot/verify/reset: frena rellenar los contadores por correo. */
    private final ContadorAcotado resetIp = new ContadorAcotado(MAX_RESET_IP, VENTANA_MS, MAX_ENTRADAS);
    /** Avisos "ya tienes una cuenta" por correo y hora (max 3). */
    private final ContadorAcotado avisosExistente = new ContadorAcotado(3, VENTANA_RESET_ACUM_MS, MAX_ENTRADAS);

    // Correos fuera del hilo de la peticion: la respuesta tarda lo mismo exista o no la cuenta.
    private final ThreadPoolExecutor correos = new ThreadPoolExecutor(2, 2, 60, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(200), r -> {
                Thread t = new Thread(r, "correo-saliente");
                t.setDaemon(true);
                return t;
            });

    // hash BCrypt de relleno para que "correo inexistente" tarde lo mismo que "clave mala"
    private volatile String hashRelleno;

    @Autowired
    private UsuarioRepository usersRepo;

    @Autowired
    private RolRepository rolRepo;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final int RESET_CODE_EXPIRATION_MINUTES = 10;

    private static final int VERIFICATION_TOKEN_EXPIRATION_HOURS = 24;

    @PreDestroy
    void cerrarCorreos() {
        correos.shutdown();
    }

    // ---------- utilidades ----------

    private static String normalizar(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase();
    }

    private static UsuarioDTO respuesta(int status, String message) {
        UsuarioDTO r = new UsuarioDTO();
        r.setStatusCode(status);
        r.setMessage(message);
        return r;
    }

    private static UsuarioDTO respuestaErrores(int status, String message, List<String> errors) {
        return respuestaErrores(status, message, errors, null);
    }

    private static UsuarioDTO respuestaErrores(int status, String message, List<String> errors, Map<String, String> porCampo) {
        UsuarioDTO r = respuesta(status, message);
        r.setErrors(errors);
        if (porCampo != null && !porCampo.isEmpty()) r.setFieldErrors(porCampo);
        return r;
    }

    /** 400 de un solo campo: message + fieldErrors{campo}. */
    private static UsuarioDTO respuestaCampo(String campo, String message) {
        UsuarioDTO r = respuesta(400, message);
        r.setFieldErrors(Map.of(campo, message));
        return r;
    }

    /** Agrega el mensaje a la lista y, si el campo aun no tiene, a fieldErrors (queda el primero). */
    private static void err(List<String> errores, Map<String, String> porCampo, String campo, String msg) {
        errores.add(msg);
        porCampo.putIfAbsent(campo, msg);
    }

    /** BCrypt (Spring Security) rechaza claves de mas de 72 bytes UTF-8. */
    static boolean claveDemasiadoLarga(String clave) {
        if (clave == null) return false;
        // un caracter ocupa como maximo 4 bytes: el atajo evita codificar textos enormes
        if (clave.length() > MAX_BYTES_CLAVE) return true;
        return clave.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > MAX_BYTES_CLAVE;
    }

    private String hashRelleno() {
        if (hashRelleno == null) {
            hashRelleno = passwordEncoder.encode(UUID.randomUUID().toString());
        }
        return hashRelleno;
    }

    private static String ipDe(String ip) {
        return ip == null || ip.isBlank() ? "desconocida" : ip;
    }

    /** Clave de contador por correo, acotada en largo (un correo gigante no debe llenar la memoria). */
    private static String claveCorreo(String correo) {
        return correo.length() > 100 ? correo.substring(0, 100) : correo;
    }

    /** true si esta IP ya agoto su tope en las rutas de restablecer clave (cada peticion cuenta, buena o mala). */
    private boolean ipAgotada(String ipCruda) {
        return resetIp.sumar(ipDe(ipCruda)) > MAX_RESET_IP;
    }

    private static UsuarioDTO bloqueado429() {
        return respuesta(429, ContadorAcotado.MSG_LIMITE);
    }

    /** Ejecuta un envio de correo fuera de la peticion. false si la cola esta llena (se registra). */
    private boolean enSegundoPlano(String que, Runnable tarea) {
        try {
            correos.execute(() -> {
                try {
                    tarea.run();
                } catch (Throwable t) {
                    log.error("Fallo en tarea de correo en segundo plano ({}): {}", que, t.getClass().getSimpleName());
                }
            });
            return true;
        } catch (RejectedExecutionException e) {
            log.error("Cola de correos llena, se descarta: {}", que);
            return false;
        }
    }

    /** Respuesta de sesion completa (token access + usuario seguro + rol + permisos). */
    public UsuarioDTO respuestaSesion(Usuario user) {
        UsuarioDTO response = respuesta(200, "Inicio de sesión exitoso");
        response.setToken(jwtUtils.generateToken(user));
        response.setUsuario(UsuarioResponse.de(user));
        response.setRol(user.getRol());
        List<Permiso> listaPermisos = user.getRol().getPermisos()
                .stream()
                .map(rp -> rp.getPermiso())
                .collect(Collectors.toList());
        response.setPermisos(listaPermisos);
        return response;
    }

    // register
    public UsuarioDTO register(UsuarioDTO registrationRequest) {
        UsuarioDTO resp = new UsuarioDTO();
        List<String> validationErrors = new ArrayList<>();
        Map<String, String> porCampo = new LinkedHashMap<>();

        // Validaciones de campos obligatorios (idrol del body se ignora a proposito)
        if (registrationRequest.getNombre() == null || registrationRequest.getNombre().trim().isEmpty()) {
            err(validationErrors, porCampo, "nombre", "El nombre es obligatorio");
        }
        if (registrationRequest.getApellido() == null || registrationRequest.getApellido().trim().isEmpty()) {
            err(validationErrors, porCampo, "apellido", "El apellido es obligatorio");
        }
        if (registrationRequest.getDni() == null || registrationRequest.getDni().trim().isEmpty()) {
            err(validationErrors, porCampo, "dni", "El DNI es obligatorio");
        }
        if (registrationRequest.getCorreo() == null || registrationRequest.getCorreo().trim().isEmpty()) {
            err(validationErrors, porCampo, "correo", "El correo electrónico es obligatorio");
        }
        if (registrationRequest.getPassword() == null || registrationRequest.getPassword().trim().isEmpty()) {
            err(validationErrors, porCampo, "password", "La contraseña es obligatoria");
        }
        if (registrationRequest.getCelular() == null || registrationRequest.getCelular().trim().isEmpty()) {
            err(validationErrors, porCampo, "celular", "El celular es obligatorio");
        }
        if (registrationRequest.getNombre() != null && registrationRequest.getNombre().trim().length() > 50) {
            err(validationErrors, porCampo, "nombre", "El nombre no puede superar 50 caracteres");
        }
        if (registrationRequest.getApellido() != null && registrationRequest.getApellido().trim().length() > 50) {
            err(validationErrors, porCampo, "apellido", "El apellido no puede superar 50 caracteres");
        }

        // Validaciones de formato
        if (registrationRequest.getDni() != null && !registrationRequest.getDni().matches("^\\d{8}$")) {
            err(validationErrors, porCampo, "dni", "El DNI debe contener 8 dígitos numéricos");
        }
        if (registrationRequest.getCelular() != null && !registrationRequest.getCelular().matches("^\\d{9}$")) {
            err(validationErrors, porCampo, "celular", "El celular debe contener 9 dígitos numéricos");
        }
        if (registrationRequest.getCorreo() != null
                && (registrationRequest.getCorreo().trim().length() > 100
                        || !registrationRequest.getCorreo().trim().matches(EMAIL_REGEX))) {
            err(validationErrors, porCampo, "correo", "Ingresa un correo electrónico válido");
        }
        if (claveDemasiadoLarga(registrationRequest.getPassword())) {
            err(validationErrors, porCampo, "password", MSG_CLAVE_LARGA);
        } else if (registrationRequest.getPassword() != null && !registrationRequest.getPassword().matches(PASSWORD_REGEX)) {
            err(validationErrors, porCampo, "password", PASSWORD_REGLA);
        }

        // Si hay errores de validacion de FORMATO, los devolvemos todos juntos (no revelan nada de otras cuentas)
        if (!validationErrors.isEmpty()) {
            resp.setStatusCode(400);
            resp.setErrors(validationErrors);
            resp.setFieldErrors(porCampo);
            return resp;
        }

        // --- Todo paso las validaciones. La respuesta es SIEMPRE la misma exista o no el correo. ---
        final UsuarioDTO generico = respuesta(200, MSG_REGISTRO_GENERICO);
        final String correo = normalizar(registrationRequest.getCorreo());
        // El hash se calcula siempre, antes de mirar la base: asi "ya existe" y "nuevo" cuestan lo mismo
        String hash = passwordEncoder.encode(registrationRequest.getPassword());
        Usuario saved = null;
        try {
            Optional<Usuario> existente = usersRepo.findByCorreo(correo);
            if (existente.isPresent()) {
                Usuario ya = existente.get();
                log.info("Registro con correo ya existente (iduser={}): se avisa por correo, no se crea nada", ya.getIduser());
                final String nombreYa = ya.getNombre();
                // Tope por correo y hora: pasado el tope, misma respuesta pero sin enviar correo
                if (avisosExistente.sumar(claveCorreo(correo)) > 3) {
                    log.warn("register: tope de avisos de cuenta existente alcanzado (iduser={}), no se envia", ya.getIduser());
                    return generico;
                }
                enSegundoPlano("aviso cuenta existente", () -> {
                    try {
                        emailService.sendAccountExistsEmail(correo, nombreYa);
                    } catch (Exception e) {
                        throw new IllegalStateException("No se pudo enviar el aviso de cuenta existente");
                    }
                });
                return generico;
            }

            // Registro publico: SIEMPRE cliente, sin importar lo que mande el cliente HTTP
            Rol rol = rolRepo.findById(ROL_CLIENTE)
                    .orElseThrow(() -> new IllegalStateException("Falta el rol CLIENTE (idrol 2) en la base"));

            Usuario user = new Usuario();
            user.setNombre(registrationRequest.getNombre().trim());
            user.setApellido(registrationRequest.getApellido().trim());
            user.setDni(registrationRequest.getDni().trim());
            user.setCorreo(correo);
            user.setPassword(hash);
            user.setCelular(registrationRequest.getCelular().trim());
            user.setRol(rol);
            user.setEnabled(false);

            final String verificationToken = UUID.randomUUID().toString();
            user.setVerificationToken(verificationToken);
            user.setTokenExpiration(LocalDateTime.now().plusHours(VERIFICATION_TOKEN_EXPIRATION_HOURS));

            saved = usersRepo.save(user);

            // Efecto externo (correo): despues de guardar y fuera de la peticion. Si el envio falla, la cuenta
            // sin verificar no sirve (nadie tiene el enlace) y bloquearia el reintento: se deshace desde la tarea.
            final Usuario creada = saved;
            boolean encolado = enSegundoPlano("verificacion de cuenta", () -> {
                try {
                    emailService.sendVerificationEmail(creada.getCorreo(), creada.getNombre(), verificationToken);
                } catch (Exception e) {
                    log.error("No se pudo enviar el correo de verificacion (iduser={}, error={}); se deshace la cuenta sin verificar",
                            creada.getIduser(), e.getClass().getSimpleName());
                    deshacerCuentaSinVerificar(creada);
                }
            });
            if (!encolado) {
                // Cola llena: se deshace la fila y se responde IGUAL que con correo existente (sin oraculo)
                log.error("Registro no completado por cola de correos llena (iduser={}); se deshace la cuenta", saved.getIduser());
                deshacerCuentaSinVerificar(saved);
            }
            return generico;
        } catch (DataIntegrityViolationException e) {
            // Dos registros del mismo correo a la vez: el unico lower(correo) de la base (V6) decide; el segundo ve lo mismo que un duplicado
            log.warn("Registro duplicado concurrente: lo resolvio el unico de la base");
            return generico;
        } catch (Exception e) {
            log.error("Fallo en el registro (iduser={})", saved != null ? saved.getIduser() : null, e);
            if (saved != null) {
                deshacerCuentaSinVerificar(saved);
            }
            resp.setStatusCode(500);
            resp.setErrors(Collections.singletonList("No se pudo completar el registro. Inténtalo de nuevo más tarde."));
            return resp;
        }
    }

    private void deshacerCuentaSinVerificar(Usuario cuenta) {
        try {
            usersRepo.borrarSiNoVerificada(cuenta.getIduser());
        } catch (Exception e2) {
            log.error("No se pudo deshacer el registro fallido (iduser={})", cuenta.getIduser(), e2);
        }
    }

    // Añade nuevo método para verificación
    public UsuarioDTO verifyEmail(String token) {
        final String msgInvalido = "El enlace de verificación no es válido o ha expirado";
        try {
            if (token == null || token.isBlank()) {
                return respuesta(400, msgInvalido);
            }
            Optional<Usuario> opt = usersRepo.findByVerificationToken(token);
            if (opt.isEmpty()) {
                return respuesta(400, msgInvalido);
            }
            Usuario user = opt.get();

            if (user.getTokenExpiration() == null || LocalDateTime.now().isAfter(user.getTokenExpiration())) {
                usersRepo.delete(user);
                return respuesta(400, msgInvalido);
            }

            // UPDATE puntual condicionado al token: el enlace sirve una vez y no se pisan otras columnas
            if (usersRepo.activarCuenta(user.getIduser(), token) != 1) {
                return respuesta(400, msgInvalido);
            }

            UsuarioDTO response = respuesta(200, "Cuenta verificada exitosamente");
            response.setCorreo(user.getCorreo());
            response.setNombre(user.getNombre());
            return response;
        } catch (Exception e) {
            log.error("Fallo al verificar el correo", e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

    // Añade tarea programada para limpiar usuarios no verificados
    @Scheduled(fixedRate = 3600000) // Ejecutar cada hora
    public void cleanupUnverifiedUsers() {
        LocalDateTime expirationTime = LocalDateTime.now().minusHours(VERIFICATION_TOKEN_EXPIRATION_HOURS);
        List<Usuario> unverifiedUsers = usersRepo.findByEnabledFalseAndTokenExpirationBefore(expirationTime);
        usersRepo.deleteAll(unverifiedUsers);
    }

    // login
    public UsuarioDTO login(UsuarioDTO loginRequest, String ipCruda) {
        final String ip = ipDe(ipCruda);
        try {
            String correo = normalizar(loginRequest.getCorreo());
            String kc = claveCorreo(correo);
            String clave = loginRequest.getPassword();

            // Bloqueado: mismo 429 exista o no la cuenta, y sin gastar BCrypt
            if (loginCorreo.bloqueado(kc) || loginIp.bloqueado(ip)) {
                Auditoria.evento("login_bloqueado", null, ip);
                return bloqueado429();
            }
            // Se reserva el intento ANTES de comprobar la clave (atomico): peticiones en paralelo no se cuelan
            int porCorreo = loginCorreo.sumar(kc);
            int porIp = loginIp.sumar(ip);
            if (porCorreo > MAX_LOGIN_CORREO || porIp > MAX_LOGIN_IP) {
                Auditoria.evento("login_bloqueado", null, ip);
                return bloqueado429();
            }

            Optional<Usuario> optUser = correo.isEmpty() ? Optional.empty() : usersRepo.findByCorreo(correo);

            // Misma respuesta y mismo coste si el correo no existe o la clave es mala (no enumera cuentas)
            if (clave == null || clave.isEmpty() || claveDemasiadoLarga(clave)) {
                passwordEncoder.matches("x", hashRelleno());
                Auditoria.evento("login_fallido", null, ip);
                return respuesta(401, MSG_CREDENCIALES);
            }
            if (optUser.isEmpty()) {
                passwordEncoder.matches(clave, hashRelleno());
                Auditoria.evento("login_fallido", null, ip);
                return respuesta(401, MSG_CREDENCIALES);
            }
            Usuario user = optUser.get();
            if (!passwordEncoder.matches(clave, user.getPassword())) {
                Auditoria.evento("login_fallido", user.getIduser(), ip);
                return respuesta(401, MSG_CREDENCIALES);
            }
            // Clave correcta: se reinicia solo el contador del correo. El de la IP NO se libera: cuenta todos los
            // intentos de esa IP (si no, alternar 1 fallo contra la victima + 1 login propio evitaria el tope)
            loginCorreo.reiniciar(kc);

            // Solo quien conoce la clave llega a saber si la cuenta esta sin verificar
            if (!user.isEnabled()) {
                return respuesta(403, "Debes verificar tu correo antes de iniciar sesión");
            }
            if (!user.isActivo()) {
                return respuesta(403, "Tu cuenta ha sido desactivada. Contacta con soporte.");
            }

            Auditoria.evento("login_ok", user.getIduser(), ip);
            return respuestaSesion(user);
        } catch (Exception e) {
            log.error("Fallo inesperado durante el login", e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

    // forgot password: SIEMPRE 200 generico (no revela si la cuenta existe, ni por el texto ni por el tiempo)
    public UsuarioDTO forgotPassword(UsuarioDTO forgotRequest, String ipCruda) {
        return pedirCodigo(forgotRequest, ipCruda);
    }

    private UsuarioDTO pedirCodigo(UsuarioDTO forgotRequest, String ipCruda) {
        String correo = normalizar(forgotRequest.getCorreo());
        if (correo.isEmpty() || correo.length() > 100 || !correo.matches(EMAIL_REGEX)) {
            return respuestaCampo("correo", "Ingresa un correo electrónico válido");
        }
        final UsuarioDTO generico = respuesta(200, "Si el correo está registrado, te enviamos un código de 6 dígitos");
        try {
            // Tope por IP: agotado => mismo 200 generico, sin enviar nada (no revela nada ni da un 429 distinguible)
            if (ipAgotada(ipCruda)) {
                log.warn("forgot-password: tope por IP agotado, se ignora el pedido");
                return generico;
            }
            // Tope de pedidos por correo: sin esto, pedir codigos sin parar daria intentos infinitos
            if (pedidosForgot.sumar(correo) > MAX_FORGOT) {
                log.warn("forgot-password: demasiados pedidos para una cuenta, se ignora");
                return generico;
            }
            Optional<Usuario> optionalUser = usersRepo.findByCorreo(correo);
            if (optionalUser.isEmpty()) {
                return generico;
            }
            // Generar el codigo, guardarlo y enviarlo se hace fuera de la peticion: el tiempo de respuesta
            // es el mismo exista o no la cuenta.
            final Usuario user = optionalUser.get();
            enSegundoPlano("codigo de reset", () -> emitirCodigoReset(correo, user));
        } catch (Exception e) {
            // Se registra, pero el cliente ve lo mismo que si no existiera la cuenta
            log.error("Fallo al procesar el pedido de codigo de reset", e);
        }
        return generico;
    }

    private void emitirCodigoReset(String correo, Usuario user) {
        int resetCode = new SecureRandom().nextInt(900000) + 100000;
        usersRepo.guardarCodigoReset(user.getIduser(), resetCode,
                LocalDateTime.now().plusMinutes(RESET_CODE_EXPIRATION_MINUTES));
        fallosCodigo.reiniciar(correo);   // codigo nuevo => los 5 intentos de ESE codigo de cero (el tope por hora no se toca)
        try {
            emailService.sendPasswordResetEmail(user.getCorreo(), user.getNombre(), resetCode);
        } catch (Exception e) {
            log.error("No se pudo enviar el correo de codigo de reset (iduser={}, error={})",
                    user.getIduser(), e.getClass().getSimpleName());
        }
    }

    /**
     * Unica comprobacion del codigo de reset (la usan verify-reset-code y reset-password).
     * El intento se RESERVA (suma atomica) antes de comparar: con peticiones en paralelo nunca se comparan mas de
     * 5 codigos por codigo emitido ni mas de 10 por hora y correo. Un codigo valido devuelve la reserva.
     * Al 5.o fallo se anula el codigo en BD. Devuelve el usuario solo si el codigo es valido.
     */
    private Optional<Usuario> validarCodigoReset(String correoCrudo, Integer codigo) {
        String correo = claveCorreo(normalizar(correoCrudo));
        if (correo.isEmpty() || codigo == null) {
            return Optional.empty();
        }
        if (fallosCodigo.bloqueado(correo) || fallosReset.bloqueado(correo)) {
            return Optional.empty();
        }
        int delCodigo = fallosCodigo.sumar(correo);
        int acumulados = fallosReset.sumar(correo);
        if (delCodigo > MAX_FALLOS_RESET || acumulados > MAX_FALLOS_RESET_HORA) {
            return Optional.empty();
        }
        Optional<Usuario> opt = usersRepo.findByCorreo(correo);
        boolean valido = opt.isPresent()
                && opt.get().getResetCode() != null
                && opt.get().getResetCodeExpiresAt() != null
                && opt.get().getResetCode().equals(codigo)
                && !LocalDateTime.now().isAfter(opt.get().getResetCodeExpiresAt());
        if (valido) {
            fallosCodigo.bajar(correo);
            fallosReset.bajar(correo);
            return opt;
        }
        if (delCodigo >= MAX_FALLOS_RESET && opt.isPresent() && opt.get().getResetCode() != null) {
            Usuario u = opt.get();
            usersRepo.anularCodigoReset(u.getIduser());
            log.warn("Codigo de reset anulado por {} intentos fallidos (iduser={})", delCodigo, u.getIduser());
        }
        return Optional.empty();
    }

    // verify reset code
    public UsuarioDTO verifyResetCode(UsuarioDTO verificationRequest, String ipCruda) {
        try {
            if (ipAgotada(ipCruda)) {
                return bloqueado429();
            }
            Optional<Usuario> valido = validarCodigoReset(verificationRequest.getCorreo(), verificationRequest.getResetCode());
            if (valido.isEmpty()) {
                return respuestaCampo("resetCode", MSG_CODIGO_RESET);
            }
            return respuesta(200, "Código verificado correctamente");
        } catch (Exception e) {
            log.error("Fallo en verify-reset-code", e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

    private static List<String> erroresClaveNueva(String nueva, String confirmacion, Map<String, String> porCampo) {
        List<String> errores = new ArrayList<>();
        if (nueva == null || nueva.isEmpty()) {
            err(errores, porCampo, "newPassword", "La nueva contraseña es obligatoria");
        } else {
            if (!nueva.equals(confirmacion)) {
                err(errores, porCampo, "confirmPassword", "Las contraseñas no coinciden");
            }
            if (claveDemasiadoLarga(nueva)) {
                err(errores, porCampo, "newPassword", MSG_CLAVE_LARGA);
            } else if (!nueva.matches(PASSWORD_REGEX)) {
                err(errores, porCampo, "newPassword", PASSWORD_REGLA);
            }
        }
        return errores;
    }

    // reset password: revalida correo + codigo + expiracion; sin codigo valido no cambia nada
    public UsuarioDTO resetPassword(UsuarioDTO resetRequest, String ipCruda) {
        final String ip = ipDe(ipCruda);
        try {
            if (ipAgotada(ip)) {
                return bloqueado429();
            }
            Optional<Usuario> opt = validarCodigoReset(resetRequest.getCorreo(), resetRequest.getResetCode());
            if (opt.isEmpty()) {
                return respuestaCampo("resetCode", MSG_CODIGO_RESET);
            }
            Map<String, String> porCampo = new LinkedHashMap<>();
            List<String> errores = erroresClaveNueva(resetRequest.getNewPassword(), resetRequest.getConfirmPassword(), porCampo);
            if (!errores.isEmpty()) {
                return respuestaErrores(400, "La contraseña no es válida", errores, porCampo);
            }

            Usuario user = opt.get();
            // Clave nueva y codigo anulado en UN solo UPDATE, condicionado a que el codigo siga siendo ese:
            // dos peticiones con el mismo codigo valido a la vez -> solo una cambia la clave.
            // Al cambiar el hash, los JWT anteriores dejan de valer (claim pwv).
            int filas = usersRepo.restablecerPassword(user.getIduser(),
                    passwordEncoder.encode(resetRequest.getNewPassword()), resetRequest.getResetCode(), LocalDateTime.now());
            if (filas != 1) {
                return respuestaCampo("resetCode", MSG_CODIGO_RESET);
            }
            String kc = claveCorreo(normalizar(resetRequest.getCorreo()));
            fallosCodigo.reiniciar(kc);
            fallosReset.reiniciar(kc);
            loginCorreo.reiniciar(kc);
            Auditoria.evento("password_restablecida", user.getIduser(), ip);

            return respuesta(200, "Contraseña actualizada exitosamente");
        } catch (Exception e) {
            log.error("Fallo en reset-password", e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

    // ---------- con sesion: todo opera sobre el dueño del token (iduser sale del SecurityContext) ----------

    private Optional<Usuario> duenoDelToken(Integer iduser) {
        return iduser == null ? Optional.empty() : usersRepo.findById(iduser);
    }

    /** GET /me y POST /correo: el usuario seguro del dueño del token. */
    public UsuarioDTO getMe(Integer iduser) {
        try {
            Optional<Usuario> u = duenoDelToken(iduser);
            if (u.isEmpty()) {
                return respuesta(401, MSG_SESION);
            }
            UsuarioDTO response = new UsuarioDTO();
            response.setStatusCode(200);
            response.setUsuario(UsuarioResponse.de(u.get()));
            return response;
        } catch (Exception e) {
            log.error("Fallo al leer el usuario de la sesion (iduser={})", iduser, e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

    public UsuarioDTO updateUser(Integer iduser, UsuarioDTO updateRequest) {
        List<String> errores = new ArrayList<>();
        Map<String, String> porCampo = new LinkedHashMap<>();
        String nombre = updateRequest.getNombre() == null ? "" : updateRequest.getNombre().trim();
        String apellido = updateRequest.getApellido() == null ? "" : updateRequest.getApellido().trim();
        String celular = updateRequest.getCelular() == null ? "" : updateRequest.getCelular().trim();
        if (nombre.isEmpty()) err(errores, porCampo, "nombre", "El nombre es obligatorio");
        else if (nombre.length() > 50) err(errores, porCampo, "nombre", "El nombre no puede superar 50 caracteres");
        if (apellido.isEmpty()) err(errores, porCampo, "apellido", "El apellido es obligatorio");
        else if (apellido.length() > 50) err(errores, porCampo, "apellido", "El apellido no puede superar 50 caracteres");
        if (!celular.matches("^\\d{9}$")) err(errores, porCampo, "celular", "El celular debe contener 9 dígitos numéricos");
        if (!errores.isEmpty()) {
            return respuestaErrores(400, "Datos no válidos", errores, porCampo);
        }
        try {
            Optional<Usuario> opt = duenoDelToken(iduser);
            if (opt.isEmpty()) {
                return respuesta(401, MSG_SESION);
            }
            // UPDATE puntual (solo nombre, apellido y celular): no pisa otras columnas con valores viejos
            if (usersRepo.actualizarPerfil(iduser, nombre, apellido, celular) != 1) {
                return respuesta(401, MSG_SESION);
            }
            Usuario actualizado = duenoDelToken(iduser).orElse(null);
            if (actualizado == null) {
                return respuesta(401, MSG_SESION);
            }
            UsuarioDTO response = respuesta(200, "Usuario actualizado exitosamente");
            response.setUsuario(UsuarioResponse.de(actualizado));
            return response;
        } catch (Exception e) {
            log.error("Fallo al actualizar el usuario (iduser={})", iduser, e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

    /** Reserva un intento de clave actual (suma atomica) por usuario e IP. true = bloqueado => el llamador responde 429. */
    private boolean reservarIntentoClave(Usuario u, String ip) {
        String ku = "p:" + claveCorreo(normalizar(u.getCorreo()));
        String ki = "i:" + ip;
        if (claveUsuario.bloqueado(ku) || claveIp.bloqueado(ki)) {
            Auditoria.evento("clave_actual_bloqueada", u.getIduser(), ip);
            return true;
        }
        if (claveUsuario.sumar(ku) > MAX_FALLOS_CLAVE_USUARIO || claveIp.sumar(ki) > MAX_FALLOS_CLAVE_IP) {
            Auditoria.evento("clave_actual_bloqueada", u.getIduser(), ip);
            return true;
        }
        return false;
    }

    /** Acierto: se devuelve la reserva de usuario e IP (el contador solo cuenta fallos). */
    private void liberarIntentoClave(Usuario u, String ip) {
        claveUsuario.bajar("p:" + claveCorreo(normalizar(u.getCorreo())));
        claveIp.bajar("i:" + ip);
    }

    public UsuarioDTO changePassword(Integer iduser, UsuarioDTO req, String ipCruda) {
        final String ip = ipDe(ipCruda);
        try {
            Optional<Usuario> opt = duenoDelToken(iduser);
            if (opt.isEmpty()) {
                return respuesta(401, MSG_SESION);
            }
            Usuario user = opt.get();
            String actual = req.getCurrentPassword();
            // Se reserva el intento ANTES de gastar BCrypt (limite por usuario/IP compartido con change-email)
            if (reservarIntentoClave(user, ip)) {
                return bloqueado429();
            }
            if (actual == null || actual.isEmpty() || claveDemasiadoLarga(actual) || !passwordEncoder.matches(actual, user.getPassword())) {
                return respuestaCampo("currentPassword", "La contraseña actual no es correcta");   // la reserva queda como fallo
            }
            liberarIntentoClave(user, ip);   // acierto: no fue un fallo
            // Reglas de la clave nueva
            Map<String, String> porCampo = new LinkedHashMap<>();
            List<String> errores = erroresClaveNueva(req.getNewPassword(), req.getConfirmPassword(), porCampo);
            if (!errores.isEmpty()) {
                return respuestaErrores(400, "La contraseña no es válida", errores, porCampo);
            }
            String nuevoHash = passwordEncoder.encode(req.getNewPassword());
            // UPDATE puntual de la clave. No se toca la entidad cargada: se firma el token con el hash nuevo.
            if (usersRepo.cambiarPassword(iduser, nuevoHash) != 1) {
                return respuesta(401, MSG_SESION);
            }
            Auditoria.evento("password_cambiada", iduser, ip);
            // Los JWT anteriores (claim pwv) dejan de valer; este nuevo mantiene viva la sesion actual
            UsuarioDTO ok = respuesta(200, "Contraseña actualizada exitosamente");
            ok.setToken(jwtUtils.generateToken(user.getCorreo(), nuevoHash, user.getSesionVersion()));
            return ok;
        } catch (Exception e) {
            log.error("Fallo al cambiar la contraseña (iduser={})", iduser, e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

    // ---------- cambiar correo ----------

    private static final String MSG_CORREO_INVALIDO = "Ingresa un correo electrónico válido";
    private static final String MSG_CODIGO_CORREO = "Código inválido o expirado";
    private static final int CORREO_CODE_EXPIRATION_MINUTES = 10;

    /** da****@gmail.com: dos letras del usuario y el dominio completo. */
    static String enmascarar(String correo) {
        int at = correo.indexOf('@');
        if (at < 1) return "****";
        String local = correo.substring(0, at);
        int visibles = local.length() <= 2 ? 1 : 2;   // parte local corta: solo la primera letra
        return local.substring(0, visibles) + "****" + correo.substring(at);
    }

    /** POST /api/auth/change-email: contraseña actual -> correo nuevo; guarda el pedido y manda el codigo al correo NUEVO. */
    public UsuarioDTO changeEmail(Integer iduser, UsuarioDTO req, String ipCruda) {
        final String ip = ipDe(ipCruda);
        boolean pedidoReservado = false;
        final String kUser = "u:" + iduser;
        try {
            Optional<Usuario> opt = duenoDelToken(iduser);
            if (opt.isEmpty()) {
                return respuesta(401, MSG_SESION);
            }
            Usuario user = opt.get();
            String actual = req.getCurrentPassword();
            // Mismo limite por usuario/IP que change-password: se reserva ANTES de gastar BCrypt
            if (reservarIntentoClave(user, ip)) {
                return bloqueado429();
            }
            if (actual == null || actual.isEmpty() || claveDemasiadoLarga(actual) || !passwordEncoder.matches(actual, user.getPassword())) {
                return respuestaCampo("currentPassword", "La contraseña actual no es correcta");   // la reserva queda como fallo
            }
            liberarIntentoClave(user, ip);
            final String nuevo = normalizar(req.getNewCorreo());
            if (nuevo.isEmpty() || nuevo.length() > 100 || !nuevo.matches(EMAIL_REGEX)) {
                return respuestaCampo("newCorreo", MSG_CORREO_INVALIDO);
            }
            if (nuevo.equals(normalizar(user.getCorreo()))) {
                return respuestaCampo("newCorreo", "Ese ya es tu correo actual");
            }
            if (usersRepo.existsByCorreo(nuevo)) {
                return respuestaCampo("newCorreo", "Ese correo no está disponible");
            }
            // Tope de pedidos de codigo (3 cada 15 min). Se reserva ya; si algo falla antes de emitir, se devuelve.
            if (pedidosCambioCorreo.bloqueado(kUser) || pedidosCambioCorreo.sumar(kUser) > MAX_PEDIDOS_CORREO) {
                return bloqueado429();
            }
            pedidoReservado = true;
            final int codigo = new SecureRandom().nextInt(900000) + 100000;
            if (usersRepo.guardarCorreoPendiente(iduser, nuevo, codigo,
                    LocalDateTime.now().plusMinutes(CORREO_CODE_EXPIRATION_MINUTES)) != 1) {
                pedidosCambioCorreo.bajar(kUser);
                return respuesta(401, MSG_SESION);
            }
            pedidoReservado = false;   // el pedido se emitio: cuenta para el tope
            fallosCodigoCorreo.reiniciar(kUser);   // codigo nuevo => sus 5 intentos de cero (el tope por hora no se toca)
            Auditoria.evento("cambio_correo_solicitado", iduser, ip);
            // Efectos externos al final y fuera de la peticion; si fallan se registran y el pedido no se deshace
            final String actualCorreo = user.getCorreo();
            final String nombre = user.getNombre();
            CorreoSegundoPlano.enviar("codigo cambio de correo", () -> emailService.sendCambioCorreoCodigoEmail(nuevo, nombre, codigo));
            CorreoSegundoPlano.enviar("aviso cambio de correo", () -> emailService.sendCambioCorreoSolicitadoEmail(actualCorreo, nombre));
            return respuesta(200, "Te enviamos un código de 6 dígitos al correo nuevo");
        } catch (Exception e) {
            if (pedidoReservado) pedidosCambioCorreo.bajar(kUser);
            log.error("Fallo al pedir el cambio de correo (iduser={})", iduser, e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

    /** POST /api/auth/change-email/confirm: un UPDATE condicionado al codigo y al vencimiento. */
    public UsuarioDTO confirmChangeEmail(Integer iduser, UsuarioDTO req, String ipCruda) {
        final String ip = ipDe(ipCruda);
        final String k = "u:" + iduser;
        try {
            Optional<Usuario> opt = duenoDelToken(iduser);
            if (opt.isEmpty()) {
                return respuesta(401, MSG_SESION);
            }
            // Los intentos se reservan ANTES de comparar (como el reset): en paralelo no se prueban mas de 5 por codigo ni 10 por hora
            if (fallosCodigoCorreo.bloqueado(k) || fallosCorreoHora.bloqueado(k)) {
                return respuestaCampo("emailCode", MSG_CODIGO_CORREO);
            }
            int delCodigo = fallosCodigoCorreo.sumar(k);
            int acumulados = fallosCorreoHora.sumar(k);
            if (delCodigo > MAX_FALLOS_RESET || acumulados > MAX_FALLOS_RESET_HORA) {
                return respuestaCampo("emailCode", MSG_CODIGO_CORREO);
            }
            Usuario user = opt.get();
            Integer enviado = null;
            String txt = req.getEmailCode() == null ? "" : req.getEmailCode().trim();
            if (txt.matches("^\\d{6}$")) {
                enviado = Integer.valueOf(txt);
            }
            boolean hayPedido = user.getCorreoPendiente() != null && user.getCorreoPendienteCodigo() != null
                    && user.getCorreoPendienteExpira() != null;
            boolean valido = enviado != null && hayPedido
                    && user.getCorreoPendienteCodigo().equals(enviado)
                    && !LocalDateTime.now().isAfter(user.getCorreoPendienteExpira());
            if (!valido) {
                if (delCodigo >= MAX_FALLOS_RESET && hayPedido) {
                    usersRepo.anularCorreoPendiente(iduser);
                    log.warn("Pedido de cambio de correo anulado por {} intentos fallidos (iduser={})", delCodigo, iduser);
                    return respuestaCampo("emailCode", "Demasiados intentos. Pide un código nuevo");
                }
                return respuestaCampo("emailCode", MSG_CODIGO_CORREO);
            }
            fallosCodigoCorreo.bajar(k);
            fallosCorreoHora.bajar(k);

            final String viejo = user.getCorreo();
            final String nuevo = user.getCorreoPendiente();
            final String nombre = user.getNombre();
            final String hash = user.getPassword();
            int filas;
            try {
                if (usersRepo.existsByCorreo(nuevo)) {
                    usersRepo.anularCorreoPendiente(iduser);
                    return respuestaCampo("emailCode", "Ese correo ya no está disponible");
                }
                filas = usersRepo.confirmarCambioCorreo(iduser, enviado, LocalDateTime.now());
            } catch (DataIntegrityViolationException e) {
                // Otro se quedo con el correo entre la comprobacion y el UPDATE: lo decide el unico lower(correo) de la base (V6)
                log.warn("Cambio de correo no aplicado: correo ya tomado (iduser={})", iduser);
                usersRepo.anularCorreoPendiente(iduser);
                return respuestaCampo("emailCode", "Ese correo ya no está disponible");
            }
            if (filas != 1) {
                return respuestaCampo("emailCode", MSG_CODIGO_CORREO);
            }
            fallosCodigoCorreo.reiniciar(k);
            fallosCorreoHora.reiniciar(k);
            Auditoria.evento("correo_cambiado", iduser, ip);
            CorreoSegundoPlano.enviar("aviso correo cambiado",
                    () -> emailService.sendCorreoCambiadoEmail(viejo, nombre, enmascarar(nuevo)));
            Usuario actualizado = duenoDelToken(iduser).orElse(null);
            if (actualizado == null) {
                return respuesta(401, MSG_SESION);
            }
            // El sujeto del JWT es el correo: los tokens viejos dejan de valer solos; este mantiene viva la sesion
            UsuarioDTO ok = respuesta(200, "Correo actualizado");
            ok.setToken(jwtUtils.generateToken(actualizado.getCorreo(), hash, actualizado.getSesionVersion()));
            ok.setUsuario(UsuarioResponse.de(actualizado));
            return ok;
        } catch (Exception e) {
            log.error("Fallo al confirmar el cambio de correo (iduser={})", iduser, e);
            return respuesta(500, MSG_ERROR_GENERICO);
        }
    }

}
