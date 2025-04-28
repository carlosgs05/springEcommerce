// Archivo: UsuarioUpdateRequest.java
package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class UsuarioUpdateRequest {
    private String nombre;
    private String apellido;
    private String correo;
    private String celular;
    private String currentPassword; // Contraseña actual para validar
    private String newPassword;     // Nueva contraseña (opcional)
}
