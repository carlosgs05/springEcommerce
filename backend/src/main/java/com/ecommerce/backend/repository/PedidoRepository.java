package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

        @Query("SELECT p FROM Pedido p " +
                        "LEFT JOIN FETCH p.detalles d " +
                        "LEFT JOIN FETCH d.producto " +
                        "WHERE p.usuario.iduser = :iduser " +
                        "AND EXTRACT(YEAR FROM p.fechaPedido) = :year " +
                        "AND EXTRACT(MONTH FROM p.fechaPedido) = :month " +
                        "ORDER BY p.fechaPedido DESC")
        List<Pedido> findByUsuarioAndMonthYearWithDetails(
                        @Param("iduser") Integer iduser,
                        @Param("year") int year,
                        @Param("month") int month);

        @Query("SELECT DISTINCT p FROM Pedido p " +
                        "LEFT JOIN FETCH p.detalles d " +
                        "LEFT JOIN FETCH d.producto prod " +
                        "LEFT JOIN FETCH p.usuario u " +
                        "LEFT JOIN FETCH p.metodoEnvio me " +
                        "LEFT JOIN FETCH p.metodoPago mp " +
                        "WHERE p.estado = :estado " +
                        "ORDER BY p.fechaPedido DESC")
        List<Pedido> findByEstadoWithDetails(@Param("estado") Integer estado);

        @Transactional
        @Modifying
        @Query("UPDATE Pedido p SET p.estado = :nuevoEstado, p.observacion = :nuevaObservacion WHERE p.idPedido = :idPedido")
        void actualizarEstadoYObservacion(
                        @Param("idPedido") Long idPedido,
                        @Param("nuevoEstado") Integer nuevoEstado,
                        @Param("nuevaObservacion") String nuevaObservacion);

        @Query("SELECT DISTINCT p FROM Pedido p " +
                        "LEFT JOIN FETCH p.detalles d " +
                        "LEFT JOIN FETCH d.producto prod " +
                        "LEFT JOIN FETCH p.usuario u " +
                        "LEFT JOIN FETCH p.metodoEnvio me " +
                        "LEFT JOIN FETCH p.metodoPago mp " +
                        "WHERE p.idPedido = :idPedido")
        Optional<Pedido> findByIdWithDetails(@Param("idPedido") Long idPedido);
}
