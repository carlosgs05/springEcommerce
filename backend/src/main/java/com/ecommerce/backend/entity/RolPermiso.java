package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

@Data
@Entity
@Table(name = "rol_permisos")
public class RolPermiso {

    @EmbeddedId
    private RolPermisoId id;

    @ManyToOne
    @MapsId("idrol")
    @JoinColumn(name = "idrol")
    private Rol rol;

    @ManyToOne
    @MapsId("idpermiso")
    @JoinColumn(name = "idpermiso")
    private Permiso permiso;
}

@Embeddable
@Data
class RolPermisoId implements Serializable {
    private Integer idrol;
    private Integer idpermiso;
}
