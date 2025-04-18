package com.ecommerce.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductoRequest {
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;
    private Long idcategoria;
    private Long idmarca;
    private List<EspecificacionRequest> especificaciones;
    private List<MultipartFile> imagenes;
}