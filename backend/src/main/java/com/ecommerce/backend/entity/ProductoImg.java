package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "producto_img")
public class ProductoImg {

    @Id
    @ManyToOne
    @JoinColumn(name = "idproducto", referencedColumnName = "idproducto")
    private Producto producto;

    @Id
    @Column(name = "idinteger")
    private Integer idInteger;

    @Column(name = "nombre", length = 255)
    private String nombre;

    public Object getId() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getId'");
    }
}