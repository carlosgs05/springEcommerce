package com.ecommerce.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleVentaDTO {
    private Long idProducto;
    private String nombreProducto;
    private Integer cantidad;
    private BigDecimal precioVenta;
}
