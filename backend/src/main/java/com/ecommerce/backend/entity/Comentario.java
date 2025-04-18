package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "comentario")
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
    private Producto producto;
}