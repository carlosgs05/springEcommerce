package com.ecommerce.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Data
@Embeddable
public class RolPermisoId implements Serializable {
    private Integer idrol;
    private Integer idpermiso;
}