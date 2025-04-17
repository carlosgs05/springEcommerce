package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Producto;
import java.util.List;

public interface ProductoService {
    List<Producto> findAll();
    Producto findById(Integer id);
    Producto save(Producto producto);
    void deleteById(Integer id);
    List<Producto> findByCategoria(Integer categoriaId);
    List<Producto> findByMarca(Integer marcaId);
    List<Producto> searchByNombre(String nombre);
    List<Producto> findProductosDestacados();
}