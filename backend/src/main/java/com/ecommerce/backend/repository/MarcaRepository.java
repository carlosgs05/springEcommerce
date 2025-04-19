// src/main/java/com/ecommerce/backend/repository/MarcaRepository.java
package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarcaRepository extends JpaRepository<Marca, Long> {
    boolean existsByNombre(String nombre);
}
