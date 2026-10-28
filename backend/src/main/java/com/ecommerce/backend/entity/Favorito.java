package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "favorito")
public class Favorito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idfavorito")
    private Long idfavorito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "iduser")
    @JsonIgnore // para evitar recursividad, igual que Carrito.java
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto")
    private Producto producto;

    @Column(name = "fecha_agregado")
    private LocalDateTime fechaAgregado;
}
