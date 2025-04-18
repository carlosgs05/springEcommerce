package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "especificacion")
public class Especificacion {

    @EmbeddedId
    private EspecificacionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idproducto")
    @JoinColumn(name = "idproducto")
    private Producto producto;

    @Column(name = "unidadmedida", length = 4)
    private String unidadmedida;

    @Column(name = "valor")
    private Double valor;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
}