package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.entity.Producto;
import com.ecommerce.backend.entity.ProductoImg;
import com.ecommerce.backend.repository.ProductoImgRepository;
import com.ecommerce.backend.repository.ProductoRepository;
import com.ecommerce.backend.service.ProductoImgService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoImgServiceImpl implements ProductoImgService {

    @Autowired
    private ProductoImgRepository productoImgRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public List<ProductoImg> findAll() {
        return productoImgRepository.findAll();
    }

    @Override
    public ProductoImg findById(Integer id) {
        return productoImgRepository.findById(id).orElse(null);
    }

    @Override
    public ProductoImg save(ProductoImg productoImg) {
        return productoImgRepository.save(productoImg);
    }

    @Override
    public void deleteById(Integer id) {
        productoImgRepository.deleteById(id);
    }

    @Override
    public List<ProductoImg> findByProducto(Integer productoId) {
        Producto producto = productoRepository.findById(productoId).orElse(null);
        return producto != null ? productoImgRepository.findByProducto(producto) : null;
    }
}