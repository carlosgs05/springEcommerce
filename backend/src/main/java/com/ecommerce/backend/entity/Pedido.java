package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Asegúrate que esté esta línea
    @Column(name = "idpedido")
    private Long idPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "iduser", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idmetodo_envio", referencedColumnName = "idmetodo_envio", nullable = false)
    private MetodoEnvio metodoEnvio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idmetodo_pago", referencedColumnName = "idmetodo_pago", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "estado", nullable = false)
    private Integer estado;

    @Column(name = "monto_pedido", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoPedido;

    @Column(name = "monto_envio", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoEnvio;

    @Column(name = "monto_total", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoTotal;

    @Column(name = "comprobante_pago", nullable = false, columnDefinition = "TEXT")
    private String comprobantePago;

    @Column(name = "direccion_envio", nullable = false, columnDefinition = "VARCHAR(150)")
    private String direccionEnvio;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedido> detalles;

    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
    private Venta venta;
}