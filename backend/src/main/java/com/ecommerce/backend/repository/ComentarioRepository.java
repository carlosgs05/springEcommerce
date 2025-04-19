// src/main/java/com/ecommerce/backend/repository/ComentarioRepository.java
package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    @Query("SELECT c FROM Comentario c WHERE c.producto.idproducto = :productoId AND c.estado = :estado")
    List<Comentario> findByProductoIdAndEstado(@Param("productoId") Long productoId,
                                               @Param("estado") Integer estado);
}