package com.ecommerce.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductoDTO {
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
    private List<EspecificacionDTO> especificaciones;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<ComentarioDTO> comentariosAprobados;

    private Double calificacionPromedio;
    private Integer totalResenas;

    // — Campos de petición —
    private List<MultipartFile> imagenes;
}
