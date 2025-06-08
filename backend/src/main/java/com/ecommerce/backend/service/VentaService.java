package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CheckoutDTO;
import com.ecommerce.backend.dto.DetalleVentaDTO;
import com.ecommerce.backend.dto.ItemCompraDTO;
import com.ecommerce.backend.dto.VentaDTO;
import com.ecommerce.backend.entity.DetalleVenta;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.Usuario;
import com.ecommerce.backend.entity.Venta;
import com.ecommerce.backend.repository.VentaRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<VentaDTO> listarVentasPorUsuario(Integer userId) {
        List<Venta> ventas = ventaRepository.findAllWithDetallesByUsuario(userId);

        return ventas.stream().map(v -> {
            VentaDTO dto = new VentaDTO();
            dto.setIdVenta(v.getIdventa());
            dto.setFechaVenta(v.getFechaVenta());
            dto.setMontoTotal(v.getMontoTotal());
            List<DetalleVentaDTO> detalles = v.getDetalleVentas().stream().map(dv -> {
                DetalleVentaDTO det = new DetalleVentaDTO();
                det.setIdProducto(dv.getProducto().getIdproducto());
                det.setNombreProducto(dv.getProducto().getNombre());
                det.setCantidad(dv.getCantidad());
                det.setPrecioVenta(dv.getPrecioVenta());
                return det;
            }).collect(Collectors.toList());
            dto.setDetalles(detalles);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public VentaDTO realizarVenta(CheckoutDTO checkoutDTO) {
        Usuario usuario = usuarioRepository.findById(checkoutDTO.getIduser())

                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + checkoutDTO.getIduser()));

        Venta venta = new Venta();
        venta.setUsuario(usuario);
        venta.setFechaVenta(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        List<DetalleVenta> detalles = new ArrayList<>();

        for (ItemCompraDTO item : checkoutDTO.getItems()) {
            Producto producto = productoRepository.findById(item.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + item.getIdProducto()));

            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(venta);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioVenta(producto.getPrecio());

            detalles.add(detalle);
            total = total.add(producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad())));
        }

        venta.setMontoTotal(total);
        venta.setDetalleVentas(detalles);

        ventaRepository.save(venta);

        // Convertimos a DTO para respuesta
        VentaDTO ventaDTO = new VentaDTO();
        ventaDTO.setIdVenta(venta.getIdventa());
        ventaDTO.setFechaVenta(venta.getFechaVenta());
        ventaDTO.setMontoTotal(venta.getMontoTotal());

        List<DetalleVentaDTO> detallesDTO = detalles.stream().map(d -> {
            DetalleVentaDTO dto = new DetalleVentaDTO();
            dto.setIdProducto(d.getProducto().getIdproducto());
            dto.setNombreProducto(d.getProducto().getNombre());
            dto.setCantidad(d.getCantidad());
            dto.setPrecioVenta(d.getPrecioVenta());
            return dto;
        }).collect(Collectors.toList());

        ventaDTO.setDetalles(detallesDTO);
        return ventaDTO;
    }

    @Transactional(readOnly = true)
    public VentaDTO obtenerVentaPorId(Long idventa) {
        Venta venta = ventaRepository.findById(idventa)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + idventa));

        VentaDTO dto = new VentaDTO();
        dto.setIdVenta(venta.getIdventa());
        dto.setFechaVenta(venta.getFechaVenta());
        dto.setMontoTotal(venta.getMontoTotal());

        List<DetalleVentaDTO> detalles = venta.getDetalleVentas().stream().map(dv -> {
            DetalleVentaDTO det = new DetalleVentaDTO();
            det.setIdProducto(dv.getProducto().getIdproducto());
            det.setNombreProducto(dv.getProducto().getNombre());
            det.setCantidad(dv.getCantidad());
            det.setPrecioVenta(dv.getPrecioVenta());
            return det;
        }).collect(Collectors.toList());

        dto.setDetalles(detalles);
        return dto;
    }

}