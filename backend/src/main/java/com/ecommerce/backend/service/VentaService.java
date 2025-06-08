package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.DetalleVentaDTO;
import com.ecommerce.backend.dto.VentaDTO;
import com.ecommerce.backend.entity.Venta;
import com.ecommerce.backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;

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
}