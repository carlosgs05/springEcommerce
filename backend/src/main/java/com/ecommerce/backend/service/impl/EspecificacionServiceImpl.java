package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.entity.Especificacion;
import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.repository.EspecificacionRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.service.EspecificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EspecificacionServiceImpl implements EspecificacionService {

    @Autowired
    private EspecificacionRepository especificacionRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public List<Especificacion> findAll() {
        return especificacionRepository.findAll();
    }

    @Override
    public Especificacion findById(Integer id) {
        return especificacionRepository.findById(id).orElse(null);
    }

    @Override
    public Especificacion save(Especificacion especificacion) {
        return especificacionRepository.save(especificacion);
    }

    @Override
    public void deleteById(Integer id) {
        especificacionRepository.deleteById(id);
    }

    @Override
    public List<Especificacion> findByProducto(Integer productoId) {
        Producto producto = productoRepository.findById(productoId).orElse(null);
        return producto != null ? especificacionRepository.findByProducto(producto) : null;
    }
}