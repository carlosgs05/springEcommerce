package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class CarritoDTO {
    private Integer idcarrito;
    private Integer iduser; // para identificar usuario en peticiones
    private String listaProductos; // JSON serializado

}