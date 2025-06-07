// DetalleVenta.java
package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_venta")
@IdClass(DetalleVenta.DetalleVentaPK.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleVenta {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idventa", referencedColumnName = "idventa")
    private Venta venta;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idproducto", referencedColumnName = "idproducto")
    private Producto producto;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "precioventa")
    private BigDecimal precioVenta;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleVentaPK implements Serializable {
        private Long venta;
        private Long producto;
    }
}
