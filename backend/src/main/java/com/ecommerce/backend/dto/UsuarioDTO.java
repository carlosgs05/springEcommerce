package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.Permiso;
import com.ecommerce.backend.entity.Rol;
import com.ecommerce.backend.entity.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsuarioDTO {
    private int statusCode;
    private String error;
    private String message;
    private String token;
    private String refreshToken;
    private String expirationTime;

    // Campos para registro
    private String nombre;
    private String apellido;
    private String dni;
    private String correo;
    private String password;
    private String celular;
    private Integer idrol;
    private Rol rol;
    private List<String> errors;

    // Campos para respuesta
    private Usuario usuario;
    private List<Usuario> usuariosList;
    private List<Permiso> permisos;

    // Campos para recuperar contraseña
    private String newPassword;
    private String confirmPassword;
    private Integer resetCode;
}