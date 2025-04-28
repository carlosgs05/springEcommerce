package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepo extends JpaRepository<Usuario, Integer> {

  @Query("""
        SELECT DISTINCT u
          FROM Usuario u
          JOIN FETCH u.rol r
          LEFT JOIN FETCH r.permisos rp
          LEFT JOIN FETCH rp.permiso p
         WHERE u.correo = :correo
      """)
  Optional<Usuario> findByCorreo(@Param("correo") String correo);

  /**
   * Busca un usuario por su ID, trayendo también su rol y permisos en un solo
   * fetch.
   */
  @Query("""
          SELECT DISTINCT u
            FROM Usuario u
            JOIN FETCH u.rol r
            LEFT JOIN FETCH r.permisos rp
            LEFT JOIN FETCH rp.permiso p
           WHERE u.iduser = :id
      """)
  Optional<Usuario> findById(@Param("id") Long id);
}