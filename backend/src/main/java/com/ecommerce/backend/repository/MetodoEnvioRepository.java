package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.MetodoEnvio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetodoEnvioRepository extends JpaRepository<MetodoEnvio, Long> {
}