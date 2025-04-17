package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Marca;
import java.util.List;

public interface MarcaService {
    List<Marca> findAll();
    Marca findById(Integer id);
    Marca save(Marca marca);
    void deleteById(Integer id);
}