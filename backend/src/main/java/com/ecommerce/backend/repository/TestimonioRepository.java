package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Testimonio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonioRepository extends JpaRepository<Testimonio, Integer> {
    List<Testimonio> findByUsuario_Iduser(Integer idUser);
    
    @Query("SELECT t FROM Testimonio t JOIN FETCH t.usuario WHERE t.estado = :estado")
    List<Testimonio> findByEstadoWithUsuario(@Param("estado") Integer estado);
}