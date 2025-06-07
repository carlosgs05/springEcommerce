package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    @Query("SELECT DISTINCT v FROM Venta v "
         + "LEFT JOIN FETCH v.detalleVentas dv "
         + "LEFT JOIN FETCH dv.producto p "
         + "WHERE v.usuario.iduser = :userId")
    List<Venta> findAllWithDetallesByUsuario(@Param("userId") Integer userId);
}