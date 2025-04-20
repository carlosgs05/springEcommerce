package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "comentario")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcomentario")
    private Long idcomentario;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fechacomentario", columnDefinition = "TIMESTAMP")
    private LocalDateTime fechacomentario;

    @Column(name = "estado", columnDefinition = "INTEGER DEFAULT -1")
    private Integer estado = -1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iduser")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // <- AÑADE ESTO
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto")
    @JsonBackReference("producto-comentario")
    private Producto producto;
}