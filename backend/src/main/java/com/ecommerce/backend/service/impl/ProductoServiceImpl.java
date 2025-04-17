package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.*;
import com.ecommerce.backend.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Override
    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    @Override
    public Producto findById(Integer id) {
        return productoRepository.findById(id).orElse(null);
    }

    @Override
    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }

    @Override
    public void deleteById(Integer id) {
        productoRepository.deleteById(id);
    }

    @Override
    public List<Producto> findByCategoria(Integer categoriaId) {
        Categoria categoria = categoriaRepository.findById(categoriaId).orElse(null);
        return categoria != null ? productoRepository.findByCategoria(categoria) : null;
    }

    @Override
    public List<Producto> findByMarca(Integer marcaId) {
        Marca marca = marcaRepository.findById(marcaId).orElse(null);
        return marca != null ? productoRepository.findByMarca(marca) : null;
    }

    @Override
    public List<Producto> searchByNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    public List<Producto> findProductosDestacados() {
        // Lógica para obtener productos destacados (ejemplo: los 5 más vendidos)
        return productoRepository.findAll().subList(0, Math.min(5, productoRepository.findAll().size()));
    }
}