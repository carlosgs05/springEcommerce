package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;
import java.util.Objects;

@Data
@Embeddable
public class RolPermisoId implements Serializable {

    @Column(name = "idrol")
    private Integer idrol;

    @Column(name = "idpermiso")
    private Integer idpermiso;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RolPermisoId that = (RolPermisoId) o;
        return Objects.equals(idrol, that.idrol) && Objects.equals(idpermiso, that.idpermiso);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idrol, idpermiso);
    }
}