package com.ecommerce.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaDTO {
    private Long idVenta;
    private LocalDateTime fechaVenta;
    private BigDecimal montoTotal;
    private List<DetalleVentaDTO> detalles;
}