package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Integer> {
    Optional<Carrito> findByUsuario_Iduser(Integer iduser);
    void deleteByUsuario_Iduser(Integer iduser);
}
