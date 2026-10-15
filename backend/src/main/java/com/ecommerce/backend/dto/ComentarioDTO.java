package com.ecommerce.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
class ComentarioDTO {
    private Long idcomentario;
    private String descripcion;
    private LocalDateTime fechacomentario;
    private Integer calificacion;
    private UsuarioDTO usuario;

    @Data
    static class UsuarioDTO {
        private Integer iduser;
        private String nombre;
        private String apellido;
        private String correo;
    }
}