package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "producto_img")
public class ProductoImg {

    @EmbeddedId
    private ProductoImgId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idproducto")
    @JoinColumn(name = "idproducto")
    private Producto producto;

    @Column(length = 255)
    private String nombre;
}