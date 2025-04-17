package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "rol_permisos")
public class RolPermiso {

    @EmbeddedId
    private RolPermisoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idrol")
    @JoinColumn(name = "idrol")
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idpermiso")
    @JoinColumn(name = "idpermiso")
    private Permiso permiso;
}