package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "rol_permisos") // ajusta al nombre real de tu tabla intermedia
public class RolPermiso {

    @EmbeddedId
    private RolPermisoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idrol")
    @JoinColumn(name = "idrol", nullable = false)
    @JsonBackReference("rol-rolpermiso")
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idpermiso")
    @JoinColumn(name = "idpermiso", nullable = false)
    @JsonBackReference("permiso-rolpermiso")
    private Permiso permiso;
}