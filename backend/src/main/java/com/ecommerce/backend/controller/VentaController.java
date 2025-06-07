package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.VentaDTO;
import com.ecommerce.backend.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @GetMapping("listarByUsuario/{iduser}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable Integer iduser) {
        List<VentaDTO> ventas = ventaService.listarVentasPorUsuario(iduser);
        return ResponseEntity.ok(Map.of("success", true, "data", ventas));
    }
}