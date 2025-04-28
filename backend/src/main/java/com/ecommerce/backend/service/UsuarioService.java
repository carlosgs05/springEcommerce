package com.ecommerce.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ReqRes;
import com.ecommerce.backend.entity.Permiso;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.UsuarioRepo;
import com.ecommerce.backend.repository.RolRepo;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepo usersRepo;

    @Autowired
    private RolRepo rolRepo;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final int RESET_CODE_EXPIRATION_MINUTES = 10;

    // refresh token
    public ReqRes refreshToken(ReqRes refreshTokenReqiest) {
        ReqRes response = new ReqRes();
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
    public ReqRes register(ReqRes registrationRequest) {
        ReqRes resp = new ReqRes();

        try {
            // Verificar si el rol existe
            Rol rol = rolRepo.findById(registrationRequest.getIdrol())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            Usuario user = new Usuario();
            user.setNombre(registrationRequest.getNombre());
            user.setApellido(registrationRequest.getApellido());
            user.setDni(registrationRequest.getDni());
            user.setCorreo(registrationRequest.getCorreo());
            user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
            user.setCelular(registrationRequest.getCelular());
            user.setRol(rol);

            Usuario userResult = usersRepo.save(user);

            if (userResult.getIduser() > 0) {
                resp.setUsuario(userResult);
                resp.setMessage("Usuario Registrado Exitosamente");
                resp.setStatusCode(200);
            }

        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError(e.getMessage());
        }
        return resp;
    }

    // login
    public ReqRes login(ReqRes loginRequest) {
        ReqRes response = new ReqRes();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getCorreo(),
                            loginRequest.getPassword()));

            Usuario user = usersRepo.findByCorreo(loginRequest.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            String jwt = jwtUtils.generateToken(user);

            response.setStatusCode(200);
            response.setToken(jwt);
            response.setExpirationTime("24Hrs");
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
            response.setStatusCode(401);
            response.setMessage("Credenciales inválidas");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error durante el login: " + e.getMessage());
        }
        return response;
    }

    // forgot password
    public ReqRes forgotPassword(ReqRes forgotRequest) {
        ReqRes response = new ReqRes();
        try {
            Usuario user = usersRepo.findByCorreo(forgotRequest.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Generar código de 6 dígitos
            int resetCode = new SecureRandom().nextInt(900000) + 100000;

            user.setResetCode(resetCode);
            user.setResetCodeExpiresAt(LocalDateTime.now().plusMinutes(RESET_CODE_EXPIRATION_MINUTES));
            usersRepo.save(user);

            emailService.sendPasswordResetEmail(user.getCorreo(), user.getNombre(), resetCode);

            response.setStatusCode(200);
            response.setMessage("Correo de recuperación enviado");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }

    // verify reset code
    public ReqRes verifyResetCode(ReqRes verificationRequest) {
        ReqRes response = new ReqRes();
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
        } catch (Exception e) {
            response.setStatusCode(400);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }

    // reset password
    public ReqRes resetPassword(ReqRes resetRequest) {
        ReqRes response = new ReqRes();
        try {
            if (!resetRequest.getNewPassword().equals(resetRequest.getConfirmPassword())) {
                throw new RuntimeException("Las contraseñas no coinciden");
            }

            Usuario user = usersRepo.findByCorreo(resetRequest.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
            user.setResetCode(null);
            user.setResetCodeExpiresAt(null);
            usersRepo.save(user);

            response.setStatusCode(200);
            response.setMessage("Contraseña actualizada exitosamente");
        } catch (Exception e) {
            response.setStatusCode(400);
            response.setMessage("Error: " + e.getMessage());
        }
        return response;
    }

}
