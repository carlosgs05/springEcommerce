package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Especificacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EspecificacionRepository extends JpaRepository<Especificacion, Long> {
}