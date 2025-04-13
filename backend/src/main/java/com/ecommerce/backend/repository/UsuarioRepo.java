package com.ecommerce.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Usuario;

import java.util.Optional;

public interface UsuarioRepo extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreo(String correo);
}
