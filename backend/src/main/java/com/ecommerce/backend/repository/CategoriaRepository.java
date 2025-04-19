// src/main/java/com/ecommerce/backend/repository/CategoriaRepository.java
package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    boolean existsByNombre(String nombre);
}