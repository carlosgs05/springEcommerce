package com.ecommerce.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PedidoDTO {
    private Long idPedido;
    private Integer idUsuario;
    private String nombreUsuario;
    private LocalDateTime fechaPedido;
    private Long idMetodoEnvio;
    private String nombreMetodoEnvio;
    private Long idMetodoPago;
    private String nombreMetodoPago;
    private Integer estado;
    private BigDecimal montoPedido;
    private BigDecimal montoEnvio;
    private BigDecimal montoTotal;
    private String comprobantePago;
    private String direccionEnvio;
    private String observacion;
    private List<DetalleProductoDTO> productos;

    // Nuevos campos para actualización de estado
    private Integer nuevoEstado;
    private LocalDateTime fechaCambioEstado;
    private String mensajeCambioEstado;

    private MultipartFile comprobanteMultipart;

    @Data
    public static class DetalleProductoDTO {
        private Long idproducto;
        private String nombre;
        private Integer cantidad;
        private BigDecimal precio;
        private String imagen;
    }
}