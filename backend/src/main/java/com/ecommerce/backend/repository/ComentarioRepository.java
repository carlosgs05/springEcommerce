package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Comentario;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Integer> {
    List<Comentario> findByUsuarioId(Integer usuarioId);
}