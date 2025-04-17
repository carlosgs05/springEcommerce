package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ecommerce.backend.entity.Categoria;
import com.ecommerce.backend.entity.Marca;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByCategoria(Categoria categoria);
    List<Producto> findByMarca(Marca marca);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}
