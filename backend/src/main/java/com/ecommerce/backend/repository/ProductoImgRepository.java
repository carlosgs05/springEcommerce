// src/main/java/com/ecommerce/backend/repository/ProductoImgRepository.java
package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductoImg;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoImgRepository extends JpaRepository<ProductoImg, Long> {
    // método derivado para cargar imágenes por separado
    List<ProductoImg> findByProducto_Idproducto(Long idproducto);
}
