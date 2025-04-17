package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "rol_permisos")
@JsonIdentityInfo(
  generator = ObjectIdGenerators.PropertyGenerator.class,
  property = "id"
)
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