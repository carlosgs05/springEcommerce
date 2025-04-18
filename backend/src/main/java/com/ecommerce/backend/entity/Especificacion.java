package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "especificacion")
public class Especificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idespecificacion")
    private Long idEspecificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto")
    @JsonBackReference("producto-especificacion")
    private Producto producto;

    @Column(name = "unidadmedida", length = 4)
    private String unidadMedida;

    @Column(name = "valor")
    private Double valor;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
}