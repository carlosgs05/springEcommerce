package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.Permiso;
import com.ecommerce.backend.entity.Rol;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsuarioDTO {
    private int statusCode;
    private String message;
    private String token;

    // Campos para registro (idrol del body se ignora: el registro publico siempre es CLIENTE)
    private String nombre;
    private String apellido;
    private String dni;
    private String correo;
    private String password;
    private String celular;
    private Integer idrol;
    private Rol rol;
    private List<String> errors;
    private Map<String, String> fieldErrors;

    // Campos para respuesta: el usuario SIEMPRE sale en su formato seguro
    private UsuarioResponse usuario;
    private List<Permiso> permisos;

    // Campos para recuperar / cambiar contrasena
    private String newPassword;
    private String confirmPassword;
    private String currentPassword;
    private Integer resetCode;

    /** Cambiar correo: el correo nuevo pedido y el codigo de 6 digitos recibido en el. */
    private String newCorreo;
    private String emailCode;
}
