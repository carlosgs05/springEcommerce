// ProductoImgId.java
package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
public class ProductoImgId implements Serializable {

    @Column(name = "idproducto")
    private Long idproducto;

    @Column(name = "idimagen")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idimagen;
}