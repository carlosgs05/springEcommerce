package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

  @Query("""
        SELECT DISTINCT u
          FROM Usuario u
          JOIN FETCH u.rol r
          LEFT JOIN FETCH r.permisos rp
          LEFT JOIN FETCH rp.permiso p
         WHERE u.correo = :correo
      """)
  Optional<Usuario> findByCorreo(@Param("correo") String correo);

  Optional<Usuario> findByVerificationToken(String token);

  List<Usuario> findByEnabledFalseAndTokenExpirationBefore(LocalDateTime expirationTime);

}