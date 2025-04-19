// src/main/java/com/ecommerce/backend/dto/ProductoRequest.java
package com.ecommerce.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import com.ecommerce.backend.entity.Comentario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductoRequest {
    // — Campos de respuesta —
    private Long idproducto;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer stock;
    private Long idcategoria;
    private String nombreCategoria;
    private Long idmarca;
    private String nombreMarca;
    private LocalDateTime fechacreacion;
    private List<String> imagenesNombres;
    private List<Comentario> comentariosAprobados;
    private List<EspecificacionRequest> especificaciones;

    // — Campos de petición —
    private List<MultipartFile> imagenes;
}
