package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {
}