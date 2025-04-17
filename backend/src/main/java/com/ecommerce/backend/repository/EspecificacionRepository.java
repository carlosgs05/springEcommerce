package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Especificacion;
import com.ecommerce.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EspecificacionRepository extends JpaRepository<Especificacion, Integer> {
    List<Especificacion> findByProducto(Producto producto);
}