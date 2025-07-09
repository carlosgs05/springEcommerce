package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @Column(name = "tiempo_estimado", length = 100)
    private String tiempoEstimado;

    @Column(name = "costo", precision = 10, scale = 2, nullable = false)
    private BigDecimal costo;

    @Column(name = "estado", nullable = false)
    private Boolean estado;

    @Column(name = "puntos_recojo", columnDefinition = "TEXT")
    private String puntosRecojo;

    @JsonIgnore
    @OneToMany(mappedBy = "metodoEnvio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Pedido> pedidos;

}
