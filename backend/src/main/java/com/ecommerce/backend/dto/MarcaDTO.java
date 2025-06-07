package com.ecommerce.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Setter
@Getter
public class MarcaDTO {
    private Long idmarca;
    private String nombre;
    private MultipartFile imagen;
}
