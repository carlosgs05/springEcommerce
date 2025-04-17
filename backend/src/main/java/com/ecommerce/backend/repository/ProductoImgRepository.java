package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductoImg;
import com.ecommerce.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoImgRepository extends JpaRepository<ProductoImg, Integer> {
    List<ProductoImg> findByProducto(Producto producto);
}