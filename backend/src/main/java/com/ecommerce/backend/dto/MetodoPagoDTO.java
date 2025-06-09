package com.ecommerce.backend.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class MetodoPagoDTO {
    private Long idMetodoPago;
    private String nombre;
    private String descripcion;
    private Boolean activo;
    private String iconoImg;
    private String configAdicional;
    private MultipartFile iconoMultipart;
}
