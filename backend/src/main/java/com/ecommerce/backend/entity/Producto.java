package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "producto")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "idproducto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idproducto")
    private Long idproducto;

    @Column(name = "nombre", length = 100)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio")
    private BigDecimal precio;

    @Column(name = "stock")
    private Integer stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idcategoria")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idmarca")
    private Marca marca;

    @Column(name = "fechacreacion", columnDefinition = "TIMESTAMP")
    private LocalDateTime fechacreacion;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) // Cambiado a EAGER
    @JsonManagedReference("producto-especificacion")
    private List<Especificacion> especificaciones = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) // Cambiado a EAGER
    @JsonManagedReference("producto-imagen")
    private List<ProductoImg> imagenes = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) // Cambiado a EAGER
    @JsonManagedReference("producto-comentario")
    private List<Comentario> comentarios = new ArrayList<>();
}
