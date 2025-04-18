package com.ecommerce.backend.entity;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
public class ComentarioId implements Serializable {

    @Column(name = "idproducto")
    private Long idproducto;

    @Column(name = "idcomentario")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idcomentario;
}