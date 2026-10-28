package com.ecommerce.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FavoritoDTO {
    private Long idproducto;
    private String nombre;
    private BigDecimal precio;
    private Integer stock;
    private String primeraImagen;
    private Double calificacionPromedio;
    private Integer totalResenas;
    private LocalDateTime fechaAgregado;
}
