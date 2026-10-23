package com.ecommerce.backend.dto;

import java.util.List;

import lombok.Data;

/** Respuesta de GET /api/admin/usuarios (lista paginada). Mismo estilo statusCode/message que UsuarioDTO. */
@Data
public class UsuariosPaginaResponse {
    private int statusCode;
    private String message;
    private List<UsuarioResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
