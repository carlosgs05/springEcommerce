package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "especificacion")
public class Especificacion {

    @Id
    @ManyToOne
    @JoinColumn(name = "idproducto", referencedColumnName = "idproducto")
    private Producto producto;

    @Id
    @Column(name = "idespecificacion")
    private Integer idespecificacion;

    @Column(name = "unidadmedida", length = 4)
    private String unidadmedida;

    @Column(name = "valor")
    private Double valor;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;
}