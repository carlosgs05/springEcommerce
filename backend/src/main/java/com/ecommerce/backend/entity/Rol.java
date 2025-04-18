package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "rol")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "idrol")
public class Rol {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "idrol")
  private Integer idrol;

  @Column(name = "nombre", length = 20, nullable = false)
  private String nombre;

  @OneToMany(mappedBy = "rol", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @JsonManagedReference("rol-rolpermiso")
  private List<RolPermiso> permisos = new ArrayList<>();
}