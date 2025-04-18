package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "comentario")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Comentario {

    @EmbeddedId
    private ComentarioId id;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fechacomentario", columnDefinition = "TIMESTAMP")
    private LocalDateTime fechacomentario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iduser", referencedColumnName = "iduser")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto", referencedColumnName = "idproducto",
               insertable = false, updatable = false)
    @JsonBackReference("producto-comentario")
    private Producto producto;
}