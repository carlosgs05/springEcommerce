package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ReqRes;
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

public ReqRes login(ReqRes loginRequest) {
        ReqRes response = new ReqRes();
        try {
            // 1. Autenticación
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getCorreo(),
                            loginRequest.getPassword()));

            // 2. Obtener usuario con rol y permisos
            Usuario user = usersRepo.findByCorreo(loginRequest.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 3. Generar tokens
            String jwt = jwtUtils.generateToken(user);

            // 4. Configurar respuesta
            response.setStatusCode(200);
            response.setToken(jwt);
            response.setExpirationTime("24Hrs");
            response.setMessage("Inicio de sesión exitoso");
            response.setUsuario(user);
            response.setRol(user.getRol());

        } catch (BadCredentialsException e) {
            response.setStatusCode(401);
            response.setMessage("Credenciales inválidas");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error durante el login: " + e.getMessage());
        }
        return response;
    }
}
