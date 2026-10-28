package com.ecommerce.backend.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "metodo_pago")
@Getter
@Setter
public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idmetodo_pago")
    private Long idMetodoPago;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "icono_img", length = 255)
    private String iconoImg;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "config_adicional", columnDefinition = "TEXT")
    private String configAdicional;

    // 'MANUAL' | 'PASARELA'
    @Column(name = "tipo", length = 20, nullable = false)
    private String tipo;

    // null | 'CULQI' | 'MERCADOPAGO'
    @Column(name = "proveedor", length = 20)
    private String proveedor;

    @JsonIgnore
    @OneToMany(mappedBy = "metodoPago", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Pedido> pedidos;

}
