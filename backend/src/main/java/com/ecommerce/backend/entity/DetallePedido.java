package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "detalle_pedido")
@IdClass(DetallePedido.DetallePedidoId.class)
public class DetallePedido {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idpedido", referencedColumnName = "idpedido", nullable = false)
    private Pedido pedido;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto", referencedColumnName = "idproducto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 10, scale = 2, nullable = false)
    private BigDecimal precioUnitario;

    // Clase para la clave primaria compuesta
    @Getter
    @Setter
    public static class DetallePedidoId implements Serializable {
        private Long pedido;
        private Long producto;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            DetallePedidoId that = (DetallePedidoId) o;
            return Objects.equals(pedido, that.pedido) &&
                   Objects.equals(producto, that.producto);
        }

        @Override
        public int hashCode() {
            return Objects.hash(pedido, producto);
        }
    }
}