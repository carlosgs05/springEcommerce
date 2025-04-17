package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idproducto")
    private Integer idproducto;

    @Column(name = "nombre", length = 100)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;

    @Column(name = "precio")
    private Double precio;

    @OneToOne
    @JoinColumn(name = "idcomentario", referencedColumnName = "idcomentario")
    private Comentario comentario;

    @ManyToOne
    @JoinColumn(name = "idcategoria", referencedColumnName = "idcategoria")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "idmarca", referencedColumnName = "idmarca")
    private Marca marca;

    @Column(name = "stock")
    private Integer stock;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<Especificacion> especificaciones;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<ProductoImg> imagenes;
}