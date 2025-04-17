package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepo extends JpaRepository<Usuario, Integer> {

    @Query("SELECT u FROM Usuario u " +
            "JOIN FETCH u.rol r " +
            "LEFT JOIN FETCH r.permisos rp " +
            "LEFT JOIN FETCH rp.permiso " +
            "WHERE u.correo = :correo")
    Optional<Usuario> findByCorreo(@Param("correo") String correo);
}
