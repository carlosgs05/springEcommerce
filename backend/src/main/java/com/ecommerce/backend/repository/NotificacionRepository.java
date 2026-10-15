package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioIduserAndLeidoFalseOrderByFechaDesc(Integer iduser);

}
