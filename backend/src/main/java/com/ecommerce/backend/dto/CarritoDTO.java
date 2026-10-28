package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class CarritoDTO {
    private Integer idcarrito;
    private String listaProductos; // JSON serializado

}