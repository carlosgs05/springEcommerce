package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    // Puedes agregar métodos personalizados si los necesitas
}