package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Categoria;
import java.util.List;

public interface CategoriaService {
    List<Categoria> findAll();
    Categoria findById(Integer id);
    Categoria save(Categoria categoria);
    void deleteById(Integer id);
}