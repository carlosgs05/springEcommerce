// src/main/java/com/ecommerce/backend/repository/EspecificacionRepository.java
package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Especificacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EspecificacionRepository extends JpaRepository<Especificacion, Long> {
    void deleteByProducto_Idproducto(Long productoId);
}