package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "especificacion")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Especificacion {

    @EmbeddedId
    private EspecificacionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idproducto")
    @JoinColumn(name = "idproducto")
    @JsonBackReference("producto-especificacion")
    private Producto producto;

    @Column(name = "unidadmedida", length = 4)
    private String unidadmedida;

    @Column(name = "valor")
    private Double valor;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
}