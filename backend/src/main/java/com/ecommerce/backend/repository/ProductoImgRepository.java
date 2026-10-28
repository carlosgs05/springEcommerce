// src/main/java/com/ecommerce/backend/repository/ProductoImgRepository.java
package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ProductoImg;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductoImgRepository extends JpaRepository<ProductoImg, Long> {
    // método derivado para cargar imágenes por separado
    List<ProductoImg> findByProducto_Idproducto(Long idproducto);

    // batch: mismo criterio que findByProducto_Idproducto pero para varios ids a la vez
    List<ProductoImg> findByProducto_IdproductoIn(List<Long> idproductos);

    Optional<ProductoImg> findByNombre(String nombre);

    void deleteByProducto_Idproducto(Long idproducto);

}
