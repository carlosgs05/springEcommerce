package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.MetodoEnvio;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MetodoEnvioRepository extends JpaRepository<MetodoEnvio, Long> {

    List<MetodoEnvio> findByEstado(Boolean estado);

    List<MetodoEnvio> findTop4ByOrderByIdMetodoEnvioAsc();

}