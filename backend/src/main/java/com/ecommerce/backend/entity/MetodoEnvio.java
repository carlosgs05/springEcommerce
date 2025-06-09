package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "metodo_envio")
@Getter
@Setter
public class MetodoEnvio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idmetodo_envio")
    private Long idMetodoEnvio;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "icono_img", length = 255)
    private String iconoImg;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "costo", precision = 10, scale = 2, nullable = false)
    private BigDecimal costo;

    @Column(name = "estado", nullable = false)
    private Boolean estado;

    @Column(name = "tiempo_estimado", length = 100)
    private String tiempoEstimado;
}
