package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

        // sólo fetch join de especificaciones
        @Query("SELECT p FROM Producto p " +
                        "LEFT JOIN FETCH p.especificaciones " +
                        "WHERE p.idproducto = :id")
        Optional<Producto> findByIdWithRelations(@Param("id") Long id);

        @Query("SELECT DISTINCT p FROM Producto p " +
                        "LEFT JOIN FETCH p.especificaciones " +
                        "LEFT JOIN FETCH p.categoria " +
                        "LEFT JOIN FETCH p.marca")
        List<Producto> findAllWithEspecificaciones();

        @Query("SELECT DISTINCT p FROM Producto p " +
                        "LEFT JOIN FETCH p.especificaciones " +
                        "LEFT JOIN FETCH p.categoria " +
                        "LEFT JOIN FETCH p.marca " +
                        "WHERE (:categoria IS NULL OR p.categoria.idcategoria = :categoria) " +
                        "AND (:marca IS NULL OR p.marca.idmarca = :marca)")
        List<Producto> findByCategoriaAndMarca(
                        @Param("categoria") Long categoria,
                        @Param("marca") Long marca);

        // batch: mismo criterio de fetch que findByIdWithRelations pero para varios ids a la vez.
        // ORDER BY explicito sobre la especificacion: sin el, el orden de la lista anidada
        // puede salir distinto al de la consulta por un solo id (mismos datos, orden
        // distinto) cuando Hibernate combina varias filas del IN en una sola consulta.
        @Query("SELECT DISTINCT p FROM Producto p " +
                        "LEFT JOIN FETCH p.especificaciones e " +
                        "LEFT JOIN FETCH p.categoria " +
                        "LEFT JOIN FETCH p.marca " +
                        "WHERE p.idproducto IN (:ids) " +
                        "ORDER BY p.idproducto, e.idEspecificacion")
        List<Producto> findByIdsWithRelations(@Param("ids") List<Long> ids);

        @Query("SELECT COUNT(p) FROM Producto p WHERE p.stock >= 20")
        long countByStockSuficiente();

        @Query("SELECT COUNT(p) FROM Producto p WHERE p.stock < 20")
        long countByStockBajo();

}