package com.ecommerce.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class MetodoEnvioDTO {
    private Long idMetodoEnvio;
    private String nombre;
    private String descripcion;
    private Boolean estado;
    private String iconoImg;
    private BigDecimal costo;
    private String tiempoEstimado;
    private MultipartFile iconoMultipart;
}