package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
        @Query("SELECT c FROM Comentario c WHERE c.producto.idproducto = :productoId AND c.estado = :estado")
        List<Comentario> findByProductoIdAndEstado(@Param("productoId") Long productoId,
                        @Param("estado") Integer estado);

        @Query("SELECT c FROM Comentario c JOIN FETCH c.producto p WHERE c.estado = :estado")
        List<Comentario> findByEstadoWithProducto(@Param("estado") Integer estado);

        @Query("SELECT c FROM Comentario c WHERE c.producto.idproducto = :productoId AND c.idcomentario = :comentarioId")
        Optional<Comentario> findByProductoIdAndComentarioId(@Param("productoId") Long productoId,
                        @Param("comentarioId") Long comentarioId);

        // MÉTODO MEJORADO
        @Query("SELECT c FROM Comentario c " +
                        "JOIN FETCH c.usuario u " +
                        "JOIN FETCH c.producto p " +
                        "WHERE p.idproducto = :productoId AND c.estado = :estado")
        List<Comentario> findByProductoIdAndEstadoWithUsuario(
                        @Param("productoId") Long productoId,
                        @Param("estado") Integer estado);
}