package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Especificacion;
import java.util.List;

public interface EspecificacionService {
    List<Especificacion> findAll();
    Especificacion findById(Integer id);
    Especificacion save(Especificacion especificacion);
    void deleteById(Integer id);
    List<Especificacion> findByProducto(Integer productoId);
}