package com.ecommerce.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.UsuarioDTO;
import com.ecommerce.backend.entity.Permiso;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.UsuarioRepository;
import com.ecommerce.backend.repository.RolRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usersRepo;

    @Autowired
    private RolRepository rolRepo;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final int RESET_CODE_EXPIRATION_MINUTES = 10;

    private static final int VERIFICATION_TOKEN_EXPIRATION_HOURS = 24;

    // refresh token
    public UsuarioDTO refreshToken(UsuarioDTO refreshTokenReqiest) {
        UsuarioDTO response = new UsuarioDTO();
        try {
            String ourEmail = jwtUtils.extractUsername(refreshTokenReqiest.getToken());
            Usuario users = usersRepo.findByCorreo(ourEmail).orElseThrow();
            if (jwtUtils.isTokenValid(refreshTokenReqiest.getToken(), users)) {
                var jwt = jwtUtils.generateToken(users);
                response.setStatusCode(200);
                response.setToken(jwt);
                response.setRefreshToken(refreshTokenReqiest.getToken());
                response.setExpirationTime("24Hr");
                response.setMessage("Successfully Refreshed Token");
            }
            response.setStatusCode(200);
            return response;

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage(e.getMessage());
            return response;
        }
    }

    // register
    public UsuarioDTO register(UsuarioDTO registrationRequest) {
        UsuarioDTO resp = new UsuarioDTO();
        List<String> validationErrors = new ArrayList<>();

        // Validaciones de campos obligatorios
        if (registrationRequest.getNombre() == null || registrationRequest.getNombre().trim().isEmpty()) {
            validationErrors.add("El nombre es obligatorio");
        }
        if (registrationRequest.getApellido() == null || registrationRequest.getApellido().trim().isEmpty()) {
            validationErrors.add("El apellido es obligatorio");
        }
        if (registrationRequest.getDni() == null || registrationRequest.getDni().trim().isEmpty()) {
            validationErrors.add("El DNI es obligatorio");
        }
        if (registrationRequest.getCorreo() == null || registrationRequest.getCorreo().trim().isEmpty()) {
            validationErrors.add("El correo electrónico es obligatorio");
        }
        if (registrationRequest.getPassword() == null || registrationRequest.getPassword().trim().isEmpty()) {
            validationErrors.add("La contraseña es obligatoria");
        }
        if (registrationRequest.getCelular() == null || registrationRequest.getCelular().trim().isEmpty()) {
            validationErrors.add("El celular es obligatorio");
        }
        if (registrationRequest.getIdrol() == null) {
            validationErrors.add("Debe seleccionar un rol");
        }

        // Validaciones de formato
        if (registrationRequest.getDni() != null && !registrationRequest.getDni().matches("^\\d{8}$")) {
            validationErrors.add("El DNI debe contener 8 dígitos numéricos");
        }
        if (registrationRequest.getCelular() != null && !registrationRequest.getCelular().matches("^\\d{9}$")) {
            validationErrors.add("El celular debe contener 9 dígitos numéricos");
        }
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (registrationRequest.getCorreo() != null && !registrationRequest.getCorreo().matches(emailRegex)) {
            validationErrors.add("Formato de correo electrónico inválido");
        }
        String passwordRegex = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$";
        if (registrationRequest.getPassword() != null && !registrationRequest.getPassword().matches(passwordRegex)) {
            validationErrors.add(
                    "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 caracter especial (@$!%*?&#_)");
        }

        // Comprueba si el correo ya existe en la base
        if (registrationRequest.getCorreo() != null &&
                usersRepo.findByCorreo(registrationRequest.getCorreo().trim().toLowerCase()).isPresent()) {
            validationErrors.add("El correo electrónico ya está registrado");
        }

        // Si hay errores de validación, los devolvemos todos juntos
        if (!validationErrors.isEmpty()) {
            resp.setStatusCode(400);
            resp.setErrors(validationErrors);
            return resp;
        }

        // --- Si llegamos aquí, todo pasó las validaciones ---
        try {
            // Carga del rol
            Rol rol = rolRepo.findById(registrationRequest.getIdrol())
                    .orElseThrow(() -> new RuntimeException("Rol no válido"));

            Usuario user = new Usuario();
            user.setNombre(registrationRequest.getNombre().trim());
            user.setApellido(registrationRequest.getApellido().trim());
            user.setDni(registrationRequest.getDni().trim());
            user.setCorreo(registrationRequest.getCorreo().trim().toLowerCase());
            user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
            user.setCelular(registrationRequest.getCelular().trim());
            user.setRol(rol);
            user.setEnabled(false);

            String verificationToken = UUID.randomUUID().toString();
            user.setVerificationToken(verificationToken);
            user.setTokenExpiration(LocalDateTime.now().plusHours(VERIFICATION_TOKEN_EXPIRATION_HOURS));

            Usuario saved = usersRepo.save(user);

            // Envío de correo
            emailService.sendVerificationEmail(
                    saved.getCorreo(), saved.getNombre(), verificationToken);

            resp.setStatusCode(200);
            resp.setMessage(
                    "Se ha enviado un mensaje de verificación al correo ingresado. Por favor revise su bandeja de entrada.");
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setErrors(Collections.singletonList("Error en el registro: " + e.getMessage()));
        }

        return resp;
    }

    // Añade nuevo método para verificación
    public UsuarioDTO verifyEmail(String token) {
        UsuarioDTO response = new UsuarioDTO();
        try {
            Usuario user = usersRepo.findByVerificationToken(token)
                    .orElseThrow(() -> new RuntimeException("Token inválido"));

            if (LocalDateTime.now().isAfter(user.getTokenExpiration())) {
                usersRepo.delete(user);
                throw new RuntimeException("El enlace de verificación ha expirado");
            }

            user.setEnabled(true);
            user.setVerificationToken(null);
            user.setTokenExpiration(null);
            usersRepo.save(user);

            // Asegurar que los campos críticos están en la respuesta
            response.setStatusCode(200);
            response.setMessage("Cuenta verificada exitosamente");
            response.setCorreo(user.getCorreo());
            response.setNombre(user.getNombre());

        } catch (Exception e) {
            response.setStatusCode(400);
            response.setError(e.getMessage());
            response.setMessage("Error en la verificación: " + e.getMessage());
        }
        return response;
    }

    // Añade tarea programada para limpiar usuarios no verificados
    @Scheduled(fixedRate = 3600000) // Ejecutar cada hora
    public void cleanupUnverifiedUsers() {
        LocalDateTime expirationTime = LocalDateTime.now().minusHours(VERIFICATION_TOKEN_EXPIRATION_HOURS);
        List<Usuario> unverifiedUsers = usersRepo.findByEnabledFalseAndTokenExpirationBefore(expirationTime);
        usersRepo.deleteAll(unverifiedUsers);
    }

    // login
    public UsuarioDTO login(UsuarioDTO loginRequest) {
        UsuarioDTO response = new UsuarioDTO();

        // 1️⃣ Verificar que el correo exista
        var optUser = usersRepo.findByCorreo(loginRequest.getCorreo());
        if (optUser.isEmpty()) {
            response.setStatusCode(404);
            response.setMessage("El correo electrónico no está registrado");
            return response;
        }

        try {
            // 2️⃣ Intentar autenticación
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getCorreo(),
                            loginRequest.getPassword()));

            Usuario user = optUser.get();
            String jwt = jwtUtils.generateToken(user);

            // 3️⃣ Armar respuesta exitosa
            response.setStatusCode(200);
            response.setToken(jwt);
            response.setMessage("Inicio de sesión exitoso");
            response.setUsuario(user);
            response.setRol(user.getRol());

            List<Permiso> listaPermisos = user.getRol()
                    .getPermisos()
                    .stream()
                    .map(rp -> rp.getPermiso())
                    .collect(Collectors.toList());
            response.setPermisos(listaPermisos);

        } catch (BadCredentialsException e) {
            // 4️⃣ Contraseña incorrecta
            response.setStatusCode(401);
            response.setMessage("Contraseña incorrecta");
        } catch (Exception e) {
            // 5️⃣ Cualquier otro error
            response.setStatusCode(500);
            response.setMessage("Error durante el login: " + e.getMessage());
        }

        return response;
    }

    // forgot password
    public UsuarioDTO forgotPassword(UsuarioDTO forgotRequest) {
        UsuarioDTO response = new UsuarioDTO();
        try {
            Optional<Usuario> optionalUser = usersRepo.findByCorreo(forgotRequest.getCorreo());

            if (optionalUser.isEmpty()) {
                response.setStatusCode(404);
                response.setMessage("No existe una cuenta registrada con este correo");
                return response;
            }

            Usuario user = optionalUser.get();

            // Generar código de 6 dígitos
            int resetCode = new SecureRandom().nextInt(900000) + 100000;

            user.setResetCode(resetCode);
            user.setResetCodeExpiresAt(LocalDateTime.now().plusMinutes(RESET_CODE_EXPIRATION_MINUTES));
            usersRepo.save(user);

            emailService.sendPasswordResetEmail(user.getCorreo(), user.getNombre(), resetCode);

            response.setStatusCode(200);
            response.setMessage("Cuenta encontrada. Se envió un código a su correo electrónico.");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }

    // verify reset code
    public UsuarioDTO verifyResetCode(UsuarioDTO verificationRequest) {
        UsuarioDTO response = new UsuarioDTO();
        try {
            Usuario user = usersRepo.findByCorreo(verificationRequest.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (user.getResetCode() == null || !user.getResetCode().equals(verificationRequest.getResetCode())) {
                throw new RuntimeException("Código inválido");
            }
            if (LocalDateTime.now().isAfter(user.getResetCodeExpiresAt())) {
                throw new RuntimeException("Código expirado");
            }

            response.setStatusCode(200);
            response.setMessage("Código verificado correctamente");
        } catch (RuntimeException e) {
            response.setStatusCode(400);
            response.setMessage("Error: " + e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error interno: " + e.getMessage());
        }
        return response;
    }

    // reset password
    public UsuarioDTO resetPassword(UsuarioDTO resetRequest) {
        UsuarioDTO response = new UsuarioDTO();
        try {
            if (!resetRequest.getNewPassword().equals(resetRequest.getConfirmPassword())) {
                throw new RuntimeException("Las contraseñas no coinciden");
            }
            String passwordRegex = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$";
            if (!resetRequest.getNewPassword().matches(passwordRegex)) {
                throw new RuntimeException(
                        "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 caracter especial (@$!%*?&#_)");
            }

            Usuario user = usersRepo.findByCorreo(resetRequest.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
            user.setResetCode(null);
            user.setResetCodeExpiresAt(null);
            usersRepo.save(user);

            response.setStatusCode(200);
            response.setMessage("Contraseña actualizada exitosamente");
        } catch (RuntimeException e) {
            response.setStatusCode(400);
            response.setMessage("Error: " + e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error interno: " + e.getMessage());
        }
        return response;
    }

    public UsuarioDTO getUserByCorreo(String correo) {
        UsuarioDTO response = new UsuarioDTO();
        try {
            Usuario user = usersRepo.findByCorreo(correo)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            response.setStatusCode(200);
            response.setUsuario(user);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }
}
