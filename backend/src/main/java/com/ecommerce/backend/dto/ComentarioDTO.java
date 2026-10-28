package com.ecommerce.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ComentarioDTO {
    private Long idcomentario;
    private String descripcion;
    private LocalDateTime fechacomentario;
    private Integer calificacion;
    private UsuarioDTO usuario;

    @Data
    public static class UsuarioDTO {
        private String nombre;
        private String apellido;
    }
}
