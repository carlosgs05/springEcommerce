package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "permiso")
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpermiso")
    private Integer idpermiso;

    @OneToMany(mappedBy = "permiso", cascade = CascadeType.ALL)
    private List<RolPermiso> roles;
}