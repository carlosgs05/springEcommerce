package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {

    List<MetodoPago> findByActivo(Boolean activo);

    List<MetodoPago> findTop4ByOrderByIdMetodoPagoAsc();

}
