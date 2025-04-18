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
@Table(name = "producto_img")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class ProductoImg {

    @EmbeddedId
    private ProductoImgId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idproducto")
    @JoinColumn(name = "idproducto")
    @JsonBackReference("producto-imagen")
    private Producto producto;

    @Column(length = 255)
    private String nombre;
}