package com.ecommerce.backend.service;

import java.io.BufferedReader;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.ecommerce.backend.dto.ReqRes;
import com.ecommerce.backend.dto.UsuarioUpdateRequest;
import com.ecommerce.backend.entity.Permiso;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.repository.UsuarioRepo;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;

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

    private final ObjectMapper objectMapper = new ObjectMapper();

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

    // update user
    public ReqRes actualizarUsuario(Long usuarioId) {
        ReqRes response = new ReqRes();

        try {
            // 0. Obtener el cuerpo de la petición HTTP como String
            HttpServletRequest servletReq = ((ServletRequestAttributes) RequestContextHolder
                    .currentRequestAttributes())
                    .getRequest();
            String jsonBody;
            try (BufferedReader reader = servletReq.getReader()) {
                jsonBody = reader.lines().collect(Collectors.joining());
            }

            // 1. Mapear el JSON al DTO
            UsuarioUpdateRequest updateRequest = objectMapper.readValue(jsonBody, UsuarioUpdateRequest.class);

            // 2. Buscar usuario por ID
            Usuario usuario = usersRepo.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 3. Actualizar datos básicos
            usuario.setNombre(updateRequest.getNombre());
            usuario.setApellido(updateRequest.getApellido());
            usuario.setCorreo(updateRequest.getCorreo());
            usuario.setCelular(updateRequest.getCelular());

            // 4. Validar y actualizar contraseña (si viene nueva)
            String newPw = updateRequest.getNewPassword();
            if (newPw != null && !newPw.isBlank()) {
                String currPw = updateRequest.getCurrentPassword();
                if (currPw == null || currPw.isBlank()
                        || !passwordEncoder.matches(currPw, usuario.getPassword())) {
                    response.setStatusCode(400);
                    response.setError("Contraseña actual incorrecta");
                    return response;
                }
                usuario.setPassword(passwordEncoder.encode(newPw));
            }

            // 5. Guardar cambios
            Usuario usuarioActualizado = usersRepo.save(usuario);

            // 6. Construir respuesta
            response.setStatusCode(200);
            response.setMessage("Usuario actualizado exitosamente");
            response.setUsuario(usuarioActualizado);
            response.setRol(usuarioActualizado.getRol());

        } catch (RuntimeException e) {
            // Error controlado (e.g. usuario no encontrado)
            response.setStatusCode(404);
            response.setError(e.getMessage());
        } catch (Exception e) {
            // Cualquier otro error
            response.setStatusCode(500);
            response.setError("Error al actualizar: " + e.getMessage());
        }

        return response;
    }

    public ReqRes obtenerUsuarioPorId(Long id) {
        ReqRes response = new ReqRes();
        try {
            Usuario user = usersRepo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            response.setStatusCode(200);
            response.setUsuario(user);
            return response;
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setError("Error al obtener usuario: " + e.getMessage());
            return response;
        }
    }

}
