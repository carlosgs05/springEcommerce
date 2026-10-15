package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "venta")
public class Venta {

    @Id
    @Column(name = "idventa")
    private Long idVenta;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idpedido", referencedColumnName = "idpedido", nullable = false, unique = true)
    private Pedido pedido;

    @Column(name = "fecha_entrega", nullable = false)
    private LocalDateTime fechaEntrega;
}